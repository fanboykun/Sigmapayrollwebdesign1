# Menu Penyerahan Obat - Dokumentasi

## Overview
Menu Penyerahan Obat (Clinic Dispensing) adalah modul untuk memproses penyerahan obat kepada pasien berdasarkan resep dokter yang sudah dibuat.

## Database Schema

### Tables
1. **clinic_medicine_dispensing** - Record penyerahan obat
   - `id` (UUID) - Primary key
   - `prescription_id` (UUID) - Referensi ke resep
   - `prescription_detail_id` (UUID) - Referensi ke detail resep
   - `medicine_id` (UUID) - Referensi ke obat
   - `batch_number` (VARCHAR) - Nomor batch yang diserahkan
   - `quantity_dispensed` (INTEGER) - Jumlah yang diserahkan
   - `expiry_date` (DATE) - Tanggal kadaluarsa batch
   - `dispensed_date` (TIMESTAMPTZ) - Tanggal & waktu penyerahan
   - `dispensed_by` (UUID) - User yang menyerahkan
   - `patient_signature` (TEXT) - Tanda tangan digital (opsional)
   - `notes` (TEXT) - Catatan penyerahan

2. **clinic_medicine_stock** - Stok obat dengan batch tracking
   - `medicine_id` (UUID) - Referensi ke obat
   - `batch_number` (VARCHAR) - Nomor batch
   - `quantity` (INTEGER) - Jumlah total
   - `reserved_quantity` (INTEGER) - Jumlah yang di-reserve
   - `available_quantity` (GENERATED) - Quantity - Reserved (computed)
   - `expiry_date` (DATE) - Tanggal kadaluarsa
   - `status` (VARCHAR) - available, expired, damaged, recalled

## Fitur

### 1. Tab: Resep Menunggu

#### Daftar Resep Pending
- Menampilkan semua resep dengan status "pending"
- Informasi ditampilkan per resep:
  - **Nomor resep** dan tanggal resep
  - **Informasi Pasien**:
    - Nama lengkap
    - Kode pasien
    - Jenis kelamin dan umur
    - **⚠️ Alergi pasien** (jika ada) - ditampilkan dengan alert merah
  - **Daftar Obat yang Diresepkan**:
    - Nama obat
    - Jumlah dan satuan
    - Dosis/aturan pakai

#### Search & Filter
- 🔍 Search: Cari berdasarkan nomor resep, nama pasien, atau kode pasien
- Counter jumlah resep yang menunggu di tab

#### Action: Serahkan Obat
- Button "Serahkan Obat" untuk memulai proses dispensing

### 2. Proses Penyerahan Obat (Dialog)

Ketika klik "Serahkan Obat", akan muncul dialog dengan:

#### A. Informasi Pasien
- Nama pasien dan kode rekam medis
- Nomor resep dan tanggal
- **Alert Alergi** (jika pasien memiliki alergi)

#### B. Detail Per Obat
Untuk setiap obat dalam resep, tampilkan:

**Informasi Obat:**
- Nama obat dan nama generik
- Bentuk sediaan dan kekuatan
- Dosis dan instruksi
- Jumlah yang diresepkan

**Pilihan Penyerahan:**
1. **Pilih Batch** (Dropdown) *
   - Menampilkan semua batch yang tersedia
   - Format: "Batch XXX - Stok: YY unit"
   - Badge "⚠️ ED: tanggal" untuk batch yang akan kadaluarsa (<90 hari)
   - **Otomatis sort by FEFO** (First Expiry First Out)
   - Hanya tampilkan batch dengan status "available" dan stok > 0

2. **Jumlah Diserahkan** (Input Number) *
   - Default: sesuai jumlah resep
   - Min: 1, Max: jumlah resep
   - Menampilkan total stok tersedia

**Validasi:**
- ❌ Batch belum dipilih
- ❌ Jumlah tidak valid atau 0
- ❌ Jumlah melebihi stok batch yang dipilih
- ❌ Jumlah melebihi jumlah resep
- ⚠️ Alert jika stok tidak cukup untuk resep

**Detail Batch Selected:**
- Nomor batch
- Tanggal kadaluarsa (dengan warning jika < 90 hari)
- Stok tersedia di batch tersebut

#### C. Catatan Penyerahan
- Textarea untuk catatan tambahan (opsional)

#### D. Submit Process
**Validasi Sebelum Submit:**
1. Semua obat harus memilih batch
2. Semua jumlah harus valid
3. Stok harus mencukupi

**Proses Submit:**
1. Insert record ke `clinic_medicine_dispensing` untuk setiap obat
2. Update stok di `clinic_medicine_stock` (kurangi quantity)
3. Update status resep di `clinic_prescriptions` menjadi "dispensed"
4. Tampilkan success toast
5. Refresh daftar resep pending

### 3. Tab: Riwayat Penyerahan

#### Daftar Riwayat
Menampilkan history penyerahan obat dengan informasi:
- **No. Resep**: Nomor resep yang diserahkan
- **Pasien**: Nama pasien
- **Tanggal Serah**: Tanggal & waktu penyerahan
- **Jumlah Item**: Badge berisi jumlah jenis obat
- **Diserahkan Oleh**: Nama user yang menyerahkan
- **Detail Obat**: List obat dengan quantity dan batch number

#### Search
- 🔍 Cari berdasarkan nomor resep atau nama pasien

#### Pagination
- Limit 100 record terbaru
- Sort by tanggal penyerahan (terbaru dulu)

## Business Logic & Rules

### 1. Stock Management (FEFO System)
- **FEFO (First Expiry First Out)**: Batch dengan expiry date paling dekat diutamakan
- Auto-sort batch berdasarkan expiry date (ascending)
- Hanya batch dengan status "available" dan stok > 0 yang ditampilkan

### 2. Stock Reduction
- Stok dikurangi dari batch yang dipilih
- Formula: `new_quantity = current_quantity - quantity_dispensed`
- Real-time update di `clinic_medicine_stock.quantity`

### 3. Prescription Status Update
- Status resep otomatis berubah dari "pending" → "dispensed"
- Resep yang sudah "dispensed" tidak muncul di tab pending

### 4. Expiry Date Warning
- Badge ⚠️ untuk batch yang akan kadaluarsa dalam 90 hari
- Warning color (orange/red) di detail batch

### 5. Allergy Alert
- Alert merah otomatis muncul jika pasien memiliki alergi
- Ditampilkan di card resep dan dialog penyerahan
- Critical untuk keselamatan pasien

### 6. Multi-Batch Support
- Satu resep bisa mengambil dari berbagai batch
- Setiap obat bisa pilih batch yang berbeda

## Query Testing

Berikut adalah test query yang sudah dilakukan:

```sql
-- Get pending prescriptions with patient info
SELECT p.id, p.prescription_number, p.prescription_date, p.status
FROM clinic_prescriptions p
INNER JOIN clinic_medical_records mr ON p.medical_record_id = mr.id
INNER JOIN clinic_patients pat ON mr.patient_id = pat.id
WHERE p.status = 'pending'
ORDER BY p.prescription_date DESC

-- Get prescription details
SELECT pd.*, m.name, m.unit
FROM clinic_prescription_details pd
INNER JOIN clinic_medicines m ON pd.medicine_id = m.id
WHERE pd.prescription_id = 'xxx'

-- Get available stock for medicine (FEFO)
SELECT id, batch_number, quantity, available_quantity, expiry_date, unit_price
FROM clinic_medicine_stock
WHERE medicine_id = 'xxx'
  AND status = 'available'
  AND available_quantity > 0
ORDER BY expiry_date ASC  -- FEFO

-- Get dispensing history
SELECT d.*,
  p.prescription_number,
  pat.full_name as patient_name,
  m.name as medicine_name,
  u.name as dispensed_by_name
FROM clinic_medicine_dispensing d
INNER JOIN clinic_prescriptions p ON d.prescription_id = p.id
INNER JOIN clinic_medical_records mr ON p.medical_record_id = mr.id
INNER JOIN clinic_patients pat ON mr.patient_id = pat.id
INNER JOIN clinic_medicines m ON d.medicine_id = m.id
INNER JOIN users u ON d.dispensed_by = u.id
ORDER BY d.dispensed_date DESC
```

## Integration Points

### 1. Prescription Module
- Resep dengan status "pending" otomatis muncul di dispensing
- Setelah dispense, status berubah menjadi "dispensed"

### 2. Medicine Stock Module
- Validasi stok real-time dari `clinic_medicine_stock`
- Update stok otomatis setelah dispensing
- Batch tracking untuk traceability

### 3. Patient Module
- Load patient info dan allergies
- Critical info untuk safety

### 4. User Module
- Track siapa yang melakukan dispensing
- Audit trail untuk accountability

## Files

- **Component**: `src/components/ClinicDispensing.tsx`
- **Import**: Updated in `src/App.tsx`
- **Route**: `clinic-dispensing` (already configured in Sidebar)
- **Permission**: `clinic_dispensing` module

## Permissions

Database permissions sudah dikonfigurasi untuk roles:
- **SuperAdmin**: Full access (view, create, edit, delete)
- **Admin**: view, create, edit (no delete)
- **Nurse**: view, create, edit (no delete)
- **ClinicAdmin**: View only

## UI/UX Features

### Color Coding
- 🟢 **Available Stock**: Green badge
- 🟡 **Low Stock**: Yellow badge
- 🔴 **No Stock**: Red badge with alert
- 🟠 **Expiring Soon**: Orange badge with ⚠️

### Icons Used
- Package - Dispensing header
- ShoppingBag - Empty state
- Pill - Medicine icon
- User - Patient info
- FileText - Prescription info
- Clock - History/time
- AlertTriangle - Warnings & allergies
- CheckCircle - Success
- XCircle - Cancel/error
- Scan - Batch scanning (future)

### Empty States
- **No Pending**: "Tidak ada resep yang menunggu" dengan icon ShoppingBag
- **No History**: "Belum ada riwayat penyerahan obat" dengan icon Clock
- **No Stock**: Alert "Tidak ada stok tersedia untuk obat ini"

## Safety Features

### 1. Allergy Warnings
- 🚨 Alert merah untuk pasien dengan alergi
- Ditampilkan prominently di card dan dialog
- Critical untuk mencegah adverse drug reactions

### 2. Expiry Date Monitoring
- Warning untuk batch yang mendekati kadaluarsa (<90 hari)
- FEFO system untuk menggunakan batch yang lebih dulu kadaluarsa

### 3. Stock Validation
- Real-time checking stok tersedia
- Prevent over-dispensing
- Alert jika stok tidak mencukupi resep

### 4. Audit Trail
- Track who dispensed what and when
- Complete history di tab riwayat
- Traceability dengan batch number

## Future Enhancements

1. **Barcode/QR Code Scanning**:
   - Scan batch barcode untuk input otomatis
   - Scan patient ID untuk verifikasi

2. **Patient Signature Capture**:
   - Digital signature pad
   - Store signature di `patient_signature` field

3. **Label Printing**:
   - Print label obat dengan instruksi
   - Include patient name, dosage, dan warning

4. **SMS/WhatsApp Notification**:
   - Notifikasi ke pasien bahwa obat sudah siap
   - Reminder untuk aturan pakai

5. **Partial Dispensing**:
   - Support penyerahan sebagian jika stok kurang
   - Tracking sisa yang belum diserahkan

6. **Drug Interaction Alert**:
   - Warning jika ada potensi interaksi antar obat
   - Integration dengan drug database

7. **Stock Reservation**:
   - Reserve stok saat resep dibuat
   - Prevent overselling

## Error Handling

### Common Errors & Solutions:

1. **"Batch belum dipilih"**
   - Solution: Pilih batch dari dropdown untuk semua obat

2. **"Jumlah melebihi stok tersedia"**
   - Solution: Kurangi jumlah atau pilih batch lain yang masih ada stok

3. **"Tidak ada stok tersedia"**
   - Solution: Perlu restock obat atau hubungi bagian pengadaan

4. **"Gagal menyerahkan obat"**
   - Check: Koneksi database, permissions, data integrity

## Testing Checklist

- [x] Database schema verified
- [x] Query testing successful
- [x] Component created with full functionality
- [x] Import updated in App.tsx
- [x] Build successful without errors
- [x] Permission already configured
- [ ] Integration testing with Prescription module
- [ ] Integration testing with Stock module
- [ ] Stock reduction validation
- [ ] FEFO system testing
- [ ] Allergy alert testing
- [ ] End-to-end workflow testing

## Notes

- Komponen menggunakan FEFO (First Expiry First Out) untuk manajemen stok
- Safety-first approach dengan allergy alerts
- Real-time stock validation untuk prevent errors
- Audit trail lengkap untuk compliance
- Responsive design untuk tablet/desktop use

---

**Created**: 2025-11-10
**Author**: Sigma Development Team
**Version**: 1.0.0
