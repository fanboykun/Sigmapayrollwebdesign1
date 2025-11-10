# Migration: patient_code → patient_number

## Overview

Perubahan dari kolom `patient_code` di tabel `clinic_patients` ke kolom `patient_number` di tabel `patients`.

**Date**: 2025-11-11
**Impact**: Medium (Code changes required)
**Status**: ✅ Completed

---

## Background

### Original Architecture (Before Migration 011)
- **Table**: `clinic_patients`
- **Patient ID Column**: `patient_code` (VARCHAR 50)
- **Scope**: Clinic module only
- **Patient Types**: Employee, Family only

### New Architecture (After Migration 011)
- **Table**: `patients` (unified)
- **Patient ID Column**: `patient_number` (VARCHAR 20)
- **Scope**: All modules (clinic, general patients, partner plantations)
- **Patient Types**: Employee, Employee Family, Partner, Partner Family, Public

---

## Database Changes

### Migration Sequence

1. **Migration 005**: Created `clinic_patients` with `patient_code`
2. **Migration 011**: Created unified `patients` table with `patient_number`
3. **Migration 012**: Updated `clinic_visits` FK to reference `patients`
4. **Migration 013**: Updated `clinic_medical_records` FK to reference `patients`

### Foreign Key Changes

| Table | Old FK | New FK |
|-------|--------|--------|
| `clinic_visits` | `clinic_patients.id` | `patients.id` |
| `clinic_medical_records` | `clinic_patients.id` | `patients.id` |
| `clinic_prescriptions` | (via medical_records) | (via medical_records) |

### Column Comparison

| Aspect | clinic_patients.patient_code | patients.patient_number |
|--------|------------------------------|-------------------------|
| Format | No fixed format | PAT-YYYY-NNNNN |
| Example | FAM000001, EMP-AL-0001 | PAT-2025-00001 |
| Length | VARCHAR(50) | VARCHAR(20) |
| Generation | Manual/trigger | Auto (function) |
| Uniqueness | Per table | Global (all patients) |

---

## Code Changes

### TypeScript Interfaces

**Before**:
```typescript
interface Patient {
  id: string
  patient_code: string  // ❌ Old
  full_name: string
  // ...
}
```

**After**:
```typescript
interface Patient {
  id: string
  patient_number: string  // ✅ New
  full_name: string
  // ...
}
```

### Supabase Queries

**Before**:
```typescript
const { data } = await supabase
  .from('clinic_prescriptions')
  .select(`
    *,
    medical_record:clinic_medical_records!inner(
      patient:patients!inner(
        patient_code,  // ❌ Error: column does not exist
        full_name
      )
    )
  `)
```

**After**:
```typescript
const { data } = await supabase
  .from('clinic_prescriptions')
  .select(`
    *,
    medical_record:clinic_medical_records!inner(
      patient:patients!inner(
        patient_number,  // ✅ Correct
        full_name
      )
    )
  `)
```

### SQL Queries

**Before**:
```sql
SELECT v.*, p.patient_code, p.full_name
FROM clinic_visits v
JOIN clinic_patients p ON v.patient_id = p.id  -- ❌ Wrong table
```

**After**:
```sql
SELECT v.*, p.patient_number, p.full_name
FROM clinic_visits v
JOIN patients p ON v.patient_id = p.id  -- ✅ Correct
```

---

## Files Modified

### Components Updated

1. **src/components/ClinicPrescription.tsx**
   - ✅ Interface: `patient_code` → `patient_number`
   - ✅ Query: `loadPrescriptions()`
   - ✅ Query: `loadMedicalRecordsWithoutPrescription()`
   - ✅ Display: All patient code references
   - Lines: 86, 126, 218, 289, 518, 688, 760, 1037

2. **src/components/ClinicDispensing.tsx**
   - ✅ Interface: `patient_code` → `patient_number`
   - ✅ Query: `loadPrescriptions()`
   - ✅ Query: `loadDispensingHistory()` - Fixed `users.name` → `users.full_name`
   - ✅ Display: All patient code references
   - ✅ Data processing: `dispensed_by_user.name` → `dispensed_by_user.full_name`
   - Lines: 84, 191, 455, 475, 506, 647, 788

3. **src/components/clinic/MedicalExamination.tsx**
   - ✅ Interface: `patient_code` → `patient_number`
   - Line: 87

4. **src/components/clinic/PatientFormFields.tsx**
   - ✅ Removed: `medical_history` field (column doesn't exist in database)
   - ✅ Replaced with: `notes` field for general notes including medical history
   - Lines: 300-311

5. **src/hooks/usePatients.ts**
   - ✅ Added data sanitization in `addPatient()` for allergies field
   - ✅ Added data sanitization in `updatePatient()` for allergies field
   - ✅ Convert empty string to `null`, non-empty string to array
   - Lines: 186-193, 225-233

### Documentation Updated

1. **docs/FIX_REGISTRATION_TO_EXAMINATION_INTEGRATION.md**
   - ✅ SQL query: `clinic_patients` → `patients`
   - ✅ Column: `patient_code` → `patient_number`
   - Lines: 171-173

### Migration SQL Updated

1. **supabase/migrations/005_clinic_operational.sql**
   - ✅ Added deprecation notice for `clinic_patients` table

2. **supabase/migrations/007_clinic_triggers.sql**
   - ✅ Added deprecation notice for `generate_clinic_patient_code()` function

3. **supabase/migrations/008_clinic_hr_integration.sql**
   - ✅ Added deprecation notice for `v_clinic_patients_with_employee` view

---

## Errors Fixed

### Error 1: patient_code does not exist

**Original Error**:
```
Error: column patients_2.patient_code does not exist
Hint: Perhaps you meant to reference the column "patients_2.patient_type"
```

**Root Cause**:
- Code was querying `patient_code` from `patients` table
- But `patients` table uses `patient_number` column instead
- FK was already updated to `patients` table (migration 012/013)
- Column name was not updated in component queries

**Solution**:
- Updated all queries to use `patient_number` instead of `patient_code`
- Updated TypeScript interfaces
- Updated display code

### Error 2: users.name does not exist

**Original Error**:
```
Error: column users_1.name does not exist
```

**Root Cause**:
- Code was querying `name` from `users` table
- But `users` table uses `full_name` column instead
- Found in ClinicDispensing.tsx history query

**Solution**:
- Updated query to use `full_name` instead of `name`
- Updated data processing to use `full_name`

### Error 3: medical_history column does not exist

**Original Error**:
```
Error: Could not find the 'medical_history' column of 'patients' in the schema cache
```

**Root Cause**:
- Form field `medical_history` was being used in PatientFormFields.tsx
- But `patients` table does not have `medical_history` column
- The table has `notes` column for general notes

**Solution**:
- Replaced `medical_history` field with `notes` field in PatientFormFields.tsx
- Updated label to "Catatan Tambahan" with placeholder mentioning medical history
- Users can now input medical history in the notes field

### Error 4: malformed array literal

**Original Error**:
```
Error: malformed array literal: ""
```

**Root Cause**:
- `allergies` column in `patients` table is `TEXT[]` (array type)
- Form was sending empty string `""` instead of `null` or valid array
- PostgreSQL cannot parse empty string as array literal

**Solution**:
- Added data sanitization in `usePatients.ts` hook:
  - `addPatient()` function: Convert empty string to `null`, non-empty string to `[string]`
  - `updatePatient()` function: Same sanitization logic
- Empty allergies field now properly sent as `null` to database
- Non-empty allergies converted to single-element array

---

## Testing Verification

### Database Query Test
```sql
-- ✅ This should work now
SELECT p.*,
       m.id as medical_record_id,
       m.examination_date,
       pt.patient_number,  -- ✅ Correct column
       pt.full_name
FROM clinic_prescriptions p
INNER JOIN clinic_medical_records m ON p.medical_record_id = m.id
INNER JOIN patients pt ON m.patient_id = pt.id  -- ✅ Correct table
LIMIT 1;
```

### Component Test
1. ✅ Open "Resep Obat" menu
2. ✅ No error "column patient_code does not exist"
3. ✅ Data loads successfully (if data exists)
4. ✅ Patient number displays correctly (PAT-2025-XXXXX format)

---

## Deprecation Notes

### Deprecated (Keep for backward compatibility)
- ❌ `clinic_patients` table
- ❌ `patient_code` column
- ❌ `generate_clinic_patient_code()` function
- ❌ `v_clinic_patients_with_employee` view

### Current (Use for all new code)
- ✅ `patients` table
- ✅ `patient_number` column
- ✅ `generate_patient_number()` function (migration 011)

### Migration Path for Old Data
If you have existing data in `clinic_patients`:

```sql
-- Option 1: Migrate existing patients to new table
INSERT INTO patients (
  patient_type, nik, full_name, birth_date, gender,
  employee_id, family_relation, phone, address,
  blood_type, bpjs_health_number, is_active
)
SELECT
  CASE
    WHEN patient_type = 'employee' THEN 'employee'::patient_type
    WHEN patient_type = 'family' THEN 'employee_family'::patient_type
  END,
  nik, full_name, birth_date, gender,
  employee_id,
  CASE
    WHEN patient_type = 'employee' THEN 'self'::family_relation
    ELSE 'child'::family_relation  -- Adjust as needed
  END,
  phone, address, blood_type, bpjs_number, is_active
FROM clinic_patients
WHERE is_active = true
ON CONFLICT DO NOTHING;

-- Option 2: Update foreign keys if needed
-- (Run after migration 012/013 if you have existing visit/medical records)
UPDATE clinic_visits v
SET patient_id = (
  SELECT p.id FROM patients p
  WHERE p.nik = (SELECT nik FROM clinic_patients WHERE id = v.patient_id)
  LIMIT 1
)
WHERE patient_id IN (SELECT id FROM clinic_patients);
```

---

## Best Practices Going Forward

### ✅ DO
- Use `patients` table for all patient queries
- Use `patient_number` as the patient identifier
- Reference `patients.id` in foreign keys
- Query with JOIN to `patients` table

### ❌ DON'T
- Don't use `clinic_patients` table for new features
- Don't reference `patient_code` column
- Don't create new FKs to `clinic_patients`
- Don't use old `generate_clinic_patient_code()` function

### Example Query Pattern
```typescript
// ✅ Correct pattern
const { data } = await supabase
  .from('clinic_visits')
  .select(`
    *,
    patient:patients!inner(
      patient_number,
      full_name,
      gender,
      birth_date
    )
  `)
```

---

## Related Migrations

- **011_patients.sql**: Creates unified patients table
- **012_fix_clinic_visits_fk.sql**: Updates visits FK
- **013_fix_clinic_medical_records_fk.sql**: Updates medical records FK

## Related Documentation

- [CLINIC_REGISTRATION_CONCEPT.md](CLINIC_REGISTRATION_CONCEPT.md)
- [FIX_REGISTRATION_TO_EXAMINATION_INTEGRATION.md](FIX_REGISTRATION_TO_EXAMINATION_INTEGRATION.md)

---

**Last Updated**: 2025-11-11
**Author**: Sigma Development Team
**Status**: ✅ Resolved
