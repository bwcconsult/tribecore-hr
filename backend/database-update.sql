-- Database Schema Update Script
-- Run this in Railway PostgreSQL database to add missing columns
-- This fixes the "column User.preferredName does not exist" error

-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferredName" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pronouns" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationality" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "maritalStatus" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "personalEmail" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "workPhone" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "personalPhone" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "addressLine1" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "addressLine2" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "postcode" VARCHAR;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" VARCHAR;

-- Verify changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
