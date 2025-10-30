-- ============================================================================
-- SIGMA PAYROLL DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0.0
-- Description: Complete database schema for Sigma Payroll ERP System
-- Author: Sigma Payroll Team
-- Date: 2024-10-30
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. AUTHENTICATION & AUTHORIZATION
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE, -- Link to employees table, nullable for non-employee users
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL, -- Foreign key to roles
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- super_admin, admin, manager, karyawan
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted if true
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions (module-level permissions)
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, module_name)
);

-- ============================================================================
-- 2. MASTER DATA - ORGANIZATIONAL STRUCTURE
-- ============================================================================

-- Divisions table
CREATE TABLE public.divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    shortname VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_factory BOOLEAN DEFAULT FALSE,
    administrative_unit VARCHAR(100),
    group_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions table
CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50), -- Entry, Junior, Senior, Manager, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. MASTER DATA - COMPENSATION & BENEFITS
-- ============================================================================

-- Wage scales table
CREATE TABLE public.wage_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    scale_code VARCHAR(20) UNIQUE NOT NULL,
    base_salary NUMERIC(15, 2) NOT NULL,
    min_salary NUMERIC(15, 2),
    max_salary NUMERIC(15, 2),
    effective_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax brackets table (PPh 21)
CREATE TABLE public.tax_brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_income NUMERIC(15, 2) NOT NULL,
    max_income NUMERIC(15, 2), -- NULL for unlimited
    rate NUMERIC(5, 2) NOT NULL, -- Percentage
    description TEXT,
    effective_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BPJS rates table
CREATE TABLE public.bpjs_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('kesehatan', 'ketenagakerjaan-jkk', 'ketenagakerjaan-jkm', 'ketenagakerjaan-jp')),
    name VARCHAR(255) NOT NULL,
    employee_rate NUMERIC(5, 2) DEFAULT 0, -- Percentage
    employer_rate NUMERIC(5, 2) DEFAULT 0, -- Percentage
    max_salary NUMERIC(15, 2), -- Salary cap, NULL if no cap
    effective_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Natura table (Catu Beras)
CREATE TABLE public.natura (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ptkp_status VARCHAR(10) NOT NULL, -- TK/0, K/1, K/2, K/3, etc.
    ptkp_label VARCHAR(255) NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    month_name VARCHAR(20),
    catu_beras_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    total_per_month NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ptkp_status, month)
);

-- Premiums table
CREATE TABLE public.premiums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('attendance', 'performance', 'position', 'other')),
    amount NUMERIC(15, 2),
    percentage NUMERIC(5, 2), -- If percentage-based
    calculation_base VARCHAR(50), -- 'base_salary', 'total_salary', 'fixed'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. MASTER DATA - TIME MANAGEMENT
-- ============================================================================

-- Working days table
CREATE TABLE public.working_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    working_days INTEGER NOT NULL,
    holidays INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(division_id, year, month)
);

-- Holidays table
CREATE TABLE public.holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('national', 'religious', 'company', 'regional')),
    is_paid BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. EMPLOYEE MANAGEMENT
-- ============================================================================

-- Employees table
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) UNIQUE NOT NULL, -- NIK
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    address TEXT,

    -- Employment details
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    department VARCHAR(100),
    employment_type VARCHAR(20) CHECK (employment_type IN ('permanent', 'contract', 'internship')),
    join_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave', 'terminated')),

    -- Compensation
    base_salary NUMERIC(15, 2) NOT NULL,
    wage_scale_id UUID REFERENCES wage_scales(id) ON DELETE SET NULL,

    -- Banking
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),

    -- Tax & NPWP
    npwp VARCHAR(20),
    ptkp_status VARCHAR(10), -- TK/0, K/1, K/2, K/3, etc.

    -- Emergency contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Employee assets table
CREATE TABLE public.employee_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_code VARCHAR(50),
    description TEXT,
    assigned_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'returned', 'damaged', 'lost')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee transfers table
CREATE TABLE public.employee_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    -- From
    from_division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    from_position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    from_department VARCHAR(100),

    -- To
    to_division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    to_position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    to_department VARCHAR(100),

    -- Transfer details
    transfer_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    reason TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),

    -- Approval
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. RECRUITMENT & TERMINATION
-- ============================================================================

-- Job postings table
CREATE TABLE public.job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    department VARCHAR(100),
    employment_type VARCHAR(20) CHECK (employment_type IN ('permanent', 'contract', 'internship')),
    vacancies INTEGER DEFAULT 1,
    description TEXT,
    requirements TEXT,
    salary_range_min NUMERIC(15, 2),
    salary_range_max NUMERIC(15, 2),
    posted_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Applicants table
CREATE TABLE public.applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    education VARCHAR(100),
    experience_years INTEGER,
    resume_url TEXT,
    cover_letter TEXT,
    applied_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'offered', 'accepted', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Termination requests table
CREATE TABLE public.termination_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    termination_type VARCHAR(50) CHECK (termination_type IN ('resignation', 'retirement', 'contract_end', 'dismissal', 'layoff')),
    termination_date DATE NOT NULL,
    last_working_day DATE NOT NULL,
    reason TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),

    -- Approval
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. ATTENDANCE & LEAVE MANAGEMENT
-- ============================================================================

-- Attendance records table
CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half-day', 'leave', 'holiday')),
    work_hours NUMERIC(5, 2),
    overtime_hours NUMERIC(5, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Leave requests table
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),

    -- Approval
    requested_date DATE DEFAULT CURRENT_DATE,
    approved_by UUID REFERENCES users(id),
    approved_date TIMESTAMPTZ,
    rejection_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. PAYROLL MANAGEMENT
-- ============================================================================

-- Payroll periods table
CREATE TABLE public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    period_name VARCHAR(50) NOT NULL, -- e.g., "Januari 2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid', 'closed')),
    total_employees INTEGER DEFAULT 0,
    total_gross_salary NUMERIC(15, 2) DEFAULT 0,
    total_deductions NUMERIC(15, 2) DEFAULT 0,
    total_net_salary NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_date TIMESTAMPTZ,
    UNIQUE(year, month)
);

-- Payroll records table (one per employee per period)
CREATE TABLE public.payroll_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    -- Basic salary
    base_salary NUMERIC(15, 2) NOT NULL,

    -- Allowances
    allowance_transport NUMERIC(15, 2) DEFAULT 0,
    allowance_meal NUMERIC(15, 2) DEFAULT 0,
    allowance_housing NUMERIC(15, 2) DEFAULT 0,
    allowance_position NUMERIC(15, 2) DEFAULT 0,
    allowance_other NUMERIC(15, 2) DEFAULT 0,

    -- Premiums
    premium_attendance NUMERIC(15, 2) DEFAULT 0,
    premium_performance NUMERIC(15, 2) DEFAULT 0,
    premium_other NUMERIC(15, 2) DEFAULT 0,

    -- Overtime
    overtime_hours NUMERIC(5, 2) DEFAULT 0,
    overtime_pay NUMERIC(15, 2) DEFAULT 0,

    -- Natura
    natura_amount NUMERIC(15, 2) DEFAULT 0,

    -- Gross salary
    gross_salary NUMERIC(15, 2) NOT NULL,

    -- Deductions
    deduction_bpjs_kesehatan NUMERIC(15, 2) DEFAULT 0,
    deduction_bpjs_ketenagakerjaan NUMERIC(15, 2) DEFAULT 0,
    deduction_tax NUMERIC(15, 2) DEFAULT 0,
    deduction_loan NUMERIC(15, 2) DEFAULT 0,
    deduction_other NUMERIC(15, 2) DEFAULT 0,

    -- Total deductions
    total_deductions NUMERIC(15, 2) NOT NULL,

    -- Net salary
    net_salary NUMERIC(15, 2) NOT NULL,

    -- Attendance data
    working_days INTEGER NOT NULL,
    present_days INTEGER DEFAULT 0,
    absent_days INTEGER DEFAULT 0,
    leave_days INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
    payment_date DATE,
    payment_method VARCHAR(50),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(payroll_period_id, employee_id)
);

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- Employees indexes
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_division_id ON employees(division_id);
CREATE INDEX idx_employees_position_id ON employees(position_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_join_date ON employees(join_date);

-- Attendance indexes
CREATE INDEX idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Payroll indexes
CREATE INDEX idx_payroll_periods_year_month ON payroll_periods(year, month);
CREATE INDEX idx_payroll_records_period_id ON payroll_records(payroll_period_id);
CREATE INDEX idx_payroll_records_employee_id ON payroll_records(employee_id);

-- Leave requests indexes
CREATE INDEX idx_leave_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);

-- ============================================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wage_scales_updated_at BEFORE UPDATE ON wage_scales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_brackets_updated_at BEFORE UPDATE ON tax_brackets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bpjs_rates_updated_at BEFORE UPDATE ON bpjs_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_natura_updated_at BEFORE UPDATE ON natura FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_premiums_updated_at BEFORE UPDATE ON premiums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_working_days_updated_at BEFORE UPDATE ON working_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_assets_updated_at BEFORE UPDATE ON employee_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_transfers_updated_at BEFORE UPDATE ON employee_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_termination_requests_updated_at BEFORE UPDATE ON termination_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_periods_updated_at BEFORE UPDATE ON payroll_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON payroll_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
