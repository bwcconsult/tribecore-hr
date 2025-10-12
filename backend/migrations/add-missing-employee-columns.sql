-- Migration to add missing employee columns
-- Run this SQL script on your PostgreSQL database

-- Add taxReference column if it doesn't exist
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS "taxReference" VARCHAR;

-- Add niNumber column if it doesn't exist
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS "niNumber" VARCHAR;

-- Add taxDistrict column if it doesn't exist
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS "taxDistrict" VARCHAR;

-- Add other potentially missing columns
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS "officeLocation" VARCHAR;

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS "bankRoutingNumber" VARCHAR;

-- Add comment
COMMENT ON COLUMN employees."taxReference" IS 'UK PAYE Tax Reference';
COMMENT ON COLUMN employees."niNumber" IS 'UK National Insurance Number';
COMMENT ON COLUMN employees."taxDistrict" IS 'UK Tax District';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;
