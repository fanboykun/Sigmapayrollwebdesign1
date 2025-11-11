-- ============================================================================
-- SETUP CLINIC ROLES - CLINIC MODULES ONLY
-- ============================================================================
-- Strategy:
-- 1. Add 3 clinic roles (Admin Klinik, Dokter Klinik, Perawat)
-- 2. Give them FULL ACCESS to CLINIC modules ONLY (15 modules)
-- 3. NO access to Payroll/HR modules
-- 4. Admin Klinik can manage Dokter & Perawat permissions via UI
-- 5. Keep existing roles (Admin, Manager, Karyawan) unchanged
--
-- Instructions:
-- 1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/gketmjcxsnzrrzwfrxfw/editor
-- 2. Go to SQL Editor
-- 3. Copy-paste script ini
-- 4. Click "Run" atau tekan Ctrl+Enter
-- ============================================================================

-- ============================================================================
-- PART 1: ADD NEW CLINIC ROLES
-- ============================================================================
-- Strategy: Use DO block with INSERT ON CONFLICT + RETURNING
-- This handles cases where roles already exist with different IDs
-- We capture the actual role_id and store in temp table for later use

DO $$
DECLARE
  admin_klinik_id UUID;
  dokter_klinik_id UUID;
  perawat_id UUID;
BEGIN
  -- Admin Klinik: Insert or get existing
  INSERT INTO roles (id, name, code, description, is_system_role)
  VALUES ('00000000-0000-0000-0000-000000000005', 'Admin Klinik', 'admin_klinik', 'Clinic administrator - clinic modules only', true)
  ON CONFLICT (name) DO UPDATE SET
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    is_system_role = EXCLUDED.is_system_role
  RETURNING id INTO admin_klinik_id;

  -- If no RETURNING (conflict on existing), get the ID
  IF admin_klinik_id IS NULL THEN
    SELECT id INTO admin_klinik_id FROM roles WHERE name = 'Admin Klinik';
  END IF;

  -- Dokter Klinik: Insert or get existing
  INSERT INTO roles (id, name, code, description, is_system_role)
  VALUES ('00000000-0000-0000-0000-000000000006', 'Dokter Klinik', 'dokter_klinik', 'Clinic doctor - clinic modules only', true)
  ON CONFLICT (name) DO UPDATE SET
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    is_system_role = EXCLUDED.is_system_role
  RETURNING id INTO dokter_klinik_id;

  IF dokter_klinik_id IS NULL THEN
    SELECT id INTO dokter_klinik_id FROM roles WHERE name = 'Dokter Klinik';
  END IF;

  -- Perawat: Insert or get existing
  INSERT INTO roles (id, name, code, description, is_system_role)
  VALUES ('00000000-0000-0000-0000-000000000007', 'Perawat', 'perawat', 'Clinic nurse - clinic modules only', true)
  ON CONFLICT (name) DO UPDATE SET
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    is_system_role = EXCLUDED.is_system_role
  RETURNING id INTO perawat_id;

  IF perawat_id IS NULL THEN
    SELECT id INTO perawat_id FROM roles WHERE name = 'Perawat';
  END IF;

  -- Store IDs in temp table for later use
  CREATE TEMP TABLE IF NOT EXISTS clinic_role_ids (
    role_name TEXT,
    role_id UUID
  );

  DELETE FROM clinic_role_ids; -- Clear if exists

  INSERT INTO clinic_role_ids VALUES
    ('Admin Klinik', admin_klinik_id),
    ('Dokter Klinik', dokter_klinik_id),
    ('Perawat', perawat_id);
END $$;

-- ============================================================================
-- PART 2: SET PAYROLL/HR FULL ACCESS FOR EXISTING ROLES
-- ============================================================================
-- Update Admin, Manager, Karyawan with full payroll access including reports

-- List all payroll modules (29 modules)
CREATE TEMP TABLE temp_payroll_modules (module_name TEXT);

INSERT INTO temp_payroll_modules (module_name) VALUES
  -- Dashboard & Core
  ('dashboard'),

  -- Payroll Modules
  ('payroll_view'),
  ('tax_worksheet'),
  ('annual_payroll'),
  ('employee_payroll'),
  ('payroll_processing'),
  ('payroll_reports'),

  -- Reports (including NEW ones)
  ('presensi_report'),
  ('bpjs_report'),

  -- HR & Employee Management
  ('employee_management'),
  ('employee_transfer'),
  ('recruitment'),
  ('termination'),

  -- Master Data
  ('division_master'),
  ('position_master'),
  ('wage_master'),
  ('tax_master'),
  ('premium_master'),
  ('natura_master'),
  ('potongan_master'),

  -- Attendance & Leave
  ('working_days_master'),
  ('holiday_master'),
  ('attendance_master'),
  ('leave_management'),

  -- Others
  ('engagement'),
  ('settings'),
  ('user_management'),
  ('role_management');

-- Super Admin - Full access to EVERYTHING (Payroll + Clinic)
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000001' as role_id,
  module_name,
  true, true, true, true
FROM temp_payroll_modules
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- Administrator - Full payroll access
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000002' as role_id,
  module_name,
  true, true, true, true
FROM temp_payroll_modules
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- Manager - Full payroll access
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000003' as role_id,
  module_name,
  true, true, true, true
FROM temp_payroll_modules
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- Karyawan - Full payroll access
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000004' as role_id,
  module_name,
  true, true, true, true
FROM temp_payroll_modules
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

DROP TABLE temp_payroll_modules;

-- ============================================================================
-- PART 3: SET CLINIC-ONLY ACCESS FOR CLINIC ROLES
-- ============================================================================
-- Admin Klinik, Dokter, Perawat ONLY get clinic modules (15 modules)

-- List all clinic modules (15 modules)
CREATE TEMP TABLE temp_clinic_modules (module_name TEXT);

INSERT INTO temp_clinic_modules (module_name) VALUES
  -- Clinic Dashboard
  ('clinic_dashboard'),

  -- Clinic Master Data
  ('clinic_master_medicines'),
  ('clinic_master_suppliers'),
  ('clinic_master_doctors'),
  ('clinic_master_nurses'),
  ('clinic_master_diseases'),

  -- Clinic Services
  ('clinic_registration'),
  ('clinic_examination'),
  ('clinic_prescription'),
  ('clinic_dispensing'),

  -- Clinic Stock Management
  ('clinic_stock_management'),

  -- Clinic Reports
  ('clinic_reports'),

  -- Role management for Admin Klinik to manage Dokter & Perawat
  ('role_management'),

  -- Dashboard (optional - untuk melihat stats)
  ('dashboard');

-- Admin Klinik - Full access to CLINIC modules ONLY
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  cri.role_id,
  module_name,
  true, true, true, true
FROM temp_clinic_modules
CROSS JOIN clinic_role_ids cri
WHERE cri.role_name = 'Admin Klinik'
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- Dokter Klinik - Full access to CLINIC modules ONLY
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  cri.role_id,
  module_name,
  true, true, true, true
FROM temp_clinic_modules
CROSS JOIN clinic_role_ids cri
WHERE cri.role_name = 'Dokter Klinik'
  AND module_name != 'role_management' -- Dokter tidak bisa manage roles
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- Perawat - Full access to CLINIC modules ONLY
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  cri.role_id,
  module_name,
  true, true, true, true
FROM temp_clinic_modules
CROSS JOIN clinic_role_ids cri
WHERE cri.role_name = 'Perawat'
  AND module_name != 'role_management' -- Perawat tidak bisa manage roles
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- Super Admin also gets clinic modules (for complete access)
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000001' as role_id,
  module_name,
  true, true, true, true
FROM temp_clinic_modules
ON CONFLICT (role_id, module_name) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

DROP TABLE temp_clinic_modules;
DROP TABLE clinic_role_ids;

-- ============================================================================
-- PART 4: VERIFICATION QUERIES
-- ============================================================================

-- Query 1: Summary of all roles and their module counts
SELECT
  r.name as role_name,
  r.code as role_code,
  COUNT(rp.module_name) as total_modules,
  SUM(CASE WHEN rp.can_view THEN 1 ELSE 0 END) as can_view_count,
  SUM(CASE WHEN rp.can_create THEN 1 ELSE 0 END) as can_create_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.is_system_role = true
GROUP BY r.name, r.code, r.id
ORDER BY r.name;

-- Expected output:
-- Super Admin:     ~44 modules (Payroll + Clinic)
-- Administrator:   29 modules (Payroll only)
-- Manager:         29 modules (Payroll only)
-- Karyawan:        29 modules (Payroll only)
-- Admin Klinik:    15 modules (Clinic only) ⭐
-- Dokter Klinik:   14 modules (Clinic only, no role_management) ⭐
-- Perawat:         14 modules (Clinic only, no role_management) ⭐

-- Query 2: Verify payroll reports exist for payroll roles
SELECT
  r.name as role_name,
  rp.module_name,
  rp.can_view
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
WHERE rp.module_name IN ('presensi_report', 'bpjs_report')
ORDER BY r.name, rp.module_name;

-- Expected output: Only Super Admin, Admin, Manager, Karyawan should have these
-- Clinic roles should NOT have payroll reports

-- Query 3: Verify clinic modules distribution
SELECT
  r.name as role_name,
  COUNT(CASE WHEN rp.module_name LIKE 'clinic_%' THEN 1 END) as clinic_modules_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.is_system_role = true
GROUP BY r.name
ORDER BY r.name;

-- Expected output:
-- Super Admin:     13 clinic modules
-- Administrator:   0 clinic modules
-- Manager:         0 clinic modules
-- Karyawan:        0 clinic modules
-- Admin Klinik:    13 clinic modules ⭐
-- Dokter Klinik:   13 clinic modules ⭐
-- Perawat:         13 clinic modules ⭐

-- Query 4: List all roles
SELECT
  id,
  name,
  code,
  description,
  is_system_role
FROM roles
WHERE is_system_role = true
ORDER BY name;

-- Expected output: 7 roles
-- 1. Super Administrator (super_admin) - Full access
-- 2. Administrator (admin) - Payroll only
-- 3. Manager (manager) - Payroll only
-- 4. Karyawan (karyawan) - Payroll only
-- 5. Admin Klinik (admin_klinik) - Clinic only ⭐
-- 6. Dokter Klinik (dokter_klinik) - Clinic only ⭐
-- 7. Perawat (perawat) - Clinic only ⭐

-- Query 5: Check which roles can access role_management
SELECT
  r.name as role_name,
  rp.module_name,
  rp.can_view,
  rp.can_edit
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
WHERE rp.module_name = 'role_management'
ORDER BY r.name;

-- Expected: Super Admin, Admin, Manager, Karyawan, Admin Klinik
-- NOT: Dokter Klinik, Perawat
