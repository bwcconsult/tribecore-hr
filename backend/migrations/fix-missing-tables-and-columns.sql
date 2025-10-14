-- =====================================================
-- FIX MISSING TABLES AND COLUMNS
-- Run this to fix production database schema issues
-- =====================================================

-- 1. Fix missing employee.taxReference column
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee' 
        AND column_name = 'taxreference'
    ) THEN
        ALTER TABLE employee ADD COLUMN "taxReference" VARCHAR(50);
        CREATE INDEX IF NOT EXISTS idx_employee_tax_reference ON employee("taxReference");
    END IF;
END $$;

-- 2. Create absence_plans table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS absence_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" UUID NOT NULL,
    "planName" VARCHAR(255) NOT NULL,
    "planType" VARCHAR(50) NOT NULL, -- ANNUAL_LEAVE, SICK_LEAVE, etc.
    "allowanceType" VARCHAR(50) NOT NULL, -- DAYS, HOURS
    "defaultAllowance" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "carryOverAllowed" BOOLEAN DEFAULT false,
    "maxCarryOver" DECIMAL(10, 2),
    "carryOverExpiry" INTEGER, -- months
    "accrualRate" VARCHAR(50), -- MONTHLY, YEARLY
    "waitingPeriodDays" INTEGER DEFAULT 0,
    "requiresApproval" BOOLEAN DEFAULT true,
    "autoApprove" BOOLEAN DEFAULT false,
    "advanceBookingDays" INTEGER,
    "minNoticeDays" INTEGER,
    "maxConsecutiveDays" INTEGER,
    "blockoutPeriods" JSONB,
    "eligibilityCriteria" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP NULL,
    CONSTRAINT fk_absence_plan_organization FOREIGN KEY ("organizationId") 
        REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_absence_plans_org ON absence_plans("organizationId");
CREATE INDEX IF NOT EXISTS idx_absence_plans_type ON absence_plans("planType");
CREATE INDEX IF NOT EXISTS idx_absence_plans_active ON absence_plans("isActive");

-- 3. Create objectives table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "objectiveType" VARCHAR(50) NOT NULL, -- INDIVIDUAL, TEAM, COMPANY
    "startDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "completionDate" DATE,
    status VARCHAR(50) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    "targetValue" DECIMAL(10, 2),
    "currentValue" DECIMAL(10, 2),
    "measurementUnit" VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    weight DECIMAL(5, 2) DEFAULT 1.0,
    "parentObjectiveId" UUID,
    "alignedToCompanyGoal" BOOLEAN DEFAULT false,
    "companyGoalId" UUID,
    "keyResults" JSONB,
    "milestones" JSONB,
    "assignedBy" UUID,
    "reviewCycle" VARCHAR(50), -- Q1, Q2, Q3, Q4, ANNUAL
    "selfRating" INTEGER CHECK ("selfRating" >= 1 AND "selfRating" <= 5),
    "managerRating" INTEGER CHECK ("managerRating" >= 1 AND "managerRating" <= 5),
    "finalRating" INTEGER CHECK ("finalRating" >= 1 AND "finalRating" <= 5),
    "ratingJustification" TEXT,
    tags TEXT[],
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP NULL,
    CONSTRAINT fk_objectives_employee FOREIGN KEY ("employeeId") 
        REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT fk_objectives_organization FOREIGN KEY ("organizationId") 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_objectives_parent FOREIGN KEY ("parentObjectiveId") 
        REFERENCES objectives(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_objectives_employee ON objectives("employeeId");
CREATE INDEX IF NOT EXISTS idx_objectives_org ON objectives("organizationId");
CREATE INDEX IF NOT EXISTS idx_objectives_status ON objectives(status);
CREATE INDEX IF NOT EXISTS idx_objectives_due_date ON objectives("dueDate");
CREATE INDEX IF NOT EXISTS idx_objectives_type ON objectives("objectiveType");

-- 4. Create nudges table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS nudges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" UUID NOT NULL,
    "targetUserId" UUID,
    "targetRole" VARCHAR(50),
    "nudgeType" VARCHAR(50) NOT NULL, -- REMINDER, SUGGESTION, ACTION_REQUIRED, CELEBRATION
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "actionUrl" VARCHAR(500),
    "actionLabel" VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    category VARCHAR(50), -- PERFORMANCE, LEAVE, EXPENSES, etc.
    "triggerEvent" VARCHAR(100),
    "isRead" BOOLEAN DEFAULT false,
    "isDismissed" BOOLEAN DEFAULT false,
    "expiresAt" TIMESTAMP,
    "scheduledFor" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "readAt" TIMESTAMP,
    "dismissedAt" TIMESTAMP,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP NULL,
    CONSTRAINT fk_nudges_organization FOREIGN KEY ("organizationId") 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_nudges_user FOREIGN KEY ("targetUserId") 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_nudges_target_user ON nudges("targetUserId");
CREATE INDEX IF NOT EXISTS idx_nudges_org ON nudges("organizationId");
CREATE INDEX IF NOT EXISTS idx_nudges_type ON nudges("nudgeType");
CREATE INDEX IF NOT EXISTS idx_nudges_read ON nudges("isRead");
CREATE INDEX IF NOT EXISTS idx_nudges_expires ON nudges("expiresAt");

-- 5. Create equality_cases table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS equality_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" UUID NOT NULL,
    "caseNumber" VARCHAR(50) UNIQUE NOT NULL,
    "caseType" VARCHAR(50) NOT NULL, -- DISCRIMINATION, HARASSMENT, EQUAL_PAY, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "complainantId" UUID,
    "complainantName" VARCHAR(255),
    "respondentId" UUID,
    "respondentName" VARCHAR(255),
    "protectedCharacteristic" VARCHAR(100)[], -- AGE, DISABILITY, GENDER, RACE, etc.
    "incidentDate" DATE,
    "reportedDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, INVESTIGATING, RESOLVED, CLOSED
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    "assignedTo" UUID,
    "dueDate" DATE,
    "closedDate" DATE,
    outcome VARCHAR(50),
    "actionsTaken" TEXT,
    "followUpRequired" BOOLEAN DEFAULT false,
    "nextReviewDate" DATE,
    "isConfidential" BOOLEAN DEFAULT true,
    "evidenceUrls" TEXT[],
    notes JSONB,
    timeline JSONB,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP NULL,
    CONSTRAINT fk_equality_cases_organization FOREIGN KEY ("organizationId") 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_equality_cases_complainant FOREIGN KEY ("complainantId") 
        REFERENCES employee(id) ON DELETE SET NULL,
    CONSTRAINT fk_equality_cases_respondent FOREIGN KEY ("respondentId") 
        REFERENCES employee(id) ON DELETE SET NULL,
    CONSTRAINT fk_equality_cases_assigned FOREIGN KEY ("assignedTo") 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_equality_cases_org ON equality_cases("organizationId");
CREATE INDEX IF NOT EXISTS idx_equality_cases_number ON equality_cases("caseNumber");
CREATE INDEX IF NOT EXISTS idx_equality_cases_status ON equality_cases(status);
CREATE INDEX IF NOT EXISTS idx_equality_cases_type ON equality_cases("caseType");

-- 6. Create legal_advice_requests table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_advice_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" UUID NOT NULL,
    "requestNumber" VARCHAR(50) UNIQUE NOT NULL,
    "requestedBy" UUID NOT NULL,
    "requestedByName" VARCHAR(255),
    "requestType" VARCHAR(50) NOT NULL, -- CONTRACT_REVIEW, DISCIPLINARY, TERMINATION, etc.
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "employeeId" UUID,
    "employeeName" VARCHAR(255),
    urgency VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ASSIGNED, IN_REVIEW, ADVICE_PROVIDED, CLOSED
    "assignedLawyer" VARCHAR(255),
    "externalFirm" VARCHAR(255),
    "requestDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "responseDate" TIMESTAMP,
    "closedDate" TIMESTAMP,
    "legalAdvice" TEXT,
    "actionRecommended" TEXT,
    "followUpRequired" BOOLEAN DEFAULT false,
    "estimatedCost" DECIMAL(10, 2),
    "actualCost" DECIMAL(10, 2),
    "attachments" TEXT[],
    "relatedCases" UUID[],
    tags TEXT[],
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP NULL,
    CONSTRAINT fk_legal_advice_organization FOREIGN KEY ("organizationId") 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_legal_advice_requestor FOREIGN KEY ("requestedBy") 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_legal_advice_employee FOREIGN KEY ("employeeId") 
        REFERENCES employee(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_legal_advice_org ON legal_advice_requests("organizationId");
CREATE INDEX IF NOT EXISTS idx_legal_advice_number ON legal_advice_requests("requestNumber");
CREATE INDEX IF NOT EXISTS idx_legal_advice_status ON legal_advice_requests(status);
CREATE INDEX IF NOT EXISTS idx_legal_advice_type ON legal_advice_requests("requestType");
CREATE INDEX IF NOT EXISTS idx_legal_advice_requestor ON legal_advice_requests("requestedBy");

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Created/Updated:';
    RAISE NOTICE '  - employee.taxReference column';
    RAISE NOTICE '  - absence_plans table';
    RAISE NOTICE '  - objectives table';
    RAISE NOTICE '  - nudges table';
    RAISE NOTICE '  - equality_cases table';
    RAISE NOTICE '  - legal_advice_requests table';
END $$;
