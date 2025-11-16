-- =====================================================
-- Migration: 036_update_attendance_status.sql
-- Description: Add 'sick' status to attendance_records
-- Author: Sigma Payroll Team
-- Date: 2025-11-16
-- =====================================================

-- Drop the existing check constraint
ALTER TABLE public.attendance_records
DROP CONSTRAINT IF EXISTS attendance_records_status_check;

-- Add new check constraint with 'sick' status included
ALTER TABLE public.attendance_records
ADD CONSTRAINT attendance_records_status_check
CHECK (status IN ('present', 'absent', 'late', 'half-day', 'leave', 'sick', 'holiday'));

-- Add comment
COMMENT ON COLUMN public.attendance_records.status IS 'Attendance status: present (HK), absent (A), late, half-day, leave (P), sick (S), holiday';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
