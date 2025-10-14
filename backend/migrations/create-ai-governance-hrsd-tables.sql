-- ============================================
-- TribeCore Enterprise HCM - Database Migration
-- Modules: AI Governance & HRSD
-- Date: October 14, 2025
-- ============================================

-- ==================== AI GOVERNANCE MODULE ====================

-- AI Systems Table
CREATE TABLE IF NOT EXISTS ai_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- System identification
  name VARCHAR(255) NOT NULL,
  description TEXT,
  vendor VARCHAR(255) NOT NULL,
  "vendorContact" VARCHAR(255),
  
  -- Risk classification
  "riskLevel" VARCHAR(50) NOT NULL CHECK ("riskLevel" IN ('MINIMAL', 'LIMITED', 'HIGH', 'UNACCEPTABLE')),
  "usageArea" VARCHAR(50) NOT NULL CHECK ("usageArea" IN ('RECRUITMENT', 'PERFORMANCE', 'SCHEDULING', 'PAYROLL', 'LEARNING', 'ATTRITION', 'CHATBOT', 'OTHER')),
  status VARCHAR(50) NOT NULL DEFAULT 'UNDER_REVIEW' CHECK (status IN ('ACTIVE', 'UNDER_REVIEW', 'DECOMMISSIONED', 'PROHIBITED')),
  
  -- Compliance
  "requiresHumanReview" BOOLEAN DEFAULT false,
  "hasTransparencyNotice" BOOLEAN DEFAULT false,
  "transparencyNoticeText" TEXT,
  "hasDataProtectionImpactAssessment" BOOLEAN DEFAULT false,
  "dpiaCompletedDate" DATE,
  "dpiaDocumentUrl" VARCHAR(500),
  
  -- Training data & model
  "trainingDataSources" TEXT,
  "modelVersion" VARCHAR(100),
  "lastModelUpdate" DATE,
  
  -- Bias testing
  "biasTested" BOOLEAN DEFAULT false,
  "lastBiasTestDate" DATE,
  "biasTestResults" JSONB,
  "performanceMetrics" JSONB,
  
  -- Human-in-the-loop
  "humanReviewConfig" JSONB,
  
  -- Logging
  "loggingEnabled" BOOLEAN DEFAULT false,
  "logRetentionDays" INTEGER DEFAULT 90,
  "auditLogLocation" VARCHAR(500),
  
  -- Prohibited practices
  "prohibitedPracticesCheck" JSONB,
  
  -- Ownership
  "ownerId" UUID,
  "ownerName" VARCHAR(255),
  "ownerEmail" VARCHAR(255),
  
  -- Review & certification
  "lastReviewDate" DATE,
  "nextReviewDate" DATE,
  certified BOOLEAN DEFAULT false,
  "certifiedBy" VARCHAR(255),
  "certificationDate" DATE,
  "certificationExpiryDate" DATE,
  
  -- Integration
  "apiEndpoint" VARCHAR(500),
  "integrationConfig" JSONB,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP
);

CREATE INDEX idx_ai_systems_org ON ai_systems("organizationId");
CREATE INDEX idx_ai_systems_risk ON ai_systems("riskLevel");
CREATE INDEX idx_ai_systems_status ON ai_systems(status);
CREATE INDEX idx_ai_systems_usage ON ai_systems("usageArea");

-- AI Decision Logs Table
CREATE TABLE IF NOT EXISTS ai_decision_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  "aiSystemId" UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
  
  -- Subject
  "subjectType" VARCHAR(100) NOT NULL,
  "subjectId" VARCHAR(255) NOT NULL,
  "subjectName" VARCHAR(255),
  
  -- Decision
  "decisionType" VARCHAR(100) NOT NULL,
  outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('APPROVED', 'REJECTED', 'FLAGGED', 'OVERRIDDEN')),
  "confidenceScore" DECIMAL(5,4),
  "aiOutput" JSONB NOT NULL,
  "inputData" JSONB,
  
  -- Human review
  "humanReviewed" BOOLEAN DEFAULT false,
  "reviewedBy" VARCHAR(255),
  "reviewerName" VARCHAR(255),
  "reviewedAt" TIMESTAMP,
  "reviewNotes" TEXT,
  overridden BOOLEAN DEFAULT false,
  "overrideReason" TEXT,
  "finalDecision" JSONB,
  
  -- Model info
  "modelVersion" VARCHAR(100),
  "modelEndpoint" VARCHAR(500),
  
  -- Audit
  "decisionTimestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "auditFlagged" BOOLEAN DEFAULT false,
  "auditNotes" TEXT,
  
  -- Feedback
  "feedbackReceived" BOOLEAN DEFAULT false,
  "outcomeTracking" JSONB,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_decisions_system ON ai_decision_logs("aiSystemId", "createdAt");
CREATE INDEX idx_ai_decisions_subject ON ai_decision_logs("subjectType", "subjectId");
CREATE INDEX idx_ai_decisions_timestamp ON ai_decision_logs("decisionTimestamp");


-- ==================== HRSD MODULE ====================

-- HR Cases Table
CREATE TABLE IF NOT EXISTS hr_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Case identification
  "caseNumber" VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "caseType" VARCHAR(50) NOT NULL CHECK ("caseType" IN ('GENERAL_INQUIRY', 'PAYROLL', 'BENEFITS', 'LEAVE', 'PERFORMANCE', 'ONBOARDING', 'OFFBOARDING', 'IT_ACCESS', 'EQUIPMENT', 'POLICY_QUESTION', 'DOCUMENT_REQUEST', 'EMPLOYEE_RELATIONS', 'OTHER')),
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_EMPLOYEE', 'PENDING_APPROVAL', 'RESOLVED', 'CLOSED', 'CANCELLED')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('PORTAL', 'EMAIL', 'SLACK', 'TEAMS', 'PHONE', 'WALK_IN')),
  
  -- Requester
  "employeeId" UUID NOT NULL REFERENCES employees(id),
  "requesterEmail" VARCHAR(255),
  "requesterPhone" VARCHAR(50),
  
  -- Assignment
  "assignedTo" UUID REFERENCES users(id),
  "assignedAt" TIMESTAMP,
  "assignedBy" VARCHAR(255),
  
  -- SLA tracking
  "createdTimestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "firstResponseAt" TIMESTAMP,
  "resolvedAt" TIMESTAMP,
  "closedAt" TIMESTAMP,
  "firstResponseSLA" INTEGER,
  "resolutionSLA" INTEGER,
  "slaBreached" BOOLEAN DEFAULT false,
  "slaBreachReason" TEXT,
  
  -- Resolution
  resolution TEXT,
  "resolvedBy" VARCHAR(255),
  "resolutionCategory" VARCHAR(100),
  
  -- Related items
  "relatedCaseId" UUID,
  "relatedDocuments" TEXT[],
  attachments TEXT[],
  
  -- KB deflection
  deflected BOOLEAN DEFAULT false,
  "suggestedArticles" TEXT[],
  
  -- Satisfaction
  "satisfactionScore" INTEGER CHECK ("satisfactionScore" BETWEEN 1 AND 5),
  "satisfactionComments" TEXT,
  "satisfactionSurveyCompletedAt" TIMESTAMP,
  
  -- Escalation
  escalated BOOLEAN DEFAULT false,
  "escalatedTo" VARCHAR(255),
  "escalatedAt" TIMESTAMP,
  "escalationReason" TEXT,
  
  -- Categorization
  tags TEXT[],
  category VARCHAR(100),
  subcategory VARCHAR(100),
  
  -- Metadata
  "customFields" JSONB,
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP
);

CREATE INDEX idx_hr_cases_org_status ON hr_cases("organizationId", status);
CREATE INDEX idx_hr_cases_employee ON hr_cases("employeeId", status);
CREATE INDEX idx_hr_cases_assigned ON hr_cases("assignedTo", status);
CREATE INDEX idx_hr_cases_created ON hr_cases("createdTimestamp");
CREATE INDEX idx_hr_cases_number ON hr_cases("caseNumber");

-- Case Comments Table
CREATE TABLE IF NOT EXISTS hr_case_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "caseId" UUID NOT NULL REFERENCES hr_cases(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  "authorId" UUID NOT NULL REFERENCES users(id),
  "authorName" VARCHAR(255) NOT NULL,
  "isInternal" BOOLEAN DEFAULT true,
  attachments TEXT[],
  "commentedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_comments_case ON hr_case_comments("caseId");

-- Case Activities Table
CREATE TABLE IF NOT EXISTS hr_case_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "caseId" UUID NOT NULL REFERENCES hr_cases(id) ON DELETE CASCADE,
  "activityType" VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  "performedBy" VARCHAR(255),
  "performedByName" VARCHAR(255),
  changes JSONB,
  "occurredAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_activities_case ON hr_case_activities("caseId", "createdAt");

-- Knowledge Articles Table
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Article identification
  "articleNumber" VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  
  -- Categorization
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  tags TEXT[],
  "relatedTopics" TEXT[],
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'INTERNAL', 'MANAGERS', 'SPECIFIC_GROUPS')),
  "visibleToGroups" TEXT[],
  
  -- Authoring
  "authorId" UUID NOT NULL REFERENCES users(id),
  "authorName" VARCHAR(255) NOT NULL,
  "lastEditedBy" VARCHAR(255),
  "lastEditedAt" TIMESTAMP,
  
  -- Publishing
  "publishedAt" TIMESTAMP,
  "publishedBy" VARCHAR(255),
  "archivedAt" TIMESTAMP,
  "archivedBy" VARCHAR(255),
  
  -- Analytics
  "viewCount" INTEGER DEFAULT 0,
  "helpfulCount" INTEGER DEFAULT 0,
  "notHelpfulCount" INTEGER DEFAULT 0,
  "deflectionCount" INTEGER DEFAULT 0,
  "averageRating" DECIMAL(3,2),
  "ratingCount" INTEGER DEFAULT 0,
  
  -- Search
  keywords TEXT[],
  "searchableText" TEXT,
  
  -- Related content
  "relatedArticles" TEXT[],
  attachments TEXT[],
  "videoLinks" TEXT[],
  
  -- Versioning
  version INTEGER DEFAULT 1,
  "previousVersionId" UUID,
  
  -- Review
  "lastReviewDate" DATE,
  "nextReviewDate" DATE,
  "reviewOwner" VARCHAR(255),
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP
);

CREATE INDEX idx_kb_articles_org_status ON knowledge_articles("organizationId", status);
CREATE INDEX idx_kb_articles_category ON knowledge_articles(category, subcategory);
CREATE INDEX idx_kb_articles_title ON knowledge_articles(title);
CREATE INDEX idx_kb_articles_number ON knowledge_articles("articleNumber");

-- Article Feedback Table
CREATE TABLE IF NOT EXISTS article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "articleId" UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id),
  helpful BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_article_feedback_article ON article_feedback("articleId", "createdAt");

-- ER Investigations Table
CREATE TABLE IF NOT EXISTS er_investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Investigation identification
  "caseNumber" VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "investigationType" VARCHAR(50) NOT NULL CHECK ("investigationType" IN ('HARASSMENT', 'DISCRIMINATION', 'BULLYING', 'MISCONDUCT', 'POLICY_VIOLATION', 'GRIEVANCE', 'COMPLAINT', 'WHISTLEBLOWER', 'OTHER')),
  severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(50) NOT NULL DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'PRELIMINARY_REVIEW', 'INVESTIGATION_STARTED', 'EVIDENCE_GATHERING', 'INTERVIEWS_SCHEDULED', 'ANALYSIS', 'CONCLUDED', 'OUTCOME_COMMUNICATED', 'CLOSED')),
  
  -- Parties
  "complainantId" UUID NOT NULL REFERENCES employees(id),
  "anonymousComplaint" BOOLEAN DEFAULT false,
  "respondentIds" TEXT[],
  "witnessIds" TEXT[],
  
  -- Investigation team (restricted access)
  "leadInvestigatorId" UUID NOT NULL REFERENCES users(id),
  "investigationTeam" TEXT[],
  "authorizedViewers" TEXT[],
  
  -- Dates & timeline
  "reportedDate" TIMESTAMP NOT NULL,
  "investigationStartDate" TIMESTAMP,
  "targetCompletionDate" TIMESTAMP,
  "concludedDate" TIMESTAMP,
  "closedDate" TIMESTAMP,
  
  -- Allegations
  allegations TEXT NOT NULL,
  "policiesViolated" TEXT[],
  "incidentDate" DATE,
  "incidentLocation" VARCHAR(255),
  
  -- Evidence (secure)
  "evidenceFiles" TEXT[],
  "evidenceLog" JSONB,
  
  -- Interviews
  interviews JSONB,
  
  -- Findings & outcome
  outcome VARCHAR(50) CHECK (outcome IN ('SUBSTANTIATED', 'PARTIALLY_SUBSTANTIATED', 'UNSUBSTANTIATED', 'INCONCLUSIVE', 'WITHDRAWN')),
  findings TEXT,
  recommendations TEXT,
  "actionsTaken" TEXT,
  "disciplinaryActions" JSONB,
  
  -- Legal & compliance
  "legalReviewRequired" BOOLEAN DEFAULT false,
  "legalReviewCompleted" BOOLEAN DEFAULT false,
  "legalReviewedBy" VARCHAR(255),
  "legalReviewDate" TIMESTAMP,
  "externalReportRequired" BOOLEAN DEFAULT false,
  "externalReportFiled" BOOLEAN DEFAULT false,
  "externalReportDate" DATE,
  "externalCaseNumber" VARCHAR(100),
  
  -- Confidentiality
  confidential BOOLEAN DEFAULT true,
  "confidentialityAgreements" TEXT,
  "accessLog" JSONB,
  
  -- Notifications
  "complainantNotified" BOOLEAN DEFAULT false,
  "complainantNotifiedAt" TIMESTAMP,
  "respondentNotified" BOOLEAN DEFAULT false,
  "respondentNotifiedAt" TIMESTAMP,
  
  -- Related items
  "relatedCaseId" UUID,
  "relatedInvestigationIds" VARCHAR(255),
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP
);

CREATE INDEX idx_er_investigations_org_status ON er_investigations("organizationId", status);
CREATE INDEX idx_er_investigations_number ON er_investigations("caseNumber");

-- ER Investigation Notes Table
CREATE TABLE IF NOT EXISTS er_investigation_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "investigationId" UUID NOT NULL REFERENCES er_investigations(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  "authorId" UUID NOT NULL REFERENCES users(id),
  "authorName" VARCHAR(255) NOT NULL,
  confidential BOOLEAN DEFAULT true,
  attachments TEXT[],
  "createdTimestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_er_notes_investigation ON er_investigation_notes("investigationId", "createdAt");

-- Employee Journeys Table
CREATE TABLE IF NOT EXISTS employee_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Journey identification
  "journeyId" VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "journeyType" VARCHAR(50) NOT NULL CHECK ("journeyType" IN ('NEW_HIRE', 'PARENTAL_LEAVE', 'RETURN_FROM_LEAVE', 'RELOCATION', 'PROMOTION', 'ROLE_CHANGE', 'SICK_LEAVE', 'BEREAVEMENT', 'RETIREMENT_PREP', 'OFFBOARDING', 'CUSTOM')),
  status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED')),
  
  -- Employee
  "employeeId" UUID NOT NULL REFERENCES employees(id),
  
  -- Dates
  "startDate" DATE NOT NULL,
  "expectedEndDate" DATE,
  "actualEndDate" DATE,
  "pausedDate" DATE,
  
  -- Milestones & tasks
  milestones JSONB,
  tasks JSONB,
  
  -- Progress
  "totalTasks" INTEGER DEFAULT 0,
  "completedTasks" INTEGER DEFAULT 0,
  "progressPercentage" DECIMAL(5,2) DEFAULT 0,
  
  -- Support & resources
  resources TEXT[],
  contacts TEXT[],
  "buddyId" UUID,
  "coachId" UUID,
  
  -- Communications
  communications JSONB,
  "automatedNotifications" TEXT[],
  
  -- Feedback
  "satisfactionScore" INTEGER CHECK ("satisfactionScore" BETWEEN 1 AND 5),
  feedback TEXT,
  "feedbackCollectedAt" TIMESTAMP,
  
  -- Metadata
  "customFields" JSONB,
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP
);

CREATE INDEX idx_journeys_org_status ON employee_journeys("organizationId", status);
CREATE INDEX idx_journeys_employee ON employee_journeys("employeeId", "journeyType");
CREATE INDEX idx_journeys_id ON employee_journeys("journeyId");

-- Journey Templates Table
CREATE TABLE IF NOT EXISTS journey_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "journeyType" VARCHAR(50) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "isDefault" BOOLEAN DEFAULT false,
  
  -- Template structure
  "durationDays" INTEGER,
  milestones JSONB NOT NULL,
  tasks JSONB NOT NULL,
  resources TEXT[],
  "automatedCommunications" JSONB,
  
  -- Metadata
  "createdBy" VARCHAR(255) NOT NULL,
  "lastModifiedBy" VARCHAR(255),
  metadata JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP
);

CREATE INDEX idx_journey_templates_org_type ON journey_templates("organizationId", "journeyType");

-- ============================================
-- Add Comments
-- ============================================

COMMENT ON TABLE ai_systems IS 'AI system registry for EU AI Act compliance';
COMMENT ON TABLE ai_decision_logs IS 'Audit log of all AI decisions with human-in-the-loop tracking';
COMMENT ON TABLE hr_cases IS 'HR service delivery case management (ServiceNow-style)';
COMMENT ON TABLE knowledge_articles IS 'Knowledge base for employee self-service';
COMMENT ON TABLE er_investigations IS 'Employee relations investigations with restricted access';
COMMENT ON TABLE employee_journeys IS 'Guided workflows for employee lifecycle moments';

-- ============================================
-- Migration Complete
-- ============================================
