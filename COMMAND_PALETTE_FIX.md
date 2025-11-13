# Command Palette Permission-Based Filtering - Fix Documentation

**Tanggal**: 2025-11-13
**Masalah**: Command Palette menampilkan semua menu tanpa filter berdasarkan role user
**Status**: ✅ FIXED

---

## 🔍 Analisis Masalah

### 1. **Masalah Scrollbar**
- CommandList memiliki `max-h-[250px]` sebagai default di `command.tsx` (line 86)
- Class `max-h-[400px]` yang ditambahkan di CommandPalette ter-override oleh default class
- Solusi: Gunakan `!max-h-[400px]` untuk force override dengan Tailwind important modifier

### 2. **Masalah Permission Filtering**
- Menu items di CommandPalette tidak semuanya memiliki mapping ke module permissions
- Beberapa menu ID tidak terdaftar di `MENU_MODULE_MAP` di AuthContext
- Function `canAccessMenu()` mengembalikan false untuk menu yang tidak ada mappingnya

### 3. **Missing Module Mappings**
Menu yang tidak memiliki mapping:
- `clinic-queue` → perlu mapping ke `clinic_registration`
- `clinic-medicine-stock` → perlu mapping ke `clinic_stock_management`
- `clinic-medicine-distribution` → perlu mapping ke `clinic_dispensing`
- `clinic-stock-opname` → perlu mapping ke `clinic_stock_management`
- `premi-sawit-master` → perlu mapping ke `premi_master`
- `premi-sawit-penggajian` → perlu mapping ke `premi_penggajian`
- `premi-sawit-laporan` → perlu mapping ke `premi_laporan`

---

## ✅ Perubahan yang Dilakukan

### 1. **CommandPalette.tsx** (`src/components/CommandPalette.tsx`)

#### a. Fix Scrollbar Issue (Line 232)
```tsx
// SEBELUM:
<CommandList className="max-h-[400px] overflow-y-auto">

// SESUDAH:
<CommandList className="!max-h-[400px] overflow-y-auto">
```
**Penjelasan**: `!` prefix memaksa Tailwind untuk override default max-h

#### b. Tambah Menu Items Lengkap (Lines 129-208)
Menambahkan semua menu items dengan proper grouping:

**Penggajian Group:**
```tsx
{ id: 'premi-sawit-penggajian', label: 'Premi Sawit', icon: Sprout, ... },
{ id: 'premi-deres-penggajian', label: 'Premi Deres', icon: Droplets, ... },
```

**Laporan Group:**
```tsx
{ id: 'premi-sawit-laporan', label: 'Laporan Premi Sawit', icon: Sprout, ... },
{ id: 'premi-deres-laporan', label: 'Laporan Premi Deres', icon: Droplets, ... },
{ id: 'bpjs-report', label: 'Laporan BPJS', icon: FileText, ... },
```

**Master Data Group:**
```tsx
{ id: 'potongan', label: 'Potongan', icon: Wallet, ... },
{ id: 'premi-sawit-master', label: 'Premi Sawit', icon: Sprout, ... },
{ id: 'premi-deres-master', label: 'Premi Deres', icon: Droplets, ... },
```

**Clinic Group (NEW):**
```tsx
{
  group: 'Clinic',
  items: [
    { id: 'clinic-queue', label: 'Antrian Pasien', icon: ClipboardList, ... },
    { id: 'clinic-examination', label: 'Pemeriksaan Diagnosa', icon: Stethoscope, ... },
    { id: 'clinic-prescription', label: 'Pembuatan Resep', icon: Pill, ... },
    { id: 'clinic-medicine-stock', label: 'Stock Obat', icon: Heart, ... },
    { id: 'clinic-medicine-distribution', label: 'Pemberian Obat', icon: Pill, ... },
    { id: 'clinic-stock-opname', label: 'Stock Opname', icon: ClipboardCheck, ... },
  ]
}
```

#### c. Icon Imports (Lines 74-80)
Menambahkan icon yang hilang:
```tsx
import {
  // ... existing icons
  Wallet,      // untuk Potongan
  Sprout,      // untuk Premi Sawit
  Droplets,    // untuk Premi Deres
  Heart,       // untuk Stock Obat
  Pill,        // untuk Resep & Pemberian Obat
  Stethoscope, // untuk Pemeriksaan
  ClipboardList, // untuk Antrian
} from 'lucide-react';
```

### 2. **AuthContext.tsx** (`src/contexts/AuthContext.tsx`)

#### Tambah Module Mappings (Lines 1289-1298)
```tsx
// Additional Clinic Menu Mappings
"clinic-queue": "clinic_registration",
"clinic-medicine-stock": "clinic_stock_management",
"clinic-medicine-distribution": "clinic_dispensing",
"clinic-stock-opname": "clinic_stock_management",

// Premi Sawit Additional Mappings
"premi-sawit-master": "premi_master",
"premi-sawit-penggajian": "premi_penggajian",
"premi-sawit-laporan": "premi_laporan",
```

---

## 🎯 Cara Kerja Permission Filtering

### 1. **Flow Diagram**
```
User mengetik di Command Palette
         ↓
menuItems.map() - loop semua groups
         ↓
group.items.filter() untuk setiap group
         ↓
canAccessMenu(item.id) - cek permission
         ↓
MENU_MODULE_MAP[menuId] - convert menu ID → module name
         ↓
hasPermission(module, "view") - cek di role_permissions
         ↓
Return true/false
         ↓
Filter menu yang user boleh akses
         ↓
Render hanya menu yang accessible
```

### 2. **Code Flow**
```tsx
// Di CommandPalette.tsx (Line 236-238)
const accessibleItems = group.items.filter(item =>
  item.id === 'profile' ||
  item.id === 'account-settings' ||
  canAccessMenu(item.id)  // ← Check permission
);

// Di AuthContext.tsx (Line 1553-1561)
const canAccessMenu = (menuId: string): boolean => {
  if (!user) return false;

  const moduleKey = MENU_MODULE_MAP[menuId];  // ← Convert ID
  if (!moduleKey) return false;

  return hasPermission(moduleKey, "view");  // ← Check permission
};
```

### 3. **Special Cases**
- `profile` dan `account-settings` selalu visible untuk semua user (hardcoded)
- Menu tanpa mapping akan return false (tidak ditampilkan)
- User tanpa login tidak bisa melihat menu apapun

---

## 🧪 Testing & Verification

### File Test Query
**Location**: `test_command_palette_permissions.sql`

### Queries untuk Testing:

1. **Cek semua permissions per role:**
```sql
SELECT r.code, rp.module_name, rp.can_view
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE r.status = 'active'
ORDER BY r.code, rp.module_name;
```

2. **Cek viewable modules count per role:**
```sql
SELECT r.code, COUNT(*) as total_viewable
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE rp.can_view = true
GROUP BY r.code;
```

3. **Verify Premi Deres permissions:**
```sql
SELECT r.code, rp.module_name, rp.can_view
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE rp.module_name LIKE 'premi_deres%'
ORDER BY r.code;
```

### Manual Testing Steps:

1. **Start Docker Desktop** (prerequisite)
2. **Start Supabase Local**:
   ```bash
   npx supabase start
   ```
3. **Run migrations**:
   ```bash
   npx supabase db reset --local
   ```
4. **Run test queries via Dashboard**:
   - Login to Supabase Dashboard
   - Go to SQL Editor
   - Copy-paste queries from `test_command_palette_permissions.sql`
   - Verify results

5. **Test di aplikasi dengan berbagai role**:
   - Login sebagai `super_admin` → harus melihat semua menu
   - Login sebagai `admin` → harus melihat kebanyakan menu
   - Login sebagai `manager` → harus melihat menu operasional
   - Login sebagai `karyawan` → hanya melihat menu self-service

---

## 📋 Expected Behavior per Role

### Super Admin
**Harus melihat semua menu** (40+ items):
- ✅ Semua menu Penggajian (5 items)
- ✅ Semua menu Laporan (5 items)
- ✅ Semua menu Master Data (10 items)
- ✅ Semua menu Presensi (4 items)
- ✅ Semua menu Clinic (6 items)
- ✅ Semua menu Administrasi (2 items)
- ✅ Semua menu Lainnya (5 items)

### Admin
**Menu yang bisa diakses**:
- ✅ Dashboard
- ✅ Kebanyakan menu Penggajian
- ✅ Kebanyakan menu Laporan
- ✅ Kebanyakan menu Master Data
- ✅ Menu Presensi
- ✅ Menu Clinic (tergantung assignment)
- ❌ User Management
- ❌ Role Management

### Manager
**Menu yang bisa diakses**:
- ✅ Dashboard
- ✅ Menu Laporan (read-only)
- ✅ Data Karyawan (read-only)
- ✅ Menu Presensi
- ✅ Menu Premi (untuk approval)
- ❌ Master Data (kecuali view)
- ❌ Administrasi

### Karyawan
**Menu yang bisa diakses**:
- ✅ Dashboard (personal)
- ✅ Gaji Karyawan (own data only)
- ✅ Cuti (own requests only)
- ✅ Profile & Account Settings
- ❌ Semua menu lainnya

---

## 🔐 Security Considerations

### 1. **Frontend Filtering**
- CommandPalette menggunakan `canAccessMenu()` untuk filter menu
- Hanya menu yang user punya `can_view=true` yang muncul
- Profile & Account Settings exception (selalu muncul)

### 2. **Backend Protection**
- RLS (Row Level Security) di Supabase tetap enforce di backend
- Meskipun user bypass frontend, backend tetap block unauthorized access
- Permissions di database level adalah source of truth

### 3. **Module Mapping Consistency**
- `MENU_MODULE_MAP` harus sync dengan routing di `App.tsx`
- Module names di mapping harus match dengan `role_permissions.module_name`
- Missing mapping = menu tidak muncul (fail-safe)

---

## 🐛 Known Issues & Limitations

### 1. **Docker Dependency**
- Supabase local development memerlukan Docker Desktop
- Jika Docker tidak running, tidak bisa test migrations locally
- Workaround: Test di Supabase Dashboard online

### 2. **Menu ID Consistency**
- Menu ID di CommandPalette harus exact match dengan:
  - View ID di App.tsx routing
  - Key di MENU_MODULE_MAP
- Typo di salah satu akan break permission checking

### 3. **Real-time Permission Updates**
- Permission changes di database tidak real-time update di frontend
- User perlu re-login untuk refresh permissions
- Future improvement: Add permission refresh endpoint

---

## 📝 Maintenance Notes

### Menambah Menu Baru

1. **Tambah di CommandPalette.tsx**:
```tsx
{
  id: 'new-menu',  // Must be unique
  label: 'Menu Baru',
  icon: IconName,
  keywords: 'keyword1 keyword2'
}
```

2. **Tambah mapping di AuthContext.tsx**:
```tsx
"new-menu": "module_name",
```

3. **Tambah permission di database**:
```sql
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
SELECT id, 'module_name', true, true, true, true
FROM roles WHERE code = 'super_admin';
```

4. **Update routing di App.tsx**:
```tsx
{activeView === "new-menu" && (
  <PermissionGuard module="module_name">
    <NewMenuComponent />
  </PermissionGuard>
)}
```

### Mengubah Icon Menu

1. Import icon dari lucide-react
2. Update di menuItems array
3. No other changes needed

### Mengubah Permission Module

1. Update mapping di `MENU_MODULE_MAP`
2. Update permissions di database via migration
3. Test dengan semua roles

---

## ✅ Verification Checklist

- [x] CommandList memiliki scrollbar dengan max-height 400px
- [x] Semua menu items ditambahkan dengan proper grouping
- [x] Semua icon diimport dengan benar
- [x] Module mappings lengkap di AuthContext
- [x] Test queries tersedia untuk verification
- [x] Documentation lengkap
- [ ] Docker running dan migrations applied (manual step)
- [ ] Test dengan 4 roles berbeda (manual step)
- [ ] Verify scrollbar muncul ketika menu > 400px (manual step)
- [ ] Verify permission filtering works per role (manual step)

---

## 📚 References

### Files Modified:
1. `src/components/CommandPalette.tsx` - Main component
2. `src/contexts/AuthContext.tsx` - Permission logic & module mapping
3. `test_command_palette_permissions.sql` - Test queries (new)
4. `COMMAND_PALETTE_FIX.md` - This documentation (new)

### Related Files:
- `src/components/ui/command.tsx` - UI component (shadcn/ui)
- `src/App.tsx` - Routing logic
- `src/components/Sidebar.tsx` - Main navigation
- `src/components/clinic/MedicalExamination.tsx` - ICD-10 search reference

### Database Tables:
- `public.roles` - Role definitions
- `public.role_permissions` - Permission matrix
- `public.users` - User role assignments

---

## 🎓 Lessons Learned

1. **Tailwind Important Modifier**: Use `!` prefix to force override default classes
2. **Module Mapping Consistency**: Menu ID, routing, and module mapping must all match
3. **Permission Architecture**: Frontend filtering + Backend RLS = Defense in depth
4. **Test Documentation**: Always create test queries for future verification
5. **Special Case Handling**: Some menus (profile, settings) should always be accessible

---

**Last Updated**: 2025-11-13
**Next Review**: After user testing with different roles
