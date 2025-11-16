# Dokumentasi Menu Penggajian - Premi Deres

## Overview
Menu Penggajian Premi Deres adalah modul untuk mengelola transaksi harian premi deres, termasuk input produksi, pemeriksaan kualitas, dan perhitungan premi.

## Tanggal Implementasi
**13 November 2024**

---

## 🎯 Fitur Utama

Menu ini terdiri dari 3 tab utama:

### 1. **Input Produksi Harian**
Tab untuk mencatat produksi harian setiap penderes.

#### Fitur:
- ✅ Form input produksi dengan dialog modal
- ✅ Pilih karyawan penderes dari dropdown (ID Karyawan + Nama)
- ✅ Pilih ancak dari dropdown (auto-populate divisi)
- ✅ Calendar picker untuk tanggal produksi
- ✅ Pilih jenis produksi: Normal / Ekstra (Hari Libur)
- ✅ Input berat produksi per jenis:
  - Lateks (Kg KK)
  - Lower Grades (Kg Basah)
  - Lump Cuka (Kg Basah)
  - Scraps (Kg Basah)
- ✅ Tabel data dengan filter:
  - Search by ID Karyawan atau nama
  - Filter by divisi
  - Export data
- ✅ Status tracking: DIAJUKAN, DISETUJUI
- ✅ Action buttons: Edit, Delete

#### Struktur Data:
```typescript
{
  id: string
  tanggal: string (YYYY-MM-DD)
  employee_id: string // ID Karyawan (e.g., EMP-AL-0001)
  nama_karyawan: string
  ancak_kode: string
  ancak_nama: string
  divisi: string (AP Div I/II/III/IV/V/VI)
  jenis_produksi: 'normal' | 'ekstra'
  lateks_kg: number
  lower_grades_kg: number
  lump_kg: number
  scraps_kg: number
  mandor: string
  status: 'submitted' | 'approved' | 'rejected'
}
```

---

### 2. **Quality Check Harian**
Tab untuk mencatat hasil pemeriksaan kualitas deres.

#### Fitur:
- ✅ Form input quality check dengan dialog modal
- ✅ Pilih karyawan penderes dari dropdown (auto-populate nama & ancak)
- ✅ Calendar picker untuk tanggal pemeriksaan
- ✅ Input 6 kriteria kesalahan:
  1. Deres terlalu dangkal
  2. Luka pada kulit pohon
  3. Sudut deresan tidak sesuai
  4. Pemakaian kulit berlebihan
  5. Alat tidak sesuai prosedur
  6. Tidak disiplin dalam pekerjaan
- ✅ Auto-calculate total kesalahan
- ✅ Auto-calculate koefisien PQ berdasarkan nilai kesalahan
- ✅ Tabel data dengan kolom per kriteria
- ✅ Status tracking: DIAJUKAN, DISETUJUI
- ✅ Action buttons: Edit, Delete

#### Struktur Data:
```typescript
{
  id: string
  tanggal: string (YYYY-MM-DD)
  employee_id: string // ID Karyawan (e.g., EMP-AL-0001)
  nama_karyawan: string
  ancak_kode: string
  mandor: string
  kesalahan_dangkal: number
  kesalahan_luka: number
  kesalahan_sudut: number
  kesalahan_kulit: number
  kesalahan_alat: number
  kesalahan_disiplin: number
  total_kesalahan: number
  nilai_kesalahan: number
  koefisien_pq: number (0.00 - 1.03)
  keterangan: string
  pemeriksa: string
  status: 'submitted' | 'approved' | 'rejected'
}
```

#### Mapping Koefisien PQ:
| Nilai Kesalahan | Koefisien |
|----------------|-----------|
| 0 - 8          | 1.00      |
| 9 - 17         | 0.75      |
| 18 - 26        | 0.60      |
| 27 - 35        | 0.45      |
| 36 - 42        | 0.30      |
| 43 - 48        | 0.15      |
| 49+            | 0.00      |

---

### 3. **Perhitungan Premi**
Tab untuk menghitung dan mereview premi deres per periode.

#### Fitur:
- ✅ Form perhitungan premi baru dengan dialog modal
- ✅ Input nama periode (contoh: Desember 2024 - Minggu 1)
- ✅ Date range picker (tanggal mulai - akhir)
- ✅ Pilih divisi untuk perhitungan
- ✅ Summary cards menampilkan:
  - Total periode
  - Total penderes
  - Total premi kotor
  - Periode aktif
- ✅ Tabel perhitungan dengan breakdown:
  - Premi Produksi
  - Premi Kualitas
  - Premi Supervisor
  - Total Premi Kotor
- ✅ Status tracking: DIHITUNG, DIREVIEW
- ✅ Action buttons: View detail, Export

#### Struktur Data:
```typescript
{
  id: string
  periode_nama: string
  tanggal_mulai: string (YYYY-MM-DD)
  tanggal_akhir: string (YYYY-MM-DD)
  divisi: string
  total_penderes: number
  total_premi_produksi: number
  total_premi_kualitas: number
  total_premi_supervisor: number
  total_premi_kotor: number
  status: 'calculated' | 'reviewed' | 'approved'
  calculated_at: string (timestamp)
}
```

---

## 🗄️ Database Testing

### Test Script
File: `test_premi_deres_connection.ts`

Test script telah dibuat dan dijalankan untuk memverifikasi:
- ✅ Koneksi database Supabase
- ✅ Struktur tabel master (premi_deres_konfigurasi, premi_deres_ancak_master, dll)
- ✅ Struktur tabel transaksi (premi_deres_produksi_harian, premi_deres_quality_check_harian, dll)
- ✅ Permissions dan RLS policies

#### Cara menjalankan test:
```bash
npx tsx test_premi_deres_connection.ts
```

#### Hasil Test:
```
✅ Database connection: OK
✅ Master tables: OK
✅ Transaction tables: OK
⚠️  Tables exist but no seed data yet
```

---

## 🔗 Integrasi Database

### Tabel yang Digunakan:

#### Master Tables:
- `premi_deres_konfigurasi` - Header konfigurasi premi
- `premi_deres_ancak_master` - Master data ancak
- `premi_deres_produksi_normal` - Tarif premi produksi normal
- `premi_deres_kualitas` - Tier koefisien premi kualitas
- `premi_deres_quality_inspection` - Kriteria kesalahan QC

#### Transaction Tables:
- `premi_deres_produksi_harian` - Input produksi harian
- `premi_deres_quality_check_harian` - Input quality check harian
- `premi_deres_periode_perhitungan` - Header periode perhitungan
- `premi_deres_perhitungan_detail` - Detail perhitungan per penderes

---

## 🎨 UI Components

### Komponen yang Digunakan:
- `Card` - Container utama
- `Tabs` - Navigasi antar tab
- `Dialog` - Modal form input
- `Table` - Tabel data
- `Calendar` - Date picker
- `Select` - Dropdown filter
- `Input` - Form input
- `Badge` - Status indicator
- `Button` - Action buttons

### Icons (lucide-react):
- `Droplets` - Icon utama premi deres
- `Upload` - Input produksi
- `CheckCircle` - Quality check
- `Calculator` - Perhitungan premi
- `Plus` - Tambah data
- `Edit` - Edit data
- `Trash2` - Hapus data
- `Save` - Simpan data
- `Eye` - Lihat detail
- `FileDown` - Export data

---

## 📱 Responsive Design

- ✅ Desktop optimized (1920x1080)
- ✅ Tablet friendly dengan overflow-x-auto pada tabs
- ✅ Mobile friendly dengan wrapping tabs
- ✅ Dialog modal dengan max-width responsif

---

## 🔐 Access Control

Menu ini menggunakan role-based access control yang sudah terintegrasi dengan sistem:
- **Super Admin**: Full access
- **Admin**: Full access
- **Manager**: View & create
- **Staff**: View only

Permission module: `premi_deres_penggajian`

---

## 📊 Status Workflow

### Produksi Harian:
1. **DIAJUKAN** (submitted) - Data baru diinput
2. **DISETUJUI** (approved) - Data diverifikasi mandor/krani
3. **DITOLAK** (rejected) - Data ditolak, perlu revisi

### Quality Check:
1. **DIAJUKAN** (submitted) - QC baru diinput
2. **DISETUJUI** (approved) - QC diverifikasi supervisor
3. **DITOLAK** (rejected) - QC ditolak, perlu re-check

### Perhitungan Premi:
1. **DIHITUNG** (calculated) - Premi sudah dihitung
2. **DIREVIEW** (reviewed) - Premi dalam review
3. **DISETUJUI** (approved) - Premi siap dibayar

---

## 🚀 Next Steps (Future Enhancement)

### Phase 2:
- [ ] Integrasi real-time dengan Supabase (fetch, insert, update, delete)
- [ ] Auto-calculate premi produksi berdasarkan tarif
- [ ] Auto-populate dropdown dari master data
- [ ] Validasi duplikasi (NIK + tanggal + ancak)
- [ ] Export to Excel/PDF

### Phase 3:
- [ ] Bulk import via Excel
- [ ] Approval workflow dengan notifikasi
- [ ] History tracking (audit log)
- [ ] Dashboard analytics
- [ ] Mobile app integration

---

## 📝 Sample Data

### Input Produksi Harian:
```json
{
  "tanggal": "2024-12-01",
  "employee_id": "EMP-AL-0123",
  "nama_karyawan": "Ahmad Sutanto",
  "ancak_kode": "ANC-001",
  "divisi": "AP Div I",
  "jenis_produksi": "normal",
  "lateks_kg": 45.5,
  "lower_grades_kg": 2.3,
  "lump_kg": 1.2,
  "scraps_kg": 0.5
}
```

### Input Quality Check:
```json
{
  "tanggal": "2024-12-01",
  "employee_id": "EMP-AL-0123",
  "kesalahan_dangkal": 2,
  "kesalahan_luka": 1,
  "kesalahan_sudut": 0,
  "kesalahan_kulit": 1,
  "kesalahan_alat": 0,
  "kesalahan_disiplin": 0,
  "total_kesalahan": 4,
  "koefisien_pq": 1.00
}
```

---

## 📚 Reference Documents

- Surat Instruksi No: TN/GR III/R/099/2024 (25 Mei 2024)
- [test_premi_deres_queries.sql](test_premi_deres_queries.sql) - SQL test queries
- [PremiDeresMaster.tsx](src/components/PremiDeresMaster.tsx) - Master data reference

---

## 🐛 Known Issues

Tidak ada issue pada saat implementasi awal.

---

## ✅ Testing Checklist

- [x] Database connection test
- [x] Component rendering
- [x] Tab navigation
- [x] Dialog modal open/close
- [x] Calendar date picker
- [x] Form validation (basic)
- [x] Table display
- [x] Filter functionality (UI ready)
- [x] Status badges
- [x] Currency formatting
- [x] Date formatting (Indonesian locale)
- [ ] Supabase CRUD operations (Phase 2)
- [ ] Real data integration (Phase 2)

---

## 📞 Support

Untuk pertanyaan atau issue, silakan hubungi:
- Development Team
- Sigma Payroll Web Design Project

---

**Last Updated**: 13 November 2024
**Version**: 1.0.0
**Status**: ✅ Completed - UI Implementation with Mock Data
