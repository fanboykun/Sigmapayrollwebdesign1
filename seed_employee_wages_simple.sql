-- =====================================================
-- Simple Employee Wage Scale Seed Data
-- Description: Quick script to assign random wage scales to employees
-- Author: Sigma Payroll Team
-- Date: 2025-11-17
-- =====================================================

-- =====================================================
-- OPTION 1: Add columns to store wage scale info directly
-- =====================================================
-- Run this first if columns don't exist yet
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS skala_upah TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS golongan_upah TEXT CHECK (golongan_upah IN ('pegawai', 'karyawan', 'pkwt'));

-- =====================================================
-- OPTION 2: Simple random assignment
-- =====================================================
-- This will randomly assign wage scales from master_upah to each employee

DO $$
DECLARE
    emp_record RECORD;
    random_wage RECORD;
    total_updated INTEGER := 0;
BEGIN
    RAISE NOTICE '🚀 Starting employee wage scale assignment...';
    RAISE NOTICE '';

    -- Loop through all employees
    FOR emp_record IN
        SELECT id, employee_id, full_name, division_id
        FROM public.employees
        WHERE status = 'active'
          AND division_id IS NOT NULL
        ORDER BY employee_id
    LOOP
        -- Get a random wage scale for this employee's division
        SELECT
            mu.skala,
            mu.golongan,
            mu.upah_pokok
        INTO random_wage
        FROM public.master_upah mu
        WHERE mu.divisi_id = emp_record.division_id
          AND mu.tahun = 2025
          AND mu.is_active = true
          -- Weighted random: favor karyawan scales (more common)
          AND mu.golongan = CASE
              WHEN random() < 0.40 THEN 'pegawai'  -- 40% pegawai
              WHEN random() < 0.95 THEN 'karyawan' -- 55% karyawan
              ELSE 'pkwt'                           -- 5% pkwt
          END
        ORDER BY random()
        LIMIT 1;

        -- If no wage found (shouldn't happen), skip
        IF NOT FOUND THEN
            RAISE NOTICE '⚠️  No wage scale for employee %', emp_record.employee_id;
            CONTINUE;
        END IF;

        -- Update employee
        UPDATE public.employees
        SET
            skala_upah = random_wage.skala,
            golongan_upah = random_wage.golongan,
            base_salary = random_wage.upah_pokok,
            updated_at = NOW()
        WHERE id = emp_record.id;

        total_updated := total_updated + 1;

        -- Progress indicator every 50 employees
        IF total_updated % 50 = 0 THEN
            RAISE NOTICE '✓ Processed % employees...', total_updated;
        END IF;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Assignment completed!';
    RAISE NOTICE '📊 Total employees updated: %', total_updated;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- Verify the results
-- =====================================================
SELECT
    '=== Salary Distribution by Golongan ===' as title,
    golongan_upah,
    COUNT(*) as jumlah_karyawan,
    TO_CHAR(AVG(base_salary), 'Rp 999,999,999') as rata_rata_gaji,
    TO_CHAR(MIN(base_salary), 'Rp 999,999,999') as gaji_terendah,
    TO_CHAR(MAX(base_salary), 'Rp 999,999,999') as gaji_tertinggi
FROM public.employees
WHERE status = 'active' AND golongan_upah IS NOT NULL
GROUP BY golongan_upah
ORDER BY AVG(base_salary) DESC;

-- Show sample employees with their assigned scales
SELECT
    '=== Sample Employees (First 20) ===' as title,
    e.employee_id,
    e.full_name,
    d.kode_divisi,
    e.golongan_upah,
    e.skala_upah,
    TO_CHAR(e.base_salary, 'Rp 999,999,999') as upah_pokok
FROM public.employees e
LEFT JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active'
  AND e.golongan_upah IS NOT NULL
ORDER BY e.employee_id
LIMIT 20;
