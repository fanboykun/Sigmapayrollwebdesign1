-- =====================================================
-- TEST QUERIES FOR PREMI DERES MODULE
-- =====================================================
-- File: test_premi_deres_queries.sql
-- Purpose: Test queries untuk memverifikasi struktur database Premi Deres
-- Date: 2025-11-13
-- =====================================================

-- =====================================================
-- 1. CHECK IF TABLES EXIST
-- =====================================================
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'premi_deres%'
ORDER BY table_name;

-- =====================================================
-- 2. TEST: SELECT KONFIGURASI PREMI DERES
-- =====================================================
SELECT
    id,
    kode_konfigurasi,
    tahun_berlaku,
    tanggal_mulai,
    tanggal_akhir,
    status,
    nomor_surat,
    tanggal_surat
FROM public.premi_deres_konfigurasi
WHERE status = 'aktif'
ORDER BY tahun_berlaku DESC
LIMIT 5;

-- =====================================================
-- 3. TEST: SELECT TARIF PRODUKSI NORMAL
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdk.tahun_berlaku,
    pdpn.divisi,
    pdpn.jenis_lateks,
    pdpn.satuan,
    pdpn.tarif_per_kg
FROM public.premi_deres_produksi_normal pdpn
JOIN public.premi_deres_konfigurasi pdk ON pdpn.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdpn.divisi, pdpn.jenis_lateks;

-- =====================================================
-- 4. TEST: SELECT KOEFISIEN PENDAPATAN
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdkp.persentase_pendapatan_min,
    pdkp.persentase_pendapatan_max,
    pdkp.koefisien
FROM public.premi_deres_koefisien_pendapatan pdkp
JOIN public.premi_deres_konfigurasi pdk ON pdkp.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdkp.persentase_pendapatan_min;

-- =====================================================
-- 5. TEST: SELECT PREMI KUALITAS (PQ)
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdq.nilai_kesalahan_min,
    pdq.nilai_kesalahan_max,
    pdq.koefisien,
    pdq.tarif_pq,
    (pdq.tarif_pq * pdq.koefisien) as premi_diterima
FROM public.premi_deres_kualitas pdq
JOIN public.premi_deres_konfigurasi pdk ON pdq.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdq.nilai_kesalahan_min;

-- =====================================================
-- 6. TEST: SELECT PREMI PRA TERUNA
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdpt.tarif_per_bulan,
    pdpt.durasi_bulan,
    pdpt.keterangan
FROM public.premi_deres_pra_teruna pdpt
JOIN public.premi_deres_konfigurasi pdk ON pdpt.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif';

-- =====================================================
-- 7. TEST: SELECT TARIF TETEL
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdt.divisi,
    pdt.jenis_lateks,
    pdt.tarif_per_kg
FROM public.premi_deres_tetel pdt
JOIN public.premi_deres_konfigurasi pdk ON pdt.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdt.divisi, pdt.jenis_lateks;

-- =====================================================
-- 8. TEST: SELECT BIAYA CUCI MANGKOK
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdbcm.divisi,
    pdbcm.tarif_per_ancak
FROM public.premi_deres_biaya_cuci_mangkok pdbcm
JOIN public.premi_deres_konfigurasi pdk ON pdbcm.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdbcm.divisi;

-- =====================================================
-- 9. TEST: SELECT PREMI KELUAR/KONTANAN
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdkk.jenis_karyawan,
    pdkk.tarif_per_hb,
    pdkk.hari_berlaku
FROM public.premi_deres_keluar_kontanan pdkk
JOIN public.premi_deres_konfigurasi pdk ON pdkk.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdkk.tarif_per_hb DESC;

-- =====================================================
-- 10. TEST: SELECT FORMULA MANDOR DERES
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdm.jumlah_karyawan_min,
    pdm.jumlah_karyawan_max,
    pdm.multiplier,
    pdm.keterangan
FROM public.premi_deres_mandor pdm
JOIN public.premi_deres_konfigurasi pdk ON pdm.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdm.jumlah_karyawan_min;

-- =====================================================
-- 11. TEST: SELECT FORMULA MANDOR-I DERES
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdmi.jumlah_karyawan_min,
    pdmi.jumlah_karyawan_max,
    pdmi.multiplier,
    pdmi.keterangan
FROM public.premi_deres_mandor_i pdmi
JOIN public.premi_deres_konfigurasi pdk ON pdmi.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdmi.jumlah_karyawan_min;

-- =====================================================
-- 12. TEST: SELECT PREMI TAP KONTROL
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdtk.kebun_type,
    pdtk.tarif_per_bulan,
    pdtk.keterangan
FROM public.premi_deres_tap_kontrol pdtk
JOIN public.premi_deres_konfigurasi pdk ON pdtk.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif';

-- =====================================================
-- 13. TEST: SELECT PREMI KRANI LATEKS
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdkl.multiplier,
    pdkl.penalti_kesalahan,
    pdkl.keterangan
FROM public.premi_deres_krani_lateks pdkl
JOIN public.premi_deres_konfigurasi pdk ON pdkl.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif';

-- =====================================================
-- 14. TEST: SELECT PREMI KRANI PRODUKSI
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdkp.multiplier,
    pdkp.penalti_kesalahan,
    pdkp.keterangan
FROM public.premi_deres_krani_produksi pdkp
JOIN public.premi_deres_konfigurasi pdk ON pdkp.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif';

-- =====================================================
-- 15. TEST: SELECT MASTER ANCAK
-- =====================================================
SELECT
    id,
    kode_ancak,
    nama_ancak,
    estate_id,
    divisi,
    jumlah_pokok,
    status
FROM public.premi_deres_ancak_master
WHERE status = 'aktif'
ORDER BY kode_ancak
LIMIT 10;

-- =====================================================
-- 16. TEST: SELECT KRITERIA KESALAHAN KUALITAS
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdqi.kode_kesalahan,
    pdqi.nama_kesalahan,
    pdqi.bobot_kesalahan
FROM public.premi_deres_quality_inspection pdqi
JOIN public.premi_deres_konfigurasi pdk ON pdqi.konfigurasi_id = pdk.id
WHERE pdk.status = 'aktif'
ORDER BY pdqi.kode_kesalahan;

-- =====================================================
-- 17. TEST: CHECK PERMISSIONS IN ROLE_PERMISSIONS
-- =====================================================
SELECT
    r.code as role_code,
    r.name as role_name,
    rp.module_name,
    rp.can_view,
    rp.can_create,
    rp.can_edit,
    rp.can_delete
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
WHERE rp.module_name LIKE 'premi_deres%'
ORDER BY r.code, rp.module_name;

-- =====================================================
-- 18. TEST: COMPLEX QUERY - COMPLETE PREMI CONFIGURATION
-- =====================================================
SELECT
    pdk.kode_konfigurasi,
    pdk.tahun_berlaku,
    pdk.estate_id,
    COUNT(DISTINCT pdpn.id) as total_tarif_produksi,
    COUNT(DISTINCT pdq.id) as total_tier_kualitas,
    COUNT(DISTINCT pdkk.id) as total_jenis_keluar_kontanan
FROM public.premi_deres_konfigurasi pdk
LEFT JOIN public.premi_deres_produksi_normal pdpn ON pdk.id = pdpn.konfigurasi_id
LEFT JOIN public.premi_deres_kualitas pdq ON pdk.id = pdq.konfigurasi_id
LEFT JOIN public.premi_deres_keluar_kontanan pdkk ON pdk.id = pdkk.konfigurasi_id
WHERE pdk.status = 'aktif'
GROUP BY pdk.kode_konfigurasi, pdk.tahun_berlaku, pdk.estate_id;

-- =====================================================
-- 19. TEST: TRANSACTION TABLES (IF POPULATED)
-- =====================================================
-- Check if any production data exists
SELECT
    COUNT(*) as total_records,
    MIN(tanggal_produksi) as earliest_date,
    MAX(tanggal_produksi) as latest_date
FROM public.premi_deres_produksi_harian;

-- Check if any quality check data exists
SELECT
    COUNT(*) as total_records,
    MIN(tanggal_pemeriksaan) as earliest_date,
    MAX(tanggal_pemeriksaan) as latest_date
FROM public.premi_deres_quality_check_harian;

-- Check if any calculation period exists
SELECT
    COUNT(*) as total_periods,
    status,
    COUNT(*) as count_by_status
FROM public.premi_deres_periode_perhitungan
GROUP BY status;

-- =====================================================
-- 20. TEST: RLS POLICIES CHECK
-- =====================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename LIKE 'premi_deres%'
ORDER BY tablename, policyname;

-- =====================================================
-- END OF TEST QUERIES
-- =====================================================

/*
HOW TO RUN THESE QUERIES:
========================

Option 1: Via Supabase Dashboard
1. Login to Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste queries one by one or in groups
4. Execute and verify results

Option 2: Via Supabase CLI
1. Make sure Supabase CLI is installed and authenticated
2. Run: npx supabase db reset --local (to apply migrations)
3. Run queries via: psql -h localhost -p 54322 -U postgres -d postgres -f test_premi_deres_queries.sql

Option 3: Via Application Code
1. Use Supabase JS client in your React component
2. Test each query endpoint
3. Verify data structure matches expected format

EXPECTED RESULTS:
=================
- All tables should exist (15 master tables + 6 transaction tables)
- Seed data should be present for konfigurasi PD-2024-001
- Tarif should match document SI 24 GR III 2024
- Permissions should exist for super_admin, admin, and manager roles
- RLS policies should be active for all tables

*/
