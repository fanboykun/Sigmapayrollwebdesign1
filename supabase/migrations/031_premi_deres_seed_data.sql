-- =====================================================
-- Migration: 031_premi_deres_seed_data.sql
-- Description: Seed initial data for Premi Deres system based on SI 24 GR III 2024
-- Author: Sigma Payroll Team
-- Date: 2025-11-13
-- =====================================================

-- =====================================================
-- 1. INSERT KONFIGURASI PREMI DERES 2024
-- =====================================================
INSERT INTO public.premi_deres_konfigurasi (
    kode_konfigurasi,
    estate_id,
    tahun_berlaku,
    tanggal_mulai,
    tanggal_akhir,
    status,
    nomor_surat,
    tanggal_surat,
    deskripsi
) VALUES (
    'PD-2024-001',
    (SELECT id FROM public.divisions LIMIT 1),
    2024,
    '2024-05-01',
    '2024-12-31',
    'aktif',
    'TN/GR III/R/099/2024',
    '2024-05-25',
    'Sistem Premi Deres Tahun 2024 berlaku mulai 01 Mei 2024'
) ON CONFLICT (kode_konfigurasi) DO NOTHING;

-- =====================================================
-- 2. INSERT PREMI PRODUKSI NORMAL RATES
-- =====================================================
INSERT INTO public.premi_deres_produksi_normal (konfigurasi_id, divisi, jenis_lateks, satuan, tarif_per_kg) VALUES
-- AP Div I
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lateks_normal', 'kg_kk', 337),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lateks_deres_ekstra', 'kg_kk', 397),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lower_grades', 'kg_basah', 201),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lump_cuka', 'kg_basah', 704),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'scraps', 'kg_basah', 704),
-- AP Div II
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lateks_normal', 'kg_kk', 337),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lateks_deres_ekstra', 'kg_kk', 397),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lower_grades', 'kg_basah', 201),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lump_cuka', 'kg_basah', 704),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'scraps', 'kg_basah', 704),
-- AP Div III
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lateks_normal', 'kg_kk', 337),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lateks_deres_ekstra', 'kg_kk', 397),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lower_grades', 'kg_basah', 201),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lump_cuka', 'kg_basah', 704),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'scraps', 'kg_basah', 704),
-- AP Div IV
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lateks_normal', 'kg_kk', 357),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lateks_deres_ekstra', 'kg_kk', 427),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lower_grades', 'kg_basah', 211),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lump_cuka', 'kg_basah', 734),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'scraps', 'kg_basah', 734),
-- AP Div V
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lateks_normal', 'kg_kk', 357),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lateks_deres_ekstra', 'kg_kk', 427),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lower_grades', 'kg_basah', 211),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lump_cuka', 'kg_basah', 734),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'scraps', 'kg_basah', 734),
-- AP Div VI
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lateks_normal', 'kg_kk', 357),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lateks_deres_ekstra', 'kg_kk', 427),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lower_grades', 'kg_basah', 211),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lump_cuka', 'kg_basah', 734),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'scraps', 'kg_basah', 734)
ON CONFLICT (konfigurasi_id, divisi, jenis_lateks) DO NOTHING;

-- =====================================================
-- 3. INSERT KOEFISIEN PENDAPATAN
-- =====================================================
INSERT INTO public.premi_deres_koefisien_pendapatan (konfigurasi_id, persentase_pendapatan_min, persentase_pendapatan_max, koefisien) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 0, 96, 0.97),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 97, 97, 0.97),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 98, 98, 0.98),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 99, 99, 0.99),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 100, 100, 1.00),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 101, 101, 1.01),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 102, 102, 1.02),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 103, NULL, 1.03)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. INSERT PREMI KUALITAS (PQ) TIERS
-- =====================================================
INSERT INTO public.premi_deres_kualitas (konfigurasi_id, nilai_kesalahan_min, nilai_kesalahan_max, koefisien, tarif_pq) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 0, 8, 1.00, 237000),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 1, 17, 0.75, 237000),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 18, 26, 0.60, 237000),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 27, 35, 0.45, 237000),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 36, 42, 0.30, 237000),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 43, 48, 0.15, 237000),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 49, NULL, 0.00, 237000)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. INSERT PREMI PRA TERUNA
-- =====================================================
INSERT INTO public.premi_deres_pra_teruna (konfigurasi_id, tarif_per_bulan, durasi_bulan, keterangan) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 267000, 6, 'Premi kualitas untuk tanaman pra teruna diberikan selama 6 bulan pertama setelah buka deresan baru sebesar Rp. 267.000/bulan')
ON CONFLICT (konfigurasi_id) DO NOTHING;

-- =====================================================
-- 6. INSERT PREMI DERES TETEL
-- =====================================================
INSERT INTO public.premi_deres_tetel (konfigurasi_id, divisi, jenis_lateks, satuan, tarif_per_kg) VALUES
-- AP Div I
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lateks_normal', 'kg_kk', 715),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lateks_deres_ekstra', 'kg_kk', 725),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lower_grades', 'kg_basah', 201),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'lump_cuka', 'kg_basah', 705),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 'scraps', 'kg_basah', 705),
-- AP Div II
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lateks_normal', 'kg_kk', 715),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lateks_deres_ekstra', 'kg_kk', 725),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lower_grades', 'kg_basah', 201),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'lump_cuka', 'kg_basah', 705),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 'scraps', 'kg_basah', 705),
-- AP Div III
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lateks_normal', 'kg_kk', 715),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lateks_deres_ekstra', 'kg_kk', 725),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lower_grades', 'kg_basah', 201),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'lump_cuka', 'kg_basah', 705),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 'scraps', 'kg_basah', 705),
-- AP Div IV
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lateks_normal', 'kg_kk', 715),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lateks_deres_ekstra', 'kg_kk', 725),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lower_grades', 'kg_basah', 211),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'lump_cuka', 'kg_basah', 735),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 'scraps', 'kg_basah', 735),
-- AP Div V
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lateks_normal', 'kg_kk', 715),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lateks_deres_ekstra', 'kg_kk', 725),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lower_grades', 'kg_basah', 211),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'lump_cuka', 'kg_basah', 735),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 'scraps', 'kg_basah', 735),
-- AP Div VI
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lateks_normal', 'kg_kk', 715),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lateks_deres_ekstra', 'kg_kk', 725),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lower_grades', 'kg_basah', 211),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'lump_cuka', 'kg_basah', 735),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 'scraps', 'kg_basah', 735)
ON CONFLICT (konfigurasi_id, divisi, jenis_lateks) DO NOTHING;

-- =====================================================
-- 7. INSERT BIAYA CUCI MANGKOK
-- =====================================================
INSERT INTO public.premi_deres_biaya_cuci_mangkok (konfigurasi_id, divisi, tarif_per_ancak) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_I', 90500),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_II', 90500),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_III', 90500),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_IV', 106500),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_V', 106500),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_DIV_VI', 106500)
ON CONFLICT (konfigurasi_id, divisi) DO NOTHING;

-- =====================================================
-- 8. INSERT PREMI KELUAR/KONTANAN (DERES EKSTRA/LIBUR)
-- =====================================================
INSERT INTO public.premi_deres_keluar_kontanan (konfigurasi_id, jenis_karyawan, tarif_per_hb, hari_berlaku) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'karyawan_penderes', 151000, ARRAY['Maulid Nabi Muhammad SAW', 'Isra Mi''raj', 'Wafat Yesus Kristus', '1 Muharram', 'Natal']),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'mandor_i_deres', 171000, ARRAY['Maulid Nabi Muhammad SAW', 'Isra Mi''raj', 'Wafat Yesus Kristus', '1 Muharram', 'Natal']),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'mandor_deres', 161000, ARRAY['Maulid Nabi Muhammad SAW', 'Isra Mi''raj', 'Wafat Yesus Kristus', '1 Muharram', 'Natal']),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'krani_latex', 151000, ARRAY['Maulid Nabi Muhammad SAW', 'Isra Mi''raj', 'Wafat Yesus Kristus', '1 Muharram', 'Natal']),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'premi_tap_kontrol', 171000, ARRAY['Maulid Nabi Muhammad SAW', 'Isra Mi''raj', 'Wafat Yesus Kristus', '1 Muharram', 'Natal'])
ON CONFLICT (konfigurasi_id, jenis_karyawan) DO NOTHING;

-- =====================================================
-- 9. INSERT PREMI MANDOR DERES FORMULA
-- =====================================================
INSERT INTO public.premi_deres_mandor (konfigurasi_id, jumlah_karyawan_min, jumlah_karyawan_max, multiplier, keterangan) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 0, 10, 1.50, 'Kurang dari 10 karyawan'),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 11, 15, 1.75, '11 sampai 15 karyawan'),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 16, 20, 2.00, '16 sampai 20 karyawan'),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 21, NULL, 2.25, 'Lebih dari 20 karyawan')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. INSERT PREMI MANDOR-I DERES FORMULA
-- =====================================================
INSERT INTO public.premi_deres_mandor_i (konfigurasi_id, jumlah_karyawan_min, jumlah_karyawan_max, multiplier, keterangan) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 0, 50, 1.50, 'Kurang dari 50 karyawan'),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 51, 75, 1.75, '51 sampai 75 karyawan'),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 76, 100, 2.00, '76 sampai 100 karyawan'),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 101, NULL, 2.25, 'Lebih dari 100 karyawan')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. INSERT PREMI TAP KONTROL
-- =====================================================
INSERT INTO public.premi_deres_tap_kontrol (konfigurasi_id, kebun_type, tarif_per_bulan, keterangan) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'AP_HL', 1510000, 'Premi Tap Kontrol untuk kebun AP/HL')
ON CONFLICT (konfigurasi_id, kebun_type) DO NOTHING;

-- =====================================================
-- 12. INSERT PREMI KRANI LATEKS
-- =====================================================
INSERT INTO public.premi_deres_krani_lateks (konfigurasi_id, multiplier, penalti_kesalahan, keterangan) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 1.25,
'Melakukan manipulasi data, Tidak membuat atau terlambat melaporkan produksi harian dan bulanan yang harus diinput ke sistem, laporan produksi untuk Pengurus dan Asisten, Tidak membuat rencana aplikasi stimulasi dan laporan kenaikan stimulasi, Tidak melakukan pengukuran DRC permandoran dan sampling 10% dari jumlah penderes permandoran, Tidak berperan aktif dalam perawatan lateks collection dan pekerjaan stimulasi',
'Premi tersebut akan menjadi Nol/ditiadakan apabila kerani lateks melakukan kesalahan sebagai berikut')
ON CONFLICT (konfigurasi_id) DO NOTHING;

-- =====================================================
-- 13. INSERT PREMI KRANI PRODUKSI
-- =====================================================
INSERT INTO public.premi_deres_krani_produksi (konfigurasi_id, multiplier, penalti_kesalahan, keterangan) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 1.50,
'Melakukan manipulasi data, Tidak membuat atau terlambat melaporkan produksi harian dan bulanan yang harus diinput ke sistem, laporan produksi untuk Pengurus dan Asisten, Tidak membuat rencana aplikasi stimulasi dan laporan kenaikan stimulasi, Tidak melakukan pengukuran DRC permandoran dan sampling 10% dari jumlah penderes permandoran, Tidak berperan aktif dalam perawatan lateks collection dan pekerjaan stimulasi',
'Premi tersebut akan menjadi Nol/ditiadakan apabila kerani produksi melakukan kesalahan sebagai berikut')
ON CONFLICT (konfigurasi_id) DO NOTHING;

-- =====================================================
-- 14. INSERT SAMPLE QUALITY INSPECTION CRITERIA
-- =====================================================
INSERT INTO public.premi_deres_quality_inspection (konfigurasi_id, kode_kesalahan, nama_kesalahan, bobot_kesalahan) VALUES
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'DANGKAL', 'Deres terlalu dangkal', 1),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'LUKA', 'Luka pada kulit pohon', 1),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'SUDUT', 'Sudut deresan tidak sesuai', 1),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'KULIT', 'Pemakaian kulit berlebihan', 1),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'ALAT', 'Alat-alat tidak berpedoman pada cara-cara pemeriksaan', 1),
((SELECT id FROM public.premi_deres_konfigurasi WHERE kode_konfigurasi = 'PD-2024-001'), 'DISIPLIN', 'Tidak disiplin dalam pekerjaan', 1)
ON CONFLICT (konfigurasi_id, kode_kesalahan) DO NOTHING;

-- =====================================================
-- 15. INSERT SAMPLE ANCAK DATA
-- =====================================================
INSERT INTO public.premi_deres_ancak_master (kode_ancak, nama_ancak, estate_id, divisi, jumlah_pokok, status) VALUES
('ANC-001', 'Ancak Blok A-001', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_I', 450, 'aktif'),
('ANC-002', 'Ancak Blok A-002', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_II', 480, 'aktif'),
('ANC-003', 'Ancak Blok A-003', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_III', 460, 'aktif'),
('ANC-004', 'Ancak Blok B-001', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_IV', 500, 'aktif'),
('ANC-005', 'Ancak Blok B-002', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_V', 520, 'aktif'),
('ANC-006', 'Ancak Blok B-003', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_VI', 510, 'aktif'),
('ANC-007', 'Ancak Blok C-001 (Tetel)', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_I', 400, 'tetel'),
('ANC-008', 'Ancak Blok C-002 (Tetel)', (SELECT id FROM public.divisions LIMIT 1), 'AP_DIV_IV', 420, 'tetel')
ON CONFLICT (kode_ancak) DO NOTHING;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
