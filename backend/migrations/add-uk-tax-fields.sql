-- Migration: Add UK Tax Fields to Employees Table
-- Date: 2025-10-14
-- Description: Adds taxReference, niNumber, and taxDistrict columns for UK payroll compliance

-- Add UK-specific tax fields (IF NOT EXISTS for safety)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxReference" VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "niNumber" VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxDistrict" VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN employees."taxReference" IS 'UK PAYE Tax Reference Number';
COMMENT ON COLUMN employees."niNumber" IS 'UK National Insurance Number';
COMMENT ON COLUMN employees."taxDistrict" IS 'UK Tax District Code';
