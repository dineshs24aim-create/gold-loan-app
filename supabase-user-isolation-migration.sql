-- Migration: enforce per-user data isolation for banks + loans
-- Run once in Supabase SQL Editor for existing projects.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Add appraiser_id to banks if missing
ALTER TABLE banks ADD COLUMN IF NOT EXISTS appraiser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2) Assign existing banks to their related loan owners where possible
-- UUID doesn't support MIN(), so we use DISTINCT ON to pick one user per bank.
UPDATE banks b
SET appraiser_id = x.appraiser_id
FROM (
  SELECT DISTINCT ON (l.bank_id)
    l.bank_id,
    l.appraiser_id
  FROM loans l
  WHERE l.appraiser_id IS NOT NULL
  ORDER BY l.bank_id, l.created_at ASC
) x
WHERE b.id = x.bank_id
  AND b.appraiser_id IS NULL;

-- 3) If a bank still has no owner, assign it to earliest user (fallback)
UPDATE banks b
SET appraiser_id = u.id
FROM (
  SELECT id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1
) u
WHERE b.appraiser_id IS NULL;

-- 4) Make appraiser_id mandatory on banks
ALTER TABLE banks ALTER COLUMN appraiser_id SET NOT NULL;

-- 5) Replace global uniqueness by per-user uniqueness
ALTER TABLE banks DROP CONSTRAINT IF EXISTS banks_name_key;
CREATE INDEX IF NOT EXISTS idx_banks_appraiser_id ON banks(appraiser_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_banks_appraiser_name_unique ON banks(appraiser_id, name);

-- 6) Ensure loans.appraiser_id exists and is mandatory
-- First backfill null appraiser_id values using owning bank
UPDATE loans l
SET appraiser_id = b.appraiser_id
FROM banks b
WHERE l.bank_id = b.id
  AND l.appraiser_id IS NULL
  AND b.appraiser_id IS NOT NULL;

-- If anything is still null, assign to earliest user as fallback
UPDATE loans l
SET appraiser_id = u.id
FROM (
  SELECT id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1
) u
WHERE l.appraiser_id IS NULL;

ALTER TABLE loans ALTER COLUMN appraiser_id SET NOT NULL;

-- 7) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_loans_appraiser_id ON loans(appraiser_id);
CREATE INDEX IF NOT EXISTS idx_loans_bank_id ON loans(bank_id);
CREATE INDEX IF NOT EXISTS idx_loans_date ON loans(date);

-- 8) Reset and recreate strict RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read banks" ON banks;
DROP POLICY IF EXISTS "Allow authenticated users to insert banks" ON banks;
DROP POLICY IF EXISTS "Allow authenticated users to update banks" ON banks;
DROP POLICY IF EXISTS "Allow authenticated users to delete banks" ON banks;
DROP POLICY IF EXISTS "Users can read their own banks" ON banks;
DROP POLICY IF EXISTS "Users can insert their own banks" ON banks;
DROP POLICY IF EXISTS "Users can update their own banks" ON banks;
DROP POLICY IF EXISTS "Users can delete their own banks" ON banks;

DROP POLICY IF EXISTS "Allow authenticated users to read loans" ON loans;
DROP POLICY IF EXISTS "Allow authenticated users to insert loans" ON loans;
DROP POLICY IF EXISTS "Allow users to update their own loans" ON loans;
DROP POLICY IF EXISTS "Allow users to delete their own loans" ON loans;
DROP POLICY IF EXISTS "Users can read their own loans" ON loans;
DROP POLICY IF EXISTS "Users can insert their own loans" ON loans;
DROP POLICY IF EXISTS "Users can update their own loans" ON loans;
DROP POLICY IF EXISTS "Users can delete their own loans" ON loans;

ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own banks"
  ON banks FOR SELECT
  TO authenticated
  USING (appraiser_id = auth.uid());

CREATE POLICY "Users can insert their own banks"
  ON banks FOR INSERT
  TO authenticated
  WITH CHECK (appraiser_id = auth.uid());

CREATE POLICY "Users can update their own banks"
  ON banks FOR UPDATE
  TO authenticated
  USING (appraiser_id = auth.uid())
  WITH CHECK (appraiser_id = auth.uid());

CREATE POLICY "Users can delete their own banks"
  ON banks FOR DELETE
  TO authenticated
  USING (appraiser_id = auth.uid());

CREATE POLICY "Users can read their own loans"
  ON loans FOR SELECT
  TO authenticated
  USING (appraiser_id = auth.uid());

CREATE POLICY "Users can insert their own loans"
  ON loans FOR INSERT
  TO authenticated
  WITH CHECK (appraiser_id = auth.uid());

CREATE POLICY "Users can update their own loans"
  ON loans FOR UPDATE
  TO authenticated
  USING (appraiser_id = auth.uid())
  WITH CHECK (appraiser_id = auth.uid());

CREATE POLICY "Users can delete their own loans"
  ON loans FOR DELETE
  TO authenticated
  USING (appraiser_id = auth.uid());

-- 9) Recreate per-user-safe view
CREATE OR REPLACE VIEW loans_with_bank AS
SELECT 
  l.id,
  l.bank_id,
  b.name as bank_name,
  l.date,
  l.amount,
  l.customer_name,
  l.notes,
  l.appraiser_id,
  l.created_at,
  l.updated_at
FROM loans l
INNER JOIN banks b ON l.bank_id = b.id AND l.appraiser_id = b.appraiser_id
ORDER BY l.date DESC, l.created_at DESC;

GRANT SELECT ON loans_with_bank TO authenticated;

-- 10) Seed default banks for newly created users
CREATE OR REPLACE FUNCTION seed_default_banks_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO banks (appraiser_id, name)
  VALUES
    (NEW.id, 'AU Bank Lalgudi'),
    (NEW.id, 'AU Bank Mannachanallur'),
    (NEW.id, 'RBL Bank Lalgudi'),
    (NEW.id, 'RBL Bank Mannachanallur')
  ON CONFLICT (appraiser_id, name) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_banks_on_auth_user_created ON auth.users;

CREATE TRIGGER seed_banks_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION seed_default_banks_for_new_user();

-- 11) Seed default banks for existing users (one-time backfill)
INSERT INTO banks (appraiser_id, name)
SELECT u.id, d.name
FROM auth.users u
CROSS JOIN (
  VALUES
    ('AU Bank Lalgudi'),
    ('AU Bank Mannachanallur'),
    ('RBL Bank Lalgudi'),
    ('RBL Bank Mannachanallur')
) AS d(name)
ON CONFLICT (appraiser_id, name) DO NOTHING;
