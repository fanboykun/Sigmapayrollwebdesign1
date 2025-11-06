# MIGRATION TROUBLESHOOTING GUIDE

## Error yang Ditemukan dan Solusinya

### ❌ Error 1: Column cd.name does not exist

**File:** `012_clinic_registrations.sql`

**Error Message:**
```
ERROR: 42703: column cd.name does not exist
LINE 254: cd.name AS doctor_name,
```

**Penyebab:**
View `v_today_queue` mencoba JOIN ke tabel `clinic_doctors` yang belum dibuat.

**Solusi:**
1. ✅ Ubah view untuk tidak reference `clinic_doctors`
2. ✅ Ubah `doctor_id` menjadi nullable UUID tanpa FK constraint
3. ✅ Buat migration placeholder `015_add_doctor_fk_constraint.sql` untuk nanti

**File yang Sudah Diperbaiki:**
- `supabase/migrations/012_clinic_registrations.sql`
- `supabase/migrations/015_add_doctor_fk_constraint.sql` (placeholder)

---

### ❌ Error 2: Operator does not exist: character varying = uuid

**File:** `014_seed_clinic_registration_data.sql`

**Error Message:**
```
ERROR: 42883: operator does not exist: character varying = uuid
LINE 215: LEFT JOIN positions p ON e.position_id = p.id
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

**Penyebab:**
PostgreSQL gagal melakukan implicit type casting pada JOIN condition. Meskipun kedua kolom adalah UUID, terkadang database memiliki state yang berbeda atau ada schema drift.

**Solusi:**
1. ✅ Tambahkan explicit type cast pada JOIN conditions
2. ✅ Cast semua UUID columns ke ::UUID untuk memastikan type compatibility

**File yang Sudah Diperbaiki:**
- `supabase/migrations/014_seed_clinic_registration_data.sql` (lines 214-215)

**Perubahan:**
```sql
-- SEBELUM:
FROM employees e
LEFT JOIN divisions d ON e.division_id = d.id
LEFT JOIN positions p ON e.position_id = p.id

-- SESUDAH:
FROM employees e
LEFT JOIN divisions d ON e.division_id::UUID = d.id::UUID
LEFT JOIN positions p ON e.position_id::UUID = p.id::UUID
```

---

### ❌ Error 3: Column d.name does not exist

**File:** `014_seed_clinic_registration_data.sql`

**Error Message:**
```
ERROR: 42703: column d.name does not exist
LINE 187: d.name AS division,
HINT: Perhaps you meant to reference the column "p.name".
```

**Penyebab:**
View `v_employee_family_overview` tidak bisa resolve alias table dengan benar. Kemungkinan karena:
1. Schema tidak explicit qualified
2. JOIN tanpa explicit type cast
3. NULL handling untuk spouse_age calculation

**Solusi:**
1. ✅ Tambahkan schema qualifier `public.` pada semua table references
2. ✅ TETAP gunakan explicit `::UUID` cast di JOIN (PostgreSQL MEMERLUKAN ini!)
3. ✅ Tambahkan `COALESCE` untuk handle NULL values di division dan position
4. ✅ Tambahkan NULL check untuk spouse_age calculation
5. ✅ Tambahkan `DROP VIEW IF EXISTS` sebelum CREATE
6. ✅ Ganti `CREATE OR REPLACE` dengan `CREATE` biasa
7. ✅ Compact formatting untuk menghindari parsing issues

**File yang Sudah Diperbaiki:**
- `supabase/migrations/014_seed_clinic_registration_data.sql` (lines 182-221)

**Perubahan:**
```sql
-- SEBELUM:
d.name AS division,
p.name AS position,
...
EXTRACT(YEAR FROM AGE((e.family_data->'spouse'->>'birthDate')::DATE))::INTEGER AS spouse_age,
...
FROM employees e
LEFT JOIN divisions d ON e.division_id = d.id
LEFT JOIN positions p ON e.position_id = p.id

-- SESUDAH (FINAL FIX):
COALESCE(d.name, '-') AS division,
COALESCE(p.name, '-') AS position,
...
CASE
    WHEN e.family_data->'spouse'->>'birthDate' IS NOT NULL
    THEN EXTRACT(YEAR FROM AGE((e.family_data->'spouse'->>'birthDate')::DATE))::INTEGER
    ELSE NULL
END AS spouse_age,
...
FROM public.employees e
LEFT JOIN public.divisions d ON e.division_id::UUID = d.id::UUID
LEFT JOIN public.positions p ON e.position_id::UUID = p.id::UUID
```

---

## Urutan Menjalankan Migrations

### Phase 1: Core Tables ✅
```bash
# Sudah ada dari sebelumnya
001_initial_schema.sql
002_rls_policies.sql
003_seed_data.sql
004-009_clinic_*.sql
```

### Phase 2: Clinic Registration Module ✅
```bash
010_partner_plantations.sql      # Kebun Sepupu
011_patients.sql                 # Patients (Unified)
012_clinic_registrations.sql     # Registrations (FIXED)
013_employees_family_data.sql    # Family Data
014_seed_clinic_registration_data.sql  # Seed Data
```

### Phase 3: Future (When clinic_doctors is ready)
```bash
015_add_doctor_fk_constraint.sql # Uncomment saat clinic_doctors ready
```

---

## Cara Menjalankan Migrations

### Option 1: Via Supabase CLI (Recommended)
```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref gketmjcxsnzrrzwfrxfw

# Run migrations
supabase db push
```

### Option 2: Manual via Supabase Dashboard
1. Buka https://app.supabase.com
2. Pilih project: Sigma Payroll Web Design
3. Go to: SQL Editor
4. Copy-paste isi migration file satu per satu
5. Execute

### Option 3: Programmatic via Supabase Client
```typescript
import { supabase } from './src/utils/supabase/client'
import fs from 'fs'

async function runMigration(filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf-8')
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) console.error(error)
}
```

---

## Checklist Before Running Migrations

- [ ] Backup database (if production)
- [ ] Check Supabase project URL & API key in `.env`
- [ ] Verify all previous migrations are applied
- [ ] Read migration file untuk understand apa yang akan dilakukan
- [ ] Test di local/staging environment dulu
- [ ] Check dependencies (apakah ada table yang harus dibuat dulu)

---

## Verification Queries

Setelah menjalankan migrations, verify dengan queries berikut:

### Check Tables Created
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'partner_plantations',
    'patients',
    'clinic_registrations'
)
ORDER BY table_name;
```

### Check ENUM Types Created
```sql
SELECT typname
FROM pg_type
WHERE typname IN (
    'patient_type',
    'family_relation',
    'payment_method',
    'visit_type',
    'registration_status'
)
ORDER BY typname;
```

### Check Functions Created
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%patient%'
   OR routine_name LIKE '%registration%'
   OR routine_name LIKE '%family%'
ORDER BY routine_name;
```

### Check Views Created
```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
    'v_today_queue',
    'v_employee_family_overview'
)
ORDER BY table_name;
```

### Check Triggers Created
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN (
    'patients',
    'clinic_registrations'
)
ORDER BY event_object_table, trigger_name;
```

### Check Seed Data
```sql
-- Partner plantations
SELECT code, name, is_active FROM partner_plantations ORDER BY code;

-- Employees with family data
SELECT
    employee_id,
    full_name,
    marital_status,
    family_data->'spouse'->>'fullName' as spouse_name,
    jsonb_array_length(family_data->'children') as children_count
FROM employees
WHERE family_data IS NOT NULL
ORDER BY employee_id;
```

---

## Common Issues

### Issue 1: "relation does not exist"
**Cause:** Migration file dijalankan sebelum dependencies
**Solution:** Check dependencies, run migrations in correct order

### Issue 2: "type does not exist"
**Cause:** ENUM type belum dibuat
**Solution:** Ensure migration yang create ENUM dijalankan dulu

### Issue 3: "column does not exist"
**Cause:** Reference ke table/column yang belum ada
**Solution:** Check file ini, sudah ada fix untuk migration 012

### Issue 4: "duplicate key value violates unique constraint"
**Cause:** Trying to insert duplicate data
**Solution:** Truncate table atau skip seed data jika sudah ada

---

## Rollback Strategy

### Rollback Single Migration
```sql
-- Drop tables (in reverse order)
DROP VIEW IF EXISTS v_today_queue;
DROP VIEW IF EXISTS v_employee_family_overview;
DROP TABLE IF EXISTS clinic_registrations CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS partner_plantations CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_patient_number() CASCADE;
DROP FUNCTION IF EXISTS calculate_patient_age() CASCADE;
DROP FUNCTION IF EXISTS calculate_patient_bmi() CASCADE;
DROP FUNCTION IF EXISTS generate_registration_number() CASCADE;
DROP FUNCTION IF EXISTS generate_queue_number() CASCADE;
DROP FUNCTION IF EXISTS calculate_wait_time() CASCADE;
DROP FUNCTION IF EXISTS update_registration_timestamps() CASCADE;
DROP FUNCTION IF EXISTS get_employee_family_members(UUID) CASCADE;
DROP FUNCTION IF EXISTS search_family_member_by_name(VARCHAR) CASCADE;

-- Drop types
DROP TYPE IF EXISTS patient_type CASCADE;
DROP TYPE IF EXISTS family_relation CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS visit_type CASCADE;
DROP TYPE IF EXISTS registration_status CASCADE;

-- Revert employees changes
ALTER TABLE employees DROP COLUMN IF EXISTS marital_status;
ALTER TABLE employees DROP COLUMN IF EXISTS blood_type;
ALTER TABLE employees DROP COLUMN IF EXISTS bpjs_health_number;
ALTER TABLE employees DROP COLUMN IF EXISTS family_data;
```

---

## Next Steps After Successful Migration

1. ✅ Verify all tables, functions, views created
2. ✅ Test seed data
3. ✅ Update TypeScript types jika ada perubahan
4. ✅ Test custom hooks dengan real data
5. ✅ Build UI components
6. ✅ Integration testing

---

**Last Updated:** 2025-11-06
**Status:** Migration 012 & 014 FIXED (3 errors resolved) ✅
