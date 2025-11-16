-- =====================================================
-- Seed Data for Master Upah (Simplified)
-- Run this in Supabase SQL Editor after migration 033
-- =====================================================

-- Get division IDs first
DO $$
DECLARE
    div_bb TEXT;
    div_tg TEXT;
    div_ap TEXT;
    div_al TEXT;
BEGIN
    -- Get division IDs
    SELECT id INTO div_bb FROM divisions WHERE kode_divisi = 'BB' LIMIT 1;
    SELECT id INTO div_tg FROM divisions WHERE kode_divisi = 'TG' LIMIT 1;
    SELECT id INTO div_ap FROM divisions WHERE kode_divisi = 'AP' LIMIT 1;
    SELECT id INTO div_al FROM divisions WHERE kode_divisi = 'AL' LIMIT 1;

    -- Insert wage scales for 2024
    INSERT INTO master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
    -- Bangun Bandar (BB) - 2024
    (2024, div_bb, 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, div_bb, 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, div_bb, 'pegawai', 'I-3', 3000000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2024, div_bb, 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, div_bb, 'karyawan', 'II-2', 2950000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2024, div_bb, 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true),

    -- Tanah Gambus (TG) - 2024
    (2024, div_tg, 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, div_tg, 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, div_tg, 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, div_tg, 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true),

    -- Aek Pamienke (AP) - 2024
    (2024, div_ap, 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, div_ap, 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, div_ap, 'pegawai', 'I-3', 3000000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2024, div_ap, 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, div_ap, 'karyawan', 'II-2', 2950000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2024, div_ap, 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true),

    -- Aek Loba (AL) - 2024
    (2024, div_al, 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, div_al, 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, div_al, 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, div_al, 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true),

    -- Insert wage scales for 2025
    -- Bangun Bandar (BB) - 2025
    (2025, div_bb, 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, div_bb, 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, div_bb, 'pegawai', 'I-3', 3150000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2025, div_bb, 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, div_bb, 'karyawan', 'II-2', 3100000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2025, div_bb, 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true),

    -- Tanah Gambus (TG) - 2025
    (2025, div_tg, 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, div_tg, 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, div_tg, 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, div_tg, 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true),

    -- Aek Pamienke (AP) - 2025
    (2025, div_ap, 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, div_ap, 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, div_ap, 'pegawai', 'I-3', 3150000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2025, div_ap, 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, div_ap, 'karyawan', 'II-2', 3100000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2025, div_ap, 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true),

    -- Aek Loba (AL) - 2025
    (2025, div_al, 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, div_al, 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, div_al, 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, div_al, 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)

    ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

    RAISE NOTICE 'Seed data inserted successfully!';
END $$;
