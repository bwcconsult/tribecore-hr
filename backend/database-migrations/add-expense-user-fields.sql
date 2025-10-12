-- Add expense-related fields to users table
-- Run this migration to support the expense management system

-- Add orgUnit column (organizational unit)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "orgUnit" VARCHAR(255);

-- Add managerId column (reference to manager for approval workflow)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "managerId" UUID;

-- Add bankAccount column (for reimbursements)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "bankAccount" VARCHAR(255);

-- Add timezone column (default to Europe/London)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(100) DEFAULT 'Europe/London';

-- Update existing users to have default timezone if null
UPDATE users 
SET timezone = 'Europe/London' 
WHERE timezone IS NULL;

-- Optional: Add foreign key constraint for managerId (uncomment if needed)
-- ALTER TABLE users 
-- ADD CONSTRAINT fk_users_manager 
-- FOREIGN KEY ("managerId") REFERENCES users(id) ON DELETE SET NULL;

-- Create index on managerId for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users("managerId");

-- Create index on orgUnit for organizational queries
CREATE INDEX IF NOT EXISTS idx_users_org_unit ON users("orgUnit");
