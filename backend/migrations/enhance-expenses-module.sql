-- Enhanced Expenses Module Migration
-- This migration adds Trips, Mileage, Delegates, and Out-of-Office functionality

-- =============================================
-- TRIPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" VARCHAR(255) NOT NULL,
    "employeeId" VARCHAR(255) NOT NULL,
    "tripNumber" VARCHAR(100) NOT NULL UNIQUE,
    "tripName" VARCHAR(255) NOT NULL,
    "tripType" VARCHAR(50) NOT NULL CHECK ("tripType" IN ('DOMESTIC', 'INTERNATIONAL')),
    "fromLocation" VARCHAR(255) NOT NULL,
    "toLocation" VARCHAR(255) NOT NULL,
    "destinationCountry" VARCHAR(100),
    "isVisaRequired" BOOLEAN DEFAULT FALSE,
    "businessPurpose" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    "travelPreferences" JSONB,
    "bookingOptions" JSONB,
    "estimatedCost" DECIMAL(15, 2),
    "actualCost" DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'GBP',
    "approvedBy" VARCHAR(255),
    "approvedAt" TIMESTAMP WITH TIME ZONE,
    "rejectionReason" TEXT,
    notes TEXT,
    documents JSONB,
    itinerary JSONB,
    "submittedBy" VARCHAR(255),
    "submittedAt" TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trips_organization ON trips("organizationId");
CREATE INDEX IF NOT EXISTS idx_trips_employee ON trips("employeeId");
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips("startDate", "endDate");
CREATE INDEX IF NOT EXISTS idx_trips_trip_type ON trips("tripType");

-- =============================================
-- MILEAGE CLAIMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS mileage_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" VARCHAR(255) NOT NULL,
    "employeeId" VARCHAR(255) NOT NULL,
    "expenseClaimId" VARCHAR(255),
    "mileageNumber" VARCHAR(100) NOT NULL UNIQUE,
    "travelDate" DATE NOT NULL,
    "vehicleType" VARCHAR(50) NOT NULL CHECK ("vehicleType" IN ('CAR', 'MOTORCYCLE', 'BICYCLE', 'VAN')),
    "vehicleRegistration" VARCHAR(50),
    "fromLocation" VARCHAR(255) NOT NULL,
    "toLocation" VARCHAR(255) NOT NULL,
    route JSONB,
    distance DECIMAL(10, 2) NOT NULL,
    "distanceUnit" VARCHAR(20) DEFAULT 'miles',
    "ratePerUnit" DECIMAL(10, 4) NOT NULL,
    "totalAmount" DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    purpose TEXT NOT NULL,
    description TEXT,
    "isRoundTrip" BOOLEAN DEFAULT FALSE,
    "hasPassengers" BOOLEAN DEFAULT FALSE,
    "passengerCount" INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')),
    "approvedBy" VARCHAR(255),
    "approvedAt" TIMESTAMP WITH TIME ZONE,
    "rejectionReason" TEXT,
    "gpsCoordinates" JSONB,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mileage_organization ON mileage_claims("organizationId");
CREATE INDEX IF NOT EXISTS idx_mileage_employee ON mileage_claims("employeeId");
CREATE INDEX IF NOT EXISTS idx_mileage_status ON mileage_claims(status);
CREATE INDEX IF NOT EXISTS idx_mileage_travel_date ON mileage_claims("travelDate");
CREATE INDEX IF NOT EXISTS idx_mileage_vehicle_type ON mileage_claims("vehicleType");

-- =============================================
-- EXPENSE DELEGATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS expense_delegates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" VARCHAR(255) NOT NULL,
    "employeeId" VARCHAR(255) NOT NULL,
    "delegateEmployeeId" VARCHAR(255) NOT NULL,
    permissions VARCHAR(50)[] NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "isActive" BOOLEAN DEFAULT TRUE,
    notes TEXT,
    "canApproveOnBehalf" BOOLEAN DEFAULT FALSE,
    "notifyOnAction" BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_delegates_employee ON expense_delegates("employeeId");
CREATE INDEX IF NOT EXISTS idx_expense_delegates_delegate ON expense_delegates("delegateEmployeeId");
CREATE INDEX IF NOT EXISTS idx_expense_delegates_active ON expense_delegates("isActive");

-- =============================================
-- EXPENSE OUT OF OFFICE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS expense_out_of_office (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organizationId" VARCHAR(255) NOT NULL,
    "employeeId" VARCHAR(255) NOT NULL,
    "substituteEmployeeId" VARCHAR(255) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
    "autoApprove" BOOLEAN DEFAULT TRUE,
    notes TEXT,
    "notifySubstitute" BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_ooo_employee ON expense_out_of_office("employeeId");
CREATE INDEX IF NOT EXISTS idx_expense_ooo_substitute ON expense_out_of_office("substituteEmployeeId");
CREATE INDEX IF NOT EXISTS idx_expense_ooo_dates ON expense_out_of_office("startDate", "endDate");
CREATE INDEX IF NOT EXISTS idx_expense_ooo_active ON expense_out_of_office("isActive");

-- =============================================
-- UPDATE EXPENSE CLAIMS TABLE
-- =============================================
ALTER TABLE expense_claims 
ADD COLUMN IF NOT EXISTS "tripId" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "hasPolicyViolations" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "claimNumber" VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_expense_claims_trip ON expense_claims("tripId");

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE trips IS 'Business travel requests and management';
COMMENT ON TABLE mileage_claims IS 'Employee mileage expense claims';
COMMENT ON TABLE expense_delegates IS 'Delegate permissions for expense management';
COMMENT ON TABLE expense_out_of_office IS 'Out of office expense approval substitutes';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Enhanced Expenses Module Migration Completed Successfully!';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   - trips (Business Travel Management)';
    RAISE NOTICE '   - mileage_claims (Mileage Tracking)';
    RAISE NOTICE '   - expense_delegates (Delegation System)';
    RAISE NOTICE '   - expense_out_of_office (OOO Management)';
    RAISE NOTICE '🔧 Enhanced: expense_claims table with trip linkage';
END $$;
