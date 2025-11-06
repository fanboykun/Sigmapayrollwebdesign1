-- ============================================================================
-- SEED DATA FOR CLINIC REGISTRATION MODULE
-- ============================================================================
-- Version: 1.0.0
-- Description: Sample data untuk testing modul pendaftaran klinik
-- Date: 2025-11-06
-- ============================================================================

-- ============================================================================
-- 1. PARTNER PLANTATIONS (KEBUN SEPUPU)
-- ============================================================================

INSERT INTO partner_plantations (code, name, short_name, address, city, province, contact_person, contact_phone, cooperation_start_date, is_active) VALUES
('KS-001', 'Kebun Aek Loba', 'Aek Loba', 'Jl. Perkebunan Aek Loba, Desa Aek Loba', 'Asahan', 'Sumatera Utara', 'Budi Santoso', '0821-1111-0001', '2020-01-01', true),
('KS-002', 'Kebun Tanah Gambus', 'Tanah Gambus', 'Jl. Perkebunan Tanah Gambus, Desa Tanah Gambus', 'Labuhanbatu', 'Sumatera Utara', 'Agus Wijaya', '0821-1111-0002', '2020-01-01', true),
('KS-003', 'Kebun Bukit Lawang', 'Bukit Lawang', 'Jl. Perkebunan Bukit Lawang, Desa Bukit Lawang', 'Langkat', 'Sumatera Utara', 'Rina Susanti', '0821-1111-0003', '2021-01-01', true),
('KS-004', 'Kebun Sei Mangkei', 'Sei Mangkei', 'Jl. Perkebunan Sei Mangkei, Desa Sei Mangkei', 'Simalungun', 'Sumatera Utara', 'Hendra Gunawan', '0821-1111-0004', '2021-06-01', true),
('KS-005', 'Kebun Helvetia', 'Helvetia', 'Jl. Perkebunan Helvetia, Desa Helvetia', 'Deli Serdang', 'Sumatera Utara', 'Dewi Lestari', '0821-1111-0005', '2022-01-01', true),
('KS-006', 'Kebun Bah Jambi', 'Bah Jambi', 'Jl. Perkebunan Bah Jambi, Desa Bah Jambi', 'Simalungun', 'Sumatera Utara', 'Ahmad Fauzi', '0821-1111-0006', '2023-01-01', true);

-- ============================================================================
-- 2. UPDATE SAMPLE EMPLOYEES WITH FAMILY DATA
-- ============================================================================

-- Update Ahmad Hidayat (NIK: 001) with family data
UPDATE employees
SET
    marital_status = 'married',
    blood_type = 'O+',
    bpjs_health_number = '0001000000001',
    family_data = '{
        "spouse": {
            "nik": "1234567890001",
            "fullName": "Siti Aminah",
            "birthDate": "1987-06-15",
            "gender": "female",
            "bloodType": "A+",
            "bpjsHealthNumber": "0001000000002",
            "phone": "0821-2000-0001"
        },
        "children": [
            {
                "nik": "1234567890002",
                "fullName": "Budi Ahmad Hidayat",
                "birthDate": "2015-03-10",
                "gender": "male",
                "bloodType": "O+",
                "bpjsHealthNumber": "0001000000003"
            },
            {
                "nik": "1234567890003",
                "fullName": "Ani Ahmad Hidayat",
                "birthDate": "2018-07-20",
                "gender": "female",
                "bloodType": "A+",
                "bpjsHealthNumber": "0001000000004"
            }
        ]
    }'::jsonb
WHERE employee_id = '001';

-- Update Siti Nurhaliza (NIK: 002) with family data
UPDATE employees
SET
    marital_status = 'married',
    blood_type = 'B+',
    bpjs_health_number = '0001000000005',
    family_data = '{
        "spouse": {
            "nik": "1234567890004",
            "fullName": "Muhammad Rizki",
            "birthDate": "1985-04-20",
            "gender": "male",
            "bloodType": "AB+",
            "bpjsHealthNumber": "0001000000006",
            "phone": "0821-2000-0002"
        },
        "children": [
            {
                "nik": "1234567890005",
                "fullName": "Zahra Siti Rizki",
                "birthDate": "2016-09-05",
                "gender": "female",
                "bloodType": "B+",
                "bpjsHealthNumber": "0001000000007"
            }
        ]
    }'::jsonb
WHERE employee_id = '002';

-- Update Budi Santoso (NIK: 003) - single
UPDATE employees
SET
    marital_status = 'single',
    blood_type = 'A-',
    bpjs_health_number = '0001000000008'
WHERE employee_id = '003';

-- Update Dewi Lestari (NIK: 004) with family data
UPDATE employees
SET
    marital_status = 'married',
    blood_type = 'O-',
    bpjs_health_number = '0001000000009',
    family_data = '{
        "spouse": {
            "nik": "1234567890006",
            "fullName": "Andri Prasetyo",
            "birthDate": "1992-11-10",
            "gender": "male",
            "bloodType": "O+",
            "bpjsHealthNumber": "0001000000010",
            "phone": "0821-2000-0003"
        },
        "children": [
            {
                "nik": "1234567890007",
                "fullName": "Aditya Dewi Prasetyo",
                "birthDate": "2019-05-15",
                "gender": "male",
                "bloodType": "O+",
                "bpjsHealthNumber": "0001000000011"
            },
            {
                "nik": "1234567890008",
                "fullName": "Aulia Dewi Prasetyo",
                "birthDate": "2021-08-22",
                "gender": "female",
                "bloodType": "O-",
                "bpjsHealthNumber": "0001000000012"
            }
        ]
    }'::jsonb
WHERE employee_id = '004';

-- Update Rudi Hermawan (NIK: 005) - married without children yet
UPDATE employees
SET
    marital_status = 'married',
    blood_type = 'AB+',
    bpjs_health_number = '0001000000013',
    family_data = '{
        "spouse": {
            "nik": "1234567890009",
            "fullName": "Rina Rudi",
            "birthDate": "1995-02-14",
            "gender": "female",
            "bloodType": "B+",
            "bpjsHealthNumber": "0001000000014",
            "phone": "0821-2000-0004"
        }
    }'::jsonb
WHERE employee_id = '005';

-- ============================================================================
-- 3. SAMPLE PATIENTS (FOR TESTING)
-- ============================================================================

-- Note: Patients will be created automatically through the registration form
-- This is just for reference of how the data will look

-- Example: Karyawan PT. Socfindo
-- Patient Type: employee
-- Will be linked to employees.id

-- Example: Keluarga Karyawan
-- Patient Type: employee_family
-- Will be linked to employees.id with family_relation = 'spouse' or 'child'

-- Example: Karyawan Kebun Sepupu
-- Patient Type: partner
-- Will be linked to partner_plantations.id

-- Example: Pasien Umum
-- Patient Type: public
-- No linkage to employees or partner_plantations

-- ============================================================================
-- 4. HELPER VIEW: Employee Family Overview
-- ============================================================================

-- Drop existing view if any
DROP VIEW IF EXISTS v_employee_family_overview;

-- Create the view
CREATE VIEW v_employee_family_overview AS
SELECT
    e.id AS employee_id,
    e.employee_id AS nik,
    e.full_name AS employee_name,
    COALESCE(d.nama_divisi, '-') AS division,
    COALESCE(p.nama_divisi, '-') AS position,
    e.marital_status,
    e.blood_type AS employee_blood_type,
    e.bpjs_health_number AS employee_bpjs,
    (e.family_data->'spouse'->>'fullName')::VARCHAR AS spouse_name,
    (e.family_data->'spouse'->>'birthDate')::DATE AS spouse_birth_date,
    CASE
        WHEN e.family_data->'spouse'->>'birthDate' IS NOT NULL
        THEN EXTRACT(YEAR FROM AGE((e.family_data->'spouse'->>'birthDate')::DATE))::INTEGER
        ELSE NULL
    END AS spouse_age,
    (e.family_data->'spouse'->>'bloodType')::VARCHAR AS spouse_blood_type,
    (e.family_data->'spouse'->>'bpjsHealthNumber')::VARCHAR AS spouse_bpjs,
    CASE
        WHEN e.family_data->'children' IS NOT NULL
        THEN jsonb_array_length(e.family_data->'children')
        ELSE 0
    END AS children_count,
    (1 +
    CASE WHEN e.marital_status = 'married' AND e.family_data->'spouse' IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN e.family_data->'children' IS NOT NULL THEN jsonb_array_length(e.family_data->'children') ELSE 0 END) AS total_family_members
FROM public.employees e
LEFT JOIN public.divisions d ON e.division_id::TEXT = d.id::TEXT
LEFT JOIN public.positions p ON e.position_id::TEXT = p.id::TEXT
WHERE e.status = 'active'
ORDER BY e.employee_id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON VIEW v_employee_family_overview IS 'Overview data karyawan beserta anggota keluarga untuk keperluan klinik';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check partner plantations
-- SELECT * FROM partner_plantations ORDER BY code;

-- Check employees with family data
-- SELECT * FROM v_employee_family_overview;

-- Get specific employee's family members
-- SELECT * FROM get_employee_family_members((SELECT id FROM employees WHERE employee_id = '001'));

-- Search family member by name
-- SELECT * FROM search_family_member_by_name('Siti');
