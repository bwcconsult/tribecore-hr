-- Migration: Add Admin Expense Features
-- Description: Adds Advances and Batch Payments tables for admin expense management
-- Date: 2025-10-13

-- =================================================================
-- ADVANCES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS expense_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    date DATE NOT NULL,
    purpose TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'settled', 'unreported')),
    payment_method VARCHAR(20) DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cheque', 'cash', 'petty_cash')),
    reference VARCHAR(255),
    trip_id UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    settled_at TIMESTAMP,
    settled_amount DECIMAL(10, 2) DEFAULT 0,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_advance_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_advance_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    CONSTRAINT fk_advance_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for advances
CREATE INDEX idx_advances_employee ON expense_advances(employee_id);
CREATE INDEX idx_advances_status ON expense_advances(status);
CREATE INDEX idx_advances_date ON expense_advances(date);
CREATE INDEX idx_advances_trip ON expense_advances(trip_id);
CREATE INDEX idx_advances_approved_by ON expense_advances(approved_by);

-- =================================================================
-- BATCH PAYMENTS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS batch_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(255) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready_to_process', 'processing', 'completed', 'failed')),
    payment_method VARCHAR(20) DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cheque', 'direct_deposit')),
    payment_date DATE,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    item_count INT DEFAULT 0,
    created_by UUID NOT NULL,
    processed_by UUID,
    processed_at TIMESTAMP,
    items JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_batch_processor FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for batch payments
CREATE INDEX idx_batch_payments_status ON batch_payments(status);
CREATE INDEX idx_batch_payments_created_by ON batch_payments(created_by);
CREATE INDEX idx_batch_payments_payment_date ON batch_payments(payment_date);
CREATE INDEX idx_batch_payments_processed_by ON batch_payments(processed_by);

-- =================================================================
-- UPDATE EXISTING TABLES
-- =================================================================

-- Add batch payment reference to reimbursements if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expense_reimbursements' 
        AND column_name = 'batch_payment_id'
    ) THEN
        ALTER TABLE expense_reimbursements 
        ADD COLUMN batch_payment_id UUID,
        ADD CONSTRAINT fk_reimbursement_batch 
        FOREIGN KEY (batch_payment_id) REFERENCES batch_payments(id) ON DELETE SET NULL;
        
        CREATE INDEX idx_reimbursements_batch ON expense_reimbursements(batch_payment_id);
    END IF;
END $$;

-- =================================================================
-- TRIGGERS FOR UPDATED_AT
-- =================================================================

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to advances
DROP TRIGGER IF EXISTS update_expense_advances_updated_at ON expense_advances;
CREATE TRIGGER update_expense_advances_updated_at
    BEFORE UPDATE ON expense_advances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to batch payments
DROP TRIGGER IF EXISTS update_batch_payments_updated_at ON batch_payments;
CREATE TRIGGER update_batch_payments_updated_at
    BEFORE UPDATE ON batch_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- =================================================================

-- Insert sample advance (uncomment for development)
-- INSERT INTO expense_advances (employee_id, amount, currency, date, purpose, status)
-- SELECT id, 500.00, 'GBP', CURRENT_DATE, 'Business travel advance', 'pending'
-- FROM users LIMIT 1;

-- =================================================================
-- ROLLBACK SCRIPT (for reference)
-- =================================================================
-- To rollback this migration, run:
--
-- DROP TABLE IF EXISTS batch_payments CASCADE;
-- DROP TABLE IF EXISTS expense_advances CASCADE;
-- ALTER TABLE expense_reimbursements DROP COLUMN IF EXISTS batch_payment_id;

COMMIT;
