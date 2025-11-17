-- =====================================================
-- Migration: 033_master_upah.sql
-- Description: Create master upah (wage scales) table
-- Author: Sigma Payroll Team
-- Date: 2025-11-16
-- =====================================================

-- =====================================================
-- 1. CREATE master_upah TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.master_upah (
    id TEXT PRIMARY KEY DEFAULT concat('wage-', gen_random_uuid()::text),
    tahun INTEGER NOT NULL,
    divisi_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    golongan TEXT NOT NULL CHECK (golongan IN ('pegawai', 'karyawan', 'pkwt')),
    skala TEXT NOT NULL,
    upah_pokok NUMERIC(15, 2) NOT NULL,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique combination of year, division, grade, and scale
    UNIQUE(tahun, divisi_id, golongan, skala)
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_master_upah_tahun ON public.master_upah(tahun);
CREATE INDEX IF NOT EXISTS idx_master_upah_divisi_id ON public.master_upah(divisi_id);
CREATE INDEX IF NOT EXISTS idx_master_upah_golongan ON public.master_upah(golongan);
CREATE INDEX IF NOT EXISTS idx_master_upah_is_active ON public.master_upah(is_active);

-- =====================================================
-- 3. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_master_upah_updated_at
    BEFORE UPDATE ON public.master_upah
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.master_upah ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Policy: Allow authenticated users to view all wage data
CREATE POLICY "Allow authenticated users to view wage data"
    ON public.master_upah
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert wage data
CREATE POLICY "Allow authenticated users to insert wage data"
    ON public.master_upah
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update wage data
CREATE POLICY "Allow authenticated users to update wage data"
    ON public.master_upah
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete wage data
CREATE POLICY "Allow authenticated users to delete wage data"
    ON public.master_upah
    FOR DELETE
    TO authenticated
    USING (true);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
