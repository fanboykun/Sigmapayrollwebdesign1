-- ============================================
-- FIX: Alter constraint untuk clinic_medical_records.status
-- ============================================

-- 1. Drop constraint lama
ALTER TABLE clinic_medical_records
DROP CONSTRAINT IF EXISTS chk_medical_record_status;

-- 2. Buat constraint baru dengan 'saved' sebagai allowed value
ALTER TABLE clinic_medical_records
ADD CONSTRAINT chk_medical_record_status
CHECK (status IN ('pending', 'in_progress', 'saved', 'completed', 'cancelled'));

-- 3. Verifikasi constraint berhasil dibuat
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'clinic_medical_records'::regclass
  AND conname = 'chk_medical_record_status';

-- ============================================
-- ALTERNATIF: Jika ingin tetap pakai 'completed' tapi tidak trigger visit status
-- ============================================
-- Maka kita perlu cari dan disable trigger yang auto-update visit status
-- Uncomment command di bawah untuk melihat semua triggers pada table:

-- SELECT 
--     trigger_name,
--     event_manipulation,
--     action_statement
-- FROM information_schema.triggers
-- WHERE event_object_table = 'clinic_medical_records';
