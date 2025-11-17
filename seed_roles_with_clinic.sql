-- ============================================================================
-- SEED ROLES DATA (Including Clinic Roles)
-- ============================================================================
-- File: seed_roles_with_clinic.sql
-- Description: Seed data untuk roles termasuk clinic roles
--
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================================

-- Insert basic roles from 003_seed_data.sql
-- Using code as the unique identifier to avoid conflicts
INSERT INTO roles (id, name, code, description, is_system_role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Administrator', 'super_admin', 'Full system access with all permissions', true),
  ('00000000-0000-0000-0000-000000000002', 'Administrator', 'admin', 'System administrator with most permissions', true),
  ('00000000-0000-0000-0000-000000000003', 'Manager', 'manager', 'Manager with view-only access to most modules', true),
  ('00000000-0000-0000-0000-000000000004', 'Karyawan', 'karyawan', 'Employee with limited access', true)
ON CONFLICT (code) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system_role = EXCLUDED.is_system_role;

-- Insert clinic roles
INSERT INTO roles (id, name, code, description, is_system_role) VALUES
  ('00000000-0000-0000-0000-000000000005', 'Admin Klinik', 'admin_klinik', 'Administrator klinik dengan full access ke modul klinik', true),
  ('00000000-0000-0000-0000-000000000006', 'Dokter Klinik', 'dokter_klinik', 'Dokter dengan akses ke pemeriksaan dan resep', true),
  ('00000000-0000-0000-0000-000000000007', 'Perawat', 'perawat', 'Perawat dengan akses ke registrasi dan dispensing', true)
ON CONFLICT (code) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system_role = EXCLUDED.is_system_role;

-- Verify roles created
SELECT * FROM roles ORDER BY name;

-- Note: Run migrations 003_seed_data.sql untuk role_permissions jika belum ada
