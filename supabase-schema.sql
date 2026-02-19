-- Gold Loan Appraiser Tracking System - Database Schema
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Banks Table
CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appraiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12, 2),
  customer_name TEXT,
  notes TEXT,
  appraiser_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loans_bank_id ON loans(bank_id);
CREATE INDEX IF NOT EXISTS idx_loans_date ON loans(date);
CREATE INDEX IF NOT EXISTS idx_loans_appraiser_id ON loans(appraiser_id);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at);
CREATE INDEX IF NOT EXISTS idx_banks_appraiser_id ON banks(appraiser_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_banks_appraiser_name_unique ON banks(appraiser_id, name);

-- Enable Row Level Security (RLS)
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banks table
-- Users can access only their own banks
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

-- RLS Policies for loans table
-- Users can access only their own loans
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

-- Create a view for loans with bank names (for easier querying)
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

-- Grant access to the view
GRANT SELECT ON loans_with_bank TO authenticated;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default banks when a new user signs up
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

-- SUCCESS! Your database is now set up.
-- Next steps:
-- 1. Update your .env file with your Supabase URL and anon key
-- 2. Configure authentication settings in Supabase Dashboard
-- 3. (Optional) Set up email/password authentication or other providers
