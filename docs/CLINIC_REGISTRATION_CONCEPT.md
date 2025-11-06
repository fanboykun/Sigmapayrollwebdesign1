# KONSEP MODUL PENDAFTARAN PASIEN KLINIK
## PT. Socfin Indonesia - Sistem Klinik Perusahaan

---

## 1. OVERVIEW

### 1.1 Tujuan Modul
Modul Pendaftaran Pasien dirancang untuk memfasilitasi proses registrasi pasien yang berobat ke klinik perusahaan dengan sistem yang fleksibel, mencakup:
- Karyawan PT. Socfindo dan keluarganya
- Karyawan Kebun Sepupu dan keluarganya
- Pasien Umum

### 1.2 User yang Dapat Melakukan Entry Data
1. **Perawat** - User utama untuk pendaftaran
2. **Petugas Klinik** - Staf administrasi klinik
3. **Dokter** - Dapat melakukan registrasi langsung
   - Dokter Internal (Karyawan PKWT PT. Socfindo)
   - Dokter Eksternal (Pihak ke-3/Kontraktual)

---

## 2. ALUR UTAMA PENDAFTARAN

### 2.1 Flow Chart Umum

```
┌─────────────────────────────────────────────────────┐
│          MULAI PENDAFTARAN PASIEN                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│    Pilih Jenis Pasien:                             │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│    │ Karyawan │  │ Sepupu   │  │  Umum    │       │
│    └──────────┘  └──────────┘  └──────────┘       │
└────┬───────────────┬───────────────┬───────────────┘
     │               │               │
     │               │               │
     ▼               ▼               ▼
┌─────────┐    ┌──────────┐    ┌──────────┐
│Flow A   │    │ Flow B   │    │ Flow C   │
│Karyawan │    │ Sepupu   │    │  Umum    │
└─────────┘    └──────────┘    └──────────┘
```

---

## 3. FLOW A: PENDAFTARAN KARYAWAN PT. SOCFINDO

### 3.1 Sub-Kategori Karyawan

#### A.1 Karyawan Sendiri
```
1. Pilih "Karyawan"
2. Search/Pilih Nama Karyawan
   ├─ Search by: NIK, Nama, Divisi
   ├─ Auto-complete suggestion
   └─ Tampilkan list karyawan
3. Pilih Karyawan dari List
4. Sistem Auto-fill Data:
   ├─ NIK
   ├─ Nama Lengkap
   ├─ Divisi
   ├─ Jabatan
   ├─ Tanggal Lahir / Usia
   ├─ Jenis Kelamin
   ├─ Alamat
   ├─ No. Telp
   ├─ Status Pernikahan
   ├─ BPJS Kesehatan
   ├─ Golongan Darah (jika ada di master)
   ├─ Tinggi Badan (data terakhir)
   ├─ Berat Badan (data terakhir)
   └─ Riwayat Kunjungan Terakhir
5. Verifikasi & Update Data (Optional)
   ├─ Update TB/BB terkini
   ├─ Update No. Telp
   └─ Update Gol. Darah jika kosong
6. Input Data Kunjungan:
   ├─ Keluhan Utama
   ├─ Alergi (jika ada)
   ├─ Tindakan yang Dibutuhkan
   └─ Catatan Tambahan
7. Simpan & Cetak Nomor Antrian
```

#### A.2 Keluarga Karyawan (Istri/Anak)
```
1. Pilih "Karyawan"
2. Search Nama Karyawan (Kepala Keluarga)
3. Sistem Menampilkan:
   ┌─────────────────────────────────────────┐
   │ Karyawan: Ahmad Hidayat (NIK: 001)      │
   │                                         │
   │ Anggota Keluarga Terdaftar:             │
   │ ┌─────────────────────────────────────┐ │
   │ │ ☑ Ahmad Hidayat (Karyawan)          │ │
   │ │ ☐ Siti Aminah (Istri)               │ │
   │ │ ☐ Budi Ahmad (Anak, L, 10 th)       │ │
   │ │ ☐ Ani Ahmad (Anak, P, 7 th)         │ │
   │ └─────────────────────────────────────┘ │
   └─────────────────────────────────────────┘
4. Pilih Anggota Keluarga (Istri/Anak)
5. Sistem Auto-fill Data:
   ├─ Nama Lengkap
   ├─ Hubungan (Istri/Anak)
   ├─ NIK Keluarga
   ├─ Tanggal Lahir / Usia
   ├─ Jenis Kelamin
   ├─ BPJS Kesehatan Keluarga
   ├─ Golongan Darah (jika ada)
   ├─ Tinggi Badan (data terakhir)
   ├─ Berat Badan (data terakhir)
   └─ Riwayat Kunjungan Terakhir
6. Verifikasi & Update Data
7. Input Data Kunjungan
8. Simpan & Cetak Nomor Antrian
```

#### A.3 Alternative Search: Langsung by Nama Istri/Anak
```
Scenario: Perawat langsung tahu nama istri/anak tanpa tahu nama karyawan

1. Pilih "Karyawan"
2. Ketik Nama: "Siti Aminah"
3. Sistem Menampilkan:
   ┌─────────────────────────────────────────┐
   │ Hasil Pencarian "Siti Aminah":          │
   │                                         │
   │ ✓ Siti Aminah (Istri dari Ahmad H.)    │
   │   NIK Karyawan: 001                     │
   │   Divisi: Divisi 1                      │
   │                                         │
   │ ✓ Siti Aminah (Karyawan)                │
   │   NIK: 025                              │
   │   Divisi: Kantor Pusat                  │
   └─────────────────────────────────────────┘
4. Pilih yang sesuai
5. Lanjut ke proses auto-fill
```

---

## 4. FLOW B: PENDAFTARAN KEBUN SEPUPU

### 4.1 Karakteristik Kebun Sepupu
- Karyawan dari kebun mitra/sepupu yang tidak terdata di master data Sigma
- Memiliki perjanjian kerjasama pelayanan kesehatan
- Data harus diisi manual (tidak ada di master)
- Juga memiliki kategori: Karyawan dan Keluarga

### 4.2 Alur Pendaftaran

#### B.1 Karyawan Kebun Sepupu
```
1. Pilih "Kebun Sepupu"
2. Pilih Nama Kebun Sepupu (Dropdown):
   ├─ Kebun Aek Loba
   ├─ Kebun Tanah Gambus
   ├─ Kebun Helvetia
   └─ [List kebun sepupu lainnya]
3. Input Data Manual:
   ┌────────────────────────────────────────┐
   │ ✱ NIK Kebun Sepupu: _____________      │
   │ ✱ Nama Lengkap: _________________      │
   │ ✱ Tanggal Lahir: [DD/MM/YYYY]          │
   │ ✱ Jenis Kelamin: [○ L  ○ P]            │
   │   No. BPJS Kesehatan: ___________      │
   │   Golongan Darah: [Dropdown]           │
   │   Tinggi Badan: _____ cm               │
   │   Berat Badan: _____ kg                │
   │   Alamat: ______________________       │
   │   No. Telp: ___________________        │
   │   Status: [○ Karyawan ○ Keluarga]      │
   └────────────────────────────────────────┘
4. Sistem Check Duplikasi:
   - Check berdasarkan NIK + Nama
   - Jika sudah pernah terdaftar → Tampilkan data lama
   - Jika baru → Simpan sebagai pasien baru
5. Input Data Kunjungan
6. Simpan & Cetak Nomor Antrian
```

#### B.2 Keluarga Karyawan Kebun Sepupu
```
1. Pilih "Kebun Sepupu"
2. Pilih Nama Kebun Sepupu
3. Search/Input Nama Karyawan Sepupu
4. Jika Karyawan Sudah Pernah Terdaftar:
   ┌────────────────────────────────────────┐
   │ Data Ditemukan:                         │
   │ NIK: 123-SEPUPU                         │
   │ Nama: Budiman                           │
   │ Kebun: Aek Loba                         │
   │                                         │
   │ Anggota Keluarga Terdaftar:             │
   │ ☐ Budiman (Karyawan)                    │
   │ ☐ Dewi (Istri)                          │
   │ ☐ Rina (Anak, P, 5 th)                  │
   │                                         │
   │ [+ Tambah Anggota Keluarga Baru]        │
   └────────────────────────────────────────┘
5. Jika Karyawan Belum Pernah Terdaftar:
   - Input data karyawan terlebih dahulu
   - Lalu input data keluarga
6. Input Data Kunjungan
7. Simpan & Cetak Nomor Antrian
```

---

## 5. FLOW C: PENDAFTARAN PASIEN UMUM

### 5.1 Karakteristik Pasien Umum
- Bukan karyawan PT. Socfindo atau kebun sepupu
- Bisa masyarakat umum sekitar
- Pelayanan berbayar atau sesuai kebijakan klinik
- Data minimal yang diperlukan

### 5.2 Alur Pendaftaran
```
1. Pilih "Umum"
2. Input Data Manual:
   ┌────────────────────────────────────────┐
   │ ✱ NIK KTP: ____________________        │
   │ ✱ Nama Lengkap: _______________        │
   │ ✱ Tanggal Lahir: [DD/MM/YYYY]          │
   │   (Usia otomatis terhitung)            │
   │ ✱ Jenis Kelamin: [○ L  ○ P]            │
   │   No. BPJS Kesehatan: __________       │
   │   Golongan Darah: [Dropdown]           │
   │   Tinggi Badan: _____ cm               │
   │   Berat Badan: _____ kg                │
   │   Alamat: ______________________       │
   │   No. Telp/HP: _________________       │
   │   Pekerjaan: ___________________       │
   └────────────────────────────────────────┘
3. Sistem Check Duplikasi by NIK
4. Input Data Kunjungan:
   ├─ Keluhan Utama
   ├─ Alergi (jika ada)
   ├─ Cara Bayar: [BPJS/Umum/Asuransi]
   └─ Catatan Tambahan
5. Simpan & Cetak Nomor Antrian
```

---

## 6. STRUKTUR DATA YANG DIPERLUKAN

### 6.1 Data Master Karyawan (Sudah Ada)
```typescript
interface Employee {
  id: string;
  employeeId: string; // NIK
  fullName: string;
  division: string;
  position: string;
  birthDate: Date;
  gender: 'male' | 'female';
  address: string;
  phone: string;
  email?: string;
  maritalStatus: 'single' | 'married' | 'divorced';
  bpjsHealthNumber?: string;
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

  // Data Keluarga
  spouse?: {
    nik?: string;
    fullName: string;
    birthDate: Date;
    bpjsHealthNumber?: string;
    bloodType?: string;
  };

  children?: Array<{
    nik?: string;
    fullName: string;
    birthDate: Date;
    gender: 'male' | 'female';
    bpjsHealthNumber?: string;
    bloodType?: string;
  }>;
}
```

### 6.2 Data Kebun Sepupu (Baru)
```typescript
interface PartnerPlantation {
  id: string;
  code: string; // KS-01, KS-02, dst
  name: string; // Kebun Aek Loba, Tanah Gambus, dst
  address: string;
  contactPerson: string;
  phone: string;
  cooperationStartDate: Date;
  cooperationEndDate?: Date;
  isActive: boolean;
  notes?: string;
}
```

### 6.3 Data Pasien (Unified)
```typescript
type PatientType = 'employee' | 'employee_family' | 'partner' | 'partner_family' | 'public';
type FamilyRelation = 'self' | 'spouse' | 'child';
type PaymentMethod = 'company' | 'bpjs' | 'cash' | 'insurance';

interface Patient {
  id: string; // UUID
  patientNumber: string; // Auto-generated: PAT-2025-00001

  // Tipe Pasien
  patientType: PatientType;

  // Data Identitas
  nik?: string; // NIK KTP atau NIK Karyawan
  fullName: string;
  birthDate: Date;
  age?: number; // Auto-calculated
  gender: 'male' | 'female';
  address: string;
  phone: string;

  // Relasi Karyawan (jika applicable)
  employeeId?: string; // FK to employees
  familyRelation?: FamilyRelation;

  // Relasi Kebun Sepupu (jika applicable)
  partnerPlantationId?: string; // FK to partner_plantations
  partnerEmployeeNik?: string;

  // Data Kesehatan
  bloodType?: string;
  height?: number; // cm
  weight?: number; // kg
  bmi?: number; // Auto-calculated
  bpjsHealthNumber?: string;
  allergies?: string[];

  // Data Pekerjaan (untuk pasien umum)
  occupation?: string;

  // Metadata
  registeredBy: string; // FK to users
  registeredDate: Date;
  isActive: boolean;
  notes?: string;
}
```

### 6.4 Data Pendaftaran/Registrasi Kunjungan
```typescript
interface ClinicRegistration {
  id: string;
  registrationNumber: string; // Auto: REG-20251106-0001
  registrationDate: Date;

  // Pasien
  patientId: string; // FK to patients

  // Data Kunjungan
  visitType: 'new' | 'follow_up' | 'emergency';
  chiefComplaint: string; // Keluhan utama
  vitalSigns?: {
    bloodPressure?: string; // 120/80
    temperature?: number; // Celsius
    heartRate?: number; // bpm
    respiratoryRate?: number; // per minute
    oxygenSaturation?: number; // %
    height?: number;
    weight?: number;
  };

  // Alokasi
  queueNumber: number;
  doctorId?: string; // FK to clinic_doctors
  roomId?: string; // FK to clinic_rooms

  // Status
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';

  // Pembayaran
  paymentMethod: PaymentMethod;

  // Metadata
  registeredBy: string; // FK to users (perawat/petugas)
  notes?: string;
}
```

---

## 7. FITUR TAMBAHAN & OPTIMASI

### 7.1 Auto-Complete & Smart Search
```typescript
// Fitur pencarian cerdas
- Search by NIK (exact match)
- Search by Nama (fuzzy search)
- Search by Divisi + Nama
- Search istri/anak langsung
- Auto-suggest saat mengetik (min 3 karakter)
- Highlight hasil pencarian
```

### 7.2 Data Validation
```typescript
// Validasi Input
- NIK: Format 16 digit untuk KTP
- Tanggal Lahir: Tidak boleh masa depan
- Usia: Auto-calculate dari tanggal lahir
- No. BPJS: Format 13 digit
- No. Telp: Format Indonesia (+62)
- BMI: Auto-calculate dari TB & BB
- Golongan Darah: Dropdown standard
```

### 7.3 Duplikasi Check
```typescript
// Cegah duplikasi pendaftaran
- Check NIK + Nama
- Warning jika pasien sudah terdaftar hari ini
- Tampilkan riwayat kunjungan terakhir
- Option untuk lanjutkan atau batal
```

### 7.4 Nomor Antrian & Cetak
```typescript
// Generate nomor antrian otomatis
Format: [Kode Poli]-[Nomor Urut]-[Tanggal]
Contoh: UMUM-001-06112025

// Cetak slip pendaftaran
- Nomor antrian
- Nama pasien
- Waktu pendaftaran
- Poli tujuan
- Estimasi waktu tunggu
- Barcode/QR Code (optional)
```

### 7.5 Dashboard Statistik Pendaftaran
```typescript
// Real-time monitoring
- Total pendaftaran hari ini
- Breakdown per kategori (Karyawan/Sepupu/Umum)
- Antrian aktif
- Rata-rata waktu tunggu
- Dokter on-duty
```

---

## 8. UI/UX WIREFRAME CONCEPT

### 8.1 Halaman Utama Pendaftaran
```
┌──────────────────────────────────────────────────────────────┐
│  📋 PENDAFTARAN PASIEN KLINIK                    [🔍] [⚙️]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Pilih Jenis Pasien:                                         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   👤        │  │   🏢        │  │   🌍        │          │
│  │ KARYAWAN    │  │ KEBUN       │  │  UMUM       │          │
│  │ PT SOCFINDO │  │ SEPUPU      │  │             │          │
│  │             │  │             │  │             │          │
│  │ [PILIH]     │  │ [PILIH]     │  │ [PILIH]     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  📊 Statistik Hari Ini: 06 November 2025                     │
│  ┌────────────────┬────────────────┬────────────────┐        │
│  │ Karyawan: 45   │ Sepupu: 12     │ Umum: 8        │        │
│  │ Total: 65 pasien                │ Antrian: 3     │        │
│  └────────────────┴────────────────┴────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Form Karyawan dengan Auto-Complete
```
┌──────────────────────────────────────────────────────────────┐
│  📋 Pendaftaran Pasien - Karyawan PT Socfindo                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Cari Karyawan atau Keluarga:                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Ahmad ▼                                                 │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✓ Ahmad Hidayat - NIK: 001 (Karyawan, Divisi 1)        │  │
│  │ ✓ Ahmad Setiawan - NIK: 008 (Karyawan, Divisi 2)       │  │
│  │ ✓ Budi Ahmad - Anak dari Ahmad Hidayat (L, 10 th)      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [Pilih: Ahmad Hidayat - NIK: 001]                           │
│                                                              │
│  ═══════════════════════════════════════════════════════════ │
│  DATA PASIEN (Auto-filled dari Master Data)                 │
│  ═══════════════════════════════════════════════════════════ │
│                                                              │
│  NIK: 001                    Nama: Ahmad Hidayat             │
│  Divisi: Divisi 1            Jabatan: Mandor Panen           │
│  Tgl Lahir: 15/03/1985       Usia: 40 tahun                  │
│  Jenis Kelamin: Laki-laki    Gol. Darah: O                   │
│  No. BPJS: 0001234567890     Status: Menikah                 │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  DATA FISIK (Dapat diupdate)                                 │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  Tinggi Badan: [170] cm      Berat Badan: [70] kg            │
│  BMI: 24.2 (Normal) ●                                        │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  DATA KUNJUNGAN                                              │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  Keluhan Utama: ┌────────────────────────────────────────┐  │
│                 │ Demam dan batuk sejak 2 hari           │  │
│                 └────────────────────────────────────────┘  │
│                                                              │
│  Alergi: ☐ Tidak Ada  ☑ Ada: [Penisilin]                    │
│                                                              │
│  Tipe Kunjungan: ○ Baru  ● Follow-up  ○ Darurat              │
│                                                              │
│  Cara Bayar: ● Perusahaan  ○ BPJS  ○ Pribadi                 │
│                                                              │
│  Catatan: ┌──────────────────────────────────────────────┐  │
│           │                                              │  │
│           └──────────────────────────────────────────────┘  │
│                                                              │
│  Riwayat Terakhir: 15 Okt 2025 - Pemeriksaan Umum           │
│                                                              │
│  [BATAL]                            [SIMPAN & CETAK ANTRIAN] │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Slip Antrian (Print Preview)
```
╔══════════════════════════════════════════════════╗
║       PT. SOCFIN INDONESIA                       ║
║           KLINIK PERUSAHAAN                      ║
║                                                  ║
║              NOMOR ANTRIAN                       ║
║                                                  ║
║            ┌─────────────────┐                   ║
║            │                 │                   ║
║            │   UMUM-023      │                   ║
║            │                 │                   ║
║            └─────────────────┘                   ║
║                                                  ║
║  Nama     : Ahmad Hidayat                        ║
║  NIK      : 001                                  ║
║  Kategori : Karyawan PT Socfindo                 ║
║  Tanggal  : 06 November 2025                     ║
║  Jam      : 09:15 WIB                            ║
║  Poli     : Umum                                 ║
║                                                  ║
║  Estimasi Waktu Tunggu: ±30 menit                ║
║                                                  ║
║  ┌────────────────────────────┐                  ║
║  │  [QR CODE]                 │                  ║
║  │  Scan untuk tracking       │                  ║
║  └────────────────────────────┘                  ║
║                                                  ║
║  Terima kasih atas kunjungan Anda                ║
╚══════════════════════════════════════════════════╝
```

---

## 9. PERMISSION & ROLE ACCESS

### 9.1 Role-Based Access Control
```typescript
// Perawat
- CREATE: Pendaftaran pasien
- READ: Data pasien, riwayat kunjungan
- UPDATE: Data pasien, data kunjungan
- DELETE: Batalkan pendaftaran (hanya hari ini)

// Dokter
- CREATE: Pendaftaran pasien
- READ: Semua data pasien & medis
- UPDATE: Data medis pasien
- DELETE: Tidak ada

// Petugas Klinik
- CREATE: Pendaftaran pasien
- READ: Data non-medis pasien
- UPDATE: Data administratif
- DELETE: Batalkan pendaftaran

// Admin Klinik
- Full CRUD access
- Manage master data
- Export reports
```

---

## 10. BUSINESS RULES & VALIDATION

### 10.1 Aturan Bisnis
1. **Satu pasien maksimal 1 pendaftaran per hari** (warning jika duplikasi)
2. **NIK wajib unik** untuk pasien umum
3. **Karyawan harus terverifikasi** dari master data
4. **Data keluarga harus terhubung** dengan karyawan induk
5. **BPJS optional** tapi recommended untuk validasi
6. **Nomor antrian reset** setiap hari
7. **Data pasien tidak boleh dihapus**, hanya di-nonaktifkan

### 10.2 Notification & Alert
```typescript
// Warning saat duplikasi
"⚠️ Pasien sudah terdaftar hari ini.
    Nomor Antrian: UMUM-015
    Waktu: 08:30 WIB
    Status: Menunggu

    [Lihat Detail] [Lanjutkan Pendaftaran Baru]"

// Success notification
"✅ Pendaftaran Berhasil!
    Nomor Antrian: UMUM-023
    Estimasi Tunggu: 30 menit

    [Cetak Slip] [Pendaftaran Baru]"
```

---

## 11. INTEGRATION POINTS

### 11.1 Integrasi dengan Modul Lain
```
Pendaftaran Pasien
    ├─→ Master Data Karyawan (Read)
    ├─→ Master Data Kebun Sepupu (Read)
    ├─→ Pemeriksaan & Diagnosa (Write)
    ├─→ Resep Obat (Write)
    ├─→ Billing & Kasir (Write)
    ├─→ Laporan Kunjungan (Read)
    └─→ HR System (Update cuti sakit)
```

### 11.2 API Endpoints (Future)
```
POST   /api/clinic/registrations        - Buat pendaftaran baru
GET    /api/clinic/registrations/:id    - Detail pendaftaran
PUT    /api/clinic/registrations/:id    - Update pendaftaran
DELETE /api/clinic/registrations/:id    - Batalkan pendaftaran

GET    /api/clinic/patients/search      - Cari pasien
POST   /api/clinic/patients             - Tambah pasien baru
GET    /api/clinic/patients/:id         - Detail pasien
PUT    /api/clinic/patients/:id         - Update data pasien

GET    /api/clinic/queue/today          - Antrian hari ini
GET    /api/clinic/queue/next           - Panggil antrian berikutnya
```

---

## 12. ROADMAP IMPLEMENTASI

### Phase 1: Core Features (Week 1-2)
- [x] Database schema design
- [ ] Master data kebun sepupu
- [ ] Form pendaftaran karyawan dengan auto-complete
- [ ] Form pendaftaran umum
- [ ] Generate nomor antrian
- [ ] Cetak slip pendaftaran

### Phase 2: Advanced Features (Week 3-4)
- [ ] Form pendaftaran kebun sepupu
- [ ] Search multi-kriteria (NIK/Nama/Divisi)
- [ ] Data keluarga karyawan
- [ ] Duplikasi check & warning
- [ ] Riwayat kunjungan pasien
- [ ] Dashboard statistik real-time

### Phase 3: Integration & Polish (Week 5-6)
- [ ] Integrasi dengan pemeriksaan dokter
- [ ] Export data (Excel/PDF)
- [ ] QR Code integration
- [ ] Mobile responsive optimization
- [ ] Unit testing
- [ ] User acceptance testing

---

## 13. TECHNICAL STACK

### Frontend
```typescript
- React 18.3.1 + TypeScript
- Shadcn/ui components
- React Hook Form untuk validasi
- date-fns untuk date handling
- Lucide icons
- React-to-print untuk cetak slip
```

### Backend (Supabase)
```sql
- PostgreSQL tables
- Row Level Security (RLS)
- Trigger functions untuk auto-numbering
- Real-time subscriptions untuk queue updates
```

### Custom Hooks
```typescript
- usePatients() - CRUD pasien
- useRegistrations() - CRUD pendaftaran
- usePartnerPlantations() - Master kebun sepupu
- useQueue() - Manajemen antrian
```

---

## 14. SUCCESS METRICS

### KPI Modul Pendaftaran
1. **Kecepatan Pendaftaran**: < 2 menit per pasien
2. **Akurasi Data**: > 98% data terisi lengkap
3. **Duplikasi**: < 1% duplikasi pendaftaran
4. **User Satisfaction**: > 4.5/5 rating
5. **System Uptime**: > 99.5%

---

## APPENDIX

### A. Referensi Data

#### Daftar Kebun Sepupu
1. Kebun Aek Loba
2. Kebun Tanah Gambus
3. Kebun Helvetia
4. Kebun Bukit Lawang
5. Kebun Sei Mangkei
6. [Tambahkan sesuai kebutuhan]

#### Jenis Golongan Darah
- A+, A-, B+, B-, AB+, AB-, O+, O-

#### Status Pernikahan
- Belum Menikah
- Menikah
- Cerai Hidup
- Cerai Mati

---

**Document Version**: 1.0
**Created**: November 6, 2025
**Author**: Sigma Payroll Team
**Status**: ✅ Ready for Review & Implementation
