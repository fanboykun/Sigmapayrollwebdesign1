-- =====================================================
-- Update Employee Salaries from Master Upah
-- Description: Assign random salaries from master_upah to existing employees
-- Date: 2025-11-17
-- =====================================================

-- =====================================================
-- STEP 1: CHECK CURRENT EMPLOYEES TABLE STRUCTURE
-- =====================================================
-- Run this first to see what we're working with

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

-- =====================================================
-- STEP 2: UPDATE EMPLOYEE BASE_SALARY
-- =====================================================
-- This will randomly assign base_salary from master_upah
-- based on employee's division

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
              WHEN random() < 0.95 THEN 'karyawan' -- 55% karyawan (cumulative 0.40 + 0.55 = 0.95)
              ELSE 'pkwt'                           -- 5% pkwt (remaining)
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

-- =====================================================
-- STEP 3: VERIFY THE RESULTS
-- =====================================================

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

-- 4. Statistics comparison
SELECT
    '=== Before & After Statistics ===' as title,
    'Check if salaries now match master_upah ranges' as note;

-- =====================================================
-- NOTES
-- =====================================================
-- This script only updates base_salary column.
-- wage_scale_id remains unchanged (points to old wage_scales table).
--
-- If you want to track which golongan (pegawai/karyawan/pkwt) was assigned,
-- you would need to add new columns. For now, this just updates the salary
-- amount randomly from available scales in master_upah.
--
-- Distribution:
-- - 40% will get Pegawai salaries (higher range)
-- - 55% will get Karyawan salaries (mid range)
-- - 5% will get PKWT salaries (base rate)
--
-- To re-run with different results, just execute this script again.
-- Each run will generate different random assignments.

-- =====================================================
-- END OF SCRIPT
-- =====================================================
