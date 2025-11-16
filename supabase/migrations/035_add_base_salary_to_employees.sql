-- =====================================================
-- Migration: 035_add_base_salary_to_employees.sql
-- Description: Add base_salary and wage_scale_id columns to employees table
-- Author: Sigma Payroll Team
-- Date: 2025-11-16
-- =====================================================

-- Add base_salary column to employees table
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS base_salary NUMERIC(15, 2) DEFAULT 0;

-- Add wage_scale_id column to reference master_upah
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS wage_scale_id TEXT;

-- Add foreign key constraint
ALTER TABLE public.employees
ADD CONSTRAINT fk_employees_wage_scale
FOREIGN KEY (wage_scale_id)
REFERENCES public.master_upah(id)
ON DELETE SET NULL;

-- Add comments
COMMENT ON COLUMN public.employees.base_salary IS 'Base salary from wage scale (upah pokok dari master skala upah)';
COMMENT ON COLUMN public.employees.wage_scale_id IS 'Reference to wage scale in master_upah table';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_base_salary ON public.employees(base_salary);
CREATE INDEX IF NOT EXISTS idx_employees_wage_scale_id ON public.employees(wage_scale_id);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
