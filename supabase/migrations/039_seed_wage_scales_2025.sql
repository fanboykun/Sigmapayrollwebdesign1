-- =====================================================
-- Migration: 039_seed_wage_scales_2025.sql
-- Description: Seed wage scales data for 2025
-- Author: Sigma Payroll Team
-- Date: 2025-11-17
-- =====================================================

-- =====================================================
-- CLEAN EXISTING 2025 DATA (IF ANY)
-- =====================================================
DELETE FROM public.master_upah WHERE tahun = 2025;

-- =====================================================
-- INSERT WAGE SCALES FOR 2025
-- =====================================================
-- Note: This migration will use the first available division
-- or you can manually specify a division_id
-- The data will be inserted for ALL divisions in the system

-- Get all division IDs and insert wage scales for each
DO $$
DECLARE
    div_record RECORD;
BEGIN
    -- Loop through all divisions
    FOR div_record IN
        SELECT id FROM public.divisions
    LOOP
        -- =====================================================
        -- GRADE I (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'I-1', 3705100, 'Grade I Level 1', true),
        (2025, div_record.id, 'pegawai', 'I-2', 3716600, 'Grade I Level 2', true),
        (2025, div_record.id, 'pegawai', 'I-3', 3727200, 'Grade I Level 3', true),
        (2025, div_record.id, 'pegawai', 'I-4', 3738500, 'Grade I Level 4', true),
        (2025, div_record.id, 'pegawai', 'I-5', 3751100, 'Grade I Level 5', true),
        (2025, div_record.id, 'pegawai', 'I-6', 3761800, 'Grade I Level 6', true),
        (2025, div_record.id, 'pegawai', 'I-7', 3773800, 'Grade I Level 7', true),
        (2025, div_record.id, 'pegawai', 'I-8', 3788900, 'Grade I Level 8', true),
        (2025, div_record.id, 'pegawai', 'I-9', 3802800, 'Grade I Level 9', true),
        (2025, div_record.id, 'pegawai', 'I-M', 3816800, 'Grade I Level Maximum', true);

        -- =====================================================
        -- GRADE II (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'II-1', 3858900, 'Grade II Level 1', true),
        (2025, div_record.id, 'pegawai', 'II-2', 3874800, 'Grade II Level 2', true),
        (2025, div_record.id, 'pegawai', 'II-3', 3889300, 'Grade II Level 3', true),
        (2025, div_record.id, 'pegawai', 'II-4', 3905200, 'Grade II Level 4', true),
        (2025, div_record.id, 'pegawai', 'II-5', 3920300, 'Grade II Level 5', true),
        (2025, div_record.id, 'pegawai', 'II-6', 3935800, 'Grade II Level 6', true),
        (2025, div_record.id, 'pegawai', 'II-7', 3951800, 'Grade II Level 7', true),
        (2025, div_record.id, 'pegawai', 'II-8', 3967500, 'Grade II Level 8', true),
        (2025, div_record.id, 'pegawai', 'II-9', 3982800, 'Grade II Level 9', true),
        (2025, div_record.id, 'pegawai', 'II-M', 3998600, 'Grade II Level Maximum', true);

        -- =====================================================
        -- GRADE III (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'III-1', 4014700, 'Grade III Level 1', true),
        (2025, div_record.id, 'pegawai', 'III-2', 4030400, 'Grade III Level 2', true),
        (2025, div_record.id, 'pegawai', 'III-3', 4047000, 'Grade III Level 3', true),
        (2025, div_record.id, 'pegawai', 'III-4', 4064700, 'Grade III Level 4', true),
        (2025, div_record.id, 'pegawai', 'III-5', 4080800, 'Grade III Level 5', true),
        (2025, div_record.id, 'pegawai', 'III-6', 4097800, 'Grade III Level 6', true),
        (2025, div_record.id, 'pegawai', 'III-7', 4115200, 'Grade III Level 7', true),
        (2025, div_record.id, 'pegawai', 'III-8', 4131800, 'Grade III Level 8', true),
        (2025, div_record.id, 'pegawai', 'III-9', 4148400, 'Grade III Level 9', true),
        (2025, div_record.id, 'pegawai', 'III-M', 4167300, 'Grade III Level Maximum', true);

        -- =====================================================
        -- GRADE IV (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'IV-1', 4167900, 'Grade IV Level 1', true),
        (2025, div_record.id, 'pegawai', 'IV-2', 4186300, 'Grade IV Level 2', true),
        (2025, div_record.id, 'pegawai', 'IV-3', 4204900, 'Grade IV Level 3', true),
        (2025, div_record.id, 'pegawai', 'IV-4', 4223000, 'Grade IV Level 4', true),
        (2025, div_record.id, 'pegawai', 'IV-5', 4241100, 'Grade IV Level 5', true),
        (2025, div_record.id, 'pegawai', 'IV-6', 4259300, 'Grade IV Level 6', true),
        (2025, div_record.id, 'pegawai', 'IV-7', 4276900, 'Grade IV Level 7', true),
        (2025, div_record.id, 'pegawai', 'IV-8', 4295200, 'Grade IV Level 8', true),
        (2025, div_record.id, 'pegawai', 'IV-9', 4313800, 'Grade IV Level 9', true),
        (2025, div_record.id, 'pegawai', 'IV-M', 4333000, 'Grade IV Level Maximum', true);

        -- =====================================================
        -- GRADE V (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'V-1', 4354700, 'Grade V Level 1', true),
        (2025, div_record.id, 'pegawai', 'V-2', 4374200, 'Grade V Level 2', true),
        (2025, div_record.id, 'pegawai', 'V-3', 4393100, 'Grade V Level 3', true),
        (2025, div_record.id, 'pegawai', 'V-4', 4412000, 'Grade V Level 4', true),
        (2025, div_record.id, 'pegawai', 'V-5', 4431700, 'Grade V Level 5', true),
        (2025, div_record.id, 'pegawai', 'V-6', 4451300, 'Grade V Level 6', true),
        (2025, div_record.id, 'pegawai', 'V-7', 4470400, 'Grade V Level 7', true),
        (2025, div_record.id, 'pegawai', 'V-8', 4490100, 'Grade V Level 8', true),
        (2025, div_record.id, 'pegawai', 'V-9', 4511000, 'Grade V Level 9', true),
        (2025, div_record.id, 'pegawai', 'V-M', 4531700, 'Grade V Level Maximum', true);

        -- =====================================================
        -- GRADE VI (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'VI-1', 4564800, 'Grade VI Level 1', true),
        (2025, div_record.id, 'pegawai', 'VI-2', 4585700, 'Grade VI Level 2', true),
        (2025, div_record.id, 'pegawai', 'VI-3', 4605900, 'Grade VI Level 3', true),
        (2025, div_record.id, 'pegawai', 'VI-4', 4626800, 'Grade VI Level 4', true),
        (2025, div_record.id, 'pegawai', 'VI-5', 4648700, 'Grade VI Level 5', true),
        (2025, div_record.id, 'pegawai', 'VI-6', 4669600, 'Grade VI Level 6', true),
        (2025, div_record.id, 'pegawai', 'VI-7', 4692700, 'Grade VI Level 7', true),
        (2025, div_record.id, 'pegawai', 'VI-8', 4712500, 'Grade VI Level 8', true),
        (2025, div_record.id, 'pegawai', 'VI-9', 4734500, 'Grade VI Level 9', true),
        (2025, div_record.id, 'pegawai', 'VI-M', 4756300, 'Grade VI Level Maximum', true);

        -- =====================================================
        -- GRADE VII (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'VII-1', 4801900, 'Grade VII Level 1', true),
        (2025, div_record.id, 'pegawai', 'VII-2', 4826100, 'Grade VII Level 2', true),
        (2025, div_record.id, 'pegawai', 'VII-3', 4854800, 'Grade VII Level 3', true),
        (2025, div_record.id, 'pegawai', 'VII-4', 4886400, 'Grade VII Level 4', true),
        (2025, div_record.id, 'pegawai', 'VII-5', 4916300, 'Grade VII Level 5', true),
        (2025, div_record.id, 'pegawai', 'VII-6', 4946300, 'Grade VII Level 6', true),
        (2025, div_record.id, 'pegawai', 'VII-7', 4957600, 'Grade VII Level 7', true),
        (2025, div_record.id, 'pegawai', 'VII-8', 5007400, 'Grade VII Level 8', true),
        (2025, div_record.id, 'pegawai', 'VII-9', 5038300, 'Grade VII Level 9', true),
        (2025, div_record.id, 'pegawai', 'VII-M', 5069700, 'Grade VII Level Maximum', true);

        -- =====================================================
        -- GRADE VIII (Pegawai)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'pegawai', 'VIII-1', 5153600, 'Grade VIII Level 1', true),
        (2025, div_record.id, 'pegawai', 'VIII-2', 5184000, 'Grade VIII Level 2', true),
        (2025, div_record.id, 'pegawai', 'VIII-3', 5216800, 'Grade VIII Level 3', true),
        (2025, div_record.id, 'pegawai', 'VIII-4', 5248800, 'Grade VIII Level 4', true),
        (2025, div_record.id, 'pegawai', 'VIII-5', 5280800, 'Grade VIII Level 5', true),
        (2025, div_record.id, 'pegawai', 'VIII-6', 5313600, 'Grade VIII Level 6', true),
        (2025, div_record.id, 'pegawai', 'VIII-7', 5346600, 'Grade VIII Level 7', true),
        (2025, div_record.id, 'pegawai', 'VIII-8', 5378800, 'Grade VIII Level 8', true),
        (2025, div_record.id, 'pegawai', 'VIII-9', 5411700, 'Grade VIII Level 9', true),
        (2025, div_record.id, 'pegawai', 'VIII-M', 5450600, 'Grade VIII Level Maximum', true);

        -- =====================================================
        -- GRADE KI (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KI-0', 3318250, 'Grade KI Level 0', true),
        (2025, div_record.id, 'karyawan', 'KI-1', 3328250, 'Grade KI Level 1', true),
        (2025, div_record.id, 'karyawan', 'KI-2', 3330250, 'Grade KI Level 2', true),
        (2025, div_record.id, 'karyawan', 'KI-3', 3332250, 'Grade KI Level 3', true),
        (2025, div_record.id, 'karyawan', 'KI-4', 3334250, 'Grade KI Level 4', true),
        (2025, div_record.id, 'karyawan', 'KI-5', 3336250, 'Grade KI Level 5', true);

        -- =====================================================
        -- GRADE KII (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KII-1', 3338250, 'Grade KII Level 1', true),
        (2025, div_record.id, 'karyawan', 'KII-2', 3340250, 'Grade KII Level 2', true),
        (2025, div_record.id, 'karyawan', 'KII-3', 3342250, 'Grade KII Level 3', true),
        (2025, div_record.id, 'karyawan', 'KII-4', 3344250, 'Grade KII Level 4', true),
        (2025, div_record.id, 'karyawan', 'KII-5', 3346250, 'Grade KII Level 5', true),
        (2025, div_record.id, 'karyawan', 'KII-6', 3347250, 'Grade KII Level 6', true);

        -- =====================================================
        -- GRADE KIII (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KIII-1', 3348250, 'Grade KIII Level 1', true),
        (2025, div_record.id, 'karyawan', 'KIII-2', 3350250, 'Grade KIII Level 2', true),
        (2025, div_record.id, 'karyawan', 'KIII-3', 3352250, 'Grade KIII Level 3', true),
        (2025, div_record.id, 'karyawan', 'KIII-4', 3354250, 'Grade KIII Level 4', true),
        (2025, div_record.id, 'karyawan', 'KIII-5', 3356250, 'Grade KIII Level 5', true),
        (2025, div_record.id, 'karyawan', 'KIII-6', 3357250, 'Grade KIII Level 6', true);

        -- =====================================================
        -- GRADE KIV (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KIV-1', 3358250, 'Grade KIV Level 1', true),
        (2025, div_record.id, 'karyawan', 'KIV-2', 3360250, 'Grade KIV Level 2', true),
        (2025, div_record.id, 'karyawan', 'KIV-3', 3362250, 'Grade KIV Level 3', true),
        (2025, div_record.id, 'karyawan', 'KIV-4', 3364250, 'Grade KIV Level 4', true),
        (2025, div_record.id, 'karyawan', 'KIV-5', 3366250, 'Grade KIV Level 5', true),
        (2025, div_record.id, 'karyawan', 'KIV-6', 3367250, 'Grade KIV Level 6', true);

        -- =====================================================
        -- GRADE KV (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KV-1', 3368250, 'Grade KV Level 1', true),
        (2025, div_record.id, 'karyawan', 'KV-2', 3370250, 'Grade KV Level 2', true),
        (2025, div_record.id, 'karyawan', 'KV-3', 3372250, 'Grade KV Level 3', true),
        (2025, div_record.id, 'karyawan', 'KV-4', 3374250, 'Grade KV Level 4', true),
        (2025, div_record.id, 'karyawan', 'KV-5', 3376250, 'Grade KV Level 5', true),
        (2025, div_record.id, 'karyawan', 'KV-6', 3377250, 'Grade KV Level 6', true);

        -- =====================================================
        -- GRADE KVI (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KVI-1', 3378250, 'Grade KVI Level 1', true),
        (2025, div_record.id, 'karyawan', 'KVI-2', 3380250, 'Grade KVI Level 2', true),
        (2025, div_record.id, 'karyawan', 'KVI-3', 3382250, 'Grade KVI Level 3', true),
        (2025, div_record.id, 'karyawan', 'KVI-4', 3384250, 'Grade KVI Level 4', true),
        (2025, div_record.id, 'karyawan', 'KVI-5', 3386250, 'Grade KVI Level 5', true),
        (2025, div_record.id, 'karyawan', 'KVI-6', 3387250, 'Grade KVI Level 6', true);

        -- =====================================================
        -- GRADE KVII (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KVII-1', 3388250, 'Grade KVII Level 1', true),
        (2025, div_record.id, 'karyawan', 'KVII-2', 3390250, 'Grade KVII Level 2', true),
        (2025, div_record.id, 'karyawan', 'KVII-3', 3392250, 'Grade KVII Level 3', true),
        (2025, div_record.id, 'karyawan', 'KVII-4', 3394250, 'Grade KVII Level 4', true),
        (2025, div_record.id, 'karyawan', 'KVII-5', 3396250, 'Grade KVII Level 5', true),
        (2025, div_record.id, 'karyawan', 'KVII-6', 3398250, 'Grade KVII Level 6', true);

        -- =====================================================
        -- GRADE KVIII (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KVIII-1', 3400250, 'Grade KVIII Level 1', true),
        (2025, div_record.id, 'karyawan', 'KVIII-2', 3402250, 'Grade KVIII Level 2', true),
        (2025, div_record.id, 'karyawan', 'KVIII-3', 3404250, 'Grade KVIII Level 3', true),
        (2025, div_record.id, 'karyawan', 'KVIII-4', 3406250, 'Grade KVIII Level 4', true),
        (2025, div_record.id, 'karyawan', 'KVIII-5', 3408250, 'Grade KVIII Level 5', true),
        (2025, div_record.id, 'karyawan', 'KVIII-6', 3410250, 'Grade KVIII Level 6', true);

        -- =====================================================
        -- GRADE KIX (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KIX-1', 3412250, 'Grade KIX Level 1', true),
        (2025, div_record.id, 'karyawan', 'KIX-2', 3414250, 'Grade KIX Level 2', true),
        (2025, div_record.id, 'karyawan', 'KIX-3', 3416250, 'Grade KIX Level 3', true),
        (2025, div_record.id, 'karyawan', 'KIX-4', 3418250, 'Grade KIX Level 4', true),
        (2025, div_record.id, 'karyawan', 'KIX-5', 3420250, 'Grade KIX Level 5', true),
        (2025, div_record.id, 'karyawan', 'KIX-6', 3422250, 'Grade KIX Level 6', true);

        -- =====================================================
        -- GRADE KX (Karyawan)
        -- =====================================================
        INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
        (2025, div_record.id, 'karyawan', 'KX-1', 3424250, 'Grade KX Level 1', true),
        (2025, div_record.id, 'karyawan', 'KX-2', 3426250, 'Grade KX Level 2', true),
        (2025, div_record.id, 'karyawan', 'KX-3', 3428250, 'Grade KX Level 3', true),
        (2025, div_record.id, 'karyawan', 'KX-4', 3430250, 'Grade KX Level 4', true),
        (2025, div_record.id, 'karyawan', 'KX-5', 3432250, 'Grade KX Level 5', true),
        (2025, div_record.id, 'karyawan', 'KX-6', 3433250, 'Grade KX Level 6', true);

        RAISE NOTICE 'Inserted wage scales for division: %', div_record.id;
    END LOOP;

    RAISE NOTICE 'Wage data insertion completed successfully';
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- To verify the data, run:
-- SELECT d.kode_divisi, d.nama_divisi, mu.golongan, mu.skala, mu.upah_pokok
-- FROM public.master_upah mu
-- JOIN public.divisions d ON mu.divisi_id = d.id
-- WHERE mu.tahun = 2025
-- ORDER BY d.kode_divisi, mu.golongan, mu.skala;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This migration will insert wage scales for ALL divisions
-- Total records per division: 140
-- - Pegawai grades (I-VIII): 80 records (10 levels each × 8 grades)
-- - Karyawan grades (KI-KX): 60 records
--   * KI: 6 levels (0-5)
--   * KII-KX: 6 levels each (1-6) × 9 grades = 54
--   * Total: 60 Karyawan records
-- Year: 2025
-- Note: PKWT data is in separate migration 041

-- =====================================================
-- END OF MIGRATION
-- =====================================================
