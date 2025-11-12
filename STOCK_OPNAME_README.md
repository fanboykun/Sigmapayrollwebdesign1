# Stock Opname Module - Documentation

## Overview
Stock Opname (Stock Taking) adalah fitur untuk melakukan pengecekan fisik stok obat secara periodik dan menyesuaikan data sistem berdasarkan hasil pengecekan.

## Fitur Utama

### 1. **Daftar Stock Opname**
- ✅ View semua record stock opname
- ✅ Filter berdasarkan status (Draft, Completed, Approved)
- ✅ Search berdasarkan nomor opname atau nama petugas
- ✅ Lihat detail setiap opname

### 2. **Buat Stock Opname Baru**
- ✅ Otomatis load semua stok obat yang tersedia
- ✅ Input jumlah fisik untuk setiap batch
- ✅ Hitung selisih otomatis (Physical - System)
- ✅ Wajib isi alasan untuk item yang ada selisih
- ✅ Generate nomor opname otomatis (Format: OPN-YYYYMMDD-XXXX)

### 3. **Workflow Approval**
1. **Draft** → Stock opname dibuat oleh petugas
2. **Completed** → Petugas menandai opname selesai
3. **Approved** → Supervisor/Admin menyetujui dan sistem otomatis adjust stok

### 4. **Auto Stock Adjustment**
- Saat status menjadi "Approved", sistem otomatis:
  - Update quantity di `clinic_medicine_stock` menjadi physical quantity
  - Update `last_stock_check` timestamp
  - Adjust untuk semua batch yang ada selisih

## Database Schema

### Table: `clinic_stock_opname`
```sql
- id (UUID)
- opname_number (VARCHAR) - Format: OPN-YYYYMMDD-XXXX
- opname_date (DATE)
- period_month (INTEGER) - 1-12
- period_year (INTEGER)
- status (VARCHAR) - draft, completed, approved
- total_items_checked (INTEGER)
- total_variance (INTEGER)
- performed_by (UUID → users)
- verified_by (UUID → users)
- approved_by (UUID → users)
- approved_date (TIMESTAMPTZ)
- notes (TEXT)
```

### Table: `clinic_stock_opname_details`
```sql
- id (UUID)
- opname_id (UUID → clinic_stock_opname)
- medicine_id (UUID → clinic_medicines)
- batch_number (VARCHAR)
- system_quantity (INTEGER) - Qty di sistem
- physical_quantity (INTEGER) - Qty hasil pengecekan fisik
- variance (INTEGER) - Calculated: physical - system
- variance_reason (VARCHAR) - Alasan selisih
- adjustment_type (VARCHAR) - plus, minus, none
- expiry_date (DATE)
- notes (TEXT)
```

## Business Logic

### 1. Generate Opname Number
```typescript
Format: OPN-YYYYMMDD-XXXX
Contoh: OPN-20251112-0001

Logic:
- Get last opname number for today
- Increment sequence
- Pad dengan 0 sampai 4 digit
```

### 2. Calculate Variance
```typescript
variance = physical_quantity - system_quantity

adjustment_type:
- variance > 0  → 'plus'
- variance < 0  → 'minus'
- variance == 0 → 'none'
```

### 3. Validation Rules
- ✅ Item dengan variance harus ada alasan (variance_reason)
- ✅ Physical quantity tidak boleh negatif
- ✅ Minimal 1 item harus ada selisih untuk create opname
- ✅ Hanya opname status "completed" yang bisa di-approve
- ✅ Hanya opname status "draft" yang bisa di-complete

### 4. Stock Adjustment Logic
Saat approve:
```typescript
for each detail where variance !== 0:
  UPDATE clinic_medicine_stock
  SET quantity = physical_quantity,
      last_stock_check = NOW()
  WHERE medicine_id = detail.medicine_id
    AND batch_number = detail.batch_number
```

## Integration dengan Menu Stok Obat

### Di ClinicStock.tsx
- ✅ Banner informatif di bagian atas
- ✅ Mengarahkan user ke menu Stock Opname untuk stock taking
- ✅ Menjelaskan bahwa opname akan auto-adjust stok

### Navigation Flow
```
1. User buka "Stok Obat"
2. Lihat banner "Stock Opname Periodik"
3. Klik menu "Stock Opname" di sidebar
4. Buat opname baru
5. Input physical quantity
6. Simpan (status: draft)
7. Tandai selesai (status: completed)
8. Approve (status: approved) → Auto adjust stok
9. Stok di menu "Stok Obat" terupdate otomatis
```

## UI Components

### List View
- **Card Header**: Judul + deskripsi
- **Filters**: Search + Status filter
- **Table**:
  - No. Opname
  - Tanggal
  - Periode (Bulan Tahun)
  - Item Diperiksa
  - Total Selisih
  - Petugas
  - Status Badge
  - Action Button (View Detail)

### Create View
- **Section 1**: Info Opname
  - Tanggal opname (date picker)
  - Periode (auto dari tanggal)
  - Catatan (textarea)

- **Section 2**: Data Stock
  - Table editable:
    - Obat (readonly)
    - Batch (readonly)
    - Stok Sistem (readonly)
    - Stok Fisik (editable input)
    - Selisih (calculated badge)
    - Alasan Selisih (required if variance)
    - Catatan (optional)

### Detail Dialog
- **Opname Info**: Grid dengan info lengkap
- **Details Table**: List semua item dengan variance
- **Actions**:
  - Draft → "Tandai Selesai" button
  - Completed → "Setujui & Sesuaikan Stok" button
  - Approved → No actions (read only)

## Status Badges
```typescript
draft      → Gray badge with FileText icon
completed  → Blue badge with CheckCircle icon
approved   → Green badge with CheckCircle icon
```

## Variance Badges
```typescript
variance > 0  → Green badge with TrendingUp icon (+X)
variance < 0  → Red badge with TrendingDown icon (X)
variance == 0 → Gray badge with Minus icon (0)
```

## API Queries

### Load Opname Records
```typescript
supabase
  .from('clinic_stock_opname')
  .select(`
    *,
    performer:users!clinic_stock_opname_performed_by_fkey(full_name),
    verifier:users!clinic_stock_opname_verified_by_fkey(full_name),
    approver:users!clinic_stock_opname_approved_by_fkey(full_name)
  `)
  .order('opname_date', { ascending: false })
```

### Load Current Stock for Opname
```typescript
supabase
  .from('clinic_medicine_stock')
  .select(`
    id,
    medicine_id,
    batch_number,
    quantity,
    expiry_date,
    location,
    status,
    clinic_medicines!inner(
      medicine_code,
      name,
      unit
    )
  `)
  .eq('status', 'available')
  .gt('quantity', 0)
```

### Create Opname
```typescript
// 1. Insert opname header
supabase
  .from('clinic_stock_opname')
  .insert({
    opname_number,
    opname_date,
    period_month,
    period_year,
    status: 'draft',
    total_items_checked,
    total_variance,
    performed_by: user.id,
    notes
  })

// 2. Insert opname details (bulk)
supabase
  .from('clinic_stock_opname_details')
  .insert(details)
```

### Approve and Adjust Stock
```typescript
// 1. Update opname status
supabase
  .from('clinic_stock_opname')
  .update({
    status: 'approved',
    approved_by: user.id,
    approved_date: new Date()
  })

// 2. Get details with variance
const details = await supabase
  .from('clinic_stock_opname_details')
  .select('*')
  .eq('opname_id', opnameId)

// 3. Update stock for each item with variance
for (const detail of details) {
  if (detail.variance !== 0) {
    await supabase
      .from('clinic_medicine_stock')
      .update({
        quantity: detail.physical_quantity,
        last_stock_check: new Date()
      })
      .eq('medicine_id', detail.medicine_id)
      .eq('batch_number', detail.batch_number)
  }
}
```

## Testing Checklist

### Create Opname
- [ ] Load current stock berhasil
- [ ] Semua batch ditampilkan
- [ ] Input physical quantity berfungsi
- [ ] Variance terhitung otomatis
- [ ] Badge variance sesuai (plus/minus/none)
- [ ] Validation alasan selisih berfungsi
- [ ] Generate opname number unik
- [ ] Opname tersimpan dengan status draft

### Complete Opname
- [ ] Button "Tandai Selesai" muncul untuk draft
- [ ] Status berubah ke completed
- [ ] verified_by terisi dengan user ID

### Approve Opname
- [ ] Button "Setujui" muncul untuk completed
- [ ] Status berubah ke approved
- [ ] approved_by dan approved_date terisi
- [ ] Stock quantity ter-adjust sesuai physical
- [ ] last_stock_check terupdate
- [ ] Perubahan terlihat di menu Stok Obat

### Integration
- [ ] Banner muncul di menu Stok Obat
- [ ] Link ke Stock Opname jelas
- [ ] Data stok sinkron antara kedua menu

## Best Practices

### 1. Periodic Schedule
- Lakukan stock opname minimal 1 bulan sekali
- Jadwalkan di akhir bulan atau awal bulan
- Dokumentasikan periode dengan jelas

### 2. Data Accuracy
- Pastikan physical count akurat
- Double check untuk item dengan selisih besar
- Isi alasan selisih dengan detail

### 3. Approval Workflow
- Draft dulu, review sebelum complete
- Completed di-verify oleh petugas berbeda
- Approval hanya oleh supervisor/manager

### 4. Audit Trail
- Semua perubahan tercatat (performed_by, verified_by, approved_by)
- Timestamp otomatis (created_at, updated_at, approved_date)
- Notes untuk dokumentasi tambahan

## Error Handling

### Common Errors
1. **"Tidak ada perbedaan"**: Semua physical = system
   - Solution: Tidak perlu buat opname, atau cek ulang counting

2. **"Harap isi alasan selisih"**: Ada variance tanpa reason
   - Solution: Isi variance_reason untuk semua item dengan selisih

3. **"Gagal adjust stock"**: Error saat update stock
   - Solution: Check database constraints, batch masih exist

4. **"Duplicate opname number"**: Number generation conflict
   - Solution: Retry, sistem akan increment sequence

## Performance Optimization

### 1. Query Optimization
- Index pada `opname_date`, `opname_number`, `status`
- JOIN dengan select specific columns only
- Limit results untuk list view

### 2. Bulk Operations
- Insert details dalam 1 transaction
- Batch update stock adjustments
- Use Promise.all untuk parallel processing

### 3. UI Responsiveness
- Loading states untuk async operations
- Debounce search inputs
- Pagination untuk large datasets

## Future Enhancements

### Potential Features
- [ ] Export opname report to PDF/Excel
- [ ] Print barcode untuk batch tracking
- [ ] Mobile app untuk physical counting
- [ ] Photo upload untuk dokumentasi
- [ ] Variance threshold alerts
- [ ] Scheduled recurring opname
- [ ] Multi-location support
- [ ] Variance analytics dashboard

## Changelog

### Version 1.0.0 (2025-11-12)
- ✅ Initial implementation
- ✅ Complete CRUD operations
- ✅ Approval workflow
- ✅ Auto stock adjustment
- ✅ Integration with Stock menu
- ✅ Validation rules
- ✅ Status badges and indicators

---

**Developed by**: Sigma Development Team
**Module**: Clinic - Inventory Management
**Last Updated**: 2025-11-12
