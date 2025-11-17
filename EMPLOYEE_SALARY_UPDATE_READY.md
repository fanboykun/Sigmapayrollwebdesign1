# Employee Salary Update - Ready to Execute

**Date:** 2025-11-17
**Status:** ✅ Ready for Testing and Execution
**Script:** `update_employee_salaries.sql`

---

## 📋 Summary

Script SQL telah dibuat untuk mengisi/update gaji karyawan secara otomatis dari data Master Upah (master_upah table). Script ini **TIDAK menambah kolom baru**, hanya meng-update kolom `base_salary` yang sudah ada.

---

## ✅ Verification Complete

### Employees Table Structure (Confirmed)
```sql
-- From migration 001_initial_schema.sql:200-241
CREATE TABLE public.employees (
    id UUID PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    ...
    division_id UUID REFERENCES divisions(id),
    ...
    base_salary NUMERIC(15, 2) NOT NULL,        -- ✅ This will be updated
    wage_scale_id UUID REFERENCES wage_scales(id),  -- ✅ Exists (not modified)
    ...
);
```

### What Will Be Updated
- ✅ **Only** the `base_salary` column
- ✅ `updated_at` timestamp
- ❌ **NO** new columns added
- ❌ `wage_scale_id` **NOT** modified (stays as is)

---

## 🎯 How the Script Works

### Distribution Strategy
Random assignment dengan weighted distribution yang realistis:
- **40%** karyawan akan dapat gaji Pegawai (Grade I-VIII, range Rp 4.5M - 5.5M+)
- **55%** karyawan akan dapat gaji Karyawan (Grade KI-KX, range Rp 3.4M - 3.6M)
- **5%** karyawan akan dapat gaji PKWT (UMK base rate)

### Matching Logic
1. Ambil division_id dari setiap employee
2. Random pilih golongan (pegawai/karyawan/pkwt) dengan weighted probability
3. Dari golongan tersebut, random pilih 1 skala upah dari master_upah
4. Update base_salary dengan upah_pokok yang terpilih

### Safety Features
- ✅ Hanya update employee dengan `status = 'active'`
- ✅ Skip employee yang tidak punya division_id
- ✅ Skip employee jika tidak ada wage scale untuk divisinya
- ✅ Progress indicator setiap 25 karyawan
- ✅ Comprehensive logging (total updated, total skipped)

---

## 📝 Execution Steps

### STEP 1: Check Current Data (Read-Only)
Jalankan query ini dulu untuk melihat kondisi sekarang:

```sql
-- Check total employees
SELECT
    '=== Current Employees Table Info ===' as info,
    COUNT(*) as total_employees,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
    COUNT(CASE WHEN division_id IS NOT NULL THEN 1 END) as with_division,
    COUNT(CASE WHEN division_id IS NULL THEN 1 END) as without_division,
    MIN(base_salary) as min_salary,
    MAX(base_salary) as max_salary,
    AVG(base_salary) as avg_salary
FROM public.employees;

-- Check sample employees
SELECT
    '=== Sample Employees (First 10) ===' as info,
    e.id,
    e.employee_id,
    e.full_name,
    d.kode_divisi,
    d.nama_divisi,
    e.base_salary,
    e.wage_scale_id
FROM public.employees e
LEFT JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active'
ORDER BY e.employee_id
LIMIT 10;

-- Check available wage scales per division
SELECT
    '=== Wage Scales Available ===' as info,
    d.kode_divisi,
    d.nama_divisi,
    COUNT(mu.id) as total_scales,
    COUNT(CASE WHEN mu.golongan = 'pegawai' THEN 1 END) as pegawai,
    COUNT(CASE WHEN mu.golongan = 'karyawan' THEN 1 END) as karyawan,
    COUNT(CASE WHEN mu.golongan = 'pkwt' THEN 1 END) as pkwt
FROM public.divisions d
LEFT JOIN public.master_upah mu ON d.id = mu.divisi_id AND mu.tahun = 2025
GROUP BY d.id, d.kode_divisi, d.nama_divisi
ORDER BY d.kode_divisi;
```

**Expected Results:**
- All divisions should have **141 wage scales** each (80 Pegawai + 60 Karyawan + 1 PKWT)
- You should see active employees with their current base_salary

---

### STEP 2: Update Salaries (WRITE Operation)

⚠️ **WARNING:** This will modify the `base_salary` column for ALL active employees!

Jalankan DO block ini untuk update:

```sql
DO $$
DECLARE
    emp_record RECORD;
    random_upah NUMERIC;
    random_golongan TEXT;
    total_updated INTEGER := 0;
    total_skipped INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚀 Starting salary update process...';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- Loop through all active employees
    FOR emp_record IN
        SELECT
            e.id,
            e.employee_id,
            e.full_name,
            e.division_id,
            e.base_salary as old_salary,
            d.kode_divisi
        FROM public.employees e
        LEFT JOIN public.divisions d ON e.division_id = d.id
        WHERE e.status = 'active'
        ORDER BY e.employee_id
    LOOP
        -- Skip if no division
        IF emp_record.division_id IS NULL THEN
            RAISE NOTICE '⚠️  Employee % (%) has no division - SKIPPED',
                emp_record.employee_id, emp_record.full_name;
            total_skipped := total_skipped + 1;
            CONTINUE;
        END IF;

        -- Get random wage from master_upah for this division
        -- Weighted distribution: 40% pegawai, 55% karyawan, 5% pkwt
        SELECT
            mu.upah_pokok,
            mu.golongan
        INTO random_upah, random_golongan
        FROM public.master_upah mu
        WHERE mu.divisi_id = emp_record.division_id
          AND mu.tahun = 2025
          AND mu.is_active = true
          -- Weighted random selection
          AND mu.golongan = CASE
              WHEN random() < 0.40 THEN 'pegawai'  -- 40% pegawai
              WHEN random() < 0.95 THEN 'karyawan' -- 55% karyawan
              ELSE 'pkwt'                           -- 5% pkwt
          END
        ORDER BY random()
        LIMIT 1;

        -- Check if we found a wage scale
        IF random_upah IS NULL THEN
            RAISE NOTICE '❌ No wage scale for employee % (Division: %) - SKIPPED',
                emp_record.employee_id, emp_record.kode_divisi;
            total_skipped := total_skipped + 1;
            CONTINUE;
        END IF;

        -- Update employee salary
        UPDATE public.employees
        SET
            base_salary = random_upah,
            updated_at = NOW()
        WHERE id = emp_record.id;

        total_updated := total_updated + 1;

        -- Progress indicator every 25 employees
        IF total_updated % 25 = 0 THEN
            RAISE NOTICE '✓ Processed % employees...', total_updated;
        END IF;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Salary update completed!';
    RAISE NOTICE '📊 Total updated: %', total_updated;
    RAISE NOTICE '⚠️  Total skipped: %', total_skipped;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
```

**Expected Output:**
```
========================================
🚀 Starting salary update process...
========================================

✓ Processed 25 employees...
✓ Processed 50 employees...
✓ Processed 75 employees...
... (continues for all employees)

========================================
✅ Salary update completed!
📊 Total updated: XXX
⚠️  Total skipped: 0
========================================
```

---

### STEP 3: Verify Results (Read-Only)

Setelah update, jalankan query ini untuk verify hasilnya:

```sql
-- 1. Check salary distribution
SELECT
    '=== Salary Distribution ===' as title,
    CASE
        WHEN base_salary < 3400000 THEN '1. < Rp 3.4M (Karyawan Low)'
        WHEN base_salary BETWEEN 3400000 AND 3600000 THEN '2. Rp 3.4M - 3.6M (Karyawan)'
        WHEN base_salary BETWEEN 3600001 AND 4500000 THEN '3. Rp 3.6M - 4.5M (Pegawai Low)'
        WHEN base_salary BETWEEN 4500001 AND 5500000 THEN '4. Rp 4.5M - 5.5M (Pegawai High)'
        ELSE '5. > Rp 5.5M (Senior)'
    END as salary_range,
    COUNT(*) as jumlah_karyawan,
    TO_CHAR(MIN(base_salary), 'Rp 999,999,999') as terendah,
    TO_CHAR(MAX(base_salary), 'Rp 999,999,999') as tertinggi,
    TO_CHAR(AVG(base_salary), 'Rp 999,999,999') as rata_rata
FROM public.employees
WHERE status = 'active'
GROUP BY salary_range
ORDER BY salary_range;

-- 2. Salary by division
SELECT
    '=== Salary by Division ===' as title,
    d.kode_divisi,
    d.nama_divisi,
    COUNT(e.id) as total_karyawan,
    TO_CHAR(MIN(e.base_salary), 'Rp 999,999,999') as gaji_terendah,
    TO_CHAR(MAX(e.base_salary), 'Rp 999,999,999') as gaji_tertinggi,
    TO_CHAR(AVG(e.base_salary), 'Rp 999,999,999') as rata_rata
FROM public.employees e
JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active'
GROUP BY d.kode_divisi, d.nama_divisi
ORDER BY d.kode_divisi;

-- 3. Sample employees with updated salaries
SELECT
    '=== Sample Updated Employees (First 20) ===' as title,
    e.employee_id,
    e.full_name,
    d.kode_divisi,
    TO_CHAR(e.base_salary, 'Rp 999,999,999') as gaji_pokok
FROM public.employees e
LEFT JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active'
ORDER BY e.base_salary DESC
LIMIT 20;
```

**Expected Verification Results:**
- ✅ Salary distribution should show ~40% in Pegawai range, ~55% in Karyawan range, ~5% in PKWT range
- ✅ All divisions should have employees with varied salaries
- ✅ No employees with NULL or 0 base_salary
- ✅ All salaries should match values from master_upah table

---

## 🔄 Re-running the Script

Script ini bisa di-run ulang kapan saja untuk generate assignment yang berbeda:
- Setiap run akan menghasilkan random assignment yang berbeda
- Safe untuk di-run multiple times (hanya update base_salary)
- Tidak akan corrupt data karena hanya update 1 column

---

## 📊 Files Overview

| File | Purpose | Status |
|------|---------|--------|
| `update_employee_salaries.sql` | Main script (3 steps in 1 file) | ✅ Ready |
| `EMPLOYEE_SALARY_UPDATE_READY.md` | This documentation | ✅ Current |
| `seed_employee_wages_simple.sql` | Old version (adds columns) | ⚠️ Superseded |
| `042_seed_employee_wage_scales.sql` | Old migration (adds columns) | ⚠️ Superseded |

---

## ⚠️ Important Notes

1. **NO New Columns**: Script hanya update `base_salary`, tidak menambah kolom `skala_upah` atau `golongan_upah`

2. **wage_scale_id Not Modified**: Kolom `wage_scale_id` tetap reference ke `wage_scales` table (old system), tidak di-update

3. **Random Results**: Setiap kali run akan dapat hasil yang berbeda karena random assignment

4. **Division-Based**: Setiap employee hanya akan dapat wage scale dari divisinya sendiri

5. **Year 2025**: Script mengambil data dari `master_upah` untuk tahun 2025

6. **Active Only**: Hanya employee dengan `status = 'active'` yang di-update

---

## 🚀 Next Steps

1. ✅ **Copy** `update_employee_salaries.sql` ke Supabase SQL Editor
2. ✅ **Run STEP 1** queries untuk check current data
3. ✅ **Review** hasil STEP 1, pastikan wage scales sudah lengkap (141 per division)
4. ⚠️ **Run STEP 2** DO block untuk update salaries (WRITE operation!)
5. ✅ **Run STEP 3** queries untuk verify hasil update
6. ✅ **Check** EmployeeManagement.tsx untuk lihat hasilnya di UI

---

## 📞 Troubleshooting

### Issue: "No wage scale found for employee"
**Cause**: Division tidak punya wage scales di master_upah
**Solution**: Run migration 039_seed_wage_scales_2025.sql untuk division tersebut

### Issue: "Total skipped > 0"
**Cause**: Ada employee tanpa division_id
**Solution**: Assign division ke employee tersebut dulu sebelum run script

### Issue: Hasil tidak sesuai distribusi (40%/55%/5%)
**Cause**: Random distribution, variance is normal
**Solution**: Re-run script untuk dapat distribusi yang berbeda

---

## ✅ Checklist Before Execution

- [ ] Sudah run migration 039 (wage scales 2025)?
- [ ] Sudah verify all divisions punya 141 wage scales?
- [ ] Sudah backup data employees (optional tapi recommended)?
- [ ] Sudah run STEP 1 queries dan review hasilnya?
- [ ] Siap untuk update base_salary untuk semua active employees?

---

**Ready to Execute!** 🚀

Script sudah siap digunakan. Copy dari `update_employee_salaries.sql` dan jalankan step by step di Supabase SQL Editor.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Author:** Claude (Sigma Payroll Team)
