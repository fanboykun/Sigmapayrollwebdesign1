-- ============================================================================
-- CLINIC MODULE - MASTER DATA TABLES
-- ============================================================================
-- Migration: 004_clinic_master_data.sql
-- Description: Creates master data tables for Clinic module
-- Author: Sigma Development Team
-- Created: 2025-11-03
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. MEDICINE CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_medicine_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clinic_medicine_categories IS 'Categories for medicines (antibiotics, analgesics, vitamins, etc)';

-- ============================================================================
-- 2. MEDICINES (Master Data Obat)
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES clinic_medicine_categories(id) ON DELETE SET NULL,
  dosage_form VARCHAR(50) NOT NULL, -- tablet, sirup, salep, injeksi, dll
  strength VARCHAR(50) NOT NULL, -- 500mg, 10ml, dll
  unit VARCHAR(20) NOT NULL, -- tablet, botol, tube, ampul, dll
  manufacturer VARCHAR(255),
  min_stock INTEGER DEFAULT 10,
  max_stock INTEGER,
  price_per_unit NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  require_prescription BOOLEAN DEFAULT false,
  description TEXT,
  side_effects TEXT,
  storage_conditions VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_min_stock_positive CHECK (min_stock >= 0),
  CONSTRAINT chk_max_stock_greater CHECK (max_stock IS NULL OR max_stock >= min_stock),
  CONSTRAINT chk_price_positive CHECK (price_per_unit >= 0)
);

COMMENT ON TABLE clinic_medicines IS 'Master data for medicines available in clinic';

-- Indexes
CREATE INDEX idx_clinic_medicines_code ON clinic_medicines(medicine_code);
CREATE INDEX idx_clinic_medicines_name ON clinic_medicines(name);
CREATE INDEX idx_clinic_medicines_category ON clinic_medicines(category_id);
CREATE INDEX idx_clinic_medicines_active ON clinic_medicines(is_active) WHERE is_active = true;

-- ============================================================================
-- 3. SUPPLIERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  npwp VARCHAR(20),
  payment_terms VARCHAR(100), -- COD, 30 days, 60 days, dll
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clinic_suppliers IS 'Suppliers/distributors for medicines';

-- Indexes
CREATE INDEX idx_clinic_suppliers_code ON clinic_suppliers(supplier_code);
CREATE INDEX idx_clinic_suppliers_name ON clinic_suppliers(name);
CREATE INDEX idx_clinic_suppliers_active ON clinic_suppliers(is_active) WHERE is_active = true;

-- ============================================================================
-- 4. DOCTORS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  doctor_code VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  str_number VARCHAR(50) NOT NULL UNIQUE, -- Surat Tanda Registrasi
  sip_number VARCHAR(50), -- Surat Izin Praktik
  specialization VARCHAR(100) NOT NULL, -- Umum, Gigi, Spesialis, dll
  phone VARCHAR(20),
  email VARCHAR(255),
  schedule JSONB, -- JSON for weekly schedule
  is_active BOOLEAN DEFAULT true,
  is_external BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clinic_doctors IS 'Doctors working at the clinic';
COMMENT ON COLUMN clinic_doctors.schedule IS 'Weekly schedule in JSON format: {"monday": {"start": "08:00", "end": "16:00"}, ...}';

-- Indexes
CREATE INDEX idx_clinic_doctors_code ON clinic_doctors(doctor_code);
CREATE INDEX idx_clinic_doctors_user ON clinic_doctors(user_id);
CREATE INDEX idx_clinic_doctors_employee ON clinic_doctors(employee_id);
CREATE INDEX idx_clinic_doctors_active ON clinic_doctors(is_active) WHERE is_active = true;

-- ============================================================================
-- 5. NURSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_nurses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  nurse_code VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  str_number VARCHAR(50), -- Surat Tanda Registrasi Perawat
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clinic_nurses IS 'Nurses working at the clinic';

-- Indexes
CREATE INDEX idx_clinic_nurses_code ON clinic_nurses(nurse_code);
CREATE INDEX idx_clinic_nurses_user ON clinic_nurses(user_id);
CREATE INDEX idx_clinic_nurses_employee ON clinic_nurses(employee_id);
CREATE INDEX idx_clinic_nurses_active ON clinic_nurses(is_active) WHERE is_active = true;

-- ============================================================================
-- 6. DISEASES (Master Data Penyakit/Diagnosa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icd10_code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_common BOOLEAN DEFAULT false, -- For quick select in examination
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clinic_diseases IS 'Master data for diseases/diagnoses using ICD-10 codes';
COMMENT ON COLUMN clinic_diseases.is_common IS 'Mark common diseases for quick selection';

-- Indexes
CREATE INDEX idx_clinic_diseases_icd10 ON clinic_diseases(icd10_code);
CREATE INDEX idx_clinic_diseases_name ON clinic_diseases(name);
CREATE INDEX idx_clinic_diseases_common ON clinic_diseases(is_common) WHERE is_common = true;
CREATE INDEX idx_clinic_diseases_active ON clinic_diseases(is_active) WHERE is_active = true;

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_clinic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to all tables
CREATE TRIGGER trg_clinic_medicine_categories_updated_at
  BEFORE UPDATE ON clinic_medicine_categories
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_medicines_updated_at
  BEFORE UPDATE ON clinic_medicines
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_suppliers_updated_at
  BEFORE UPDATE ON clinic_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_doctors_updated_at
  BEFORE UPDATE ON clinic_doctors
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_nurses_updated_at
  BEFORE UPDATE ON clinic_nurses
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_diseases_updated_at
  BEFORE UPDATE ON clinic_diseases
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

-- ============================================================================
-- END OF MIGRATION: 004_clinic_master_data.sql
-- ============================================================================
