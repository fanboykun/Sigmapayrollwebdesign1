# Wage Data Audit & Fix Guide

## 📋 Overview
Panduan untuk mengaudit dan memperbaiki data skala upah yang hilang atau tidak lengkap.

---

## 🔍 Step 1: Audit Data

### A. Jalankan Query Audit

Buka Supabase SQL Editor dan jalankan query dari file `check_missing_divisions.sql`:

```sql
-- Query untuk melihat divisi mana yang tidak memiliki data upah 2025
SELECT
    d.kode_divisi,
    d.nama_divisi,
    COUNT(mu.id) as total_scales
FROM public.divisions d
LEFT JOIN public.master_upah mu ON d.id = mu.divisi_id AND mu.tahun = 2025
GROUP BY d.id, d.kode_divisi, d.nama_divisi
HAVING COUNT(mu.id) = 0
ORDER BY d.kode_divisi;
```

### B. Interpretasi Hasil

**Expected Result:**
- Setiap divisi harus memiliki **141 skala upah** untuk tahun 2025:
  - 80 skala Pegawai (I-1 sampai VIII-M, 10 level × 8 grades)
  - 60 skala Karyawan (KI-0 sampai KX-6):
    * KI: 6 levels (0-5)
    * KII-KX: 6 levels each (1-6) × 9 grades = 54
  - 1 skala PKWT

**Possible Issues:**
1. **NO DATA (0 scales)**: Divisi sama sekali tidak ada data
2. **INCOMPLETE (<141 scales)**: Divisi punya data tapi tidak lengkap
3. **COMPLETE (141 scales)**: Divisi memiliki data lengkap ✅

---

## 🔧 Step 2: Identifikasi Masalah

### Cek Divisi yang Ada

```sql
-- List semua divisi yang terdaftar
SELECT id, kode_divisi, nama_divisi
FROM public.divisions
ORDER BY kode_divisi;
```

### Cek Data Upah yang Ada

```sql
-- Summary data upah per divisi
SELECT
    d.kode_divisi,
    d.nama_divisi,
    COUNT(CASE WHEN mu.golongan = 'pegawai' THEN 1 END) as pegawai_count,
    COUNT(CASE WHEN mu.golongan = 'karyawan' THEN 1 END) as karyawan_count,
    COUNT(CASE WHEN mu.golongan = 'pkwt' THEN 1 END) as pkwt_count,
    COUNT(mu.id) as total
FROM public.divisions d
LEFT JOIN public.master_upah mu ON d.id = mu.divisi_id AND mu.tahun = 2025
GROUP BY d.id, d.kode_divisi, d.nama_divisi
ORDER BY d.kode_divisi;
```

---

## 🛠️ Step 3: Fix Missing Data

### Option A: Run Migration for Specific Division

Jika ada divisi tertentu yang tidak memiliki data, buat query manual:

```sql
-- Example: Insert data untuk divisi "AL" (Aek Loba)
DO $$
DECLARE
    div_id UUID;
BEGIN
    -- Get division ID
    SELECT id INTO div_id FROM public.divisions WHERE kode_divisi = 'AL';

    IF div_id IS NULL THEN
        RAISE NOTICE 'Division AL not found!';
        RETURN;
    END IF;

    -- Insert Pegawai scales (80 records)
    INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
    (2025, div_id, 'pegawai', 'I-1', 3705100, 'Grade I Level 1', true),
    (2025, div_id, 'pegawai', 'I-2', 3716600, 'Grade I Level 2', true)
    -- ... (copy semua data pegawai dari 039_seed_wage_scales_2025.sql)
    ;

    -- Insert Karyawan scales (60 records)
    INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
    (2025, div_id, 'karyawan', 'KI-0', 3318250, 'Grade KI Level 0', true)
    -- ... (copy semua data karyawan dari 039_seed_wage_scales_2025.sql)
    ;

    -- Insert PKWT scale (1 record)
    INSERT INTO public.master_upah (tahun, divisi_id, golongan, skala, upah_pokok, deskripsi, is_active) VALUES
    (2025, div_id, 'pkwt', 'PKWT', 3318250, 'PKWT - Perjanjian Kerja Waktu Tertentu', true);

    RAISE NOTICE 'Successfully inserted wage scales for division AL';
END $$;
```

### Option B: Re-run Complete Migration

Jika banyak divisi yang hilang, lebih baik re-run migration 039 dan 041:

1. **Delete existing data** (optional):
```sql
DELETE FROM public.master_upah WHERE tahun = 2025;
```

2. **Run migration 039** (Pegawai + Karyawan):
   - Copy paste isi file `039_seed_wage_scales_2025.sql`
   - Execute di SQL Editor

3. **Run migration 041** (PKWT):
   - Copy paste isi file `041_seed_pkwt_wage_2025.sql`
   - Execute di SQL Editor

---

## ✅ Step 4: Verification

### Verify Data Completeness

```sql
-- Check completeness
SELECT
    d.kode_divisi,
    d.nama_divisi,
    COUNT(mu.id) as total_scales,
    CASE
        WHEN COUNT(mu.id) = 141 THEN '✅ COMPLETE'
        WHEN COUNT(mu.id) = 0 THEN '❌ NO DATA'
        ELSE '⚠️ INCOMPLETE'
    END as status
FROM public.divisions d
LEFT JOIN public.master_upah mu ON d.id = mu.divisi_id AND mu.tahun = 2025
GROUP BY d.id, d.kode_divisi, d.nama_divisi
ORDER BY d.kode_divisi;
```

### Verify by Grade Category

```sql
-- Detailed breakdown
SELECT
    d.kode_divisi,
    COUNT(CASE WHEN mu.golongan = 'pegawai' THEN 1 END) as pegawai,
    COUNT(CASE WHEN mu.golongan = 'karyawan' THEN 1 END) as karyawan,
    COUNT(CASE WHEN mu.golongan = 'pkwt' THEN 1 END) as pkwt,
    COUNT(mu.id) as total,
    CASE
        WHEN COUNT(CASE WHEN mu.golongan = 'pegawai' THEN 1 END) = 80
         AND COUNT(CASE WHEN mu.golongan = 'karyawan' THEN 1 END) = 60
         AND COUNT(CASE WHEN mu.golongan = 'pkwt' THEN 1 END) = 1
        THEN '✅'
        ELSE '❌'
    END as status
FROM public.divisions d
LEFT JOIN public.master_upah mu ON d.id = mu.divisi_id AND mu.tahun = 2025
GROUP BY d.id, d.kode_divisi
ORDER BY d.kode_divisi;
```

---

## 📊 Expected Results

### For Each Division:
- **Pegawai**: 80 scales (I-1 to VIII-M)
- **Karyawan**: 60 scales (KI-0 to KVI-5)
- **PKWT**: 1 scale
- **Total**: 141 scales

### Example Complete Data:
```
kode_divisi | nama_divisi | pegawai | karyawan | pkwt | total | status
------------|-------------|---------|----------|------|-------|--------
AL          | Aek Loba    | 80      | 60       | 1    | 141   | ✅
AP          | Kebun AP    | 80      | 60       | 1    | 141   | ✅
BB          | Bangun Bndr | 80      | 60       | 1    | 141   | ✅
...
```

---

## 🔄 Troubleshooting

### Issue 1: Division Not Found in Migrations
**Symptom**: Divisi ada di DivisionMaster tapi tidak ada data upah

**Solution**:
1. Check apakah divisi memiliki ID yang valid
2. Run manual insert untuk divisi tersebut
3. Atau tambahkan divisi baru ke migration 039/041

### Issue 2: Incomplete Data
**Symptom**: Divisi punya data tapi tidak lengkap (< 141 scales)

**Solution**:
```sql
-- Delete incomplete data
DELETE FROM public.master_upah
WHERE divisi_id = 'YOUR_DIVISION_ID'
AND tahun = 2025;

-- Re-insert complete data (run migration again)
```

### Issue 3: Duplicate Data
**Symptom**: Error "duplicate key value violates unique constraint"

**Solution**:
```sql
-- Find duplicates
SELECT divisi_id, golongan, skala, COUNT(*)
FROM public.master_upah
WHERE tahun = 2025
GROUP BY divisi_id, golongan, skala
HAVING COUNT(*) > 1;

-- Delete duplicates (keep only one)
DELETE FROM public.master_upah a USING (
    SELECT MIN(id) as id, divisi_id, golongan, skala
    FROM public.master_upah
    WHERE tahun = 2025
    GROUP BY divisi_id, golongan, skala
    HAVING COUNT(*) > 1
) b
WHERE a.divisi_id = b.divisi_id
  AND a.golongan = b.golongan
  AND a.skala = b.skala
  AND a.tahun = 2025
  AND a.id <> b.id;
```

---

## 📝 Notes

1. **Selalu backup data** sebelum menjalankan DELETE queries
2. **Verify hasil** setelah setiap perubahan
3. **Jalankan migration di development** environment dulu
4. **Dokumentasikan** setiap perubahan yang dilakukan

---

## 📞 Support

Jika masih ada masalah setelah mengikuti panduan ini:
1. Cek log error di Supabase Dashboard
2. Verify schema tabel master_upah dan divisions
3. Pastikan RLS policies tidak mem-block INSERT operations
4. **Jika data tidak lengkap (hanya 1000 records)**: Lihat `SUPABASE_PAGINATION_GUIDE.md`

---

## 🔗 Related Documentation

- **SUPABASE_PAGINATION_GUIDE.md** - ⚠️ Critical: Solusi untuk 1000-row limit
- **check_missing_divisions.sql** - Query untuk audit data
- **039_seed_wage_scales_2025.sql** - Migration utama wage data
- **041_seed_pkwt_wage_2025.sql** - Migration PKWT data

---

**Last Updated**: 2025-11-17
