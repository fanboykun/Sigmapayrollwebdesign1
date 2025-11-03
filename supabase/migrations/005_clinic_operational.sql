-- ============================================================================
-- CLINIC MODULE - OPERATIONAL TABLES
-- ============================================================================
-- Migration: 005_clinic_operational.sql
-- Description: Creates operational tables for patient management
-- Author: Sigma Development Team
-- Created: 2025-11-03
-- ============================================================================

-- ============================================================================
-- 1. PATIENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_code VARCHAR(50) NOT NULL UNIQUE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  patient_type VARCHAR(20) NOT NULL, -- 'employee' or 'family'
  full_name VARCHAR(255) NOT NULL,
  nik VARCHAR(20) UNIQUE,
  birth_date DATE NOT NULL,
  gender VARCHAR(10) NOT NULL, -- 'male' or 'female'
  blood_type VARCHAR(5), -- A, B, AB, O, A+, A-, etc
  phone VARCHAR(20),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  bpjs_number VARCHAR(20),
  insurance_type VARCHAR(50),
  allergies TEXT, -- Known allergies
  chronic_diseases TEXT, -- Chronic conditions
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_patient_type CHECK (patient_type IN ('employee', 'family')),
  CONSTRAINT chk_gender CHECK (gender IN ('male', 'female'))
);

COMMENT ON TABLE clinic_patients IS 'Patients (employees and their family members)';
COMMENT ON COLUMN clinic_patients.patient_type IS 'Type: employee or family member';

-- Indexes
CREATE INDEX idx_clinic_patients_code ON clinic_patients(patient_code);
CREATE INDEX idx_clinic_patients_employee ON clinic_patients(employee_id);
CREATE INDEX idx_clinic_patients_nik ON clinic_patients(nik);
CREATE INDEX idx_clinic_patients_type ON clinic_patients(patient_type);
CREATE INDEX idx_clinic_patients_active ON clinic_patients(is_active) WHERE is_active = true;

-- ============================================================================
-- 2. FAMILY MEMBERS (Link table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- istri, suami, anak, orang tua
  is_dependent BOOLEAN DEFAULT true, -- Tanggungan untuk BPJS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(employee_id, patient_id)
);

COMMENT ON TABLE clinic_family_members IS 'Links employees with their family member patients';

-- Indexes
CREATE INDEX idx_clinic_family_members_employee ON clinic_family_members(employee_id);
CREATE INDEX idx_clinic_family_members_patient ON clinic_family_members(patient_id);

-- ============================================================================
-- 3. VISITS
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_visit_seq START 1;

CREATE TABLE IF NOT EXISTS clinic_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_number VARCHAR(50) NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_time TIME NOT NULL DEFAULT CURRENT_TIME,
  queue_number INTEGER,
  chief_complaint TEXT NOT NULL, -- Keluhan utama
  visit_type VARCHAR(50) NOT NULL DEFAULT 'general', -- general, follow_up, emergency, mcu
  status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- waiting, in_progress, completed, cancelled
  registered_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_visit_type CHECK (visit_type IN ('general', 'follow_up', 'emergency', 'mcu')),
  CONSTRAINT chk_visit_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled'))
);

COMMENT ON TABLE clinic_visits IS 'Patient visit records';

-- Indexes
CREATE INDEX idx_clinic_visits_number ON clinic_visits(visit_number);
CREATE INDEX idx_clinic_visits_patient ON clinic_visits(patient_id);
CREATE INDEX idx_clinic_visits_date ON clinic_visits(visit_date DESC);
CREATE INDEX idx_clinic_visits_status ON clinic_visits(status);

-- ============================================================================
-- 4. MEDICAL RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL UNIQUE REFERENCES clinic_visits(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES clinic_doctors(id) ON DELETE RESTRICT,
  examination_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Vital Signs
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature NUMERIC(4,1),
  respiratory_rate INTEGER,
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  bmi NUMERIC(5,2),

  -- Medical Data
  anamnesis TEXT, -- Subjective
  physical_examination TEXT, -- Objective
  diagnosis_primary UUID NOT NULL REFERENCES clinic_diseases(id),
  diagnosis_secondary UUID REFERENCES clinic_diseases(id),
  diagnosis_notes TEXT,
  treatment_plan TEXT,
  follow_up_date DATE,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, completed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_blood_pressure CHECK (
    (blood_pressure_systolic IS NULL AND blood_pressure_diastolic IS NULL) OR
    (blood_pressure_systolic > blood_pressure_diastolic)
  ),
  CONSTRAINT chk_temperature CHECK (temperature IS NULL OR (temperature >= 30 AND temperature <= 45)),
  CONSTRAINT chk_medical_record_status CHECK (status IN ('draft', 'completed'))
);

COMMENT ON TABLE clinic_medical_records IS 'Medical examination records by doctors';

-- Indexes
CREATE INDEX idx_clinic_medical_records_visit ON clinic_medical_records(visit_id);
CREATE INDEX idx_clinic_medical_records_patient ON clinic_medical_records(patient_id);
CREATE INDEX idx_clinic_medical_records_doctor ON clinic_medical_records(doctor_id);
CREATE INDEX idx_clinic_medical_records_date ON clinic_medical_records(examination_date DESC);

-- ============================================================================
-- 5. PRESCRIPTIONS
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_prescription_seq START 1;

CREATE TABLE IF NOT EXISTS clinic_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES clinic_medical_records(id) ON DELETE CASCADE,
  prescription_number VARCHAR(50) NOT NULL UNIQUE,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, dispensed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_prescription_status CHECK (status IN ('pending', 'dispensed', 'cancelled'))
);

COMMENT ON TABLE clinic_prescriptions IS 'Prescriptions written by doctors';

-- Indexes
CREATE INDEX idx_clinic_prescriptions_number ON clinic_prescriptions(prescription_number);
CREATE INDEX idx_clinic_prescriptions_medical_record ON clinic_prescriptions(medical_record_id);
CREATE INDEX idx_clinic_prescriptions_status ON clinic_prescriptions(status);

-- ============================================================================
-- 6. PRESCRIPTION DETAILS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinic_prescription_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES clinic_prescriptions(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES clinic_medicines(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  dosage VARCHAR(100) NOT NULL, -- e.g., "3x1 sehari", "2x1 tablet setelah makan"
  duration_days INTEGER,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
  CONSTRAINT chk_duration_positive CHECK (duration_days IS NULL OR duration_days > 0)
);

COMMENT ON TABLE clinic_prescription_details IS 'Details of medicines in a prescription';

-- Indexes
CREATE INDEX idx_clinic_prescription_details_prescription ON clinic_prescription_details(prescription_id);
CREATE INDEX idx_clinic_prescription_details_medicine ON clinic_prescription_details(medicine_id);

-- ============================================================================
-- 7. SICK LETTERS
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_sick_letter_seq START 1;

CREATE TABLE IF NOT EXISTS clinic_sick_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES clinic_medical_records(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  letter_number VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  diagnosis TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES clinic_doctors(id) ON DELETE RESTRICT,
  doctor_signature TEXT, -- Digital signature or path to signature image
  notes TEXT,

  -- HR Integration
  synced_to_attendance BOOLEAN DEFAULT false,
  attendance_updated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_sick_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_total_days_positive CHECK (total_days > 0)
);

COMMENT ON TABLE clinic_sick_letters IS 'Sick leave certificates issued by doctors';

-- Indexes
CREATE INDEX idx_clinic_sick_letters_number ON clinic_sick_letters(letter_number);
CREATE INDEX idx_clinic_sick_letters_medical_record ON clinic_sick_letters(medical_record_id);
CREATE INDEX idx_clinic_sick_letters_employee ON clinic_sick_letters(employee_id);
CREATE INDEX idx_clinic_sick_letters_dates ON clinic_sick_letters(start_date, end_date);
CREATE INDEX idx_clinic_sick_letters_synced ON clinic_sick_letters(synced_to_attendance);

-- ============================================================================
-- 8. REFERRALS
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_referral_seq START 1;

CREATE TABLE IF NOT EXISTS clinic_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES clinic_medical_records(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE CASCADE,
  referral_number VARCHAR(50) NOT NULL UNIQUE,
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  referring_doctor_id UUID NOT NULL REFERENCES clinic_doctors(id) ON DELETE RESTRICT,
  referral_to VARCHAR(255) NOT NULL, -- Hospital/clinic name
  specialist_type VARCHAR(100), -- Type of specialist
  reason TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  examination_results TEXT,
  urgency_level VARCHAR(20) DEFAULT 'routine', -- routine, urgent, emergency
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_urgency_level CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
  CONSTRAINT chk_referral_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

COMMENT ON TABLE clinic_referrals IS 'Referrals to other hospitals or specialists';

-- Indexes
CREATE INDEX idx_clinic_referrals_number ON clinic_referrals(referral_number);
CREATE INDEX idx_clinic_referrals_medical_record ON clinic_referrals(medical_record_id);
CREATE INDEX idx_clinic_referrals_patient ON clinic_referrals(patient_id);
CREATE INDEX idx_clinic_referrals_date ON clinic_referrals(referral_date DESC);

-- ============================================================================
-- TRIGGERS: Update updated_at timestamp
-- ============================================================================
CREATE TRIGGER trg_clinic_patients_updated_at
  BEFORE UPDATE ON clinic_patients
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_family_members_updated_at
  BEFORE UPDATE ON clinic_family_members
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_visits_updated_at
  BEFORE UPDATE ON clinic_visits
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_medical_records_updated_at
  BEFORE UPDATE ON clinic_medical_records
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_prescriptions_updated_at
  BEFORE UPDATE ON clinic_prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_sick_letters_updated_at
  BEFORE UPDATE ON clinic_sick_letters
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

CREATE TRIGGER trg_clinic_referrals_updated_at
  BEFORE UPDATE ON clinic_referrals
  FOR EACH ROW EXECUTE FUNCTION update_clinic_updated_at();

-- ============================================================================
-- END OF MIGRATION: 005_clinic_operational.sql
-- ============================================================================
