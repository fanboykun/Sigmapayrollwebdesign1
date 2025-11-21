-- =====================================================
-- Migration: 044_sick_letter_attendance_function.sql
-- Description: RPC function to create sick letters with attendance (skip Sundays and holidays)
-- Author: Sigma Payroll Team
-- Date: 2025-11-19
-- =====================================================

-- Drop all existing versions of these functions
DROP FUNCTION IF EXISTS create_sick_letter_with_attendance CASCADE;
DROP FUNCTION IF EXISTS delete_sick_letter_and_restore_attendance CASCADE;
DROP FUNCTION IF EXISTS update_sick_letter_dates CASCADE;

-- Create function to create sick letter and attendance records
-- This function will skip Sundays and national holidays
CREATE OR REPLACE FUNCTION create_sick_letter_with_attendance(
  p_medical_record_id UUID,
  p_patient_id UUID,
  p_employee_id UUID,
  p_doctor_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_total_days INTEGER,
  p_diagnosis TEXT,
  p_rest_recommendation TEXT,
  p_diagnosis_code VARCHAR DEFAULT NULL,
  p_treatment_summary TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  sick_letter_id UUID,
  letter_number VARCHAR,
  attendance_created INTEGER,
  attendance_updated INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_sick_letter_id UUID;
  v_letter_number VARCHAR;
  v_current_date DATE;
  v_day_of_week INTEGER;
  v_is_holiday BOOLEAN;
  v_attendance_created INTEGER := 0;
  v_attendance_updated INTEGER := 0;
  v_existing_attendance UUID;
BEGIN
  -- Generate letter number: SKL-YYYY-MM-NNNN
  SELECT 'SKL-' || TO_CHAR(NOW(), 'YYYY-MM') || '-' ||
         LPAD((COALESCE(MAX(SUBSTRING(letter_number FROM 13)::INTEGER), 0) + 1)::TEXT, 4, '0')
  INTO v_letter_number
  FROM clinic_sick_letters
  WHERE letter_number LIKE 'SKL-' || TO_CHAR(NOW(), 'YYYY-MM') || '-%';

  -- Insert sick letter
  INSERT INTO clinic_sick_letters (
    letter_number,
    medical_record_id,
    patient_id,
    employee_id,
    doctor_id,
    start_date,
    end_date,
    total_days,
    diagnosis,
    diagnosis_code,
    treatment_summary,
    rest_recommendation,
    notes,
    status,
    is_attendance_created
  ) VALUES (
    v_letter_number,
    p_medical_record_id,
    p_patient_id,
    p_employee_id,
    p_doctor_id,
    p_start_date,
    p_end_date,
    p_total_days,
    p_diagnosis,
    p_diagnosis_code,
    p_treatment_summary,
    p_rest_recommendation,
    p_notes,
    'active',
    TRUE
  )
  RETURNING id INTO v_sick_letter_id;

  -- Create attendance records for each date in the range
  -- Skip Sundays (day_of_week = 0) and national holidays
  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    -- Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    v_day_of_week := EXTRACT(DOW FROM v_current_date);

    -- Check if date is a holiday
    SELECT EXISTS (
      SELECT 1 FROM holidays
      WHERE date = v_current_date
    ) INTO v_is_holiday;

    -- Only create attendance if NOT Sunday AND NOT holiday
    IF v_day_of_week != 0 AND v_is_holiday = FALSE THEN
      -- Check if attendance already exists for this date
      SELECT id INTO v_existing_attendance
      FROM attendance_records
      WHERE employee_id = p_employee_id
      AND date = v_current_date;

      IF v_existing_attendance IS NOT NULL THEN
        -- Update existing attendance
        UPDATE attendance_records
        SET
          status = 'sick',
          notes = 'Sakit - Surat: ' || v_letter_number || ' - ' || p_diagnosis,
          updated_at = NOW()
        WHERE id = v_existing_attendance;

        v_attendance_updated := v_attendance_updated + 1;
      ELSE
        -- Insert new attendance record
        INSERT INTO attendance_records (
          employee_id,
          date,
          status,
          notes,
          created_at,
          updated_at
        ) VALUES (
          p_employee_id,
          v_current_date,
          'sick',
          'Sakit - Surat: ' || v_letter_number || ' - ' || p_diagnosis,
          NOW(),
          NOW()
        );

        v_attendance_created := v_attendance_created + 1;
      END IF;
    END IF;

    -- Move to next date
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  -- Return results
  RETURN QUERY SELECT
    v_sick_letter_id,
    v_letter_number,
    v_attendance_created,
    v_attendance_updated;
END;
$$;

-- Add comment
COMMENT ON FUNCTION create_sick_letter_with_attendance IS 'Create sick letter and generate attendance records, skipping Sundays and holidays';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_sick_letter_with_attendance TO authenticated;

-- =====================================================
-- Function to delete sick letter and restore attendance
-- =====================================================

CREATE OR REPLACE FUNCTION delete_sick_letter_and_restore_attendance(
  p_sick_letter_id UUID
)
RETURNS TABLE (
  attendance_deleted INTEGER,
  attendance_restored INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_letter_number VARCHAR;
  v_employee_id UUID;
  v_start_date DATE;
  v_end_date DATE;
  v_current_date DATE;
  v_day_of_week INTEGER;
  v_is_holiday BOOLEAN;
  v_attendance_deleted INTEGER := 0;
  v_attendance_restored INTEGER := 0;
  v_existing_attendance UUID;
BEGIN
  -- Get sick letter details
  SELECT letter_number, employee_id, start_date, end_date
  INTO v_letter_number, v_employee_id, v_start_date, v_end_date
  FROM clinic_sick_letters
  WHERE id = p_sick_letter_id;

  IF v_letter_number IS NULL THEN
    RAISE EXCEPTION 'Sick letter not found';
  END IF;

  -- Delete attendance records created by this sick letter
  -- We identify them by the notes containing the letter number
  v_current_date := v_start_date;

  WHILE v_current_date <= v_end_date LOOP
    -- Get day of week
    v_day_of_week := EXTRACT(DOW FROM v_current_date);

    -- Check if date is a holiday
    SELECT EXISTS (
      SELECT 1 FROM holidays
      WHERE date = v_current_date
    ) INTO v_is_holiday;

    -- Only process if NOT Sunday AND NOT holiday
    IF v_day_of_week != 0 AND v_is_holiday = FALSE THEN
      -- Update attendance with status 'sick' to 'present' for this employee and date
      UPDATE attendance_records
      SET
        status = 'present',
        notes = 'Dikembalikan dari surat sakit (dihapus)',
        updated_at = NOW()
      WHERE employee_id = v_employee_id
      AND date = v_current_date
      AND status = 'sick';

      -- Check if any row was updated
      IF FOUND THEN
        v_attendance_restored := v_attendance_restored + 1;
      END IF;
    END IF;

    -- Move to next date
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  -- Delete the sick letter
  DELETE FROM clinic_sick_letters WHERE id = p_sick_letter_id;

  -- Return results
  RETURN QUERY SELECT
    v_attendance_deleted,
    v_attendance_restored;
END;
$$;

COMMENT ON FUNCTION delete_sick_letter_and_restore_attendance IS 'Delete sick letter and restore attendance records to present status';
GRANT EXECUTE ON FUNCTION delete_sick_letter_and_restore_attendance TO authenticated;

-- =====================================================
-- Function to update sick letter dates and adjust attendance
-- =====================================================

CREATE OR REPLACE FUNCTION update_sick_letter_dates(
  p_sick_letter_id UUID,
  p_new_start_date DATE,
  p_new_end_date DATE,
  p_diagnosis TEXT
)
RETURNS TABLE (
  attendance_removed INTEGER,
  attendance_added INTEGER,
  attendance_updated INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_letter_number VARCHAR;
  v_employee_id UUID;
  v_old_start_date DATE;
  v_old_end_date DATE;
  v_current_date DATE;
  v_day_of_week INTEGER;
  v_is_holiday BOOLEAN;
  v_attendance_removed INTEGER := 0;
  v_attendance_added INTEGER := 0;
  v_attendance_updated INTEGER := 0;
  v_existing_attendance UUID;
  v_new_total_days INTEGER;
BEGIN
  -- Get sick letter details
  SELECT letter_number, employee_id, start_date, end_date
  INTO v_letter_number, v_employee_id, v_old_start_date, v_old_end_date
  FROM clinic_sick_letters
  WHERE id = p_sick_letter_id;

  IF v_letter_number IS NULL THEN
    RAISE EXCEPTION 'Sick letter not found';
  END IF;

  -- Calculate new total days
  v_new_total_days := p_new_end_date - p_new_start_date + 1;

  -- Step 1: Remove attendance records that are no longer in the new range
  v_current_date := v_old_start_date;

  WHILE v_current_date <= v_old_end_date LOOP
    -- Skip if date is now outside the new range
    IF v_current_date < p_new_start_date OR v_current_date > p_new_end_date THEN
      v_day_of_week := EXTRACT(DOW FROM v_current_date);

      SELECT EXISTS (
        SELECT 1 FROM holidays WHERE date = v_current_date
      ) INTO v_is_holiday;

      IF v_day_of_week != 0 AND v_is_holiday = FALSE THEN
        -- Restore to present status
        UPDATE attendance_records
        SET
          status = 'present',
          notes = 'Dikembalikan dari surat sakit (tanggal diubah)',
          updated_at = NOW()
        WHERE employee_id = v_employee_id
        AND date = v_current_date
        AND status = 'sick';

        IF FOUND THEN
          v_attendance_removed := v_attendance_removed + 1;
        END IF;
      END IF;
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  -- Step 2: Add attendance records for new dates
  v_current_date := p_new_start_date;

  WHILE v_current_date <= p_new_end_date LOOP
    v_day_of_week := EXTRACT(DOW FROM v_current_date);

    SELECT EXISTS (
      SELECT 1 FROM holidays WHERE date = v_current_date AND is_active = TRUE
    ) INTO v_is_holiday;

    IF v_day_of_week != 0 AND v_is_holiday = FALSE THEN
      SELECT id INTO v_existing_attendance
      FROM attendance_records
      WHERE employee_id = v_employee_id
      AND date = v_current_date;

      IF v_existing_attendance IS NOT NULL THEN
        UPDATE attendance_records
        SET
          status = 'sick',
          notes = 'Sakit - Surat: ' || v_letter_number || ' - ' || p_diagnosis,
          updated_at = NOW()
        WHERE id = v_existing_attendance;

        v_attendance_updated := v_attendance_updated + 1;
      ELSE
        INSERT INTO attendance_records (
          employee_id,
          date,
          status,
          notes,
          created_at,
          updated_at
        ) VALUES (
          v_employee_id,
          v_current_date,
          'sick',
          'Sakit - Surat: ' || v_letter_number || ' - ' || p_diagnosis,
          NOW(),
          NOW()
        );

        v_attendance_added := v_attendance_added + 1;
      END IF;
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  -- Step 3: Update sick letter
  UPDATE clinic_sick_letters
  SET
    start_date = p_new_start_date,
    end_date = p_new_end_date,
    total_days = v_new_total_days,
    diagnosis = p_diagnosis,
    updated_at = NOW()
  WHERE id = p_sick_letter_id;

  -- Return results
  RETURN QUERY SELECT
    v_attendance_removed,
    v_attendance_added,
    v_attendance_updated;
END;
$$;

COMMENT ON FUNCTION update_sick_letter_dates IS 'Update sick letter dates and adjust attendance records accordingly';
GRANT EXECUTE ON FUNCTION update_sick_letter_dates TO authenticated;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

