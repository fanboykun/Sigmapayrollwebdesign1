# Sigma Payroll Database Schema Documentation

**Version:** 1.0.0
**Last Updated:** 2024-10-30
**Author:** Sigma Payroll Team

## Table of Contents

1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Table Definitions](#table-definitions)
4. [Relationships](#relationships)
5. [Security (RLS)](#security-rls)
6. [Migration Guide](#migration-guide)
7. [API Integration](#api-integration)

---

## Overview

This database schema is designed for a comprehensive Payroll ERP System for palm oil plantations in Indonesia. It supports:

- **Multi-division operations** across different estates
- **Role-based access control** (RBAC) with 4 user roles
- **Complete payroll processing** including tax (PPh 21), BPJS, natura (catu beras)
- **Employee lifecycle management** (recruitment to termination)
- **Attendance and leave tracking**
- **Compliance with Indonesian labor laws** and tax regulations

### Key Features

- ✅ Full RBAC implementation with Row Level Security
- ✅ Audit trails with created_at/updated_at timestamps
- ✅ Soft deletes support
- ✅ Referential integrity with foreign keys
- ✅ Performance optimized with strategic indexes
- ✅ Scalable architecture for multi-tenant use

---

## Database Architecture

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION & AUTHORIZATION               │
├─────────────────────────────────────────────────────────────────┤
│  auth.users (Supabase)                                          │
│      ↓                                                           │
│  users ←→ roles ←→ role_permissions                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         MASTER DATA                              │
├─────────────────────────────────────────────────────────────────┤
│  divisions         positions        wage_scales                 │
│  tax_brackets      bpjs_rates       natura                      │
│  premiums          working_days     holidays                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EMPLOYEE MANAGEMENT                         │
├─────────────────────────────────────────────────────────────────┤
│  employees → employee_assets                                    │
│           → employee_transfers                                  │
│  job_postings → applicants                                      │
│  termination_requests                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ATTENDANCE & LEAVE                             │
├─────────────────────────────────────────────────────────────────┤
│  attendance_records                                             │
│  leave_requests                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PAYROLL PROCESSING                           │
├─────────────────────────────────────────────────────────────────┤
│  payroll_periods → payroll_records                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### 1. Authentication & Authorization

#### users
Extends Supabase auth.users with application-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK, references auth.users(id) |
| employee_id | VARCHAR(20) | Link to employees.employee_id |
| email | VARCHAR(255) | User email (unique) |
| full_name | VARCHAR(255) | User's full name |
| role_id | UUID | FK to roles |
| avatar_url | TEXT | Profile picture URL |
| status | VARCHAR(20) | active/inactive/suspended |
| last_login | TIMESTAMPTZ | Last login timestamp |

#### roles
User role definitions (super_admin, admin, manager, karyawan).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(50) | Role display name |
| code | VARCHAR(20) | Role code (unique) |
| description | TEXT | Role description |
| is_system_role | BOOLEAN | Cannot be deleted if true |

#### role_permissions
Module-level permissions for each role.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| role_id | UUID | FK to roles |
| module_name | VARCHAR(100) | Module identifier |
| can_view | BOOLEAN | View permission |
| can_create | BOOLEAN | Create permission |
| can_edit | BOOLEAN | Edit permission |
| can_delete | BOOLEAN | Delete permission |

**Unique constraint:** (role_id, module_name)

---

### 2. Master Data - Organizational Structure

#### divisions
Company divisions/branches (estates, head office).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| code | VARCHAR(20) | Division code (unique) |
| shortname | VARCHAR(10) | Short name (e.g., BB, TG) |
| name | VARCHAR(255) | Full division name |
| is_factory | BOOLEAN | Factory or estate |
| administrative_unit | VARCHAR(100) | Estate/Factory/Office |
| group_name | VARCHAR(100) | Group manager |
| is_active | BOOLEAN | Active status |

#### positions
Job positions/titles in the organization.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| code | VARCHAR(20) | Position code (unique) |
| name | VARCHAR(255) | Position name |
| level | VARCHAR(50) | Entry/Junior/Senior/Manager |
| description | TEXT | Position description |
| is_active | BOOLEAN | Active status |

---

### 3. Master Data - Compensation & Benefits

#### wage_scales
Salary scales linked to positions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| position_id | UUID | FK to positions |
| scale_code | VARCHAR(20) | Scale code (unique) |
| base_salary | NUMERIC(15,2) | Base salary amount |
| min_salary | NUMERIC(15,2) | Minimum salary |
| max_salary | NUMERIC(15,2) | Maximum salary |
| effective_date | DATE | Start date |
| end_date | DATE | End date (nullable) |
| is_active | BOOLEAN | Active status |

#### tax_brackets
Indonesian PPh 21 tax brackets.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| min_income | NUMERIC(15,2) | Minimum income for bracket |
| max_income | NUMERIC(15,2) | Maximum income (NULL = unlimited) |
| rate | NUMERIC(5,2) | Tax rate percentage |
| description | TEXT | Bracket description |
| effective_date | DATE | Start date |
| is_active | BOOLEAN | Active status |

#### bpjs_rates
BPJS (social security) contribution rates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| type | VARCHAR(50) | kesehatan/ketenagakerjaan-jkk/jkm/jp |
| name | VARCHAR(255) | Rate name |
| employee_rate | NUMERIC(5,2) | Employee contribution % |
| employer_rate | NUMERIC(5,2) | Employer contribution % |
| max_salary | NUMERIC(15,2) | Salary cap (nullable) |
| effective_date | DATE | Start date |
| is_active | BOOLEAN | Active status |

#### natura
Natura (catu beras/rice allowance) based on PTKP status.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| ptkp_status | VARCHAR(10) | TK/0, K/1, K/2, K/3, etc. |
| ptkp_label | VARCHAR(255) | PTKP description |
| month | INTEGER | Month (1-12) |
| month_name | VARCHAR(20) | Month name |
| catu_beras_kg | NUMERIC(10,2) | Rice amount in KG |
| price_per_kg | NUMERIC(10,2) | Price per KG |
| total_per_month | NUMERIC(15,2) | Total monthly value |
| status | VARCHAR(20) | active/inactive |

**Unique constraint:** (ptkp_status, month)

#### premiums
Premium/bonus types (attendance, performance, position).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| code | VARCHAR(20) | Premium code (unique) |
| name | VARCHAR(255) | Premium name |
| type | VARCHAR(50) | attendance/performance/position/other |
| amount | NUMERIC(15,2) | Fixed amount (if applicable) |
| percentage | NUMERIC(5,2) | Percentage (if applicable) |
| calculation_base | VARCHAR(50) | base_salary/total_salary/fixed |
| description | TEXT | Premium description |
| is_active | BOOLEAN | Active status |

#### potongan
Deduction types (Potongan) for payroll processing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| code | VARCHAR(3) | Deduction code (3 digits, unique) |
| name | VARCHAR(255) | Deduction name |
| type | VARCHAR(20) | external/perusahaan |
| coa_account_number | VARCHAR(50) | COA account number (nullable) |
| coa_account_name | VARCHAR(255) | COA account name (nullable) |
| description | TEXT | Deduction description (nullable) |
| is_active | BOOLEAN | Active status |

---

### 4. Master Data - Time Management

#### working_days
Working days per division per month.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| division_id | UUID | FK to divisions |
| year | INTEGER | Year |
| month | INTEGER | Month (1-12) |
| working_days | INTEGER | Number of working days |
| holidays | INTEGER | Number of holidays |
| description | TEXT | Description |

**Unique constraint:** (division_id, year, month)

#### holidays
National and company holidays.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | Holiday name |
| date | DATE | Holiday date |
| type | VARCHAR(50) | national/religious/company/regional |
| is_paid | BOOLEAN | Paid holiday or not |
| description | TEXT | Holiday description |

---

### 5. Employee Management

#### employees
Core employee master data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| employee_id | VARCHAR(20) | NIK (unique) |
| full_name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Email (unique) |
| phone | VARCHAR(20) | Phone number |
| birth_date | DATE | Birth date |
| gender | VARCHAR(10) | male/female |
| address | TEXT | Home address |
| division_id | UUID | FK to divisions |
| position_id | UUID | FK to positions |
| department | VARCHAR(100) | Department name |
| employment_type | VARCHAR(20) | permanent/contract/internship |
| join_date | DATE | Join date |
| end_date | DATE | End date (if terminated) |
| status | VARCHAR(20) | active/inactive/on-leave/terminated |
| base_salary | NUMERIC(15,2) | Base salary |
| wage_scale_id | UUID | FK to wage_scales |
| bank_name | VARCHAR(100) | Bank name |
| bank_account | VARCHAR(50) | Bank account number |
| npwp | VARCHAR(20) | Tax ID number |
| ptkp_status | VARCHAR(10) | PTKP status (TK/0, K/1, etc.) |
| emergency_contact_name | VARCHAR(255) | Emergency contact name |
| emergency_contact_phone | VARCHAR(20) | Emergency contact phone |
| emergency_contact_relation | VARCHAR(50) | Relation to employee |

#### employee_assets
Assets assigned to employees (laptop, phone, etc.).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| employee_id | UUID | FK to employees |
| asset_type | VARCHAR(50) | Asset type |
| asset_name | VARCHAR(255) | Asset name |
| asset_code | VARCHAR(50) | Asset code |
| description | TEXT | Description |
| assigned_date | DATE | Assignment date |
| return_date | DATE | Return date (nullable) |
| status | VARCHAR(20) | assigned/returned/damaged/lost |
| notes | TEXT | Additional notes |

#### employee_transfers
Employee transfer/relocation records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| employee_id | UUID | FK to employees |
| from_division_id | UUID | FK to divisions |
| from_position_id | UUID | FK to positions |
| from_department | VARCHAR(100) | Previous department |
| to_division_id | UUID | FK to divisions |
| to_position_id | UUID | FK to positions |
| to_department | VARCHAR(100) | New department |
| transfer_date | DATE | Transfer request date |
| effective_date | DATE | Effective date |
| reason | TEXT | Transfer reason |
| notes | TEXT | Additional notes |
| status | VARCHAR(20) | pending/approved/rejected/completed |
| requested_by | UUID | FK to users |
| approved_by | UUID | FK to users |
| approved_date | TIMESTAMPTZ | Approval timestamp |

---

### 6. Recruitment & Termination

#### job_postings
Job vacancy postings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(255) | Job title |
| division_id | UUID | FK to divisions |
| position_id | UUID | FK to positions |
| department | VARCHAR(100) | Department |
| employment_type | VARCHAR(20) | permanent/contract/internship |
| vacancies | INTEGER | Number of openings |
| description | TEXT | Job description |
| requirements | TEXT | Job requirements |
| salary_range_min | NUMERIC(15,2) | Min salary |
| salary_range_max | NUMERIC(15,2) | Max salary |
| posted_date | DATE | Posted date |
| closing_date | DATE | Application deadline |
| status | VARCHAR(20) | draft/open/closed/filled |
| created_by | UUID | FK to users |

#### applicants
Job applicants/candidates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| job_posting_id | UUID | FK to job_postings |
| full_name | VARCHAR(255) | Applicant name |
| email | VARCHAR(255) | Email |
| phone | VARCHAR(20) | Phone |
| birth_date | DATE | Birth date |
| address | TEXT | Address |
| education | VARCHAR(100) | Education level |
| experience_years | INTEGER | Years of experience |
| resume_url | TEXT | Resume file URL |
| cover_letter | TEXT | Cover letter |
| applied_date | DATE | Application date |
| status | VARCHAR(20) | applied/screening/interview/offered/accepted/rejected |
| notes | TEXT | Recruiter notes |

#### termination_requests
Employee termination requests.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| employee_id | UUID | FK to employees |
| termination_type | VARCHAR(50) | resignation/retirement/contract_end/dismissal/layoff |
| termination_date | DATE | Termination date |
| last_working_day | DATE | Last working day |
| reason | TEXT | Termination reason |
| notes | TEXT | Additional notes |
| status | VARCHAR(20) | pending/approved/rejected/completed |
| requested_by | UUID | FK to users |
| approved_by | UUID | FK to users |
| approved_date | TIMESTAMPTZ | Approval timestamp |

---

### 7. Attendance & Leave Management

#### attendance_records
Daily attendance records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| employee_id | UUID | FK to employees |
| date | DATE | Attendance date |
| check_in | TIMESTAMPTZ | Check-in time |
| check_out | TIMESTAMPTZ | Check-out time |
| status | VARCHAR(20) | present/absent/late/half-day/leave/holiday |
| work_hours | NUMERIC(5,2) | Total work hours |
| overtime_hours | NUMERIC(5,2) | Overtime hours |
| notes | TEXT | Additional notes |

**Unique constraint:** (employee_id, date)

#### leave_requests
Employee leave/vacation requests.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| employee_id | UUID | FK to employees |
| leave_type | VARCHAR(50) | annual/sick/maternity/paternity/unpaid/other |
| start_date | DATE | Leave start date |
| end_date | DATE | Leave end date |
| total_days | INTEGER | Number of days |
| reason | TEXT | Leave reason |
| status | VARCHAR(20) | pending/approved/rejected/cancelled |
| requested_date | DATE | Request date |
| approved_by | UUID | FK to users |
| approved_date | TIMESTAMPTZ | Approval timestamp |
| rejection_reason | TEXT | Rejection reason (if rejected) |

---

### 8. Payroll Management

#### payroll_periods
Payroll processing periods (monthly).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| year | INTEGER | Year |
| month | INTEGER | Month (1-12) |
| period_name | VARCHAR(50) | Period name (e.g., "Januari 2024") |
| start_date | DATE | Period start |
| end_date | DATE | Period end |
| payment_date | DATE | Payment date |
| status | VARCHAR(20) | draft/processing/approved/paid/closed |
| total_employees | INTEGER | Number of employees |
| total_gross_salary | NUMERIC(15,2) | Total gross salary |
| total_deductions | NUMERIC(15,2) | Total deductions |
| total_net_salary | NUMERIC(15,2) | Total net salary |
| notes | TEXT | Period notes |
| created_by | UUID | FK to users |
| approved_by | UUID | FK to users |
| approved_date | TIMESTAMPTZ | Approval timestamp |

**Unique constraint:** (year, month)

#### payroll_records
Individual employee payroll records per period.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| payroll_period_id | UUID | FK to payroll_periods |
| employee_id | UUID | FK to employees |
| base_salary | NUMERIC(15,2) | Base salary |
| **Allowances** | | |
| allowance_transport | NUMERIC(15,2) | Transport allowance |
| allowance_meal | NUMERIC(15,2) | Meal allowance |
| allowance_housing | NUMERIC(15,2) | Housing allowance |
| allowance_position | NUMERIC(15,2) | Position allowance |
| allowance_other | NUMERIC(15,2) | Other allowances |
| **Premiums** | | |
| premium_attendance | NUMERIC(15,2) | Attendance premium |
| premium_performance | NUMERIC(15,2) | Performance premium |
| premium_other | NUMERIC(15,2) | Other premiums |
| **Overtime** | | |
| overtime_hours | NUMERIC(5,2) | Overtime hours |
| overtime_pay | NUMERIC(15,2) | Overtime payment |
| **Natura** | | |
| natura_amount | NUMERIC(15,2) | Natura value |
| **Totals** | | |
| gross_salary | NUMERIC(15,2) | Total gross |
| **Deductions** | | |
| deduction_bpjs_kesehatan | NUMERIC(15,2) | BPJS Health |
| deduction_bpjs_ketenagakerjaan | NUMERIC(15,2) | BPJS Employment |
| deduction_tax | NUMERIC(15,2) | PPh 21 |
| deduction_loan | NUMERIC(15,2) | Loan deduction |
| deduction_other | NUMERIC(15,2) | Other deductions |
| total_deductions | NUMERIC(15,2) | Total deductions |
| **Net** | | |
| net_salary | NUMERIC(15,2) | Take-home pay |
| **Attendance** | | |
| working_days | INTEGER | Working days in period |
| present_days | INTEGER | Days present |
| absent_days | INTEGER | Days absent |
| leave_days | INTEGER | Days on leave |
| **Status** | | |
| status | VARCHAR(20) | draft/approved/paid |
| payment_date | DATE | Payment date |
| payment_method | VARCHAR(50) | Payment method |
| notes | TEXT | Additional notes |

**Unique constraint:** (payroll_period_id, employee_id)

---

## Relationships

### Key Foreign Key Relationships

```
users
  ├─→ roles.id (role_id)
  └─→ employees.employee_id (employee_id)

employees
  ├─→ divisions.id (division_id)
  ├─→ positions.id (position_id)
  └─→ wage_scales.id (wage_scale_id)

employee_transfers
  ├─→ employees.id (employee_id)
  ├─→ divisions.id (from_division_id, to_division_id)
  └─→ positions.id (from_position_id, to_position_id)

attendance_records
  └─→ employees.id (employee_id)

leave_requests
  ├─→ employees.id (employee_id)
  └─→ users.id (approved_by)

payroll_records
  ├─→ payroll_periods.id (payroll_period_id)
  └─→ employees.id (employee_id)
```

---

## Security (RLS)

### Row Level Security Policies

All tables have RLS enabled with policies based on user roles:

#### Super Admin
- **Full access** to all tables (CRUD operations)
- Can manage users, roles, and permissions

#### Admin
- **Full access** to operational tables
- **No access** to user_management and role_management

#### Manager
- **View-only access** to most operational tables
- Can approve/reject leave requests and transfers

#### Karyawan (Employee)
- Can **view own data** only (employee profile, attendance, payroll, leave)
- Can **create** leave requests
- **Cannot** access master data or other employees' data

### Helper Functions

```sql
-- Check if user is admin
is_admin() → BOOLEAN

-- Check if user is super admin
is_super_admin() → BOOLEAN

-- Get user's role code
get_user_role() → TEXT

-- Get user's employee_id
get_user_employee_id() → VARCHAR

-- Check module permission
has_permission(module TEXT, action TEXT) → BOOLEAN
```

---

## Migration Guide

### Running Migrations

1. **Initialize Supabase project:**
   ```bash
   supabase init
   ```

2. **Link to your Supabase project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Apply migrations:**
   ```bash
   supabase db push
   ```

   Or apply individually:
   ```bash
   psql -h your-host -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
   psql -h your-host -U postgres -d postgres -f supabase/migrations/002_rls_policies.sql
   psql -h your-host -U postgres -d postgres -f supabase/migrations/003_seed_data.sql
   ```

### Migration Order

**IMPORTANT:** Run migrations in this exact order:
1. `001_initial_schema.sql` - Creates all tables
2. `002_rls_policies.sql` - Sets up security policies
3. `003_seed_data.sql` - Inserts seed data

---

## API Integration

### Supabase Client Setup

```typescript
// src/utils/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Example Queries

#### Get All Employees
```typescript
const { data: employees, error } = await supabase
  .from('employees')
  .select(`
    *,
    division:divisions(*),
    position:positions(*)
  `)
  .eq('status', 'active')
```

#### Create Leave Request
```typescript
const { data, error } = await supabase
  .from('leave_requests')
  .insert({
    employee_id: 'employee-uuid',
    leave_type: 'annual',
    start_date: '2024-12-01',
    end_date: '2024-12-05',
    total_days: 5,
    reason: 'Family vacation'
  })
```

#### Get Payroll Records with Employee Details
```typescript
const { data, error } = await supabase
  .from('payroll_records')
  .select(`
    *,
    employee:employees(full_name, employee_id),
    period:payroll_periods(period_name, year, month)
  `)
  .eq('payroll_period_id', 'period-uuid')
```

#### Update User Profile
```typescript
const { data, error } = await supabase
  .from('users')
  .update({ full_name: 'New Name', avatar_url: 'url' })
  .eq('id', userId)
```

---

## Best Practices

### Performance Optimization

1. **Use indexes** - All frequently queried columns have indexes
2. **Limit result sets** - Use `.range()` for pagination
3. **Select only needed columns** - Don't use `SELECT *` in production
4. **Use joins wisely** - Supabase supports nested queries

### Data Integrity

1. **Always use transactions** for multi-table operations
2. **Validate data** on the application layer before insert/update
3. **Use constraints** - The schema has proper CHECK constraints
4. **Soft deletes** - Consider adding `deleted_at` for important tables

### Security

1. **Never expose service_role key** on client
2. **Use RLS policies** - All tables have RLS enabled
3. **Validate user input** - Always sanitize and validate
4. **Audit logs** - Consider adding audit trail tables

---

## Next Steps

1. ✅ Schema created
2. ✅ RLS policies configured
3. ✅ Seed data prepared
4. 🔲 Apply migrations to Supabase
5. 🔲 Update API integration in frontend
6. 🔲 Test authentication flow
7. 🔲 Test CRUD operations
8. 🔲 Performance testing
9. 🔲 Security audit

---

## Support

For questions or issues:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the code comments in migration files
- Contact the development team

---

**Document Version:** 1.0.0
**Last Updated:** 2024-10-30
