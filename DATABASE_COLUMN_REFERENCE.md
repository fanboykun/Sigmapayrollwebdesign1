# Database Column Reference - Employee Data

## ⚠️ IMPORTANT: Employee ID vs National ID

**Tanggal Dibuat**: 14 November 2024
**Tujuan**: Menghindari kebingungan antara kolom `employee_id` dan `national_id` (NIK)

---

## 📊 Tabel `employees` - Kolom Kunci

### 1. `employee_id` (VARCHAR)
**Bukan NIK! Ini adalah ID internal karyawan.**

- **Nama Kolom**: `employee_id`
- **Tipe**: `VARCHAR(20)`
- **Format**: `EMP-{DIVISI}-{NOMOR}`
- **Contoh**:
  - `EMP-AL-0001` (Karyawan pertama divisi AL)
  - `EMP-TB-0123` (Karyawan ke-123 divisi TB)
  - `EMP-MP-0456` (Karyawan ke-456 divisi MP)

**Kapan Digunakan**:
- ✅ Dropdown pilihan karyawan di UI
- ✅ Join dengan tabel lain (sebagai foreign key)
- ✅ Display di tabel, card, atau laporan
- ✅ Filter/search karyawan berdasarkan ID internal
- ✅ Sebagai identifier utama untuk karyawan

**Komentar Salah di Schema** (SUDAH DIPERBAIKI):
```sql
-- SEBELUM (SALAH):
employee_id VARCHAR(20) UNIQUE NOT NULL, -- NIK

-- SESUDAH (BENAR):
employee_id VARCHAR(20) UNIQUE NOT NULL, -- Employee ID (e.g., EMP-AL-0001) - NOT NIK/National ID!
```

---

### 2. `national_id` (VARCHAR)
**Ini adalah NIK (Nomor Induk Kependudukan) sebenarnya.**

- **Nama Kolom**: `national_id`
- **Tipe**: `VARCHAR` (atau `STRING` di types.ts)
- **Format**: 16 digit angka
- **Contoh**:
  - `3201012345678901`
  - `1234567890123456`

**Kapan Digunakan**:
- ✅ Form pendaftaran karyawan baru
- ✅ Validasi identitas karyawan
- ✅ Keperluan legal/pajak (NPWP, BPJS, dll)
- ✅ Verifikasi duplikasi karyawan
- ⚠️ **Jarang** digunakan di UI operasional sehari-hari

---

## 🔍 Perbandingan Lengkap

| Aspek | `employee_id` | `national_id` |
|-------|---------------|---------------|
| **Nama Lain** | ID Karyawan, Employee ID | NIK, KTP Number |
| **Format** | `EMP-XX-NNNN` | `NNNNNNNNNNNNNNNN` (16 digit) |
| **Contoh** | `EMP-AL-0001` | `3201012345678901` |
| **Unique?** | ✅ Yes | ✅ Yes (seharusnya) |
| **Required?** | ✅ NOT NULL | ⚠️ Nullable (bisa NULL) |
| **Digunakan Untuk** | Identifier internal | Identifier legal/pemerintah |
| **Display di UI?** | ✅ Sering | ⚠️ Jarang (privacy) |
| **Join dengan Table Lain?** | ✅ Yes (FK di many tables) | ❌ No |
| **Filter/Search?** | ✅ Yes | ⚠️ Kadang-kadang |

---

## 🎯 Contoh Query yang Benar

### ❌ **SALAH** - Menggunakan `nik` (kolom tidak ada):
```typescript
const { data, error } = await supabase
  .from('employees')
  .select('id, nik, full_name') // ❌ ERROR: column 'nik' does not exist
  .order('full_name');
```

### ✅ **BENAR** - Menggunakan `employee_id`:
```typescript
const { data, error } = await supabase
  .from('employees')
  .select('id, employee_id, full_name') // ✅ CORRECT
  .order('full_name');

// Result:
// [
//   { id: 'uuid...', employee_id: 'EMP-AL-0001', full_name: 'Ahmad' },
//   { id: 'uuid...', employee_id: 'EMP-TB-0123', full_name: 'Budi' }
// ]
```

### ✅ **BENAR** - Menggunakan `national_id` untuk NIK:
```typescript
const { data, error } = await supabase
  .from('employees')
  .select('id, employee_id, national_id, full_name') // ✅ CORRECT
  .eq('national_id', '3201012345678901');

// Result:
// [
//   {
//     id: 'uuid...',
//     employee_id: 'EMP-AL-0001',
//     national_id: '3201012345678901',
//     full_name: 'Ahmad'
//   }
// ]
```

---

## 🖥️ Contoh UI Implementation

### Dropdown Karyawan (BENAR):
```tsx
<Select value={formData.employee_id} onValueChange={...}>
  <SelectContent>
    {employees.map((emp) => (
      <SelectItem key={emp.id} value={emp.id}>
        {emp.employee_id} - {emp.full_name}
        {/* Display: "EMP-AL-0001 - Ahmad Sutanto" */}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Table Display (BENAR):
```tsx
<TableHead>ID Karyawan</TableHead>
...
<TableCell className="font-mono">
  {item.employees?.employee_id || '-'}
  {/* Display: "EMP-AL-0001" */}
</TableCell>
```

### Search/Filter (BENAR):
```tsx
const filtered = data.filter((item) => {
  const matchSearch = !searchText ||
    item.employees?.employee_id?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.employees?.full_name?.toLowerCase().includes(searchText.toLowerCase());
  return matchSearch;
});
```

---

## 📝 Checklist untuk Developer

Saat membuat fitur baru yang melibatkan data karyawan:

- [ ] Gunakan `employee_id` untuk identifier utama, **BUKAN `nik`**
- [ ] Gunakan `national_id` hanya jika benar-benar butuh NIK KTP
- [ ] Label UI: "ID Karyawan" atau "Employee ID", **BUKAN "NIK"** (kecuali memang untuk national_id)
- [ ] Format display: `{employee_id} - {full_name}` → "EMP-AL-0001 - Ahmad"
- [ ] JOIN query: gunakan `employees:employee_id (employee_id, full_name)`
- [ ] Periksa schema SQL dan TypeScript types sebelum coding
- [ ] Test query di Supabase SQL Editor sebelum implement

---

## 🔧 Troubleshooting

### Error: "column employees.nik does not exist"

**Penyebab**: Kolom `nik` tidak ada di tabel `employees`

**Solusi**: Ganti `nik` dengan `employee_id`:
```diff
- .select('id, nik, full_name')
+ .select('id, employee_id, full_name')
```

### Dropdown Kosong / Tidak Ada Data

**Kemungkinan Penyebab**:
1. ❌ Query menggunakan kolom yang salah (`nik` instead of `employee_id`)
2. ❌ RLS policy blocking
3. ❌ Table employees kosong

**Solusi**: Cek query dan pastikan menggunakan `employee_id`

---

## 📚 Reference Files

Berikut file-file yang telah diupdate dengan nomenclature yang benar:

1. ✅ `supabase/migrations/001_initial_schema.sql` - Komentar diperbaiki
2. ✅ `PREMI_DERES_PENGGAJIAN_DOCUMENTATION.md` - Semua referensi `nik` diganti `employee_id`
3. ✅ `SUPABASE_SETUP.md` - Contoh query ditambahkan note
4. ✅ `src/components/PremiDeresPenggajian.tsx` - Implementasi sudah benar
5. ✅ `FIX_EMPLOYEE_DROPDOWN_SUMMARY.md` - Dokumentasi fix issue
6. ✅ `DATABASE_COLUMN_REFERENCE.md` - Dokumen ini (referensi utama)

---

## 🎓 Best Practices

### DO ✅:
- Gunakan `employee_id` untuk semua operasi internal sistem
- Display format: `{employee_id} - {full_name}`
- Label UI: "ID Karyawan" atau "Employee ID"
- JOIN dengan foreign key `employee_id` (tipe UUID)
- Validate format `EMP-XX-NNNN` saat input

### DON'T ❌:
- ❌ Jangan gunakan `nik` (kolom tidak ada!)
- ❌ Jangan display `national_id` di UI umum (privacy!)
- ❌ Jangan hardcode Employee ID (generate otomatis)
- ❌ Jangan lupa order by `full_name` untuk dropdown
- ❌ Jangan assume semua karyawan punya `national_id` (nullable)

---

## 💡 Tips

1. **Selalu cek actual database schema** sebelum coding
2. **Gunakan tool `check_employees_columns.ts`** untuk verify struktur tabel
3. **Test query di Supabase SQL Editor** sebelum implement di code
4. **Baca dokumentasi ini** sebelum membuat fitur employee-related
5. **Update dokumentasi** jika menemukan informasi baru

---

## 📞 Support

Jika menemukan dokumentasi atau code yang masih menggunakan `nik` incorrectly:

1. Buat issue di repository
2. Update dokumentasi terkait
3. Submit PR dengan fix
4. Inform development team

---

**Kesimpulan**:
**`employee_id`** = ID Karyawan Internal (EMP-AL-0001)
**`national_id`** = NIK KTP (3201012345678901)

Jangan sampai salah lagi! 🎯

---

**Last Updated**: 14 November 2024
**Version**: 1.0.0
**Status**: ✅ Official Reference Document
