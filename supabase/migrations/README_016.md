# Migration 016: Update Get Employee Family Members Function

## Deskripsi
Migration ini memperbaiki function `get_employee_family_members` untuk mengembalikan field tambahan yang diperlukan untuk auto-fill form pendaftaran pasien klinik.

## Field Tambahan yang Ditambahkan
- `phone` - Nomor telepon
- `email` - Email (hanya untuk karyawan/self)
- `address` - Alamat lengkap (hanya untuk karyawan/self)
- `height` - Tinggi badan dalam cm (hanya untuk karyawan/self)
- `weight` - Berat badan dalam kg (hanya untuk karyawan/self)

## Cara Menjalankan Migration

### Opsi 1: Via Supabase Dashboard (Recommended)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di menu sebelah kiri
4. Klik **+ New Query**
5. Copy seluruh isi file `016_update_get_employee_family_members.sql`
6. Paste ke SQL Editor
7. Klik **Run** atau tekan `Ctrl+Enter`
8. Verifikasi bahwa query berhasil dijalankan tanpa error

### Opsi 2: Via Supabase CLI

```bash
# Link project dulu jika belum
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push

# Atau reset dan apply semua migrations
supabase db reset
```

### Opsi 3: Via psql (Direct Connection)

```bash
# Dapatkan connection string dari Supabase Dashboard > Project Settings > Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[HOST]/postgres" -f supabase/migrations/016_update_get_employee_family_members.sql
```

## Verifikasi

Setelah migration berhasil dijalankan, test dengan query berikut:

```sql
-- Ganti dengan UUID karyawan yang ada
SELECT * FROM get_employee_family_members('af3ad4e4-563a-4888-aa4d-81b55986f5f3');
```

Hasilnya seharusnya mengembalikan kolom:
- relation
- nik
- full_name
- birth_date
- age
- gender
- blood_type
- bpjs_health_number
- **phone** ← BARU
- **email** ← BARU
- **address** ← BARU
- **height** ← BARU
- **weight** ← BARU

## Rollback

Jika perlu rollback, jalankan:

```sql
-- Restore function ke versi sebelumnya (tanpa field tambahan)
DROP FUNCTION IF EXISTS get_employee_family_members(UUID);

CREATE OR REPLACE FUNCTION get_employee_family_members(emp_id UUID)
RETURNS TABLE (
    relation VARCHAR(20),
    nik VARCHAR(20),
    full_name VARCHAR(255),
    birth_date DATE,
    age INTEGER,
    gender VARCHAR(10),
    blood_type VARCHAR(5),
    bpjs_health_number VARCHAR(20)
) AS $$
BEGIN
    -- ... (copy dari file 013_employees_family_data.sql)
END;
$$ LANGUAGE plpgsql;
```

## Perubahan di Aplikasi

File yang terpengaruh oleh migration ini:
1. `src/types/clinic-registration.ts` - Update `FamilyMember` interface
2. `src/components/clinic/ClinicRegistration.tsx` - Update `handleFamilyMemberSelect`
3. `src/components/clinic/EmployeeSearchSelector.tsx` - Update interface dan auto-fill logic

## Catatan

- Field `email`, `address`, `height`, `weight` hanya tersedia untuk karyawan (relation = 'self')
- Untuk anggota keluarga (spouse/children), field ini akan NULL karena tidak tersimpan di `family_data` JSONB
- Jika ingin menyimpan data ini untuk keluarga, perlu update format JSONB di field `family_data`
