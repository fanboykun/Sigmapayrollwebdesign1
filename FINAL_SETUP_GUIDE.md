# 🎯 Final Setup Guide - Role & Permission System

## 📊 Overview

Setup sistem role dengan pemisahan jelas antara Payroll dan Clinic:

- **4 Payroll Roles**: Super Admin, Administrator, Manager, Karyawan
- **3 Clinic Roles**: Admin Klinik, Dokter Klinik, Perawat

Total: **7 Roles** dengan **Clear Separation**

---

## 🚀 Quick Setup

### 1. Run SQL Script

**File:** [SETUP_CLINIC_ROLES_ONLY.sql](SETUP_CLINIC_ROLES_ONLY.sql)

```
1. Buka Supabase Dashboard SQL Editor
2. Copy-paste script
3. Run
4. Verify results
```

### 2. Expected Results

```
Super Admin:     ~44 modules (All)
Administrator:   29 modules (Payroll only)
Manager:         29 modules (Payroll only)
Karyawan:        29 modules (Payroll only)
Admin Klinik:    15 modules (Clinic only)
Dokter Klinik:   14 modules (Clinic only)
Perawat:         14 modules (Clinic only)
```

---

## 📦 Module Breakdown

### Payroll Modules (29)

✅ Dashboard
✅ 7 Payroll modules
✅ 2 Reports (Presensi, BPJS) ⭐
✅ 4 HR modules
✅ 7 Master Data
✅ 4 Attendance modules
✅ 4 System modules

❌ NO Clinic modules

### Clinic Modules (15)

✅ Dashboard Klinik
✅ 5 Master Data (Obat, Supplier, Dokter, Perawat, Penyakit)
✅ 4 Pelayanan (Pendaftaran, Pemeriksaan, Resep, Penyerahan)
✅ 1 Stock Management
✅ 1 Reports
✅ Role Management (Admin Klinik only)

❌ NO Payroll modules

---

## 🎛️ Permission Control

| Manager Role | Can Manage |
|-------------|-----------|
| **Super Admin** | All 7 roles |
| **Admin Klinik** | Dokter & Perawat only |

**Via UI:** Administrasi → Otorisasi → Toggle switches

---

## ✅ Success Criteria

- ✅ 7 roles in database
- ✅ Payroll roles: 29 modules (NO clinic)
- ✅ Clinic roles: 15/14 modules (NO payroll)
- ✅ Clear separation maintained
- ✅ Otorisasi page shows correct modules per role
- ✅ Toggle switches work
- ✅ Admin Klinik can manage Dokter & Perawat

---

## 📚 Related Files

- **[SETUP_CLINIC_ROLES_ONLY.sql](SETUP_CLINIC_ROLES_ONLY.sql)** - SQL script to run
- **[ROLE_PERMISSION_SETUP.md](ROLE_PERMISSION_SETUP.md)** - Quick reference guide
- **[src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)** - Line 50 (UserRole type)

---

## 🎯 Key Points

1. **Payroll Branch** - Administrator, Manager, Karyawan
2. **Clinic Branch** - Admin Klinik, Dokter, Perawat
3. **NO Overlap** - Clear separation
4. **UI Control** - Super Admin & Admin Klinik manage via Otorisasi
5. **Default Full** - All roles get full access in their branch

---

**Time:** 10 minutes
**Status:** ✅ Ready
**Last Updated:** 2025-11-11
