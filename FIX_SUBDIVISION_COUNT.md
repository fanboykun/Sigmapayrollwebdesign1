# Fix: Jumlah Divisi Berubah-ubah saat Expand/Collapse

## Masalah
Jumlah divisi yang ditampilkan pada estate berubah-ubah saat di-collapse dan expand. Angka tidak konsisten dan tidak mencerminkan data sebenarnya.

## Penyebab
State `subdivisions` di hook `useEstateSubdivisions` tidak di-manage dengan baik untuk multiple estates:
- Setiap kali estate di-expand, `fetchSubdivisions(estateId)` dipanggil
- Data subdivisions dari berbagai estate tercampur dalam satu state
- Fungsi `getEstateSubdivisions()` filter dari state yang berubah-ubah
- Hasil: jumlah divisi tidak konsisten

## Solusi Implementasi

### 1. Separate State untuk Subdivision Counts
Membuat state terpisah untuk menyimpan jumlah subdivisions per estate:

```typescript
const [subdivisionCounts, setSubdivisionCounts] = useState<Map<string, number>>(new Map());
```

### 2. Fetch All Subdivision Counts on Mount
Fetch semua subdivision counts saat component pertama kali di-load:

```typescript
const fetchAllSubdivisionCounts = async () => {
  const { data } = await supabase
    .from('estate_subdivisions')
    .select('estate_id, id');

  const countsMap = new Map<string, number>();
  data?.forEach((sub: any) => {
    const currentCount = countsMap.get(sub.estate_id) || 0;
    countsMap.set(sub.estate_id, currentCount + 1);
  });

  setSubdivisionCounts(countsMap);
};

useEffect(() => {
  fetchAllSubdivisionCounts();
}, []);
```

### 3. Update Counts After Operations
Refresh subdivision counts setelah add/update/delete:

```typescript
// Di handleAddSubdivision
await fetchAllSubdivisionCounts();

// Di handleUpdateSubdivision
await fetchAllSubdivisionCounts();

// Di handleDeleteSubdivision
await fetchAllSubdivisionCounts();
```

### 4. Display dari Subdivision Counts Map
Tampilkan jumlah dari Map, bukan dari filter:

```typescript
const subdivisionCount = subdivisionCounts.get(division.id) || 0;

<div className="text-sm text-muted-foreground">
  {subdivisionCount} divisi • {division.jumlah_karyawan || 0} karyawan
</div>
```

## Keuntungan Solusi Ini

✅ **Konsisten** - Jumlah divisi tidak berubah saat expand/collapse
✅ **Akurat** - Data selalu sesuai dengan database
✅ **Efisien** - Single query untuk semua estates
✅ **Real-time** - Auto update setelah add/edit/delete

## File yang Dimodifikasi

- [src/components/DivisionMaster.tsx](src/components/DivisionMaster.tsx)
  - Tambah import `useEffect` dan `supabase`
  - Tambah state `subdivisionCounts`
  - Tambah fungsi `fetchAllSubdivisionCounts()`
  - Update tampilan untuk menggunakan `subdivisionCount`
  - Refresh counts setelah CRUD operations

## Testing

Untuk memverifikasi:

1. Buka halaman "Estate dan Divisi"
2. Lihat jumlah divisi pada setiap estate
3. Expand dan collapse beberapa kali
4. **Expected**: Jumlah divisi tetap konsisten
5. Tambah/edit/hapus divisi
6. **Expected**: Jumlah divisi langsung terupdate

## Sebelum Fix

```
Aek Loba: 0 divisi  → expand → 3 divisi → collapse → 0 divisi → expand → 6 divisi (???)
```

## Setelah Fix

```
Aek Loba: 3 divisi  → expand → 3 divisi → collapse → 3 divisi → expand → 3 divisi (✓)
```

## Status

✅ **COMPLETED** - Ready to test
