-- ============================================================================
-- SEED DATA FOR SIGMA PAYROLL SYSTEM
-- ============================================================================
-- Version: 1.0.0
-- Description: Initial seed data for development and testing
-- Author: Sigma Payroll Team
-- Date: 2024-10-30
-- ============================================================================

-- ============================================================================
-- 1. ROLES
-- ============================================================================

INSERT INTO roles (id, name, code, description, is_system_role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Administrator', 'super_admin', 'Full system access with all permissions', true),
  ('00000000-0000-0000-0000-000000000002', 'Administrator', 'admin', 'System administrator with most permissions', true),
  ('00000000-0000-0000-0000-000000000003', 'Manager', 'manager', 'Manager with view-only access to most modules', true),
  ('00000000-0000-0000-0000-000000000004', 'Karyawan', 'karyawan', 'Employee with limited access', true);

-- ============================================================================
-- 2. ROLE PERMISSIONS
-- ============================================================================

-- Super Admin: Full access to everything
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000001', 'dashboard', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'payroll_view', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'tax_worksheet', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'annual_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'employee_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'employee_transfer', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'division_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'position_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'wage_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'tax_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'premium_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'natura_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'working_days_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'holiday_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'attendance_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'leave_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'recruitment', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'termination', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'employee_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'payroll_processing', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'payroll_reports', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'engagement', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'settings', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'user_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'role_management', true, true, true, true);

-- Admin: Full access except user & role management
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000002', 'dashboard', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'payroll_view', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'tax_worksheet', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'annual_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'employee_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'employee_transfer', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'division_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'position_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'wage_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'tax_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'premium_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'natura_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'working_days_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'holiday_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'attendance_master', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'leave_management', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'recruitment', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'termination', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'employee_payroll', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'payroll_processing', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'payroll_reports', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'engagement', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'settings', true, true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'user_management', false, false, false, false),
  ('00000000-0000-0000-0000-000000000002', 'role_management', false, false, false, false);

-- Manager: View-only access
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000003', 'dashboard', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'payroll_view', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'tax_worksheet', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'annual_payroll', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'employee_management', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'employee_transfer', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'division_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'position_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'wage_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'tax_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'premium_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'natura_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'working_days_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'holiday_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'attendance_master', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'leave_management', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'recruitment', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'termination', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'employee_payroll', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'payroll_processing', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'payroll_reports', true, false, false, false),
  ('00000000-0000-0000-0000-000000000003', 'engagement', true, false, false, false);

-- Karyawan: Limited access (dashboard & payroll view only)
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
  ('00000000-0000-0000-0000-000000000004', 'dashboard', true, false, false, false),
  ('00000000-0000-0000-0000-000000000004', 'payroll_view', true, false, false, false);

-- ============================================================================
-- 3. DIVISIONS
-- ============================================================================

INSERT INTO divisions (id, code, shortname, name, is_factory, administrative_unit, group_name, is_active) VALUES
  ('10000000-0000-0000-0000-000000000007', '7', 'BB', 'Bangun Bandar', false, 'Estate', 'Group Manager II', true),
  ('10000000-0000-0000-0000-000000000008', '8', 'TG', 'PT Socfindo Kebun TG', false, 'Estate', 'Group Manager II', true),
  ('10000000-0000-0000-0000-000000000009', '9', 'AP', 'PT Socfindo Kebun AP', false, 'Estate', 'Group Manager III', true),
  ('10000000-0000-0000-0000-000000000010', '10', 'HL', 'PT Socfindo Kebun HL', false, 'Estate', 'Group Manager III', true),
  ('10000000-0000-0000-0000-000000000011', '11', 'NL', 'PT Socfindo Kebun NL', false, 'Estate', 'Group Manager III', true),
  ('10000000-0000-0000-0000-000000000013', '13', 'HO', 'Head Office/Kantor Besar Medan', false, 'Estate', 'Group Manager IV', true);

-- ============================================================================
-- 4. POSITIONS
-- ============================================================================

INSERT INTO positions (code, name, level, description, is_active) VALUES
  ('MDP', 'Mandor Panen', 'Supervisor', 'Pengawas tim panen', true),
  ('PMN', 'Pemanen', 'Entry', 'Karyawan pemanen', true),
  ('OPM', 'Operator Mesin', 'Junior', 'Operator mesin pabrik', true),
  ('MAD', 'Manajer Administrasi', 'Manager', 'Manajer administrasi', true),
  ('SPS', 'Spesialis SDM', 'Senior', 'Spesialis SDM', true),
  ('STF', 'Staff Keuangan', 'Junior', 'Staff keuangan', true),
  ('MKE', 'Marketing Executive', 'Junior', 'Marketing executive', true),
  ('TKM', 'Teknisi Mesin', 'Junior', 'Teknisi mesin', true),
  ('MKU', 'Manajer Keuangan', 'Manager', 'Manajer keuangan', true),
  ('ITM', 'IT Manager', 'Manager', 'IT Manager', true);

-- ============================================================================
-- 5. TAX BRACKETS (PPh 21 Indonesia 2024)
-- ============================================================================

INSERT INTO tax_brackets (min_income, max_income, rate, description, is_active) VALUES
  (0, 60000000, 5, 'Penghasilan sampai dengan Rp 60.000.000', true),
  (60000000, 250000000, 15, 'Penghasilan di atas Rp 60.000.000 sampai dengan Rp 250.000.000', true),
  (250000000, 500000000, 25, 'Penghasilan di atas Rp 250.000.000 sampai dengan Rp 500.000.000', true),
  (500000000, 5000000000, 30, 'Penghasilan di atas Rp 500.000.000 sampai dengan Rp 5.000.000.000', true),
  (5000000000, NULL, 35, 'Penghasilan di atas Rp 5.000.000.000', true);

-- ============================================================================
-- 6. BPJS RATES (Indonesia 2024)
-- ============================================================================

INSERT INTO bpjs_rates (type, name, employee_rate, employer_rate, max_salary, is_active) VALUES
  ('kesehatan', 'BPJS Kesehatan', 1.0, 4.0, 12000000, true),
  ('ketenagakerjaan-jkk', 'BPJS Ketenagakerjaan - JKK (Jaminan Kecelakaan Kerja)', 0, 0.24, NULL, true),
  ('ketenagakerjaan-jkm', 'BPJS Ketenagakerjaan - JKM (Jaminan Kematian)', 0, 0.3, NULL, true),
  ('ketenagakerjaan-jp', 'BPJS Ketenagakerjaan - JP (Jaminan Pensiun)', 1.0, 2.0, 9559600, true);

-- ============================================================================
-- 7. NATURA (Catu Beras) - Sample for 1 month
-- ============================================================================

-- Generate natura for Januari (month 1) for all PTKP statuses
INSERT INTO natura (ptkp_status, ptkp_label, month, month_name, catu_beras_kg, price_per_kg, total_per_month, status, description) VALUES
  ('TK/0', 'Tidak Kawin - 0 Tanggungan', 1, 'Januari', 10, 12000, 120000, 'active', 'Natura catu beras untuk Tidak Kawin - 0 Tanggungan - Januari'),
  ('TK/1', 'Tidak Kawin - 1 Tanggungan', 1, 'Januari', 16, 12000, 192000, 'active', 'Natura catu beras untuk Tidak Kawin - 1 Tanggungan - Januari'),
  ('TK/2', 'Tidak Kawin - 2 Tanggungan', 1, 'Januari', 20, 12000, 240000, 'active', 'Natura catu beras untuk Tidak Kawin - 2 Tanggungan - Januari'),
  ('TK/3', 'Tidak Kawin - 3 Tanggungan', 1, 'Januari', 24, 12000, 288000, 'active', 'Natura catu beras untuk Tidak Kawin - 3 Tanggungan - Januari'),
  ('K/0', 'Kawin - 0 Tanggungan', 1, 'Januari', 20, 12000, 240000, 'active', 'Natura catu beras untuk Kawin - 0 Tanggungan - Januari'),
  ('K/1', 'Kawin - 1 Tanggungan', 1, 'Januari', 24, 12000, 288000, 'active', 'Natura catu beras untuk Kawin - 1 Tanggungan - Januari'),
  ('K/2', 'Kawin - 2 Tanggungan', 1, 'Januari', 28, 12000, 336000, 'active', 'Natura catu beras untuk Kawin - 2 Tanggungan - Januari'),
  ('K/3', 'Kawin - 3 Tanggungan', 1, 'Januari', 32, 12000, 384000, 'active', 'Natura catu beras untuk Kawin - 3 Tanggungan - Januari');

-- Note: You would typically generate all 12 months programmatically or with a script
-- For brevity, only January is shown here

-- ============================================================================
-- 8. PREMIUMS
-- ============================================================================

INSERT INTO premiums (code, name, type, amount, percentage, calculation_base, description, is_active) VALUES
  ('ATT', 'Premi Kehadiran', 'attendance', NULL, 10, 'base_salary', 'Premi kehadiran 100%', true),
  ('PER', 'Premi Kinerja', 'performance', NULL, 15, 'base_salary', 'Premi berdasarkan kinerja', true),
  ('POS', 'Tunjangan Jabatan', 'position', 1000000, NULL, 'fixed', 'Tunjangan jabatan fixed', true);

-- ============================================================================
-- 9. HOLIDAYS (Sample 2024)
-- ============================================================================

INSERT INTO holidays (name, date, type, is_paid, description) VALUES
  ('Tahun Baru 2024', '2024-01-01', 'national', true, 'Tahun Baru Masehi'),
  ('Isra Miraj', '2024-02-08', 'religious', true, 'Isra Miraj Nabi Muhammad SAW'),
  ('Imlek', '2024-02-10', 'national', true, 'Tahun Baru Imlek'),
  ('Nyepi', '2024-03-11', 'national', true, 'Hari Raya Nyepi'),
  ('Wafat Isa Almasih', '2024-03-29', 'religious', true, 'Wafat Isa Almasih'),
  ('Idul Fitri', '2024-04-10', 'religious', true, 'Hari Raya Idul Fitri 1'),
  ('Idul Fitri', '2024-04-11', 'religious', true, 'Hari Raya Idul Fitri 2'),
  ('Hari Buruh', '2024-05-01', 'national', true, 'Hari Buruh Internasional'),
  ('Kenaikan Isa Almasih', '2024-05-09', 'religious', true, 'Kenaikan Isa Almasih'),
  ('Waisak', '2024-05-23', 'religious', true, 'Hari Raya Waisak'),
  ('Pancasila', '2024-06-01', 'national', true, 'Hari Lahir Pancasila'),
  ('Idul Adha', '2024-06-17', 'religious', true, 'Hari Raya Idul Adha'),
  ('Tahun Baru Islam', '2024-07-07', 'religious', true, 'Tahun Baru Islam 1446 H'),
  ('Kemerdekaan RI', '2024-08-17', 'national', true, 'Hari Kemerdekaan RI'),
  ('Maulid Nabi', '2024-09-16', 'religious', true, 'Maulid Nabi Muhammad SAW'),
  ('Natal', '2024-12-25', 'religious', true, 'Hari Raya Natal');

-- ============================================================================
-- 10. WORKING DAYS (Sample for 2024)
-- ============================================================================

-- Insert working days for each division for January-December 2024
DO $$
DECLARE
  division_record RECORD;
  month_num INTEGER;
  working_days_count INTEGER[] := ARRAY[22, 21, 21, 22, 21, 20, 23, 22, 21, 23, 21, 22]; -- Approximate working days per month
BEGIN
  FOR division_record IN SELECT id FROM divisions LOOP
    FOR month_num IN 1..12 LOOP
      INSERT INTO working_days (division_id, year, month, working_days, description)
      VALUES (
        division_record.id,
        2024,
        month_num,
        working_days_count[month_num],
        'Working days for ' || TO_CHAR(TO_DATE(month_num::TEXT, 'MM'), 'Month') || ' 2024'
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- NOTE: EMPLOYEE DATA
-- ============================================================================
-- Employee data is not seeded here because it needs to be linked with
-- auth.users which is created through Supabase Auth signup.
-- You should create employees through the application UI or through
-- a separate seeding script after users are created in auth.users.

-- For development, you can manually insert employees after creating
-- corresponding auth users, or use the DatabaseSeeder component in the UI.

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
