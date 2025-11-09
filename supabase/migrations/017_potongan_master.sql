-- =====================================================
-- Migration: 017_potongan_master.sql
-- Description: Create deductions master data (Potongan)
-- Author: Sigma Payroll Team
-- Date: 2025-11-09
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: potongan
-- =====================================================
CREATE TABLE IF NOT EXISTS public.potongan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('external', 'perusahaan')),
    coa_account_number VARCHAR(50),
    coa_account_name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_potongan_code ON public.potongan(code);
CREATE INDEX idx_potongan_type ON public.potongan(type);
CREATE INDEX idx_potongan_is_active ON public.potongan(is_active);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.potongan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Policy: Super Admin - Full Access
CREATE POLICY "Super Admin can do everything on potongan"
    ON public.potongan
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.code = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.code = 'super_admin'
        )
    );

-- Policy: Admin - Full Access
CREATE POLICY "Admin can do everything on potongan"
    ON public.potongan
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.code = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.code = 'admin'
        )
    );

-- Policy: Manager - View Only
CREATE POLICY "Manager can view potongan"
    ON public.potongan
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.code = 'manager'
        )
    );

-- Policy: Karyawan - View Only
CREATE POLICY "Karyawan can view potongan"
    ON public.potongan
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.code = 'karyawan'
        )
    );

-- =====================================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_potongan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_potongan_updated_at
    BEFORE UPDATE ON public.potongan
    FOR EACH ROW
    EXECUTE FUNCTION update_potongan_updated_at();

-- =====================================================
-- 6. INSERT SEED DATA (13 Default Deduction Types)
-- =====================================================
INSERT INTO public.potongan (code, name, type, coa_account_number, coa_account_name, description, is_active) VALUES
('001', 'Kontanan/Extra', 'perusahaan', NULL, NULL, 'Potongan kontanan atau extra', true),
('002', 'Hutang Lain-Lain', 'perusahaan', NULL, NULL, 'Potongan hutang lain-lain', true),
('003', 'P.Kembali - Karyawan', 'perusahaan', NULL, NULL, 'Potongan kembali karyawan', true),
('004', 'P.Kembali - Pegawai', 'perusahaan', NULL, NULL, 'Potongan kembali pegawai', true),
('005', 'IPMS/Sosial', 'external', NULL, NULL, 'Potongan IPMS/Sosial', true),
('006', 'Iuran Koperasi', 'external', NULL, NULL, 'Potongan iuran koperasi', true),
('007', 'Kop. Konsumsi', 'external', NULL, NULL, 'Potongan koperasi konsumsi', true),
('008', 'Kop. S.Pinjam', 'external', NULL, NULL, 'Potongan koperasi simpan pinjam', true),
('009', 'PLN', 'external', NULL, NULL, 'Potongan tagihan PLN', true),
('010', 'Gajian Kecil', 'perusahaan', NULL, NULL, 'Potongan gajian kecil', true),
('011', 'Catu Beras Mangkir', 'perusahaan', NULL, NULL, 'Potongan catu beras mangkir', true),
('012', 'Serikat Pekerja', 'external', NULL, NULL, 'Potongan iuran serikat pekerja', true),
('013', 'Uang Makan', 'perusahaan', NULL, NULL, 'Potongan uang makan', true);

-- =====================================================
-- 7. ADD PERMISSIONS TO ROLE_PERMISSIONS
-- =====================================================

-- Add potongan_master module permissions for super_admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
    r.id,
    'potongan_master',
    true,
    true,
    true,
    true
FROM public.roles r
WHERE r.code = 'super_admin'
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role_id = r.id AND rp.module_name = 'potongan_master'
);

-- Add potongan_master module permissions for admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
    r.id,
    'potongan_master',
    true,
    true,
    true,
    true
FROM public.roles r
WHERE r.code = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role_id = r.id AND rp.module_name = 'potongan_master'
);

-- Add potongan_master module permissions for manager role (view only)
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
    r.id,
    'potongan_master',
    true,
    false,
    false,
    false
FROM public.roles r
WHERE r.code = 'manager'
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role_id = r.id AND rp.module_name = 'potongan_master'
);

-- Add potongan_master module permissions for karyawan role (view only)
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
    r.id,
    'potongan_master',
    true,
    false,
    false,
    false
FROM public.roles r
WHERE r.code = 'karyawan'
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role_id = r.id AND rp.module_name = 'potongan_master'
);

-- =====================================================
-- 8. COMMENTS
-- =====================================================
COMMENT ON TABLE public.potongan IS 'Master data untuk jenis-jenis potongan gaji';
COMMENT ON COLUMN public.potongan.code IS 'Kode potongan (3 digit)';
COMMENT ON COLUMN public.potongan.name IS 'Nama jenis potongan';
COMMENT ON COLUMN public.potongan.type IS 'Tipe potongan: external atau perusahaan';
COMMENT ON COLUMN public.potongan.coa_account_number IS 'Nomor akun COA untuk alokasi biaya';
COMMENT ON COLUMN public.potongan.coa_account_name IS 'Nama akun COA untuk alokasi biaya';
COMMENT ON COLUMN public.potongan.description IS 'Deskripsi potongan';
COMMENT ON COLUMN public.potongan.is_active IS 'Status aktif potongan';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
