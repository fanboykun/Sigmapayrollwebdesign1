-- ============================================================================
-- CLINIC MODULE - INVENTORY MANAGEMENT TABLES
-- ============================================================================
-- Migration: 006_clinic_inventory.sql
-- Description: Creates tables for medicine inventory management
-- Author: Sigma Development Team
-- Created: 2025-11-03
-- ============================================================================

-- ============================================================================
-- 1. MEDICINE RECEIVING (Create first to avoid forward reference)
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_receiving_seq START 1;

CREATE TABLE IF NOT EXISTS clinic_medicine_receiving (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiving_number VARCHAR(50) NOT NULL UNIQUE,
  receiving_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id UUID NOT NULL REFERENCES clinic_suppliers(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(50),
  po_number VARCHAR(50), -- Purchase Order number
  total_items INTEGER DEFAULT 0,
  total_quantity INTEGER DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  received_by UUID NOT NULL REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, verified, posted
  document_url TEXT, -- URL to supporting documents
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_receiving_status CHECK (status IN ('draft', 'verified', 'posted')),
  CONSTRAINT chk_receiving_totals CHECK (
    total_items >= 0 AND total_quantity >= 0 AND total_amount >= 0
  )
);

COMMENT ON TABLE clinic_medicine_receiving IS 'Medicine receiving records from suppliers';

-- Indexes
CREATE INDEX idx_clinic_medicine_receiving_number ON clinic_medicine_receiving(receiving_number);
CREATE INDEX idx_clinic_medicine_receiving_supplier ON clinic_medicine_receiving(supplier_id);
CREATE INDEX idx_clinic_medicine_receiving_date ON clinic_medicine_receiving(receiving_date DESC);
CREATE INDEX idx_clinic_medicine_receiving_status ON clinic_medicine_receiving(status);

-- ============================================================================
-- 1A. MEDICINE RECEIVING DETAILS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_medicine_receiving_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiving_id UUID NOT NULL REFERENCES clinic_medicine_receiving(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES clinic_medicines(id) ON DELETE RESTRICT,
  batch_number VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  total_price NUMERIC(15,2) NOT NULL,
  expiry_date DATE NOT NULL,
  manufacturing_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_receiving_detail_quantity CHECK (quantity > 0),
  CONSTRAINT chk_receiving_detail_price CHECK (unit_price >= 0 AND total_price >= 0),
  CONSTRAINT chk_receiving_detail_dates CHECK (
    manufacturing_date IS NULL OR manufacturing_date < expiry_date
  )
);

COMMENT ON TABLE clinic_medicine_receiving_details IS 'Details of medicines in a receiving transaction';

-- Indexes
CREATE INDEX idx_clinic_medicine_receiving_details_receiving ON clinic_medicine_receiving_details(receiving_id);
CREATE INDEX idx_clinic_medicine_receiving_details_medicine ON clinic_medicine_receiving_details(medicine_id);

-- ============================================================================
-- 2. MEDICINE STOCK (NOW references receiving table which already exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_medicine_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES clinic_medicines(id) ON DELETE RESTRICT,
  batch_number VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- Quantity reserved for prescriptions
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - COALESCE(reserved_quantity, 0)) STORED,
  unit_price NUMERIC(15,2) NOT NULL,
  expiry_date DATE NOT NULL,
  manufacturing_date DATE,
  receiving_id UUID REFERENCES clinic_medicine_receiving(id) ON DELETE SET NULL,
  location VARCHAR(100), -- Storage location (e.g., "Rak A-1")
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- available, expired, damaged, recalled
  last_stock_check TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_medicine_batch UNIQUE (medicine_id, batch_number),
  CONSTRAINT chk_stock_quantities CHECK (
    quantity >= 0 AND
    reserved_quantity >= 0 AND
    reserved_quantity <= quantity
  ),
  CONSTRAINT chk_stock_price CHECK (unit_price >= 0),
  CONSTRAINT chk_stock_dates CHECK (
    manufacturing_date IS NULL OR manufacturing_date < expiry_date
  ),
  CONSTRAINT chk_stock_status CHECK (status IN ('available', 'expired', 'damaged', 'recalled'))
);

COMMENT ON TABLE clinic_medicine_stock IS 'Current medicine inventory stock with batch tracking';

-- Indexes
CREATE INDEX idx_clinic_medicine_stock_medicine ON clinic_medicine_stock(medicine_id);
CREATE INDEX idx_clinic_medicine_stock_batch ON clinic_medicine_stock(medicine_id, batch_number);
CREATE INDEX idx_clinic_medicine_stock_expiry ON clinic_medicine_stock(expiry_date);
CREATE INDEX idx_clinic_medicine_stock_status ON clinic_medicine_stock(status);
CREATE INDEX idx_clinic_medicine_stock_available ON clinic_medicine_stock(medicine_id)
  WHERE status = 'available' AND quantity > 0;

-- ============================================================================
-- 4. MEDICINE DISPENSING
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_medicine_dispensing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES clinic_prescriptions(id) ON DELETE CASCADE,
  prescription_detail_id UUID NOT NULL REFERENCES clinic_prescription_details(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES clinic_medicines(id) ON DELETE RESTRICT,
  batch_number VARCHAR(50) NOT NULL,
  quantity_dispensed INTEGER NOT NULL,
  expiry_date DATE NOT NULL,
  dispensed_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dispensed_by UUID NOT NULL REFERENCES users(id),
  patient_signature TEXT, -- Digital signature
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_dispensing_quantity CHECK (quantity_dispensed > 0)
);

COMMENT ON TABLE clinic_medicine_dispensing IS 'Records of medicine dispensing to patients';

-- Indexes
CREATE INDEX idx_clinic_medicine_dispensing_prescription ON clinic_medicine_dispensing(prescription_id);
CREATE INDEX idx_clinic_medicine_dispensing_medicine ON clinic_medicine_dispensing(medicine_id);
CREATE INDEX idx_clinic_medicine_dispensing_date ON clinic_medicine_dispensing(dispensed_date DESC);
CREATE INDEX idx_clinic_medicine_dispensing_batch ON clinic_medicine_dispensing(medicine_id, batch_number);

-- ============================================================================
-- 5. STOCK OPNAME
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_opname_seq START 1;

CREATE TABLE IF NOT EXISTS clinic_stock_opname (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_number VARCHAR(50) NOT NULL UNIQUE,
  opname_date DATE NOT NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, completed, approved
  total_items_checked INTEGER DEFAULT 0,
  total_variance INTEGER DEFAULT 0,
  performed_by UUID NOT NULL REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_opname_status CHECK (status IN ('draft', 'completed', 'approved')),
  CONSTRAINT chk_opname_period_month CHECK (period_month BETWEEN 1 AND 12),
  CONSTRAINT chk_opname_totals CHECK (total_items_checked >= 0 AND total_variance >= 0)
);

COMMENT ON TABLE clinic_stock_opname IS 'Periodic stock opname records';

-- Indexes
CREATE INDEX idx_clinic_stock_opname_number ON clinic_stock_opname(opname_number);
CREATE INDEX idx_clinic_stock_opname_date ON clinic_stock_opname(opname_date DESC);
CREATE INDEX idx_clinic_stock_opname_period ON clinic_stock_opname(period_year, period_month);
CREATE INDEX idx_clinic_stock_opname_status ON clinic_stock_opname(status);

-- ============================================================================
-- 6. STOCK OPNAME DETAILS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_stock_opname_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES clinic_stock_opname(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES clinic_medicines(id) ON DELETE RESTRICT,
  batch_number VARCHAR(50) NOT NULL,
  system_quantity INTEGER NOT NULL,
  physical_quantity INTEGER NOT NULL,
  variance INTEGER NOT NULL, -- physical - system
  variance_reason VARCHAR(100),
  adjustment_type VARCHAR(20) NOT NULL, -- plus, minus, none
  expiry_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_opname_quantities CHECK (
    system_quantity >= 0 AND physical_quantity >= 0
  ),
  CONSTRAINT chk_adjustment_type CHECK (adjustment_type IN ('plus', 'minus', 'none'))
);

COMMENT ON TABLE clinic_stock_opname_details IS 'Details of stock opname per medicine batch';

-- Indexes
CREATE INDEX idx_clinic_stock_opname_details_opname ON clinic_stock_opname_details(opname_id);
CREATE INDEX idx_clinic_stock_opname_details_medicine ON clinic_stock_opname_details(medicine_id);

-- ============================================================================
-- 7. STOCK REQUESTS (OPTIONAL - for approval workflow)
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_stock_request_seq START 1;

CREATE TABLE IF NOT EXISTS clinic_stock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) NOT NULL UNIQUE,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  requested_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, ordered
  approved_by UUID REFERENCES users(id),
  approved_date TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_stock_request_status CHECK (status IN ('pending', 'approved', 'rejected', 'ordered'))
);

COMMENT ON TABLE clinic_stock_requests IS 'Stock purchase requests requiring approval';

-- Indexes
CREATE INDEX idx_clinic_stock_requests_number ON clinic_stock_requests(request_number);
CREATE INDEX idx_clinic_stock_requests_date ON clinic_stock_requests(request_date DESC);
CREATE INDEX idx_clinic_stock_requests_status ON clinic_stock_requests(status);

-- ============================================================================
-- 8. STOCK REQUEST DETAILS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_stock_request_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES clinic_stock_requests(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES clinic_medicines(id) ON DELETE RESTRICT,
  current_stock INTEGER NOT NULL,
  requested_quantity INTEGER NOT NULL,
  approved_quantity INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_request_quantities CHECK (
    current_stock >= 0 AND
    requested_quantity > 0 AND
    (approved_quantity IS NULL OR approved_quantity >= 0)
  )
);

COMMENT ON TABLE clinic_stock_request_details IS 'Details of stock purchase requests';

-- Indexes
CREATE INDEX idx_clinic_stock_request_details_request ON clinic_stock_request_details(request_id);
CREATE INDEX idx_clinic_stock_request_details_medicine ON clinic_stock_request_details(medicine_id);

-- ============================================================================
-- TRIGGERS: Update updated_at timestamp
-- ============================================================================
CREATE TRIGGER trg_clinic_medicine_stock_updated_at
  BEFORE UPDATE ON clinic_medicine_stock
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_medicine_receiving_updated_at
  BEFORE UPDATE ON clinic_medicine_receiving
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_stock_opname_updated_at
  BEFORE UPDATE ON clinic_stock_opname
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_stock_requests_updated_at
  BEFORE UPDATE ON clinic_stock_requests
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

-- ============================================================================
-- END OF MIGRATION: 006_clinic_inventory.sql
-- ============================================================================
