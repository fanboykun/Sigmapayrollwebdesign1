# QUICK START GUIDE - CLINIC REGISTRATION MODULE

Panduan cepat untuk menjalankan dan testing Modul Pendaftaran Pasien Klinik.

---

## ⚡ Quick Start (5 Menit)

### Step 1: Run Database Migrations

**Via Supabase CLI:**
```bash
# Jika belum install Supabase CLI
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project (ganti dengan project-ref Anda)
supabase link --project-ref gketmjcxsnzrrzwfrxfw

# Push migrations
supabase db push
```

**Via Supabase Dashboard:**
1. Buka https://app.supabase.com
2. Pilih project: **Sigma Payroll Web Design**
3. Go to: **SQL Editor** → **New Query**
4. Copy-paste isi file migration satu per satu:
   - `010_partner_plantations.sql`
   - `011_patients.sql`
   - `012_clinic_registrations.sql` ✅ (gunakan versi fixed)
   - `013_employees_family_data.sql`
   - `014_seed_clinic_registration_data.sql` ✅ (gunakan versi fixed)
5. Execute setiap query
6. Skip `015_add_doctor_fk_constraint.sql` untuk sekarang

### Step 2: Verify Database

Jalankan query ini di SQL Editor untuk memastikan semua berhasil:

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('partner_plantations', 'patients', 'clinic_registrations')
ORDER BY table_name;

-- Expected result: 3 rows
```

### Step 3: Test UI Component

**Add route untuk ClinicRegistration:**

```typescript
// src/App.tsx atau routes file
import { ClinicRegistration } from './components/clinic'

// Add route
<Route path="/clinic/registration" element={<ClinicRegistration />} />
```

**Test the wizard:**
1. Navigate to `/clinic/registration`
2. Pilih tipe pasien "Karyawan PT. Socfindo"
3. Search karyawan (gunakan sample data dari migration 014)
4. Pilih anggota keluarga
5. Review data → Next
6. Isi keluhan → Submit
7. Cetak slip antrian

---

## 📋 Verification Checklist

### Database Layer ✅
```sql
-- 1. Check ENUM types
SELECT typname FROM pg_type
WHERE typname IN ('patient_type', 'family_relation', 'payment_method', 'visit_type', 'registration_status')
ORDER BY typname;
-- Expected: 5 rows

-- 2. Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%patient%' OR routine_name LIKE '%registration%'
ORDER BY routine_name;
-- Expected: 8+ functions

-- 3. Check views
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('v_today_queue', 'v_employee_family_overview')
ORDER BY table_name;
-- Expected: 2 rows

-- 4. Check triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('patients', 'clinic_registrations')
ORDER BY event_object_table, trigger_name;
-- Expected: 4+ triggers

-- 5. Check seed data
SELECT code, name FROM partner_plantations ORDER BY code;
-- Expected: 3 rows (Kebun Sawit Makmur, Kebun Karet Sejahtera, Kebun Kelapa Jaya)

SELECT employee_id, full_name, marital_status FROM employees
WHERE family_data IS NOT NULL
ORDER BY employee_id;
-- Expected: 5+ rows with family data
```

### UI Components ✅

**Import test:**
```typescript
import {
  ClinicRegistration,
  EmployeeSearchSelector,
  FamilyMemberSelector,
  PatientFormFields,
  QueueSlip
} from './components/clinic'

// All should import successfully
```

**Component render test:**
```typescript
function TestPage() {
  return (
    <>
      <ClinicRegistration />
      {/* Component should render without errors */}
    </>
  )
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Karyawan Sendiri Berobat
1. Pilih "Karyawan PT. Socfindo"
2. Search: "Budi" (dari seed data)
3. Pilih card "Budi Santoso" dengan badge "Karyawan"
4. Data auto-fill (NIK, nama, dll.)
5. Next → Isi keluhan: "Demam dan batuk"
6. Layanan: Konsultasi, Pembayaran: Perusahaan
7. Submit → Lihat slip dengan nomor antrian
8. ✅ **Expected:** Queue number A-001, patient type = employee

### Scenario 2: Istri Karyawan Berobat
1. Pilih "Karyawan PT. Socfindo"
2. Search: "Siti" (istri dari Budi)
3. Pilih card "Siti Rahma" dengan badge "Istri/Suami"
4. Data auto-fill termasuk info istri
5. Next → Isi keluhan
6. Submit → Lihat slip
7. ✅ **Expected:** Queue number A-002, patient type = employee_family, relation = spouse

### Scenario 3: Anak Karyawan Berobat
1. Pilih "Karyawan PT. Socfindo"
2. Search karyawan yang punya anak
3. Pilih anak dengan badge "Anak"
4. Data auto-fill
5. Submit
6. ✅ **Expected:** patient type = employee_family, relation = child

### Scenario 4: Pasien Umum
1. Pilih "Pasien Umum"
2. Skip search → langsung ke form
3. Isi semua data manual (NIK, nama, tanggal lahir, dll.)
4. Next → Isi keluhan
5. Pembayaran: Tunai
6. Submit
7. ✅ **Expected:** patient type = public, no employee linkage

### Scenario 5: Kebun Mitra
1. Pilih "Kebun Mitra"
2. Pilih kebun dari dropdown (contoh: Kebun Sawit Makmur)
3. Isi data pasien manual
4. Submit
5. ✅ **Expected:** patient type = partner, linked to partner_plantation_id

---

## 🔍 Common Issues & Solutions

### Issue 1: Migration Error "column cd.name does not exist"
**Solution:** Gunakan file `012_clinic_registrations.sql` yang sudah diperbaiki (dengan explicit NULL cast)

### Issue 2: Migration Error "operator does not exist: character varying = uuid"
**Solution:** Gunakan file `014_seed_clinic_registration_data.sql` yang sudah diperbaiki (dengan `::UUID` cast)

### Issue 3: Component Import Error
**Solution:** Pastikan semua files ada di `src/components/clinic/` dan `index.ts` sudah di-export

### Issue 4: Hook Not Found
**Solution:** Pastikan `src/hooks/index.ts` sudah export semua clinic hooks:
```typescript
export { usePartnerPlantations } from './usePartnerPlantations'
export { usePatients } from './usePatients'
export { useClinicRegistrations } from './useClinicRegistrations'
```

### Issue 5: No Employees in Search
**Solution:** Pastikan migration 014 (seed data) sudah dijalankan untuk populate employees dengan family_data

---

## 📊 Expected Results

### After Migration 010:
```sql
SELECT COUNT(*) FROM partner_plantations; -- Result: 3
```

### After Migration 011:
```sql
SELECT COUNT(*) FROM patients; -- Result: 0 (no data yet)
```

### After Migration 012:
```sql
SELECT COUNT(*) FROM clinic_registrations; -- Result: 0 (no data yet)
SELECT * FROM v_today_queue; -- Result: empty (no registrations today)
```

### After Migration 013:
```sql
SELECT COUNT(*) FROM employees WHERE family_data IS NOT NULL; -- Result: 0 (no family data yet)
```

### After Migration 014:
```sql
SELECT COUNT(*) FROM employees WHERE family_data IS NOT NULL; -- Result: 5+
SELECT * FROM v_employee_family_overview; -- Result: 5+ rows with family summary
```

### After First Registration:
```sql
SELECT * FROM patients ORDER BY created_at DESC LIMIT 1;
-- Result: 1 row with patient_number = PAT-2025-00001

SELECT * FROM clinic_registrations ORDER BY created_at DESC LIMIT 1;
-- Result: 1 row with registration_number = REG-20251106-0001, queue_number = 1, queue_display = 'A-001'

SELECT * FROM v_today_queue;
-- Result: 1 row with registration info + patient info joined
```

---

## 🎯 Success Criteria

### ✅ Database Setup Success
- [ ] All 5 migrations run without errors
- [ ] 3 tables created (partner_plantations, patients, clinic_registrations)
- [ ] 5 ENUM types created
- [ ] 8+ functions created
- [ ] 2 views created
- [ ] 4+ triggers created
- [ ] Seed data populated (3 plantations, 5+ employees with family)

### ✅ UI Integration Success
- [ ] All components import without errors
- [ ] ClinicRegistration component renders
- [ ] Can navigate through all 6 steps
- [ ] Form validation works
- [ ] Auto-fill works for employee/family
- [ ] Manual entry works for public patients
- [ ] Registration submits successfully
- [ ] Queue slip displays correctly
- [ ] Print button triggers browser print dialog

### ✅ Functional Testing Success
- [ ] Employee search returns results
- [ ] Family member selection works
- [ ] Patient number auto-generates (PAT-2025-00001)
- [ ] Registration number auto-generates (REG-20251106-0001)
- [ ] Queue number increments correctly (A-001, A-002, etc.)
- [ ] Age calculates from birth date
- [ ] Duplicate detection works (same NIK)
- [ ] Different patient types create correct records
- [ ] Payment method defaults correctly per type

---

## 📞 Need Help?

### Debug Mode

Enable debug logging in hooks:

```typescript
// In any hook
console.log('Patient created:', data)
console.log('Registration created:', regData)
console.log('Error:', error)
```

### SQL Debug

Check what's in the database:

```sql
-- See all patients
SELECT patient_number, full_name, patient_type FROM patients;

-- See all registrations today
SELECT * FROM v_today_queue;

-- See employee family data
SELECT * FROM v_employee_family_overview;
```

### Browser Console

Check for errors:
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed API calls

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - Deploy to production
   - Train staff on using the system
   - Monitor for issues

2. **If issues found:**
   - Check [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)
   - Review error messages
   - Check database logs
   - Verify Supabase connection

3. **Future enhancements:**
   - Add doctor management (migration 015)
   - Implement real QR code generation
   - Add SMS/WhatsApp notifications
   - Create queue display board
   - Build reports & analytics

---

## 📚 Reference Documents

1. **[CLINIC_REGISTRATION_CONCEPT.md](./CLINIC_REGISTRATION_CONCEPT.md)** - Detailed design & wireframes
2. **[MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)** - Error fixes & solutions
3. **[CLINIC_REGISTRATION_IMPLEMENTATION.md](./CLINIC_REGISTRATION_IMPLEMENTATION.md)** - Complete implementation summary

---

**Happy Testing! 🎉**

Jika ada pertanyaan atau menemukan bug, dokumentasikan error message lengkap untuk troubleshooting.

---

**Last Updated:** 2025-11-06
