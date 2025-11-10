# Menu Resep Obat - Dokumentasi

## Overview
Menu Resep Obat (Clinic Prescription) adalah modul untuk mengelola resep obat yang dikeluarkan oleh dokter setelah pemeriksaan medis.

## Database Schema

### Tables
1. **clinic_prescriptions** - Data utama resep obat
   - `id` (UUID) - Primary key
   - `medical_record_id` (UUID) - Referensi ke rekam medis
   - `prescription_number` (VARCHAR) - Nomor resep (format: RES-YYYYMMDD-XXXX)
   - `prescription_date` (DATE) - Tanggal resep
   - `status` (VARCHAR) - Status: pending, dispensed, cancelled
   - `notes` (TEXT) - Catatan tambahan

2. **clinic_prescription_details** - Detail obat dalam resep
   - `id` (UUID) - Primary key
   - `prescription_id` (UUID) - Referensi ke resep
   - `medicine_id` (UUID) - Referensi ke obat
   - `quantity` (INTEGER) - Jumlah obat
   - `dosage` (VARCHAR) - Dosis/aturan pakai (contoh: "3x1 sehari")
   - `duration_days` (INTEGER) - Durasi pengobatan dalam hari
   - `instructions` (TEXT) - Instruksi tambahan

## Fitur

### 1. Daftar Resep (Tab: Daftar Resep)
- **View Prescriptions**: Melihat daftar semua resep obat
- **Search**: Cari berdasarkan nomor resep, nama pasien, kode pasien, atau nama dokter
- **Filter Status**: Filter berdasarkan status (Menunggu, Sudah Diserahkan, Dibatalkan)
- **View Detail**: Melihat detail lengkap resep termasuk:
  - Informasi pasien
  - Informasi dokter
  - Daftar obat dengan dosis dan instruksi
  - Total biaya
  - Status resep

### 2. Buat Resep Baru (Tab: Buat Resep Baru)

#### Langkah 1: Pilih Rekam Medis
- Menampilkan daftar rekam medis yang sudah completed tapi belum memiliki resep
- Menampilkan informasi lengkap:
  - Data pasien (nama, kode, jenis kelamin, umur)
  - Data dokter dan spesialisasi
  - Tanggal pemeriksaan
  - Keluhan utama
  - Diagnosis

#### Langkah 2: Tambah Obat ke Resep
- **Search Medicine**: Cari obat berdasarkan nama, nama generik, atau kode
- **Medicine Details**: Menampilkan informasi obat:
  - Nama obat
  - Nama generik
  - Bentuk sediaan dan kekuatan
  - Stok tersedia
  - Harga per unit
  - Badge "Resep Dokter" jika obat memerlukan resep

- **Add Medicine**: Klik obat untuk menambahkan ke resep

- **Configure Medicine**:
  - Jumlah (quantity) - dengan validasi stok
  - Dosis/Aturan Pakai (wajib) - contoh: "3x1 sehari"
  - Durasi (opsional) - berapa hari pengobatan
  - Instruksi Tambahan (opsional) - contoh: "Diminum setelah makan"

- **Remove Medicine**: Hapus obat dari resep
- **Calculate Total**: Menampilkan total estimasi biaya

#### Langkah 3: Catatan Resep
- Tambahkan catatan khusus untuk resep (opsional)
- Submit untuk membuat resep baru

### 3. Detail Resep & Status Management
- **View Full Details**: Melihat semua informasi resep lengkap
- **Update Status**:
  - **Tandai Diserahkan**: Ubah status menjadi "dispensed" ketika obat sudah diserahkan ke pasien
  - **Batalkan Resep**: Ubah status menjadi "cancelled" jika resep dibatalkan
- **Print Prescription**: (Fitur ini bisa dikembangkan lebih lanjut untuk cetak resep)

## Validasi & Business Rules

1. **Create Prescription**:
   - Harus memilih rekam medis yang valid
   - Minimal 1 obat dalam resep
   - Semua obat harus memiliki dosis dan jumlah
   - Nomor resep otomatis dibuat dengan format: RES-YYYYMMDD-XXXX

2. **Medicine Selection**:
   - Obat yang sama tidak bisa ditambahkan 2x dalam 1 resep
   - Jumlah obat harus lebih dari 0
   - Sistem menampilkan warning jika stok obat menipis

3. **Status Management**:
   - Hanya resep dengan status "pending" yang bisa diubah statusnya
   - Resep yang sudah "dispensed" atau "cancelled" tidak bisa diubah

## Query Testing

Berikut adalah test query yang sudah dilakukan ke database:

```sql
-- Get prescriptions with patient and doctor info
SELECT p.id, p.prescription_number, p.prescription_date, p.status
FROM clinic_prescriptions p
INNER JOIN clinic_medical_records mr ON p.medical_record_id = mr.id
INNER JOIN clinic_patients pat ON mr.patient_id = pat.id
INNER JOIN clinic_doctors d ON mr.doctor_id = d.id
ORDER BY p.prescription_date DESC

-- Get prescription details with medicine info
SELECT pd.*, m.name, m.unit, m.price_per_unit
FROM clinic_prescription_details pd
INNER JOIN clinic_medicines m ON pd.medicine_id = m.id
WHERE pd.prescription_id = 'xxx'

-- Get medicines with stock
SELECT m.*,
  COALESCE(SUM(ms.quantity), 0) as current_stock
FROM clinic_medicines m
LEFT JOIN clinic_medicine_stock ms ON m.id = ms.medicine_id
  AND ms.status = 'available'
GROUP BY m.id
```

## Integration Points

### 1. Medical Records (clinic_medical_records)
- Resep dibuat dari rekam medis yang sudah completed
- Setiap rekam medis hanya bisa memiliki 1 resep

### 2. Medicines (clinic_medicines)
- Resep menggunakan master data obat
- Harga obat diambil dari price_per_unit di master data
- Validasi stok dari clinic_medicine_stock

### 3. Dispensing (Next Module)
- Resep dengan status "pending" akan muncul di modul Penyerahan Obat
- Ketika obat diserahkan, stok akan berkurang
- Status resep otomatis berubah menjadi "dispensed"

## Files

- **Component**: `src/components/ClinicPrescription.tsx`
- **Import**: Updated in `src/App.tsx`
- **Route**: `clinic-prescription` (already configured in Sidebar)
- **Permission**: `clinic_prescription` module

## Screenshots & UI Elements

### Badges
- 🟡 **Menunggu** (pending) - Yellow badge with Clock icon
- 🟢 **Sudah Diserahkan** (dispensed) - Green badge with CheckCircle icon
- 🔴 **Dibatalkan** (cancelled) - Red badge with XCircle icon

### Icons Used
- FileText - Resep obat header
- Pill - Medicine icon
- Search - Search input
- Plus - Add medicine
- Eye - View detail
- Trash2 - Remove medicine
- Stethoscope - Doctor info
- User - Patient info
- Calendar - Date info

## Future Enhancements

1. **Print Prescription**:
   - Generate PDF resep untuk dicetak
   - Include barcode/QR code untuk tracking

2. **E-Prescription**:
   - Digital signature dokter
   - Send via email/WhatsApp to patient

3. **Drug Interaction Check**:
   - Validasi interaksi antar obat
   - Warning untuk obat yang tidak boleh dikombinasikan

4. **Prescription History**:
   - Riwayat resep per pasien
   - Quick re-prescribe untuk repeat prescription

5. **Stock Alert**:
   - Real-time stock checking saat menambah obat
   - Warning jika stok tidak mencukupi

## Testing Checklist

- [x] Database schema verified
- [x] Query testing successful
- [x] Component created with full CRUD
- [x] Import updated in App.tsx
- [x] Build successful without errors
- [x] Routing configured (via Sidebar)
- [ ] Permission testing with different roles
- [ ] Integration testing with Medical Examination module
- [ ] Integration testing with Dispensing module
- [ ] End-to-end testing with real data

## Notes

- Komponen ini mengikuti pattern yang sama dengan komponen clinic lainnya (ClinicMedicines, MedicalExamination)
- Menggunakan Supabase client untuk database operations
- Toast notifications untuk user feedback
- Responsive design untuk mobile dan desktop
- TypeScript untuk type safety

---

**Created**: 2025-11-10
**Author**: Sigma Development Team
**Version**: 1.0.0
