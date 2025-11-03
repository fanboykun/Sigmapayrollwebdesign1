-- ============================================================================
-- CLINIC MODULE - HR INTEGRATION
-- ============================================================================
-- Migration: 008_clinic_hr_integration.sql
-- Description: Creates integration with HR module (attendance, leave)
-- Author: Sigma Development Team
-- Created: 2025-11-03
-- ============================================================================

-- ============================================================================
-- 1. ADD SICK LETTER REFERENCE TO LEAVE REQUESTS
-- ============================================================================
ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS sick_letter_id UUID REFERENCES clinic_sick_letters(id) ON DELETE SET NULL;

COMMENT ON COLUMN leave_requests.sick_letter_id IS 'Reference to clinic sick letter if leave is due to illness';

CREATE INDEX IF NOT EXISTS idx_leave_requests_sick_letter ON leave_requests(sick_letter_id);

-- ============================================================================
-- 2. SYNC SICK LETTER TO ATTENDANCE AND LEAVE
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_sick_letter_to_attendance()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
  v_employee_uuid UUID;
BEGIN
  -- Get employee UUID from patient
  SELECT employee_id INTO v_employee_uuid
  FROM clinic_patients
  WHERE id = NEW.patient_id;

  -- Only process if patient is an employee
  IF v_employee_uuid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update existing attendance records for the sick leave period
  FOR v_date IN
    SELECT generate_series(NEW.start_date, NEW.end_date, '1 day'::interval)::date
  LOOP
    -- Insert or update attendance record
    INSERT INTO attendance_records (
      employee_id,
      date,
      status,
      notes,
      created_at,
      updated_at
    )
    VALUES (
      v_employee_uuid,
      v_date,
      'sick',
      'Sakit - Surat Dokter No: ' || NEW.letter_number,
      NOW(),
      NOW()
    )
    ON CONFLICT (employee_id, date)
    DO UPDATE SET
      status = 'sick',
      notes = 'Sakit - Surat Dokter No: ' || NEW.letter_number,
      updated_at = NOW();
  END LOOP;

  -- Create or update leave request (auto-approved)
  INSERT INTO leave_requests (
    employee_id,
    leave_type,
    start_date,
    end_date,
    total_days,
    reason,
    status,
    requested_date,
    approved_date,
    sick_letter_id,
    created_at,
    updated_at
  )
  VALUES (
    v_employee_uuid,
    'sick',
    NEW.start_date,
    NEW.end_date,
    NEW.total_days,
    'Sakit - ' || NEW.diagnosis,
    'approved',  -- Auto-approved because it has doctor's letter
    NEW.issue_date,
    NOW(),
    NEW.id,
    NOW(),
    NOW()
  )
  ON CONFLICT (employee_id, start_date, leave_type)
  DO UPDATE SET
    end_date = NEW.end_date,
    total_days = NEW.total_days,
    reason = 'Sakit - ' || NEW.diagnosis,
    status = 'approved',
    sick_letter_id = NEW.id,
    updated_at = NOW();

  -- Mark as synced
  UPDATE clinic_sick_letters
  SET
    synced_to_attendance = true,
    attendance_updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_sync_sick_letter_to_attendance ON clinic_sick_letters;
CREATE TRIGGER trg_sync_sick_letter_to_attendance
  AFTER INSERT ON clinic_sick_letters
  FOR EACH ROW
  EXECUTE FUNCTION sync_sick_letter_to_attendance();

COMMENT ON FUNCTION sync_sick_letter_to_attendance() IS 'Automatically syncs sick letter to attendance records and creates auto-approved leave request';

-- ============================================================================
-- 3. FUNCTION TO GET LOW STOCK MEDICINES
-- ============================================================================
CREATE OR REPLACE FUNCTION get_low_stock_medicines()
RETURNS TABLE (
  medicine_id UUID,
  medicine_code VARCHAR(50),
  medicine_name VARCHAR(255),
  current_stock BIGINT,
  min_stock INTEGER,
  stock_status TEXT,
  days_until_out INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS medicine_id,
    m.medicine_code,
    m.name AS medicine_name,
    COALESCE(SUM(s.quantity), 0) AS current_stock,
    m.min_stock,
    CASE
      WHEN COALESCE(SUM(s.quantity), 0) = 0 THEN 'OUT_OF_STOCK'
      WHEN COALESCE(SUM(s.quantity), 0) < m.min_stock THEN 'LOW_STOCK'
      ELSE 'OK'
    END AS stock_status,
    -- Estimate days until out based on average daily usage
    CASE
      WHEN COALESCE(SUM(s.quantity), 0) > 0 THEN
        (COALESCE(SUM(s.quantity), 0) / NULLIF(
          (SELECT COUNT(*)::numeric / 30
           FROM clinic_medicine_dispensing
           WHERE medicine_id = m.id
             AND dispensed_date >= CURRENT_DATE - INTERVAL '30 days'
          ), 0
        ))::INTEGER
      ELSE 0
    END AS days_until_out
  FROM clinic_medicines m
  LEFT JOIN clinic_medicine_stock s ON m.id = s.medicine_id
    AND s.status = 'available'
  WHERE m.is_active = true
  GROUP BY m.id, m.medicine_code, m.name, m.min_stock
  HAVING COALESCE(SUM(s.quantity), 0) <= m.min_stock
  ORDER BY stock_status DESC, current_stock ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_low_stock_medicines() IS 'Returns medicines with stock below minimum threshold';

-- ============================================================================
-- 4. FUNCTION TO GET MEDICINES EXPIRING SOON
-- ============================================================================
CREATE OR REPLACE FUNCTION get_expiring_medicines(days_threshold INTEGER DEFAULT 60)
RETURNS TABLE (
  medicine_id UUID,
  medicine_code VARCHAR(50),
  medicine_name VARCHAR(255),
  batch_number VARCHAR(50),
  quantity INTEGER,
  expiry_date DATE,
  days_until_expiry INTEGER,
  alert_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS medicine_id,
    m.medicine_code,
    m.name AS medicine_name,
    s.batch_number,
    s.quantity,
    s.expiry_date,
    (s.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
    CASE
      WHEN s.expiry_date < CURRENT_DATE THEN 'EXPIRED'
      WHEN s.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'CRITICAL'
      WHEN s.expiry_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'WARNING'
      ELSE 'WATCH'
    END AS alert_level
  FROM clinic_medicine_stock s
  JOIN clinic_medicines m ON s.medicine_id = m.id
  WHERE s.status = 'available'
    AND s.quantity > 0
    AND s.expiry_date <= CURRENT_DATE + make_interval(days => days_threshold)
  ORDER BY s.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_expiring_medicines(INTEGER) IS 'Returns medicines expiring within specified days (default 60)';

-- ============================================================================
-- 5. FUNCTION TO GET VISIT STATISTICS
-- ============================================================================
CREATE OR REPLACE FUNCTION get_visit_statistics(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_visits BIGINT,
  employee_visits BIGINT,
  family_visits BIGINT,
  completed_visits BIGINT,
  emergency_visits BIGINT,
  sick_letters_issued BIGINT,
  referrals_made BIGINT,
  unique_patients BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_visits,
    COUNT(*) FILTER (WHERE p.patient_type = 'employee')::BIGINT AS employee_visits,
    COUNT(*) FILTER (WHERE p.patient_type = 'family')::BIGINT AS family_visits,
    COUNT(*) FILTER (WHERE v.status = 'completed')::BIGINT AS completed_visits,
    COUNT(*) FILTER (WHERE v.visit_type = 'emergency')::BIGINT AS emergency_visits,
    (SELECT COUNT(*)::BIGINT
     FROM clinic_sick_letters sl
     JOIN clinic_medical_records mr ON sl.medical_record_id = mr.id
     JOIN clinic_visits v2 ON mr.visit_id = v2.id
     WHERE v2.visit_date BETWEEN start_date AND end_date
    ) AS sick_letters_issued,
    (SELECT COUNT(*)::BIGINT
     FROM clinic_referrals r
     WHERE r.referral_date BETWEEN start_date AND end_date
    ) AS referrals_made,
    COUNT(DISTINCT v.patient_id)::BIGINT AS unique_patients
  FROM clinic_visits v
  JOIN clinic_patients p ON v.patient_id = p.id
  WHERE v.visit_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_visit_statistics(DATE, DATE) IS 'Returns visit statistics for a date range';

-- ============================================================================
-- 6. FUNCTION TO GET TOP DISEASES
-- ============================================================================
CREATE OR REPLACE FUNCTION get_top_diseases(
  start_date DATE,
  end_date DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  disease_id UUID,
  icd10_code VARCHAR(10),
  disease_name VARCHAR(255),
  disease_category VARCHAR(100),
  total_cases BIGINT,
  employee_cases BIGINT,
  family_cases BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS disease_id,
    d.icd10_code,
    d.name AS disease_name,
    d.category AS disease_category,
    COUNT(*)::BIGINT AS total_cases,
    COUNT(*) FILTER (WHERE p.patient_type = 'employee')::BIGINT AS employee_cases,
    COUNT(*) FILTER (WHERE p.patient_type = 'family')::BIGINT AS family_cases,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
  FROM clinic_medical_records mr
  JOIN clinic_diseases d ON mr.diagnosis_primary = d.id
  JOIN clinic_visits v ON mr.visit_id = v.id
  JOIN clinic_patients p ON v.patient_id = p.id
  WHERE v.visit_date BETWEEN start_date AND end_date
  GROUP BY d.id, d.icd10_code, d.name, d.category
  ORDER BY total_cases DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_top_diseases(DATE, DATE, INTEGER) IS 'Returns top diseases for a date range';

-- ============================================================================
-- 7. FUNCTION TO GET MEDICINE USAGE REPORT
-- ============================================================================
CREATE OR REPLACE FUNCTION get_medicine_usage_report(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  medicine_id UUID,
  medicine_code VARCHAR(50),
  medicine_name VARCHAR(255),
  dosage_form VARCHAR(50),
  unit VARCHAR(20),
  total_dispensed BIGINT,
  prescription_count BIGINT,
  unit_price NUMERIC(15,2),
  total_cost NUMERIC(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS medicine_id,
    m.medicine_code,
    m.name AS medicine_name,
    m.dosage_form,
    m.unit,
    SUM(md.quantity_dispensed)::BIGINT AS total_dispensed,
    COUNT(DISTINCT md.prescription_id)::BIGINT AS prescription_count,
    m.price_per_unit AS unit_price,
    SUM(md.quantity_dispensed * m.price_per_unit) AS total_cost
  FROM clinic_medicine_dispensing md
  JOIN clinic_medicines m ON md.medicine_id = m.id
  WHERE md.dispensed_date::date BETWEEN start_date AND end_date
  GROUP BY m.id, m.medicine_code, m.name, m.dosage_form, m.unit, m.price_per_unit
  ORDER BY total_dispensed DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_medicine_usage_report(DATE, DATE) IS 'Returns medicine usage report for a date range';

-- ============================================================================
-- 8. VIEW: CURRENT MEDICINE STOCK SUMMARY
-- ============================================================================
CREATE OR REPLACE VIEW v_clinic_medicine_stock_summary AS
SELECT
  m.id AS medicine_id,
  m.medicine_code,
  m.name AS medicine_name,
  m.dosage_form,
  m.unit,
  COALESCE(SUM(s.quantity), 0) AS current_stock,
  m.min_stock,
  m.max_stock,
  CASE
    WHEN COALESCE(SUM(s.quantity), 0) = 0 THEN 'OUT_OF_STOCK'
    WHEN COALESCE(SUM(s.quantity), 0) < m.min_stock THEN 'LOW_STOCK'
    WHEN m.max_stock IS NOT NULL AND COALESCE(SUM(s.quantity), 0) > m.max_stock THEN 'OVERSTOCK'
    ELSE 'OK'
  END AS stock_status,
  MIN(s.expiry_date) AS nearest_expiry_date,
  COUNT(DISTINCT s.batch_number) AS batch_count,
  m.is_active
FROM clinic_medicines m
LEFT JOIN clinic_medicine_stock s ON m.id = s.medicine_id
  AND s.status = 'available'
GROUP BY m.id, m.medicine_code, m.name, m.dosage_form, m.unit, m.min_stock, m.max_stock, m.is_active;

COMMENT ON VIEW v_clinic_medicine_stock_summary IS 'Summary view of current medicine stock levels';

-- ============================================================================
-- 9. VIEW: PATIENT WITH EMPLOYEE INFO
-- ============================================================================
CREATE OR REPLACE VIEW v_clinic_patients_with_employee AS
SELECT
  p.id AS patient_id,
  p.patient_code,
  p.full_name AS patient_name,
  p.patient_type,
  p.nik,
  p.birth_date,
  p.gender,
  p.phone,
  p.bpjs_number,
  p.is_active AS patient_active,
  e.id AS employee_id,
  e.employee_id AS employee_nik,
  e.full_name AS employee_name,
  e.division_id,
  d.name AS division_name,
  e.position_id,
  pos.name AS position_name,
  e.status AS employee_status
FROM clinic_patients p
LEFT JOIN employees e ON p.employee_id = e.id
LEFT JOIN divisions d ON e.division_id = d.id
LEFT JOIN positions pos ON e.position_id = pos.id;

COMMENT ON VIEW v_clinic_patients_with_employee IS 'Patients with related employee information';

-- ============================================================================
-- END OF MIGRATION: 008_clinic_hr_integration.sql
-- ============================================================================
