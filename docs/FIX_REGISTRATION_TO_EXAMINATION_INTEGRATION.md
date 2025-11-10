# Fix: Registration to Examination Integration

## Problem

Setelah input data pada **Pendaftaran Pasien**, data tidak muncul di **Pemeriksaan Diagnosa**. Antrian pasien tidak terlihat oleh dokter.

## Root Cause Analysis

### 1. Registration Flow (Before Fix)
```
User Input → Create Patient → Create Registration → ❌ STOP
```

**Result**: Data hanya tersimpan di table `clinic_registrations`

### 2. Medical Examination Query
```sql
SELECT * FROM clinic_visits
WHERE visit_date = TODAY
AND status IN ('waiting', 'in_progress')
```

**Problem**: Query mencari di table `clinic_visits`, tapi data hanya ada di `clinic_registrations`!

### 3. Database State (Before Fix)
```
✅ clinic_registrations: 5 records
❌ clinic_visits: 0 records (EMPTY!)
```

## Solution

### Flow After Fix
```
User Input → Create Patient → Create Registration → ✅ Create Visit → Success!
```

### Code Changes

**File**: `src/components/clinic/ClinicRegistration.tsx`

#### 1. Add Import
```typescript
import { supabase } from '../../lib/supabaseClient'
```

#### 2. Add Visit Creation After Registration (line 390-443)
```typescript
// Step 3: Create clinic_visits record for Medical Examination
// Generate visit number
const today = new Date()
const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

// Get last visit number for today
const { data: lastVisit } = await supabase
  .from('clinic_visits')
  .select('visit_number')
  .like('visit_number', `VISIT-${dateStr}%`)
  .order('visit_number', { ascending: false })
  .limit(1)
  .single()

let sequence = 1
if (lastVisit) {
  const lastSeq = parseInt(lastVisit.visit_number.split('-')[2])
  sequence = lastSeq + 1
}

const visitNumber = `VISIT-${dateStr}-${sequence.toString().padStart(4, '0')}`

// Map visit_type: new → general, follow_up → follow_up, etc
let mappedVisitType = 'general'
if (registrationFormData.visit_type === 'follow_up') {
  mappedVisitType = 'follow_up'
} else if (registrationFormData.service_type === 'emergency') {
  mappedVisitType = 'emergency'
} else if (registrationFormData.service_type === 'medical_checkup') {
  mappedVisitType = 'mcu'
}

const visit = {
  visit_number: visitNumber,
  patient_id: patientId,
  visit_date: today.toISOString().split('T')[0],
  visit_time: today.toTimeString().split(' ')[0],
  queue_number: regData.queue_number,
  chief_complaint: registrationFormData.complaint!,
  visit_type: mappedVisitType,
  status: 'waiting',
  registered_by: user?.id,
  notes: registrationFormData.notes || null,
}

const { error: visitError } = await supabase
  .from('clinic_visits')
  .insert(visit)

if (visitError) {
  console.error('Error creating visit:', visitError)
  // Don't throw error, just log it - registration already created
}
```

## Field Mapping

### Registration → Visit

| Registration Field | Visit Field | Transformation |
|-------------------|-------------|----------------|
| patient_id | patient_id | Direct copy |
| queue_number | queue_number | Direct copy |
| complaint | chief_complaint | Direct copy |
| notes | notes | Direct copy |
| registered_by | registered_by | Direct copy |
| - | visit_number | **Generated**: VISIT-YYYYMMDD-XXXX |
| - | visit_date | **Auto**: Current date |
| - | visit_time | **Auto**: Current time |
| visit_type | visit_type | **Mapped**: see below |
| - | status | **Fixed**: 'waiting' |

### Visit Type Mapping

| Input | Output visit_type |
|-------|-------------------|
| visit_type = 'follow_up' | 'follow_up' |
| service_type = 'emergency' | 'emergency' |
| service_type = 'medical_checkup' | 'mcu' |
| default (consultation) | 'general' |

## Visit Number Generation

Format: `VISIT-YYYYMMDD-XXXX`

Example:
- `VISIT-20251110-0001` (First visit on Nov 10, 2025)
- `VISIT-20251110-0002` (Second visit)
- `VISIT-20251110-0003` (Third visit)

**Logic**:
1. Get date string: `20251110`
2. Query last visit number for today
3. Extract sequence number from last visit
4. Increment sequence by 1
5. Pad with zeros to 4 digits

## Testing

### Before Fix
```bash
# Register patient via Pendaftaran Pasien
# Open Pemeriksaan Diagnosa
❌ Result: No visits shown (empty list)
```

### After Fix
```bash
# Register patient via Pendaftaran Pasien
# Open Pemeriksaan Diagnosa
✅ Result: Visit appears in waiting list with:
   - Visit number (VISIT-20251110-0001)
   - Patient name and code
   - Chief complaint
   - Queue number
   - Status: waiting
```

### Verification Query
```sql
-- Check if visit was created
SELECT v.visit_number, v.chief_complaint, v.status,
       p.full_name, p.patient_code
FROM clinic_visits v
JOIN clinic_patients p ON v.patient_id = p.id
WHERE v.visit_date = CURRENT_DATE
ORDER BY v.queue_number;
```

## Impact

### ✅ Fixed
- ✅ Patients registered via Pendaftaran Pasien now appear in Pemeriksaan Diagnosa
- ✅ Doctors can see waiting patients immediately
- ✅ Queue system works end-to-end
- ✅ Visit number generated automatically
- ✅ Proper status tracking ('waiting' → 'in_progress' → 'completed')

### 📊 Data Consistency
- Registration record in `clinic_registrations`
- Visit record in `clinic_visits`
- Both linked by `patient_id` and `queue_number`

### 🔄 Workflow Now Complete
```
Step 1: Pendaftaran Pasien
  └─> Create patient (if new)
  └─> Create registration (queue, payment info)
  └─> Create visit (for medical examination)
  └─> Print queue slip

Step 2: Pemeriksaan Diagnosa
  └─> Doctor sees visit in waiting list ✅
  └─> Select patient
  └─> Input vital signs
  └─> Input diagnosis
  └─> Create treatment plan
  └─> Create prescription (optional)

Step 3: Penyerahan Obat
  └─> See pending prescriptions ✅
  └─> Select batch
  └─> Dispense medicine
  └─> Update stock
```

## Migration Note

**⚠️ Existing Data**:

Patients registered BEFORE this fix won't appear in Medical Examination because they don't have visit records.

**Options**:
1. Re-register them (recommended for few patients)
2. Manual backfill (if many patients):

```sql
-- Backfill visits for existing registrations
INSERT INTO clinic_visits (
  visit_number, patient_id, visit_date, visit_time,
  queue_number, chief_complaint, visit_type, status, registered_by
)
SELECT
  'VISIT-' || TO_CHAR(registration_date, 'YYYYMMDD') || '-' ||
    LPAD(ROW_NUMBER() OVER (PARTITION BY registration_date ORDER BY queue_number)::TEXT, 4, '0'),
  patient_id,
  registration_date,
  registration_time::TIME,
  queue_number,
  chief_complaint,
  CASE
    WHEN service_type = 'emergency' THEN 'emergency'
    WHEN service_type = 'medical_checkup' THEN 'mcu'
    WHEN visit_type = 'follow_up' THEN 'follow_up'
    ELSE 'general'
  END,
  'waiting',
  registered_by
FROM clinic_registrations
WHERE registration_date >= '2025-11-10'
  AND status = 'registered'
  AND patient_id NOT IN (SELECT patient_id FROM clinic_visits);
```

## Files Modified

- ✅ `src/components/clinic/ClinicRegistration.tsx`
  - Added supabase import
  - Added visit creation logic (lines 390-443)

## Build Status

```bash
✅ TypeScript: No errors
✅ Build: Success
✅ File size: 1,986.27 kB (within acceptable range)
```

## Related Documentation

- [CLINIC_REGISTRATION_CONCEPT.md](CLINIC_REGISTRATION_CONCEPT.md)
- [CLINIC_PRESCRIPTION_GUIDE.md](CLINIC_PRESCRIPTION_GUIDE.md)
- [CLINIC_DISPENSING_GUIDE.md](CLINIC_DISPENSING_GUIDE.md)

---

**Fixed**: 2025-11-10
**Author**: Sigma Development Team
**Issue**: Antrian tidak muncul di Pemeriksaan Diagnosa
**Status**: ✅ Resolved
