# Fix: Update Jumlah Karyawan pada Estate

## Masalah
Jumlah karyawan yang ditampilkan pada setiap estate tidak mencerminkan data aktual dari master data karyawan. Beberapa estate menampilkan 0 karyawan padahal seharusnya ada karyawan yang terdaftar.

## Penyebab
Field `jumlah_karyawan` di tabel `divisions` adalah field statis yang tidak otomatis terupdate saat ada perubahan data karyawan di tabel `employees`.

## Solusi Implementasi

### Perubahan pada `src/hooks/useDivisions.ts`

Saya telah mengupdate hook `useDivisions` untuk menghitung jumlah karyawan secara **real-time** dari tabel `employees`:

1. **Fetch Divisions**: Mengambil semua data estate dari tabel `divisions`
2. **Fetch Employee Counts**: Mengambil data karyawan aktif dan mengelompokkan berdasarkan `division_id`
3. **Merge Data**: Menggabungkan jumlah karyawan dengan data estate
4. **Auto Refresh**: Setelah operasi add/update/delete, data akan di-refresh otomatis

### Fitur Baru

- ✅ Jumlah karyawan dihitung secara real-time dari tabel `employees`
- ✅ Hanya menghitung karyawan dengan status `active`
- ✅ Auto refresh setelah add/update estate
- ✅ Data selalu akurat dan up-to-date

### Kode Implementasi

```typescript
const fetchDivisions = async () => {
  // Fetch all divisions
  const { data: divisionsData } = await supabase
    .from('divisions')
    .select('*')
    .order('kode_divisi', { ascending: true })

  // Fetch employee counts for all divisions
  const { data: employeeCounts } = await supabase
    .from('employees')
    .select('division_id, status')
    .eq('status', 'active')

  // Create a map of division_id to employee count
  const employeeCountMap = new Map<string, number>()
  employeeCounts?.forEach(emp => {
    const currentCount = employeeCountMap.get(emp.division_id) || 0
    employeeCountMap.set(emp.division_id, currentCount + 1)
  })

  // Merge employee counts with divisions data
  const divisionsWithCounts = divisionsData.map(division => ({
    ...division,
    jumlah_karyawan: employeeCountMap.get(division.id) || 0
  }))

  setDivisions(divisionsWithCounts)
}
```

## Testing

Untuk memverifikasi perubahan:

1. Buka aplikasi dan navigasi ke menu "Estate dan Divisi"
2. Pastikan jumlah karyawan pada setiap estate sudah sesuai dengan data master karyawan
3. Contoh yang benar:
   - Jika Estate Aek Loba memiliki 5 karyawan aktif, maka akan muncul "5 karyawan"
   - Jika tidak ada karyawan, akan muncul "0 karyawan"

## Performa

- Query dioptimalkan untuk menghindari N+1 problem
- Menggunakan single query untuk fetch semua employee counts
- Grouping dan counting dilakukan di client side (sangat cepat dengan Map)
- Total hanya 2 queries: 1 untuk divisions, 1 untuk employee counts

## Catatan

- Field `jumlah_karyawan` di database tidak diupdate, hanya di-override saat runtime
- Data selalu akurat karena dihitung real-time dari tabel employees
- Hanya karyawan dengan status `active` yang dihitung
- Status lain (`inactive`, `on-leave`, `terminated`) tidak dihitung

## Backward Compatibility

✅ Tidak ada breaking changes
✅ Existing code tetap berfungsi
✅ Tidak perlu perubahan database schema
✅ Tidak perlu migration

## File yang Dimodifikasi

- [src/hooks/useDivisions.ts](src/hooks/useDivisions.ts)

## Status

✅ **COMPLETED** - Ready to use
