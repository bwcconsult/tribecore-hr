-- Migration to create tables for new features
-- Shifts, Recognition, Offboarding, Overtime modules

-- =============================================
-- SHIFTS MODULE
-- =============================================

-- Rotas table
CREATE TABLE IF NOT EXISTS rotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    "organizationId" VARCHAR NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    status VARCHAR DEFAULT 'DRAFT',
    department VARCHAR,
    location VARCHAR,
    description TEXT,
    "createdBy" VARCHAR NOT NULL,
    "publishedBy" VARCHAR,
    "publishedAt" TIMESTAMP,
    settings JSONB,
    "assignedEmployees" TEXT[],
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" VARCHAR NOT NULL,
    "rotaId" UUID,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    "shiftType" VARCHAR DEFAULT 'REGULAR',
    status VARCHAR DEFAULT 'DRAFT',
    location VARCHAR,
    department VARCHAR,
    role VARCHAR,
    "breakDurationMinutes" DECIMAL(10,2),
    "totalHours" DECIMAL(10,2),
    notes TEXT,
    "isOpenShift" BOOLEAN DEFAULT FALSE,
    "assignedBy" VARCHAR,
    "assignedAt" TIMESTAMP,
    "swapRequestedBy" VARCHAR,
    "swapRequestedAt" TIMESTAMP,
    "isSwapApproved" BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("rotaId") REFERENCES rotas(id) ON DELETE CASCADE
);

-- Shift Templates table
CREATE TABLE IF NOT EXISTS shift_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    "organizationId" VARCHAR NOT NULL,
    "startTime" VARCHAR NOT NULL,
    "endTime" VARCHAR NOT NULL,
    "shiftType" VARCHAR DEFAULT 'REGULAR',
    department VARCHAR,
    role VARCHAR,
    "breakDurationMinutes" DECIMAL(10,2) DEFAULT 0,
    "totalHours" DECIMAL(10,2) NOT NULL,
    color VARCHAR,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- RECOGNITION MODULE
-- =============================================

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    "iconUrl" VARCHAR,
    color VARCHAR,
    "pointsValue" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT TRUE,
    criteria JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Recognitions table
CREATE TABLE IF NOT EXISTS recognitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "recipientId" VARCHAR NOT NULL,
    "giverId" VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    "isPublic" BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    "likedBy" TEXT[],
    tags TEXT[],
    "badgeId" UUID,
    "pointsAwarded" INTEGER DEFAULT 0,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("badgeId") REFERENCES badges(id) ON DELETE SET NULL
);

-- Employee Badges table
CREATE TABLE IF NOT EXISTS employee_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" VARCHAR NOT NULL,
    "badgeId" UUID NOT NULL,
    "awardedBy" VARCHAR NOT NULL,
    "recognitionId" UUID,
    reason TEXT,
    "awardedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("badgeId") REFERENCES badges(id) ON DELETE CASCADE,
    FOREIGN KEY ("recognitionId") REFERENCES recognitions(id) ON DELETE SET NULL
);

-- Reward Points table
CREATE TABLE IF NOT EXISTS reward_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" VARCHAR NOT NULL UNIQUE,
    "organizationId" VARCHAR NOT NULL,
    "totalPoints" INTEGER DEFAULT 0,
    "availablePoints" INTEGER DEFAULT 0,
    "redeemedPoints" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Points Transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    points INTEGER NOT NULL,
    "recognitionId" UUID,
    "redemptionId" VARCHAR,
    description TEXT,
    "processedBy" VARCHAR,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("recognitionId") REFERENCES recognitions(id) ON DELETE SET NULL
);

-- =============================================
-- OFFBOARDING MODULE
-- =============================================

-- Offboarding Processes table
CREATE TABLE IF NOT EXISTS offboarding_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" VARCHAR NOT NULL,
    "organizationId" VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'PLANNED',
    reason VARCHAR NOT NULL,
    "lastWorkingDay" DATE NOT NULL,
    "noticeGivenDate" DATE,
    "noticePeriodDays" INTEGER,
    "initiatedBy" VARCHAR,
    "managerId" VARCHAR,
    notes TEXT,
    "exitInterviewNotes" TEXT,
    "exitInterviewDate" DATE,
    "exitInterviewConductedBy" VARCHAR,
    "redundancyDetails" JSONB,
    "finalSettlement" JSONB,
    "assetIds" TEXT[],
    "completedTasks" TEXT[],
    "pendingTasks" TEXT[],
    "accessRevoked" BOOLEAN DEFAULT FALSE,
    "accessRevokedDate" DATE,
    "referenceProvided" BOOLEAN DEFAULT FALSE,
    "referenceProvidedDate" DATE,
    "completionPercentage" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Offboarding Tasks table
CREATE TABLE IF NOT EXISTS offboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "offboardingProcessId" UUID NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'PENDING',
    "assignedTo" VARCHAR,
    "dueDate" DATE,
    "completedBy" VARCHAR,
    "completedAt" TIMESTAMP,
    "order" INTEGER DEFAULT 0,
    "isRequired" BOOLEAN DEFAULT TRUE,
    "completionNotes" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("offboardingProcessId") REFERENCES offboarding_processes(id) ON DELETE CASCADE
);

-- Exit Interviews table
CREATE TABLE IF NOT EXISTS exit_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "offboardingProcessId" UUID NOT NULL,
    "employeeId" VARCHAR NOT NULL,
    "conductedBy" VARCHAR NOT NULL,
    "interviewDate" DATE NOT NULL,
    "overallSatisfactionRating" INTEGER,
    ratings JSONB,
    "reasonForLeaving" TEXT,
    "whatWentWell" TEXT,
    "areasForImprovement" TEXT,
    "wouldRecommendCompany" TEXT,
    "additionalComments" TEXT,
    "wouldRehire" BOOLEAN DEFAULT FALSE,
    "openToReturning" BOOLEAN DEFAULT FALSE,
    "improvementSuggestions" TEXT[],
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("offboardingProcessId") REFERENCES offboarding_processes(id) ON DELETE CASCADE
);

-- =============================================
-- OVERTIME MODULE
-- =============================================

-- Overtime Policies table
CREATE TABLE IF NOT EXISTS overtime_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    description TEXT,
    "regularOvertimeMultiplier" DECIMAL(10,2) DEFAULT 1.5,
    "weekendOvertimeMultiplier" DECIMAL(10,2) DEFAULT 2.0,
    "holidayOvertimeMultiplier" DECIMAL(10,2) DEFAULT 2.5,
    "nightShiftMultiplier" DECIMAL(10,2) DEFAULT 1.75,
    "weeklyThresholdHours" INTEGER DEFAULT 40,
    "dailyThresholdHours" INTEGER DEFAULT 8,
    "requiresApproval" BOOLEAN DEFAULT TRUE,
    "autoApprovePreApproved" BOOLEAN DEFAULT FALSE,
    "maxOvertimeHoursPerWeek" INTEGER,
    "maxOvertimeHoursPerMonth" INTEGER,
    "isActive" BOOLEAN DEFAULT TRUE,
    "applicableDepartments" TEXT[],
    "applicableRoles" TEXT[],
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Overtime Requests table
CREATE TABLE IF NOT EXISTS overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" VARCHAR NOT NULL,
    "organizationId" VARCHAR NOT NULL,
    date DATE NOT NULL,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    hours DECIMAL(10,2) NOT NULL,
    "overtimeType" VARCHAR DEFAULT 'REGULAR',
    status VARCHAR DEFAULT 'PENDING',
    reason TEXT,
    "projectId" VARCHAR,
    "taskDescription" TEXT,
    "approvedBy" VARCHAR,
    "approvedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    multiplier DECIMAL(10,2),
    "calculatedPay" DECIMAL(10,2),
    "isPaid" BOOLEAN DEFAULT FALSE,
    "paidInPayrollId" VARCHAR,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Shifts indexes
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts("employeeId");
CREATE INDEX IF NOT EXISTS idx_shifts_rota ON shifts("rotaId");
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON shifts("startTime");
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

-- Recognitions indexes
CREATE INDEX IF NOT EXISTS idx_recognitions_recipient ON recognitions("recipientId");
CREATE INDEX IF NOT EXISTS idx_recognitions_giver ON recognitions("giverId");
CREATE INDEX IF NOT EXISTS idx_recognitions_created ON recognitions("createdAt");

-- Offboarding indexes
CREATE INDEX IF NOT EXISTS idx_offboarding_employee ON offboarding_processes("employeeId");
CREATE INDEX IF NOT EXISTS idx_offboarding_status ON offboarding_processes(status);
CREATE INDEX IF NOT EXISTS idx_offboarding_last_day ON offboarding_processes("lastWorkingDay");

-- Overtime indexes
CREATE INDEX IF NOT EXISTS idx_overtime_employee ON overtime_requests("employeeId");
CREATE INDEX IF NOT EXISTS idx_overtime_date ON overtime_requests(date);
CREATE INDEX IF NOT EXISTS idx_overtime_status ON overtime_requests(status);

-- =============================================
-- GRANT PERMISSIONS (adjust as needed)
-- =============================================

-- Grant permissions to your database user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

SELECT 'Migration completed successfully!' AS status;
