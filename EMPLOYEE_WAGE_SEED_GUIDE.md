# Employee Wage Scale Seed Guide

**Quick guide untuk assign wage scales ke employees secara otomatis**

Last Updated: 2025-11-17

---

## 🎯 Purpose

Script ini akan secara otomatis assign **skala upah** dari `master_upah` ke semua employees berdasarkan division mereka, dengan distribusi random yang realistis.

---

## 📋 Prerequisites

Pastikan sudah running migrations:
- ✅ `033_master_upah.sql` - Table master_upah
- ✅ `039_seed_wage_scales_2025.sql` - Wage scales data (80 Pegawai + 60 Karyawan)
- ✅ `041_seed_pkwt_wage_2025.sql` - PKWT data

---

## 🚀 Quick Start

### Option 1: Simple Script (Recommended)

**File:** `seed_employee_wages_simple.sql`

1. **Open Supabase SQL Editor**
2. **Copy paste** isi file `seed_employee_wages_simple.sql`
3. **Execute** (tekan Run)
4. **Check results** di output console

**What it does:**
- ✅ Adds 2 new columns: `skala_upah`, `golongan_upah`
- ✅ Randomly assigns scales from `master_upah` matching employee's division
- ✅ Updates `base_salary` with correct amount
- ✅ Weighted distribution: 40% Pegawai, 55% Karyawan, 5% PKWT
- ✅ Shows verification results

**Output Example:**
```
🚀 Starting employee wage scale assignment...
✓ Processed 50 employees...
✓ Processed 100 employees...
========================================
✅ Assignment completed!
📊 Total employees updated: 150
========================================
```

### Option 2: Full Migration

**File:** `042_seed_employee_wage_scales.sql`

More detailed dengan options untuk customize behavior.

---

## 📊 Distribution Logic

### Weighted Random Assignment

```
Random Value    | Golongan  | Percentage
----------------|-----------|------------
0 - 40          | Pegawai   | 40%
40 - 95         | Karyawan  | 55%
95 - 100        | PKWT      | 5%
```

**Why this distribution?**
- **Karyawan (55%)**: Most common, operational staff
- **Pegawai (40%)**: Management & skilled positions
- **PKWT (5%)**: Contract workers, less common

### Random Scale Selection

Within each golongan, a **random scale** is selected:

**Pegawai:** Random from 80 scales
- Grades I through VIII
- Levels 1-9 and M (maximum)

**Karyawan:** Random from 60 scales
- Grades KI through KX
- Various levels (0-6 depending on grade)

**PKWT:** Only 1 scale
- Fixed scale: PKWT

---

## 🔍 Verification Queries

### 1. Check Distribution by Golongan

```sql
SELECT
    golongan_upah,
    COUNT(*) as jumlah_karyawan,
    TO_CHAR(AVG(base_salary), 'Rp 999,999,999') as rata_rata_gaji,
    TO_CHAR(MIN(base_salary), 'Rp 999,999,999') as gaji_terendah,
    TO_CHAR(MAX(base_salary), 'Rp 999,999,999') as gaji_tertinggi
FROM public.employees
WHERE status = 'active' AND golongan_upah IS NOT NULL
GROUP BY golongan_upah
ORDER BY AVG(base_salary) DESC;
```

**Expected Output:**
```
golongan_upah | jumlah | rata_rata_gaji  | gaji_terendah   | gaji_tertinggi
--------------|--------|-----------------|-----------------|----------------
pegawai       | 60     | Rp 4,500,000    | Rp 3,705,100    | Rp 5,450,600
karyawan      | 83     | Rp 3,370,000    | Rp 3,318,250    | Rp 3,433,250
pkwt          | 7      | Rp 3,318,250    | Rp 3,318,250    | Rp 3,318,250
```

### 2. Check by Division

```sql
SELECT
    d.kode_divisi,
    d.nama_divisi,
    COUNT(*) as total_employees,
    COUNT(CASE WHEN e.golongan_upah = 'pegawai' THEN 1 END) as pegawai,
    COUNT(CASE WHEN e.golongan_upah = 'karyawan' THEN 1 END) as karyawan,
    COUNT(CASE WHEN e.golongan_upah = 'pkwt' THEN 1 END) as pkwt,
    TO_CHAR(AVG(e.base_salary), 'Rp 999,999,999') as avg_salary
FROM public.employees e
JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active' AND e.golongan_upah IS NOT NULL
GROUP BY d.kode_divisi, d.nama_divisi
ORDER BY d.kode_divisi;
```

### 3. Sample Employees

```sql
SELECT
    e.employee_id,
    e.full_name,
    d.kode_divisi,
    e.golongan_upah,
    e.skala_upah,
    TO_CHAR(e.base_salary, 'Rp 999,999,999') as upah_pokok
FROM public.employees e
LEFT JOIN public.divisions d ON e.division_id = d.id
WHERE e.status = 'active' AND e.golongan_upah IS NOT NULL
ORDER BY e.base_salary DESC
LIMIT 20;
```

---

## ⚙️ Customization

### Change Distribution Percentages

Edit lines 36-40 in `seed_employee_wages_simple.sql`:

```sql
AND mu.golongan = CASE
    WHEN random() < 0.40 THEN 'pegawai'   -- Change to 0.30 for 30%
    WHEN random() < 0.95 THEN 'karyawan'  -- Change to 0.90 for 60%
    ELSE 'pkwt'                            -- Remaining will be PKWT
END
```

### Filter Specific Divisions

Add WHERE clause to employee loop (line 25):

```sql
FOR emp_record IN
    SELECT id, employee_id, full_name, division_id
    FROM public.employees
    WHERE status = 'active'
      AND division_id IS NOT NULL
      AND division_id IN (
          SELECT id FROM divisions WHERE kode_divisi IN ('AL', 'AP', 'BB')
      )  -- Only these divisions
    ORDER BY employee_id
```

### Assign Specific Golongan to All

Replace random logic with fixed golongan:

```sql
-- Remove the CASE statement and use fixed value
AND mu.golongan = 'karyawan'  -- All employees get karyawan scales
```

---

## 🔄 Re-running the Script

If you need to re-assign (e.g., testing different distributions):

```sql
-- Reset wage assignments
UPDATE public.employees
SET
    skala_upah = NULL,
    golongan_upah = NULL,
    base_salary = 3318250  -- Set to minimum wage
WHERE status = 'active';

-- Then run the seed script again
```

---

## 📝 Database Schema Changes

The script adds these columns to `employees` table:

```sql
-- New columns added by seed_employee_wages_simple.sql
ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS skala_upah TEXT;

ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS golongan_upah TEXT
    CHECK (golongan_upah IN ('pegawai', 'karyawan', 'pkwt'));
```

**Why new columns?**
- `skala_upah`: Store the wage scale (e.g., 'I-1', 'KII-3', 'PKWT')
- `golongan_upah`: Store the category (pegawai/karyawan/pkwt)
- Makes it easier to filter and display in UI
- No need for complex joins every time

---

## 🎯 Usage in EmployeeManagement.tsx

After running the seed, you can display wage info like this:

```typescript
// In EmployeeManagement component
<TableCell>
  <div>
    <div className="font-medium">
      {employee.golongan_upah?.toUpperCase()}
    </div>
    <div className="text-sm text-muted-foreground">
      {employee.skala_upah}
    </div>
  </div>
</TableCell>
<TableCell className="text-right">
  {formatCurrency(employee.base_salary)}
</TableCell>
```

**For Dropdown in Add/Edit Employee:**

```typescript
const { wageScales } = useWageScales();

// Filter by selected division
const availableScales = wageScales.filter(
  w => w.divisi_id === formData.divisionId && w.tahun === 2025
);

<Select
  value={`${formData.golongan}-${formData.skala}`}
  onValueChange={(value) => {
    const [golongan, skala] = value.split('-');
    const scale = availableScales.find(
      w => w.golongan === golongan && w.skala === skala
    );
    setFormData({
      ...formData,
      golongan_upah: golongan,
      skala_upah: skala,
      base_salary: scale?.upah_pokok || 0
    });
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Pilih skala upah" />
  </SelectTrigger>
  <SelectContent>
    {availableScales.map((scale) => (
      <SelectItem
        key={`${scale.golongan}-${scale.skala}`}
        value={`${scale.golongan}-${scale.skala}`}
      >
        {scale.golongan.toUpperCase()} - {scale.skala} (
        {formatCurrency(scale.upah_pokok)})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## ⚠️ Important Notes

1. **Backup First**: Always backup your employees table before running
   ```sql
   -- Create backup
   CREATE TABLE employees_backup AS SELECT * FROM employees;
   ```

2. **Test on Sample**: Test on a few employees first
   ```sql
   -- Limit to 10 employees for testing
   WHERE status = 'active' AND division_id IS NOT NULL
   ORDER BY employee_id LIMIT 10
   ```

3. **Division Requirement**: Employees must have `division_id` set
   - Script skips employees without division
   - Assign divisions first if needed

4. **Year 2025**: Script uses wage scales for year 2025
   - Change `mu.tahun = 2025` if needed
   - Make sure wage data exists for that year

5. **Random = Unpredictable**: Each run gives different results
   - Use seed for consistent random: `SELECT setseed(0.5);` before script

---

## 🐛 Troubleshooting

### Issue: "No wage scale found for employee X"

**Cause**: Employee's division has no wage scales in master_upah

**Solution:**
```sql
-- Check which divisions have no wage data
SELECT d.kode_divisi, d.nama_divisi
FROM divisions d
WHERE NOT EXISTS (
    SELECT 1 FROM master_upah mu
    WHERE mu.divisi_id = d.id AND mu.tahun = 2025
);

-- Run migrations 039 and 041 if missing
```

### Issue: "Column skala_upah does not exist"

**Cause**: Migration didn't run or column creation failed

**Solution:**
```sql
-- Manually add columns
ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS skala_upah TEXT;

ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS golongan_upah TEXT
    CHECK (golongan_upah IN ('pegawai', 'karyawan', 'pkwt'));
```

### Issue: All employees getting same golongan

**Cause**: Random function not working as expected

**Solution:**
Use different random approach:
```sql
-- Instead of nested CASE, use simple random
AND mu.golongan = (
    ARRAY['pegawai', 'karyawan', 'karyawan', 'karyawan', 'pkwt']
)[floor(random() * 5 + 1)]
```

---

## 📚 Related Documentation

- [SUPABASE_PAGINATION_GUIDE.md](SUPABASE_PAGINATION_GUIDE.md) - For fetching wage scales
- [WAGE_DATA_AUDIT.md](WAGE_DATA_AUDIT.md) - Verify wage data completeness
- [039_seed_wage_scales_2025.sql](supabase/migrations/039_seed_wage_scales_2025.sql) - Wage scales data
- [041_seed_pkwt_wage_2025.sql](supabase/migrations/041_seed_pkwt_wage_2025.sql) - PKWT data

---

## ✅ Summary

**What you get:**
- ✨ Automatic wage assignment for all employees
- 🎲 Realistic random distribution (40% Pegawai, 55% Karyawan, 5% PKWT)
- 💰 Correct base_salary from master_upah
- 📊 Easy verification queries
- 🔧 Customizable distribution

**Next Steps:**
1. Run `seed_employee_wages_simple.sql` in Supabase SQL Editor
2. Verify results with provided queries
3. Update EmployeeManagement.tsx to display wage info
4. Add wage scale dropdown for Add/Edit employee form

**Time saved:** Instead of manually entering 100+ employees × 3 fields = 300+ manual inputs, you now do it in **1 click**! 🎉

---

Last Updated: 2025-11-17 | Maintainer: Sigma Payroll Team
