-- Migration to create Health & Safety module tables
-- Risk Management, Incident Reporting, COSHH, Method Statements, Responsibilities, Audit Trail

-- =============================================
-- RISK ASSESSMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "referenceNumber" VARCHAR UNIQUE NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR NOT NULL,
    department VARCHAR NOT NULL,
    "affectedPersons" TEXT[],
    "assessedBy" VARCHAR NOT NULL,
    "reviewedBy" VARCHAR,
    "approvedBy" VARCHAR,
    "assessmentDate" DATE NOT NULL,
    "reviewDate" DATE,
    "nextReviewDate" DATE,
    status VARCHAR DEFAULT 'DRAFT',
    hazards JSONB NOT NULL,
    attachments TEXT[],
    "relatedDocuments" TEXT[],
    "templateId" VARCHAR,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INCIDENTS & ACCIDENTS
-- =============================================

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "incidentNumber" VARCHAR UNIQUE NOT NULL,
    type VARCHAR NOT NULL,
    severity VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'REPORTED',
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    "incidentDateTime" TIMESTAMP NOT NULL,
    location VARCHAR NOT NULL,
    "specificLocation" VARCHAR,
    "reportedBy" VARCHAR NOT NULL,
    "witnessedBy" VARCHAR,
    "personsInvolved" TEXT[],
    witnesses TEXT[],
    "immediateAction" TEXT,
    "injuryDetails" TEXT,
    "medicalTreatmentRequired" BOOLEAN DEFAULT FALSE,
    "hospitalVisit" BOOLEAN DEFAULT FALSE,
    "daysLost" INTEGER DEFAULT 0,
    "isRIDDORReportable" BOOLEAN DEFAULT FALSE,
    "riddorReference" VARCHAR,
    "riddorReportedDate" DATE,
    "investigationOfficer" VARCHAR,
    "rootCause" TEXT,
    "contributingFactors" TEXT,
    "correctiveActions" JSONB,
    photos TEXT[],
    documents TEXT[],
    "costImpact" JSONB,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- HAZARDOUS SUBSTANCES (COSHH)
-- =============================================

CREATE TABLE IF NOT EXISTS hazardous_substances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "substanceCode" VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    "chemicalName" VARCHAR,
    "casNumber" VARCHAR,
    "hazardClasses" TEXT[] NOT NULL,
    description TEXT NOT NULL,
    locations TEXT[],
    "quantityStored" DECIMAL(10,2),
    unit VARCHAR,
    supplier VARCHAR,
    manufacturer VARCHAR,
    "safetyDataSheets" TEXT[],
    "healthHazards" TEXT,
    "physicalHazards" TEXT,
    "environmentalHazards" TEXT,
    "controlMeasures" JSONB NOT NULL,
    "emergencyProcedures" TEXT,
    "firstAidMeasures" TEXT,
    "spillageProcedures" TEXT,
    "authorizedUsers" TEXT[],
    "coshhAssessmentId" VARCHAR,
    "lastReviewDate" DATE,
    "nextReviewDate" DATE,
    "isActive" BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- METHOD STATEMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS method_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "referenceNumber" VARCHAR UNIQUE NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    activity VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    project VARCHAR,
    client VARCHAR,
    "preparedBy" VARCHAR NOT NULL,
    "reviewedBy" VARCHAR,
    "approvedBy" VARCHAR,
    "issueDate" DATE NOT NULL,
    "reviewDate" DATE,
    version INTEGER DEFAULT 1,
    status VARCHAR DEFAULT 'DRAFT',
    scope JSONB NOT NULL,
    resources JSONB NOT NULL,
    sequence JSONB NOT NULL,
    "relatedRiskAssessments" TEXT[],
    permits TEXT[],
    "emergencyProcedures" TEXT,
    "environmentalConsiderations" TEXT,
    attachments TEXT[],
    diagrams TEXT[],
    "trainingRequirements" JSONB,
    "communicatedTo" TEXT[],
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- H&S RESPONSIBILITIES
-- =============================================

CREATE TABLE IF NOT EXISTS hs_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "assignedTo" VARCHAR NOT NULL,
    "assignedBy" VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL,
    "dueDate" DATE NOT NULL,
    "completedDate" DATE,
    status VARCHAR DEFAULT 'ASSIGNED',
    notes TEXT,
    "evidenceDocuments" TEXT[],
    "requiresTraining" BOOLEAN DEFAULT FALSE,
    "trainingCourses" TEXT[],
    "isRecurring" BOOLEAN DEFAULT FALSE,
    "recurrencePattern" VARCHAR,
    "nextRecurrenceDate" DATE,
    "checklistItems" JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- AUDIT TRAIL
-- =============================================

CREATE TABLE IF NOT EXISTS hs_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    module VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    "entityId" VARCHAR NOT NULL,
    "entityType" VARCHAR,
    "performedBy" VARCHAR NOT NULL,
    description TEXT,
    changes JSONB,
    "ipAddress" VARCHAR,
    "userAgent" VARCHAR,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_risk_assessments_org ON risk_assessments("organizationId");
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_next_review ON risk_assessments("nextReviewDate");

CREATE INDEX IF NOT EXISTS idx_incidents_org ON incidents("organizationId");
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents("incidentDateTime");
CREATE INDEX IF NOT EXISTS idx_incidents_riddor ON incidents("isRIDDORReportable");

CREATE INDEX IF NOT EXISTS idx_substances_org ON hazardous_substances("organizationId");
CREATE INDEX IF NOT EXISTS idx_substances_active ON hazardous_substances("isActive");

CREATE INDEX IF NOT EXISTS idx_method_statements_org ON method_statements("organizationId");
CREATE INDEX IF NOT EXISTS idx_method_statements_status ON method_statements(status);

CREATE INDEX IF NOT EXISTS idx_responsibilities_assigned ON hs_responsibilities("assignedTo");
CREATE INDEX IF NOT EXISTS idx_responsibilities_status ON hs_responsibilities(status);
CREATE INDEX IF NOT EXISTS idx_responsibilities_due ON hs_responsibilities("dueDate");

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON hs_audit_logs("organizationId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON hs_audit_logs("entityId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON hs_audit_logs("createdAt");

SELECT 'Health & Safety tables created successfully!' AS status;
