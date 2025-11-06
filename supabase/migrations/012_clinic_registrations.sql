-- ============================================================================
-- CLINIC REGISTRATIONS TABLE
-- ============================================================================
-- Version: 1.0.0
-- Description: Table untuk pendaftaran/registrasi kunjungan pasien ke klinik
-- Date: 2025-11-06
-- ============================================================================

-- Create ENUM types
CREATE TYPE visit_type AS ENUM (
    'new',        -- Kunjungan baru
    'follow_up',  -- Kunjungan kontrol
    'emergency'   -- Kunjungan darurat
);

CREATE TYPE registration_status AS ENUM (
    'registered',  -- Baru daftar, belum dipanggil
    'waiting',     -- Menunggu giliran
    'in_progress', -- Sedang dilayani
    'completed',   -- Selesai dilayani
    'cancelled',   -- Dibatalkan
    'no_show'      -- Tidak datang
);

-- Create clinic_registrations table
CREATE TABLE IF NOT EXISTS public.clinic_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(30) UNIQUE NOT NULL, -- Auto: REG-20251106-0001
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    registration_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Patient Information
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,

    -- Visit Information
    visit_type visit_type NOT NULL DEFAULT 'new',
    chief_complaint TEXT NOT NULL, -- Keluhan utama

    -- Vital Signs (optional, bisa diisi saat pendaftaran atau saat pemeriksaan)
    vital_signs JSONB DEFAULT '{}'::jsonb,
    -- Format vital_signs:
    -- {
    --   "bloodPressure": "120/80",
    --   "temperature": 36.5,
    --   "heartRate": 80,
    --   "respiratoryRate": 20,
    --   "oxygenSaturation": 98,
    --   "height": 170,
    --   "weight": 70
    -- }

    -- Queue Management
    queue_number INTEGER NOT NULL,
    queue_display VARCHAR(20), -- UMUM-023, GIGI-005, etc.
    estimated_wait_time INTEGER, -- in minutes

    -- Service Allocation
    service_type VARCHAR(50) DEFAULT 'general', -- general, dental, emergency, etc.
    doctor_id UUID, -- Will add FK constraint when clinic_doctors table is created
    room_id VARCHAR(50), -- Room code/number

    -- Status & Tracking
    status registration_status NOT NULL DEFAULT 'registered',
    called_at TIMESTAMPTZ, -- Waktu dipanggil
    started_at TIMESTAMPTZ, -- Waktu mulai dilayani
    completed_at TIMESTAMPTZ, -- Waktu selesai dilayani
    cancelled_at TIMESTAMPTZ, -- Waktu dibatalkan
    cancellation_reason TEXT,

    -- Payment Information
    payment_method payment_method NOT NULL DEFAULT 'company',
    is_paid BOOLEAN DEFAULT FALSE,
    payment_amount NUMERIC(15, 2) DEFAULT 0,
    payment_date TIMESTAMPTZ,

    -- Notes
    registration_notes TEXT,
    internal_notes TEXT, -- Catatan internal, tidak terlihat di slip

    -- Metadata
    registered_by UUID NOT NULL REFERENCES users(id), -- Perawat/Petugas yang mendaftarkan
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_clinic_registrations_number ON clinic_registrations(registration_number);
CREATE INDEX idx_clinic_registrations_date ON clinic_registrations(registration_date);
CREATE INDEX idx_clinic_registrations_patient ON clinic_registrations(patient_id);
CREATE INDEX idx_clinic_registrations_status ON clinic_registrations(status);
CREATE INDEX idx_clinic_registrations_doctor ON clinic_registrations(doctor_id);
CREATE INDEX idx_clinic_registrations_queue ON clinic_registrations(registration_date, queue_number);
CREATE INDEX idx_clinic_registrations_service_type ON clinic_registrations(service_type);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto-generate registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part VARCHAR(8);
    seq_number INTEGER;
    new_reg_number VARCHAR(30);
BEGIN
    -- Get current date: YYYYMMDD
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');

    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 17 FOR 4) AS INTEGER)), 0) + 1
    INTO seq_number
    FROM clinic_registrations
    WHERE registration_number LIKE 'REG-' || date_part || '-%';

    -- Generate registration number: REG-20251106-0001
    new_reg_number := 'REG-' || date_part || '-' || LPAD(seq_number::TEXT, 4, '0');

    NEW.registration_number := new_reg_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-generate queue number
CREATE OR REPLACE FUNCTION generate_queue_number()
RETURNS TRIGGER AS $$
DECLARE
    next_queue INTEGER;
    service_prefix VARCHAR(10);
BEGIN
    -- Get next queue number for today and service type
    SELECT COALESCE(MAX(queue_number), 0) + 1
    INTO next_queue
    FROM clinic_registrations
    WHERE registration_date = CURRENT_DATE
      AND service_type = NEW.service_type;

    NEW.queue_number := next_queue;

    -- Generate queue display
    CASE NEW.service_type
        WHEN 'general' THEN service_prefix := 'UMUM';
        WHEN 'dental' THEN service_prefix := 'GIGI';
        WHEN 'emergency' THEN service_prefix := 'IGD';
        ELSE service_prefix := 'KLINIK';
    END CASE;

    NEW.queue_display := service_prefix || '-' || LPAD(next_queue::TEXT, 3, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate estimated wait time
CREATE OR REPLACE FUNCTION calculate_wait_time()
RETURNS TRIGGER AS $$
DECLARE
    waiting_count INTEGER;
    avg_service_time INTEGER := 15; -- Average 15 minutes per patient
BEGIN
    -- Count patients waiting before this registration
    SELECT COUNT(*)
    INTO waiting_count
    FROM clinic_registrations
    WHERE registration_date = CURRENT_DATE
      AND service_type = NEW.service_type
      AND status IN ('registered', 'waiting')
      AND queue_number < NEW.queue_number;

    -- Calculate estimated wait time
    NEW.estimated_wait_time := waiting_count * avg_service_time;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update status timestamps
CREATE OR REPLACE FUNCTION update_registration_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Update timestamps based on status changes
    IF NEW.status = 'waiting' AND OLD.status = 'registered' THEN
        NEW.called_at := NOW();
    ELSIF NEW.status = 'in_progress' AND OLD.status = 'waiting' THEN
        NEW.started_at := NOW();
    ELSIF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
        NEW.completed_at := NOW();
    ELSIF NEW.status = 'cancelled' THEN
        NEW.cancelled_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate registration number
CREATE TRIGGER trigger_generate_registration_number
    BEFORE INSERT ON clinic_registrations
    FOR EACH ROW
    WHEN (NEW.registration_number IS NULL)
    EXECUTE FUNCTION generate_registration_number();

-- Trigger: Auto-generate queue number
CREATE TRIGGER trigger_generate_queue_number
    BEFORE INSERT ON clinic_registrations
    FOR EACH ROW
    WHEN (NEW.queue_number IS NULL)
    EXECUTE FUNCTION generate_queue_number();

-- Trigger: Calculate estimated wait time
CREATE TRIGGER trigger_calculate_wait_time
    BEFORE INSERT ON clinic_registrations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_wait_time();

-- Trigger: Update status timestamps
CREATE TRIGGER trigger_update_registration_timestamps
    BEFORE UPDATE OF status ON clinic_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_registration_timestamps();

-- Trigger: Update updated_at
CREATE TRIGGER update_clinic_registrations_updated_at
    BEFORE UPDATE ON clinic_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Today's queue with patient details
-- Note: Simplified version without clinic_doctors reference (table not yet created)
CREATE OR REPLACE VIEW v_today_queue AS
SELECT
    cr.id,
    cr.registration_number,
    cr.queue_number,
    cr.queue_display,
    cr.registration_time,
    cr.service_type,
    cr.status,
    cr.estimated_wait_time,

    -- Patient info
    p.patient_number,
    p.full_name AS patient_name,
    p.patient_type,
    p.age,
    p.gender,

    -- Doctor info (will be NULL until clinic_doctors table is created)
    cr.doctor_id,
    CAST(NULL AS VARCHAR) AS doctor_name,

    -- Registered by
    u.full_name AS registered_by_name,

    -- Timestamps
    cr.called_at,
    cr.started_at,
    cr.completed_at
FROM clinic_registrations cr
JOIN patients p ON cr.patient_id = p.id
LEFT JOIN users u ON cr.registered_by = u.id
WHERE cr.registration_date = CURRENT_DATE
ORDER BY cr.queue_number;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE clinic_registrations IS 'Data pendaftaran/registrasi kunjungan pasien ke klinik';
COMMENT ON COLUMN clinic_registrations.registration_number IS 'Nomor registrasi unik: REG-20251106-0001';
COMMENT ON COLUMN clinic_registrations.queue_number IS 'Nomor antrian (reset setiap hari)';
COMMENT ON COLUMN clinic_registrations.queue_display IS 'Display antrian: UMUM-023, GIGI-005';
COMMENT ON COLUMN clinic_registrations.chief_complaint IS 'Keluhan utama pasien';
COMMENT ON COLUMN clinic_registrations.vital_signs IS 'Data vital signs dalam format JSONB';
COMMENT ON COLUMN clinic_registrations.estimated_wait_time IS 'Estimasi waktu tunggu dalam menit';
COMMENT ON COLUMN clinic_registrations.status IS 'Status: registered, waiting, in_progress, completed, cancelled, no_show';
