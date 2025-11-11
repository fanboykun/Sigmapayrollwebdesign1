-- ============================================================================
-- SCRIPT: SET ALL ROLES TO FULL ACCESS (DEFAULT ENABLED)
-- ============================================================================
-- Tujuan: Set semua role (Admin, Manager, Karyawan) memiliki full access
--         ke semua module by default. Super Admin kemudian dapat menonaktifkan
--         menu tertentu melalui halaman Otorisasi.
--
-- Instructions:
-- 1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/gketmjcxsnzrrzwfrxfw/editor
-- 2. Go to SQL Editor
-- 3. Copy-paste script ini
-- 4. Click "Run" atau tekan Ctrl+Enter
-- ============================================================================

-- ============================================================================
-- STRATEGY: Set all permissions to TRUE for all roles
-- Super Admin will control access via UI toggle
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ADMINISTRATOR - Set FULL ACCESS to ALL modules
-- ----------------------------------------------------------------------------

INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
VALUES
  -- Dashboard & Core
  ('00000000-0000-0000-0000-000000000002', 'dashboard', true, true, true, true),

  -- Payroll Modules
  ('00000000-0000-0000-0000-000000000002', 'payroll_view', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'tax_worksheet', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'annual_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'employee_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'payroll_processing', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'payroll_reports', true, true, true, true),

  -- Reports (NEW)
  ('00000000-0000-0000-0000-000000000002', 'presensi_report', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'bpjs_report', true, true, true, true),

  -- HR & Employee Management
  ('00000000-0000-0000-0000-000000000002', 'employee_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'employee_transfer', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'recruitment', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'termination', true, true, true, true),

  -- Master Data
  ('00000000-0000-0000-0000-000000000002', 'division_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'position_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'wage_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'tax_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'premium_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'natura_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'potongan_master', true, true, true, true),

  -- Attendance & Leave
  ('00000000-0000-0000-0000-000000000002', 'working_days_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'holiday_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'attendance_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'leave_management', true, true, true, true),

  -- Others
  ('00000000-0000-0000-0000-000000000002', 'engagement', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'settings', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'user_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'role_management', true, true, true, true)
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- ----------------------------------------------------------------------------
-- MANAGER - Set FULL ACCESS to ALL modules
-- ----------------------------------------------------------------------------

INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
VALUES
  -- Dashboard & Core
  ('00000000-0000-0000-0000-000000000003', 'dashboard', true, true, true, true),

  -- Payroll Modules
  ('00000000-0000-0000-0000-000000000003', 'payroll_view', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'tax_worksheet', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'annual_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'employee_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'payroll_processing', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'payroll_reports', true, true, true, true),

  -- Reports (NEW)
  ('00000000-0000-0000-0000-000000000003', 'presensi_report', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'bpjs_report', true, true, true, true),

  -- HR & Employee Management
  ('00000000-0000-0000-0000-000000000003', 'employee_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'employee_transfer', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'recruitment', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'termination', true, true, true, true),

  -- Master Data
  ('00000000-0000-0000-0000-000000000003', 'division_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'position_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'wage_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'tax_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'premium_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'natura_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'potongan_master', true, true, true, true),

  -- Attendance & Leave
  ('00000000-0000-0000-0000-000000000003', 'working_days_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'holiday_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'attendance_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'leave_management', true, true, true, true),

  -- Others
  ('00000000-0000-0000-0000-000000000003', 'engagement', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'settings', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'user_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'role_management', true, true, true, true)
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- ----------------------------------------------------------------------------
-- KARYAWAN - Set FULL ACCESS to ALL modules
-- ----------------------------------------------------------------------------

INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
VALUES
  -- Dashboard & Core
  ('00000000-0000-0000-0000-000000000004', 'dashboard', true, true, true, true),

  -- Payroll Modules
  ('00000000-0000-0000-0000-000000000004', 'payroll_view', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'tax_worksheet', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'annual_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'employee_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'payroll_processing', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'payroll_reports', true, true, true, true),

  -- Reports (NEW)
  ('00000000-0000-0000-0000-000000000004', 'presensi_report', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'bpjs_report', true, true, true, true),

  -- HR & Employee Management
  ('00000000-0000-0000-0000-000000000004', 'employee_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'employee_transfer', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'recruitment', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'termination', true, true, true, true),

  -- Master Data
  ('00000000-0000-0000-0000-000000000004', 'division_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'position_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'wage_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'tax_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'premium_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'natura_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'potongan_master', true, true, true, true),

  -- Attendance & Leave
  ('00000000-0000-0000-0000-000000000004', 'working_days_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'holiday_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'attendance_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'leave_management', true, true, true, true),

  -- Others
  ('00000000-0000-0000-0000-000000000004', 'engagement', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'settings', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'user_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000004', 'role_management', true, true, true, true)
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Check all permissions
SELECT
  r.name as role_name,
  COUNT(*) as total_modules,
  SUM(CASE WHEN rp.can_view THEN 1 ELSE 0 END) as can_view_count,
  SUM(CASE WHEN rp.can_create THEN 1 ELSE 0 END) as can_create_count,
  SUM(CASE WHEN rp.can_edit THEN 1 ELSE 0 END) as can_edit_count,
  SUM(CASE WHEN rp.can_delete THEN 1 ELSE 0 END) as can_delete_count
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
GROUP BY r.name
ORDER BY r.name;

-- Check specific modules untuk memastikan presensi_report dan bpjs_report ada
SELECT
  r.name as role_name,
  rp.module_name,
  rp.can_view,
  rp.can_create,
  rp.can_edit,
  rp.can_delete
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
WHERE rp.module_name IN ('presensi_report', 'bpjs_report')
ORDER BY r.name, rp.module_name;
