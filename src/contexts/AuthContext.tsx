/**
 * ==========================================================================
 * AUTH CONTEXT - AUTHENTICATION & AUTHORIZATION MANAGEMENT
 * ==========================================================================
 *
 * Context untuk manajemen autentikasi dan otorisasi user dalam aplikasi.
 * Mengimplementasikan Role-Based Access Control (RBAC) dengan 4 level akses.
 *
 * #Authentication #Authorization #RBAC #ContextAPI
 * #UserManagement #PermissionSystem #SecurityLayer
 *
 * FITUR UTAMA:
 * - Login/Logout functionality
 * - User session management dengan localStorage
 * - Role-based permissions (4 levels: Super Admin, Admin, Manager, Karyawan)
 * - Module-level access control
 * - Menu visibility based on permissions
 *
 * ROLE HIERARCHY:
 * 1. Super Admin - Full access ke semua fitur
 * 2. Admin - Access ke semua fitur kecuali user & role management
 * 3. Manager - View-only access ke sebagian besar fitur
 * 4. Karyawan - Limited access (dashboard & payroll view only)
 *
 * @author Sistem Payroll Team
 * @version 1.0.0
 * @since 2024-10-26
 * ==========================================================================
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { clearAuthStorage } from "../utils/auth-cleanup";
import {
  fetchPermissionsByRoleCode,
  type RolePermission,
} from "../services/rolePermissionService";

/**
 * User role types yang tersedia dalam sistem
 * #UserRoles #AccessLevels
 */
export type UserRole = "super_admin" | "admin" | "manager" | "karyawan" | "admin_klinik" | "dokter_klinik" | "perawat";

/**
 * Interface untuk data user
 * #UserInterface #UserData
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string; // Link ke data karyawan untuk role 'karyawan'
  avatar?: string;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

/**
 * Interface untuk permission module
 * Setiap module memiliki 4 tipe aksi: view, create, edit, delete
 * #PermissionInterface #ModulePermission
 */
export interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Interface untuk Auth Context
 * #ContextInterface #AuthType
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (
    module: string,
    action?: "view" | "create" | "edit" | "delete"
  ) => boolean;
  canAccessMenu: (menuId: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * ==========================================================================
 * MOCK DATA - DEMO USERS & PASSWORDS
 * ==========================================================================
 *
 * Data mock untuk demo aplikasi. Dalam production, data ini akan
 * digantikan dengan API backend yang aman.
 *
 * #MockData #DemoAccounts #Testing
 *
 * DEMO ACCOUNTS:
 * 1. Super Admin - Full access
 * 2. Admin Payroll - Admin level access
 * 3. Manager HRD - Manager level access
 * 4. Budi Santoso - Karyawan level access
 *
 * ⚠️ WARNING: Jangan gunakan sistem password hardcoded ini di production!
 * ==========================================================================
 */

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Super Admin",
    email: "superadmin@sawit.com",
    role: "super_admin",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-10-26",
  },
  {
    id: "2",
    name: "Admin Payroll",
    email: "admin@sawit.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-10-26",
  },
  {
    id: "3",
    name: "Manager HRD",
    email: "manager@sawit.com",
    role: "manager",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-10-25",
  },
  {
    id: "4",
    name: "Budi Santoso",
    email: "budi@sawit.com",
    role: "karyawan",
    employeeId: "EMP001",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-10-26",
  },
];

/**
 * Mock passwords untuk demo
 * ⚠️ Production: Implementasikan proper authentication dengan backend
 * #MockPasswords #DemoCredentials
 */
const MOCK_PASSWORDS: Record<string, string> = {
  "superadmin@sawit.com": "super123",
  "admin@sawit.com": "admin123",
  "manager@sawit.com": "manager123",
  "budi@sawit.com": "karyawan123",
};

/**
 * ==========================================================================
 * ROLE-BASED PERMISSIONS CONFIGURATION
 * ==========================================================================
 *
 * Konfigurasi lengkap permission untuk setiap role dalam sistem.
 * Setiap module memiliki 4 level akses: view, create, edit, delete
 *
 * #PermissionConfig #RBAC #AccessControl
 *
 * PERMISSION MATRIX:
 * - super_admin: Full access (CRUD) ke semua module
 * - admin: Full access kecuali user & role management
 * - manager: View-only access ke sebagian besar module
 * - karyawan: Limited access (dashboard & payroll view only)
 *
 * MODULE LIST:
 * - dashboard, payroll_view, tax_worksheet
 * - employee_management, division_master, position_master
 * - premium_master, tax_master, employee_payroll
 * - payroll_processing, payroll_reports
 * - settings, user_management, role_management
 * ==========================================================================
 */
const ROLE_PERMISSIONS: Record<UserRole, Record<string, Permission>> = {
  super_admin: {
    dashboard: {
      module: "dashboard",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    payroll_view: {
      module: "payroll_view",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    tax_worksheet: {
      module: "tax_worksheet",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    annual_payroll: {
      module: "annual_payroll",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    employee_management: {
      module: "employee_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    employee_transfer: {
      module: "employee_transfer",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    division_master: {
      module: "division_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    position_master: {
      module: "position_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    wage_master: {
      module: "wage_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    natura_master: {
      module: "natura_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premium_master: {
      module: "premium_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    tax_master: {
      module: "tax_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    potongan_master: {
      module: "potongan_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    working_days_master: {
      module: "working_days_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    holiday_master: {
      module: "holiday_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    attendance_master: {
      module: "attendance_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    leave_management: {
      module: "leave_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    recruitment: {
      module: "recruitment",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    termination: {
      module: "termination",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    employee_payroll: {
      module: "employee_payroll",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    payroll_processing: {
      module: "payroll_processing",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    payroll_reports: {
      module: "payroll_reports",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    presensi_report: {
      module: "presensi_report",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    bpjs_report: {
      module: "bpjs_report",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    engagement: {
      module: "engagement",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    settings: {
      module: "settings",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    user_management: {
      module: "user_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    role_management: {
      module: "role_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    // ===== PREMI KEBUN MODULE PERMISSIONS =====
    premi_master: {
      module: "premi_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_penggajian: {
      module: "premi_penggajian",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_laporan: {
      module: "premi_laporan",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    // ===== PREMI DERES MODULE PERMISSIONS =====
    premi_deres_master: {
      module: "premi_deres_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_deres_penggajian: {
      module: "premi_deres_penggajian",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_deres_laporan: {
      module: "premi_deres_laporan",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    // ===== CLINIC MODULE PERMISSIONS =====
    clinic_dashboard: {
      module: "clinic_dashboard",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_medicines: {
      module: "clinic_master_medicines",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_suppliers: {
      module: "clinic_master_suppliers",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_doctors: {
      module: "clinic_master_doctors",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_nurses: {
      module: "clinic_master_nurses",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_diseases: {
      module: "clinic_master_diseases",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_registration: {
      module: "clinic_registration",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_examination: {
      module: "clinic_examination",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_prescription: {
      module: "clinic_prescription",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_dispensing: {
      module: "clinic_dispensing",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_sick_letter: {
      module: "clinic_sick_letter",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_stock_management: {
      module: "clinic_stock_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_reports: {
      module: "clinic_reports",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  },
  admin: {
    dashboard: {
      module: "dashboard",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    payroll_view: {
      module: "payroll_view",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    tax_worksheet: {
      module: "tax_worksheet",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    annual_payroll: {
      module: "annual_payroll",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    employee_management: {
      module: "employee_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    employee_transfer: {
      module: "employee_transfer",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    division_master: {
      module: "division_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    position_master: {
      module: "position_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    wage_master: {
      module: "wage_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    natura_master: {
      module: "natura_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premium_master: {
      module: "premium_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    tax_master: {
      module: "tax_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    potongan_master: {
      module: "potongan_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    working_days_master: {
      module: "working_days_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    holiday_master: {
      module: "holiday_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    attendance_master: {
      module: "attendance_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    leave_management: {
      module: "leave_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    recruitment: {
      module: "recruitment",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    termination: {
      module: "termination",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    employee_payroll: {
      module: "employee_payroll",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    payroll_processing: {
      module: "payroll_processing",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    payroll_reports: {
      module: "payroll_reports",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    presensi_report: {
      module: "presensi_report",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    bpjs_report: {
      module: "bpjs_report",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    engagement: {
      module: "engagement",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    settings: {
      module: "settings",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    user_management: {
      module: "user_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    role_management: {
      module: "role_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // ===== PREMI KEBUN MODULE PERMISSIONS =====
    premi_master: {
      module: "premi_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_penggajian: {
      module: "premi_penggajian",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_laporan: {
      module: "premi_laporan",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // ===== PREMI DERES MODULE PERMISSIONS =====
    premi_deres_master: {
      module: "premi_deres_master",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_deres_penggajian: {
      module: "premi_deres_penggajian",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    premi_deres_laporan: {
      module: "premi_deres_laporan",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
  manager: {
    dashboard: {
      module: "dashboard",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    payroll_view: {
      module: "payroll_view",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    tax_worksheet: {
      module: "tax_worksheet",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    annual_payroll: {
      module: "annual_payroll",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    employee_management: {
      module: "employee_management",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    employee_transfer: {
      module: "employee_transfer",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    division_master: {
      module: "division_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    position_master: {
      module: "position_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    wage_master: {
      module: "wage_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    natura_master: {
      module: "natura_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    premium_master: {
      module: "premium_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    tax_master: {
      module: "tax_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    potongan_master: {
      module: "potongan_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    working_days_master: {
      module: "working_days_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    holiday_master: {
      module: "holiday_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    attendance_master: {
      module: "attendance_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    leave_management: {
      module: "leave_management",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    recruitment: {
      module: "recruitment",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    termination: {
      module: "termination",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    employee_payroll: {
      module: "employee_payroll",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    payroll_processing: {
      module: "payroll_processing",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    payroll_reports: {
      module: "payroll_reports",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    presensi_report: {
      module: "presensi_report",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    bpjs_report: {
      module: "bpjs_report",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    engagement: {
      module: "engagement",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    settings: {
      module: "settings",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    user_management: {
      module: "user_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    role_management: {
      module: "role_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // ===== PREMI KEBUN MODULE PERMISSIONS =====
    premi_master: {
      module: "premi_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    premi_penggajian: {
      module: "premi_penggajian",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    premi_laporan: {
      module: "premi_laporan",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // ===== PREMI DERES MODULE PERMISSIONS =====
    premi_deres_master: {
      module: "premi_deres_master",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    premi_deres_penggajian: {
      module: "premi_deres_penggajian",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    premi_deres_laporan: {
      module: "premi_deres_laporan",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
  karyawan: {
    dashboard: {
      module: "dashboard",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    payroll_view: {
      module: "payroll_view",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    tax_worksheet: {
      module: "tax_worksheet",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    annual_payroll: {
      module: "annual_payroll",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    employee_management: {
      module: "employee_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    employee_transfer: {
      module: "employee_transfer",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    division_master: {
      module: "division_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    position_master: {
      module: "position_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    wage_master: {
      module: "wage_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    natura_master: {
      module: "natura_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    premium_master: {
      module: "premium_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    tax_master: {
      module: "tax_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    potongan_master: {
      module: "potongan_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    employee_payroll: {
      module: "employee_payroll",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    payroll_processing: {
      module: "payroll_processing",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    payroll_reports: {
      module: "payroll_reports",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    working_days_master: {
      module: "working_days_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    holiday_master: {
      module: "holiday_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    attendance_master: {
      module: "attendance_master",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    leave_management: {
      module: "leave_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    recruitment: {
      module: "recruitment",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    termination: {
      module: "termination",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    presensi_report: {
      module: "presensi_report",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    bpjs_report: {
      module: "bpjs_report",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    engagement: {
      module: "engagement",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    settings: {
      module: "settings",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    user_management: {
      module: "user_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    role_management: {
      module: "role_management",
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
  // ===== ADMIN KLINIK PERMISSIONS =====
  admin_klinik: {
    dashboard: {
      module: "dashboard",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // Full access to all clinic modules
    clinic_dashboard: {
      module: "clinic_dashboard",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_medicines: {
      module: "clinic_master_medicines",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_suppliers: {
      module: "clinic_master_suppliers",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_doctors: {
      module: "clinic_master_doctors",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_nurses: {
      module: "clinic_master_nurses",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_master_diseases: {
      module: "clinic_master_diseases",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_registration: {
      module: "clinic_registration",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_examination: {
      module: "clinic_examination",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_prescription: {
      module: "clinic_prescription",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_dispensing: {
      module: "clinic_dispensing",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_sick_letter: {
      module: "clinic_sick_letter",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_stock_management: {
      module: "clinic_stock_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    clinic_reports: {
      module: "clinic_reports",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  },
  // ===== DOKTER KLINIK PERMISSIONS =====
  dokter_klinik: {
    dashboard: {
      module: "dashboard",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    clinic_dashboard: {
      module: "clinic_dashboard",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // View only for master data
    clinic_master_medicines: {
      module: "clinic_master_medicines",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    clinic_master_diseases: {
      module: "clinic_master_diseases",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // Full access to clinical services
    clinic_registration: {
      module: "clinic_registration",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    clinic_examination: {
      module: "clinic_examination",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    clinic_prescription: {
      module: "clinic_prescription",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    clinic_sick_letter: {
      module: "clinic_sick_letter",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    // View only for reports
    clinic_reports: {
      module: "clinic_reports",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
  // ===== PERAWAT (NURSE) PERMISSIONS =====
  perawat: {
    dashboard: {
      module: "dashboard",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    clinic_dashboard: {
      module: "clinic_dashboard",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // View only for master data
    clinic_master_medicines: {
      module: "clinic_master_medicines",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    clinic_master_diseases: {
      module: "clinic_master_diseases",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // Limited access to clinical services
    clinic_registration: {
      module: "clinic_registration",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    clinic_examination: {
      module: "clinic_examination",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    clinic_prescription: {
      module: "clinic_prescription",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    // Full access to dispensing
    clinic_dispensing: {
      module: "clinic_dispensing",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    clinic_stock_management: {
      module: "clinic_stock_management",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    // View only for reports
    clinic_reports: {
      module: "clinic_reports",
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
};

/**
 * ==========================================================================
 * MENU TO MODULE MAPPING
 * ==========================================================================
 *
 * Mapping antara menu ID (yang digunakan dalam routing) dengan
 * module name (yang digunakan dalam permission system).
 *
 * #MenuMapping #RoutingConfig
 *
 * Digunakan oleh canAccessMenu() untuk mengecek permission berdasarkan menu ID
 * ==========================================================================
 */
const MENU_MODULE_MAP: Record<string, string> = {
  dashboard: "dashboard",
  "payroll-view": "payroll_view",
  "tax-worksheet": "tax_worksheet",
  "annual-payroll": "annual_payroll",
  hrm: "employee_management",
  "employee-transfer": "employee_transfer",
  division: "division_master",
  position: "position_master",
  "wage-master": "wage_master",
  premium: "premium_master",
  "tax-master": "tax_master",
  potongan: "potongan_master",
  "working-days": "working_days_master",
  holidays: "holiday_master",
  attendance: "attendance_master",
  leave: "leave_management",
  "leave-division": "leave_management", // Menggunakan permission yang sama dengan leave
  employees: "employee_payroll",
  processing: "payroll_processing",
  reports: "payroll_reports",
  "presensi-report": "presensi_report",
  "bpjs-report": "bpjs_report",
  engagement: "engagement",
  settings: "settings",
  "user-management": "user_management",
  "role-management": "role_management",

  // ===== PREMI KEBUN MODULE MAPPINGS =====
  "premi-master": "premi_master",
  "premi-penggajian": "premi_penggajian",
  "premi-laporan": "premi_laporan",

  // ===== PREMI DERES MODULE MAPPINGS =====
  "premi-deres-master": "premi_deres_master",
  "premi-deres-penggajian": "premi_deres_penggajian",
  "premi-deres-laporan": "premi_deres_laporan",

  // ===== CLINIC MODULE MAPPINGS =====
  "clinic-dashboard": "clinic_dashboard",
  // Master Data Clinic
  "clinic-medicines": "clinic_master_medicines",
  "clinic-suppliers": "clinic_master_suppliers",
  "clinic-doctors": "clinic_master_doctors",
  "clinic-nurses": "clinic_master_nurses",
  "clinic-diseases": "clinic_master_diseases",
  // Pelayanan Clinic
  "clinic-registration": "clinic_registration",
  "clinic-examination": "clinic_examination",
  "clinic-prescription": "clinic_prescription",
  "clinic-dispensing": "clinic_dispensing",
  // Manajemen Stok Clinic (semua menggunakan clinic_stock_management)
  "clinic-stock": "clinic_stock_management",
  "clinic-receiving": "clinic_stock_management",
  "clinic-opname": "clinic_stock_management",
  // Laporan Clinic (semua menggunakan clinic_reports)
  "clinic-report-visits": "clinic_reports",
  "clinic-report-diseases": "clinic_reports",
  "clinic-report-medicines": "clinic_reports",
  "clinic-report-costs": "clinic_reports",
};

function getFromLS() {
  const fromLS = localStorage.getItem("user");
  return fromLS ? JSON.parse(fromLS) : null;
}
function setToLocalStotrage(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}
function delFromLocalStorage() {
  localStorage.removeItem("user");
}

/**
 * ==========================================================================
 * AUTH PROVIDER COMPONENT
 * ==========================================================================
 *
 * Provider component yang menyediakan auth context ke seluruh aplikasi.
 * Menangani state management untuk user session dan permissions.
 *
 * #AuthProvider #ContextProvider #SessionManagement
 *
 * @param children - Child components yang akan dibungkus provider
 * ==========================================================================
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getFromLS);
  const [isLoading, setIsLoading] = useState(true);
  const [supabasePermissions, setSupabasePermissions] = useState<
    RolePermission[] | null
  >(null);

  /**
   * Validate session on mount and load permissions if valid
   * #InitialLoad #SessionValidation #PermissionSync
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth session...");

        // Check Supabase session first
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Error getting session:", error);
          // Clear invalid session
          clearAuthStorage();
          setUser(null);
          delFromLocalStorage();
          setIsLoading(false);
          return;
        }

        // If no Supabase session but localStorage has user, clear it
        if (!session && user) {
          console.warn("⚠️ No Supabase session but localStorage has user. Clearing...");
          clearAuthStorage();
          setUser(null);
          delFromLocalStorage();
          setIsLoading(false);
          return;
        }

        // If we have a valid session and user, load permissions
        if (session && user && user.role) {
          console.log("✅ Valid session found, loading permissions");
          await loadPermissionsFromSupabase(user.role);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Unexpected error initializing auth:", error);
        // On error, clear everything to be safe
        clearAuthStorage();
        setUser(null);
        delFromLocalStorage();
        setIsLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  /**
   * Listen for auth state changes
   * Auto-logout when session expires
   * #AuthStateListener #SessionManagement
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔔 Auth state change:", event, session ? "Session exists" : "No session");

        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          console.log("🚪 Session ended, logging out...");
          clearAuthStorage();
          setUser(null);
          setSupabasePermissions(null);
          delFromLocalStorage();
        }

        if (event === 'SIGNED_IN' && session) {
          console.log("✅ User signed in via auth state change");
        }

        if (event === 'TOKEN_REFRESHED' && session) {
          console.log("🔄 Token refreshed successfully");
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Fungsi login untuk autentikasi user menggunakan Supabase Auth
   * #LoginFunction #Authentication #SupabaseAuth
   *
   * @param email - Email user
   * @param password - Password user
   * @returns Promise<boolean> - true jika login berhasil
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting login for:", email);

      // Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log("📡 Auth response:", { authData, authError });

      if (authError) {
        console.error("❌ Login error:", authError);
        alert(`Login gagal: ${authError.message}`);
        setIsLoading(false);
        return false;
      }

      if (authData.user) {
        // Fetch user data from our users table with role
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(
            `
            *,
            role:roles!role_id(code, name)
          `
          )
          .eq("id", authData.user.id)
          .single();

        console.log("👤 User data response:", { userData, userError });

        if (userError) {
          console.error("❌ Error fetching user data:", userError);
          alert(`Error mengambil data user: ${userError.message}`);
          await supabase.auth.signOut();
          setIsLoading(false);
          return false;
        }

        if (userData && userData.role) {
          console.log("✅ Login successful! User data:", userData);
          const appUser: User = {
            id: userData.id,
            name: userData.full_name,
            email: userData.email,
            role: userData.role.code as UserRole,
            employeeId: userData.employee_id || undefined,
            status: "active",
            createdAt: userData.created_at,
            lastLogin: new Date().toISOString(),
          };
          setUser(appUser);
          setToLocalStotrage(appUser);

          // Load permissions from Supabase
          await loadPermissionsFromSupabase(appUser.role);

          setIsLoading(false);
          return true;
        }
      }

      console.error("❌ No user data returned");
      alert("Login gagal: Tidak ada data user");
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("❌ Unexpected login error:", error);
      alert(`Error tidak terduga: ${error}`);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Fungsi logout untuk menghapus session user menggunakan Supabase Auth
   * Enhanced with comprehensive cleanup untuk prevent stuck sessions
   * #LogoutFunction #SessionClear #SupabaseAuth
   */
  const logout = async () => {
    try {
      console.log("🚪 Logging out...");

      // Step 1: Sign out from Supabase (this triggers onAuthStateChange)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("⚠️ Supabase signOut error (continuing cleanup):", error);
      }

      // Step 2: Clear all auth-related storage
      clearAuthStorage();

      // Step 3: Clear user state and permissions
      setUser(null);
      setSupabasePermissions(null);
      delFromLocalStorage();

      // Step 4: Clear activeView to reset to dashboard on next login
      localStorage.removeItem('activeView');

      // Step 5: Force clear any remaining Supabase client state
      // This helps prevent stale session issues
      try {
        await supabase.removeAllChannels();
      } catch (e) {
        console.warn("⚠️ Error removing channels:", e);
      }

      console.log("✅ Logout successful - all session data cleared");
    } catch (error) {
      console.error("❌ Unexpected logout error:", error);
      // IMPORTANT: Still clear everything even if signOut fails
      // This prevents stuck sessions
      clearAuthStorage();
      setUser(null);
      setSupabasePermissions(null);
      delFromLocalStorage();
      localStorage.removeItem('activeView');
      console.log("✅ Forced logout completed");
    }
  };

  /**
   * Fungsi untuk load permissions dari Supabase
   * #PermissionLoad #SupabaseIntegration
   *
   * @param roleCode - Code role user (super_admin, admin, etc)
   */
  const loadPermissionsFromSupabase = async (roleCode: UserRole) => {
    try {
      console.log("📡 Loading permissions from Supabase for role:", roleCode);
      const { data, error } = await fetchPermissionsByRoleCode(roleCode);

      if (error) {
        console.error("❌ Error loading permissions:", error);
        console.log("⚠️ Using hardcoded permissions as fallback");
        setSupabasePermissions(null);
        return;
      }

      if (data && data.length > 0) {
        console.log("✅ Loaded permissions from Supabase:", data.length, "modules");
        setSupabasePermissions(data);
      } else {
        console.log("⚠️ No permissions found in Supabase, using hardcoded");
        setSupabasePermissions(null);
      }
    } catch (error) {
      console.error("❌ Unexpected error loading permissions:", error);
      setSupabasePermissions(null);
    }
  };

  /**
   * Fungsi untuk cek permission user pada module tertentu
   * #PermissionCheck #AccessControl
   *
   * @param module - Nama module yang ingin dicek
   * @param action - Jenis aksi (view/create/edit/delete), default 'view'
   * @returns boolean - true jika user memiliki permission
   */
  const hasPermission = (
    module: string,
    action: "view" | "create" | "edit" | "delete" = "view"
  ): boolean => {
    if (!user) return false;

    // Try to use Supabase permissions first
    if (supabasePermissions && supabasePermissions.length > 0) {
      const permission = supabasePermissions.find(
        (p) => p.module_name === module
      );

      if (!permission) return false;

      // Check permission based on action type
      switch (action) {
        case "view":
          return permission.can_view;
        case "create":
          return permission.can_create;
        case "edit":
          return permission.can_edit;
        case "delete":
          return permission.can_delete;
        default:
          return false;
      }
    }

    // Fallback to hardcoded permissions
    const permissions = ROLE_PERMISSIONS[user.role];

    // Safety check: if role not found in ROLE_PERMISSIONS, deny access
    if (!permissions) {
      console.warn(`⚠️ Role "${user.role}" not found in ROLE_PERMISSIONS`);
      return false;
    }

    const modulePermission = permissions[module];

    if (!modulePermission) return false;

    // Check permission berdasarkan action type
    switch (action) {
      case "view":
        return modulePermission.canView;
      case "create":
        return modulePermission.canCreate;
      case "edit":
        return modulePermission.canEdit;
      case "delete":
        return modulePermission.canDelete;
      default:
        return false;
    }
  };

  /**
   * Fungsi untuk cek apakah user bisa mengakses menu tertentu
   * #MenuAccess #NavigationControl
   *
   * @param menuId - ID menu yang ingin dicek
   * @returns boolean - true jika user bisa mengakses menu
   */
  const canAccessMenu = (menuId: string): boolean => {
    if (!user) return false;

    // Convert menu ID ke module key
    const moduleKey = MENU_MODULE_MAP[menuId];
    if (!moduleKey) return false;

    // Cek view permission untuk module tersebut
    return hasPermission(moduleKey, "view");
  };

  // Provide auth context value ke seluruh child components
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        canAccessMenu,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * ==========================================================================
 * USE AUTH HOOK
 * ==========================================================================
 *
 * Custom hook untuk mengakses auth context dari komponen manapun.
 *
 * #CustomHook #AuthHook #ContextConsumer
 *
 * @returns AuthContextType - Object berisi user, methods, dan states
 * @throws Error jika digunakan di luar AuthProvider
 *
 * USAGE EXAMPLE:
 * ```tsx
 * const { user, login, logout, hasPermission } = useAuth();
 * ```
 * ==========================================================================
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Export mock data untuk digunakan oleh user management component
 * #ExportData #MockData
 */
export { MOCK_USERS, MOCK_PASSWORDS };
