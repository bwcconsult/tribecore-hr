-- Migration: Create Sign Module
-- Description: Adds e-signature functionality with documents, templates, sign forms, and activity logs
-- Date: 2025-10-13

-- =================================================================
-- DOCUMENTS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS sign_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled', 'in_progress', 'completed', 'declined', 'expired', 'recalled')),
    type VARCHAR(20) DEFAULT 'send_for_signatures' CHECK (type IN ('send_for_signatures', 'sign_yourself', 'template', 'bulk_send')),
    created_by UUID NOT NULL,
    template_id UUID,
    note_to_recipients TEXT,
    send_in_order BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for documents
CREATE INDEX idx_sign_documents_created_by ON sign_documents(created_by);
CREATE INDEX idx_sign_documents_status ON sign_documents(status);
CREATE INDEX idx_sign_documents_type ON sign_documents(type);
CREATE INDEX idx_sign_documents_sent_at ON sign_documents(sent_at);

-- =================================================================
-- RECIPIENTS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS sign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(30) DEFAULT 'needs_to_sign' CHECK (role IN ('needs_to_sign', 'in_person_signer', 'signs_with_witness', 'manages_recipients', 'approver', 'receives_copy')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'declined', 'completed')),
    delivery_method VARCHAR(20) DEFAULT 'email' CHECK (delivery_method IN ('email', 'email_sms', 'link')),
    order_number INTEGER DEFAULT 1,
    signature_token VARCHAR(255),
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    signed_at TIMESTAMP,
    decline_reason TEXT,
    signature_data TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipient_document FOREIGN KEY (document_id) REFERENCES sign_documents(id) ON DELETE CASCADE
);

-- Indexes for recipients
CREATE INDEX idx_sign_recipients_document ON sign_recipients(document_id);
CREATE INDEX idx_sign_recipients_email ON sign_recipients(email);
CREATE INDEX idx_sign_recipients_status ON sign_recipients(status);

-- =================================================================
-- TEMPLATES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS sign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_url TEXT,
    owner_id UUID NOT NULL,
    active_sign_forms INTEGER DEFAULT 0,
    fields JSONB,
    settings JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_template_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for templates
CREATE INDEX idx_sign_templates_owner ON sign_templates(owner_id);
CREATE INDEX idx_sign_templates_active ON sign_templates(is_active);

-- =================================================================
-- SIGNFORMS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS sign_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    template_id UUID,
    owner_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'limit_reached')),
    valid_until TIMESTAMP,
    require_otp BOOLEAN DEFAULT FALSE,
    response_limit INTEGER,
    response_count INTEGER DEFAULT 0,
    avoid_duplicates BOOLEAN DEFAULT FALSE,
    duplicate_check_days INTEGER DEFAULT 7,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_signform_template FOREIGN KEY (template_id) REFERENCES sign_templates(id) ON DELETE SET NULL,
    CONSTRAINT fk_signform_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for sign forms
CREATE INDEX idx_sign_forms_template ON sign_forms(template_id);
CREATE INDEX idx_sign_forms_owner ON sign_forms(owner_id);
CREATE INDEX idx_sign_forms_status ON sign_forms(status);

-- =================================================================
-- ACTIVITY LOGS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS sign_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    user_id UUID,
    activity VARCHAR(50) NOT NULL CHECK (activity IN (
        'document_created', 'document_sent', 'document_viewed', 'document_signed',
        'document_declined', 'document_completed', 'document_recalled', 'document_expired',
        'document_scheduled', 'recipient_added', 'recipient_removed', 'reminder_sent', 'access_failed'
    )),
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_document FOREIGN KEY (document_id) REFERENCES sign_documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for activity logs
CREATE INDEX idx_sign_activity_document ON sign_activity_logs(document_id);
CREATE INDEX idx_sign_activity_user ON sign_activity_logs(user_id);
CREATE INDEX idx_sign_activity_type ON sign_activity_logs(activity);
CREATE INDEX idx_sign_activity_performed_at ON sign_activity_logs(performed_at);

-- =================================================================
-- USER SIGNATURES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS sign_user_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    signature_data TEXT,
    initial_data TEXT,
    stamp_data TEXT,
    company VARCHAR(255),
    job_title VARCHAR(255),
    date_format VARCHAR(50) DEFAULT 'MMM dd yyyy HH:mm:ss',
    time_zone VARCHAR(100) DEFAULT 'Europe/London',
    delegate_enabled BOOLEAN DEFAULT FALSE,
    delegate_user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_signature_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_signature_delegate FOREIGN KEY (delegate_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for user signatures
CREATE INDEX idx_sign_user_signatures_user ON sign_user_signatures(user_id);

-- =================================================================
-- TRIGGERS FOR UPDATED_AT
-- =================================================================

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_sign_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_sign_documents_updated_at ON sign_documents;
CREATE TRIGGER update_sign_documents_updated_at
    BEFORE UPDATE ON sign_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_sign_updated_at_column();

DROP TRIGGER IF EXISTS update_sign_recipients_updated_at ON sign_recipients;
CREATE TRIGGER update_sign_recipients_updated_at
    BEFORE UPDATE ON sign_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_sign_updated_at_column();

DROP TRIGGER IF EXISTS update_sign_templates_updated_at ON sign_templates;
CREATE TRIGGER update_sign_templates_updated_at
    BEFORE UPDATE ON sign_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_sign_updated_at_column();

DROP TRIGGER IF EXISTS update_sign_forms_updated_at ON sign_forms;
CREATE TRIGGER update_sign_forms_updated_at
    BEFORE UPDATE ON sign_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_sign_updated_at_column();

DROP TRIGGER IF EXISTS update_sign_user_signatures_updated_at ON sign_user_signatures;
CREATE TRIGGER update_sign_user_signatures_updated_at
    BEFORE UPDATE ON sign_user_signatures
    FOR EACH ROW
    EXECUTE FUNCTION update_sign_updated_at_column();

-- =================================================================
-- ROLLBACK SCRIPT (for reference)
-- =================================================================
-- To rollback this migration, run:
--
-- DROP TABLE IF EXISTS sign_activity_logs CASCADE;
-- DROP TABLE IF EXISTS sign_user_signatures CASCADE;
-- DROP TABLE IF EXISTS sign_recipients CASCADE;
-- DROP TABLE IF EXISTS sign_forms CASCADE;
-- DROP TABLE IF EXISTS sign_templates CASCADE;
-- DROP TABLE IF EXISTS sign_documents CASCADE;
-- DROP FUNCTION IF EXISTS update_sign_updated_at_column CASCADE;

COMMIT;
