-- ============================================================================
-- UPDATE GET_EMPLOYEE_FAMILY_MEMBERS FUNCTION
-- ============================================================================
-- Version: 1.0.0
-- Description: Menambahkan field phone, email, address, height, weight
--              untuk auto-fill form pendaftaran pasien klinik
-- Date: 2025-01-10
-- ============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS get_employee_family_members(UUID);

-- Recreate function with additional fields
CREATE OR REPLACE FUNCTION get_employee_family_members(emp_id UUID)
RETURNS TABLE (
    relation VARCHAR(20),
    nik VARCHAR(20),
    national_id VARCHAR(20),
    full_name VARCHAR(255),
    birth_date DATE,
    age INTEGER,
    gender VARCHAR(10),
    blood_type VARCHAR(5),
    bpjs_health_number VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    height NUMERIC(5,2),
    weight NUMERIC(5,2)
) AS $$
BEGIN
    -- Return employee (self) with all personal data
    RETURN QUERY
    SELECT
        'self'::VARCHAR(20) AS relation,
        e.employee_id AS nik,
        e.national_id,
        e.full_name,
        e.birth_date,
        EXTRACT(YEAR FROM AGE(e.birth_date))::INTEGER AS age,
        e.gender,
        e.blood_type,
        e.bpjs_health_number,
        e.phone,
        e.email,
        e.address,
        e.height,
        e.weight
    FROM employees e
    WHERE e.id = emp_id;

    -- Return spouse (if married)
    RETURN QUERY
    SELECT
        'spouse'::VARCHAR(20) AS relation,
        (family_data->'spouse'->>'nik')::VARCHAR(20) AS nik,
        (family_data->'spouse'->>'nik')::VARCHAR(20) AS national_id,
        (family_data->'spouse'->>'fullName')::VARCHAR(255) AS full_name,
        (family_data->'spouse'->>'birthDate')::DATE AS birth_date,
        EXTRACT(YEAR FROM AGE((family_data->'spouse'->>'birthDate')::DATE))::INTEGER AS age,
        (family_data->'spouse'->>'gender')::VARCHAR(10) AS gender,
        (family_data->'spouse'->>'bloodType')::VARCHAR(5) AS blood_type,
        (family_data->'spouse'->>'bpjsHealthNumber')::VARCHAR(20) AS bpjs_health_number,
        (family_data->'spouse'->>'phone')::VARCHAR(20) AS phone,
        NULL::VARCHAR(255) AS email,
        NULL::TEXT AS address,
        NULL::NUMERIC(5,2) AS height,
        NULL::NUMERIC(5,2) AS weight
    FROM employees e
    WHERE e.id = emp_id
      AND e.marital_status = 'married'
      AND family_data->'spouse' IS NOT NULL;

    -- Return children
    RETURN QUERY
    SELECT
        'child'::VARCHAR(20) AS relation,
        (child->>'nik')::VARCHAR(20) AS nik,
        (child->>'nik')::VARCHAR(20) AS national_id,
        (child->>'fullName')::VARCHAR(255) AS full_name,
        (child->>'birthDate')::DATE AS birth_date,
        EXTRACT(YEAR FROM AGE((child->>'birthDate')::DATE))::INTEGER AS age,
        (child->>'gender')::VARCHAR(10) AS gender,
        (child->>'bloodType')::VARCHAR(5) AS blood_type,
        (child->>'bpjsHealthNumber')::VARCHAR(20) AS bpjs_health_number,
        NULL::VARCHAR(20) AS phone,
        NULL::VARCHAR(255) AS email,
        NULL::TEXT AS address,
        NULL::NUMERIC(5,2) AS height,
        NULL::NUMERIC(5,2) AS weight
    FROM employees e,
         jsonb_array_elements(e.family_data->'children') AS child
    WHERE e.id = emp_id
      AND family_data->'children' IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION get_employee_family_members IS 'Get all family members (self, spouse, children) with complete personal data for clinic registration';

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================
-- SELECT * FROM get_employee_family_members('employee-uuid-here');
