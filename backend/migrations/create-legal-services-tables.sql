-- Migration to create Legal Services module tables
-- Employment Law Advice, Document Library, HR Insurance

-- =============================================
-- LEGAL ADVICE REQUESTS
-- =============================================

CREATE TABLE IF NOT EXISTS legal_advice_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "requestNumber" VARCHAR UNIQUE NOT NULL,
    "requestedBy" VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    question TEXT NOT NULL,
    priority VARCHAR DEFAULT 'MEDIUM',
    status VARCHAR DEFAULT 'SUBMITTED',
    "assignedTo" VARCHAR,
    response TEXT,
    "respondedBy" VARCHAR,
    "respondedAt" TIMESTAMP,
    attachments TEXT[],
    "followUpQuestions" JSONB,
    "requires24x7Support" BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- DOCUMENT TEMPLATES
-- =============================================

CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL,
    tags TEXT[],
    content TEXT NOT NULL,
    placeholders JSONB,
    "isActive" BOOLEAN DEFAULT TRUE,
    "isSystemTemplate" BOOLEAN DEFAULT FALSE,
    "previewUrl" VARCHAR,
    "usageCount" INTEGER DEFAULT 0,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- HR INSURANCE CLAIMS
-- =============================================

CREATE TABLE IF NOT EXISTS hr_insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" VARCHAR NOT NULL,
    "claimNumber" VARCHAR UNIQUE NOT NULL,
    type VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'REPORTED',
    "employeeId" VARCHAR NOT NULL,
    "reportedBy" VARCHAR NOT NULL,
    "incidentDate" DATE NOT NULL,
    description TEXT NOT NULL,
    "claimAmount" DECIMAL(15,2),
    "approvedAmount" DECIMAL(15,2),
    "settlementAmount" DECIMAL(15,2),
    "insuranceProvider" VARCHAR,
    "policyNumber" VARCHAR,
    "claimReferenceNumber" VARCHAR,
    "supportingDocuments" TEXT[],
    "legalAdvice" TEXT,
    "assignedLawyer" VARCHAR,
    timeline JSONB,
    "outcomeNotes" TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_legal_advice_org ON legal_advice_requests("organizationId");
CREATE INDEX IF NOT EXISTS idx_legal_advice_status ON legal_advice_requests(status);
CREATE INDEX IF NOT EXISTS idx_legal_advice_priority ON legal_advice_requests(priority);

CREATE INDEX IF NOT EXISTS idx_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON document_templates("isActive");
CREATE INDEX IF NOT EXISTS idx_templates_usage ON document_templates("usageCount");

CREATE INDEX IF NOT EXISTS idx_claims_org ON hr_insurance_claims("organizationId");
CREATE INDEX IF NOT EXISTS idx_claims_status ON hr_insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_employee ON hr_insurance_claims("employeeId");

-- =============================================
-- SEED SYSTEM TEMPLATES
-- =============================================

INSERT INTO document_templates (name, description, category, tags, content, "isSystemTemplate", placeholders)
VALUES 
(
    'Employment Contract Template',
    'Standard employment contract for permanent employees',
    'CONTRACT',
    ARRAY['employment', 'contract', 'permanent'],
    '<h1>Employment Contract</h1><p>Between {{companyName}} and {{employeeName}}</p><p>Start Date: {{startDate}}</p><p>Job Title: {{jobTitle}}</p><p>Salary: {{salary}}</p>',
    TRUE,
    '[
        {"key": "companyName", "label": "Company Name", "type": "text", "required": true},
        {"key": "employeeName", "label": "Employee Name", "type": "text", "required": true},
        {"key": "startDate", "label": "Start Date", "type": "date", "required": true},
        {"key": "jobTitle", "label": "Job Title", "type": "text", "required": true},
        {"key": "salary", "label": "Annual Salary", "type": "number", "required": true}
    ]'::jsonb
),
(
    'Disciplinary Warning Letter',
    'Formal disciplinary warning letter template',
    'LETTER',
    ARRAY['disciplinary', 'warning', 'hr'],
    '<h1>Disciplinary Warning</h1><p>To: {{employeeName}}</p><p>Date: {{date}}</p><p>Subject: Formal Warning</p><p>Details: {{details}}</p>',
    TRUE,
    '[
        {"key": "employeeName", "label": "Employee Name", "type": "text", "required": true},
        {"key": "date", "label": "Date", "type": "date", "required": true},
        {"key": "details", "label": "Warning Details", "type": "text", "required": true}
    ]'::jsonb
),
(
    'Remote Working Policy',
    'Comprehensive remote/hybrid working policy',
    'POLICY',
    ARRAY['policy', 'remote', 'hybrid', 'flexible'],
    '<h1>Remote Working Policy</h1><p>Company: {{companyName}}</p><p>Effective Date: {{effectiveDate}}</p><p>This policy outlines...</p>',
    TRUE,
    '[
        {"key": "companyName", "label": "Company Name", "type": "text", "required": true},
        {"key": "effectiveDate", "label": "Effective Date", "type": "date", "required": true}
    ]'::jsonb
);

SELECT 'Legal Services tables created successfully!' AS status;
