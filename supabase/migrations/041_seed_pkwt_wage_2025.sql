-- =====================================================
-- Migration: 041_seed_pkwt_wage_2025.sql
-- Description: Seed PKWT (Perjanjian Kerja Waktu Tertentu) wage data for 2025
-- Author: Sigma Payroll Team
-- Date: 2025-11-17
-- =====================================================

-- =====================================================
-- CLEAN EXISTING PKWT 2025 DATA (IF ANY)
-- =====================================================
DELETE FROM public.master_upah
WHERE tahun = 2025
AND golongan = 'pkwt';

-- =====================================================
-- INSERT PKWT WAGE SCALES FOR 2025
-- =====================================================
-- Note: This migration will insert PKWT wage for ALL divisions
-- PKWT (Perjanjian Kerja Waktu Tertentu) = Fixed-term Employment Contract

DO $$
DECLARE
    div_record RECORD;
BEGIN
    -- Loop through all divisions
    FOR div_record IN
        SELECT id FROM public.divisions
    LOOP
        -- =====================================================
        -- PKWT WAGE
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pkwt', 'PKWT', 3318250, 'PKWT - Perjanjian Kerja Waktu Tertentu', true);

        RAISE NOTICE 'Inserted PKWT wage for division: %', div_record.id;
    END LOOP;

    RAISE NOTICE 'PKWT wage data insertion completed successfully';
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- To verify the data, run:
-- SELECT d.kode_divisi, d.nama_divisi, mu.golongan, mu.skala, mu.upah_pokok
-- FROM public.master_upah mu
-- JOIN public.divisions d ON mu.divisi_id = d.id
-- WHERE mu.tahun = 2025 AND mu.golongan = 'pkwt'
-- ORDER BY d.kode_divisi;

-- =====================================================
-- SUMMARY QUERY
-- =====================================================
-- To see summary, run:
-- SELECT
--     golongan,
--     COUNT(*) as total_records,
--     MIN(upah_pokok) as upah_minimum,
--     MAX(upah_pokok) as upah_maximum
-- FROM public.master_upah
-- WHERE tahun = 2025
-- GROUP BY golongan
-- ORDER BY golongan;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This migration inserts PKWT wage scales for ALL divisions
-- Total records per division: 1
-- - PKWT: Rp 3,318,250
-- Year: 2025
--
-- PKWT (Perjanjian Kerja Waktu Tertentu) adalah kontrak kerja untuk
-- waktu tertentu, biasanya untuk proyek atau kebutuhan sementara.

-- =====================================================
-- END OF MIGRATION
-- =====================================================
