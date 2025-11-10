-- ============================================================================
-- FIX: clinic_visits Foreign Key to patients table
-- ============================================================================
-- Migration: 012_fix_clinic_visits_fk.sql
-- Description: Fix FK constraint - clinic_visits should reference 'patients' not 'clinic_patients'
-- Issue: Registration uses 'patients' table but clinic_visits FK references 'clinic_patients'
-- Author: Sigma Development Team
-- Created: 2025-11-10
-- ============================================================================

-- Drop old foreign key constraint
ALTER TABLE clinic_visits
DROP CONSTRAINT IF EXISTS clinic_visits_patient_id_fkey;

-- Add new foreign key constraint to 'patients' table
ALTER TABLE clinic_visits
ADD CONSTRAINT clinic_visits_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

COMMENT ON CONSTRAINT clinic_visits_patient_id_fkey ON clinic_visits
IS 'FK to patients table (fixed from clinic_patients)';

-- ============================================================================
-- END OF MIGRATION: 012_fix_clinic_visits_fk.sql
-- ============================================================================
