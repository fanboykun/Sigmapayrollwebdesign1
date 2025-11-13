-- =====================================================
-- Migration: 032_update_divisi_constraint.sql
-- Description: Update divisi CHECK constraint to support individual divisions
-- Author: Sigma Payroll Team
-- Date: 2025-11-13
-- =====================================================

-- =====================================================
-- 1. UPDATE premi_deres_produksi_normal constraint
-- =====================================================
ALTER TABLE public.premi_deres_produksi_normal
DROP CONSTRAINT IF EXISTS premi_deres_produksi_normal_divisi_check;

ALTER TABLE public.premi_deres_produksi_normal
ADD CONSTRAINT premi_deres_produksi_normal_divisi_check
CHECK (divisi IN ('AP_DIV_I', 'AP_DIV_II', 'AP_DIV_III', 'AP_DIV_IV', 'AP_DIV_V', 'AP_DIV_VI', 'AP_DIV_I_III', 'AP_DIV_IV_VI'));

-- =====================================================
-- 2. UPDATE premi_deres_tetel constraint
-- =====================================================
ALTER TABLE public.premi_deres_tetel
DROP CONSTRAINT IF EXISTS premi_deres_tetel_divisi_check;

ALTER TABLE public.premi_deres_tetel
ADD CONSTRAINT premi_deres_tetel_divisi_check
CHECK (divisi IN ('AP_DIV_I', 'AP_DIV_II', 'AP_DIV_III', 'AP_DIV_IV', 'AP_DIV_V', 'AP_DIV_VI', 'AP_DIV_I_III', 'AP_DIV_IV_VI'));

-- =====================================================
-- 3. UPDATE premi_deres_biaya_cuci_mangkok constraint
-- =====================================================
ALTER TABLE public.premi_deres_biaya_cuci_mangkok
DROP CONSTRAINT IF EXISTS premi_deres_biaya_cuci_mangkok_divisi_check;

ALTER TABLE public.premi_deres_biaya_cuci_mangkok
ADD CONSTRAINT premi_deres_biaya_cuci_mangkok_divisi_check
CHECK (divisi IN ('AP_DIV_I', 'AP_DIV_II', 'AP_DIV_III', 'AP_DIV_IV', 'AP_DIV_V', 'AP_DIV_VI', 'AP_DIV_I_III', 'AP_DIV_IV_VI'));

-- =====================================================
-- 4. UPDATE premi_deres_ancak_master constraint (if exists)
-- =====================================================
ALTER TABLE public.premi_deres_ancak_master
DROP CONSTRAINT IF EXISTS premi_deres_ancak_master_divisi_check;

ALTER TABLE public.premi_deres_ancak_master
ADD CONSTRAINT premi_deres_ancak_master_divisi_check
CHECK (divisi IN ('AP_DIV_I', 'AP_DIV_II', 'AP_DIV_III', 'AP_DIV_IV', 'AP_DIV_V', 'AP_DIV_VI', 'AP_DIV_I_III', 'AP_DIV_IV_VI'));

-- =====================================================
-- END OF MIGRATION
-- =====================================================
