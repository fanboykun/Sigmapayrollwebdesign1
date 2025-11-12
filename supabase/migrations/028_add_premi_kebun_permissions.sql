-- =====================================================
-- Migration: 028_add_premi_kebun_permissions.sql
-- Description: Add role permissions for Premi Kebun modules
-- Author: Sigma Payroll Team
-- Date: 2025-01-12
-- =====================================================

-- =====================================================
-- INSERT PERMISSIONS FOR PREMI KEBUN MODULES
-- =====================================================

-- Super Admin: Full access to all Premi Kebun modules
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000001',
  module,
  true,
  true,
  true,
  true
FROM (VALUES
  ('premi_master'),
  ('premi_penggajian'),
  ('premi_laporan')
) AS modules(module)
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = '00000000-0000-0000-0000-000000000001'
  AND module_name = modules.module
);

-- Admin: Full access to all Premi Kebun modules
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000002',
  module,
  true,
  true,
  true,
  true
FROM (VALUES
  ('premi_master'),
  ('premi_penggajian'),
  ('premi_laporan')
) AS modules(module)
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = '00000000-0000-0000-0000-000000000002'
  AND module_name = modules.module
);

-- Manager: View-only access to all Premi Kebun modules
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT
  '00000000-0000-0000-0000-000000000003',
  module,
  true,
  false,
  false,
  false
FROM (VALUES
  ('premi_master'),
  ('premi_penggajian'),
  ('premi_laporan')
) AS modules(module)
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = '00000000-0000-0000-0000-000000000003'
  AND module_name = modules.module
);

-- Karyawan: No access to Premi Kebun modules
-- (No insert needed - default is no permission)

-- =====================================================
-- VERIFICATION QUERY (commented out)
-- =====================================================
-- Uncomment to verify permissions after running migration:
/*
SELECT
  r.code as role_code,
  r.name as role_name,
  rp.module_name,
  rp.can_view,
  rp.can_create,
  rp.can_edit,
  rp.can_delete
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE rp.module_name IN ('premi_master', 'premi_penggajian', 'premi_laporan')
ORDER BY r.code, rp.module_name;
*/

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.role_permissions IS 'Role-based access control for all modules including Premi Kebun';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
