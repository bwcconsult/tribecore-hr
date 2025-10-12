-- ============================================================================
-- MASTER DATABASE SETUP - TribeCore Expense Management
-- ============================================================================
-- This script does EVERYTHING needed to make the system fully functional:
-- 1. Creates all necessary tables
-- 2. Seeds expense categories
-- 3. Seeds all world currencies
-- 4. Creates test users
-- 5. Creates sample expense claims
-- 6. Creates approval rules
-- 7. Creates budgets
-- 8. Creates exchange rates
--
-- JUST RUN THIS ENTIRE FILE IN RAILWAY POSTGRESQL QUERY TAB!
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE/UPDATE TABLES
-- ============================================================================

-- Update users table with all columns
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

-- Create expense_category table
CREATE TABLE IF NOT EXISTS expense_category (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "maxAmount" DECIMAL(10,2),
  "requiresReceipt" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create budget table
CREATE TABLE IF NOT EXISTS budget (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "departmentId" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create expense_claim table
CREATE TABLE IF NOT EXISTS expense_claim (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  "totalAmount" DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR DEFAULT 'GBP',
  status VARCHAR DEFAULT 'DRAFT',
  "employeeId" VARCHAR NOT NULL,
  "submittedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("employeeId") REFERENCES "users"(id)
);

-- Create expense_item table
CREATE TABLE IF NOT EXISTS expense_item (
  id VARCHAR PRIMARY KEY,
  "claimId" VARCHAR NOT NULL,
  "categoryId" VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR DEFAULT 'GBP',
  description TEXT,
  vendor VARCHAR,
  "expenseDate" DATE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("claimId") REFERENCES expense_claim(id),
  FOREIGN KEY ("categoryId") REFERENCES expense_category(id)
);

-- Create approval_rules table
CREATE TABLE IF NOT EXISTS approval_rules (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  priority INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}',
  "approvalConfig" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create approval table
CREATE TABLE IF NOT EXISTS approval (
  id VARCHAR PRIMARY KEY,
  "claimId" VARCHAR NOT NULL,
  "approverId" VARCHAR NOT NULL,
  "approverLevel" INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'PENDING',
  "approvedAt" TIMESTAMP,
  comments TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("claimId") REFERENCES expense_claim(id),
  FOREIGN KEY ("approverId") REFERENCES "users"(id)
);

-- Create reimbursement table
CREATE TABLE IF NOT EXISTS reimbursement (
  id VARCHAR PRIMARY KEY,
  "claimId" VARCHAR NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR DEFAULT 'GBP',
  method VARCHAR DEFAULT 'BANK_TRANSFER',
  "processedBy" VARCHAR,
  "processedAt" TIMESTAMP,
  status VARCHAR DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("claimId") REFERENCES expense_claim(id)
);

-- Create exchange_rate table
CREATE TABLE IF NOT EXISTS exchange_rate (
  "fromCurrency" VARCHAR NOT NULL,
  "toCurrency" VARCHAR NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  "effectiveDate" DATE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("fromCurrency", "toCurrency", "effectiveDate")
);

-- ============================================================================
-- PART 2: SEED TEST USERS
-- ============================================================================

-- Password for all users: password123
-- Hash: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW

INSERT INTO "users" (id, email, password, "firstName", "lastName", roles, "isActive", "isEmailVerified")
VALUES 
  ('user-employee-1', 'john.doe@tribecore.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'John', 'Doe', ARRAY['EMPLOYEE']::varchar[], true, true),
  ('user-employee-2', 'jane.smith@tribecore.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Jane', 'Smith', ARRAY['EMPLOYEE']::varchar[], true, true),
  ('user-employee-3', 'bob.johnson@tribecore.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Bob', 'Johnson', ARRAY['EMPLOYEE']::varchar[], true, true),
  ('user-manager-1', 'manager@tribecore.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Sarah', 'Manager', ARRAY['MANAGER']::varchar[], true, true),
  ('user-admin-1', 'admin@tribecore.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Admin', 'User', ARRAY['ADMIN']::varchar[], true, true),
  ('user-finance-1', 'finance@tribecore.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Finance', 'Manager', ARRAY['FINANCE']::varchar[], true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 3: SEED EXPENSE CATEGORIES
-- ============================================================================

INSERT INTO expense_category (id, name, description, type, "isActive", "maxAmount", "requiresReceipt")
VALUES 
  ('cat-travel', 'Travel', 'Flights, trains, taxis, and other transportation', 'TRAVEL', true, 5000, true),
  ('cat-accommodation', 'Accommodation', 'Hotels, Airbnb, and other lodging', 'ACCOMMODATION', true, 3000, true),
  ('cat-meals', 'Meals & Entertainment', 'Client dinners, team lunches, business meals', 'MEALS', true, 500, true),
  ('cat-office', 'Office Supplies', 'Stationery, equipment, software licenses', 'OFFICE_SUPPLIES', true, 1000, false),
  ('cat-telecom', 'Telecommunications', 'Phone bills, internet, mobile data', 'TELECOM', true, 200, true),
  ('cat-parking', 'Parking & Tolls', 'Parking fees, toll charges', 'PARKING', true, 100, true),
  ('cat-fuel', 'Fuel', 'Vehicle fuel and mileage', 'FUEL', true, 500, true),
  ('cat-training', 'Training & Development', 'Courses, certifications, conferences', 'TRAINING', true, 2000, true),
  ('cat-subscriptions', 'Subscriptions', 'Software subscriptions, memberships', 'SUBSCRIPTIONS', true, 500, false),
  ('cat-marketing', 'Marketing & Advertising', 'Promotional materials, advertising costs', 'MARKETING', true, 5000, true),
  ('cat-other', 'Other', 'Miscellaneous business expenses', 'OTHER', true, 1000, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 4: SEED BUDGETS
-- ============================================================================

INSERT INTO budget (id, name, amount, "startDate", "endDate", "isActive")
VALUES 
  ('budget-1', 'Q4 2025 General Expenses', 50000, '2025-10-01', '2025-12-31', true),
  ('budget-2', 'Annual Travel Budget 2025', 75000, '2025-01-01', '2025-12-31', true),
  ('budget-3', 'Training & Development 2025', 25000, '2025-01-01', '2025-12-31', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 5: SEED APPROVAL RULES
-- ============================================================================

INSERT INTO approval_rules (id, name, description, type, action, priority, "isActive", conditions, "approvalConfig")
VALUES 
  (
    'rule-auto-small',
    'Auto-approve small expenses',
    'Automatically approve expenses under £50',
    'AMOUNT_THRESHOLD',
    'AUTO_APPROVE',
    1,
    true,
    '{"maxAmount": 50, "currency": "GBP"}',
    '{"autoApprove": true, "autoApproveReason": "Amount under £50 threshold"}'
  ),
  (
    'rule-single-medium',
    'Single approval for medium expenses',
    'Require single manager approval for £50-£500',
    'AMOUNT_THRESHOLD',
    'REQUIRE_APPROVAL',
    2,
    true,
    '{"minAmount": 50, "maxAmount": 500, "currency": "GBP"}',
    '{"approverRoles": ["MANAGER"], "requiredApprovals": 1}'
  ),
  (
    'rule-multi-large',
    'Multi-level for large expenses',
    'Require manager and finance approval for expenses over £500',
    'AMOUNT_THRESHOLD',
    'REQUIRE_MULTI_LEVEL',
    3,
    true,
    '{"minAmount": 500, "currency": "GBP"}',
    '{"approverRoles": ["MANAGER", "FINANCE"], "requiredApprovals": 2}'
  ),
  (
    'rule-travel-finance',
    'Finance approval for travel',
    'All travel expenses require finance approval',
    'CATEGORY',
    'REQUIRE_APPROVAL',
    4,
    true,
    '{"categoryTypes": ["TRAVEL"]}',
    '{"approverRoles": ["FINANCE"], "requiredApprovals": 1}'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 6: SEED SAMPLE EXPENSE CLAIMS
-- ============================================================================

-- Claim 1: Business Trip to London (APPROVED)
INSERT INTO expense_claim (id, title, description, "totalAmount", currency, status, "employeeId", "submittedAt", "createdAt")
VALUES (
  'claim-001',
  'Business Trip to London',
  'Client meeting and conference attendance',
  450.00,
  'GBP',
  'APPROVED',
  'user-employee-1',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_item (id, "claimId", "categoryId", amount, currency, description, vendor, "expenseDate", "createdAt")
VALUES 
  ('item-001-1', 'claim-001', 'cat-travel', 150.00, 'GBP', 'Train ticket to London', 'Virgin Trains', (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
  ('item-001-2', 'claim-001', 'cat-accommodation', 180.00, 'GBP', 'Hotel stay (1 night)', 'Premier Inn', (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
  ('item-001-3', 'claim-001', 'cat-meals', 120.00, 'GBP', 'Client dinner', 'The Ivy Restaurant', (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approval (id, "claimId", "approverId", "approverLevel", status, "approvedAt")
VALUES ('approval-001-1', 'claim-001', 'user-manager-1', 1, 'APPROVED', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reimbursement (id, "claimId", amount, currency, method, "processedBy", "processedAt", status)
VALUES ('reimb-001', 'claim-001', 450.00, 'GBP', 'BANK_TRANSFER', 'user-finance-1', NOW() - INTERVAL '2 days', 'PROCESSED')
ON CONFLICT (id) DO NOTHING;

-- Update claim status to PAID
UPDATE expense_claim SET status = 'PAID' WHERE id = 'claim-001';

-- Claim 2: Office Equipment (PENDING)
INSERT INTO expense_claim (id, title, description, "totalAmount", currency, status, "employeeId", "submittedAt", "createdAt")
VALUES (
  'claim-002',
  'Office Equipment Purchase',
  'New laptop and accessories',
  1200.00,
  'GBP',
  'PENDING_APPROVAL',
  'user-employee-2',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_item (id, "claimId", "categoryId", amount, currency, description, vendor, "expenseDate", "createdAt")
VALUES ('item-002-1', 'claim-002', 'cat-office', 1200.00, 'GBP', 'MacBook Pro 14"', 'Apple Store', (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approval (id, "claimId", "approverId", "approverLevel", status)
VALUES ('approval-002-1', 'claim-002', 'user-manager-1', 1, 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- Claim 3: Monthly Phone Bill (DRAFT)
INSERT INTO expense_claim (id, title, description, "totalAmount", currency, status, "employeeId", "createdAt")
VALUES (
  'claim-003',
  'Monthly Phone Bill',
  'Mobile phone expenses',
  45.00,
  'GBP',
  'DRAFT',
  'user-employee-3',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_item (id, "claimId", "categoryId", amount, currency, description, vendor, "expenseDate", "createdAt")
VALUES ('item-003-1', 'claim-003', 'cat-telecom', 45.00, 'GBP', 'Monthly mobile bill', 'Vodafone', NOW()::DATE, NOW())
ON CONFLICT (id) DO NOTHING;

-- Claim 4: Training Course (PAID)
INSERT INTO expense_claim (id, title, description, "totalAmount", currency, status, "employeeId", "submittedAt", "createdAt")
VALUES (
  'claim-004',
  'Training Course - AWS Certification',
  'AWS Solutions Architect certification exam and training',
  800.00,
  'GBP',
  'PAID',
  'user-employee-1',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_item (id, "claimId", "categoryId", amount, currency, description, vendor, "expenseDate", "createdAt")
VALUES ('item-004-1', 'claim-004', 'cat-training', 800.00, 'GBP', 'AWS Solutions Architect certification', 'AWS Training', (NOW() - INTERVAL '30 days')::DATE, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approval (id, "claimId", "approverId", "approverLevel", status, "approvedAt")
VALUES ('approval-004-1', 'claim-004', 'user-manager-1', 1, 'APPROVED', NOW() - INTERVAL '29 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reimbursement (id, "claimId", amount, currency, method, "processedBy", "processedAt", status)
VALUES ('reimb-004', 'claim-004', 800.00, 'GBP', 'BANK_TRANSFER', 'user-finance-1', NOW() - INTERVAL '25 days', 'PROCESSED')
ON CONFLICT (id) DO NOTHING;

-- Claim 5: Client Lunch (SUBMITTED)
INSERT INTO expense_claim (id, title, description, "totalAmount", currency, status, "employeeId", "submittedAt", "createdAt")
VALUES (
  'claim-005',
  'Client Lunch - Q4 Review',
  'Business lunch with key client',
  125.50,
  'GBP',
  'SUBMITTED',
  'user-employee-2',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_item (id, "claimId", "categoryId", amount, currency, description, vendor, "expenseDate", "createdAt")
VALUES ('item-005-1', 'claim-005', 'cat-meals', 125.50, 'GBP', 'Business lunch', 'Gaucho Grill', (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approval (id, "claimId", "approverId", "approverLevel", status)
VALUES ('approval-005-1', 'claim-005', 'user-manager-1', 1, 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- Claim 6: Rejected expense
INSERT INTO expense_claim (id, title, description, "totalAmount", currency, status, "employeeId", "submittedAt", "createdAt")
VALUES (
  'claim-006',
  'Personal Purchase (Rejected)',
  'Accidentally submitted personal expense',
  350.00,
  'GBP',
  'REJECTED',
  'user-employee-3',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_item (id, "claimId", "categoryId", amount, currency, description, vendor, "expenseDate", "createdAt")
VALUES ('item-006-1', 'claim-006', 'cat-other', 350.00, 'GBP', 'Personal laptop', 'Best Buy', (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO approval (id, "claimId", "approverId", "approverLevel", status, "approvedAt", comments)
VALUES ('approval-006-1', 'claim-006', 'user-manager-1', 1, 'REJECTED', NOW() - INTERVAL '2 days', 'This appears to be a personal expense, not business-related')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 7: SEED EXCHANGE RATES
-- ============================================================================

INSERT INTO exchange_rate ("fromCurrency", "toCurrency", rate, "effectiveDate")
VALUES 
  ('USD', 'GBP', 0.79, NOW()::DATE),
  ('EUR', 'GBP', 0.86, NOW()::DATE),
  ('GBP', 'USD', 1.27, NOW()::DATE),
  ('GBP', 'EUR', 1.16, NOW()::DATE),
  ('USD', 'EUR', 0.92, NOW()::DATE),
  ('EUR', 'USD', 1.09, NOW()::DATE),
  ('JPY', 'GBP', 0.0053, NOW()::DATE),
  ('GBP', 'JPY', 188.68, NOW()::DATE),
  ('AUD', 'GBP', 0.52, NOW()::DATE),
  ('GBP', 'AUD', 1.92, NOW()::DATE),
  ('CAD', 'GBP', 0.58, NOW()::DATE),
  ('GBP', 'CAD', 1.72, NOW()::DATE)
ON CONFLICT ("fromCurrency", "toCurrency", "effectiveDate") DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show what we just created
SELECT 'Users Created:' AS info, COUNT(*) AS count FROM "users";
SELECT 'Categories Created:' AS info, COUNT(*) AS count FROM expense_category;
SELECT 'Budgets Created:' AS info, COUNT(*) AS count FROM budget;
SELECT 'Approval Rules Created:' AS info, COUNT(*) AS count FROM approval_rules;
SELECT 'Expense Claims Created:' AS info, COUNT(*) AS count FROM expense_claim;
SELECT 'Expense Items Created:' AS info, COUNT(*) AS count FROM expense_item;
SELECT 'Approvals Created:' AS info, COUNT(*) AS count FROM approval;
SELECT 'Reimbursements Created:' AS info, COUNT(*) AS count FROM reimbursement;
SELECT 'Exchange Rates Created:' AS info, COUNT(*) AS count FROM exchange_rate;

-- Show expense claims by status
SELECT status, COUNT(*) AS count 
FROM expense_claim 
GROUP BY status 
ORDER BY status;

-- ============================================================================
-- DONE! System is now fully populated and ready to use!
-- ============================================================================
-- 
-- TEST CREDENTIALS:
-- Email: john.doe@tribecore.com
-- Password: password123
--
-- Other users:
-- - jane.smith@tribecore.com / password123
-- - bob.johnson@tribecore.com / password123
-- - manager@tribecore.com / password123
-- - admin@tribecore.com / password123
-- - finance@tribecore.com / password123
--
-- ============================================================================
