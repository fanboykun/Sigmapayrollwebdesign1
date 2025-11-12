-- =====================================================
-- Migration: 026_premi_kebun_transaksi.sql
-- Description: Create transaction tables for Premi Kebun (Harvest Data & Calculations)
-- Author: Sigma Payroll Team
-- Date: 2025-11-12
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: premi_panen_harian (Daily Harvest Input)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_panen_harian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal_panen DATE NOT NULL,
    blok_id UUID NOT NULL REFERENCES public.premi_blok_kebun(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    tipe_hari VARCHAR(20) DEFAULT 'hari_biasa' CHECK (tipe_hari IN ('hari_biasa', 'jumat', 'minggu_libur')),
    janjang_dipanen INTEGER NOT NULL CHECK (janjang_dipanen >= 0),
    basis_janjang INTEGER NOT NULL,
    basis_dicapai NUMERIC(10,2),
    kategori_premi VARCHAR(20),
    mandor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    kerani_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    keterangan TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'processed')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_tanggal_blok_employee UNIQUE (tanggal_panen, blok_id, employee_id)
);

-- =====================================================
-- 2. CREATE TABLE: premi_denda_harian (Daily Penalties Input)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_denda_harian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    blok_id UUID NOT NULL REFERENCES public.premi_blok_kebun(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    denda_id UUID NOT NULL REFERENCES public.premi_denda(id) ON DELETE RESTRICT,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    nilai_satuan NUMERIC(15,2) NOT NULL,
    total_denda NUMERIC(15,2) GENERATED ALWAYS AS (jumlah * nilai_satuan) STORED,
    dikenakan_oleh_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    keterangan TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'processed')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. CREATE TABLE: premi_periode_perhitungan (Calculation Period)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_periode_perhitungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    konfigurasi_id UUID NOT NULL REFERENCES public.premi_konfigurasi(id) ON DELETE RESTRICT,
    estate_id TEXT NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
    periode_nama VARCHAR(100) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_akhir DATE NOT NULL,
    total_karyawan INTEGER DEFAULT 0,
    total_premi_kotor NUMERIC(15,2) DEFAULT 0,
    total_denda NUMERIC(15,2) DEFAULT 0,
    total_premi_netto NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'reviewed', 'approved', 'integrated')),
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    processed_by UUID REFERENCES public.users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_estate_periode UNIQUE (estate_id, tanggal_mulai, tanggal_akhir)
);

-- =====================================================
-- 4. CREATE TABLE: premi_hasil_perhitungan (Calculation Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_hasil_perhitungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periode_id UUID NOT NULL REFERENCES public.premi_periode_perhitungan(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    jenis_karyawan VARCHAR(20) NOT NULL CHECK (jenis_karyawan IN ('pemanen', 'mandor_panen', 'mandor_i', 'kerani_buah')),

    -- For Pemanen (Harvester)
    total_hari_kerja INTEGER DEFAULT 0,
    total_janjang_dipanen INTEGER DEFAULT 0,
    total_basis_dicapai NUMERIC(10,2) DEFAULT 0,
    rata_rata_basis NUMERIC(10,2) DEFAULT 0,
    premi_lebih_basis NUMERIC(15,2) DEFAULT 0,
    premi_siap_1_basis NUMERIC(15,2) DEFAULT 0,
    premi_siap_2_basis NUMERIC(15,2) DEFAULT 0,
    premi_siap_3_basis NUMERIC(15,2) DEFAULT 0,
    premi_overtime NUMERIC(15,2) DEFAULT 0,
    total_premi_kotor NUMERIC(15,2) DEFAULT 0,
    total_denda NUMERIC(15,2) DEFAULT 0,
    premi_netto NUMERIC(15,2) DEFAULT 0,

    -- For Mandor/Kerani (Supervisor)
    jumlah_bawahan INTEGER,
    total_premi_bawahan NUMERIC(15,2),
    persentase_premi NUMERIC(5,2),
    multiplier_premi NUMERIC(5,2),

    status VARCHAR(20) DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_periode_employee UNIQUE (periode_id, employee_id)
);

-- =====================================================
-- 5. CREATE TABLE: premi_approval_log (Approval Workflow)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_approval_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periode_id UUID NOT NULL REFERENCES public.premi_periode_perhitungan(id) ON DELETE CASCADE,
    level_approval INTEGER NOT NULL CHECK (level_approval IN (1, 2, 3)),
    level_nama VARCHAR(50) NOT NULL,
    approved_by UUID NOT NULL REFERENCES public.users(id),
    employee_approver_id UUID REFERENCES public.employees(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'revision_requested')),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. CREATE TABLE: premi_adjustment_blok (Block Basis Adjustment)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.premi_adjustment_blok (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periode_id UUID NOT NULL REFERENCES public.premi_periode_perhitungan(id) ON DELETE CASCADE,
    blok_dari_id UUID NOT NULL REFERENCES public.premi_blok_kebun(id),
    blok_ke_id UUID NOT NULL REFERENCES public.premi_blok_kebun(id),
    basis_target INTEGER NOT NULL,
    basis_tercapai INTEGER NOT NULL,
    persentase_kekurangan NUMERIC(5,2) NOT NULL,
    jumlah_adjustment INTEGER NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 7. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_premi_panen_tanggal ON public.premi_panen_harian(tanggal_panen);
CREATE INDEX idx_premi_panen_blok ON public.premi_panen_harian(blok_id);
CREATE INDEX idx_premi_panen_employee ON public.premi_panen_harian(employee_id);
CREATE INDEX idx_premi_panen_status ON public.premi_panen_harian(status);

CREATE INDEX idx_premi_denda_tanggal ON public.premi_denda_harian(tanggal);
CREATE INDEX idx_premi_denda_employee ON public.premi_denda_harian(employee_id);
CREATE INDEX idx_premi_denda_blok ON public.premi_denda_harian(blok_id);

CREATE INDEX idx_premi_periode_estate ON public.premi_periode_perhitungan(estate_id);
CREATE INDEX idx_premi_periode_status ON public.premi_periode_perhitungan(status);
CREATE INDEX idx_premi_periode_tanggal ON public.premi_periode_perhitungan(tanggal_mulai, tanggal_akhir);

CREATE INDEX idx_premi_hasil_periode ON public.premi_hasil_perhitungan(periode_id);
CREATE INDEX idx_premi_hasil_employee ON public.premi_hasil_perhitungan(employee_id);
CREATE INDEX idx_premi_hasil_jenis ON public.premi_hasil_perhitungan(jenis_karyawan);

CREATE INDEX idx_premi_approval_periode ON public.premi_approval_log(periode_id);
CREATE INDEX idx_premi_approval_level ON public.premi_approval_log(level_approval);

CREATE INDEX idx_premi_adjustment_periode ON public.premi_adjustment_blok(periode_id);

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.premi_panen_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_denda_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_periode_perhitungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_hasil_perhitungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_approval_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premi_adjustment_blok ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CREATE RLS POLICIES
-- =====================================================

-- Policies for premi_panen_harian
CREATE POLICY "Super Admin can do everything on premi_panen_harian"
    ON public.premi_panen_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_panen_harian"
    ON public.premi_panen_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_panen_harian"
    ON public.premi_panen_harian FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_denda_harian
CREATE POLICY "Super Admin can do everything on premi_denda_harian"
    ON public.premi_denda_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_denda_harian"
    ON public.premi_denda_harian FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_denda_harian"
    ON public.premi_denda_harian FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_periode_perhitungan
CREATE POLICY "Super Admin can do everything on premi_periode"
    ON public.premi_periode_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_periode"
    ON public.premi_periode_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_periode"
    ON public.premi_periode_perhitungan FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_hasil_perhitungan
CREATE POLICY "Super Admin can do everything on premi_hasil"
    ON public.premi_hasil_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_hasil"
    ON public.premi_hasil_perhitungan FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_hasil"
    ON public.premi_hasil_perhitungan FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_approval_log
CREATE POLICY "Super Admin can do everything on premi_approval_log"
    ON public.premi_approval_log FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_approval_log"
    ON public.premi_approval_log FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_approval_log"
    ON public.premi_approval_log FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- Policies for premi_adjustment_blok
CREATE POLICY "Super Admin can do everything on premi_adjustment_blok"
    ON public.premi_adjustment_blok FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'super_admin'));

CREATE POLICY "Admin can do everything on premi_adjustment_blok"
    ON public.premi_adjustment_blok FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'admin'));

CREATE POLICY "Manager can view premi_adjustment_blok"
    ON public.premi_adjustment_blok FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.code = 'manager'));

-- =====================================================
-- 10. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER trigger_update_premi_panen_harian
    BEFORE UPDATE ON public.premi_panen_harian
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_denda_harian
    BEFORE UPDATE ON public.premi_denda_harian
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_periode
    BEFORE UPDATE ON public.premi_periode_perhitungan
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

CREATE TRIGGER trigger_update_premi_hasil
    BEFORE UPDATE ON public.premi_hasil_perhitungan
    FOR EACH ROW EXECUTE FUNCTION update_premi_updated_at();

-- =====================================================
-- 11. ADD PERMISSIONS TO ROLE_PERMISSIONS
-- =====================================================

-- Add premi_penggajian module permissions for super_admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_penggajian', true, true, true, true
FROM public.roles r
WHERE r.code = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_penggajian');

-- Add premi_penggajian module permissions for admin role
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_penggajian', true, true, true, true
FROM public.roles r
WHERE r.code = 'admin'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_penggajian');

-- Add premi_penggajian module permissions for manager role (view only)
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_penggajian', true, false, false, false
FROM public.roles r
WHERE r.code = 'manager'
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_penggajian');

-- Add premi_laporan module permissions for all roles
INSERT INTO public.role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT r.id, 'premi_laporan', true, false, false, false
FROM public.roles r
WHERE r.code IN ('super_admin', 'admin', 'manager')
AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id = r.id AND rp.module_name = 'premi_laporan');

-- =====================================================
-- 12. COMMENTS
-- =====================================================
COMMENT ON TABLE public.premi_panen_harian IS 'Data input panen harian per karyawan';
COMMENT ON TABLE public.premi_denda_harian IS 'Data input denda/sanksi harian per karyawan';
COMMENT ON TABLE public.premi_periode_perhitungan IS 'Periode perhitungan premi bulanan';
COMMENT ON TABLE public.premi_hasil_perhitungan IS 'Hasil perhitungan premi per karyawan per periode';
COMMENT ON TABLE public.premi_approval_log IS 'Log approval workflow premi';
COMMENT ON TABLE public.premi_adjustment_blok IS 'Adjustment basis antar blok untuk shortage';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
