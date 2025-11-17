-- =====================================================
-- Migration: 037_seed_attendance_november_2025.sql
-- Description: Seed attendance data for November 2025 (working days only)
-- Author: Sigma Payroll Team
-- Date: 2025-11-16
-- =====================================================

-- Generate attendance records for all active employees in November 2025
-- Excludes Sunday only (Saturday is a working day)
-- Realistic distribution: ~90% present, ~5% leave, ~3% sick, ~2% absent

DO $$
DECLARE
    total_inserted INT := 0;
BEGIN
    -- Delete existing attendance records for November 2025 (if any)
    DELETE FROM attendance_records
    WHERE date >= '2025-11-01' AND date <= '2025-11-30';

    RAISE NOTICE 'Deleted existing November 2025 attendance records';

    -- Insert attendance records for all active employees
    -- For all working days in November 2025 (Monday-Saturday)
    INSERT INTO attendance_records (employee_id, date, status, notes)
    SELECT
        e.id as employee_id,
        d.date,
        CASE
            -- Sunday check (should not happen as we filter below, but as safety)
            WHEN EXTRACT(DOW FROM d.date) = 0 THEN 'present'
            -- Random realistic distribution
            WHEN random() < 0.90 THEN 'present'  -- 90% present
            WHEN random() < 0.50 THEN 'leave'     -- 5% leave (50% of remaining 10%)
            WHEN random() < 0.60 THEN 'sick'      -- 3% sick (60% of remaining 5%)
            ELSE 'absent'                         -- 2% absent
        END as status,
        CASE
            WHEN EXTRACT(DOW FROM d.date) = 0 THEN 'Sunday'
            WHEN random() < 0.90 THEN NULL  -- No notes for present
            WHEN random() < 0.50 THEN 'Izin'
            WHEN random() < 0.60 THEN 'Sakit'
            ELSE 'Tanpa keterangan'
        END as notes
    FROM
        employees e
    CROSS JOIN
        -- Generate all dates in November 2025
        generate_series(
            '2025-11-01'::date,
            '2025-11-30'::date,
            '1 day'::interval
        ) as d(date)
    WHERE
        e.status = 'active'
        -- Exclude Sunday only (0 = Sunday)
        AND EXTRACT(DOW FROM d.date) <> 0
    ON CONFLICT (employee_id, date) DO NOTHING;

    -- Get count of inserted records
    GET DIAGNOSTICS total_inserted = ROW_COUNT;

    RAISE NOTICE 'Successfully inserted % attendance records for November 2025', total_inserted;
    RAISE NOTICE 'November 2025 working days: 26 days (Monday-Saturday, excluding Sunday only)';
    RAISE NOTICE 'Coverage: All active employees x 26 working days';

END $$;

-- Verify the data
DO $$
DECLARE
    total_employees INT;
    total_records INT;
    total_present INT;
    total_leave INT;
    total_sick INT;
    total_absent INT;
    working_days INT;
BEGIN
    -- Count active employees
    SELECT COUNT(*) INTO total_employees
    FROM employees
    WHERE status = 'active';

    -- Count total attendance records for November 2025
    SELECT COUNT(*) INTO total_records
    FROM attendance_records
    WHERE date >= '2025-11-01' AND date <= '2025-11-30';

    -- Count by status
    SELECT
        COUNT(*) FILTER (WHERE status = 'present'),
        COUNT(*) FILTER (WHERE status = 'leave'),
        COUNT(*) FILTER (WHERE status = 'sick'),
        COUNT(*) FILTER (WHERE status = 'absent')
    INTO total_present, total_leave, total_sick, total_absent
    FROM attendance_records
    WHERE date >= '2025-11-01' AND date <= '2025-11-30';

    -- Count working days (excluding Sunday only)
    SELECT COUNT(*) INTO working_days
    FROM generate_series(
        '2025-11-01'::date,
        '2025-11-30'::date,
        '1 day'::interval
    ) as d(date)
    WHERE EXTRACT(DOW FROM d.date) <> 0;

    -- Display summary
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ATTENDANCE SEED DATA SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Period: November 2025';
    RAISE NOTICE 'Working Days: % days (Mon-Sat)', working_days;
    RAISE NOTICE 'Active Employees: %', total_employees;
    RAISE NOTICE 'Total Records: %', total_records;
    RAISE NOTICE 'Expected Records: % (% employees x % days)',
        total_employees * working_days, total_employees, working_days;
    RAISE NOTICE '';
    RAISE NOTICE 'Status Distribution:';
    RAISE NOTICE '  Present (HK): % (%.1f%%)',
        total_present, (total_present::float / total_records * 100);
    RAISE NOTICE '  Leave (P):    % (%.1f%%)',
        total_leave, (total_leave::float / total_records * 100);
    RAISE NOTICE '  Sick (S):     % (%.1f%%)',
        total_sick, (total_sick::float / total_records * 100);
    RAISE NOTICE '  Absent (A):   % (%.1f%%)',
        total_absent, (total_absent::float / total_records * 100);
    RAISE NOTICE '========================================';

END $$;

-- Add some comments
COMMENT ON TABLE attendance_records IS 'Attendance records including November 2025 seed data with realistic distribution';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
