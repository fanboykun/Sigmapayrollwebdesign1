-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Version: 1.0.0
-- Description: Security policies for role-based access control
-- Author: Sigma Payroll Team
-- Date: 2024-10-30
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to get current user's role code
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT r.code
  FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is super_admin or admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.code IN ('super_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.code = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get current user's employee_id
CREATE OR REPLACE FUNCTION get_user_employee_id()
RETURNS VARCHAR AS $$
  SELECT employee_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check module permission
CREATE OR REPLACE FUNCTION has_permission(module TEXT, action TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN role_permissions rp ON u.role_id = rp.role_id
    WHERE u.id = auth.uid()
    AND rp.module_name = module
    AND (
      (action = 'view' AND rp.can_view = true) OR
      (action = 'create' AND rp.can_create = true) OR
      (action = 'edit' AND rp.can_edit = true) OR
      (action = 'delete' AND rp.can_delete = true)
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpjs_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE natura ENABLE ROW LEVEL SECURITY;
ALTER TABLE premiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE termination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. USERS & ROLES POLICIES
-- ============================================================================

-- Users: Can view their own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id OR is_admin());

-- Users: Can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users: Only super_admin can insert/delete users
CREATE POLICY "Super admin can insert users"
  ON users FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admin can delete users"
  ON users FOR DELETE
  USING (is_super_admin());

-- Roles: All authenticated users can view roles
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Roles: Only super_admin can modify roles
CREATE POLICY "Super admin can manage roles"
  ON roles FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Role permissions: All authenticated users can view
CREATE POLICY "Authenticated users can view permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Role permissions: Only super_admin can modify
CREATE POLICY "Super admin can manage permissions"
  ON role_permissions FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- 2. MASTER DATA POLICIES (Read-mostly)
-- ============================================================================

-- Divisions: All authenticated users can view
CREATE POLICY "Authenticated users can view divisions"
  ON divisions FOR SELECT
  TO authenticated
  USING (true);

-- Divisions: Only admins can modify
CREATE POLICY "Admins can manage divisions"
  ON divisions FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Positions: All authenticated users can view
CREATE POLICY "Authenticated users can view positions"
  ON positions FOR SELECT
  TO authenticated
  USING (true);

-- Positions: Only admins can modify
CREATE POLICY "Admins can manage positions"
  ON positions FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Wage scales: All authenticated users can view
CREATE POLICY "Authenticated users can view wage scales"
  ON wage_scales FOR SELECT
  TO authenticated
  USING (true);

-- Wage scales: Only admins can modify
CREATE POLICY "Admins can manage wage scales"
  ON wage_scales FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Tax brackets: All authenticated users can view
CREATE POLICY "Authenticated users can view tax brackets"
  ON tax_brackets FOR SELECT
  TO authenticated
  USING (true);

-- Tax brackets: Only admins can modify
CREATE POLICY "Admins can manage tax brackets"
  ON tax_brackets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- BPJS rates: All authenticated users can view
CREATE POLICY "Authenticated users can view bpjs rates"
  ON bpjs_rates FOR SELECT
  TO authenticated
  USING (true);

-- BPJS rates: Only admins can modify
CREATE POLICY "Admins can manage bpjs rates"
  ON bpjs_rates FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Natura: All authenticated users can view
CREATE POLICY "Authenticated users can view natura"
  ON natura FOR SELECT
  TO authenticated
  USING (true);

-- Natura: Only admins can modify
CREATE POLICY "Admins can manage natura"
  ON natura FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Premiums: All authenticated users can view
CREATE POLICY "Authenticated users can view premiums"
  ON premiums FOR SELECT
  TO authenticated
  USING (true);

-- Premiums: Only admins can modify
CREATE POLICY "Admins can manage premiums"
  ON premiums FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Working days: All authenticated users can view
CREATE POLICY "Authenticated users can view working days"
  ON working_days FOR SELECT
  TO authenticated
  USING (true);

-- Working days: Only admins can modify
CREATE POLICY "Admins can manage working days"
  ON working_days FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Holidays: All authenticated users can view
CREATE POLICY "Authenticated users can view holidays"
  ON holidays FOR SELECT
  TO authenticated
  USING (true);

-- Holidays: Only admins can modify
CREATE POLICY "Admins can manage holidays"
  ON holidays FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 3. EMPLOYEES POLICIES
-- ============================================================================

-- Employees: View based on role
CREATE POLICY "View employees based on role"
  ON employees FOR SELECT
  USING (
    is_admin() OR -- Admins can see all
    (get_user_role() = 'manager') OR -- Managers can see all
    (employee_id = get_user_employee_id()) -- Employees can only see themselves
  );

-- Employees: Only admins can insert/update
CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Employees: Only super_admin can delete
CREATE POLICY "Super admin can delete employees"
  ON employees FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- 4. EMPLOYEE ASSETS POLICIES
-- ============================================================================

CREATE POLICY "View employee assets based on role"
  ON employee_assets FOR SELECT
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_assets.employee_id
      AND e.employee_id = get_user_employee_id()
    )
  );

CREATE POLICY "Admins can manage employee assets"
  ON employee_assets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 5. EMPLOYEE TRANSFERS POLICIES
-- ============================================================================

CREATE POLICY "View employee transfers based on role"
  ON employee_transfers FOR SELECT
  USING (
    is_admin() OR
    get_user_role() = 'manager' OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_transfers.employee_id
      AND e.employee_id = get_user_employee_id()
    )
  );

CREATE POLICY "Admins can manage employee transfers"
  ON employee_transfers FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 6. RECRUITMENT POLICIES
-- ============================================================================

-- Job postings: Public can view active, admins can view all
CREATE POLICY "View active job postings"
  ON job_postings FOR SELECT
  USING (status = 'open' OR is_admin());

-- Job postings: Only admins can manage
CREATE POLICY "Admins can manage job postings"
  ON job_postings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Applicants: Only admins and managers can view
CREATE POLICY "Admins and managers can view applicants"
  ON applicants FOR SELECT
  USING (is_admin() OR get_user_role() = 'manager');

-- Applicants: Only admins can manage
CREATE POLICY "Admins can manage applicants"
  ON applicants FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 7. TERMINATION POLICIES
-- ============================================================================

CREATE POLICY "View termination requests based on role"
  ON termination_requests FOR SELECT
  USING (
    is_admin() OR
    get_user_role() = 'manager' OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = termination_requests.employee_id
      AND e.employee_id = get_user_employee_id()
    )
  );

CREATE POLICY "Admins can manage termination requests"
  ON termination_requests FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 8. ATTENDANCE POLICIES
-- ============================================================================

CREATE POLICY "View attendance based on role"
  ON attendance_records FOR SELECT
  USING (
    is_admin() OR
    get_user_role() = 'manager' OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = attendance_records.employee_id
      AND e.employee_id = get_user_employee_id()
    )
  );

CREATE POLICY "Admins can manage attendance"
  ON attendance_records FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 9. LEAVE REQUESTS POLICIES
-- ============================================================================

CREATE POLICY "View leave requests based on role"
  ON leave_requests FOR SELECT
  USING (
    is_admin() OR
    get_user_role() = 'manager' OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.employee_id
      AND e.employee_id = get_user_employee_id()
    )
  );

-- Employees can create their own leave requests
CREATE POLICY "Employees can create own leave requests"
  ON leave_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_id
      AND e.employee_id = get_user_employee_id()
    )
  );

-- Only admins and managers can update/delete leave requests
CREATE POLICY "Admins and managers can manage leave requests"
  ON leave_requests FOR UPDATE
  USING (is_admin() OR get_user_role() = 'manager')
  WITH CHECK (is_admin() OR get_user_role() = 'manager');

CREATE POLICY "Admins can delete leave requests"
  ON leave_requests FOR DELETE
  USING (is_admin());

-- ============================================================================
-- 10. PAYROLL POLICIES
-- ============================================================================

-- Payroll periods: Admins and managers can view
CREATE POLICY "Admins and managers can view payroll periods"
  ON payroll_periods FOR SELECT
  USING (is_admin() OR get_user_role() = 'manager');

-- Payroll periods: Only admins can manage
CREATE POLICY "Admins can manage payroll periods"
  ON payroll_periods FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Payroll records: View based on role
CREATE POLICY "View payroll records based on role"
  ON payroll_records FOR SELECT
  USING (
    is_admin() OR
    get_user_role() = 'manager' OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = payroll_records.employee_id
      AND e.employee_id = get_user_employee_id()
    )
  );

-- Payroll records: Only admins can manage
CREATE POLICY "Admins can manage payroll records"
  ON payroll_records FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select on all tables to authenticated users (RLS will control access)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant insert/update/delete based on RLS policies
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
