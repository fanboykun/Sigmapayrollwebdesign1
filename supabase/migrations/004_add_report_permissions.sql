-- ============================================================================
-- ADD PRESENSI AND BPJS REPORT PERMISSIONS
-- ============================================================================
-- Version: 1.0.0
-- Description: Add presensi_report and bpjs_report permissions to all roles
-- Author: Sigma Payroll Team
-- Date: 2025-11-11
-- ============================================================================

-- ============================================================================
-- ADD PERMISSIONS FOR SUPER ADMIN
-- ============================================================================

INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000001', 'presensi_report', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'bpjs_report', true, true, true, true);

-- ============================================================================
-- ADD PERMISSIONS FOR ADMIN
-- ============================================================================

INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000002', 'presensi_report', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'bpjs_report', true, true, true, true);

-- ============================================================================
-- ADD PERMISSIONS FOR MANAGER (VIEW ONLY)
-- ============================================================================

INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000003', 'presensi_report', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'bpjs_report', true, false, false, false);

-- ============================================================================
-- ADD PERMISSIONS FOR KARYAWAN (VIEW ONLY)
-- ============================================================================

INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000004', 'presensi_report', true, false, false, false),
  ('00000000-0000-0000-0000-000000000004', 'bpjs_report', true, false, false, false);
