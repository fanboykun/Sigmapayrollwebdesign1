/**
 * ==========================================================================
 * APP.TSX - MAIN APPLICATION COMPONENT
 * ==========================================================================
 *
 * Komponen utama aplikasi Sistem Payroll ERP untuk Perkebunan Kelapa Sawit
 * yang mengatur routing, layout, dan manajemen state global aplikasi.
 *
 * #PayrollSystem #MainApp #ERPSystem #PalmOilPlantation
 * #ReactApp #AuthenticationFlow #NavigationManagement
 *
 * FITUR UTAMA:
 * - Manajemen autentikasi dan routing
 * - Layout responsif dengan sidebar dan navbar
 * - Sistem navigasi multi-level
 * - Role-based access control (RBAC)
 * - Notifikasi toast global
 *
 * DEPENDENCIES:
 * - React (useState hook untuk state management)
 * - AuthContext (manajemen autentikasi dan otorisasi)
 * - Komponen UI (Sidebar, Navbar, dll)
 * - Sonner (toast notifications)
 *
 * @author Sistem Payroll Team
 * @version 1.0.0
 * @since 2024-10-26
 * ==========================================================================
 */

import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { PayrollDashboard } from "./components/PayrollDashboard";
import { PayrollView } from "./components/PayrollView";
import { TaxWorksheet } from "./components/TaxWorksheet";
import { AnnualPayroll } from "./components/AnnualPayroll";
import { EmployeeManagement } from "./components/EmployeeManagement";
import { DivisionMaster } from "./components/DivisionMaster";
import { PositionMaster } from "./components/PositionMaster";
import { WageMaster } from "./components/WageMaster";
import { TaxMaster } from "./components/TaxMaster";
import { PotonganMaster } from "./components/PotonganMaster";
import { EmployeePayroll } from "./components/EmployeePayroll";
import { PayrollProcessing } from "./components/PayrollProcessing";
import { PayrollReports } from "./components/PayrollReports";
import { PresensiReport } from "./components/PresensiReport";
import { BpjsReport } from "./components/BpjsReport";
import { PremiumMaster } from "./components/PremiumMaster";
import { WorkingDaysMaster } from "./components/WorkingDaysMaster";
import { AttendanceMaster } from "./components/AttendanceMaster";
import { LeaveManagement } from "./components/LeaveManagement";
import { EmployeeTransfer } from "./components/EmployeeTransfer";
import EngagementDashboard from "./components/EngagementDashboard";
import { Settings } from "./components/Settings";
import { UserManagement } from "./components/UserManagement";
import { RoleManagement } from "./components/RoleManagement";
import { ProfilePage } from "./components/ProfilePage";
import { AccountSettings } from "./components/AccountSettings";
import { PermissionGuard } from "./components/PermissionGuard";
import { DesignReference } from "./components/DesignReference";
import DatabaseSeeder from "./components/DatabaseSeeder";
import { Toaster } from "./components/ui/sonner";
// Clinic Module Components
import { ClinicDashboard } from "./components/ClinicDashboard";
import { ClinicMedicines } from "./components/ClinicMedicines";
import { ClinicSuppliers } from "./components/ClinicSuppliers";
import { ClinicDiseases } from "./components/ClinicDiseases";
// Clinic Module Components
import { ClinicRegistration, MedicalExamination } from "./components/clinic";
import { ClinicDoctors } from "./components/ClinicDoctors";
import { ClinicNurses } from "./components/ClinicNurses";
import { ClinicPrescription } from "./components/ClinicPrescription";
import { ClinicDispensing } from "./components/ClinicDispensing";
import { ClinicReceiving } from "./components/ClinicReceiving";
import { ClinicStock } from "./components/ClinicStock";
import { ClinicOpname } from "./components/ClinicOpname";
import {
  ClinicReportVisits,
  ClinicReportDiseases,
  ClinicReportMedicines,
  ClinicReportCosts,
} from "./components/ClinicPlaceholder";
// Premi Kebun Module Components
import PremiMaster from "./components/PremiMaster";
import PremiPenggajian from "./components/PremiPenggajian";
import PremiLaporan from "./components/PremiLaporan";
import PremiDeresMaster from "./components/PremiDeresMaster";
import PremiDeresPenggajian from "./components/PremiDeresPenggajian";
import PremiDeresLaporan from "./components/PremiDeresLaporan";
// Welcome Pages
import { WelcomePage } from "./components/WelcomePage";

/**
 * Type definition untuk semua view/halaman yang tersedia dalam aplikasi
 * #TypeDefinition #ViewTypes
 */
type ViewType =
  | "welcome"
  | "dashboard"
  | "payroll-view"
  | "tax-worksheet"
  | "annual-payroll"
  | "hrm"
  | "employee-transfer"
  | "division"
  | "position"
  | "wage-master"
  | "employees"
  | "processing"
  | "reports"
  | "presensi-report"
  | "bpjs-report"
  | "engagement"
  | "premium"
  | "tax-master"
  | "potongan"
  | "working-days"
  | "attendance"
  | "leave"
  | "settings"
  | "user-management"
  | "role-management"
  | "profile"
  | "account-settings"
  | "design-reference"
  | "database-seeder"
  | "clinic-dashboard"
  | "clinic-medicines"
  | "clinic-suppliers"
  | "clinic-doctors"
  | "clinic-nurses"
  | "clinic-diseases"
  | "clinic-registration"
  | "clinic-examination"
  | "clinic-prescription"
  | "clinic-dispensing"
  | "clinic-stock"
  | "clinic-receiving"
  | "clinic-opname"
  | "clinic-report-visits"
  | "clinic-report-diseases"
  | "clinic-report-medicines"
  | "clinic-report-costs"
  | "premi-master"
  | "premi-penggajian"
  | "premi-laporan"
  | "premi-deres-master"
  | "premi-deres-penggajian"
  | "premi-deres-laporan";

/**
 * ==========================================================================
 * MAIN APP COMPONENT
 * ==========================================================================
 *
 * Komponen utama yang mengatur layout dan navigasi aplikasi setelah login.
 * Menangani state management untuk sidebar, view routing, dan permission checks.
 *
 * #MainLayout #NavigationHandler #StateManagement
 *
 * STATE:
 * - activeView: View/halaman yang sedang aktif
 * - sidebarOpen: Status sidebar mobile (buka/tutup)
 * - sidebarCollapsed: Status sidebar desktop (expand/collapse)
 *
 * FUNCTIONS:
 * - handleViewChange: Handler untuk navigasi antar halaman dengan permission check
 * ==========================================================================
 */
function MainApp() {
  const { isAuthenticated, canAccessMenu, user } = useAuth();

  /**
   * Get default view based on user role and saved state
   * Prioritizes saved view from localStorage to preserve state on refresh
   * #RoleBasedDefault #InitialState #PersistentState
   */
  const getDefaultView = (): ViewType => {
    // First, try to get saved view from localStorage
    const savedView = localStorage.getItem('activeView') as ViewType | null;
    if (savedView) {
      return savedView;
    }

    // Check user role for initial view (only when no saved view)
    if (user?.role === "admin_klinik" || user?.role === "dokter_klinik" || user?.role === "perawat") {
      return "clinic-dashboard";
    }
    // Non-clinic roles start at welcome page
    return "welcome";
  };

  /**
   * Initialize activeView from localStorage or default based on role
   * #PersistentState #LocalStorage
   */
  const [activeView, setActiveView] = useState<ViewType>(getDefaultView);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /**
   * Set default view based on user role when user logs in
   * Only reset view if there's no saved view (fresh login, not refresh)
   * #LoginDefaultView #RoleBasedRouting
   */
  useEffect(() => {
    if (user) {
      // Check if there's a saved view in localStorage
      const savedView = localStorage.getItem('activeView');

      // Only reset to default view if no saved view exists (fresh login)
      if (!savedView) {
        // Clinic roles go to clinic-dashboard
        if (user.role === "admin_klinik" || user.role === "dokter_klinik" || user.role === "perawat") {
          setActiveView("clinic-dashboard");
        } else {
          // Non-clinic roles (super_admin, admin, manager, karyawan) start at welcome page
          setActiveView("welcome");
        }
      }
    }
  }, [user?.id]); // Only run when user changes (login/logout)

  /**
   * Save activeView to localStorage whenever it changes
   * #PersistentState #LocalStorage
   */
  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  /**
   * Handler untuk navigasi halaman
   * Bisa dipanggil dari sidebar, navbar, atau command palette
   *
   * #NavigationHandler #PermissionCheck
   *
   * @param view - ID view/halaman yang ingin dituju
   */
  const handleViewChange = (view: string) => {
    // Profile, account settings, welcome, dan design-reference selalu dapat diakses oleh semua user
    if (
      view === "profile" ||
      view === "account-settings" ||
      view === "welcome" ||
      view === "design-reference"
    ) {
      setActiveView(view);
      setSidebarOpen(false);
      return;
    }

    // Cek permission untuk view lainnya
    if (canAccessMenu(view)) {
      setActiveView(view as ViewType);
      setSidebarOpen(false);
    }
  };
  useEffect(() => console.log({ isAuthenticated }), [isAuthenticated]);

  // Redirect ke login page jika belum terautentikasi
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 
        Mobile overlay - backdrop untuk sidebar mobile
        #MobileUI #Overlay 
      */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 
        Sidebar navigasi - responsif untuk mobile dan desktop
        #SidebarNavigation #ResponsiveDesign 
      */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 
          Top navbar dengan search, notifikasi, dan user menu
          #TopNavbar #UserMenu 
        */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          onNavigate={handleViewChange}
        />

        {/* 
          Content area - render komponen sesuai activeView
          Semua komponen dibungkus dengan PermissionGuard untuk RBAC
          #ContentArea #PermissionGuard #RBAC 
        */}
        <div className="flex-1 overflow-auto">
          {/* Welcome Page - Only for non-clinic users */}
          {activeView === "welcome" && <WelcomePage />}

          {activeView === "dashboard" && (
            <PermissionGuard module="dashboard">
              <PayrollDashboard />
            </PermissionGuard>
          )}
          {activeView === "payroll-view" && (
            <PermissionGuard module="payroll_view">
              <PayrollView />
            </PermissionGuard>
          )}
          {activeView === "tax-worksheet" && (
            <PermissionGuard module="tax_worksheet">
              <TaxWorksheet />
            </PermissionGuard>
          )}
          {activeView === "annual-payroll" && (
            <PermissionGuard module="annual_payroll">
              <AnnualPayroll />
            </PermissionGuard>
          )}
          {activeView === "hrm" && (
            <PermissionGuard module="employee_management">
              <EmployeeManagement />
            </PermissionGuard>
          )}
          {activeView === "employee-transfer" && (
            <PermissionGuard module="employee_transfer">
              <EmployeeTransfer />
            </PermissionGuard>
          )}
          {activeView === "division" && (
            <PermissionGuard module="division_master">
              <DivisionMaster />
            </PermissionGuard>
          )}
          {activeView === "position" && (
            <PermissionGuard module="position_master">
              <PositionMaster />
            </PermissionGuard>
          )}
          {activeView === "wage-master" && (
            <PermissionGuard module="wage_master">
              <WageMaster />
            </PermissionGuard>
          )}

          {activeView === "tax-master" && (
            <PermissionGuard module="tax_master">
              <TaxMaster />
            </PermissionGuard>
          )}

          {activeView === "potongan" && (
            <PermissionGuard module="potongan_master">
              <PotonganMaster />
            </PermissionGuard>
          )}

          {activeView === "employees" && (
            <PermissionGuard module="employee_payroll">
              <EmployeePayroll />
            </PermissionGuard>
          )}
          {activeView === "processing" && (
            <PermissionGuard module="payroll_processing">
              <PayrollProcessing />
            </PermissionGuard>
          )}
          {activeView === "reports" && (
            <PermissionGuard module="payroll_reports">
              <PayrollReports />
            </PermissionGuard>
          )}
          {activeView === "presensi-report" && (
            <PermissionGuard module="presensi_report">
              <PresensiReport />
            </PermissionGuard>
          )}
          {activeView === "bpjs-report" && (
            <PermissionGuard module="bpjs_report">
              <BpjsReport />
            </PermissionGuard>
          )}
          {activeView === "premium" && (
            <PermissionGuard module="premium_master">
              <PremiumMaster />
            </PermissionGuard>
          )}
          {activeView === "working-days" && (
            <PermissionGuard module="working_days_master">
              <WorkingDaysMaster />
            </PermissionGuard>
          )}
          {activeView === "attendance" && (
            <PermissionGuard module="attendance_master">
              <AttendanceMaster />
            </PermissionGuard>
          )}
          {activeView === "leave" && (
            <PermissionGuard module="leave_management">
              <LeaveManagement />
            </PermissionGuard>
          )}
          {activeView === "engagement" && (
            <PermissionGuard module="engagement">
              <EngagementDashboard />
            </PermissionGuard>
          )}
          {activeView === "settings" && (
            <PermissionGuard module="settings">
              <Settings onNavigate={handleViewChange} />
            </PermissionGuard>
          )}
          {activeView === "user-management" && (
            <PermissionGuard module="user_management">
              <UserManagement />
            </PermissionGuard>
          )}
          {activeView === "role-management" && (
            <PermissionGuard module="role_management">
              <RoleManagement />
            </PermissionGuard>
          )}

          {/* ===== CLINIC MODULE ===== */}
          {activeView === "clinic-dashboard" && (
            <PermissionGuard module="clinic_dashboard">
              <ClinicDashboard />
            </PermissionGuard>
          )}
          {/* Master Data Clinic */}
          {activeView === "clinic-medicines" && (
            <PermissionGuard module="clinic_master_medicines">
              <ClinicMedicines />
            </PermissionGuard>
          )}
          {activeView === "clinic-suppliers" && (
            <PermissionGuard module="clinic_master_suppliers">
              <ClinicSuppliers />
            </PermissionGuard>
          )}
          {activeView === "clinic-doctors" && (
            <PermissionGuard module="clinic_master_doctors">
              <ClinicDoctors />
            </PermissionGuard>
          )}
          {activeView === "clinic-nurses" && (
            <PermissionGuard module="clinic_master_nurses">
              <ClinicNurses />
            </PermissionGuard>
          )}
          {activeView === "clinic-diseases" && (
            <PermissionGuard module="clinic_master_diseases">
              <ClinicDiseases />
            </PermissionGuard>
          )}
          {/* Pelayanan Clinic */}
          {activeView === "clinic-registration" && (
            <PermissionGuard module="clinic_registration">
              <ClinicRegistration />
            </PermissionGuard>
          )}
          {activeView === "clinic-examination" && (
            <PermissionGuard module="clinic_examination">
              <MedicalExamination />
            </PermissionGuard>
          )}
          {activeView === "clinic-prescription" && (
            <PermissionGuard module="clinic_prescription">
              <ClinicPrescription />
            </PermissionGuard>
          )}
          {activeView === "clinic-dispensing" && (
            <PermissionGuard module="clinic_dispensing">
              <ClinicDispensing />
            </PermissionGuard>
          )}
          {/* Manajemen Stok Clinic */}
          {activeView === "clinic-stock" && (
            <PermissionGuard module="clinic_stock_management">
              <ClinicStock />
            </PermissionGuard>
          )}
          {activeView === "clinic-receiving" && (
            <PermissionGuard module="clinic_stock_management">
              <ClinicReceiving />
            </PermissionGuard>
          )}
          {activeView === "clinic-opname" && (
            <PermissionGuard module="clinic_stock_management">
              <ClinicOpname />
            </PermissionGuard>
          )}
          {/* Laporan Clinic */}
          {activeView === "clinic-report-visits" && (
            <PermissionGuard module="clinic_reports">
              <ClinicReportVisits />
            </PermissionGuard>
          )}
          {activeView === "clinic-report-diseases" && (
            <PermissionGuard module="clinic_reports">
              <ClinicReportDiseases />
            </PermissionGuard>
          )}
          {activeView === "clinic-report-medicines" && (
            <PermissionGuard module="clinic_reports">
              <ClinicReportMedicines />
            </PermissionGuard>
          )}
          {activeView === "clinic-report-costs" && (
            <PermissionGuard module="clinic_reports">
              <ClinicReportCosts />
            </PermissionGuard>
          )}

          {/* Premi Kebun Module Views */}
          {activeView === "premi-master" && (
            <PermissionGuard module="premi_master">
              <PremiMaster />
            </PermissionGuard>
          )}
          {activeView === "premi-penggajian" && (
            <PermissionGuard module="premi_penggajian">
              <PremiPenggajian />
            </PermissionGuard>
          )}
          {activeView === "premi-laporan" && (
            <PermissionGuard module="premi_laporan">
              <PremiLaporan />
            </PermissionGuard>
          )}

          {/* Premi Deres Module Views */}
          {activeView === "premi-deres-master" && (
            <PermissionGuard module="premi_deres_master">
              <PremiDeresMaster />
            </PermissionGuard>
          )}
          {activeView === "premi-deres-penggajian" && (
            <PermissionGuard module="premi_deres_penggajian">
              <PremiDeresPenggajian />
            </PermissionGuard>
          )}
          {activeView === "premi-deres-laporan" && (
            <PermissionGuard module="premi_deres_laporan">
              <PremiDeresLaporan />
            </PermissionGuard>
          )}

          {/* Profile dan Account Settings tidak perlu PermissionGuard */}
          {activeView === "profile" && <ProfilePage />}
          {activeView === "account-settings" && <AccountSettings />}
          {/* Design Reference - standalone page untuk dokumentasi dan template */}
          {activeView === "design-reference" && (
            <DesignReference onBack={() => setActiveView("dashboard")} />
          )}
          {/* Database Seeder - standalone page untuk seeding data */}
          {activeView === "database-seeder" && (
            <DatabaseSeeder onBack={() => setActiveView("dashboard")} />
          )}
        </div>
      </div>

      {/* 
        Toast notifications global untuk feedback user
        #ToastNotifications #UserFeedback 
      */}
      <Toaster />
    </div>
  );
}

/**
 * ==========================================================================
 * ROOT APP COMPONENT
 * ==========================================================================
 *
 * Root component yang membungkus seluruh aplikasi dengan AuthProvider
 * untuk menyediakan context autentikasi ke seluruh komponen.
 *
 * #RootComponent #AuthProvider #ContextProvider
 *
 * @returns Main application wrapped dengan AuthProvider
 * ==========================================================================
 */
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
