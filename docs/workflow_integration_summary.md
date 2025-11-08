# Ringkasan Integrasi Workflow Status dengan Tab Management

## Overview

Sistem manajemen karyawan kini telah terintegrasi penuh dengan workflow status, menghubungkan data karyawan di tab **Data Karyawan** dengan tab workflow (**Probasi**, **Rekrutmen**, dan **Terminasi**).

## Perubahan yang Dilakukan

### 1. **EmployeeManagement.tsx** - Data Karyawan

#### Field Baru
- Menambahkan field `workflowStatus` pada interface Employee
- Nilai: `'none' | 'recruitment' | 'probation' | 'termination'`

#### Tab Pekerjaan
**Field Baru di Form:**
1. **Dropdown "Status Workflow"**
   - Pilihan: Tidak Ada, Rekrutmen, Probasi, Terminasi
   - Mengontrol status workflow karyawan

2. **Field "Status Aktual Saat Ini"**
   - Menampilkan badge dengan warna berbeda:
     - 🔵 Biru: Sedang Rekrutmen
     - 🟠 Orange: Sedang Probasi
     - 🔴 Merah: Dalam Proses Terminasi
     - ⚪ Abu-abu: Normal

3. **Info Box Integrasi**
   - Penjelasan tentang koneksi dengan tab workflow
   - Perubahan 2 arah dengan tab lain

#### Database Operations
- `handleAddEmployee`: Menyimpan `workflow_status` ke database
- `handleUpdateEmployee`: Update `workflow_status`
- `loadEmployees`: Membaca `workflow_status` dari database

#### View Dialog
- Menampilkan badge workflow status bersama badge golongan dan status

---

### 2. **Probasi.tsx** - Tab Probasi

#### Fitur Utama
✅ Mengambil data dari `employees` table dengan filter `workflow_status = 'probation'`
✅ Terintegrasi dengan divisions dan positions dari database
✅ Menampilkan statistik probasi real-time
✅ Action buttons untuk Approve/Reject probasi

#### Data yang Ditampilkan
- Daftar karyawan dengan workflow_status = 'probation'
- Tanggal masuk dan estimasi akhir probasi (join_date + 3 bulan)
- Sisa hari probasi dengan warning untuk < 14 hari
- Divisi dan posisi dari master data

#### Action Workflow

**1. Lulus Probasi (Pass)**
```typescript
workflow_status: 'none'  // Kembali ke normal
status: 'active'         // Tetap aktif
```

**2. Tidak Lulus Probasi (Fail)**
```typescript
workflow_status: 'none'  // Reset
status: 'inactive'       // Set inactive
```

**3. Perpanjang Probasi (Extend)**
```typescript
workflow_status: 'probation'  // Tetap probasi
status: 'active'              // Tetap aktif
```

#### Statistics Cards
- Total Probasi
- Berlangsung
- Lulus
- Diperpanjang
- Tidak Lulus

---

### 3. **Termination.tsx** - Tab Terminasi

#### Fitur Utama
✅ Mengambil data dari `employees` table dengan filter `workflow_status = 'termination'`
✅ Terintegrasi dengan divisions dan positions
✅ Action buttons untuk Approve/Reject terminasi
✅ Warning message untuk perubahan status

#### Data yang Ditampilkan
- Daftar karyawan dengan workflow_status = 'termination'
- Status: Menunggu Approval
- Informasi divisi dan posisi
- Tanggal bergabung

#### Action Workflow

**1. Setujui Terminasi (Approve)**
```typescript
workflow_status: 'none'  // Reset workflow
status: 'inactive'       // Set inactive (karyawan keluar)
```
- Karyawan dikeluarkan dari sistem aktif
- Status berubah menjadi inactive
- Opsi untuk input pesangon

**2. Tolak Terminasi (Reject)**
```typescript
workflow_status: 'none'  // Reset workflow
status: 'active'         // Tetap aktif
```
- Karyawan tetap aktif
- Pengajuan terminasi dibatalkan

#### Statistics Cards
- Total Terminasi
- Menunggu Approval
- Disetujui
- Ditolak

---

## Alur Kerja 2 Arah

### Dari Data Karyawan → Tab Workflow

**Scenario 1: Set karyawan ke Probasi**
1. Admin buka form edit karyawan di tab Data Karyawan
2. Di tab Pekerjaan, set "Status Workflow" = Probasi
3. Simpan data
4. Karyawan otomatis muncul di **Tab Probasi**

**Scenario 2: Set karyawan ke Terminasi**
1. Admin edit karyawan
2. Set "Status Workflow" = Terminasi
3. Simpan data
4. Karyawan otomatis muncul di **Tab Terminasi**

### Dari Tab Workflow → Data Karyawan

**Scenario 1: Approve Probasi**
1. Admin buka **Tab Probasi**
2. Klik tombol Approve (✓) pada karyawan
3. Sistem update `workflow_status` → 'none'
4. Karyawan hilang dari Tab Probasi
5. Status di Data Karyawan otomatis ter-update

**Scenario 2: Approve Terminasi**
1. Admin buka **Tab Terminasi**
2. Klik tombol Approve (✓)
3. Sistem update:
   - `workflow_status` → 'none'
   - `status` → 'inactive'
4. Karyawan hilang dari Tab Terminasi
5. Status di Data Karyawan menjadi Inactive

---

## Database Schema

### Tabel: employees

Kolom baru yang ditambahkan:
```sql
workflow_status VARCHAR(20) DEFAULT 'none'
  CHECK (workflow_status IN ('none', 'recruitment', 'probation', 'termination'))
```

**Index:** `idx_employees_workflow_status` untuk performa query

---

## File Migration

### SQL Migration
**File**: `migrations/add_workflow_status_to_employees.sql`

Berisi:
- Menambah kolom `workflow_status`
- Add constraint CHECK
- Create index
- Update existing records

### Cara Menjalankan
```bash
# Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Pilih SQL Editor
3. Copy paste isi file migration
4. Run query
```

---

## Testing Workflow

### Test Case 1: Probasi Flow
1. ✅ Tambah karyawan baru dengan workflow_status = 'probation'
2. ✅ Karyawan muncul di Tab Probasi
3. ✅ Approve probasi → workflow_status berubah ke 'none'
4. ✅ Karyawan hilang dari Tab Probasi

### Test Case 2: Terminasi Flow
1. ✅ Set karyawan existing ke workflow_status = 'termination'
2. ✅ Karyawan muncul di Tab Terminasi
3. ✅ Approve terminasi → status berubah ke 'inactive'
4. ✅ Karyawan hilang dari Tab Terminasi

### Test Case 3: Reject Flow
1. ✅ Set karyawan ke probation/termination
2. ✅ Reject dari tab workflow
3. ✅ workflow_status reset ke 'none'
4. ✅ Status karyawan tetap active

---

## Components yang Diupdate

| Component | Status | Integrasi |
|-----------|--------|-----------|
| **EmployeeManagement.tsx** | ✅ Selesai | Form field + badge display |
| **Probasi.tsx** | ✅ Selesai | Load data + approval workflow |
| **Termination.tsx** | ✅ Selesai | Load data + approval workflow |
| **Recruitment.tsx** | ⏸️ Pending | Konsep berbeda (job postings) |

---

## Fitur yang Tersedia

### Data Karyawan (EmployeeManagement)
- ✅ Set workflow status via dropdown
- ✅ View status aktual dengan badge berwarna
- ✅ Info box integrasi workflow
- ✅ Badge display di view dialog
- ✅ Simpan dan update workflow_status ke database

### Tab Probasi
- ✅ Load karyawan dengan filter workflow_status
- ✅ Statistik real-time
- ✅ Filter by divisi dan status
- ✅ Search karyawan
- ✅ View detail karyawan
- ✅ Approve probasi (pass/fail/extend)
- ✅ Update status ke database

### Tab Terminasi
- ✅ Load karyawan terminasi
- ✅ Statistik pengajuan
- ✅ Filter by divisi
- ✅ Search karyawan
- ✅ View detail pengajuan
- ✅ Approve/Reject terminasi
- ✅ Update status dan workflow_status

---

## Best Practices

### Untuk Admin/HR
1. **Setting Probasi**: Set workflow_status = 'probation' untuk karyawan baru
2. **Monitoring**: Cek Tab Probasi secara regular untuk review
3. **Approval**: Process approval sebelum batas waktu probasi
4. **Terminasi**: Gunakan workflow untuk tracking formal termination

### Untuk Developer
1. **State Management**: Reload data setelah update workflow_status
2. **Error Handling**: Semua database operations wrapped dengan try-catch
3. **Toast Notifications**: User feedback untuk setiap action
4. **Loading States**: Show loading saat fetch data

---

## Known Limitations

1. **Recruitment Tab**: Belum diintegrasikan (menggunakan konsep job_postings)
2. **Performance Score**: Belum ada field di database (saat ini hardcoded)
3. **Probation History**: Belum ada tracking history probasi
4. **Termination Reason**: Belum ada field untuk alasan terminasi

---

## Next Steps / Future Enhancements

1. **Recruitment Integration**
   - Integrasikan dengan applicants table
   - Link recruitment → probation flow

2. **Enhanced Probation**
   - Add probation_end_date field di database
   - Track performance scores
   - Probation history log

3. **Enhanced Termination**
   - Add termination_reason, termination_type
   - Severance calculation
   - Exit interview tracking

4. **Notifications**
   - Email notification saat workflow status berubah
   - Reminder untuk probation yang akan berakhir
   - Alert untuk pending termination approvals

5. **Reports**
   - Probation success rate report
   - Termination analytics
   - Workflow timeline tracking

---

## Troubleshooting

### Issue: Karyawan tidak muncul di Tab Probasi
**Solution**:
- Check workflow_status di database
- Pastikan nilai = 'probation' (lowercase)
- Refresh halaman

### Issue: Approval tidak bekerja
**Solution**:
- Check console untuk error
- Verify user permissions
- Check database connection

### Issue: Badge tidak tampil
**Solution**:
- Pastikan workflowStatus tidak null
- Check conditional rendering di code
- Verify workflowStatus value

---

## Conclusion

Sistem workflow status kini sudah terintegrasi penuh dengan manajemen karyawan. Alur kerja 2 arah antara Data Karyawan dan Tab Workflow memudahkan tracking dan approval proses probasi dan terminasi karyawan.

**Status**: ✅ **Production Ready** (setelah menjalankan migration SQL)

**Documentation Date**: 2025-01-08
**Version**: 2.0.0
**Author**: Sistem Payroll Team
