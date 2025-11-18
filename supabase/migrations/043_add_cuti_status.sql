-- =====================================================
-- Migration: 043_add_cuti_status.sql
-- Description: Add 'cuti' status to attendance_records
--              Status 'cuti' (C) hanya dibuat otomatis dari approval cuti,
--              tidak bisa diinput manual
-- Author: Sigma Payroll Team
-- Date: 2025-11-18
-- =====================================================

-- Drop the existing check constraint
ALTER TABLE public.attendance_records
DROP CONSTRAINT IF EXISTS attendance_records_status_check;

-- Add new check constraint with 'cuti' status included
ALTER TABLE public.attendance_records
ADD CONSTRAINT attendance_records_status_check
CHECK (status IN ('present', 'absent', 'late', 'half-day', 'leave', 'sick', 'holiday', 'cuti'));

-- Add comment
COMMENT ON COLUMN public.attendance_records.status IS 'Attendance status: present (HK/Hadir), absent (A/Alfa), late (Terlambat), half-day (Setengah Hari), leave (P/Permisi), sick (S/Sakit), holiday (Libur), cuti (C/Cuti - auto-generated only)';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
