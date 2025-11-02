-- ============================================================================
-- ADD ADDITIONAL EMPLOYEE FIELDS
-- ============================================================================
-- Version: 1.0.1
-- Description: Add additional fields to employees table based on operational needs
-- Author: Sigma Payroll Team
-- Date: 2025-01-11
-- ============================================================================

-- Add new columns to employees table
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS national_id VARCHAR(50) UNIQUE, -- KTP/National ID
ADD COLUMN IF NOT EXISTS height NUMERIC(5, 2), -- Height in cm
ADD COLUMN IF NOT EXISTS weight NUMERIC(5, 2), -- Weight in kg
ADD COLUMN IF NOT EXISTS driving_license_number VARCHAR(50), -- SIM Number
ADD COLUMN IF NOT EXISTS driving_license_expiry DATE, -- SIM expiry date
ADD COLUMN IF NOT EXISTS nationality VARCHAR(50) DEFAULT 'Indonesian', -- Nationality
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5), -- Blood type (A+, B+, O+, AB+, etc)
ADD COLUMN IF NOT EXISTS religion VARCHAR(50); -- Religion

-- Add comments for documentation
COMMENT ON COLUMN public.employees.national_id IS 'National ID / KTP number';
COMMENT ON COLUMN public.employees.height IS 'Height in centimeters';
COMMENT ON COLUMN public.employees.weight IS 'Weight in kilograms';
COMMENT ON COLUMN public.employees.driving_license_number IS 'Driving license (SIM) number';
COMMENT ON COLUMN public.employees.driving_license_expiry IS 'Driving license expiry date';
COMMENT ON COLUMN public.employees.nationality IS 'Employee nationality';
COMMENT ON COLUMN public.employees.blood_group IS 'Blood type (A+, B+, O+, AB+, A-, B-, O-, AB-)';
COMMENT ON COLUMN public.employees.religion IS 'Employee religion';

-- Create index for national_id for faster searches
CREATE INDEX IF NOT EXISTS idx_employees_national_id ON employees(national_id);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
