# Supabase Pagination Guide - 1000 Row Limit

**Last Updated:** 2025-11-17
**Status:** ✅ Critical - Must Follow

---

## 🚨 Problem: Supabase 1000-Row Limit

Supabase memiliki **batasan default 1000 records per query**. Jika data melebihi 1000 records, hanya 1000 record pertama yang akan dikembalikan **tanpa warning atau error**.

### Contoh Kasus yang Pernah Terjadi:

#### 1. **Master Skala Upah (WageMaster)**
- **Expected**: 47 divisi × 141 scales = 6,627 records
- **Actual**: Hanya menampilkan 1000 records pertama
- **Impact**: Data tidak lengkap, user tidak sadar ada data yang hilang

#### 2. **Master Presensi (AttendanceMaster)**
- **Expected**: Ribuan record presensi per bulan
- **Actual**: Hanya 1000 records ditampilkan
- **Status**: ✅ Sudah diperbaiki dengan pagination

---

## ✅ Solution: Batch Fetching dengan `.range()`

### Konsep Dasar

Gunakan **pagination loop** untuk mengambil data dalam batch 1000 records:

```typescript
// ❌ WRONG - Will only get first 1000 records
const { data } = await supabase
  .from('table_name')
  .select('*')
  .order('column')

// ✅ CORRECT - Gets ALL records with batch pagination
let allData = []
let currentPage = 0
const pageSize = 1000
let hasMore = true

while (hasMore) {
  const from = currentPage * pageSize
  const to = from + pageSize - 1

  const { data: batchData } = await supabase
    .from('table_name')
    .select('*')
    .order('column')
    .range(from, to)  // ← KEY: Use .range()

  if (batchData && batchData.length > 0) {
    allData = [...allData, ...batchData]
  }

  hasMore = batchData && batchData.length === pageSize
  currentPage++

  // Safety break
  if (currentPage >= 50) break
}
```

---

## 📋 Implementation Checklist

### When to Apply Batch Fetching?

Apply batch fetching untuk tabel/query yang **bisa** menghasilkan > 1000 records:

#### ✅ **MUST USE** (Always > 1000 records):
- [x] `master_upah` (6,627 records untuk 47 divisi)
- [x] `attendance_records` (ribuan records per bulan)
- [ ] `payroll_records` (jika ada banyak periode)
- [ ] `employees` (jika > 1000 karyawan)
- [ ] `transaction logs` (history tables)

#### ⚠️ **CONDITIONAL** (Might exceed 1000):
- [ ] `leave_requests` (tergantung jumlah)
- [ ] `medical_records` (clinic data)
- [ ] `premi_panen` / `premi_deres` records

#### ❎ **NOT NEEDED** (Always < 1000):
- divisions (47 records)
- positions (puluhan records)
- users (ratusan records)
- tax_brackets (puluhan records)
- master data lainnya

---

## 🔧 Standard Implementation Pattern

### 1. Create Custom Hook with Batch Fetching

```typescript
// src/hooks/useYourData.ts
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export function useYourData() {
  const [data, setData] = useState<YourType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 🔥 Batch fetching implementation
      let allData: YourType[] = []
      let currentPage = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const from = currentPage * pageSize
        const to = from + pageSize - 1

        const { data: batchData, error: batchError, count } = await supabase
          .from('your_table')
          .select('*', { count: 'exact' })
          .order('your_column', { ascending: true })
          .range(from, to)  // ← KEY LINE

        if (batchError) throw batchError

        if (batchData && batchData.length > 0) {
          allData = [...allData, ...batchData]
        }

        hasMore = batchData && batchData.length === pageSize
        currentPage++

        // Safety break - prevent infinite loop
        if (currentPage >= 50) {
          console.warn('Reached max batch limit (50,000 records)')
          break
        }
      }

      console.log(`✅ Fetched ${allData.length} records in ${currentPage} batch(es)`)
      setData(allData)
    } catch (err: any) {
      setError(err.message)
      console.error('❌ Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}
```

### 2. Performance Considerations

**Batch Size Calculation:**
- Default: 1000 records per batch
- Untuk data besar (> 10,000 records), pertimbangkan:
  - Server-side filtering lebih dulu
  - Lazy loading / infinite scroll
  - Pagination di UI

**Monitoring:**
- Tambahkan `console.log` untuk tracking jumlah batch
- Hitung total waktu fetch untuk optimization

---

## 📊 Real-World Examples

### Example 1: useWageScales (Fixed ✅)

**Before (❌ Bug):**
```typescript
const { data } = await supabase
  .from('master_upah')
  .select('*')
  .order('tahun', { ascending: false })
// Result: Only 1000/6627 records
```

**After (✅ Fixed):**
```typescript
// Batch fetching implementation
let allData: WageScale[] = []
let currentPage = 0
const pageSize = 1000

while (hasMore) {
  const { data: batchData } = await supabase
    .from('master_upah')
    .select('*')
    .order('tahun', { ascending: false })
    .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)

  allData = [...allData, ...batchData]
  hasMore = batchData.length === pageSize
  currentPage++
}
// Result: All 6627 records ✅
```

**Performance:**
- 7 batch requests untuk 6,627 records
- ~2-3 seconds total loading time
- Batch 1-6: 1000 records each
- Batch 7: 627 records

### Example 2: AttendanceMaster (Fixed ✅)

**Location:** `src/components/AttendanceMaster.tsx:278-330`

```typescript
// Fetch data in batches due to Supabase 1000-row limit per request
let allData: any[] = []
let currentPage = 0
const pageSize = 1000
let hasMore = true

while (hasMore) {
  const from = currentPage * pageSize
  const to = from + pageSize - 1

  const { data: batchData, error: batchError } = await supabase
    .from('attendance_records')
    .select(`
      *,
      employee:employees!inner(
        employee_id,
        full_name,
        division:divisions(kode_divisi, nama_divisi)
      )
    `)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .range(from, to)  // ← Pagination here
    .order('date', { ascending: true })

  if (batchError) throw batchError

  if (batchData && batchData.length > 0) {
    allData = [...allData, ...batchData]
  }

  hasMore = batchData && batchData.length === pageSize
  currentPage++

  // Safety break
  if (currentPage >= 20) {
    console.warn('Reached maximum batch limit (20,000 records)')
    break
  }
}
```

---

## 🎯 Testing Checklist

Sebelum deploy, pastikan:

### 1. Test dengan Data Besar
```typescript
// Add logging untuk monitoring
console.log(`Batch ${currentPage}: Fetched ${batchData.length} records`)
console.log(`Total so far: ${allData.length} records`)
```

### 2. Verify Complete Data
```sql
-- Check actual count in database
SELECT COUNT(*) FROM master_upah WHERE tahun = 2025;
-- Compare dengan jumlah yang di-fetch di frontend
```

### 3. Performance Testing
- Monitor waktu loading
- Check network requests di DevTools
- Verify tidak ada memory leak

### 4. Edge Cases
- Empty table (0 records)
- Exactly 1000 records
- 1001 records (should trigger 2 batches)
- Massive data (> 10,000 records)

---

## 🔍 Debugging Tips

### 1. Check if Pagination is Working

```typescript
// Add detailed logging
while (hasMore) {
  console.log(`🔄 Fetching batch ${currentPage + 1} (${from}-${to})...`)

  const { data: batchData } = await supabase
    .from('table')
    .select('*')
    .range(from, to)

  console.log(`✅ Batch ${currentPage + 1}: Got ${batchData?.length || 0} records`)

  // ... rest of code
}

console.log(`🎉 Total fetched: ${allData.length} records in ${currentPage} batches`)
```

**Expected Console Output:**
```
🔄 Fetching batch 1 (0-999)...
✅ Batch 1: Got 1000 records
🔄 Fetching batch 2 (1000-1999)...
✅ Batch 2: Got 1000 records
...
🔄 Fetching batch 7 (6000-6999)...
✅ Batch 7: Got 627 records
🎉 Total fetched: 6627 records in 7 batches
```

### 2. Verify in Database

```sql
-- Run in Supabase SQL Editor
SELECT
    tahun,
    COUNT(*) as total_records,
    COUNT(DISTINCT divisi_id) as divisions,
    COUNT(DISTINCT golongan) as golongan_types
FROM master_upah
GROUP BY tahun
ORDER BY tahun DESC;
```

### 3. Compare Results

```typescript
// In your component
useEffect(() => {
  console.log(`📊 Loaded ${wageScales.length} wage scales`)
  console.log(`📊 Unique divisions: ${new Set(wageScales.map(w => w.divisi_id)).size}`)
  console.log(`📊 Unique years: ${new Set(wageScales.map(w => w.tahun)).size}`)
}, [wageScales])
```

---

## ⚠️ Common Mistakes to Avoid

### 1. ❌ Forgetting `.range()`
```typescript
// Will only get 1000 records!
const { data } = await supabase.from('table').select('*')
```

### 2. ❌ Wrong Range Calculation
```typescript
// Wrong: Will skip records
.range(currentPage, currentPage + 1000)

// Correct:
.range(currentPage * 1000, (currentPage + 1) * 1000 - 1)
```

### 3. ❌ No Safety Break
```typescript
// Could cause infinite loop if hasMore logic is wrong
while (hasMore) {
  // ... fetch data
  // Missing: if (currentPage >= 50) break;
}
```

### 4. ❌ Not Handling Empty Results
```typescript
// Should check for empty array
if (batchData && batchData.length > 0) {
  allData = [...allData, ...batchData]
}
```

---

## 📚 Reference Files

### Fixed Implementations
1. **useWageScales Hook**
   📁 `src/hooks/useWageScales.ts:42-90`
   ✅ Status: Fixed with batch fetching

2. **AttendanceMaster Component**
   📁 `src/components/AttendanceMaster.tsx:278-330`
   ✅ Status: Fixed with batch fetching

### Audit Queries
3. **Wage Data Audit**
   📁 `check_missing_divisions.sql`
   🔍 Use query #4 and #5 to verify data completeness

4. **Audit Documentation**
   📁 `WAGE_DATA_AUDIT.md`
   📖 Complete guide untuk audit wage data

---

## 🎓 When to Use Each Approach

### Approach 1: Batch Fetching (Recommended)
**Use when:**
- Data size unpredictable or > 1000 records
- Need all data at once for processing
- Simple queries without complex filtering

**Pros:**
- Simple to implement
- Works with any table size
- No server changes needed

**Cons:**
- Multiple network requests
- Might take longer for large datasets

### Approach 2: Server-Side Pagination
**Use when:**
- Data size very large (> 50,000 records)
- User only views small subset at a time
- Complex filtering/searching needed

**Pros:**
- Faster initial load
- Less memory usage
- Better UX with instant feedback

**Cons:**
- More complex implementation
- Need to handle page state
- Not suitable for data processing

### Approach 3: Cursor-Based Pagination
**Use when:**
- Real-time data streams
- Infinite scroll UI
- Very large datasets with frequent updates

**Pros:**
- Efficient for large datasets
- Works with real-time updates
- No page count needed

**Cons:**
- Most complex to implement
- Harder to jump to specific page
- Requires unique sortable field

---

## 📝 Development Workflow

### Before Writing Code

1. **Estimate Data Size**
   ```sql
   SELECT COUNT(*) FROM your_table;
   ```

2. **Check Growth Rate**
   - Will this table grow to > 1000 records?
   - What's the expected size in 1 year? 5 years?

3. **Choose Approach**
   - < 1000 records: Simple query OK
   - 1000-50,000 records: Use batch fetching
   - > 50,000 records: Consider server pagination

### During Implementation

1. **Add Batch Fetching from Start**
   - Don't wait for bug reports
   - Implement defensive coding

2. **Add Logging**
   - Monitor batch count
   - Track performance
   - Verify data completeness

3. **Test with Real Data**
   - Run with actual database
   - Check console logs
   - Verify all records loaded

### Code Review Checklist

- [ ] Query tabel dengan potensi > 1000 records?
- [ ] Sudah pakai `.range()` untuk pagination?
- [ ] Ada safety break untuk prevent infinite loop?
- [ ] Ada logging untuk monitoring?
- [ ] Sudah test dengan data sesungguhnya?
- [ ] Performance acceptable? (< 5 seconds)

---

## 🚀 Quick Start Template

Copy-paste template ini untuk implementasi cepat:

```typescript
/**
 * Template: Batch Fetching Hook
 * Replace YourType, your_table, your_column dengan data Anda
 */
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export function useYourData() {
  const [data, setData] = useState<YourType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      let allData: YourType[] = []
      let currentPage = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const from = currentPage * pageSize
        const to = from + pageSize - 1

        const { data: batchData, error: batchError } = await supabase
          .from('your_table')
          .select('*')
          .order('your_column', { ascending: true })
          .range(from, to)

        if (batchError) throw batchError

        if (batchData && batchData.length > 0) {
          allData = [...allData, ...batchData]
        }

        hasMore = batchData && batchData.length === pageSize
        currentPage++

        if (currentPage >= 50) {
          console.warn('Reached max batch limit')
          break
        }
      }

      console.log(`Fetched ${allData.length} records in ${currentPage} batch(es)`)
      setData(allData)
    } catch (err: any) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}
```

---

## 📞 Support & Questions

Jika menemukan masalah:

1. **Check Console Logs**
   - Berapa batch yang di-fetch?
   - Berapa total records?
   - Ada error message?

2. **Verify Database**
   ```sql
   SELECT COUNT(*) FROM your_table;
   ```

3. **Check Implementation**
   - Sudah pakai `.range()`?
   - Sudah ada safety break?
   - Logic `hasMore` sudah benar?

4. **Review This Document**
   - Follow checklist di atas
   - Compare dengan working examples
   - Test dengan data sample

---

**Last Updated:** 2025-11-17
**Maintainer:** Sigma Payroll Development Team
**Status:** ✅ Production Ready

---

## 🔗 Related Documentation

- [WAGE_DATA_AUDIT.md](WAGE_DATA_AUDIT.md) - Audit guide untuk wage data
- [check_missing_divisions.sql](check_missing_divisions.sql) - SQL queries untuk audit
- [CLAUDE.md](CLAUDE.md) - Development guide lengkap

---

**Remember:** Better safe than sorry! Selalu gunakan batch fetching untuk tabel yang bisa tumbuh > 1000 records. 🛡️
