-- =====================================================
-- Migration: 027_premi_kebun_seed_data.sql
-- Description: Seed data for Premi Kebun based on Sei Liput Estate 2024
-- Author: Sigma Payroll Team
-- Date: 2025-11-12
-- Reference: TN/Gr I-SL/R/346/24 dated 25 November 2024
-- =====================================================

-- =====================================================
-- 1. INSERT KONFIGURASI PREMI - SEI LIPUT 2024
-- =====================================================
INSERT INTO public.premi_konfigurasi (
    kode_konfigurasi, estate_id, tahun_berlaku, tanggal_mulai, tanggal_akhir,
    status, nomor_surat, tanggal_surat, deskripsi
)
SELECT
    'KP-SL-2024',
    d.id,
    2024,
    '2024-12-01',
    NULL,
    'aktif',
    'TN/Gr I-SL/R/346/24',
    '2024-11-25',
    'Sistem Premi Panen Tandan Buah Segar Kebun Sei Liput Tahun 2024'
FROM public.divisions d
WHERE d.kode_divisi = 'SL' -- Sei Liput estate
LIMIT 1
ON CONFLICT (kode_konfigurasi) DO NOTHING;

-- =====================================================
-- 2. INSERT BASIS PREMI (per umur tanaman)
-- =====================================================
INSERT INTO public.premi_basis (konfigurasi_id, umur_tanaman, basis_lama, ratio_basis_baru, harga_per_janjang, harga_lebih_basis)
SELECT
    pk.id,
    umur,
    basis_lama,
    ratio,
    0,
    CASE WHEN umur = 14 THEN 538 ELSE 0 END
FROM public.premi_konfigurasi pk
CROSS JOIN (VALUES
    (3, 220, 1.2),
    (4, 200, 1.2),
    (5, 170, 1.2),
    (6, 150, 1.2),
    (7, 130, 1.25),
    (8, 120, 1.25),
    (9, 100, 1.25),
    (10, 90, 1.25),
    (11, 80, 1.25),
    (12, 70, 1.4),
    (13, 65, 1.4),
    (14, 60, 1.4),
    (15, 55, 1.4),
    (16, 50, 1.5),
    (17, 50, 1.5),
    (18, 40, 1.85),
    (19, 40, 1.85),
    (20, 40, 1.85),
    (21, 40, 1.85),
    (22, 40, 1.85),
    (23, 40, 1.85),
    (24, 40, 1.85),
    (25, 40, 1.85),
    (26, 40, 1.85),
    (27, 36, 1.85),
    (28, 36, 1.85),
    (29, 36, 1.85),
    (30, 36, 1.85),
    (31, 36, 1.85),
    (32, 36, 1.85),
    (33, 36, 1.85),
    (34, 36, 1.85),
    (35, 36, 1.85),
    (36, 36, 1.85)
) AS basis_data(umur, basis_lama, ratio)
WHERE pk.kode_konfigurasi = 'KP-SL-2024'
ON CONFLICT (konfigurasi_id, umur_tanaman) DO NOTHING;

-- =====================================================
-- 3. INSERT TINGKATAN PREMI LEBIH BASIS
-- =====================================================
INSERT INTO public.premi_tingkatan_lebih_basis (
    konfigurasi_id, tingkat, dari_basis, sampai_basis, operator_dari, operator_sampai,
    premi_siap_1_basis, premi_siap_2_basis, premi_siap_3_basis, keterangan
)
SELECT
    pk.id,
    tingkat,
    dari,
    sampai,
    op_dari,
    op_sampai,
    premi_1,
    premi_2,
    premi_3,
    ket
FROM public.premi_konfigurasi pk
CROSS JOIN (VALUES
    (1, 0, 1.25, '<', '<', 0, 0, 0, 'Kurang dari 1.25 basis, tidak dapat premi siap'),
    (2, 1.25, 1.5, '>=', '<', 35000, 50000, 65000, 'Basis 1.25 sampai kurang dari 1.5'),
    (3, 1.5, 1.75, '>=', '<', 35000, 50000, 65000, 'Basis 1.5 sampai kurang dari 1.75'),
    (4, 1.75, 2, '>=', '<', 35000, 50000, 65000, 'Basis 1.75 sampai kurang dari 2'),
    (5, 2, 3, '>=', '<', 35000, 50000, 65000, 'Basis 2 sampai kurang dari 3'),
    (6, 3, NULL, '>=', NULL, 35000, 50000, 65000, 'Basis 3 atau lebih')
) AS tier_data(tingkat, dari, sampai, op_dari, op_sampai, premi_1, premi_2, premi_3, ket)
WHERE pk.kode_konfigurasi = 'KP-SL-2024'
ON CONFLICT (konfigurasi_id, tingkat) DO NOTHING;

-- =====================================================
-- 4. INSERT PREMI JABATAN
-- =====================================================
INSERT INTO public.premi_jabatan (
    konfigurasi_id, jenis_jabatan, tipe_perhitungan, nilai,
    syarat_jumlah_min, syarat_jumlah_max, multiplier, keterangan
)
SELECT
    pk.id,
    jenis,
    tipe,
    nilai,
    min_jml,
    max_jml,
    mult,
    ket
FROM public.premi_konfigurasi pk
CROSS JOIN (VALUES
    ('mandor_i', 'multiplier', 1.5, 3, 3, 1.5, 'Bila memimpin 3 mandor, premi = 1.5x rata-rata premi mandor'),
    ('mandor_i', 'multiplier', 1.6, 4, NULL, 1.6, 'Bila memimpin > 3 mandor, premi = 1.6x rata-rata premi mandor'),
    ('mandor_panen', 'persentase', 12, NULL, NULL, NULL, 'Premi Mandor Panen = 12% dari total premi karyawan panen'),
    ('kerani_buah', 'persentase', 10, NULL, NULL, NULL, 'Premi Kerani Buah = 10% dari total premi karyawan panen')
) AS jabatan_data(jenis, tipe, nilai, min_jml, max_jml, mult, ket)
WHERE pk.kode_konfigurasi = 'KP-SL-2024'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. INSERT DENDA/SANKSI
-- =====================================================
INSERT INTO public.premi_denda (
    konfigurasi_id, kode_denda, nama_pelanggaran, satuan, nilai_denda,
    dikenakan_oleh, masuk_sistem_premi, keterangan
)
SELECT
    pk.id,
    kode,
    nama,
    satuan,
    nilai,
    oleh,
    masuk,
    ket
FROM public.premi_konfigurasi pk
CROSS JOIN (VALUES
    ('A', 'Buah Mentah', 'per_janjang', 10000, 'kerani_buah', true, 'Buah yang dipanen dalam kondisi mentah'),
    ('G', 'Gagang Panjang tidak dipotong rapat/Cangkem Kodok', 'per_janjang', 1000, 'kerani_buah', true, 'Gagang tidak dipotong dengan baik'),
    ('S', 'Buah masak tinggal di pokok atau tidak dipanen', 'per_janjang', 2000, 'mantri_recolte', true, 'Buah masak tidak dipanen'),
    ('M1', 'Buah mentah diperam di ancak', 'per_janjang', 10000, 'kerani_buah', true, 'Buah mentah yang diperam'),
    ('M2', 'Buah tinggal di piringan atau di ancak', 'per_janjang', 2000, 'kerani_buah', true, 'Buah tertinggal di piringan'),
    ('M3', 'Brondolan tinggal di potongan gagang', 'per_janjang', 1000, 'kerani_buah', true, 'Brondolan tidak bersih'),
    ('B1', 'Brondolan tidak dikutip bersih atau < 20 butir/pokok', 'per_pokok', 1000, 'kerani_buah', true, 'Brondolan < 20 butir per pokok'),
    ('B2', 'Brondolan dibuang atau >= 20 butir/pokok', 'per_pokok', 3000, 'kerani_buah', true, 'Brondolan >= 20 butir per pokok'),
    ('R', 'Rumpukan tidak disusun rapi', 'per_rumpukan', 1000, 'kerani_buah', true, 'Rumpukan tidak teratur'),
    ('C', 'Cabang sengleh', 'per_pokok', 1000, 'mandor_panen', true, 'Cabang pohon yang patah'),
    ('ABSENT', 'Karyawan pulang sebelum bekerja 7 jam (hari biasa) atau 5 jam (Jumat)', 'per_hari', 10000, 'kerani_buah', true, 'Sanksi ketidakhadiran penuh')
) AS denda_data(kode, nama, satuan, nilai, oleh, masuk, ket)
WHERE pk.kode_konfigurasi = 'KP-SL-2024'
ON CONFLICT (konfigurasi_id, kode_denda) DO NOTHING;

-- =====================================================
-- 6. INSERT JAM KERJA CONFIGURATION
-- =====================================================
INSERT INTO public.premi_jam_kerja (
    konfigurasi_id, jam_kerja_biasa, jam_kerja_jumat, basis_minimum_premi,
    formula_basis_jumat, pembulatan_bawah_threshold,
    sanksi_tidak_hadir_7_hari,
    tarif_overtime_umur_lt_16, tarif_overtime_umur_gte_16,
    max_basis_overtime_lt_16, max_basis_overtime_gte_16
)
SELECT
    pk.id,
    7,
    5,
    1.25,
    '5/7',
    0.5,
    10000,
    75000,
    75000,
    1.1,
    1.2
FROM public.premi_konfigurasi pk
WHERE pk.kode_konfigurasi = 'KP-SL-2024'
ON CONFLICT (konfigurasi_id) DO NOTHING;

-- =====================================================
-- 7. INSERT BLOK KEBUN (Sample Blocks)
-- =====================================================
INSERT INTO public.premi_blok_kebun (
    kode_blok, nama_blok, estate_id, umur_tanaman, luas_hektar,
    jumlah_pokok, tahun_tanam, prioritas_basis, status, keterangan
)
SELECT
    kode,
    nama,
    d.id,
    umur,
    luas,
    pokok,
    tanam,
    prioritas,
    'aktif',
    ket
FROM public.divisions d
CROSS JOIN (VALUES
    ('SL-001', 'Blok I', 14, 25.5, 3400, 2010, 1, 'Blok dengan produktivitas tinggi'),
    ('SL-002', 'Blok II', 16, 30.0, 4000, 2008, 2, 'Blok tanaman menengah'),
    ('SL-003', 'Blok III', 18, 28.0, 3700, 2006, 3, 'Blok tanaman tua'),
    ('SL-004', 'Blok Muda A', 5, 22.0, 2900, 2019, 4, 'Blok tanaman muda produktif'),
    ('SL-005', 'Blok Muda B', 7, 20.0, 2650, 2017, 5, 'Blok tanaman muda berkembang')
) AS blok_data(kode, nama, umur, luas, pokok, tanam, prioritas, ket)
WHERE d.kode_divisi = 'SL' -- Sei Liput estate
ON CONFLICT (kode_blok) DO NOTHING;

-- =====================================================
-- 8. COMMENTS
-- =====================================================
COMMENT ON COLUMN public.premi_konfigurasi.nomor_surat IS 'Nomor surat keputusan sistem premi';
COMMENT ON COLUMN public.premi_basis.basis_baru IS 'Calculated: basis_lama × ratio_basis_baru';
COMMENT ON COLUMN public.premi_tingkatan_lebih_basis.premi_siap_1_basis IS 'Premi untuk 1 basis achievement';
COMMENT ON COLUMN public.premi_tingkatan_lebih_basis.premi_siap_2_basis IS 'Premi untuk 2 basis achievement';
COMMENT ON COLUMN public.premi_tingkatan_lebih_basis.premi_siap_3_basis IS 'Premi untuk 3 basis achievement';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
