/**
 * Supabase Database Types
 * Auto-generated from database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          employee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: string
          employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          module: string
          can_view: boolean
          can_create: boolean
          can_edit: boolean
          can_delete: boolean
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          module: string
          can_view?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_delete?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          module?: string
          can_view?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_delete?: boolean
          created_at?: string
        }
      }
      divisions: {
        Row: {
          id: string
          kode_divisi: string
          nama_divisi: string
          kepala_divisi: string | null
          jumlah_karyawan: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kode_divisi: string
          nama_divisi: string
          kepala_divisi?: string | null
          jumlah_karyawan?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kode_divisi?: string
          nama_divisi?: string
          kepala_divisi?: string | null
          jumlah_karyawan?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      estate_subdivisions: {
        Row: {
          id: string
          estate_id: string
          kode_subdivisi: string
          nama_subdivisi: string
          kepala_subdivisi: string | null
          jumlah_karyawan: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          estate_id: string
          kode_subdivisi: string
          nama_subdivisi: string
          kepala_subdivisi?: string | null
          jumlah_karyawan?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          estate_id?: string
          kode_subdivisi?: string
          nama_subdivisi?: string
          kepala_subdivisi?: string | null
          jumlah_karyawan?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          code: string
          name: string
          category: 'managerial' | 'staff' | 'operator' | 'labor'
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          category: 'managerial' | 'staff' | 'operator' | 'labor'
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category?: 'managerial' | 'staff' | 'operator' | 'labor'
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wage_scales: {
        Row: {
          id: string
          code: string
          name: string
          category: 'daily' | 'monthly'
          base_salary: number
          transport_allowance: number
          meal_allowance: number
          position_allowance: number
          effective_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          category: 'daily' | 'monthly'
          base_salary: number
          transport_allowance?: number
          meal_allowance?: number
          position_allowance?: number
          effective_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category?: 'daily' | 'monthly'
          base_salary?: number
          transport_allowance?: number
          meal_allowance?: number
          position_allowance?: number
          effective_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tax_brackets: {
        Row: {
          id: string
          year: number
          min_income: number
          max_income: number | null
          rate: number
          layer: number
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          min_income: number
          max_income?: number | null
          rate: number
          layer: number
          created_at?: string
        }
        Update: {
          id?: string
          year?: number
          min_income?: number
          max_income?: number | null
          rate?: number
          layer?: number
          created_at?: string
        }
      }
      bpjs_rates: {
        Row: {
          id: string
          type: 'kesehatan' | 'ketenagakerjaan'
          component: string
          employee_rate: number
          employer_rate: number
          effective_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: 'kesehatan' | 'ketenagakerjaan'
          component: string
          employee_rate: number
          employer_rate: number
          effective_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'kesehatan' | 'ketenagakerjaan'
          component?: string
          employee_rate?: number
          employer_rate?: number
          effective_date?: string
          is_active?: boolean
          created_at?: string
        }
      }
      natura: {
        Row: {
          id: string
          type: string
          quantity: number
          unit: string
          price_per_unit: number
          total_value: number
          effective_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          quantity: number
          unit: string
          price_per_unit: number
          total_value: number
          effective_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          quantity?: number
          unit?: string
          price_per_unit?: number
          total_value?: number
          effective_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      premiums: {
        Row: {
          id: string
          code: string
          name: string
          type: 'percentage' | 'fixed'
          value: number
          is_taxable: boolean
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          type: 'percentage' | 'fixed'
          value: number
          is_taxable?: boolean
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          type?: 'percentage' | 'fixed'
          value?: number
          is_taxable?: boolean
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      working_days: {
        Row: {
          id: string
          division_id: string | null
          year: number
          month: number
          working_days: number
          holidays: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          division_id?: string | null
          year: number
          month: number
          working_days: number
          holidays?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          division_id?: string | null
          year?: number
          month?: number
          working_days?: number
          holidays?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      holidays: {
        Row: {
          id: string
          date: string
          name: string
          type: 'national' | 'religious' | 'company'
          is_paid: boolean
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          name: string
          type: 'national' | 'religious' | 'company'
          is_paid?: boolean
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          name?: string
          type?: 'national' | 'religious' | 'company'
          is_paid?: boolean
          description?: string | null
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          uuid: string
          employee_id: string
          full_name: string
          national_id: string | null
          nationality: string | null
          division_id: string
          position_id: string
          wage_scale_id: string
          employment_status: 'permanent' | 'contract' | 'daily'
          join_date: string
          birth_date: string | null
          gender: 'male' | 'female'
          marital_status: 'single' | 'married' | 'divorced' | 'widowed'
          dependents: number
          npwp: string | null
          bpjs_kesehatan: string | null
          bpjs_ketenagakerjaan: string | null
          bank_account: string | null
          bank_name: string | null
          address: string | null
          phone: string | null
          email: string | null
          photo_url: string | null
          status: 'active' | 'inactive' | 'on-leave' | 'terminated'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          uuid?: string
          employee_id: string
          full_name: string
          national_id?: string | null
          nationality?: string | null
          division_id: string
          position_id: string
          wage_scale_id: string
          employment_status: 'permanent' | 'contract' | 'daily'
          join_date: string
          birth_date?: string | null
          gender: 'male' | 'female'
          marital_status?: 'single' | 'married' | 'divorced' | 'widowed'
          dependents?: number
          npwp?: string | null
          bpjs_kesehatan?: string | null
          bpjs_ketenagakerjaan?: string | null
          bank_account?: string | null
          bank_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          status?: 'active' | 'inactive' | 'on-leave' | 'terminated'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          uuid?: string
          employee_id?: string
          full_name?: string
          national_id?: string | null
          nationality?: string | null
          division_id?: string
          position_id?: string
          wage_scale_id?: string
          employment_status?: 'permanent' | 'contract' | 'daily'
          join_date?: string
          birth_date?: string | null
          gender?: 'male' | 'female'
          marital_status?: 'single' | 'married' | 'divorced' | 'widowed'
          dependents?: number
          npwp?: string | null
          bpjs_kesehatan?: string | null
          bpjs_ketenagakerjaan?: string | null
          bank_account?: string | null
          bank_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          status?: 'active' | 'inactive' | 'on-leave' | 'terminated'
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          employee_id: string
          date: string
          status: 'present' | 'absent' | 'leave' | 'sick' | 'permission' | 'holiday'
          check_in: string | null
          check_out: string | null
          working_hours: number | null
          overtime_hours: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          status: 'present' | 'absent' | 'leave' | 'sick' | 'permission' | 'holiday'
          check_in?: string | null
          check_out?: string | null
          working_hours?: number | null
          overtime_hours?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          status?: 'present' | 'absent' | 'leave' | 'sick' | 'permission' | 'holiday'
          check_in?: string | null
          check_out?: string | null
          working_hours?: number | null
          overtime_hours?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other'
          start_date: string
          end_date: string
          total_days: number
          reason: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by: string | null
          approved_date: string | null
          rejection_reason: string | null
          requested_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other'
          start_date: string
          end_date: string
          total_days: number
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by?: string | null
          approved_date?: string | null
          rejection_reason?: string | null
          requested_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other'
          start_date?: string
          end_date?: string
          total_days?: number
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by?: string | null
          approved_date?: string | null
          rejection_reason?: string | null
          requested_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payroll_periods: {
        Row: {
          id: string
          year: number
          month: number
          start_date: string
          end_date: string
          payment_date: string
          status: 'draft' | 'processing' | 'approved' | 'paid'
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          month: number
          start_date: string
          end_date: string
          payment_date: string
          status?: 'draft' | 'processing' | 'approved' | 'paid'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          year?: number
          month?: number
          start_date?: string
          end_date?: string
          payment_date?: string
          status?: 'draft' | 'processing' | 'approved' | 'paid'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      payroll_records: {
        Row: {
          id: string
          period_id: string
          employee_id: string
          base_salary: number
          transport_allowance: number
          meal_allowance: number
          position_allowance: number
          overtime_pay: number
          premium_pay: number
          natura_value: number
          gross_salary: number
          bpjs_kesehatan_employee: number
          bpjs_kesehatan_employer: number
          bpjs_tk_jht_employee: number
          bpjs_tk_jht_employer: number
          bpjs_tk_jp_employee: number
          bpjs_tk_jp_employer: number
          bpjs_tk_jkk_employer: number
          bpjs_tk_jkm_employer: number
          income_tax: number
          other_deductions: number
          total_deductions: number
          net_salary: number
          payment_status: 'pending' | 'paid'
          payment_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          period_id: string
          employee_id: string
          base_salary: number
          transport_allowance?: number
          meal_allowance?: number
          position_allowance?: number
          overtime_pay?: number
          premium_pay?: number
          natura_value?: number
          gross_salary: number
          bpjs_kesehatan_employee?: number
          bpjs_kesehatan_employer?: number
          bpjs_tk_jht_employee?: number
          bpjs_tk_jht_employer?: number
          bpjs_tk_jp_employee?: number
          bpjs_tk_jp_employer?: number
          bpjs_tk_jkk_employer?: number
          bpjs_tk_jkm_employer?: number
          income_tax?: number
          other_deductions?: number
          total_deductions: number
          net_salary: number
          payment_status?: 'pending' | 'paid'
          payment_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          employee_id?: string
          base_salary?: number
          transport_allowance?: number
          meal_allowance?: number
          position_allowance?: number
          overtime_pay?: number
          premium_pay?: number
          natura_value?: number
          gross_salary?: number
          bpjs_kesehatan_employee?: number
          bpjs_kesehatan_employer?: number
          bpjs_tk_jht_employee?: number
          bpjs_tk_jht_employer?: number
          bpjs_tk_jp_employee?: number
          bpjs_tk_jp_employer?: number
          bpjs_tk_jkk_employer?: number
          bpjs_tk_jkm_employer?: number
          income_tax?: number
          other_deductions?: number
          total_deductions?: number
          net_salary?: number
          payment_status?: 'pending' | 'paid'
          payment_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      employee_transfers: {
        Row: {
          id: string
          employee_id: string
          from_division_id: string
          to_division_id: string
          from_position_id: string | null
          to_position_id: string | null
          transfer_date: string
          reason: string | null
          approved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          from_division_id: string
          to_division_id: string
          from_position_id?: string | null
          to_position_id?: string | null
          transfer_date: string
          reason?: string | null
          approved_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          from_division_id?: string
          to_division_id?: string
          from_position_id?: string | null
          to_position_id?: string | null
          transfer_date?: string
          reason?: string | null
          approved_by?: string | null
          created_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          title: string
          division_id: string
          position_id: string
          description: string | null
          requirements: string | null
          vacancies: number
          salary_range_min: number | null
          salary_range_max: number | null
          posted_date: string
          closing_date: string
          status: 'open' | 'closed' | 'filled'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          division_id: string
          position_id: string
          description?: string | null
          requirements?: string | null
          vacancies: number
          salary_range_min?: number | null
          salary_range_max?: number | null
          posted_date: string
          closing_date: string
          status?: 'open' | 'closed' | 'filled'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          division_id?: string
          position_id?: string
          description?: string | null
          requirements?: string | null
          vacancies?: number
          salary_range_min?: number | null
          salary_range_max?: number | null
          posted_date?: string
          closing_date?: string
          status?: 'open' | 'closed' | 'filled'
          created_at?: string
        }
      }
      applicants: {
        Row: {
          id: string
          job_posting_id: string
          full_name: string
          email: string
          phone: string
          birth_date: string | null
          address: string | null
          education: string | null
          experience: string | null
          resume_url: string | null
          status: 'applied' | 'screening' | 'interview' | 'offered' | 'accepted' | 'rejected'
          applied_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_posting_id: string
          full_name: string
          email: string
          phone: string
          birth_date?: string | null
          address?: string | null
          education?: string | null
          experience?: string | null
          resume_url?: string | null
          status?: 'applied' | 'screening' | 'interview' | 'offered' | 'accepted' | 'rejected'
          applied_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_posting_id?: string
          full_name?: string
          email?: string
          phone?: string
          birth_date?: string | null
          address?: string | null
          education?: string | null
          experience?: string | null
          resume_url?: string | null
          status?: 'applied' | 'screening' | 'interview' | 'offered' | 'accepted' | 'rejected'
          applied_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      termination_requests: {
        Row: {
          id: string
          employee_id: string
          termination_type: 'resignation' | 'retirement' | 'termination' | 'contract_end'
          effective_date: string
          reason: string | null
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          termination_type: 'resignation' | 'retirement' | 'termination' | 'contract_end'
          effective_date: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          termination_type?: 'resignation' | 'retirement' | 'termination' | 'contract_end'
          effective_date?: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      employee_assets: {
        Row: {
          id: string
          employee_id: string
          asset_name: string
          asset_code: string | null
          assigned_date: string
          return_date: string | null
          condition: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          asset_name: string
          asset_code?: string | null
          assigned_date: string
          return_date?: string | null
          condition?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          asset_name?: string
          asset_code?: string | null
          assigned_date?: string
          return_date?: string | null
          condition?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
