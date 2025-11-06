-- ============================================================================
-- PATIENTS TABLE (UNIFIED)
-- ============================================================================
-- Version: 1.0.0
-- Description: Unified table untuk semua jenis pasien:
--              - Karyawan PT. Socfindo
--              - Keluarga Karyawan PT. Socfindo
--              - Karyawan Kebun Sepupu
--              - Keluarga Karyawan Kebun Sepupu
--              - Pasien Umum
-- Date: 2025-11-06
-- ============================================================================

-- Create ENUM types
CREATE TYPE patient_type AS ENUM (
    'employee',           -- Karyawan PT. Socfindo
    'employee_family',    -- Keluarga karyawan PT. Socfindo
    'partner',            -- Karyawan kebun sepupu
    'partner_family',     -- Keluarga karyawan kebun sepupu
    'public'              -- Pasien umum
);

CREATE TYPE family_relation AS ENUM (
    'self',     -- Diri sendiri (karyawan)
    'spouse',   -- Istri/Suami
    'child',    -- Anak
    'parent',   -- Orang tua
    'sibling'   -- Saudara kandung
);

CREATE TYPE payment_method AS ENUM (
    'company',    -- Ditanggung perusahaan
    'bpjs',       -- BPJS Kesehatan
    'cash',       -- Tunai/Pribadi
    'insurance'   -- Asuransi lain
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_number VARCHAR(20) UNIQUE NOT NULL, -- Auto: PAT-2025-00001

    -- Patient Type
    patient_type patient_type NOT NULL,

    -- Identity Data
    nik VARCHAR(20), -- NIK KTP atau NIK Karyawan
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    age INTEGER, -- Auto-calculated
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),

    -- Employee Relation (if applicable)
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    family_relation family_relation,

    -- Partner Plantation Relation (if applicable)
    partner_plantation_id UUID REFERENCES partner_plantations(id) ON DELETE SET NULL,
    partner_employee_nik VARCHAR(20), -- NIK karyawan di kebun sepupu
    partner_employee_name VARCHAR(255), -- Nama karyawan di kebun sepupu (untuk keluarga)

    -- Health Data
    blood_type VARCHAR(5), -- A+, A-, B+, B-, AB+, AB-, O+, O-
    height NUMERIC(5, 2), -- cm
    weight NUMERIC(5, 2), -- kg
    bmi NUMERIC(5, 2), -- Auto-calculated: weight / (height/100)^2
    bpjs_health_number VARCHAR(20),
    allergies TEXT[], -- Array of allergies

    -- Occupation (for public patients)
    occupation VARCHAR(100),

    -- Default Payment Method
    default_payment_method payment_method DEFAULT 'company',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Notes
    notes TEXT,

    -- Metadata
    registered_by UUID REFERENCES users(id),
    registered_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    -- Constraints
    CONSTRAINT patient_nik_unique_per_type UNIQUE NULLS NOT DISTINCT (nik, patient_type),
    CONSTRAINT patient_number_format CHECK (patient_number ~ '^PAT-[0-9]{4}-[0-9]{5}$')
);

-- Create indexes for faster search
CREATE INDEX idx_patients_patient_number ON patients(patient_number);
CREATE INDEX idx_patients_nik ON patients(nik);
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_patient_type ON patients(patient_type);
CREATE INDEX idx_patients_employee_id ON patients(employee_id);
CREATE INDEX idx_patients_partner_plantation_id ON patients(partner_plantation_id);
CREATE INDEX idx_patients_is_active ON patients(is_active);
CREATE INDEX idx_patients_birth_date ON patients(birth_date);

-- Full-text search index for name
CREATE INDEX idx_patients_full_name_gin ON patients USING gin(to_tsvector('indonesian', full_name));

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto-generate patient number
CREATE OR REPLACE FUNCTION generate_patient_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    seq_number INTEGER;
    new_patient_number VARCHAR(20);
BEGIN
    -- Get current year
    year_part := TO_CHAR(NOW(), 'YYYY');

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(patient_number FROM 10 FOR 5) AS INTEGER)), 0) + 1
    INTO seq_number
    FROM patients
    WHERE patient_number LIKE 'PAT-' || year_part || '-%';

    -- Generate patient number: PAT-2025-00001
    new_patient_number := 'PAT-' || year_part || '-' || LPAD(seq_number::TEXT, 5, '0');

    NEW.patient_number := new_patient_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-calculate age from birth_date
CREATE OR REPLACE FUNCTION calculate_patient_age()
RETURNS TRIGGER AS $$
BEGIN
    NEW.age := EXTRACT(YEAR FROM AGE(NEW.birth_date));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-calculate BMI
CREATE OR REPLACE FUNCTION calculate_patient_bmi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.height IS NOT NULL AND NEW.weight IS NOT NULL AND NEW.height > 0 THEN
        -- BMI = weight(kg) / (height(m))^2
        NEW.bmi := ROUND((NEW.weight / POWER(NEW.height / 100, 2))::NUMERIC, 2);
    ELSE
        NEW.bmi := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate patient number on insert
CREATE TRIGGER trigger_generate_patient_number
    BEFORE INSERT ON patients
    FOR EACH ROW
    WHEN (NEW.patient_number IS NULL)
    EXECUTE FUNCTION generate_patient_number();

-- Trigger: Auto-calculate age
CREATE TRIGGER trigger_calculate_patient_age
    BEFORE INSERT OR UPDATE OF birth_date ON patients
    FOR EACH ROW
    EXECUTE FUNCTION calculate_patient_age();

-- Trigger: Auto-calculate BMI
CREATE TRIGGER trigger_calculate_patient_bmi
    BEFORE INSERT OR UPDATE OF height, weight ON patients
    FOR EACH ROW
    EXECUTE FUNCTION calculate_patient_bmi();

-- Trigger: Update updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE patients IS 'Unified table untuk semua jenis pasien klinik';
COMMENT ON COLUMN patients.patient_number IS 'Nomor rekam medis unik: PAT-2025-00001';
COMMENT ON COLUMN patients.patient_type IS 'Jenis pasien: employee, employee_family, partner, partner_family, public';
COMMENT ON COLUMN patients.family_relation IS 'Hubungan keluarga: self, spouse, child, parent, sibling';
COMMENT ON COLUMN patients.employee_id IS 'FK ke employees table (untuk karyawan PT. Socfindo)';
COMMENT ON COLUMN patients.partner_plantation_id IS 'FK ke partner_plantations (untuk karyawan kebun sepupu)';
COMMENT ON COLUMN patients.partner_employee_nik IS 'NIK karyawan di kebun sepupu (manual input)';
COMMENT ON COLUMN patients.bmi IS 'Body Mass Index (auto-calculated)';
COMMENT ON COLUMN patients.default_payment_method IS 'Metode pembayaran default: company, bpjs, cash, insurance';
