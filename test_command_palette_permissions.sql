    -- =====================================================
    -- TEST QUERIES FOR COMMAND PALETTE PERMISSIONS
    -- =====================================================
    -- File: test_command_palette_permissions.sql
    -- Purpose: Test queries untuk memverifikasi permission-based filtering di Command Palette
    -- Date: 2025-11-13
    -- =====================================================

    -- =====================================================
    -- 1. CHECK ALL ROLES AND THEIR PERMISSIONS
    -- =====================================================
    SELECT
        r.code as role_code,
        r.name as role_name,
        rp.module_name,
        rp.can_view,
        rp.can_create,
        rp.can_edit,
        rp.can_delete
    FROM public.roles r
    LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
    ORDER BY r.code, rp.module_name;

    -- =====================================================
    -- 2. CHECK SUPER_ADMIN PERMISSIONS
    -- =====================================================
    SELECT
        rp.module_name,
        rp.can_view
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.code = 'super_admin'
    AND rp.can_view = true
    ORDER BY rp.module_name;

    -- =====================================================
    -- 3. CHECK ADMIN PERMISSIONS (VIEW ONLY)
    -- =====================================================
    SELECT
        rp.module_name,
        rp.can_view
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.code = 'admin'
    AND rp.can_view = true
    ORDER BY rp.module_name;

    -- =====================================================
    -- 4. CHECK MANAGER PERMISSIONS (VIEW ONLY)
    -- =====================================================
    SELECT
        rp.module_name,
        rp.can_view
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.code = 'manager'
    AND rp.can_view = true
    ORDER BY rp.module_name;

    -- =====================================================
    -- 5. CHECK KARYAWAN PERMISSIONS (VIEW ONLY)
    -- =====================================================
    SELECT
        rp.module_name,
        rp.can_view
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.code = 'karyawan'
    AND rp.can_view = true
    ORDER BY rp.module_name;

    -- =====================================================
    -- 6. CHECK SPECIFIC MODULES PERMISSIONS ACROSS ALL ROLES
    -- =====================================================
    -- Premi Deres Modules
    SELECT
        r.code as role_code,
        rp.module_name,
        rp.can_view
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE rp.module_name IN (
        'premi_deres_master',
        'premi_deres_penggajian',
        'premi_deres_laporan'
    )
    ORDER BY rp.module_name, r.code;

    -- Premi Sawit Modules
    SELECT
        r.code as role_code,
        rp.module_name,
        rp.can_view
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE rp.module_name IN (
        'premi_master',
        'premi_penggajian',
        'premi_laporan'
    )
    ORDER BY rp.module_name, r.code;

    -- Clinic Modules
    SELECT
        r.code as role_code,
        rp.module_name,
        rp.can_view
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE rp.module_name IN (
        'clinic_registration',
        'clinic_examination',
        'clinic_prescription',
        'clinic_stock_management',
        'clinic_dispensing',
        'clinic_reports'
    )
    ORDER BY rp.module_name, r.code;

    -- =====================================================
    -- 7. COUNT VIEWABLE MODULES PER ROLE
    -- =====================================================
    SELECT
        r.code as role_code,
        r.name as role_name,
        COUNT(*) as total_viewable_modules
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE rp.can_view = true
    GROUP BY r.code, r.name
    ORDER BY total_viewable_modules DESC;

    -- =====================================================
    -- 8. CHECK IF PREMI DERES PERMISSIONS EXIST
    -- =====================================================
    SELECT EXISTS(
        SELECT 1
        FROM public.role_permissions
        WHERE module_name IN (
            'premi_deres_master',
            'premi_deres_penggajian',
            'premi_deres_laporan'
        )
    ) as premi_deres_permissions_exist;

    -- =====================================================
    -- 9. LIST ALL UNIQUE MODULES IN ROLE_PERMISSIONS
    -- =====================================================
    SELECT DISTINCT module_name
    FROM public.role_permissions
    ORDER BY module_name;

    -- =====================================================
    -- 10. VERIFY USER ROLES AND THEIR ASSIGNMENTS
    -- =====================================================
    SELECT
        u.email,
        u.full_name,
        r.code as role_code,
        r.name as role_name
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.status = 'active'
    ORDER BY r.code, u.full_name;

    -- =====================================================
    -- 11. CHECK MISSING PERMISSIONS FOR SPECIFIC ROLE
    -- =====================================================
    -- This query finds modules that exist in role_permissions
    -- but don't have view access for a specific role
    WITH all_modules AS (
        SELECT DISTINCT module_name
        FROM role_permissions
    )
    SELECT
        am.module_name,
        COALESCE(rp.can_view, false) as has_view_permission
    FROM all_modules am
    LEFT JOIN (
        SELECT rp.module_name, rp.can_view
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        WHERE r.code = 'manager' -- Change this to test other roles
    ) rp ON am.module_name = rp.module_name
    WHERE COALESCE(rp.can_view, false) = false
    ORDER BY am.module_name;

    -- =====================================================
    -- HOW TO RUN THESE QUERIES
    -- =====================================================
    /*
    Option 1: Via Supabase Dashboard
    1. Login to Supabase Dashboard
    2. Go to SQL Editor
    3. Copy and paste queries one by one
    4. Execute and verify results

    Option 2: Via psql (if Docker is running)
    1. Start Docker Desktop
    2. Run: npx supabase start
    3. Run: psql -h localhost -p 54322 -U postgres -d postgres -f test_command_palette_permissions.sql

    EXPECTED RESULTS:
    ==================
    1. Super Admin should have can_view=true for ALL modules
    2. Admin should have can_view=true for most modules (except sensitive ones)
    3. Manager should have can_view=true for operational modules
    4. Karyawan should have can_view=true only for self-service modules

    MODULES TO VERIFY:
    ==================
    Core Payroll:
    - dashboard
    - payroll_view
    - employee_payroll
    - payroll_processing
    - annual_payroll

    Master Data:
    - employee_management
    - division_master
    - position_master
    - wage_master
    - premium_master
    - tax_master
    - potongan_master

    Premi Sawit:
    - premi_master
    - premi_penggajian
    - premi_laporan

    Premi Deres:
    - premi_deres_master
    - premi_deres_penggajian
    - premi_deres_laporan

    Clinic:
    - clinic_registration
    - clinic_examination
    - clinic_prescription
    - clinic_stock_management
    - clinic_dispensing
    - clinic_reports

    Presensi:
    - working_days_master
    - holiday_master
    - attendance_master
    - leave_management

    Administration:
    - user_management
    - role_management

    Reports:
    - payroll_reports
    - bpjs_report
    - presensi_report
    */
