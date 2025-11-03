-- ============================================================================
-- VERIFY AND FIX ALL CLINIC PERMISSIONS
-- ============================================================================
-- This script ensures ALL clinic permissions exist for all roles
-- Safe to run multiple times (uses ON CONFLICT)
-- ============================================================================

DO $$
DECLARE
  v_super_admin_id UUID;
  v_admin_id UUID;
  v_manager_id UUID;
  v_doctor_id UUID;
  v_nurse_id UUID;
  v_clinic_admin_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO v_super_admin_id FROM roles WHERE code = 'super_admin';
  SELECT id INTO v_admin_id FROM roles WHERE code = 'admin';
  SELECT id INTO v_manager_id FROM roles WHERE code = 'manager';
  SELECT id INTO v_doctor_id FROM roles WHERE code = 'clinic_doctor';
  SELECT id INTO v_nurse_id FROM roles WHERE code = 'clinic_nurse';
  SELECT id INTO v_clinic_admin_id FROM roles WHERE code = 'clinic_admin';

  RAISE NOTICE 'Found role IDs:';
  RAISE NOTICE 'super_admin: %', v_super_admin_id;
  RAISE NOTICE 'admin: %', v_admin_id;
  RAISE NOTICE 'manager: %', v_manager_id;
  RAISE NOTICE 'clinic_doctor: %', v_doctor_id;
  RAISE NOTICE 'clinic_nurse: %', v_nurse_id;
  RAISE NOTICE 'clinic_admin: %', v_clinic_admin_id;

  -- ===========================================================================
  -- SUPER ADMIN - Full access to ALL clinic modules
  -- ===========================================================================
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_super_admin_id, 'clinic_dashboard', true, true, true, true),
    (v_super_admin_id, 'clinic_master_medicines', true, true, true, true),
    (v_super_admin_id, 'clinic_master_suppliers', true, true, true, true),
    (v_super_admin_id, 'clinic_master_doctors', true, true, true, true),
    (v_super_admin_id, 'clinic_master_nurses', true, true, true, true),
    (v_super_admin_id, 'clinic_master_diseases', true, true, true, true),
    (v_super_admin_id, 'clinic_registration', true, true, true, true),
    (v_super_admin_id, 'clinic_examination', true, true, true, true),
    (v_super_admin_id, 'clinic_prescription', true, true, true, true),
    (v_super_admin_id, 'clinic_dispensing', true, true, true, true),
    (v_super_admin_id, 'clinic_sick_letter', true, true, true, true),
    (v_super_admin_id, 'clinic_stock_management', true, true, true, true),
    (v_super_admin_id, 'clinic_reports', true, true, true, true)
  ON CONFLICT (role_id, module_name) DO UPDATE SET
    can_view = EXCLUDED.can_view,
    can_create = EXCLUDED.can_create,
    can_edit = EXCLUDED.can_edit,
    can_delete = EXCLUDED.can_delete;

  RAISE NOTICE 'Super Admin permissions updated';

  -- ===========================================================================
  -- ADMIN - Full operational access
  -- ===========================================================================
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_admin_id, 'clinic_dashboard', true, false, false, false),
    (v_admin_id, 'clinic_master_medicines', true, true, true, false),
    (v_admin_id, 'clinic_master_suppliers', true, true, true, false),
    (v_admin_id, 'clinic_master_doctors', true, true, true, false),
    (v_admin_id, 'clinic_master_nurses', true, true, true, false),
    (v_admin_id, 'clinic_master_diseases', true, true, true, false),
    (v_admin_id, 'clinic_registration', true, true, true, false),
    (v_admin_id, 'clinic_examination', true, false, false, false),
    (v_admin_id, 'clinic_prescription', true, false, false, false),
    (v_admin_id, 'clinic_dispensing', true, true, true, false),
    (v_admin_id, 'clinic_sick_letter', true, false, false, false),
    (v_admin_id, 'clinic_stock_management', true, true, true, false),
    (v_admin_id, 'clinic_reports', true, false, false, false)
  ON CONFLICT (role_id, module_name) DO UPDATE SET
    can_view = EXCLUDED.can_view,
    can_create = EXCLUDED.can_create,
    can_edit = EXCLUDED.can_edit,
    can_delete = EXCLUDED.can_delete;

  RAISE NOTICE 'Admin permissions updated';

  -- ===========================================================================
  -- MANAGER - View only
  -- ===========================================================================
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_manager_id, 'clinic_dashboard', true, false, false, false),
    (v_manager_id, 'clinic_reports', true, false, false, false)
  ON CONFLICT (role_id, module_name) DO UPDATE SET
    can_view = EXCLUDED.can_view,
    can_create = EXCLUDED.can_create,
    can_edit = EXCLUDED.can_edit,
    can_delete = EXCLUDED.can_delete;

  RAISE NOTICE 'Manager permissions updated';

  -- ===========================================================================
  -- CLINIC DOCTOR - Clinical operations
  -- ===========================================================================
  IF v_doctor_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
    VALUES
      (v_doctor_id, 'clinic_dashboard', true, false, false, false),
      (v_doctor_id, 'clinic_master_medicines', true, false, false, false),
      (v_doctor_id, 'clinic_master_diseases', true, false, false, false),
      (v_doctor_id, 'clinic_registration', true, false, false, false),
      (v_doctor_id, 'clinic_examination', true, true, true, false),
      (v_doctor_id, 'clinic_prescription', true, true, true, false),
      (v_doctor_id, 'clinic_sick_letter', true, true, true, false),
      (v_doctor_id, 'clinic_stock_management', true, false, false, false),
      (v_doctor_id, 'clinic_reports', true, false, false, false)
    ON CONFLICT (role_id, module_name) DO UPDATE SET
      can_view = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;

    RAISE NOTICE 'Clinic Doctor permissions updated';
  END IF;

  -- ===========================================================================
  -- CLINIC NURSE - Registration and dispensing
  -- ===========================================================================
  IF v_nurse_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
    VALUES
      (v_nurse_id, 'clinic_dashboard', true, false, false, false),
      (v_nurse_id, 'clinic_master_medicines', true, false, false, false),
      (v_nurse_id, 'clinic_registration', true, true, true, false),
      (v_nurse_id, 'clinic_examination', true, false, false, false),
      (v_nurse_id, 'clinic_prescription', true, false, false, false),
      (v_nurse_id, 'clinic_dispensing', true, true, true, false),
      (v_nurse_id, 'clinic_stock_management', true, true, false, false),
      (v_nurse_id, 'clinic_reports', true, false, false, false)
    ON CONFLICT (role_id, module_name) DO UPDATE SET
      can_view = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;

    RAISE NOTICE 'Clinic Nurse permissions updated';
  END IF;

  -- ===========================================================================
  -- CLINIC ADMIN - Administrative tasks
  -- ===========================================================================
  IF v_clinic_admin_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
    VALUES
      (v_clinic_admin_id, 'clinic_dashboard', true, false, false, false),
      (v_clinic_admin_id, 'clinic_master_medicines', true, true, true, false),
      (v_clinic_admin_id, 'clinic_master_suppliers', true, true, true, false),
      (v_clinic_admin_id, 'clinic_master_doctors', true, true, true, false),
      (v_clinic_admin_id, 'clinic_master_nurses', true, true, true, false),
      (v_clinic_admin_id, 'clinic_master_diseases', true, true, true, false),
      (v_clinic_admin_id, 'clinic_registration', true, true, true, false),
      (v_clinic_admin_id, 'clinic_dispensing', true, true, true, false),
      (v_clinic_admin_id, 'clinic_stock_management', true, true, true, false),
      (v_clinic_admin_id, 'clinic_reports', true, true, false, false)
    ON CONFLICT (role_id, module_name) DO UPDATE SET
      can_view = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;

    RAISE NOTICE 'Clinic Admin permissions updated';
  END IF;

  RAISE NOTICE '=== ALL CLINIC PERMISSIONS UPDATED SUCCESSFULLY ===';
END $$;

-- ===========================================================================
-- VERIFICATION QUERY - Show all clinic permissions
-- ===========================================================================
SELECT
  r.name as role_name,
  r.code as role_code,
  rp.module_name,
  rp.can_view as "View",
  rp.can_create as "Create",
  rp.can_edit as "Edit",
  rp.can_delete as "Delete"
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE rp.module_name LIKE 'clinic%'
ORDER BY r.name, rp.module_name;
