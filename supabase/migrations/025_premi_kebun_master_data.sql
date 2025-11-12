-- =====================================================
-- Migration: 025_premi_kebun_master_data.sql
-- Description: Create master data tables for Premi Kebun (Plantation Premium System)
-- Author: Sigma Payroll Team
-- Date: 2025-11-12
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: premi_konfigurasi (Header Configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_konfigurasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_konfigurasi VARCHAR(20) NOT NULL UNIQUE,
    estate_id TEXT REFERENCES public.divisions(id) ON DELETE CASCADE,
    tahun_berlaku INTEGER NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_akhir DATE,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'tidak_aktif')),
    nomor_surat VARCHAR(50),
    tanggal_surat DATE,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_estate_tahun UNIQUE (estate_id, tahun_berlaku)
);

-- =====================================================
-- 2. CREATE TABLE: premi_basis (Basis per Umur Tanaman)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_basis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_konfigurasi(id) ON DELETE CASCADE,
    umur_tanaman INTEGER NOT NULL CHECK (umur_tanaman >= 0),
    basis_lama INTEGER NOT NULL CHECK (basis_lama > 0),
    ratio_basis_baru NUMERIC(5,2) NOT NULL CHECK (ratio_basis_baru > 0),
    basis_baru INTEGER GENERATED ALWAYS AS (ROUND(basis_lama * ratio_basis_baru)) STORED,
    harga_per_janjang NUMERIC(15,2) DEFAULT 0,
    harga_lebih_basis NUMERIC(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_umur UNIQUE (konfigurasi_id, umur_tanaman)
);

-- =====================================================
-- 3. CREATE TABLE: premi_tingkatan_lebih_basis (Tier Premium)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_tingkatan_lebih_basis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_konfigurasi(id) ON DELETE CASCADE,
    tingkat INTEGER NOT NULL CHECK (tingkat > 0),
    dari_basis NUMERIC(5,2) NOT NULL,
    sampai_basis NUMERIC(5,2),
    operator_dari VARCHAR(2) DEFAULT '>=' CHECK (operator_dari IN ('>=', '>', '<', '<=')),
    operator_sampai VARCHAR(2) DEFAULT '<' CHECK (operator_sampai IN ('>=', '>', '<', '<=')),
    premi_siap_1_basis NUMERIC(15,2) DEFAULT 0,
    premi_siap_2_basis NUMERIC(15,2) DEFAULT 0,
    premi_siap_3_basis NUMERIC(15,2) DEFAULT 0,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_tingkat UNIQUE (konfigurasi_id, tingkat)
);

-- =====================================================
-- 4. CREATE TABLE: premi_jabatan (Position Premium)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_jabatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_konfigurasi(id) ON DELETE CASCADE,
    jenis_jabatan VARCHAR(50) NOT NULL CHECK (jenis_jabatan IN ('mandor_i', 'mandor_panen', 'kerani_buah')),
    tipe_perhitungan VARCHAR(20) NOT NULL CHECK (tipe_perhitungan IN ('persentase', 'multiplier', 'fixed')),
    nilai NUMERIC(15,2) NOT NULL,
    syarat_jumlah_min INTEGER,
    syarat_jumlah_max INTEGER,
    multiplier NUMERIC(5,2),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 5. CREATE TABLE: premi_denda (Sanctions/Penalties)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_denda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_konfigurasi(id) ON DELETE CASCADE,
    kode_denda VARCHAR(10) NOT NULL,
    nama_pelanggaran VARCHAR(255) NOT NULL,
    satuan VARCHAR(20) NOT NULL CHECK (satuan IN ('per_janjang', 'per_pokok', 'per_rumpukan', 'per_hari', 'lainnya')),
    nilai_denda NUMERIC(15,2) NOT NULL CHECK (nilai_denda >= 0),
    dikenakan_oleh VARCHAR(50) CHECK (dikenakan_oleh IN ('kerani_buah', 'mandor_panen', 'mantri_recolte', 'assisten')),
    masuk_sistem_premi BOOLEAN DEFAULT true,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_kode_denda UNIQUE (konfigurasi_id, kode_denda)
);

-- =====================================================
-- 6. CREATE TABLE: premi_jam_kerja (Working Hours Configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_jam_kerja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_konfigurasi(id) ON DELETE CASCADE,
    jam_kerja_biasa INTEGER DEFAULT 7 CHECK (jam_kerja_biasa > 0),
    jam_kerja_jumat INTEGER DEFAULT 5 CHECK (jam_kerja_jumat > 0),
    basis_minimum_premi NUMERIC(5,2) DEFAULT 1.25,
    formula_basis_jumat VARCHAR(50) DEFAULT '5/7',
    pembulatan_bawah_threshold NUMERIC(3,2) DEFAULT 0.5,
    sanksi_tidak_hadir_7_hari NUMERIC(15,2) DEFAULT 10000,
    tarif_overtime_umur_lt_16 NUMERIC(15,2) DEFAULT 75000,
    tarif_overtime_umur_gte_16 NUMERIC(15,2) DEFAULT 75000,
    max_basis_overtime_lt_16 NUMERIC(5,2) DEFAULT 1.1,
    max_basis_overtime_gte_16 NUMERIC(5,2) DEFAULT 1.2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_jam_kerja UNIQUE (konfigurasi_id)
);

-- =====================================================
-- 7. CREATE TABLE: premi_blok_kebun (Block/Field Master)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_blok_kebun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_blok VARCHAR(20) NOT NULL UNIQUE,
    nama_blok VARCHAR(255) NOT NULL,
    estate_id TEXT REFERENCES public.divisions(id) ON DELETE CASCADE,
    umur_tanaman INTEGER NOT NULL CHECK (umur_tanaman >= 0),
    luas_hektar NUMERIC(10,2),
    jumlah_pokok INTEGER,
    tahun_tanam INTEGER,
    prioritas_basis INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'tidak_aktif')),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 8. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_premi_konfigurasi_estate ON public.premi_konfigurasi(estate_id);
CREATE INDEX idx_premi_konfigurasi_tahun ON public.premi_konfigurasi(tahun_berlaku);
CREATE INDEX idx_premi_konfigurasi_status ON public.premi_konfigurasi(status);

CREATE INDEX idx_premi_basis_konfigurasi ON public.premi_basis(konfigurasi_id);
CREATE INDEX idx_premi_basis_umur ON public.premi_basis(umur_tanaman);

CREATE INDEX idx_premi_tingkatan_konfigurasi ON public.premi_tingkatan_lebih_basis(konfigurasi_id);
CREATE INDEX idx_premi_tingkatan_tingkat ON public.premi_tingkatan_lebih_basis(tingkat);

CREATE INDEX idx_premi_jabatan_konfigurasi ON public.premi_jabatan(konfigurasi_id);
CREATE INDEX idx_premi_jabatan_jenis ON public.premi_jabatan(jenis_jabatan);

CREATE INDEX idx_premi_denda_konfigurasi ON public.premi_denda(konfigurasi_id);
CREATE INDEX idx_premi_denda_kode ON public.premi_denda(kode_denda);

CREATE INDEX idx_premi_blok_estate ON public.premi_blok_kebun(estate_id);
CREATE INDEX idx_premi_blok_status ON public.premi_blok_kebun(status);

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.premi_konfigurasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_basis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_tingkatan_lebih_basis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_denda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_jam_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_blok_kebun ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREATE RLS POLICIES (Super Admin & Admin)
-- =====================================================

-- Policies for premi_konfigurasi
CREATE POLICY "Super Admin can do everything on premi_konfigurasi"
    ON public.premi_konfigurasi FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_konfigurasi"
    ON public.premi_konfigurasi FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_konfigurasi"
    ON public.premi_konfigurasi FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_basis
CREATE POLICY "Super Admin can do everything on premi_basis"
    ON public.premi_basis FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_basis"
    ON public.premi_basis FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_basis"
    ON public.premi_basis FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_tingkatan_lebih_basis
CREATE POLICY "Super Admin can do everything on premi_tingkatan"
    ON public.premi_tingkatan_lebih_basis FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_tingkatan"
    ON public.premi_tingkatan_lebih_basis FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_tingkatan"
    ON public.premi_tingkatan_lebih_basis FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_jabatan
CREATE POLICY "Super Admin can do everything on premi_jabatan"
    ON public.premi_jabatan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_jabatan"
    ON public.premi_jabatan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_jabatan"
    ON public.premi_jabatan FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_denda
CREATE POLICY "Super Admin can do everything on premi_denda"
    ON public.premi_denda FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_denda"
    ON public.premi_denda FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_denda"
    ON public.premi_denda FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_jam_kerja
CREATE POLICY "Super Admin can do everything on premi_jam_kerja"
    ON public.premi_jam_kerja FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_jam_kerja"
    ON public.premi_jam_kerja FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_jam_kerja"
    ON public.premi_jam_kerja FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_blok_kebun
CREATE POLICY "Super Admin can do everything on premi_blok_kebun"
    ON public.premi_blok_kebun FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_blok_kebun"
    ON public.premi_blok_kebun FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_blok_kebun"
    ON public.premi_blok_kebun FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- =====================================================
-- 11. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_premi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_premi_konfigurasi
    BEFORE UPDATE ON public.premi_konfigurasi
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_basis
    BEFORE UPDATE ON public.premi_basis
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_tingkatan
    BEFORE UPDATE ON public.premi_tingkatan_lebih_basis
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_jabatan
    BEFORE UPDATE ON public.premi_jabatan
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_denda
    BEFORE UPDATE ON public.premi_denda
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_jam_kerja
    BEFORE UPDATE ON public.premi_jam_kerja
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_blok_kebun
    BEFORE UPDATE ON public.premi_blok_kebun
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

-- =====================================================
-- 12. ADD PERMISSIONS TO ROLE_PERMISSIONS
-- =====================================================

-- Add premi_master module permissions for super_admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_master', true, true, true, true
FROM public.roles r
WHERE r.code = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_master');

-- Add premi_master module permissions for admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_master', true, true, true, true
FROM public.roles r
WHERE r.code = 'admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_master');

-- Add premi_master module permissions for manager role (view only)
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_master', true, false, false, false
FROM public.roles r
WHERE r.code = 'manager'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_master');

-- =====================================================
-- 13. COMMENTS
-- =====================================================
COMMENT ON TABLE public.premi_konfigurasi IS 'Konfigurasi utama sistem premi kebun per estate dan tahun';
COMMENT ON TABLE public.premi_basis IS 'Basis janjang berdasarkan umur tanaman';
COMMENT ON TABLE public.premi_tingkatan_lebih_basis IS 'Tingkatan premi siap berdasarkan pencapaian basis';
COMMENT ON TABLE public.premi_jabatan IS 'Konfigurasi premi untuk jabatan (Mandor I, Mandor Panen, Kerani Buah)';
COMMENT ON TABLE public.premi_denda IS 'Master denda/sanksi untuk pelanggaran dalam panen';
COMMENT ON TABLE public.premi_jam_kerja IS 'Konfigurasi jam kerja dan overtime untuk perhitungan premi';
COMMENT ON TABLE public.premi_blok_kebun IS 'Master blok kebun untuk mapping hasil panen';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
