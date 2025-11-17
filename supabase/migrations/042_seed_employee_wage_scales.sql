-- =====================================================
-- Migration: 042_seed_employee_wage_scales.sql
-- Description: Assign random wage scales to existing employees
-- Author: Sigma Payroll Team
-- Date: 2025-11-17
-- =====================================================

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- This script will randomly assign wage scales from master_upah to employees
-- based on their division. The assignment follows these rules:
--
-- 1. Each employee gets a wage scale from their own division
-- 2. Random golongan (pegawai/karyawan/pkwt) with weighted distribution:
--    - 40% Pegawai (grades I-VIII)
--    - 55% Karyawan (grades KI-KX)
--    - 5% PKWT
-- 3. Random scale level within the selected grade
-- 4. Only assigns to employees who don't have wage_scale_id yet
--
-- NOTE: This uses wage_scale_id column which references wage_scales table.
-- If you're using master_upah directly in EmployeeManagement.tsx,
-- you might want to add a new column or update the reference.

-- =====================================================
-- STEP 1: Check if we need to add a column for master_upah reference
-- =====================================================
-- Option A: Add new column that references master_upah directly
-- Uncomment if you want to use master_upah instead of wage_scales

-- ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS skala_upah TEXT;
-- ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS golongan TEXT CHECK (golongan IN ('pegawai', 'karyawan', 'pkwt'));

-- =====================================================
-- STEP 2: Temporary function to get random wage scale
-- =====================================================
CREATE OR REPLACE FUNCTION get_random_wage_scale(
    p_division_id UUID,
    p_tahun INTEGER DEFAULT 2025
) RETURNS TABLE (
    skala TEXT,
    golongan TEXT,
    upah_pokok NUMERIC
) AS $$
DECLARE
    v_random_golongan TEXT;
    v_random_value NUMERIC;
BEGIN
    -- Generate random number 0-100
    v_random_value := random() * 100;

    -- Weighted random selection:
    -- 0-40: pegawai (40%)
    -- 40-95: karyawan (55%)
    -- 95-100: pkwt (5%)
    IF v_random_value < 40 THEN
        v_random_golongan := 'pegawai';
    ELSIF v_random_value < 95 THEN
        v_random_golongan := 'karyawan';
    ELSE
        v_random_golongan := 'pkwt';
    END IF;

    -- Return a random scale from the selected golongan and division
    RETURN QUERY
    SELECT
        mu.skala,
        mu.golongan,
        mu.upah_pokok
    FROM public.master_upah mu
    WHERE mu.divisi_id = p_division_id
      AND mu.tahun = p_tahun
      AND mu.golongan = v_random_golongan
      AND mu.is_active = true
    ORDER BY random()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: Update employees with random wage scales
-- =====================================================
DO $$
DECLARE
    emp_record RECORD;
    wage_info RECORD;
    updated_count INTEGER := 0;
    skipped_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting employee wage scale assignment...';

    -- Loop through all active employees without wage scale
    FOR emp_record IN
        SELECT
            e.id,
            e.employee_id,
            e.full_name,
            e.division_id
        FROM public.employees e
        WHERE e.status = 'active'
          AND e.division_id IS NOT NULL
          -- Only update if wage_scale_id is NULL (uncomment if column exists)
          -- AND e.wage_scale_id IS NULL
        ORDER BY e.employee_id
    LOOP
        -- Get random wage scale for this employee's division
        SELECT * INTO wage_info
        FROM get_random_wage_scale(emp_record.division_id, 2025);

        IF wage_info IS NULL THEN
            RAISE NOTICE 'No wage scale found for employee % (Division ID: %)',
                emp_record.employee_id, emp_record.division_id;
            skipped_count := skipped_count + 1;
            CONTINUE;
        END IF;

        -- Update employee with assigned wage scale info
        -- Option A: If using separate columns (uncomment if you added columns)
        /*
        UPDATE public.employees
        SET
            skala_upah = wage_info.skala,
            golongan = wage_info.golongan,
            base_salary = wage_info.upah_pokok,
            updated_at = NOW()
        WHERE id = emp_record.id;
        */

        -- Option B: Just update base_salary based on random scale
        UPDATE public.employees
        SET
            base_salary = wage_info.upah_pokok,
            updated_at = NOW()
        WHERE id = emp_record.id;

        updated_count := updated_count + 1;

        -- Log every 10th employee for monitoring
        IF updated_count % 10 = 0 THEN
            RAISE NOTICE 'Processed % employees...', updated_count;
        END IF;
    END LOOP;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Employee wage scale assignment completed!';
    RAISE NOTICE 'Total updated: %', updated_count;
    RAISE NOTICE 'Total skipped: %', skipped_count;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- STEP 4: Clean up temporary function
-- =====================================================
DROP FUNCTION IF EXISTS get_random_wage_scale(UUID, INTEGER);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- To verify the assignments, run these queries:

-- 1. Check distribution of wage scales by golongan
/*
SELECT
    d.kode_divisi,
    d.nama_divisi,
    COUNT(*) as total_employees,
    AVG(e.base_salary) as avg_salary,
    MIN(e.base_salary) as min_salary,
    MAX(e.base_salary) as max_salary
FROM public.employees e
JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active'
GROUP BY d.kode_divisi, d.nama_divisi
ORDER BY d.kode_divisi;
*/

-- 2. Check salary distribution
/*
SELECT
    CASE
        WHEN base_salary < 3500000 THEN 'Karyawan (< 3.5M)'
        WHEN base_salary BETWEEN 3500000 AND 4500000 THEN 'Pegawai I-IV (3.5M-4.5M)'
        WHEN base_salary > 4500000 THEN 'Pegawai V-VIII (> 4.5M)'
    END as salary_range,
    COUNT(*) as employee_count
FROM public.employees
WHERE status = 'active'
GROUP BY salary_range
ORDER BY MIN(base_salary);
*/

-- 3. Employees by division with salary info
/*
SELECT
    d.kode_divisi,
    d.nama_divisi,
    e.employee_id,
    e.full_name,
    e.base_salary,
    TO_CHAR(e.base_salary, 'Rp 999,999,999') as formatted_salary
FROM public.employees e
JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active'
ORDER BY d.kode_divisi, e.base_salary DESC
LIMIT 20;
*/

-- =====================================================
-- NOTES FOR FUTURE USE
-- =====================================================
-- If you want to use master_upah directly in EmployeeManagement:
--
-- 1. Add these columns to employees table:
--    ALTER TABLE employees ADD COLUMN skala_upah TEXT;
--    ALTER TABLE employees ADD COLUMN golongan TEXT;
--
-- 2. Modify the UPDATE statement in STEP 3 to use Option A
--
-- 3. Update EmployeeManagement.tsx to read from these columns:
--    employee.skala_upah instead of joining wage_scales
--
-- 4. For new employees, create a dropdown that fetches from master_upah
--    filtered by the employee's division and year 2025

-- =====================================================
-- END OF MIGRATION
-- =====================================================
