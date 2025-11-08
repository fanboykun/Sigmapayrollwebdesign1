# Fitur Workflow Status Karyawan

## Deskripsi
Fitur ini menambahkan kemampuan untuk melacak status workflow karyawan yang terintegrasi dengan tab Probasi, Rekrutmen, dan Terminasi.

## Status Workflow yang Tersedia

1. **Tidak Ada (none)** - Status default, karyawan dalam kondisi normal
2. **Rekrutmen (recruitment)** - Karyawan sedang dalam proses rekrutmen
3. **Probasi (probation)** - Karyawan sedang dalam masa probasi
4. **Terminasi (termination)** - Karyawan sedang dalam proses terminasi

## Cara Kerja

### 1. Set Workflow Status pada Data Karyawan

Di menu **Data Karyawan** → **Tab Pekerjaan**:
- Field "Status Workflow": Dropdown untuk memilih status workflow
- Field "Status Aktual Saat Ini": Menampilkan badge status aktual dengan warna yang berbeda

### 2. Integrasi dengan Tab Workflow

#### Tab Probasi
- Karyawan dengan `workflow_status = 'probation'` akan muncul di tab Probasi
- Ketika probasi disetujui/diselesaikan dari tab Probasi, status akan otomatis berubah ke `'none'`

#### Tab Rekrutmen
- Karyawan dengan `workflow_status = 'recruitment'` akan muncul di tab Rekrutmen
- Ketika rekrutmen disetujui dari tab Rekrutmen, status akan otomatis berubah ke `'probation'` atau `'none'`

#### Tab Terminasi
- Karyawan dengan `workflow_status = 'termination'` akan muncul di tab Terminasi
- Ketika terminasi disetujui dari tab Terminasi, status karyawan akan diupdate ke `'inactive'` dan workflow_status menjadi `'none'`

## Implementasi

### Database Schema

```sql
-- Kolom baru di tabel employees
workflow_status VARCHAR(20) DEFAULT 'none' CHECK (workflow_status IN ('none', 'recruitment', 'probation', 'termination'))
```

### Interface TypeScript

```typescript
interface Employee {
  // ... field lainnya
  workflowStatus?: "none" | "recruitment" | "probation" | "termination";
}
```

## Alur Kerja 2 Arah

### Dari Data Karyawan ke Tab Workflow

1. Admin mengubah workflow status karyawan di tab Pekerjaan
2. Karyawan otomatis muncul di tab yang sesuai (Probasi/Rekrutmen/Terminasi)

### Dari Tab Workflow ke Data Karyawan

1. Admin menyetujui/menyelesaikan proses di tab Probasi/Rekrutmen/Terminasi
2. Sistem otomatis mengupdate `workflow_status` di data karyawan
3. Status karyawan berubah sesuai hasil approval

## Warna Badge

- **Tidak Ada**: Abu-abu
- **Rekrutmen**: Biru (`bg-blue-500/10 text-blue-500`)
- **Probasi**: Orange (`bg-orange-500/10 text-orange-500`)
- **Terminasi**: Merah (`bg-red-500/10 text-red-500`)

## Migration SQL

Jalankan file migration berikut untuk menambahkan kolom workflow_status ke database:

```bash
migrations/add_workflow_status_to_employees.sql
```

## Catatan Penting

- Field ini bersifat opsional, default value adalah `'none'`
- Perubahan status workflow akan ter-sync secara otomatis antara Data Karyawan dan Tab Workflow
- Ketika karyawan di-terminasi (approved), status akan berubah menjadi `'inactive'` dan workflow_status kembali ke `'none'`

## Screenshot UI

### Tab Pekerjaan - Form Field
- Dropdown "Status Workflow" untuk memilih status
- Badge "Status Aktual Saat Ini" yang menampilkan status dengan warna yang sesuai
- Info box yang menjelaskan integrasi dengan tab workflow

### Dialog View Karyawan
- Badge workflow status ditampilkan bersama dengan badge golongan dan status karyawan
- Hanya tampil jika workflow status bukan `'none'`

## Future Enhancement

1. Tambahkan notifikasi otomatis ketika status workflow berubah
2. Tambahkan filter berdasarkan workflow status di tabel karyawan
3. Tambahkan laporan workflow status karyawan
4. Integrasi dengan system approval workflow
