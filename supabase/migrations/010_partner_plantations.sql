-- ============================================================================
-- PARTNER PLANTATIONS (KEBUN SEPUPU) TABLE
-- ============================================================================
-- Version: 1.0.0
-- Description: Master data untuk kebun mitra/sepupu yang memiliki kerjasama
--              pelayanan kesehatan dengan klinik PT. Socfindo
-- Date: 2025-11-06
-- ============================================================================

-- Create partner_plantations table
CREATE TABLE IF NOT EXISTS public.partner_plantations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL, -- KS-001, KS-002, etc.
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),

    -- Contact Information
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),

    -- Cooperation Details
    cooperation_start_date DATE NOT NULL,
    cooperation_end_date DATE,
    cooperation_type VARCHAR(50) DEFAULT 'health_service', -- health_service, full_service, etc.

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create index for faster search
CREATE INDEX idx_partner_plantations_code ON partner_plantations(code);
CREATE INDEX idx_partner_plantations_name ON partner_plantations(name);
CREATE INDEX idx_partner_plantations_is_active ON partner_plantations(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_partner_plantations_updated_at
    BEFORE UPDATE ON partner_plantations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE partner_plantations IS 'Master data kebun mitra/sepupu yang bekerjasama dengan klinik';
COMMENT ON COLUMN partner_plantations.code IS 'Kode unik kebun sepupu (KS-001, KS-002, dst)';
COMMENT ON COLUMN partner_plantations.cooperation_type IS 'Jenis kerjasama: health_service, full_service, dll';
COMMENT ON COLUMN partner_plantations.is_active IS 'Status aktif kerjasama';
