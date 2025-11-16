# Setup Estate dan Subdivisions

## Ringkasan Perubahan

Saya telah mengubah sistem Master Divisi menjadi sistem **Estate dan Divisi**, dimana:
- Tabel `divisions` sekarang mewakili **Estate** (Aek Loba, Aek Pamienke, dll)
- Tabel baru `estate_subdivisions` menyimpan **Divisi** untuk setiap Estate
- Setiap Estate dapat memiliki beberapa Divisi (biasanya 2-8, tapi bisa lebih)
- Contoh Divisi: Divisi I, Divisi II, Divisi III, Kantor Kebun, Kantor Pabrik, dll

## File yang Telah Dibuat/Diupdate

1. ✅ **CREATE_ESTATE_SUBDIVISIONS_TABLE.sql** - SQL script untuk membuat tabel baru
2. ✅ **src/utils/supabase/types.ts** - Ditambahkan type definition untuk `estate_subdivisions`
3. ✅ **src/hooks/useEstateSubdivisions.ts** - Hook baru untuk mengelola subdivisions
4. ✅ **src/components/DivisionMaster.tsx** - Diupdate untuk mengelola Estate dan Subdivisions

## Langkah Setup Database

### Cara 1: Menggunakan Supabase Dashboard (Recommended)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy seluruh isi file `CREATE_ESTATE_SUBDIVISIONS_TABLE.sql`
6. Paste ke SQL Editor
7. Klik **Run** atau tekan `Ctrl+Enter`

### Cara 2: Menggunakan Supabase CLI

Jika Anda sudah setup Supabase CLI dan memiliki local development:

```bash
# Pastikan Anda sudah login
npx supabase login

# Link ke project (jika belum)
npx supabase link --project-ref your-project-ref

# Buat migration file baru
npx supabase migration new create_estate_subdivisions

# Copy isi CREATE_ESTATE_SUBDIVISIONS_TABLE.sql ke file migration yang baru dibuat
# File ada di: supabase/migrations/[timestamp]_create_estate_subdivisions.sql

# Push migration ke remote database
npx supabase db push
```

## Struktur Tabel estate_subdivisions

```sql
CREATE TABLE estate_subdivisions (
    id TEXT PRIMARY KEY,
    estate_id TEXT REFERENCES divisions(id) ON DELETE CASCADE,
    kode_subdivisi TEXT NOT NULL,
    nama_subdivisi TEXT NOT NULL,
    kepala_subdivisi TEXT,
    jumlah_karyawan INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(estate_id, kode_subdivisi)
);
```

## Cara Menambahkan Sample Data (Optional)

Setelah tabel berhasil dibuat, Anda bisa menambahkan data contoh untuk Estate Aek Loba:

```sql
INSERT INTO public.estate_subdivisions (estate_id, kode_subdivisi, nama_subdivisi, kepala_subdivisi) VALUES
    ('div-001', 'I', 'Divisi I', ''),
    ('div-001', 'II', 'Divisi II', ''),
    ('div-001', 'III', 'Divisi III', ''),
    ('div-001', 'IV', 'Divisi IV', ''),
    ('div-001', 'V', 'Divisi V', ''),
    ('div-001', 'VI', 'Divisi VI', ''),
    ('div-001', 'KK', 'Kantor Kebun', ''),
    ('div-001', 'KP', 'Kantor Pabrik', '');
```

Ganti `'div-001'` dengan ID estate yang sesuai dari tabel `divisions`.

## Cara Menggunakan Fitur Baru

### 1. Mengelola Estate
- Klik "Tambah Estate" untuk menambah estate baru
- Klik icon Edit untuk mengubah data estate
- Klik icon Delete untuk menghapus estate

### 2. Mengelola Divisi
- Klik icon **chevron** (>) di samping nama Estate untuk expand/collapse
- Saat expanded, Anda akan melihat daftar divisi di estate tersebut
- Klik "Tambah Divisi" untuk menambah divisi baru ke estate
- Klik icon Edit pada divisi untuk mengubah data divisi
- Klik icon Delete pada divisi untuk menghapus divisi

### 3. Contoh Penggunaan

**Skenario**: Menambah divisi untuk Estate Aek Loba

1. Cari Estate "Aek Loba" di daftar
2. Klik icon chevron untuk expand
3. Klik tombol "Tambah Divisi"
4. Isi form:
   - Kode Divisi: `I`
   - Nama Divisi: `Divisi I`
   - Kepala Divisi: (optional)
5. Klik "Simpan"

Ulangi untuk divisi lainnya (Divisi II, III, IV, dll)

## Verifikasi

Setelah setup selesai, Anda dapat memverifikasi dengan:

1. Buka aplikasi dan navigasi ke menu "Estate dan Divisi"
2. Pastikan Anda bisa:
   - ✅ Melihat daftar Estate
   - ✅ Expand/collapse setiap Estate
   - ✅ Menambah Estate baru
   - ✅ Menambah Divisi untuk setiap Estate
   - ✅ Edit dan Delete Estate/Divisi

## Troubleshooting

### Error: relation "estate_subdivisions" does not exist
- Pastikan SQL script sudah dijalankan dengan benar di database
- Cek di Supabase Dashboard > Table Editor apakah tabel `estate_subdivisions` sudah ada

### Error: RLS policy violation
- Pastikan RLS policies sudah dibuat dengan benar (ada di SQL script)
- Cek apakah user sudah login/authenticated

### Subdivisions tidak muncul saat expand
- Buka Browser DevTools (F12) > Console
- Lihat apakah ada error message
- Pastikan tabel dan policies sudah dibuat dengan benar

## Catatan Penting

- ⚠️ **JANGAN HAPUS** tabel `divisions` yang lama, karena masih digunakan sebagai tabel Estate
- ⚠️ Data employee masih menggunakan `division_id` yang merujuk ke Estate (tabel `divisions`)
- ✅ Tidak ada perubahan pada data yang sudah ada
- ✅ Backward compatible - sistem lama tetap berfungsi

## Support

Jika ada masalah atau pertanyaan, silakan buka issue di repository atau hubungi tim development.
