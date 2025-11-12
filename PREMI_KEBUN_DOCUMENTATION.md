# Dokumentasi Modul Premi Kebun
## Sigma Payroll System

**Version:** 1.0.0
**Date:** 2025-11-12
**Author:** Sigma Payroll Team
**Reference:** Surat TN/Gr I-SL/R/346/24 - Sistem Premi Panen TBS 2024

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Struktur Menu](#struktur-menu)
4. [Migration Files](#migration-files)
5. [Cara Install](#cara-install)
6. [Next Steps](#next-steps)

---

## 🎯 Overview

Modul Premi Kebun adalah sistem pengelolaan premi untuk panen Tandan Buah Segar (TBS) di perkebunan kelapa sawit. Sistem ini mengadopsi dokumen **TN/Gr I-SL/R/346/24** dari PT Socfin Indonesia untuk Kebun Sei Liput.

### Fitur Utama

✅ **Master Data:**
- Konfigurasi Premi per Estate/Tahun
- Basis Premi per Umur Tanaman (3-36 tahun)
- Tingkatan Premi Lebih Basis (6 tier)
- Premi Jabatan (Mandor I, Mandor Panen, Kerani Buah)
- Denda & Sanksi (11 jenis pelanggaran)
- Jam Kerja & Overtime
- Blok Kebun

✅ **Transaksi Penggajian:**
- Input Panen Harian per Karyawan
- Input Denda/Sanksi Harian
- Perhitungan Premi Batch
- Adjustment Basis Antar Blok
- Approval Workflow (3 level)

✅ **Laporan:**
- Summary Premi per Karyawan
- Detail Panen Harian
- Detail Denda
- Analisis Produktivitas Blok

---

## 🗄️ Database Schema

### Master Data Tables (7 tables)

#### 1. `premi_konfigurasi`
Header konfigurasi premi per estate dan tahun.

```sql
Columns:
- id (UUID, PK)
- kode_konfigurasi (VARCHAR(20), UNIQUE)
- estate_id (UUID, FK → divisions)
- tahun_berlaku (INTEGER)
- tanggal_mulai, tanggal_akhir (DATE)
- status (VARCHAR: aktif/tidak_aktif)
- nomor_surat, tanggal_surat
- deskripsi
```

#### 2. `premi_basis`
Basis janjang berdasarkan umur tanaman.

```sql
Columns:
- id (UUID, PK)
- konfigurasi_id (UUID, FK → premi_konfigurasi)
- umur_tanaman (INTEGER)
- basis_lama, ratio_basis_baru
- basis_baru (COMPUTED: basis_lama × ratio)
- harga_per_janjang, harga_lebih_basis
```

#### 3. `premi_tingkatan_lebih_basis`
Tier premi berdasarkan pencapaian basis.

```sql
Columns:
- id (UUID, PK)
- konfigurasi_id (UUID, FK)
- tingkat (INTEGER: 1-6)
- dari_basis, sampai_basis (NUMERIC)
- operator_dari, operator_sampai (>=, <, etc)
- premi_siap_1_basis, premi_siap_2_basis, premi_siap_3_basis
```

Example Data:
| Tingkat | Dari | Sampai | Premi 1 | Premi 2 | Premi 3 |
|---------|------|--------|---------|---------|---------|
| 1 | < 1.25 | - | 0 | 0 | 0 |
| 2 | ≥ 1.25 | < 1.5 | 35,000 | 50,000 | 65,000 |
| 3 | ≥ 1.5 | < 1.75 | 35,000 | 50,000 | 65,000 |
| 6 | ≥ 3 | - | 35,000 | 50,000 | 65,000 |

#### 4. `premi_jabatan`
Konfigurasi premi untuk posisi supervisor.

```sql
Columns:
- jenis_jabatan (mandor_i, mandor_panen, kerani_buah)
- tipe_perhitungan (persentase, multiplier, fixed)
- nilai
- syarat_jumlah_min, syarat_jumlah_max
- multiplier
```

Example:
- Mandor I (3 bawahan): 1.5× rata-rata premi mandor
- Mandor I (>3 bawahan): 1.6× rata-rata premi mandor
- Mandor Panen: 12% dari total premi karyawan
- Kerani Buah: 10% dari total premi karyawan

#### 5. `premi_denda`
Master denda/sanksi.

```sql
11 Jenis Denda:
A  - Buah Mentah (Rp 10,000/janjang)
G  - Gagang Panjang (Rp 1,000/janjang)
S  - Buah Masak Tinggal (Rp 2,000/janjang)
M1 - Buah Mentah Diperam (Rp 10,000/janjang)
M2 - Buah Tinggal di Piringan (Rp 2,000/janjang)
M3 - Brondolan Tinggal (Rp 1,000/janjang)
B1 - Brondolan < 20 butir (Rp 1,000/pokok)
B2 - Brondolan ≥ 20 butir (Rp 3,000/pokok)
R  - Rumpukan Tidak Rapi (Rp 1,000/rumpukan)
C  - Cabang Sengleh (Rp 1,000/pokok)
ABSENT - Tidak Hadir 7 Hari (Rp 10,000)
```

#### 6. `premi_jam_kerja`
Konfigurasi jam kerja dan overtime.

```sql
- Hari Biasa: 7 jam
- Hari Jumat: 5 jam
- Basis Minimum: 1.25
- Formula Jumat: (5/7) × basis
- Overtime Tarif: Rp 75,000 (jika basis > 3)
```

#### 7. `premi_blok_kebun`
Master blok kebun.

```sql
Columns:
- kode_blok (VARCHAR, UNIQUE)
- nama_blok
- estate_id (FK → divisions)
- umur_tanaman
- luas_hektar, jumlah_pokok, tahun_tanam
- prioritas_basis (untuk adjustment)
```

---

### Transaction Tables (6 tables)

#### 1. `premi_panen_harian`
Input panen harian per karyawan.

```sql
Columns:
- tanggal_panen
- blok_id, employee_id
- tipe_hari (hari_biasa, jumat, minggu_libur)
- janjang_dipanen
- basis_janjang, basis_dicapai
- kategori_premi
- mandor_id, kerani_id
- status (draft, submitted, approved, processed)
```

#### 2. `premi_denda_harian`
Input denda per karyawan.

```sql
Columns:
- tanggal
- employee_id, denda_id
- jumlah, nilai_satuan
- total_denda (COMPUTED: jumlah × nilai_satuan)
- dikenakan_oleh_id
```

#### 3. `premi_periode_perhitungan`
Periode perhitungan premi.

```sql
Columns:
- konfigurasi_id, estate_id
- periode_nama
- tanggal_mulai, tanggal_akhir
- total_karyawan, total_premi_kotor, total_denda, total_premi_netto
- status (draft, calculated, reviewed, approved, integrated)
- approved_by, approved_at
```

#### 4. `premi_hasil_perhitungan`
Hasil perhitungan premi per karyawan.

```sql
Columns for Pemanen:
- total_hari_kerja, total_janjang_dipanen
- total_basis_dicapai, rata_rata_basis
- premi_lebih_basis
- premi_siap_1_basis, premi_siap_2_basis, premi_siap_3_basis
- premi_overtime
- total_premi_kotor, total_denda, premi_netto

Columns for Mandor/Kerani:
- jumlah_bawahan
- total_premi_bawahan
- persentase_premi, multiplier_premi
```

#### 5. `premi_approval_log`
Log approval workflow.

```sql
3 Level Approval:
1. Kerani Buah
2. Mandor Panen
3. Group Manager

Actions: approved, rejected, revision_requested
```

#### 6. `premi_adjustment_blok`
Adjustment basis antar blok.

```sql
Columns:
- blok_dari_id, blok_ke_id
- basis_target, basis_tercapai
- persentase_kekurangan
- jumlah_adjustment
```

---

## 📂 Struktur Menu

```
Payroll
│
├── Master Data
│   └── Premi Kebun
│       ├── Tab: Konfigurasi
│       ├── Tab: Basis Premi
│       ├── Tab: Lebih Basis
│       ├── Tab: Jabatan
│       ├── Tab: Denda & Sanksi
│       ├── Tab: Jam Kerja
│       └── Tab: Blok Kebun
│
├── Penggajian
│   └── Premi Kebun
│       ├── Tab: Input Panen Harian
│       ├── Tab: Input Denda
│       ├── Tab: Perhitungan Premi
│       ├── Tab: Adjustment Blok
│       └── Tab: Approval & Integrasi
│
└── Laporan
    └── Premi Kebun
        ├── Tab: Summary Premi
        ├── Tab: Detail Panen
        ├── Tab: Detail Denda
        └── Tab: Analisis Produktivitas
```

---

## 📦 Migration Files

### File yang Sudah Dibuat

1. **025_premi_kebun_master_data.sql**
   - Creates 7 master data tables
   - Implements RLS policies
   - Adds indexes and triggers
   - Adds permissions to role_permissions

2. **026_premi_kebun_transaksi.sql**
   - Creates 6 transaction tables
   - Implements RLS policies
   - Adds indexes and triggers
   - Adds permissions for premi_penggajian and premi_laporan modules

3. **027_premi_kebun_seed_data.sql**
   - Inserts configuration for Sei Liput 2024
   - Inserts 36 basis data (umur 3-36 tahun)
   - Inserts 6 tier premi lebih basis
   - Inserts 4 premi jabatan rules
   - Inserts 11 types of denda/sanksi
   - Inserts jam kerja configuration
   - Inserts 5 sample blok kebun

---

## 🚀 Cara Install

### 1. Run Migrations

```bash
# Connect to Supabase
npx supabase db push

# Or run migrations individually
npx supabase migration up

# Verify tables created
npx supabase db remote-dump --schema public --data-only=false | grep "CREATE TABLE" | grep premi
```

### 2. Verify Data

```sql
-- Check konfigurasi
SELECT * FROM premi_konfigurasi;

-- Check basis premi
SELECT * FROM premi_basis ORDER BY umur_tanaman;

-- Check tingkatan
SELECT * FROM premi_tingkatan_lebih_basis ORDER BY tingkat;

-- Check denda
SELECT * FROM premi_denda ORDER BY kode_denda;

-- Check permissions
SELECT rp.*, r.code as role_code
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE module_name LIKE 'premi%'
ORDER BY r.code, rp.module_name;
```

### 3. Test RLS Policies

```sql
-- Test as super_admin
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id-here"}';

SELECT * FROM premi_konfigurasi;
```

---

## 📝 Next Steps

### Phase 1: Frontend Components (In Progress)

- [ ] Create `PremiMaster.tsx` with 7 tabs
- [ ] Create `PremiPenggajian.tsx` with 5 tabs
- [ ] Create `PremiLaporan.tsx` with 4 tabs

### Phase 2: Business Logic

- [ ] Create calculation functions for premi
- [ ] Create adjustment blok algorithm
- [ ] Create approval workflow logic

### Phase 3: Integration

- [ ] Integrate with Payroll Processing
- [ ] Create premi component in payroll_records
- [ ] Export to Excel functionality

### Phase 4: Testing

- [ ] Unit tests for calculation logic
- [ ] Integration tests with payroll
- [ ] UAT with sample data

---

## 🔐 Security & Permissions

### Role Permissions

| Module | Super Admin | Admin | Manager | Karyawan |
|--------|-------------|-------|---------|----------|
| premi_master | VCED | VCED | V | - |
| premi_penggajian | VCED | VCED | V | - |
| premi_laporan | V | V | V | - |

**Legend:** V = View, C = Create, E = Edit, D = Delete

### RLS Policies

All tables have RLS enabled with policies for:
- Super Admin: Full access
- Admin: Full access
- Manager: View only
- Karyawan: No access (except own data in future)

---

## 📊 Sample Data Overview

### Basis Premi (36 entries)

| Umur | Basis Lama | Ratio | Basis Baru | Harga Lebih Basis |
|------|------------|-------|------------|-------------------|
| 3 | 220 | 1.2 | 264 | 0 |
| 14 | 60 | 1.4 | 84 | 538 |
| 18+ | 40 | 1.85 | 74 | 0 |

### Premi Tingkatan (6 tiers)

All tiers have same premi siap values:
- 1 Basis: Rp 35,000
- 2 Basis: Rp 50,000
- 3 Basis: Rp 65,000

### Blok Kebun (5 blocks)

| Kode | Nama | Umur | Luas (Ha) | Prioritas |
|------|------|------|-----------|-----------|
| SL-001 | Blok I | 14 | 25.5 | 1 |
| SL-002 | Blok II | 16 | 30.0 | 2 |
| SL-003 | Blok III | 18 | 28.0 | 3 |
| SL-004 | Blok Muda A | 5 | 22.0 | 4 |
| SL-005 | Blok Muda B | 7 | 20.0 | 5 |

---

## 🧮 Formula Perhitungan

### 1. Basis Dicapai

```
Hari Biasa (7 jam):
  Basis = Janjang Dipanen / Basis Janjang Blok

Hari Jumat (5 jam):
  Basis = (5/7) × (Janjang Dipanen / Basis Janjang Blok)

Pembulatan:
  - Jika < 0.5 → bulatkan ke bawah
  - Jika ≥ 0.5 → bulatkan ke atas
```

### 2. Premi Karyawan Panen

```
IF Basis < 1.25:
  Premi = Tarif Harga 1 Basis

ELSE IF Basis >= 1.25:
  Janjang Lebih = Janjang Dipanen - Basis Janjang
  Premi Lebih = Janjang Lebih × Harga Lebih Basis
  Premi Siap = Sesuai tier yang dicapai (1/2/3 basis)

  IF Hari Minggu/Libur AND Basis > 3:
    Premi Overtime = Rp 75,000

  Total Premi = Premi Lebih + Premi Siap + Premi Overtime
```

### 3. Premi Mandor Panen

```
Premi Mandor = 12% × Total Premi Karyawan Bawahan
```

### 4. Premi Mandor I

```
IF Jumlah Mandor = 3:
  Premi = 1.5 × Rata-rata Premi Mandor

IF Jumlah Mandor > 3:
  Premi = 1.6 × Rata-rata Premi Mandor
```

### 5. Premi Kerani Buah

```
Premi Kerani = 10% × Total Premi Karyawan Area
```

### 6. Adjustment Basis Antar Blok

```
Jika Blok I kekurangan basis:
  Persentase Kekurangan = (Target - Tercapai) / Target × 100%
  Adjustment ke Blok II = Persentase Kekurangan × Basis Blok II
  Basis Baru Blok II = Basis Awal + Adjustment
```

---

## 📞 Support

Untuk pertanyaan atau bantuan, hubungi:
- **Developer Team:** Sigma Payroll Team
- **Documentation:** [PREMI_KEBUN_DOCUMENTATION.md](PREMI_KEBUN_DOCUMENTATION.md)
- **Reference:** Surat TN/Gr I-SL/R/346/24

---

**Last Updated:** 2025-11-12
**Status:** ✅ Database Schema Complete, Frontend In Progress
