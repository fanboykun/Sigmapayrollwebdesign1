-- ============================================================================
-- ADD DOCTOR FK CONSTRAINT (Run after clinic_doctors table is created)
-- ============================================================================
-- Version: 1.0.0
-- Description: Menambahkan foreign key constraint untuk doctor_id
--              di clinic_registrations setelah tabel clinic_doctors dibuat
-- Date: 2025-11-06
-- ============================================================================

-- This migration should be run AFTER clinic_doctors table is created
-- For now, we'll create a placeholder comment

-- Uncomment and run this when clinic_doctors table exists:
/*
ALTER TABLE clinic_registrations
ADD CONSTRAINT fk_clinic_registrations_doctor
FOREIGN KEY (doctor_id)
REFERENCES clinic_doctors(id)
ON DELETE SET NULL;
*/

-- Update view to include doctor name when clinic_doctors exists:
/*
CREATE OR REPLACE VIEW v_today_queue AS
SELECT
    cr.id,
    cr.registration_number,
    cr.queue_number,
    cr.queue_display,
    cr.registration_time,
    cr.service_type,
    cr.status,
    cr.estimated_wait_time,

    -- Patient info
    p.patient_number,
    p.full_name AS patient_name,
    p.patient_type,
    p.age,
    p.gender,

    -- Doctor info
    cd.name AS doctor_name,

    -- Registered by
    u.full_name AS registered_by_name,

    -- Timestamps
    cr.called_at,
    cr.started_at,
    cr.completed_at
FROM clinic_registrations cr
JOIN patients p ON cr.patient_id = p.id
LEFT JOIN clinic_doctors cd ON cr.doctor_id = cd.id
LEFT JOIN users u ON cr.registered_by = u.id
WHERE cr.registration_date = CURRENT_DATE
ORDER BY cr.queue_number;
*/

COMMENT ON TABLE clinic_registrations IS 'Note: FK constraint for doctor_id will be added after clinic_doctors table is created';
