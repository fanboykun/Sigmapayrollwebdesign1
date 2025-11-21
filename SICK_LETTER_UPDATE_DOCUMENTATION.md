# Dokumentasi Update Surat Sakit & Presensi

**Tanggal:** 2025-11-19
**Versi:** 1.0.0
**Status:** ✅ Complete

---

## 📋 Ringkasan Perubahan

Sistem surat sakit telah diperbarui dengan fitur-fitur berikut:

### 1. **Form Surat Sakit yang Lebih Sederhana**
   - ❌ Dihapus: Field "Nama Karyawan" (redundan dengan Nama Pasien)
   - ❌ Dihapus: Field "Ringkasan Pengobatan"
   - ❌ Dihapus: Field "Catatan Tambahan"
   - ✅ Tetap: Diagnosis, Rekomendasi Istirahat, Periode Sakit

### 2. **Presensi Otomatis yang Lebih Cerdas**
   - ✅ Skip hari Minggu (tidak membuat presensi)
   - ✅ Skip hari libur nasional (dari tabel `holidays`)
   - ✅ Hanya membuat presensi untuk hari kerja efektif
   - ✅ Status presensi: "Sakit" (S)

### 3. **Manajemen Surat Sakit**
   - ✅ Lihat riwayat surat sakit pasien
   - ✅ Edit tanggal dan diagnosis surat sakit
   - ✅ Hapus surat sakit (presensi dikembalikan ke "Hadir/HK")
   - ✅ Otomatis update presensi saat edit/delete

---

## 🗃️ File yang Diubah

### 1. **SickLetterForm.tsx**
   - Removed `employeeName` display
   - Removed `treatment_summary` field
   - Removed `notes` field
   - Updated alert message to mention Sunday/holiday exclusion

### 2. **MedicalExamination.tsx**
   - Added sick letter history display
   - Added edit/delete functionality
   - Added `fetchPatientSickLetters()` function
   - Added edit dialog component
   - Added Pencil & Trash2 icons

### 3. **useSickLetters.ts**
   - Updated `deleteSickLetter()` to use RPC function
   - Added `updateSickLetterDates()` function
   - Both functions now properly restore/adjust attendance records

### 4. **Database Migration: 044_sick_letter_attendance_function.sql** ✨
   **3 New RPC Functions:**

   #### a. `create_sick_letter_with_attendance()`
   - Creates sick letter with auto-generated number
   - Generates attendance records (skip Sundays & holidays)
   - Returns created count

   #### b. `delete_sick_letter_and_restore_attendance()`
   - Deletes sick letter
   - Restores attendance to "present" (HK) status
   - Returns restored count

   #### c. `update_sick_letter_dates()`
   - Updates sick letter date range
   - Removes old attendance outside new range
   - Adds new attendance for new dates
   - Skips Sundays and holidays
   - Returns: removed, added, updated counts

---

## 🚀 Cara Menjalankan Migrasi

### **Option A: Menggunakan Supabase Dashboard (Recommended)**

1. Buka Supabase Dashboard → SQL Editor
2. Buka file: `supabase/migrations/044_sick_letter_attendance_function.sql`
3. Copy seluruh isinya
4. Paste di SQL Editor
5. Click **Run** atau tekan `Ctrl+Enter`
6. Pastikan tidak ada error

### **Option B: Menggunakan Supabase CLI**

```bash
# Link project jika belum
npx supabase link --project-ref your-project-ref

# Apply migration
npx supabase db push
```

---

## 📖 Cara Menggunakan Fitur Baru

### **1. Membuat Surat Sakit**

1. Buka menu **Pemeriksaan & Diagnosis**
2. Pilih pasien dari antrian
3. Isi dan simpan rekam medis
4. Klik tombol **"Buat Surat Sakit"**
5. Isi form:
   - Tanggal Mulai Sakit
   - Tanggal Selesai Sakit
   - Diagnosis
   - Rekomendasi Istirahat
6. Klik **"Buat Surat Sakit"**

**Hasil:**
- Surat sakit dibuat dengan nomor otomatis (SKL-YYYY-MM-NNNN)
- Presensi otomatis dibuat dengan status "Sakit"
- Hari Minggu dan libur nasional **TIDAK** dibuatkan presensi
- Toast notification menampilkan jumlah presensi yang dibuat

### **2. Melihat Riwayat Surat Sakit**

1. Pilih pasien yang merupakan karyawan
2. Scroll ke bawah setelah section "Tindakan Lanjutan"
3. Card **"Riwayat Surat Sakit"** akan muncul jika ada surat sakit
4. Informasi yang ditampilkan:
   - Nomor surat
   - Status (Aktif/Dibatalkan)
   - Periode sakit
   - Total hari
   - Diagnosis
   - Rekomendasi istirahat

### **3. Edit Surat Sakit**

1. Di riwayat surat sakit, klik icon **Pencil** (✏️)
2. Dialog edit akan muncul
3. Ubah:
   - Tanggal Mulai Sakit
   - Tanggal Selesai Sakit
   - Diagnosis
4. Klik **"Simpan Perubahan"**

**Hasil:**
- Surat sakit diupdate
- Presensi di luar range baru dikembalikan ke "Hadir"
- Presensi baru dibuat untuk tanggal baru
- Tetap skip Minggu dan libur nasional
- Toast notification menampilkan summary perubahan

### **4. Hapus Surat Sakit**

1. Di riwayat surat sakit, klik icon **Trash** (🗑️)
2. Konfirmasi penghapusan
3. Klik **OK**

**Hasil:**
- Surat sakit dihapus
- Semua presensi yang dibuat oleh surat sakit dikembalikan ke status "Hadir" (HK)
- Presensi dapat diedit manual dari menu Presensi
- Toast notification menampilkan jumlah presensi yang dikembalikan

---

## 🔐 Permissions & Security

### **Who Can Edit/Delete Sick Letters?**

Surat sakit hanya dapat diedit/dihapus dari menu **Pemeriksaan & Diagnosis** oleh:
- ✅ Dokter (doctor_klinik)
- ✅ Admin Klinik (admin_klinik)
- ✅ Super Admin (super_admin)

### **RLS Policies**

RPC functions sudah di-grant ke `authenticated` role:
```sql
GRANT EXECUTE ON FUNCTION create_sick_letter_with_attendance TO authenticated;
GRANT EXECUTE ON FUNCTION delete_sick_letter_and_restore_attendance TO authenticated;
GRANT EXECUTE ON FUNCTION update_sick_letter_dates TO authenticated;
```

Pastikan RLS policies di tabel `clinic_sick_letters` dan `attendance_records` sudah benar.

---

## 🧪 Testing Checklist

### **Test 1: Create Sick Letter (Skip Sundays & Holidays)**

✅ **Steps:**
1. Pilih periode yang mencakup hari Minggu (misal: 18 Nov - 24 Nov 2025)
2. Buat surat sakit
3. Cek tabel `attendance_records`

✅ **Expected:**
- Presensi **TIDAK** dibuat untuk tanggal 23 Nov (Minggu)
- Presensi dibuat untuk: 18, 19, 20, 21, 22, 24 Nov
- Total: 6 hari (bukan 7)

### **Test 2: Create Sick Letter (Skip National Holiday)**

✅ **Steps:**
1. Pilih periode yang mencakup libur nasional (misal: 25 Des 2025 = Natal)
2. Buat surat sakit
3. Cek tabel `attendance_records`

✅ **Expected:**
- Presensi **TIDAK** dibuat untuk 25 Des
- Presensi dibuat untuk hari kerja lainnya

### **Test 3: Edit Sick Letter Dates**

✅ **Steps:**
1. Buat surat sakit: 18-24 Nov
2. Edit menjadi: 20-26 Nov
3. Cek tabel `attendance_records`

✅ **Expected:**
- Presensi untuk 18-19 Nov dikembalikan ke "Hadir"
- Presensi untuk 25-26 Nov ditambahkan (skip 23 Nov = Minggu)
- Presensi untuk 20-22, 24 Nov tetap "Sakit"

### **Test 4: Delete Sick Letter**

✅ **Steps:**
1. Buat surat sakit: 18-24 Nov
2. Cek presensi (status = "Sakit")
3. Hapus surat sakit
4. Cek presensi lagi

✅ **Expected:**
- Semua presensi yang dibuat dikembalikan ke status "Hadir" (present)
- Notes berubah menjadi "Dikembalikan dari surat sakit"
- Presensi dapat diedit manual dari menu Presensi

### **Test 5: View Sick Letter History**

✅ **Steps:**
1. Pilih pasien yang punya surat sakit
2. Scroll ke section "Riwayat Surat Sakit"

✅ **Expected:**
- Card muncul dengan list surat sakit
- Menampilkan nomor, status, periode, diagnosis
- Button Edit dan Delete tersedia untuk surat aktif

---

## 🐛 Troubleshooting

### **Problem: RPC function not found**

**Solution:**
```bash
# Check if migration ran successfully
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%sick_letter%';
```

Should return:
- `create_sick_letter_with_attendance`
- `delete_sick_letter_and_restore_attendance`
- `update_sick_letter_dates`

If not found, re-run migration.

### **Problem: Attendance not created**

**Checks:**
1. Is patient linked to an employee? (`employee_id` not null)
2. Are dates valid?
3. Check console for errors
4. Check database logs in Supabase Dashboard

### **Problem: Holidays not being skipped**

**Checks:**
1. Verify holidays exist in `holidays` table:
   ```sql
   SELECT * FROM holidays WHERE is_active = true;
   ```
2. Ensure `is_active` = TRUE for holidays
3. Check date format is `YYYY-MM-DD`

---

## 📊 Database Schema Changes

### **Tables Modified: NONE**
✅ No schema changes, only added RPC functions

### **New Functions:**

| Function Name | Purpose | Returns |
|--------------|---------|---------|
| `create_sick_letter_with_attendance` | Create sick letter + attendance | sick_letter_id, letter_number, attendance_created, attendance_updated |
| `delete_sick_letter_and_restore_attendance` | Delete sick letter + restore attendance | attendance_deleted, attendance_restored |
| `update_sick_letter_dates` | Update dates + adjust attendance | attendance_removed, attendance_added, attendance_updated |

---

## 🎯 Benefits

### **For Doctors:**
- ✅ Faster form filling (less fields)
- ✅ Can edit/fix mistakes
- ✅ Can delete wrong entries
- ✅ View patient's sick letter history

### **For HR/Payroll:**
- ✅ Accurate attendance (no weekend/holiday records)
- ✅ Can manually edit restored attendance
- ✅ Clearer audit trail

### **For System:**
- ✅ Less redundant data
- ✅ Automatic attendance management
- ✅ Better data integrity
- ✅ Follows business rules (no weekend work)

---

## 📝 Notes

1. **Hari Minggu = Day 0** dalam PostgreSQL `EXTRACT(DOW ...)`
2. **Hari Libur** diambil dari tabel `holidays` dengan `is_active = TRUE`
3. **Presensi yang di-restore** statusnya menjadi `'present'` (HK), bisa diedit manual
4. **Nomor Surat** auto-increment per bulan: `SKL-2025-11-0001`, `SKL-2025-11-0002`, dst.

---

## ✅ Completion Summary

**All tasks completed successfully:**

1. ✅ Updated SickLetterForm.tsx (removed 3 fields)
2. ✅ Updated attendance generation logic (skip Sundays & holidays)
3. ✅ Created 3 RPC functions for CRUD operations
4. ✅ Updated useSickLetters hook
5. ✅ Added sick letter management UI to MedicalExamination.tsx
6. ✅ Implemented edit/delete with attendance update

**Files Created/Modified:**
- ✏️ `src/components/clinic/SickLetterForm.tsx`
- ✏️ `src/components/clinic/MedicalExamination.tsx`
- ✏️ `src/hooks/useSickLetters.ts`
- ✨ `supabase/migrations/044_sick_letter_attendance_function.sql` (NEW)
- ✨ `SICK_LETTER_UPDATE_DOCUMENTATION.md` (NEW)

---

**Ready to deploy! 🚀**

Silakan jalankan migrasi dan test fitur-fiturnya. Jika ada pertanyaan atau issue, silakan hubungi development team.
