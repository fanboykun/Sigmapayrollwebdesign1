-- ============================================================================
-- FIX: clinic_medical_records Foreign Key to patients table
-- ============================================================================
-- Migration: 013_fix_clinic_medical_records_fk.sql
-- Description: Fix FK constraint - clinic_medical_records should reference 'patients' not 'clinic_patients'
-- Author: Sigma Development Team
-- Created: 2025-11-10
-- ============================================================================

-- Drop old foreign key constraint
ALTER TABLE clinic_medical_records
DROP CONSTRAINT IF EXISTS clinic_medical_records_patient_id_fkey;

-- Add new foreign key constraint to 'patients' table
ALTER TABLE clinic_medical_records
ADD CONSTRAINT clinic_medical_records_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

COMMENT ON CONSTRAINT clinic_medical_records_patient_id_fkey ON clinic_medical_records
IS 'FK to patients table (fixed from clinic_patients)';

-- ============================================================================
-- END OF MIGRATION: 013_fix_clinic_medical_records_fk.sql
-- ============================================================================
