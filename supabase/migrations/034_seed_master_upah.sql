-- =====================================================
-- Migration: 034_seed_master_upah.sql
-- Description: Seed data for master upah (wage scales)
-- Author: Sigma Payroll Team
-- Date: 2025-11-16
-- =====================================================

-- NOTE: Menggunakan divisi yang ada di database
-- Divisi yang tersedia: AL, AP, BB, LB, MP, NL, SL, SM, SN, TB, TG

-- =====================================================
-- INSERT SAMPLE WAGE SCALES DATA - TAHUN 2024
-- =====================================================

-- TAHUN 2024 - Divisi Bangun Bandar (BB)
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pegawai', 'I-3', 3000000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'karyawan', 'II-2', 2950000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- TAHUN 2024 - Divisi Tanah Gambus (TG)
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- TAHUN 2024 - Divisi Aek Pamienke (AP)
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pegawai', 'I-3', 3000000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'karyawan', 'II-2', 2950000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- TAHUN 2024 - Divisi Aek Loba (AL)
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'pegawai', 'I-1', 2900000, 'Pegawai tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'pegawai', 'I-2', 2950000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'karyawan', 'II-1', 2900000, 'Karyawan tingkat awal', true),
    (2024, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'pkwt', 'III-1', 2900000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- =====================================================
-- INSERT SAMPLE WAGE SCALES DATA - TAHUN 2025
-- =====================================================

-- TAHUN 2025 - Divisi Bangun Bandar (BB) - Dengan kenaikan upah
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pegawai', 'I-3', 3150000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'karyawan', 'II-2', 3100000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'BB' LIMIT 1), 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- TAHUN 2025 - Divisi Tanah Gambus (TG) - Dengan kenaikan upah
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'TG' LIMIT 1), 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- TAHUN 2025 - Divisi Aek Pamienke (AP) - Dengan kenaikan upah
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pegawai', 'I-3', 3150000, 'Pegawai dengan pengalaman 2-3 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'karyawan', 'II-2', 3100000, 'Karyawan dengan pengalaman 1-2 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AP' LIMIT 1), 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- TAHUN 2025 - Divisi Aek Loba (AL) - Dengan kenaikan upah
INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active)
VALUES
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'pegawai', 'I-1', 3050000, 'Pegawai tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'pegawai', 'I-2', 3100000, 'Pegawai dengan pengalaman 1-2 tahun', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'karyawan', 'II-1', 3050000, 'Karyawan tingkat awal', true),
    (2025, (SELECT id FROM divisions WHERE kode_divisi = 'AL' LIMIT 1), 'pkwt', 'III-1', 3050000, 'Karyawan Kontrak (PKWT) sesuai UMP', true)
ON CONFLICT (tahun, divisi_id, golongan, skala) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Uncomment to verify data after insertion:
-- SELECT
--     mu.tahun,
--     d.kode_divisi,
--     d.nama_divisi,
--     mu.golongan,
--     mu.skala,
--     mu.upah_pokok,
--     mu.deskripsi,
--     mu.is_active
-- FROM master_upah mu
-- JOIN divisions d ON mu.divisi_id = d.id
-- ORDER BY mu.tahun DESC, d.kode_divisi, mu.golongan, mu.skala;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
