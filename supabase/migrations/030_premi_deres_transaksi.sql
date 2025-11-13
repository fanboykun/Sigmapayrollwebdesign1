-- =====================================================
-- Migration: 030_premi_deres_transaksi.sql
-- Description: Create transaction tables for Premi Deres (Daily Production & Calculations)
-- Based on: SI 24 GR III SISTEM PREMI DERES TAHUN 2024
-- Author: Sigma Payroll Team
-- Date: 2025-11-13
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: premi_deres_produksi_harian (Daily Production Input)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_produksi_harian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_produksi DATE NOT NULL,
    ancak_id UUID NOT NULL REFERENCES public.premi_deres_ancak_master(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    tipe_hari VARCHAR(20) DEFAULT 'hari_biasa' CHECK (tipe_hari IN ('hari_biasa', 'hari_libur')),

    -- Production data
    kg_lateks_normal NUMERIC(10,2) DEFAULT 0,
    kg_lateks_ekstra NUMERIC(10,2) DEFAULT 0,
    kg_lower_grades NUMERIC(10,2) DEFAULT 0,
    kg_lump_cuka NUMERIC(10,2) DEFAULT 0,
    kg_scraps NUMERIC(10,2) DEFAULT 0,

    -- Quality data
    nilai_kesalahan INTEGER DEFAULT 0,

    -- Supervisor references
    mandor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    asisten_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,

    keterangan TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'processed')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_tanggal_ancak_employee UNIQUE (tanggal_produksi, ancak_id, employee_id)
);

-- =====================================================
-- 2. CREATE TABLE: premi_deres_quality_check_harian (Daily Quality Inspection)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_quality_check_harian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_pemeriksaan DATE NOT NULL,
    ancak_id UUID NOT NULL REFERENCES public.premi_deres_ancak_master(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    kesalahan_id UUID NOT NULL REFERENCES public.premi_deres_quality_inspection(id) ON DELETE RESTRICT,
    jumlah_kesalahan INTEGER NOT NULL CHECK (jumlah_kesalahan > 0),
    bobot_total INTEGER GENERATED ALWAYS AS (jumlah_kesalahan) STORED,
    diperiksa_oleh_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    keterangan TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'processed')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. CREATE TABLE: premi_deres_periode_perhitungan (Calculation Period)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_periode_perhitungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_deres_konfigurasi(id) ON DELETE RESTRICT,
    estate_id TEXT NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
    periode_nama VARCHAR(100) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_akhir DATE NOT NULL,
    total_karyawan INTEGER DEFAULT 0,
    total_premi_kotor NUMERIC(15,2) DEFAULT 0,
    total_premi_netto NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'reviewed', 'approved', 'integrated')),
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    processed_by UUID REFERENCES public.users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_estate_periode_deres UNIQUE (estate_id, tanggal_mulai, tanggal_akhir)
);

-- =====================================================
-- 4. CREATE TABLE: premi_deres_hasil_perhitungan (Calculation Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_hasil_perhitungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periode_id UUID NOT NULL REFERENCES public.premi_deres_periode_perhitungan(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    jenis_karyawan VARCHAR(50) NOT NULL CHECK (jenis_karyawan IN ('penderes', 'mandor_deres', 'mandor_i_deres', 'krani_lateks', 'krani_produksi', 'tap_kontrol')),

    -- For Penderes (Tapper)
    total_hari_kerja INTEGER DEFAULT 0,
    total_kg_produksi NUMERIC(10,2) DEFAULT 0,
    premi_produksi_normal NUMERIC(15,2) DEFAULT 0,
    premi_produksi_ekstra NUMERIC(15,2) DEFAULT 0,
    premi_kualitas NUMERIC(15,2) DEFAULT 0,
    premi_pra_teruna NUMERIC(15,2) DEFAULT 0,
    biaya_cuci_mangkok NUMERIC(15,2) DEFAULT 0,
    premi_keluar_kontanan NUMERIC(15,2) DEFAULT 0,
    uang_makan_siang NUMERIC(15,2) DEFAULT 0,
    total_premi_kotor NUMERIC(15,2) DEFAULT 0,
    premi_netto NUMERIC(15,2) DEFAULT 0,

    -- For Mandor/Krani (Supervisor)
    jumlah_bawahan INTEGER,
    total_premi_bawahan NUMERIC(15,2),
    multiplier_premi NUMERIC(5,2),

    status VARCHAR(20) DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_periode_employee_deres UNIQUE (periode_id, employee_id)
);

-- =====================================================
-- 5. CREATE TABLE: premi_deres_approval_log (Approval Workflow)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_approval_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periode_id UUID NOT NULL REFERENCES public.premi_deres_periode_perhitungan(id) ON DELETE CASCADE,
    level_approval INTEGER NOT NULL CHECK (level_approval IN (1, 2, 3)),
    level_nama VARCHAR(50) NOT NULL,
    approved_by UUID NOT NULL REFERENCES public.users(id),
    employee_approver_id UUID REFERENCES public.employees(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'revision_requested')),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. CREATE TABLE: premi_deres_assignment (Ancak Assignment to Employees)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_deres_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ancak_id UUID NOT NULL REFERENCES public.premi_deres_ancak_master(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    tanggal_mulai DATE NOT NULL,
    tanggal_akhir DATE,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'tidak_aktif')),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_ancak_employee_periode UNIQUE (ancak_id, employee_id, tanggal_mulai)
);

-- =====================================================
-- 7. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_premi_deres_produksi_tanggal ON public.premi_deres_produksi_harian(tanggal_produksi);
CREATE INDEX idx_premi_deres_produksi_ancak ON public.premi_deres_produksi_harian(ancak_id);
CREATE INDEX idx_premi_deres_produksi_employee ON public.premi_deres_produksi_harian(employee_id);
CREATE INDEX idx_premi_deres_produksi_status ON public.premi_deres_produksi_harian(status);

CREATE INDEX idx_premi_deres_quality_tanggal ON public.premi_deres_quality_check_harian(tanggal_pemeriksaan);
CREATE INDEX idx_premi_deres_quality_employee ON public.premi_deres_quality_check_harian(employee_id);
CREATE INDEX idx_premi_deres_quality_ancak ON public.premi_deres_quality_check_harian(ancak_id);

CREATE INDEX idx_premi_deres_periode_estate ON public.premi_deres_periode_perhitungan(estate_id);
CREATE INDEX idx_premi_deres_periode_status ON public.premi_deres_periode_perhitungan(status);
CREATE INDEX idx_premi_deres_periode_tanggal ON public.premi_deres_periode_perhitungan(tanggal_mulai, tanggal_akhir);

CREATE INDEX idx_premi_deres_hasil_periode ON public.premi_deres_hasil_perhitungan(periode_id);
CREATE INDEX idx_premi_deres_hasil_employee ON public.premi_deres_hasil_perhitungan(employee_id);
CREATE INDEX idx_premi_deres_hasil_jenis ON public.premi_deres_hasil_perhitungan(jenis_karyawan);

CREATE INDEX idx_premi_deres_approval_periode ON public.premi_deres_approval_log(periode_id);
CREATE INDEX idx_premi_deres_approval_level ON public.premi_deres_approval_log(level_approval);

CREATE INDEX idx_premi_deres_assignment_ancak ON public.premi_deres_assignment(ancak_id);
CREATE INDEX idx_premi_deres_assignment_employee ON public.premi_deres_assignment(employee_id);
CREATE INDEX idx_premi_deres_assignment_status ON public.premi_deres_assignment(status);

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.premi_deres_produksi_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_quality_check_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_periode_perhitungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_hasil_perhitungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_approval_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_deres_assignment ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CREATE RLS POLICIES
-- =====================================================

-- Policies for premi_deres_produksi_harian
CREATE POLICY "Super Admin can do everything on premi_deres_produksi_harian"
    ON public.premi_deres_produksi_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_deres_produksi_harian"
    ON public.premi_deres_produksi_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_deres_produksi_harian"
    ON public.premi_deres_produksi_harian FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_deres_quality_check_harian
CREATE POLICY "Super Admin can do everything on premi_deres_quality_check_harian"
    ON public.premi_deres_quality_check_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_deres_quality_check_harian"
    ON public.premi_deres_quality_check_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_deres_quality_check_harian"
    ON public.premi_deres_quality_check_harian FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_deres_periode_perhitungan
CREATE POLICY "Super Admin can do everything on premi_deres_periode"
    ON public.premi_deres_periode_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_deres_periode"
    ON public.premi_deres_periode_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_deres_periode"
    ON public.premi_deres_periode_perhitungan FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_deres_hasil_perhitungan
CREATE POLICY "Super Admin can do everything on premi_deres_hasil"
    ON public.premi_deres_hasil_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_deres_hasil"
    ON public.premi_deres_hasil_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_deres_hasil"
    ON public.premi_deres_hasil_perhitungan FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_deres_approval_log
CREATE POLICY "Super Admin can do everything on premi_deres_approval_log"
    ON public.premi_deres_approval_log FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_deres_approval_log"
    ON public.premi_deres_approval_log FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_deres_approval_log"
    ON public.premi_deres_approval_log FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_deres_assignment
CREATE POLICY "Super Admin can do everything on premi_deres_assignment"
    ON public.premi_deres_assignment FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_deres_assignment"
    ON public.premi_deres_assignment FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_deres_assignment"
    ON public.premi_deres_assignment FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- =====================================================
-- 10. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER trigger_update_premi_deres_produksi_harian
    BEFORE UPDATE ON public.premi_deres_produksi_harian
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_quality_check
    BEFORE UPDATE ON public.premi_deres_quality_check_harian
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_periode
    BEFORE UPDATE ON public.premi_deres_periode_perhitungan
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_hasil
    BEFORE UPDATE ON public.premi_deres_hasil_perhitungan
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_deres_assignment
    BEFORE UPDATE ON public.premi_deres_assignment
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

-- =====================================================
-- 11. ADD PERMISSIONS TO ROLE_PERMISSIONS
-- =====================================================

-- Add premi_deres_penggajian module permissions for super_admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_deres_penggajian', true, true, true, true
FROM public.roles r
WHERE r.code = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_deres_penggajian');

-- Add premi_deres_penggajian module permissions for admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_deres_penggajian', true, true, true, true
FROM public.roles r
WHERE r.code = 'admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_deres_penggajian');

-- Add premi_deres_penggajian module permissions for manager role (view only)
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_deres_penggajian', true, false, false, false
FROM public.roles r
WHERE r.code = 'manager'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_deres_penggajian');

-- Add premi_deres_laporan module permissions for all roles
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_deres_laporan', true, false, false, false
FROM public.roles r
WHERE r.code IN ('super_admin', 'admin', 'manager')
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_deres_laporan');

-- =====================================================
-- 12. COMMENTS
-- =====================================================
COMMENT ON TABLE public.premi_deres_produksi_harian IS 'Data input produksi deres harian per karyawan';
COMMENT ON TABLE public.premi_deres_quality_check_harian IS 'Data pemeriksaan kualitas deres harian per karyawan';
COMMENT ON TABLE public.premi_deres_periode_perhitungan IS 'Periode perhitungan premi deres bulanan';
COMMENT ON TABLE public.premi_deres_hasil_perhitungan IS 'Hasil perhitungan premi deres per karyawan per periode';
COMMENT ON TABLE public.premi_deres_approval_log IS 'Log approval workflow premi deres';
COMMENT ON TABLE public.premi_deres_assignment IS 'Penugasan ancak kepada karyawan penderes';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
