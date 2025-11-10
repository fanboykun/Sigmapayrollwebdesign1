-- ============================================================================
-- CLINIC MODULE - TRIGGERS AND FUNCTIONS
-- ============================================================================
-- Migration: 007_clinic_triggers.sql
-- Description: Creates triggers and functions for automation
-- Author: Sigma Development Team
-- Created: 2025-11-03
-- ============================================================================

-- ============================================================================
-- 1. AUTO-GENERATE VISIT NUMBER
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_clinic_visit_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visit_number IS NULL OR NEW.visit_number = '' THEN
    NEW.visit_number := 'VIS' || TO_CHAR(NOW(), 'YYYYMMDD') ||
                        LPAD(nextval('clinic_visit_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_visit_number
  BEFORE INSERT ON clinic_visits
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_visit_number();

COMMENT ON FUNCTION generate_clinic_visit_number() IS 'Auto-generates visit number: VIS + YYYYMMDD + 0001';

-- ============================================================================
-- 2. AUTO-GENERATE PRESCRIPTION NUMBER
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_clinic_prescription_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.prescription_number IS NULL OR NEW.prescription_number = '' THEN
    NEW.prescription_number := 'RX' || TO_CHAR(NOW(), 'YYYYMMDD') ||
                               LPAD(nextval('clinic_prescription_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_prescription_number
  BEFORE INSERT ON clinic_prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_prescription_number();

COMMENT ON FUNCTION generate_clinic_prescription_number() IS 'Auto-generates prescription number: RX + YYYYMMDD + 0001';

-- ============================================================================
-- 3. AUTO-GENERATE SICK LETTER NUMBER
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_clinic_sick_letter_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.letter_number IS NULL OR NEW.letter_number = '' THEN
    NEW.letter_number := 'SK' || TO_CHAR(NOW(), 'YYYYMMDD') ||
                         LPAD(nextval('clinic_sick_letter_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_sick_letter_number
  BEFORE INSERT ON clinic_sick_letters
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_sick_letter_number();

COMMENT ON FUNCTION generate_clinic_sick_letter_number() IS 'Auto-generates sick letter number: SK + YYYYMMDD + 0001';

-- ============================================================================
-- 4. AUTO-GENERATE REFERRAL NUMBER
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_clinic_referral_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_number IS NULL OR NEW.referral_number = '' THEN
    NEW.referral_number := 'REF' || TO_CHAR(NOW(), 'YYYYMMDD') ||
                           LPAD(nextval('clinic_referral_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_referral_number
  BEFORE INSERT ON clinic_referrals
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_referral_number();

COMMENT ON FUNCTION generate_clinic_referral_number() IS 'Auto-generates referral number: REF + YYYYMMDD + 0001';

-- ============================================================================
-- 5. AUTO-GENERATE RECEIVING NUMBER
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_clinic_receiving_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receiving_number IS NULL OR NEW.receiving_number = '' THEN
    NEW.receiving_number := 'RCV' || TO_CHAR(NOW(), 'YYYYMM') ||
                            LPAD(nextval('clinic_receiving_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_receiving_number
  BEFORE INSERT ON clinic_medicine_receiving
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_receiving_number();

COMMENT ON FUNCTION generate_clinic_receiving_number() IS 'Auto-generates receiving number: RCV + YYYYMM + 0001';

-- ============================================================================
-- 6. AUTO-GENERATE OPNAME NUMBER
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_clinic_opname_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opname_number IS NULL OR NEW.opname_number = '' THEN
    NEW.opname_number := 'OPN' || TO_CHAR(NEW.opname_date, 'YYYYMM') ||
                         LPAD(nextval('clinic_opname_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_opname_number
  BEFORE INSERT ON clinic_stock_opname
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_opname_number();

COMMENT ON FUNCTION generate_clinic_opname_number() IS 'Auto-generates opname number: OPN + YYYYMM + 001';

-- ============================================================================
-- 7. AUTO-GENERATE STOCK REQUEST NUMBER
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_clinic_stock_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := 'REQ' || TO_CHAR(NOW(), 'YYYYMM') ||
                          LPAD(nextval('clinic_stock_request_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_stock_request_number
  BEFORE INSERT ON clinic_stock_requests
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_stock_request_number();

COMMENT ON FUNCTION generate_clinic_stock_request_number() IS 'Auto-generates request number: REQ + YYYYMM + 0001';

-- ============================================================================
-- 8. AUTO-DEDUCT STOCK ON DISPENSING
-- ============================================================================
CREATE OR REPLACE FUNCTION deduct_medicine_stock_on_dispensing()
RETURNS TRIGGER AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  -- Check current stock
  SELECT quantity INTO v_current_stock
  FROM clinic_medicine_stock
  WHERE medicine_id = NEW.medicine_id
    AND batch_number = NEW.batch_number
    AND status = 'available';

  -- If stock not found or insufficient
  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Stock not found for medicine_id: % batch: %',
                    NEW.medicine_id, NEW.batch_number;
  END IF;

  IF v_current_stock < NEW.quantity_dispensed THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %',
                    v_current_stock, NEW.quantity_dispensed;
  END IF;

  -- Deduct stock
  UPDATE clinic_medicine_stock
  SET quantity = quantity - NEW.quantity_dispensed,
      updated_at = NOW()
  WHERE medicine_id = NEW.medicine_id
    AND batch_number = NEW.batch_number
    AND status = 'available';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_stock_on_dispensing
  AFTER INSERT ON clinic_medicine_dispensing
  FOR EACH ROW
  EXECUTE FUNCTION deduct_medicine_stock_on_dispensing();

COMMENT ON FUNCTION deduct_medicine_stock_on_dispensing() IS 'Automatically deducts stock when medicine is dispensed';

-- ============================================================================
-- 9. UPDATE PRESCRIPTION STATUS ON DISPENSING
-- ============================================================================
CREATE OR REPLACE FUNCTION update_prescription_status_on_dispensing()
RETURNS TRIGGER AS $$
DECLARE
  v_total_items INTEGER;
  v_dispensed_items INTEGER;
BEGIN
  -- Count total prescription items
  SELECT COUNT(*) INTO v_total_items
  FROM clinic_prescription_details
  WHERE prescription_id = NEW.prescription_id;

  -- Count dispensed items
  SELECT COUNT(DISTINCT prescription_detail_id) INTO v_dispensed_items
  FROM clinic_medicine_dispensing
  WHERE prescription_id = NEW.prescription_id;

  -- If all items dispensed, update prescription status
  IF v_dispensed_items >= v_total_items THEN
    UPDATE clinic_prescriptions
    SET status = 'dispensed',
        updated_at = NOW()
    WHERE id = NEW.prescription_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_prescription_status
  AFTER INSERT ON clinic_medicine_dispensing
  FOR EACH ROW
  EXECUTE FUNCTION update_prescription_status_on_dispensing();

COMMENT ON FUNCTION update_prescription_status_on_dispensing() IS 'Updates prescription status to dispensed when all items are given';

-- ============================================================================
-- 10. ADD STOCK ON RECEIVING (when posted)
-- ============================================================================
CREATE OR REPLACE FUNCTION add_stock_on_receiving_posted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'posted'
  IF NEW.status = 'posted' AND OLD.status != 'posted' THEN
    -- Insert or update stock for each receiving detail
    INSERT INTO clinic_medicine_stock (
      medicine_id,
      batch_number,
      quantity,
      expiry_date,
      receiving_id,
      status
    )
    SELECT
      medicine_id,
      batch_number,
      quantity,
      expiry_date,
      NEW.id,
      'available'
    FROM clinic_medicine_receiving_details
    WHERE receiving_id = NEW.id
    ON CONFLICT (medicine_id, batch_number)
    DO UPDATE SET
      quantity = clinic_medicine_stock.quantity + EXCLUDED.quantity,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_stock_on_receiving
  AFTER UPDATE ON clinic_medicine_receiving
  FOR EACH ROW
  WHEN (NEW.status = 'posted' AND OLD.status != 'posted')
  EXECUTE FUNCTION add_stock_on_receiving_posted();

COMMENT ON FUNCTION add_stock_on_receiving_posted() IS 'Adds stock when receiving is posted';

-- ============================================================================
-- 11. CALCULATE BMI ON MEDICAL RECORD
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_bmi_on_medical_record()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.weight IS NOT NULL AND NEW.height IS NOT NULL AND NEW.height > 0 THEN
    -- BMI = weight(kg) / (height(m) ^ 2)
    -- height in cm, so divide by 100 to get meters
    NEW.bmi := ROUND(NEW.weight / POWER(NEW.height / 100, 2), 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_bmi
  BEFORE INSERT OR UPDATE ON clinic_medical_records
  FOR EACH ROW
  WHEN (NEW.weight IS NOT NULL AND NEW.height IS NOT NULL)
  EXECUTE FUNCTION calculate_bmi_on_medical_record();

COMMENT ON FUNCTION calculate_bmi_on_medical_record() IS 'Auto-calculates BMI from weight and height';

-- ============================================================================
-- 12. CALCULATE SICK LEAVE TOTAL DAYS
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_sick_leave_days()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total days (inclusive)
  NEW.total_days := (NEW.end_date - NEW.start_date) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_sick_leave_days
  BEFORE INSERT OR UPDATE ON clinic_sick_letters
  FOR EACH ROW
  WHEN (NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL)
  EXECUTE FUNCTION calculate_sick_leave_days();

COMMENT ON FUNCTION calculate_sick_leave_days() IS 'Auto-calculates total sick leave days';

-- ============================================================================
-- 13. UPDATE VISIT STATUS ON MEDICAL RECORD COMPLETION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_visit_status_on_medical_record()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE clinic_visits
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = NEW.visit_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_visit_status
  AFTER INSERT OR UPDATE ON clinic_medical_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_visit_status_on_medical_record();

COMMENT ON FUNCTION update_visit_status_on_medical_record() IS 'Updates visit status when medical record is completed';

-- ============================================================================
-- 14. UPDATE RECEIVING TOTALS ON DETAIL CHANGES
-- ============================================================================
CREATE OR REPLACE FUNCTION update_receiving_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clinic_medicine_receiving
  SET
    total_items = (
      SELECT COUNT(*)
      FROM clinic_medicine_receiving_details
      WHERE receiving_id = COALESCE(NEW.receiving_id, OLD.receiving_id)
    ),
    total_quantity = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM clinic_medicine_receiving_details
      WHERE receiving_id = COALESCE(NEW.receiving_id, OLD.receiving_id)
    ),
    total_amount = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM clinic_medicine_receiving_details
      WHERE receiving_id = COALESCE(NEW.receiving_id, OLD.receiving_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.receiving_id, OLD.receiving_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_receiving_totals_insert
  AFTER INSERT ON clinic_medicine_receiving_details
  FOR EACH ROW
  EXECUTE FUNCTION update_receiving_totals();

CREATE TRIGGER trg_update_receiving_totals_update
  AFTER UPDATE ON clinic_medicine_receiving_details
  FOR EACH ROW
  EXECUTE FUNCTION update_receiving_totals();

CREATE TRIGGER trg_update_receiving_totals_delete
  AFTER DELETE ON clinic_medicine_receiving_details
  FOR EACH ROW
  EXECUTE FUNCTION update_receiving_totals();

COMMENT ON FUNCTION update_receiving_totals() IS 'Updates receiving totals when details change';

-- ============================================================================
-- 15. AUTO-GENERATE PATIENT CODE
-- ============================================================================
-- ⚠️ DEPRECATION NOTICE (2025-11-11):
-- This function is for clinic_patients table which has been deprecated.
-- Use 'patients' table with auto-generated 'patient_number' instead (see migration 011).
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS clinic_patient_seq START 1;

CREATE OR REPLACE FUNCTION generate_clinic_patient_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.patient_code IS NULL OR NEW.patient_code = '' THEN
    IF NEW.patient_type = 'employee' THEN
      -- Use employee_id from employees table
      SELECT employee_id INTO NEW.patient_code
      FROM employees
      WHERE id = NEW.employee_id;
    ELSE
      -- Generate code for family members
      NEW.patient_code := 'FAM' || LPAD(nextval('clinic_patient_seq')::TEXT, 6, '0');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_patient_code
  BEFORE INSERT ON clinic_patients
  FOR EACH ROW
  EXECUTE FUNCTION generate_clinic_patient_code();

COMMENT ON FUNCTION generate_clinic_patient_code() IS 'Auto-generates patient code: employee_id for employees, FAM000001 for family';

-- ============================================================================
-- END OF MIGRATION: 007_clinic_triggers.sql
-- ============================================================================
