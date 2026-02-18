-- Gold Loan Appraiser Tracking System - Database Schema
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Banks Table
CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
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

-- Insert initial banks
INSERT INTO banks (name) VALUES
  ('AU Bank Lalgudi'),
  ('AU Bank Mannachanallur'),
  ('RBL Bank Lalgudi'),
  ('RBL Bank Mannachanallur')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banks table
-- Allow authenticated users to read all banks
CREATE POLICY "Allow authenticated users to read banks"
  ON banks FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert banks
CREATE POLICY "Allow authenticated users to insert banks"
  ON banks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update banks
CREATE POLICY "Allow authenticated users to update banks"
  ON banks FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete banks
CREATE POLICY "Allow authenticated users to delete banks"
  ON banks FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for loans table
-- Allow authenticated users to read all loans
CREATE POLICY "Allow authenticated users to read loans"
  ON loans FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert loans
CREATE POLICY "Allow authenticated users to insert loans"
  ON loans FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own loans
CREATE POLICY "Allow users to update their own loans"
  ON loans FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete their own loans
CREATE POLICY "Allow users to delete their own loans"
  ON loans FOR DELETE
  TO authenticated
  USING (true);

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
INNER JOIN banks b ON l.bank_id = b.id
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

-- SUCCESS! Your database is now set up.
-- Next steps:
-- 1. Update your .env file with your Supabase URL and anon key
-- 2. Configure authentication settings in Supabase Dashboard
-- 3. (Optional) Set up email/password authentication or other providers
