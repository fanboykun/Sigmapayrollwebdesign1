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

import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PayrollDashboard } from './components/PayrollDashboard';
import { PayrollView } from './components/PayrollView';
import { TaxWorksheet } from './components/TaxWorksheet';
import { AnnualPayroll } from './components/AnnualPayroll';
import { EmployeeManagement } from './components/EmployeeManagement';
import { DivisionMaster } from './components/DivisionMaster';
import { PositionMaster } from './components/PositionMaster';
import { WageMaster } from './components/WageMaster';
import { TaxMaster } from './components/TaxMaster';
import { EmployeePayroll } from './components/EmployeePayroll';
import { PayrollProcessing } from './components/PayrollProcessing';
import { PayrollReports } from './components/PayrollReports';
import { PremiumMaster } from './components/PremiumMaster';
import { WorkingDaysMaster } from './components/WorkingDaysMaster';
import { HolidayMaster } from './components/HolidayMaster';
import { AttendanceMaster } from './components/AttendanceMaster';
import { LeaveManagement } from './components/LeaveManagement';
import { EmployeeTransfer } from './components/EmployeeTransfer';
import EngagementDashboard from './components/EngagementDashboard';
import { Settings } from './components/Settings';
import { UserManagement } from './components/UserManagement';
import { RoleManagement } from './components/RoleManagement';
import { ProfilePage } from './components/ProfilePage';
import { AccountSettings } from './components/AccountSettings';
import { PermissionGuard } from './components/PermissionGuard';
import { DesignReference } from './components/DesignReference';
import DatabaseSeeder from './components/DatabaseSeeder';
import { Toaster } from './components/ui/sonner';

/**
 * Type definition untuk semua view/halaman yang tersedia dalam aplikasi
 * #TypeDefinition #ViewTypes
 */
type ViewType = 'dashboard' | 'payroll-view' | 'tax-worksheet' | 'annual-payroll' | 'hrm' | 'employee-transfer' | 'division' | 'position' | 'wage-master' | 'employees' | 'processing' | 'reports' | 'engagement' | 'premium' | 'tax-master' | 'working-days' | 'holidays' | 'attendance' | 'leave' | 'settings' | 'user-management' | 'role-management' | 'profile' | 'account-settings' | 'design-reference' | 'database-seeder';

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
  const { isAuthenticated, canAccessMenu } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /**
   * Handler untuk navigasi halaman
   * Bisa dipanggil dari sidebar, navbar, atau command palette
   * 
   * #NavigationHandler #PermissionCheck
   * 
   * @param view - ID view/halaman yang ingin dituju
   */
  const handleViewChange = (view: string) => {
    // Profile, account settings, dan design-reference selalu dapat diakses oleh semua user
    if (view === 'profile' || view === 'account-settings' || view === 'design-reference') {
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
          {activeView === 'dashboard' && (
            <PermissionGuard module="dashboard">
              <PayrollDashboard />
            </PermissionGuard>
          )}
          {activeView === 'payroll-view' && (
            <PermissionGuard module="payroll_view">
              <PayrollView />
            </PermissionGuard>
          )}
          {activeView === 'tax-worksheet' && (
            <PermissionGuard module="tax_worksheet">
              <TaxWorksheet />
            </PermissionGuard>
          )}
          {activeView === 'annual-payroll' && (
            <PermissionGuard module="annual_payroll">
              <AnnualPayroll />
            </PermissionGuard>
          )}
          {activeView === 'hrm' && (
            <PermissionGuard module="employee_management">
              <EmployeeManagement />
            </PermissionGuard>
          )}
          {activeView === 'employee-transfer' && (
            <PermissionGuard module="employee_transfer">
              <EmployeeTransfer />
            </PermissionGuard>
          )}
          {activeView === 'division' && (
            <PermissionGuard module="division_master">
              <DivisionMaster />
            </PermissionGuard>
          )}
          {activeView === 'position' && (
            <PermissionGuard module="position_master">
              <PositionMaster />
            </PermissionGuard>
          )}
          {activeView === 'wage-master' && (
            <PermissionGuard module="wage_master">
              <WageMaster />
            </PermissionGuard>
          )}

          {activeView === 'tax-master' && (
            <PermissionGuard module="tax_master">
              <TaxMaster />
            </PermissionGuard>
          )}
          {activeView === 'employees' && (
            <PermissionGuard module="employee_payroll">
              <EmployeePayroll />
            </PermissionGuard>
          )}
          {activeView === 'processing' && (
            <PermissionGuard module="payroll_processing">
              <PayrollProcessing />
            </PermissionGuard>
          )}
          {activeView === 'reports' && (
            <PermissionGuard module="payroll_reports">
              <PayrollReports />
            </PermissionGuard>
          )}
          {activeView === 'premium' && (
            <PermissionGuard module="premium_master">
              <PremiumMaster />
            </PermissionGuard>
          )}
          {activeView === 'working-days' && (
            <PermissionGuard module="working_days_master">
              <WorkingDaysMaster />
            </PermissionGuard>
          )}
          {activeView === 'holidays' && (
            <PermissionGuard module="holiday_master">
              <HolidayMaster />
            </PermissionGuard>
          )}
          {activeView === 'attendance' && (
            <PermissionGuard module="attendance_master">
              <AttendanceMaster />
            </PermissionGuard>
          )}
          {activeView === 'leave' && (
            <PermissionGuard module="leave_management">
              <LeaveManagement />
            </PermissionGuard>
          )}
          {activeView === 'engagement' && (
            <PermissionGuard module="engagement">
              <EngagementDashboard />
            </PermissionGuard>
          )}
          {activeView === 'settings' && (
            <PermissionGuard module="settings">
              <Settings onNavigate={handleViewChange} />
            </PermissionGuard>
          )}
          {activeView === 'user-management' && (
            <PermissionGuard module="user_management">
              <UserManagement />
            </PermissionGuard>
          )}
          {activeView === 'role-management' && (
            <PermissionGuard module="role_management">
              <RoleManagement />
            </PermissionGuard>
          )}
          {/* Profile dan Account Settings tidak perlu PermissionGuard */}
          {activeView === 'profile' && <ProfilePage />}
          {activeView === 'account-settings' && <AccountSettings />}
          {/* Design Reference - standalone page untuk dokumentasi dan template */}
          {activeView === 'design-reference' && (
            <DesignReference onBack={() => setActiveView('dashboard')} />
          )}
          {/* Database Seeder - standalone page untuk seeding data */}
          {activeView === 'database-seeder' && (
            <DatabaseSeeder onBack={() => setActiveView('dashboard')} />
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