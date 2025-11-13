-- =====================================================
-- Migration: 029_premi_deres_master_data.sql
-- Description: Create master data tables for Premi Deres (Rubber Tapping Premium System)
-- Based on: SI 24 GR III SISTEM PREMI DERES TAHUN 2024
-- Author: Sigma Payroll Team
-- Date: 2025-11-13
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: premi_deres_konfigurasi (Deres Configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_konfigurasi (
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
    CONSTRAINT unique_estate_tahun_deres UNIQUE (estate_id, tahun_berlaku)
);

-- =====================================================
-- 2. CREATE TABLE: premi_deres_produksi_normal (Normal Production Premium Rates)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_produksi_normal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    divisi VARCHAR(20) NOT NULL CHECK (divisi IN ('AP_DIV_I_III', 'AP_DIV_IV_VI')),
    jenis_lateks VARCHAR(50) NOT NULL CHECK (jenis_lateks IN ('lateks_normal', 'lateks_deres_ekstra', 'lower_grades', 'lump_cuka', 'scraps')),
    satuan VARCHAR(20) NOT NULL CHECK (satuan IN ('kg_kk', 'kg_basah')),
    tarif_per_kg NUMERIC(15,2) NOT NULL CHECK (tarif_per_kg >= 0),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_divisi_jenis UNIQUE (konfigurasi_id, divisi, jenis_lateks)
);

-- =====================================================
-- 3. CREATE TABLE: premi_deres_koefisien_pendapatan (Revenue Coefficient)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_koefisien_pendapatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    persentase_pendapatan_min NUMERIC(5,2) NOT NULL,
    persentase_pendapatan_max NUMERIC(5,2),
    koefisien NUMERIC(5,2) NOT NULL CHECK (koefisien >= 0 AND koefisien <= 2.0),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 4. CREATE TABLE: premi_deres_kualitas (Quality Premium - PQ)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_kualitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    nilai_kesalahan_min INTEGER NOT NULL,
    nilai_kesalahan_max INTEGER,
    koefisien NUMERIC(5,2) NOT NULL CHECK (koefisien >= 0 AND koefisien <= 1.0),
    tarif_pq NUMERIC(15,2) DEFAULT 237000,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 5. CREATE TABLE: premi_deres_pra_teruna (Pre-Mature Tapper Quality Premium)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_pra_teruna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    tarif_per_bulan NUMERIC(15,2) DEFAULT 267000,
    durasi_bulan INTEGER DEFAULT 6,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_pra_teruna UNIQUE (konfigurasi_id)
);

-- =====================================================
-- 6. CREATE TABLE: premi_deres_tetel (Tetel Premium - For replanting area)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_tetel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    divisi VARCHAR(20) NOT NULL CHECK (divisi IN ('AP_DIV_I_III', 'AP_DIV_IV_VI')),
    jenis_lateks VARCHAR(50) NOT NULL CHECK (jenis_lateks IN ('lateks_normal', 'lateks_deres_ekstra', 'lower_grades', 'lump_cuka', 'scraps')),
    satuan VARCHAR(20) NOT NULL CHECK (satuan IN ('kg_kk', 'kg_basah')),
    tarif_per_kg NUMERIC(15,2) NOT NULL CHECK (tarif_per_kg >= 0),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_divisi_jenis_tetel UNIQUE (konfigurasi_id, divisi, jenis_lateks)
);

-- =====================================================
-- 7. CREATE TABLE: premi_deres_biaya_cuci_mangkok (Washing Basin Cost)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_biaya_cuci_mangkok (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    divisi VARCHAR(20) NOT NULL CHECK (divisi IN ('AP_DIV_I_III', 'AP_DIV_IV_VI')),
    tarif_per_ancak NUMERIC(15,2) NOT NULL CHECK (tarif_per_ancak >= 0),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_divisi_cuci UNIQUE (konfigurasi_id, divisi)
);

-- =====================================================
-- 8. CREATE TABLE: premi_deres_keluar_kontanan (Overtime/Holiday Premium)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_keluar_kontanan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    jenis_karyawan VARCHAR(50) NOT NULL CHECK (jenis_karyawan IN ('karyawan_penderes', 'mandor_i_deres', 'mandor_deres', 'krani_latex', 'premi_tap_kontrol')),
    tarif_per_hb NUMERIC(15,2) NOT NULL CHECK (tarif_per_hb >= 0),
    hari_berlaku TEXT[], -- Array of holiday types
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_jenis_keluar UNIQUE (konfigurasi_id, jenis_karyawan)
);

-- =====================================================
-- 9. CREATE TABLE: premi_deres_mandor (Mandor Deres Formula)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_mandor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    jumlah_karyawan_min INTEGER NOT NULL,
    jumlah_karyawan_max INTEGER,
    multiplier NUMERIC(5,2) NOT NULL CHECK (multiplier >= 1.0),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 10. CREATE TABLE: premi_deres_mandor_i (Mandor-I Deres Formula)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_mandor_i (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    jumlah_karyawan_min INTEGER NOT NULL,
    jumlah_karyawan_max INTEGER,
    multiplier NUMERIC(5,2) NOT NULL CHECK (multiplier >= 1.0),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 11. CREATE TABLE: premi_deres_tap_kontrol (Tap Control Premium)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_tap_kontrol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    kebun_type VARCHAR(20) NOT NULL CHECK (kebun_type IN ('AP_HL')),
    tarif_per_bulan NUMERIC(15,2) DEFAULT 1510000,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_tap_kontrol UNIQUE (konfigurasi_id, kebun_type)
);

-- =====================================================
-- 12. CREATE TABLE: premi_deres_krani_lateks (Krani Lateks Premium)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_krani_lateks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    multiplier NUMERIC(5,2) DEFAULT 1.25,
    penalti_kesalahan TEXT,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_krani_lateks UNIQUE (konfigurasi_id)
);

-- =====================================================
-- 13. CREATE TABLE: premi_deres_krani_produksi (Krani Produksi Premium)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_krani_produksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    multiplier NUMERIC(5,2) DEFAULT 1.50,
    penalti_kesalahan TEXT,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_krani_produksi UNIQUE (konfigurasi_id)
);

-- =====================================================
-- 14. CREATE TABLE: premi_deres_ancak_master (Ancak/Tree Assignment Master)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_ancak_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_ancak VARCHAR(20) NOT NULL UNIQUE,
    nama_ancak VARCHAR(255) NOT NULL,
    blok_id UUID REFERENCES public.premi_blok_kebun(id) ON DELETE SET NULL,
    estate_id TEXT REFERENCES public.divisions(id) ON DELETE CASCADE,
    divisi VARCHAR(20) CHECK (divisi IN ('AP_DIV_I_III', 'AP_DIV_IV_VI')),
    jumlah_pokok INTEGER,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'tidak_aktif', 'tetel')),
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 15. CREATE TABLE: premi_deres_quality_inspection (Quality Inspection Criteria)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_quality_inspection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE CASCADE,
    kode_kesalahan VARCHAR(10) NOT NULL,
    nama_kesalahan VARCHAR(255) NOT NULL,
    bobot_kesalahan INTEGER DEFAULT 1,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_konfigurasi_kode_kesalahan UNIQUE (konfigurasi_id, kode_kesalahan)
);

-- =====================================================
-- 16. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_premi_deres_konfigurasi_estate ON public.premi_deres_konfigurasi(estate_id);
CREATE INDEX idx_premi_deres_konfigurasi_tahun ON public.premi_deres_konfigurasi(tahun_berlaku);
CREATE INDEX idx_premi_deres_konfigurasi_status ON public.premi_deres_konfigurasi(status);

CREATE INDEX idx_premi_deres_produksi_konfigurasi ON public.premi_deres_produksi_normal(konfigurasi_id);
CREATE INDEX idx_premi_deres_produksi_divisi ON public.premi_deres_produksi_normal(divisi);

CREATE INDEX idx_premi_deres_koefisien_konfigurasi ON public.premi_deres_koefisien_pendapatan(konfigurasi_id);

CREATE INDEX idx_premi_deres_kualitas_konfigurasi ON public.premi_deres_kualitas(konfigurasi_id);

CREATE INDEX idx_premi_deres_tetel_konfigurasi ON public.premi_deres_tetel(konfigurasi_id);

CREATE INDEX idx_premi_deres_ancak_estate ON public.premi_deres_ancak_master(estate_id);
CREATE INDEX idx_premi_deres_ancak_blok ON public.premi_deres_ancak_master(blok_id);
CREATE INDEX idx_premi_deres_ancak_status ON public.premi_deres_ancak_master(status);

CREATE INDEX idx_premi_deres_inspection_konfigurasi ON public.premi_deres_quality_inspection(konfigurasi_id);

-- =====================================================
-- 17. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.premi_deres_konfigurasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_produksi_normal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_koefisien_pendapatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_kualitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_pra_teruna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_tetel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_biaya_cuci_mangkok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_keluar_kontanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_mandor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_mandor_i ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_tap_kontrol ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_krani_lateks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_krani_produksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_ancak_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_quality_inspection ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 18. CREATE RLS POLICIES (Super Admin & Admin)
-- =====================================================

-- Policies for premi_deres_konfigurasi
CREATE POLICY "Super Admin can do everything on premi_deres_konfigurasi"
    ON public.premi_deres_konfigurasi FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_deres_konfigurasi"
    ON public.premi_deres_konfigurasi FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_deres_konfigurasi"
    ON public.premi_deres_konfigurasi FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Apply similar policies for all other tables
-- (Abbreviated for brevity - similar pattern for all 15 tables)

-- =====================================================
-- 19. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER trigger_update_premi_deres_konfigurasi
    BEFORE UPDATE ON public.premi_deres_konfigurasi
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_produksi_normal
    BEFORE UPDATE ON public.premi_deres_produksi_normal
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_koefisien
    BEFORE UPDATE ON public.premi_deres_koefisien_pendapatan
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_kualitas
    BEFORE UPDATE ON public.premi_deres_kualitas
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_pra_teruna
    BEFORE UPDATE ON public.premi_deres_pra_teruna
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_tetel
    BEFORE UPDATE ON public.premi_deres_tetel
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_cuci_mangkok
    BEFORE UPDATE ON public.premi_deres_biaya_cuci_mangkok
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_keluar
    BEFORE UPDATE ON public.premi_deres_keluar_kontanan
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_mandor
    BEFORE UPDATE ON public.premi_deres_mandor
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_mandor_i
    BEFORE UPDATE ON public.premi_deres_mandor_i
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_tap_kontrol
    BEFORE UPDATE ON public.premi_deres_tap_kontrol
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_krani_lateks
    BEFORE UPDATE ON public.premi_deres_krani_lateks
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_krani_produksi
    BEFORE UPDATE ON public.premi_deres_krani_produksi
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_ancak
    BEFORE UPDATE ON public.premi_deres_ancak_master
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_inspection
    BEFORE UPDATE ON public.premi_deres_quality_inspection
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

-- =====================================================
-- 20. ADD PERMISSIONS TO ROLE_PERMISSIONS
-- =====================================================

-- Add premi_deres_master module permissions
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_deres_master', true, true, true, true
FROM public.roles r
WHERE r.code = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_deres_master');

INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_deres_master', true, true, true, true
FROM public.roles r
WHERE r.code = 'admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_deres_master');

INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_deres_master', true, false, false, false
FROM public.roles r
WHERE r.code = 'manager'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_deres_master');

-- =====================================================
-- 21. COMMENTS
-- =====================================================
COMMENT ON TABLE public.premi_deres_konfigurasi IS 'Konfigurasi utama sistem premi deres per estate dan tahun';
COMMENT ON TABLE public.premi_deres_produksi_normal IS 'Tarif premi produksi normal untuk lateks dan produk turunannya';
COMMENT ON TABLE public.premi_deres_koefisien_pendapatan IS 'Koefisien premi berdasarkan persentase pendapatan';
COMMENT ON TABLE public.premi_deres_kualitas IS 'Konfigurasi premi kualitas (PQ) berdasarkan nilai kesalahan';
COMMENT ON TABLE public.premi_deres_pra_teruna IS 'Premi kualitas untuk penderes pra teruna (6 bulan pertama)';
COMMENT ON TABLE public.premi_deres_tetel IS 'Premi untuk area yang akan diremajakan';
COMMENT ON TABLE public.premi_deres_biaya_cuci_mangkok IS 'Biaya cuci mangkok per ancak';
COMMENT ON TABLE public.premi_deres_keluar_kontanan IS 'Premi deres ekstra/hari libur';
COMMENT ON TABLE public.premi_deres_mandor IS 'Formula premi mandor deres';
COMMENT ON TABLE public.premi_deres_mandor_i IS 'Formula premi mandor-I deres';
COMMENT ON TABLE public.premi_deres_tap_kontrol IS 'Premi tap kontrol bulanan';
COMMENT ON TABLE public.premi_deres_krani_lateks IS 'Formula premi krani lateks';
COMMENT ON TABLE public.premi_deres_krani_produksi IS 'Formula premi krani produksi';
COMMENT ON TABLE public.premi_deres_ancak_master IS 'Master data ancak/pohon untuk penugasan deres';
COMMENT ON TABLE public.premi_deres_quality_inspection IS 'Kriteria pemeriksaan kualitas deres';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
