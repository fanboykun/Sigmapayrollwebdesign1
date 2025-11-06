-- ============================================================================
-- UPDATE EMPLOYEES TABLE - ADD FAMILY DATA
-- ============================================================================
-- Version: 1.0.0
-- Description: Menambahkan kolom untuk data keluarga karyawan
--              (istri/suami dan anak-anak) untuk keperluan klinik
-- Date: 2025-11-06
-- ============================================================================

-- Add new columns to employees table for family data
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5),
ADD COLUMN IF NOT EXISTS bpjs_health_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS family_data JSONB DEFAULT '{}'::jsonb;

-- Format family_data JSONB:
-- {
--   "spouse": {
--     "nik": "1234567890123456",
--     "fullName": "Siti Aminah",
--     "birthDate": "1990-05-15",
--     "gender": "female",
--     "bloodType": "A+",
--     "bpjsHealthNumber": "0001234567891",
--     "phone": "081234567890"
--   },
--   "children": [
--     {
--       "nik": "1234567890123457",
--       "fullName": "Budi Ahmad",
--       "birthDate": "2015-03-10",
--       "gender": "male",
--       "bloodType": "O+",
--       "bpjsHealthNumber": "0001234567892"
--     },
--     {
--       "nik": "1234567890123458",
--       "fullName": "Ani Ahmad",
--       "birthDate": "2018-07-20",
--       "gender": "female",
--       "bloodType": "A+",
--       "bpjsHealthNumber": "0001234567893"
--     }
--   ]
-- }

-- Create index for family data search
CREATE INDEX IF NOT EXISTS idx_employees_family_data_gin ON employees USING gin(family_data);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get employee's family members (including self)
CREATE OR REPLACE FUNCTION get_employee_family_members(emp_id UUID)
RETURNS TABLE (
    relation VARCHAR(20),
    nik VARCHAR(20),
    full_name VARCHAR(255),
    birth_date DATE,
    age INTEGER,
    gender VARCHAR(10),
    blood_type VARCHAR(5),
    bpjs_health_number VARCHAR(20)
) AS $$
BEGIN
    -- Return employee (self)
    RETURN QUERY
    SELECT
        'self'::VARCHAR(20) AS relation,
        e.employee_id AS nik,
        e.full_name,
        e.birth_date,
        EXTRACT(YEAR FROM AGE(e.birth_date))::INTEGER AS age,
        e.gender,
        e.blood_type,
        e.bpjs_health_number
    FROM employees e
    WHERE e.id = emp_id;

    -- Return spouse (if married)
    RETURN QUERY
    SELECT
        'spouse'::VARCHAR(20) AS relation,
        (family_data->'spouse'->>'nik')::VARCHAR(20) AS nik,
        (family_data->'spouse'->>'fullName')::VARCHAR(255) AS full_name,
        (family_data->'spouse'->>'birthDate')::DATE AS birth_date,
        EXTRACT(YEAR FROM AGE((family_data->'spouse'->>'birthDate')::DATE))::INTEGER AS age,
        (family_data->'spouse'->>'gender')::VARCHAR(10) AS gender,
        (family_data->'spouse'->>'bloodType')::VARCHAR(5) AS blood_type,
        (family_data->'spouse'->>'bpjsHealthNumber')::VARCHAR(20) AS bpjs_health_number
    FROM employees e
    WHERE e.id = emp_id
      AND e.marital_status = 'married'
      AND family_data->'spouse' IS NOT NULL;

    -- Return children
    RETURN QUERY
    SELECT
        'child'::VARCHAR(20) AS relation,
        (child->>'nik')::VARCHAR(20) AS nik,
        (child->>'fullName')::VARCHAR(255) AS full_name,
        (child->>'birthDate')::DATE AS birth_date,
        EXTRACT(YEAR FROM AGE((child->>'birthDate')::DATE))::INTEGER AS age,
        (child->>'gender')::VARCHAR(10) AS gender,
        (child->>'bloodType')::VARCHAR(5) AS blood_type,
        (child->>'bpjsHealthNumber')::VARCHAR(20) AS bpjs_health_number
    FROM employees e,
         jsonb_array_elements(e.family_data->'children') AS child
    WHERE e.id = emp_id
      AND family_data->'children' IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Search family member by name (across all employees)
CREATE OR REPLACE FUNCTION search_family_member_by_name(search_name VARCHAR(255))
RETURNS TABLE (
    employee_id UUID,
    employee_nik VARCHAR(20),
    employee_name VARCHAR(255),
    employee_division VARCHAR(255),
    relation VARCHAR(20),
    family_member_name VARCHAR(255),
    family_member_nik VARCHAR(20),
    family_member_age INTEGER,
    family_member_gender VARCHAR(10)
) AS $$
BEGIN
    -- Search in spouse
    RETURN QUERY
    SELECT
        e.id AS employee_id,
        e.employee_id AS employee_nik,
        e.full_name AS employee_name,
        d.name AS employee_division,
        'spouse'::VARCHAR(20) AS relation,
        (e.family_data->'spouse'->>'fullName')::VARCHAR(255) AS family_member_name,
        (e.family_data->'spouse'->>'nik')::VARCHAR(20) AS family_member_nik,
        EXTRACT(YEAR FROM AGE((e.family_data->'spouse'->>'birthDate')::DATE))::INTEGER AS family_member_age,
        (e.family_data->'spouse'->>'gender')::VARCHAR(10) AS family_member_gender
    FROM employees e
    LEFT JOIN divisions d ON e.division_id = d.id
    WHERE e.marital_status = 'married'
      AND e.family_data->'spouse' IS NOT NULL
      AND LOWER(e.family_data->'spouse'->>'fullName') LIKE LOWER('%' || search_name || '%');

    -- Search in children
    RETURN QUERY
    SELECT
        e.id AS employee_id,
        e.employee_id AS employee_nik,
        e.full_name AS employee_name,
        d.name AS employee_division,
        'child'::VARCHAR(20) AS relation,
        (child->>'fullName')::VARCHAR(255) AS family_member_name,
        (child->>'nik')::VARCHAR(20) AS family_member_nik,
        EXTRACT(YEAR FROM AGE((child->>'birthDate')::DATE))::INTEGER AS family_member_age,
        (child->>'gender')::VARCHAR(10) AS family_member_gender
    FROM employees e
    LEFT JOIN divisions d ON e.division_id = d.id,
         jsonb_array_elements(e.family_data->'children') AS child
    WHERE e.family_data->'children' IS NOT NULL
      AND LOWER(child->>'fullName') LIKE LOWER('%' || search_name || '%');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN employees.marital_status IS 'Status pernikahan: single, married, divorced, widowed';
COMMENT ON COLUMN employees.blood_type IS 'Golongan darah karyawan: A+, A-, B+, B-, AB+, AB-, O+, O-';
COMMENT ON COLUMN employees.bpjs_health_number IS 'Nomor BPJS Kesehatan karyawan';
COMMENT ON COLUMN employees.family_data IS 'Data keluarga (istri & anak) dalam format JSONB';

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Example 1: Get all family members for a specific employee
-- SELECT * FROM get_employee_family_members('employee-uuid-here');

-- Example 2: Search family member by name
-- SELECT * FROM search_family_member_by_name('Siti');

-- Example 3: Update family data for an employee
-- UPDATE employees
-- SET family_data = '{
--   "spouse": {
--     "nik": "1234567890123456",
--     "fullName": "Siti Aminah",
--     "birthDate": "1990-05-15",
--     "gender": "female",
--     "bloodType": "A+",
--     "bpjsHealthNumber": "0001234567891"
--   },
--   "children": [
--     {
--       "nik": "1234567890123457",
--       "fullName": "Budi Ahmad",
--       "birthDate": "2015-03-10",
--       "gender": "male",
--       "bloodType": "O+"
--     }
--   ]
-- }'::jsonb
-- WHERE employee_id = '001';
