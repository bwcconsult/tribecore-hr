-- Migration: Create HR Modules Tables
-- Date: 2025-10-14
-- Description: Creates all tables for Offboarding, Onboarding, and Recruitment modules

-- =======================
-- STEP 1: Add UK Tax Fields to Employees (if not exists)
-- =======================
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxReference" VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "niNumber" VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxDistrict" VARCHAR(255);

-- =======================
-- MODULE 1: OFFBOARDING
-- =======================

-- Separation Cases
CREATE TABLE IF NOT EXISTS "separation_cases" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employeeId" VARCHAR(255) NOT NULL,
  "organizationId" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  "reasonCode" VARCHAR(100),
  "reasonDetails" TEXT,
  "isVoluntary" BOOLEAN DEFAULT true,
  "proposedLeaveDate" TIMESTAMP,
  "confirmedLeaveDate" TIMESTAMP,
  "noticeGivenDate" TIMESTAMP,
  "lastWorkingDate" TIMESTAMP,
  "finalPaymentDate" TIMESTAMP,
  "exitInterviewCompleted" BOOLEAN DEFAULT false,
  "exitInterviewDate" TIMESTAMP,
  "exitInterviewNotes" TEXT,
  "riskScore" INTEGER DEFAULT 0,
  "requiresLegalApproval" BOOLEAN DEFAULT false,
  "approvedBy" VARCHAR(255),
  "approvedAt" TIMESTAMP,
  "createdBy" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Notice Terms
CREATE TABLE IF NOT EXISTS "notice_terms" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "separationCaseId" UUID NOT NULL REFERENCES "separation_cases"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "country" VARCHAR(10) NOT NULL,
  "statutoryNoticeDays" INTEGER NOT NULL,
  "contractualNoticeDays" INTEGER NOT NULL,
  "noticeDays" INTEGER NOT NULL,
  "noticeStart" TIMESTAMP NOT NULL,
  "noticeEnd" TIMESTAMP NOT NULL,
  "method" VARCHAR(50) NOT NULL,
  "payInLieu" BOOLEAN DEFAULT false,
  "gardenLeave" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Severance Calculations
CREATE TABLE IF NOT EXISTS "severance_calculations" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "separationCaseId" UUID NOT NULL REFERENCES "separation_cases"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "country" VARCHAR(10) NOT NULL,
  "basePay" DECIMAL(15,2) NOT NULL,
  "yearsService" DECIMAL(5,2) NOT NULL,
  "statutoryAmount" DECIMAL(15,2) DEFAULT 0,
  "exGratiaAmount" DECIMAL(15,2) DEFAULT 0,
  "holidayPayoutAmount" DECIMAL(15,2) DEFAULT 0,
  "toilPayoutAmount" DECIMAL(15,2) DEFAULT 0,
  "noticePay" DECIMAL(15,2) DEFAULT 0,
  "otherAmount" DECIMAL(15,2) DEFAULT 0,
  "grossAmount" DECIMAL(15,2) NOT NULL,
  "taxAmount" DECIMAL(15,2) DEFAULT 0,
  "nicAmount" DECIMAL(15,2) DEFAULT 0,
  "netAmount" DECIMAL(15,2) NOT NULL,
  "calculatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Redundancy Groups
CREATE TABLE IF NOT EXISTS "redundancy_groups" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
  "country" VARCHAR(10) NOT NULL,
  "poolSize" INTEGER NOT NULL,
  "targetReductions" INTEGER NOT NULL,
  "consultationStartDate" TIMESTAMP,
  "consultationEndDate" TIMESTAMP,
  "consultationDays" INTEGER,
  "requiresCollectiveConsultation" BOOLEAN DEFAULT false,
  "notificationSent" BOOLEAN DEFAULT false,
  "createdBy" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Separation Tasks
CREATE TABLE IF NOT EXISTS "separation_tasks" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "separationCaseId" UUID NOT NULL REFERENCES "separation_cases"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "taskName" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "assignedTo" VARCHAR(255),
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "dueDate" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "completedBy" VARCHAR(255),
  "isCritical" BOOLEAN DEFAULT false,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Access Deprovision
CREATE TABLE IF NOT EXISTS "access_deprovision" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "separationCaseId" UUID NOT NULL REFERENCES "separation_cases"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "systemName" VARCHAR(255) NOT NULL,
  "accessType" VARCHAR(100) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP DEFAULT NOW(),
  "completedAt" TIMESTAMP,
  "completedBy" VARCHAR(255),
  "notes" TEXT,
  "metadata" JSONB
);

-- =======================
-- MODULE 2: ONBOARDING
-- =======================

-- Onboarding Cases
CREATE TABLE IF NOT EXISTS "onboarding_cases" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "candidateId" VARCHAR(255),
  "employeeId" VARCHAR(255),
  "organizationId" VARCHAR(255) NOT NULL,
  "country" VARCHAR(10) NOT NULL,
  "site" VARCHAR(255),
  "department" VARCHAR(255),
  "jobTitle" VARCHAR(255) NOT NULL,
  "hiringManagerId" VARCHAR(255) NOT NULL,
  "buddyId" VARCHAR(255),
  "status" VARCHAR(50) NOT NULL DEFAULT 'OFFER_PENDING',
  "offerSentDate" TIMESTAMP,
  "offerSignedDate" TIMESTAMP,
  "startDate" TIMESTAMP NOT NULL,
  "firstDayComplete" BOOLEAN DEFAULT false,
  "firstDayCompletedAt" TIMESTAMP,
  "week1Complete" BOOLEAN DEFAULT false,
  "week1CompletedAt" TIMESTAMP,
  "probationEndDate" TIMESTAMP,
  "probationExtendedDate" TIMESTAMP,
  "probationOutcome" VARCHAR(50),
  "probationDecisionDate" TIMESTAMP,
  "completionPercentage" INTEGER DEFAULT 0,
  "provisioningComplete" BOOLEAN DEFAULT false,
  "backgroundCheckComplete" BOOLEAN DEFAULT false,
  "rightToWorkVerified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Onboarding Checklists
CREATE TABLE IF NOT EXISTS "onboarding_checklists" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "onboardingCaseId" UUID NOT NULL REFERENCES "onboarding_cases"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "taskName" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "assignedTo" VARCHAR(255),
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "dueDate" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "completedBy" VARCHAR(255),
  "isMandatory" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Provisions
CREATE TABLE IF NOT EXISTS "provisions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "onboardingCaseId" UUID NOT NULL REFERENCES "onboarding_cases"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "type" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP DEFAULT NOW(),
  "requiredBy" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "completedBy" VARCHAR(255),
  "notes" TEXT,
  "metadata" JSONB
);

-- =======================
-- MODULE 3: RECRUITMENT
-- =======================

-- Requisitions
CREATE TABLE IF NOT EXISTS "requisitions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" VARCHAR(255) NOT NULL,
  "departmentId" VARCHAR(255) NOT NULL,
  "jobTitle" VARCHAR(255) NOT NULL,
  "headcount" INTEGER NOT NULL DEFAULT 1,
  "employmentType" VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME',
  "location" VARCHAR(255),
  "isRemote" BOOLEAN DEFAULT false,
  "budgetAmount" DECIMAL(15,2),
  "hiringManagerId" VARCHAR(255) NOT NULL,
  "reason" VARCHAR(100) NOT NULL,
  "justification" TEXT,
  "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  "targetStartDate" TIMESTAMP,
  "approvedAt" TIMESTAMP,
  "rejectedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  "createdBy" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Job Postings
CREATE TABLE IF NOT EXISTS "job_postings" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "requisitionId" UUID REFERENCES "requisitions"("id") ON DELETE SET NULL,
  "organizationId" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "requirements" TEXT,
  "salaryMin" DECIMAL(15,2),
  "salaryMax" DECIMAL(15,2),
  "showSalary" BOOLEAN DEFAULT false,
  "location" VARCHAR(255),
  "remote" BOOLEAN DEFAULT false,
  "employmentType" VARCHAR(50),
  "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  "postedAt" TIMESTAMP,
  "closedAt" TIMESTAMP,
  "viewCount" INTEGER DEFAULT 0,
  "applicationCount" INTEGER DEFAULT 0,
  "createdBy" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "competencies" JSONB,
  "channels" JSONB,
  "metadata" JSONB
);

-- Candidates
CREATE TABLE IF NOT EXISTS "candidates" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50),
  "country" VARCHAR(10),
  "city" VARCHAR(255),
  "linkedinUrl" VARCHAR(500),
  "resumeUrl" VARCHAR(500),
  "source" VARCHAR(100),
  "referrerId" VARCHAR(255),
  "gdprConsent" BOOLEAN DEFAULT false,
  "gdprConsentDate" TIMESTAMP,
  "dataRetentionDate" TIMESTAMP,
  "notes" TEXT,
  "tags" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Applications
CREATE TABLE IF NOT EXISTS "applications" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "candidateId" UUID NOT NULL REFERENCES "candidates"("id") ON DELETE CASCADE,
  "jobPostingId" UUID NOT NULL REFERENCES "job_postings"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "stage" VARCHAR(50) NOT NULL DEFAULT 'NEW',
  "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  "appliedAt" TIMESTAMP DEFAULT NOW(),
  "source" VARCHAR(100),
  "resumeUrl" VARCHAR(500),
  "coverLetter" TEXT,
  "rejectedAt" TIMESTAMP,
  "rejectionReason" VARCHAR(255),
  "rejectionFeedback" TEXT,
  "notificationSent" BOOLEAN DEFAULT false,
  "overallScore" DECIMAL(5,2),
  "screeningAnswers" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Interviews
CREATE TABLE IF NOT EXISTS "interviews" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "applicationId" UUID NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "stage" VARCHAR(50) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
  "scheduledStart" TIMESTAMP,
  "scheduledEnd" TIMESTAMP,
  "actualStart" TIMESTAMP,
  "actualEnd" TIMESTAMP,
  "meetingLink" VARCHAR(500),
  "location" VARCHAR(255),
  "feedbackDueAt" TIMESTAMP,
  "consensusReached" BOOLEAN DEFAULT false,
  "overallRecommendation" VARCHAR(50),
  "panel" JSONB NOT NULL,
  "scorecards" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- Offers
CREATE TABLE IF NOT EXISTS "offers" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "applicationId" UUID NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
  "candidateId" UUID NOT NULL REFERENCES "candidates"("id") ON DELETE CASCADE,
  "organizationId" VARCHAR(255) NOT NULL,
  "jobTitle" VARCHAR(255) NOT NULL,
  "department" VARCHAR(255),
  "hiringManagerId" VARCHAR(255) NOT NULL,
  "baseSalary" DECIMAL(15,2) NOT NULL,
  "currency" VARCHAR(10) NOT NULL DEFAULT 'GBP',
  "bonus" DECIMAL(15,2),
  "equity" VARCHAR(255),
  "proposedStartDate" TIMESTAMP,
  "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  "sentAt" TIMESTAMP,
  "acceptedAt" TIMESTAMP,
  "declinedAt" TIMESTAMP,
  "declineReason" TEXT,
  "expiresAt" TIMESTAMP,
  "totalCompensation" DECIMAL(15,2),
  "benefits" JSONB,
  "terms" JSONB,
  "createdBy" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB
);

-- =======================
-- INDEXES FOR PERFORMANCE
-- =======================

-- Separation Cases
CREATE INDEX IF NOT EXISTS idx_separation_cases_employee ON "separation_cases"("employeeId");
CREATE INDEX IF NOT EXISTS idx_separation_cases_org ON "separation_cases"("organizationId");
CREATE INDEX IF NOT EXISTS idx_separation_cases_status ON "separation_cases"("status");

-- Onboarding Cases
CREATE INDEX IF NOT EXISTS idx_onboarding_cases_employee ON "onboarding_cases"("employeeId");
CREATE INDEX IF NOT EXISTS idx_onboarding_cases_org ON "onboarding_cases"("organizationId");
CREATE INDEX IF NOT EXISTS idx_onboarding_cases_status ON "onboarding_cases"("status");
CREATE INDEX IF NOT EXISTS idx_onboarding_cases_start_date ON "onboarding_cases"("startDate");

-- Applications
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON "applications"("candidateId");
CREATE INDEX IF NOT EXISTS idx_applications_job ON "applications"("jobPostingId");
CREATE INDEX IF NOT EXISTS idx_applications_org ON "applications"("organizationId");
CREATE INDEX IF NOT EXISTS idx_applications_stage ON "applications"("stage");
CREATE INDEX IF NOT EXISTS idx_applications_status ON "applications"("status");

-- Job Postings
CREATE INDEX IF NOT EXISTS idx_job_postings_org ON "job_postings"("organizationId");
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON "job_postings"("status");

-- Candidates
CREATE INDEX IF NOT EXISTS idx_candidates_org ON "candidates"("organizationId");
CREATE INDEX IF NOT EXISTS idx_candidates_email ON "candidates"("email");

-- Comments
COMMENT ON TABLE "separation_cases" IS 'Exit and offboarding cases for all separation types';
COMMENT ON TABLE "onboarding_cases" IS 'New hire onboarding from offer to day 90';
COMMENT ON TABLE "requisitions" IS 'Headcount approval requests';
COMMENT ON TABLE "job_postings" IS 'Published job ads across channels';
COMMENT ON TABLE "candidates" IS 'Talent pool with GDPR compliance';
COMMENT ON TABLE "applications" IS 'Candidate applications through pipeline stages';

-- Migration complete
