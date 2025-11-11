# 🎯 Setup Role & Permission - Sigma Payroll System

## 📊 Role Structure (7 Roles)

### Payroll Roles (4 roles)
- **Super Admin** - Full access semua module (Payroll + Clinic)
- **Administrator** - Full access Payroll (29 modules)
- **Manager** - Full access Payroll (29 modules)
- **Karyawan** - Full access Payroll (29 modules)

### Clinic Roles (3 roles) ⭐
- **Admin Klinik** - Full access Clinic (15 modules)
- **Dokter Klinik** - Full access Clinic (14 modules)
- **Perawat** - Full access Clinic (14 modules)

---

## 🚀 Setup (1 Langkah)

### Run SQL Script

**File:** [SETUP_CLINIC_ROLES_ONLY.sql](SETUP_CLINIC_ROLES_ONLY.sql)

```bash
1. Buka: https://supabase.com/dashboard/project/gketmjcxsnzrrzwfrxfw/editor
2. SQL Editor → New Query
3. Copy-paste isi file SETUP_CLINIC_ROLES_ONLY.sql
4. Click "Run"
5. Done! ✅
```

### Expected Result:

```
Role                | Total Modules | Type
--------------------|---------------|--------
Super Administrator | ~44           | All
Administrator       | 29            | Payroll
Manager             | 29            | Payroll
Karyawan            | 29            | Payroll
Admin Klinik        | 15 ⭐         | Clinic
Dokter Klinik       | 14 ⭐         | Clinic
Perawat             | 14 ⭐         | Clinic
```

---

## 📦 Module Distribution

### Payroll Modules (29)

**Included in:** Super Admin, Administrator, Manager, Karyawan

1. Dashboard
2. Payroll (7): payroll_view, tax_worksheet, annual_payroll, employee_payroll, payroll_processing, payroll_reports
3. **Reports (2)**: presensi_report ⭐, bpjs_report ⭐
4. HR (4): employee_management, employee_transfer, recruitment, termination
5. Master Data (7): division, position, wage, tax, premium, natura, potongan
6. Attendance (4): working_days, holiday, attendance, leave
7. System (4): engagement, settings, user_management, role_management

### Clinic Modules (15)

**Included in:** Super Admin, Admin Klinik, Dokter Klinik, Perawat

1. Dashboard Klinik
2. Master Data (5): Obat, Supplier, Dokter, Perawat, Penyakit
3. Pelayanan (4): Pendaftaran, Pemeriksaan, Resep, Penyerahan
4. Stock Management (1)
5. Reports (1)
6. **Role Management** (Only Admin Klinik)
7. **Dashboard** (All clinic roles)

---

## 🎛️ Permission Management

### Who Can Manage Permissions?

| Manager | Can Manage |
|---------|-----------|
| **Super Admin** | All roles |
| **Admin Klinik** | Dokter Klinik, Perawat only |

### How to Manage:

1. Login sebagai Super Admin atau Admin Klinik
2. Go to: **Administrasi → Otorisasi**
3. Pilih role tab
4. Toggle switches (Lihat/Buat/Edit/Hapus)
5. Changes saved automatically

---

## ✅ Verification

### Check Database:

```sql
-- Check module count per role
SELECT
  r.name,
  COUNT(rp.module_name) as modules
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.is_system_role = true
GROUP BY r.name;
```

### Check Application:

1. Refresh aplikasi
2. Login Super Admin → Otorisasi
3. See 7 role tabs
4. Payroll roles: 29 modules (NO clinic)
5. Clinic roles: 15/14 modules (NO payroll)

---

## 🎯 Key Points

✅ **Clear Separation**: Payroll ≠ Clinic
✅ **Payroll Roles**: NO clinic access
✅ **Clinic Roles**: NO payroll access
✅ **Super Admin**: Full access all
✅ **Admin Klinik**: Manages Dokter & Perawat
✅ **Default**: Full access per branch
✅ **Control**: Via UI toggle (Otorisasi page)

---

## 📝 Notes

- AuthContext.tsx line 50 sudah updated dengan 7 role types
- Semua role default full access dalam branch-nya
- Super Admin & Admin Klinik atur permission via UI
- Changes apply on next login/refresh

---

**Last Updated:** 2025-11-11
**Status:** ✅ Ready to Use

