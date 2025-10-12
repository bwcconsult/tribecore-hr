-- Migration: Organization Settings and Multi-Tenant Support
-- Date: 2025-10-12
-- Description: Add org-specific settings, manager hierarchy, and multi-tenant benefits

-- 1. Add organizationId to benefit_plans (make benefits org-specific)
ALTER TABLE benefit_plans 
ADD COLUMN IF NOT EXISTS "organizationId" UUID;

-- 2. Update existing benefit plans to use a default organization (update with your actual org ID)
-- UPDATE benefit_plans SET "organizationId" = 'YOUR_ORG_ID_HERE' WHERE "organizationId" IS NULL;

-- 3. Add manager relationship to employees (already has managerId column)
-- No changes needed - managerId already exists

-- 4. Change workLocation from enum to string (configurable from org settings)
-- This is already nullable and can accept strings

-- 5. Update organization settings JSONB structure
-- No schema change needed - JSONB is flexible
-- Just document the new structure:
COMMENT ON COLUMN organizations.settings IS 'Organization-specific settings including:
- employeeIdPrefix: string (e.g., "EMP-", "TC-")
- workLocations: string[] (configurable locations)
- departments: string[] (configurable departments)
- jobLevels: string[] (job levels/grades)
- employmentTypes: string[] (employment types)
- payroll: { frequency, paymentDay }
- leave: { annualLeaveDefault, sickLeaveDefault }
- onboardingChecklist: [{ id, title, description, category, daysToComplete, isRequired, order }]
- compliance: { gdprEnabled, dataRetentionDays }';

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_benefit_plans_organization 
ON benefit_plans("organizationId");

CREATE INDEX IF NOT EXISTS idx_employees_manager 
ON employees("managerId");

CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_employee 
ON benefit_enrollments("employeeId");

-- 7. Add foreign key constraints
ALTER TABLE benefit_plans 
ADD CONSTRAINT fk_benefit_plans_organization 
FOREIGN KEY ("organizationId") REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Note: Performance ratings are now numeric 0-100 instead of enum
-- If you have existing performance review tables, update them accordingly
