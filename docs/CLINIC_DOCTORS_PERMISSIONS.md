# Dokumentasi Permissions - Menu Data Dokter

## Overview
Dokumen ini menjelaskan integrasi sistem otorisasi untuk modul **Master Data Dokter** yang telah dibuat.

---

## 1. Module Name
```
clinic_master_doctors
```

---

## 2. Menu ID (untuk routing)
```
clinic-doctors
```

---

## 3. Permissions Matrix

| Role | View | Create | Edit | Delete | Keterangan |
|------|------|--------|------|--------|------------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | Full access |
| **Admin** | ✅ | ✅ | ✅ | ❌ | Operational access without delete |
| **Manager** | ❌ | ❌ | ❌ | ❌ | No access to clinic modules |
| **Karyawan** | ❌ | ❌ | ❌ | ❌ | No access to clinic modules |
| **Clinic Doctor** | ✅ | ❌ | ❌ | ❌ | View only (melihat jadwal dokter lain) |
| **Clinic Nurse** | ✅ | ❌ | ❌ | ❌ | View only (perlu lihat jadwal untuk registrasi) |
| **Clinic Admin** | ✅ | ✅ | ✅ | ❌ | Full operational access |

---

## 4. Files yang Telah Diupdate

### 4.1 Component: ClinicDoctors.tsx
📁 **File**: `src/components/ClinicDoctors.tsx`

Komponen React untuk mengelola data dokter dengan fitur:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Search & Filter by specialization
- ✅ Schedule management (jadwal praktik per hari)
- ✅ Grid card layout dengan informasi lengkap
- ✅ Form validation
- ✅ Status badges (Active/Inactive, Internal/External)

### 4.2 Role Management: RoleManagement.tsx
📁 **File**: `src/components/RoleManagement.tsx`

**Updated**: `moduleDisplayConfig` object (line 128-150)

Menambahkan konfigurasi display untuk semua modul clinic:
```typescript
// Clinic Module - Master Data
clinic_master_doctors: {
  name: 'Master Data Dokter',
  category: 'Klinik - Master Data',
  description: 'Kelola data dokter yang bertugas'
}
```

### 4.3 Auth Context: AuthContext.tsx
📁 **File**: `src/contexts/AuthContext.tsx`

**Updated**: `MENU_MODULE_MAP` object (line 1096-1120)

Menambahkan mapping untuk routing clinic modules:
```typescript
"clinic-doctors": "clinic_master_doctors"
```

### 4.4 Database Migration
📁 **File**: `supabase/migrations/018_update_clinic_doctors_permissions.sql`

Migration file untuk menambahkan/update permissions di database:
- ✅ Permissions untuk semua roles
- ✅ ON CONFLICT handling (upsert)
- ✅ Verification query included

### 4.5 App Routing: App.tsx
📁 **File**: `src/App.tsx`

**Updated**: Import statement (line 74)
```typescript
import { ClinicDoctors } from "./components/ClinicDoctors";
```

---

## 5. Database Schema

### Table: `clinic_doctors`
```sql
CREATE TABLE clinic_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  doctor_code VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  str_number VARCHAR(50) NOT NULL UNIQUE,
  sip_number VARCHAR(50),
  specialization VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  schedule JSONB,
  is_active BOOLEAN DEFAULT true,
  is_external BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `role_permissions`
```sql
-- Example for Super Admin
INSERT INTO role_permissions
  (role_id, module_name, can_view, can_create, can_edit, can_delete)
VALUES
  (v_super_admin_id, 'clinic_master_doctors', true, true, true, true);
```

---

## 6. Sample Data

Database telah di-seed dengan 5 dokter sample:

| Kode | Nama | Spesialisasi | Status |
|------|------|-------------|--------|
| DOC001 | dr. Andi Wijaya, Sp.PD | Spesialis Penyakit Dalam | Internal |
| DOC002 | dr. Siti Rahmawati | Dokter Umum | Internal |
| DOC003 | dr. Budi Santoso, Sp.OG | Spesialis Kandungan | **External** |
| DOC004 | drg. Maya Kusuma | Dokter Gigi | Internal |
| DOC005 | dr. Ahmad Hidayat | Dokter Umum | Internal |

---

## 7. Cara Menjalankan Migration

### Jika Menggunakan Supabase Local (Docker):
```bash
# Reset database (apply all migrations)
npx supabase db reset

# Atau apply migration spesifik
npx supabase migration up
```

### Jika Menggunakan Supabase Cloud:
```bash
# Push migrations ke cloud
npx supabase db push

# Atau via dashboard
# 1. Buka Supabase Dashboard
# 2. Pilih project
# 3. SQL Editor
# 4. Copy-paste isi file 018_update_clinic_doctors_permissions.sql
# 5. Run
```

---

## 8. Testing Permissions

### 8.1 Via UI (Role Management Page)
1. Login sebagai Super Admin
2. Buka menu **Administrasi** → **Role & Permission**
3. Pilih tab role yang ingin dicek
4. Cari modul **"Master Data Dokter"** di kategori **"Klinik - Master Data"**
5. Verifikasi checkbox permissions sesuai matrix di atas

### 8.2 Via Database Query
```sql
SELECT
  r.name as role_name,
  rp.module_name,
  rp.can_view,
  rp.can_create,
  rp.can_edit,
  rp.can_delete
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
WHERE rp.module_name = 'clinic_master_doctors'
ORDER BY r.name;
```

### 8.3 Via Component (hasPermission)
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { hasPermission, canAccessMenu } = useAuth();

  // Check menu access
  const canAccess = canAccessMenu('clinic-doctors');

  // Check specific permissions
  const canView = hasPermission('clinic_master_doctors', 'view');
  const canCreate = hasPermission('clinic_master_doctors', 'create');
  const canEdit = hasPermission('clinic_master_doctors', 'edit');
  const canDelete = hasPermission('clinic_master_doctors', 'delete');
}
```

---

## 9. Integration dengan Sidebar

Menu "Master Data Dokter" sudah terintegrasi dengan sidebar di:
📁 **File**: `src/components/Sidebar.tsx`

Menu akan otomatis muncul/hide berdasarkan permission user:
```typescript
{canAccessMenu('clinic-doctors') && (
  <button onClick={() => onViewChange('clinic-doctors')}>
    <Stethoscope className="w-4 h-4" />
    Master Data Dokter
  </button>
)}
```

---

## 10. Checklist Implementation

- ✅ Component ClinicDoctors.tsx created
- ✅ CRUD functionality implemented
- ✅ Search & filter implemented
- ✅ Schedule management implemented
- ✅ RoleManagement.tsx updated (moduleDisplayConfig)
- ✅ AuthContext.tsx updated (MENU_MODULE_MAP)
- ✅ Migration file created (018_update_clinic_doctors_permissions.sql)
- ✅ App.tsx routing updated
- ✅ Sample data seeded
- ✅ Build successful (no errors)
- ✅ Documentation created

---

## 11. Next Steps (Optional)

1. **Run Migration**: Jalankan migration file saat database online
2. **Test Permissions**: Test dengan berbagai role users
3. **UI Testing**: Test CRUD operations di browser
4. **Permission Guard**: Tambahkan `<PermissionGuard>` jika diperlukan
5. **API Integration**: Integrate dengan backend API jika ada

---

## 12. Support & Troubleshooting

### Issue: Menu tidak muncul di sidebar
**Solution**:
- Pastikan user memiliki permission `can_view = true` untuk `clinic_master_doctors`
- Check mapping di `MENU_MODULE_MAP` di AuthContext.tsx
- Verify `canAccessMenu('clinic-doctors')` returns true

### Issue: Error saat CRUD operations
**Solution**:
- Check permissions: `can_create`, `can_edit`, `can_delete`
- Verify table `clinic_doctors` exists
- Check foreign key constraints (user_id, employee_id)

### Issue: Migration gagal
**Solution**:
- Pastikan table `roles` dan `role_permissions` sudah ada
- Check role codes: `super_admin`, `admin`, `clinic_admin`, etc.
- Run migration `009_clinic_seed_data.sql` terlebih dahulu

---

## Contact
Untuk pertanyaan lebih lanjut, hubungi:
- **Team**: Sigma Development Team
- **Version**: 1.0.0
- **Date**: 2025-11-10

---

*Generated with Claude Code*
