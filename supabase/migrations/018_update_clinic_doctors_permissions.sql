-- ============================================================================
-- UPDATE CLINIC DOCTORS PERMISSIONS
-- ============================================================================
-- Version: 1.0.0
-- Description: Memastikan semua role memiliki permissions yang tepat untuk
--              modul clinic_master_doctors yang baru saja dibuat
-- Date: 2025-11-10
-- ============================================================================

-- This migration ensures all roles have proper permissions for the new
-- clinic_master_doctors module

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

  -- SUPER ADMIN - Full access to clinic_master_doctors
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_super_admin_id, 'clinic_master_doctors', true, true, true, true)
  ON CONFLICT (role_id, module_name)
  DO UPDATE SET
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true;

  -- ADMIN - Full operational access (no delete)
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_admin_id, 'clinic_master_doctors', true, true, true, false)
  ON CONFLICT (role_id, module_name)
  DO UPDATE SET
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = false;

  -- CLINIC ADMIN - Can manage doctors (no delete)
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_clinic_admin_id, 'clinic_master_doctors', true, true, true, false)
  ON CONFLICT (role_id, module_name)
  DO UPDATE SET
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = false;

  -- CLINIC DOCTOR - View only (can see other doctors' schedules)
  IF v_doctor_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
    VALUES
      (v_doctor_id, 'clinic_master_doctors', true, false, false, false)
    ON CONFLICT (role_id, module_name)
    DO UPDATE SET
      can_view = true,
      can_create = false,
      can_edit = false,
      can_delete = false;
  END IF;

  -- CLINIC NURSE - View only (need to see doctor schedules for registration)
  IF v_nurse_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
    VALUES
      (v_nurse_id, 'clinic_master_doctors', true, false, false, false)
    ON CONFLICT (role_id, module_name)
    DO UPDATE SET
      can_view = true,
      can_create = false,
      can_edit = false,
      can_delete = false;
  END IF;

  -- Log completion
  RAISE NOTICE 'Clinic doctors permissions updated successfully';

END $$;

-- ============================================================================
-- VERIFY PERMISSIONS
-- ============================================================================
-- You can run this query to verify the permissions were set correctly:
/*
SELECT
  r.name as role_name,
  rp.module_name,
  rp.can_view,
  rp.can_create,
  rp.can_edit,
  rp.can_delete
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
WHERE rp.module_name = 'clinic_master_doctors'
ORDER BY r.name;
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
