-- ============================================================================
-- FIX CLINIC PERMISSIONS - Add missing clinic_dispensing permission
-- ============================================================================
-- Run this in Supabase SQL Editor to fix permissions
-- ============================================================================

DO $$
DECLARE
  v_super_admin_id UUID;
  v_admin_id UUID;
  v_nurse_id UUID;
  v_clinic_admin_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO v_super_admin_id FROM roles WHERE code = 'super_admin';
  SELECT id INTO v_admin_id FROM roles WHERE code = 'admin';
  SELECT id INTO v_nurse_id FROM roles WHERE code = 'clinic_nurse';
  SELECT id INTO v_clinic_admin_id FROM roles WHERE code = 'clinic_admin';

  -- Add clinic_dispensing permission for super_admin
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES (v_super_admin_id, 'clinic_dispensing', true, true, true, true)
  ON CONFLICT (role_id, module_name) DO UPDATE SET
    can_view = EXCLUDED.can_view,
    can_create = EXCLUDED.can_create,
    can_edit = EXCLUDED.can_edit,
    can_delete = EXCLUDED.can_delete;

  -- Add clinic_dispensing permission for admin
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES (v_admin_id, 'clinic_dispensing', true, true, true, false)
  ON CONFLICT (role_id, module_name) DO UPDATE SET
    can_view = EXCLUDED.can_view,
    can_create = EXCLUDED.can_create,
    can_edit = EXCLUDED.can_edit,
    can_delete = EXCLUDED.can_delete;

  -- Add clinic_dispensing permission for nurse
  IF v_nurse_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
    VALUES (v_nurse_id, 'clinic_dispensing', true, true, true, false)
    ON CONFLICT (role_id, module_name) DO UPDATE SET
      can_view = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;
  END IF;

  -- Add clinic_dispensing permission for clinic_admin
  IF v_clinic_admin_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
    VALUES (v_clinic_admin_id, 'clinic_dispensing', true, true, true, false)
    ON CONFLICT (role_id, module_name) DO UPDATE SET
      can_view = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;
  END IF;

  RAISE NOTICE 'Clinic permissions updated successfully!';
END $$;

-- Verify permissions
SELECT
  r.name as role_name,
  rp.module_name,
  rp.can_view,
  rp.can_create,
  rp.can_edit,
  rp.can_delete
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE rp.module_name LIKE 'clinic%'
ORDER BY r.name, rp.module_name;
