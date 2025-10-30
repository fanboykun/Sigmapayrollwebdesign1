# Sigma Payroll System - Visual Documentation

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIGMA PAYROLL SYSTEM                               │
│                    ERP Payroll untuk Perkebunan Sawit                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   React 18 +     │  │   Tailwind CSS   │  │   shadcn/ui      │          │
│  │   TypeScript     │  │   (Styling)      │  │   (50+ Comps)    │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Vite           │  │   React Hook     │  │   Recharts       │          │
│  │   (Build Tool)   │  │   Form           │  │   (Charts)       │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │                      React Context API                          │         │
│  ├────────────────────────────────────────────────────────────────┤         │
│  │  • AuthContext (User, Role, Permissions)                       │         │
│  │  • Session Management (localStorage)                            │         │
│  │  • RBAC Logic (hasPermission, canAccessMenu)                   │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API / DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │                    Supabase Client                              │         │
│  ├────────────────────────────────────────────────────────────────┤         │
│  │  • Authentication (Auth API)                                    │         │
│  │  • Database Queries (PostgreSQL)                                │         │
│  │  • Real-time Subscriptions                                      │         │
│  │  • Row Level Security (RLS)                                     │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND / DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │                    Supabase Backend                             │         │
│  ├────────────────────────────────────────────────────────────────┤         │
│  │                                                                 │         │
│  │  ┌──────────────────────────────────────────────────────┐     │         │
│  │  │         PostgreSQL Database (21 Tables)              │     │         │
│  │  ├──────────────────────────────────────────────────────┤     │         │
│  │  │  • Authentication & Authorization (3 tables)         │     │         │
│  │  │  • Master Data (9 tables)                            │     │         │
│  │  │  • Employee Management (4 tables)                    │     │         │
│  │  │  • Recruitment & Termination (3 tables)              │     │         │
│  │  │  • Attendance & Leave (2 tables)                     │     │         │
│  │  │  • Payroll Processing (2 tables)                     │     │         │
│  │  └──────────────────────────────────────────────────────┘     │         │
│  │                                                                 │         │
│  │  ┌──────────────────────────────────────────────────────┐     │         │
│  │  │         Row Level Security (RLS Policies)            │     │         │
│  │  ├──────────────────────────────────────────────────────┤     │         │
│  │  │  • Super Admin: Full Access                          │     │         │
│  │  │  • Admin: Operational Access                         │     │         │
│  │  │  • Manager: View-Only Access                         │     │         │
│  │  │  • Karyawan: Own Data Only                           │     │         │
│  │  └──────────────────────────────────────────────────────┘     │         │
│  │                                                                 │         │
│  │  ┌──────────────────────────────────────────────────────┐     │         │
│  │  │         Supabase Auth (Built-in)                     │     │         │
│  │  ├──────────────────────────────────────────────────────┤     │         │
│  │  │  • Email/Password Authentication                     │     │         │
│  │  │  • JWT Tokens                                        │     │         │
│  │  │  • Session Management                                │     │         │
│  │  └──────────────────────────────────────────────────────┘     │         │
│  │                                                                 │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Application Module Structure

```
                    ┌─────────────────────────┐
                    │   SIGMA PAYROLL APP     │
                    └───────────┬─────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌───────────────────┐           ┌───────────────────┐
    │   AUTHENTICATION   │           │   AUTHORIZATION   │
    │                    │           │                    │
    │  • Login Page      │           │  • RBAC System    │
    │  • Session Mgmt    │           │  • Permission     │
    │  • User Profile    │           │    Guards         │
    └───────────────────┘           └───────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────────────┐
    │              MAIN APPLICATION                      │
    │  (Sidebar + Navbar + Content Area)                │
    └───────────────┬───────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┬───────────┐
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
    ┌─────┐   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │DASH │   │ PAYROLL │ │   HRM   │ │ATTEND.  │ │ MASTER  │
    │BOARD│   │ SYSTEM  │ │ SYSTEM  │ │  & HR   │ │  DATA   │
    └──┬──┘   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
       │           │           │           │           │
       │           │           │           │           │
       ▼           ▼           ▼           ▼           ▼

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Payroll  │  │ Payroll  │  │ Employee │  │Attendance│  │ Division │
│Dashboard │  │   View   │  │Management│  │  Master  │  │  Master  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ KPI      │  │   Tax    │  │ Employee │  │  Leave   │  │ Position │
│ Metrics  │  │Worksheet │  │ Transfer │  │Management│  │  Master  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Engagement│  │  Annual  │  │Recruitment│ │ Holiday  │  │   Wage   │
│Dashboard │  │ Payroll  │  │          │  │  Master  │  │  Master  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
              ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ Employee │  │Termination│ │ Working  │  │   Tax    │
              │ Payroll  │  │          │  │   Days   │  │  Master  │
              └──────────┘  └──────────┘  └──────────┘  └──────────┘
              ┌──────────┐                              ┌──────────┐
              │ Payroll  │                              │  Natura  │
              │Processing│                              │  Master  │
              └──────────┘                              └──────────┘
              ┌──────────┐                              ┌──────────┐
              │ Payroll  │                              │ Premium  │
              │ Reports  │                              │  Master  │
              └──────────┘                              └──────────┘

                            ┌──────────────────┐
                            │  SETTINGS MENU   │
                            ├──────────────────┤
                            │ • User Mgmt      │
                            │ • Role Mgmt      │
                            │ • Profile        │
                            │ • Account        │
                            └──────────────────┘
```

---

## 3. Database Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION & AUTHORIZATION                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐         ┌──────────────────┐
    │   auth.users     │         │      roles       │
    │  (Supabase)      │         ├──────────────────┤
    └────────┬─────────┘         │ id (PK)          │
             │                   │ name             │
             │ 1                 │ code             │
             │                   │ description      │
             │                   │ is_system_role   │
             │                   └────────┬─────────┘
             │                            │ 1
             │ 1                          │
             └────────────┐               │
                          │               │ *
    ┌─────────────────────▼──────┐   ┌───▼────────────────┐
    │       users                │   │  role_permissions  │
    ├────────────────────────────┤   ├────────────────────┤
    │ id (PK, FK)                │   │ id (PK)            │
    │ employee_id (FK)           │   │ role_id (FK)       │
    │ email                      │   │ module_name        │
    │ full_name                  │   │ can_view           │
    │ role_id (FK)               │   │ can_create         │
    │ avatar_url                 │   │ can_edit           │
    │ status                     │   │ can_delete         │
    │ last_login                 │   └────────────────────┘
    └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         MASTER DATA - ORGANIZATIONAL                         │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
    │   divisions      │         │   positions      │         │   wage_scales    │
    ├──────────────────┤         ├──────────────────┤         ├──────────────────┤
    │ id (PK)          │         │ id (PK)          │    ┌────│ id (PK)          │
    │ code             │         │ code             │    │    │ position_id (FK) │
    │ shortname        │         │ name             │    │    │ scale_code       │
    │ name             │         │ level            │    │    │ base_salary      │
    │ is_factory       │         │ description      │────┘    │ min_salary       │
    │ admin_unit       │         │ is_active        │         │ max_salary       │
    │ group_name       │         └──────────────────┘         │ effective_date   │
    │ is_active        │                                      │ is_active        │
    └──────────────────┘                                      └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                  MASTER DATA - COMPENSATION & BENEFITS                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │  tax_brackets    │  │   bpjs_rates     │  │     natura       │
    ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
    │ id (PK)          │  │ id (PK)          │  │ id (PK)          │
    │ min_income       │  │ type             │  │ ptkp_status      │
    │ max_income       │  │ name             │  │ ptkp_label       │
    │ rate             │  │ employee_rate    │  │ month            │
    │ description      │  │ employer_rate    │  │ month_name       │
    │ effective_date   │  │ max_salary       │  │ catu_beras_kg    │
    │ is_active        │  │ is_active        │  │ price_per_kg     │
    └──────────────────┘  └──────────────────┘  │ total_per_month  │
                                                 │ status           │
    ┌──────────────────┐  ┌──────────────────┐  └──────────────────┘
    │    premiums      │  │  working_days    │
    ├──────────────────┤  ├──────────────────┤  ┌──────────────────┐
    │ id (PK)          │  │ id (PK)          │  │    holidays      │
    │ code             │  │ division_id (FK) │  ├──────────────────┤
    │ name             │  │ year             │  │ id (PK)          │
    │ type             │  │ month            │  │ name             │
    │ amount           │  │ working_days     │  │ date             │
    │ percentage       │  │ holidays         │  │ type             │
    │ calculation_base │  │ description      │  │ is_paid          │
    │ is_active        │  └──────────────────┘  │ description      │
    └──────────────────┘                        └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          EMPLOYEE MANAGEMENT                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────────────┐
                        │       employees          │
                        ├──────────────────────────┤
                        │ id (PK)                  │
                        │ employee_id              │◄────────┐
                        │ full_name                │         │
                        │ email                    │         │
                        │ phone                    │         │
                        │ birth_date               │         │
                        │ gender                   │         │
                        │ address                  │         │
                        │ division_id (FK)         │─┐       │
                        │ position_id (FK)         │─┐       │
                        │ department               │ │       │
                        │ employment_type          │ │       │
                        │ join_date                │ │       │
                        │ status                   │ │       │
                        │ base_salary              │ │       │
                        │ bank_name                │ │       │
                        │ npwp                     │ │       │
                        │ ptkp_status              │ │       │
                        └────────┬─────────────────┘ │       │
                                 │                   │       │
                     ┌───────────┼─────────┐         │       │
                     │           │         │         │       │
                     │ 1         │ 1       │ 1       │       │
                     │           │         │         │       │
                     ▼ *         ▼ *       ▼ *       │       │
        ┌──────────────────┐ ┌────────────────┐ ┌───▼──────────────┐
        │ employee_assets  │ │ employee_      │ │  termination_    │
        ├──────────────────┤ │ transfers      │ │  requests        │
        │ id (PK)          │ ├────────────────┤ ├──────────────────┤
        │ employee_id (FK) │ │ id (PK)        │ │ id (PK)          │
        │ asset_type       │ │ employee_id(FK)│ │ employee_id (FK) │
        │ asset_name       │ │ from_div_id(FK)│ │ termination_type │
        │ asset_code       │ │ from_pos_id(FK)│ │ termination_date │
        │ assigned_date    │ │ to_div_id (FK) │ │ last_working_day │
        │ return_date      │ │ to_pos_id (FK) │ │ reason           │
        │ status           │ │ transfer_date  │ │ status           │
        └──────────────────┘ │ effective_date │ └──────────────────┘
                             │ reason         │
                             │ status         │
                             └────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        RECRUITMENT MANAGEMENT                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐         ┌──────────────────┐
    │  job_postings    │    1    │   applicants     │
    ├──────────────────┤    ─    ├──────────────────┤
    │ id (PK)          │    *    │ id (PK)          │
    │ title            │◄────────│ job_posting_id   │
    │ division_id (FK) │         │ full_name        │
    │ position_id (FK) │         │ email            │
    │ department       │         │ phone            │
    │ employment_type  │         │ birth_date       │
    │ vacancies        │         │ education        │
    │ description      │         │ experience_years │
    │ requirements     │         │ resume_url       │
    │ salary_range_min │         │ applied_date     │
    │ salary_range_max │         │ status           │
    │ posted_date      │         └──────────────────┘
    │ closing_date     │
    │ status           │
    └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE & LEAVE MANAGEMENT                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐         ┌──────────────────┐
    │ attendance_      │         │  leave_requests  │
    │ records          │         ├──────────────────┤
    ├──────────────────┤         │ id (PK)          │
    │ id (PK)          │         │ employee_id (FK) │
    │ employee_id (FK) │         │ leave_type       │
    │ date             │         │ start_date       │
    │ check_in         │         │ end_date         │
    │ check_out        │         │ total_days       │
    │ status           │         │ reason           │
    │ work_hours       │         │ status           │
    │ overtime_hours   │         │ approved_by (FK) │
    │ notes            │         │ approved_date    │
    └──────────────────┘         └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PAYROLL PROCESSING                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐         ┌──────────────────────┐
    │  payroll_periods     │    1    │  payroll_records     │
    ├──────────────────────┤    ─    ├──────────────────────┤
    │ id (PK)              │    *    │ id (PK)              │
    │ year                 │◄────────│ payroll_period_id(FK)│
    │ month                │         │ employee_id (FK)     │
    │ period_name          │         │ base_salary          │
    │ start_date           │         │ allowance_*          │
    │ end_date             │         │ premium_*            │
    │ payment_date         │         │ overtime_*           │
    │ status               │         │ natura_amount        │
    │ total_employees      │         │ gross_salary         │
    │ total_gross_salary   │         │ deduction_*          │
    │ total_deductions     │         │ total_deductions     │
    │ total_net_salary     │         │ net_salary           │
    │ approved_by (FK)     │         │ working_days         │
    └──────────────────────┘         │ present_days         │
                                     │ status               │
                                     └──────────────────────┘

Legend:
─────
PK  = Primary Key
FK  = Foreign Key
1   = One
*   = Many
──  = Relationship Line
```

---

## 4. User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER AUTHENTICATION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌───────────┐
│User Opens │
│   App     │
└─────┬─────┘
      │
      ▼
   ┌──────────────┐      Yes    ┌──────────────┐
   │ Has Session? │─────────────►│Restore User  │
   │(localStorage)│              │   Session    │
   └──────┬───────┘              └──────┬───────┘
          │ No                          │
          │                             ▼
          │                      ┌──────────────┐
          │                      │Validate Token│
          │                      └──────┬───────┘
          │                             │
          │                    ┌────────┴────────┐
          │                    │                 │
          │                  Valid            Invalid
          │                    │                 │
          ▼                    ▼                 ▼
    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐
    │  Show Login  │    │   Load Main  │  │  Clear       │
    │    Page      │    │     App      │  │  Session     │
    └──────┬───────┘    └──────┬───────┘  └──────┬───────┘
           │                   │                  │
           ▼                   │                  │
    ┌──────────────┐           │                  │
    │ User Enters  │           │                  │
    │Email/Password│           │                  └──────────┐
    └──────┬───────┘           │                             │
           │                   │                             │
           ▼                   │                             ▼
    ┌──────────────┐           │                      ┌──────────────┐
    │   Supabase   │           │                      │  Show Login  │
    │ Auth SignIn  │           │                      │    Page      │
    └──────┬───────┘           │                      └──────────────┘
           │                   │
    ┌──────┴───────┐           │
    │              │           │
  Valid         Invalid        │
    │              │           │
    ▼              ▼           │
┌────────┐   ┌────────┐       │
│Get User│   │ Show   │       │
│ Data   │   │ Error  │       │
└───┬────┘   └────────┘       │
    │                         │
    ▼                         │
┌────────┐                    │
│Get Role│                    │
│  &     │                    │
│Perms   │                    │
└───┬────┘                    │
    │                         │
    ▼                         │
┌────────┐                    │
│  Save  │                    │
│Session │                    │
└───┬────┘                    │
    │                         │
    └─────────────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  Load Main   │
                       │  Application │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Apply      │
                       │  RBAC Rules  │
                       └──────┬───────┘
                              │
                              ▼
                         DASHBOARD


┌─────────────────────────────────────────────────────────────────────────────┐
│                           PAYROLL PROCESSING FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

    START (Admin)
      │
      ▼
┌──────────────┐
│Create Payroll│
│   Period     │
│(Month/Year)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Get Active   │
│  Employees   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  For Each Employee:                  │
│  ┌────────────────────────────────┐  │
│  │ 1. Get Base Salary             │  │
│  │ 2. Get Attendance Data         │  │
│  │ 3. Calculate Allowances        │  │
│  │ 4. Calculate Premiums          │  │
│  │ 5. Calculate Overtime          │  │
│  │ 6. Add Natura                  │  │
│  │ 7. Calculate Gross Salary      │  │
│  │ 8. Calculate BPJS Deductions   │  │
│  │ 9. Calculate Tax (PPh 21)      │  │
│  │10. Calculate Other Deductions  │  │
│  │11. Calculate Net Salary        │  │
│  │12. Create Payroll Record       │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
       ┌──────────────┐
       │   Review     │
       │   Payroll    │
       │   Records    │
       └──────┬───────┘
              │
       ┌──────┴──────┐
       │             │
    Approve      Reject
       │             │
       ▼             ▼
┌──────────────┐ ┌─────────┐
│Mark Period as│ │ Edit &  │
│  Approved    │ │Recalculate│
└──────┬───────┘ └────┬────┘
       │              │
       │              └──────┐
       ▼                     │
┌──────────────┐             │
│Process Payment│            │
└──────┬───────┘             │
       │                     │
       ▼                     │
┌──────────────┐             │
│Update Payment│             │
│    Status    │             │
└──────┬───────┘             │
       │                     │
       ▼                     │
┌──────────────┐             │
│ Mark Period  │             │
│  as Paid     │             │
└──────┬───────┘             │
       │                     │
       ▼                     │
┌──────────────┐             │
│Generate Slip │             │
│   Reports    │◄────────────┘
└──────┬───────┘
       │
       ▼
     END


┌─────────────────────────────────────────────────────────────────────────────┐
│                        EMPLOYEE SELF-SERVICE FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

Employee Login
      │
      ▼
┌──────────────┐
│  Dashboard   │
│  (Employee)  │
└──────┬───────┘
       │
   ┌───┴────────────┬────────────┬──────────────┐
   │                │            │              │
   ▼                ▼            ▼              ▼
┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐
│View Own │  │View Own  │  │ Request │  │View Own  │
│Payroll  │  │Attendance│  │  Leave  │  │ Profile  │
└─────────┘  └──────────┘  └────┬────┘  └──────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │Fill Leave    │
                          │Request Form  │
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │   Submit     │
                          │   Request    │
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │ Wait for     │
                          │ Approval     │
                          └──────┬───────┘
                                 │
                         ┌───────┴────────┐
                         │                │
                     Approved          Rejected
                         │                │
                         ▼                ▼
                  ┌──────────┐      ┌─────────┐
                  │Leave     │      │ Notify  │
                  │Granted   │      │Employee │
                  └──────────┘      └─────────┘
```

---

## 5. Role-Based Access Control (RBAC) Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RBAC PERMISSION MATRIX                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Module                    │ Super Admin │  Admin  │ Manager │ Karyawan │
─────────────────────────┼─────────────┼─────────┼─────────┼──────────┤
Dashboard                │ V C E D     │ V C E D │ V       │ V        │
Payroll View             │ V C E D     │ V C E D │ V       │ V (own)  │
Tax Worksheet            │ V C E D     │ V C E D │ V       │ ─        │
Annual Payroll           │ V C E D     │ V C E D │ V       │ ─        │
Employee Management      │ V C E D     │ V C E D │ V       │ ─        │
Employee Transfer        │ V C E D     │ V C E D │ V       │ ─        │
Division Master          │ V C E D     │ V C E D │ V       │ ─        │
Position Master          │ V C E D     │ V C E D │ V       │ ─        │
Wage Master              │ V C E D     │ V C E D │ V       │ ─        │
Tax Master               │ V C E D     │ V C E D │ V       │ ─        │
Premium Master           │ V C E D     │ V C E D │ V       │ ─        │
Natura Master            │ V C E D     │ V C E D │ V       │ ─        │
Working Days Master      │ V C E D     │ V C E D │ V       │ ─        │
Holiday Master           │ V C E D     │ V C E D │ V       │ ─        │
Attendance Master        │ V C E D     │ V C E D │ V       │ ─        │
Leave Management         │ V C E D     │ V C E D │ V       │ V (own)  │
Recruitment              │ V C E D     │ V C E D │ V       │ ─        │
Termination              │ V C E D     │ V C E D │ V       │ ─        │
Employee Payroll         │ V C E D     │ V C E D │ V       │ ─        │
Payroll Processing       │ V C E D     │ V C E D │ V       │ ─        │
Payroll Reports          │ V C E D     │ V C E D │ V       │ ─        │
Engagement Dashboard     │ V C E D     │ V C E D │ V       │ ─        │
Settings                 │ V C E D     │ V C E D │ ─       │ ─        │
User Management          │ V C E D     │ ─       │ ─       │ ─        │
Role Management          │ V C E D     │ ─       │ ─       │ ─        │
─────────────────────────┴─────────────┴─────────┴─────────┴──────────┘

Legend:
V = View      C = Create      E = Edit      D = Delete      ─ = No Access
```

---

## 6. Component Hierarchy

```
App
│
├─ AuthProvider (Context)
│
└─ MainApp
   │
   ├─ Sidebar (Navigation)
   │  ├─ Logo
   │  ├─ Navigation Menu
   │  │  ├─ Dashboard
   │  │  ├─ Payroll Menu
   │  │  │  ├─ Payroll View
   │  │  │  ├─ Tax Worksheet
   │  │  │  ├─ Annual Payroll
   │  │  │  ├─ Employee Payroll
   │  │  │  ├─ Payroll Processing
   │  │  │  └─ Payroll Reports
   │  │  ├─ HRM Menu
   │  │  │  ├─ Employee Management
   │  │  │  ├─ Employee Transfer
   │  │  │  ├─ Recruitment
   │  │  │  └─ Termination
   │  │  ├─ Attendance Menu
   │  │  │  ├─ Attendance Master
   │  │  │  └─ Leave Management
   │  │  ├─ Master Data Menu
   │  │  │  ├─ Division Master
   │  │  │  ├─ Position Master
   │  │  │  ├─ Wage Master
   │  │  │  ├─ Tax Master
   │  │  │  ├─ Premium Master
   │  │  │  ├─ Natura Master
   │  │  │  ├─ Working Days
   │  │  │  └─ Holidays
   │  │  ├─ Engagement Dashboard
   │  │  └─ Settings Menu
   │  │     ├─ User Management
   │  │     ├─ Role Management
   │  │     └─ Settings
   │  └─ User Profile Section
   │
   ├─ Navbar (Top Bar)
   │  ├─ Menu Toggle (Mobile)
   │  ├─ Command Palette (Ctrl+K)
   │  ├─ Search Bar
   │  ├─ Notifications
   │  └─ User Menu
   │     ├─ Profile
   │     ├─ Account Settings
   │     └─ Logout
   │
   └─ Content Area
      └─ [Dynamic Component based on activeView]
         │
         ├─ PayrollDashboard
         │  ├─ KPI Cards
         │  ├─ Charts (Recharts)
         │  ├─ Recent Activities
         │  └─ Quick Actions
         │
         ├─ PayrollView
         │  ├─ Filters
         │  ├─ Data Table
         │  ├─ Export Actions
         │  └─ Detail Modal
         │
         ├─ EmployeeManagement
         │  ├─ Search & Filters
         │  ├─ Employee Table
         │  ├─ Add/Edit Form
         │  └─ Employee Details
         │
         ├─ [Other Components...]
         │
         └─ PermissionGuard (Wrapper)
            └─ Component Content
```

---

## 7. File Structure

```
Sigmapayrollwebdesign/
│
├── public/
│   └── assets/
│
├── src/
│   │
│   ├── components/              # 40+ React Components
│   │   ├── ui/                  # shadcn/ui components (50+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ... (46 more)
│   │   │
│   │   ├── figma/               # Figma exports
│   │   │   └── ImageWithFallback.tsx
│   │   │
│   │   ├── Navbar.tsx           # Top navigation
│   │   ├── Sidebar.tsx          # Side navigation
│   │   ├── LoginPage.tsx        # Login page
│   │   ├── PermissionGuard.tsx  # RBAC guard
│   │   │
│   │   ├── PayrollDashboard.tsx
│   │   ├── PayrollView.tsx
│   │   ├── TaxWorksheet.tsx
│   │   ├── AnnualPayroll.tsx
│   │   │
│   │   ├── EmployeeManagement.tsx
│   │   ├── EmployeePayroll.tsx
│   │   ├── EmployeeTransfer.tsx
│   │   ├── EmployeeTransferForm.tsx
│   │   │
│   │   ├── DivisionMaster.tsx
│   │   ├── PositionMaster.tsx
│   │   ├── WageMaster.tsx
│   │   ├── TaxMaster.tsx
│   │   ├── PremiumMaster.tsx
│   │   ├── NaturaMaster.tsx
│   │   │
│   │   ├── WorkingDaysMaster.tsx
│   │   ├── HolidayMaster.tsx
│   │   ├── AttendanceMaster.tsx
│   │   ├── LeaveManagement.tsx
│   │   │
│   │   ├── Recruitment.tsx
│   │   ├── Termination.tsx
│   │   ├── Probasi.tsx
│   │   │
│   │   ├── PayrollProcessing.tsx
│   │   ├── PayrollReports.tsx
│   │   │
│   │   ├── EngagementDashboard.tsx
│   │   │
│   │   ├── Settings.tsx
│   │   ├── UserManagement.tsx
│   │   ├── RoleManagement.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AccountSettings.tsx
│   │   │
│   │   ├── CommandPalette.tsx
│   │   ├── SigmaLogo.tsx
│   │   ├── DatabaseSeeder.tsx
│   │   ├── DesignReference.tsx
│   │   └── TableDocumentation.tsx
│   │
│   ├── contexts/                # React Contexts
│   │   └── AuthContext.tsx      # Auth & RBAC logic
│   │
│   ├── shared/                  # Shared data
│   │   ├── employeeData.ts      # 38 employees
│   │   ├── divisionData.ts      # 6 divisions
│   │   ├── taxBpjsData.ts       # Tax & BPJS rates
│   │   └── naturaData.ts        # Natura data
│   │
│   ├── utils/                   # Utilities
│   │   ├── api.ts               # API functions
│   │   ├── hooks/               # Custom hooks
│   │   └── supabase/            # Supabase client
│   │       ├── client.ts        # Supabase client
│   │       ├── info.ts          # Project info
│   │       └── functions/       # Edge functions
│   │
│   ├── styles/                  # Global styles
│   │   └── globals.css
│   │
│   ├── guidelines/              # Guidelines
│   │   └── Guidelines.md
│   │
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Base styles
│
├── supabase/                    # Supabase config
│   ├── migrations/              # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_seed_data.sql
│   └── DATABASE_SCHEMA.md       # Schema docs
│
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
├── SUPABASE_SETUP.md            # Setup guide
└── index.html
```

**File Count:**
- React Components: 40+
- UI Components: 50+
- Total Lines of Code: ~50,000+
- Database Tables: 21
- Migration Files: 3
