/**
 * ==========================================================================
 * SIDEBAR COMPONENT - NAVIGATION SIDEBAR
 * ==========================================================================
 * 
 * Komponen sidebar navigasi utama aplikasi dengan fitur:
 * - Menu hierarki dengan collapsible sub-menu
 * - Responsif untuk mobile dan desktop
 * - Collapse/expand mode untuk desktop
 * - Permission-based menu visibility
 * - Tooltip untuk collapsed mode
 * 
 * #Sidebar #Navigation #ResponsiveMenu #CollapsibleMenu
 * #PermissionBased #MobileMenu #DesktopMenu
 * 
 * FITUR:
 * - Desktop: Collapsible sidebar dengan toggle button
 * - Mobile: Slide-in sidebar dengan overlay
 * - Nested menu: 2 menu utama (Payroll & HR) dengan sub-groups
 * - Status indicator: Sistem status di bagian bawah
 *
 * MENU STRUCTURE:
 * 1. Dashboard (single menu)
 * 2. PAYROLL (menu utama):
 *    - Master Data (Skala Upah, Premi & Tunjangan, Pajak & BPJS)
 *    - Penggajian (Proses Tahunan, Bulanan, Gaji Karyawan)
 *    - Laporan (Buku Gaji, Tax Worksheet)
 * 3. HR (menu utama):
 *    - Master Data (Data Karyawan, Mutasi, Divisi, Jabatan)
 *    - Presensi (Hari Kerja, Hari Libur, Data Presensi, Cuti)
 *    - Administrasi (Manajemen User, Otorisasi)
 * 4. Bottom Menu (Analitik, Engagement Dashboard, Pengaturan)
 * 
 * @author Sistem Payroll Team
 * @version 2.0.0
 * @since 2024-10-26
 * @updated 2025-01-11 - Restructured menu into 2 main groups (Payroll & HR)
 * ==========================================================================
 */

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { LayoutDashboard, Users, FileText, Settings as SettingsIcon, X, UserCog, Award, Layers, Briefcase, Receipt, ChevronDown, ChevronRight, Database, Calculator, Shield, ShieldCheck, Calendar, CalendarDays, ClipboardCheck, Umbrella, Gift, ArrowRightLeft, TrendingUp, BarChart3, DollarSign, ClipboardList, Heart, Pill, Stethoscope, Syringe, PackageSearch, FileBarChart } from 'lucide-react';
import { SigmaLogo } from './SigmaLogo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useAuth } from '../contexts/AuthContext';

/**
 * Props interface untuk Sidebar component
 * #SidebarProps #ComponentProps
 */
interface SidebarProps {
  activeView: string;
  onViewChange: (view: 'dashboard' | 'payroll-view' | 'tax-worksheet' | 'annual-payroll' | 'hrm' | 'employee-transfer' | 'division' | 'position' | 'wage-master' | 'premium' | 'tax-master' | 'working-days' | 'holidays' | 'attendance' | 'leave' | 'employees' | 'processing' | 'reports' | 'presensi-report' | 'engagement' | 'settings' | 'user-management' | 'role-management' | 'clinic-dashboard' | 'clinic-medicines' | 'clinic-suppliers' | 'clinic-doctors' | 'clinic-nurses' | 'clinic-diseases' | 'clinic-registration' | 'clinic-examination' | 'clinic-prescription' | 'clinic-dispensing' | 'clinic-stock' | 'clinic-receiving' | 'clinic-opname' | 'clinic-report-visits' | 'clinic-report-diseases' | 'clinic-report-medicines' | 'clinic-report-costs') => void;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
}

/**
 * ==========================================================================
 * SIDEBAR COMPONENT IMPLEMENTATION
 * ==========================================================================
 * 
 * Main sidebar component dengan state management untuk:
 * - Collapsible sub-menu states
 * - Permission-based menu filtering
 * - Active menu highlighting
 * 
 * #SidebarComponent #MenuManagement
 * ==========================================================================
 */
export function Sidebar({ activeView, onViewChange, isOpen, onClose, collapsed }: SidebarProps) {
  const { canAccessMenu } = useAuth();
  
  // State untuk menu utama (Payroll, HR, dan Clinic) - Collapsed by default
  const [payrollMainOpen, setPayrollMainOpen] = useState(false);
  const [hrMainOpen, setHrMainOpen] = useState(false);
  const [clinicMainOpen, setClinicMainOpen] = useState(false);

  // State untuk sub-menu dalam Payroll - Collapsed by default
  const [payrollMasterDataOpen, setPayrollMasterDataOpen] = useState(false);
  const [payrollProcessOpen, setPayrollProcessOpen] = useState(false);
  const [payrollReportsOpen, setPayrollReportsOpen] = useState(false);

  // State untuk sub-menu dalam HR - Collapsed by default
  const [hrMasterDataOpen, setHrMasterDataOpen] = useState(false);
  const [presenceOpen, setPresenceOpen] = useState(false);
  const [administrationOpen, setAdministrationOpen] = useState(false);

  // State untuk sub-menu dalam Clinic - Collapsed by default
  const [clinicMasterDataOpen, setClinicMasterDataOpen] = useState(false);
  const [clinicServiceOpen, setClinicServiceOpen] = useState(false);
  const [clinicInventoryOpen, setClinicInventoryOpen] = useState(false);
  const [clinicReportsOpen, setClinicReportsOpen] = useState(false);

  // Refs untuk scroll containers
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  
  // Store scroll position untuk desktop dan mobile
  const desktopScrollPosition = useRef(0);
  const mobileScrollPosition = useRef(0);

  // Track previous menu states untuk mendeteksi perubahan
  const prevMenuStates = useRef({
    payrollMainOpen,
    hrMainOpen,
    clinicMainOpen,
    payrollMasterDataOpen,
    payrollProcessOpen,
    payrollReportsOpen,
    hrMasterDataOpen,
    presenceOpen,
    administrationOpen,
    clinicMasterDataOpen,
    clinicServiceOpen,
    clinicInventoryOpen,
    clinicReportsOpen,
    collapsed
  });

  // Save scroll position sebelum state berubah dan restore setelahnya
  const handleDesktopScroll = () => {
    if (desktopScrollRef.current) {
      desktopScrollPosition.current = desktopScrollRef.current.scrollTop;
    }
  };

  const handleMobileScroll = () => {
    if (mobileScrollRef.current) {
      mobileScrollPosition.current = mobileScrollRef.current.scrollTop;
    }
  };

  // Restore scroll position hanya ketika menu collapsible state berubah
  // Menggunakan useLayoutEffect agar terjadi sebelum browser paint
  useLayoutEffect(() => {
    const menuStatesChanged =
      prevMenuStates.current.payrollMainOpen !== payrollMainOpen ||
      prevMenuStates.current.hrMainOpen !== hrMainOpen ||
      prevMenuStates.current.clinicMainOpen !== clinicMainOpen ||
      prevMenuStates.current.payrollMasterDataOpen !== payrollMasterDataOpen ||
      prevMenuStates.current.payrollProcessOpen !== payrollProcessOpen ||
      prevMenuStates.current.payrollReportsOpen !== payrollReportsOpen ||
      prevMenuStates.current.hrMasterDataOpen !== hrMasterDataOpen ||
      prevMenuStates.current.presenceOpen !== presenceOpen ||
      prevMenuStates.current.administrationOpen !== administrationOpen ||
      prevMenuStates.current.clinicMasterDataOpen !== clinicMasterDataOpen ||
      prevMenuStates.current.clinicServiceOpen !== clinicServiceOpen ||
      prevMenuStates.current.clinicInventoryOpen !== clinicInventoryOpen ||
      prevMenuStates.current.clinicReportsOpen !== clinicReportsOpen ||
      prevMenuStates.current.collapsed !== collapsed;

    if (menuStatesChanged && desktopScrollRef.current) {
      desktopScrollRef.current.scrollTop = desktopScrollPosition.current;
    }

    // Update previous states
    prevMenuStates.current = {
      payrollMainOpen,
      hrMainOpen,
      clinicMainOpen,
      payrollMasterDataOpen,
      payrollProcessOpen,
      payrollReportsOpen,
      hrMasterDataOpen,
      presenceOpen,
      administrationOpen,
      clinicMasterDataOpen,
      clinicServiceOpen,
      clinicInventoryOpen,
      clinicReportsOpen,
      collapsed
    };
  }, [payrollMainOpen, hrMainOpen, clinicMainOpen, payrollMasterDataOpen, payrollProcessOpen, payrollReportsOpen, hrMasterDataOpen, presenceOpen, administrationOpen, clinicMasterDataOpen, clinicServiceOpen, clinicInventoryOpen, clinicReportsOpen, collapsed]);

  useLayoutEffect(() => {
    if (mobileScrollRef.current && isOpen) {
      mobileScrollRef.current.scrollTop = mobileScrollPosition.current;
    }
  }, [isOpen]);

  // Preserve scroll position saat activeView berubah (menu item diklik)
  // Ini memastikan scroll position tidak reset ke 0 saat re-render
  useLayoutEffect(() => {
    // Simpan scroll position saat ini sebelum setiap render
    if (desktopScrollRef.current && desktopScrollRef.current.scrollTop > 0) {
      desktopScrollPosition.current = desktopScrollRef.current.scrollTop;
    }
    if (mobileScrollRef.current && mobileScrollRef.current.scrollTop > 0) {
      mobileScrollPosition.current = mobileScrollRef.current.scrollTop;
    }
  }); // No dependencies = run after every render

  // Restore scroll position after render jika berbeda
  useLayoutEffect(() => {
    if (desktopScrollRef.current && desktopScrollPosition.current > 0) {
      const currentScroll = desktopScrollRef.current.scrollTop;
      if (currentScroll === 0 && desktopScrollPosition.current > 0) {
        // Scroll position was reset, restore it
        desktopScrollRef.current.scrollTop = desktopScrollPosition.current;
      }
    }
  }, [activeView]); // Run when activeView changes

  /**
   * Menu configuration - Single menu items
   * #MenuConfig #SingleMenu
   */
  const singleMenuItems = [
    { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard, module: 'dashboard' },
  ];

  /**
   * ==========================================================================
   * PAYROLL MENU CONFIGURATION
   * ==========================================================================
   * #MenuConfig #PayrollMenu
   */

  // Master Data Payroll
  const payrollMasterDataItems = [
    { id: 'wage-master', label: 'Skala Upah', icon: TrendingUp, module: 'wage-master' },
    { id: 'premium', label: 'Premi & Tunjangan', icon: Award, module: 'premium' },
    { id: 'tax-master', label: 'Pajak & BPJS', icon: Receipt, module: 'tax-master' },
  ];

  // Proses Penggajian
  const payrollProcessItems = [
    { id: 'annual-payroll', label: 'Proses Gaji Tahunan', icon: Gift, module: 'annual-payroll' },
    { id: 'processing', label: 'Proses Gaji Bulanan', icon: DollarSign, module: 'processing' },
    { id: 'employees', label: 'Gaji Karyawan', icon: Users, module: 'employees' },
  ];

  // Laporan Payroll
  const payrollReportsItems = [
    { id: 'payroll-view', label: 'Buku Gaji', icon: Receipt, module: 'payroll-view' },
    { id: 'tax-worksheet', label: 'Tax Worksheet', icon: Calculator, module: 'tax-worksheet' },
    { id: 'presensi-report', label: 'Presensi', icon: ClipboardList, module: 'presensi-report' },
  ];

  /**
   * ==========================================================================
   * HR MENU CONFIGURATION
   * ==========================================================================
   * #MenuConfig #HRMenu
   */

  // Master Data HR
  const hrMasterDataItems = [
    { id: 'hrm', label: 'Data Karyawan', icon: UserCog, module: 'hrm' },
    { id: 'employee-transfer', label: 'Mutasi Karyawan', icon: ArrowRightLeft, module: 'employee-transfer' },
    { id: 'division', label: 'Divisi', icon: Layers, module: 'division' },
    { id: 'position', label: 'Jabatan', icon: Briefcase, module: 'position' },
  ];

  /**
   * Menu configuration - Presensi submenu
   * #MenuConfig #PresenceMenu
   */
  const presenceMenuItems = [
    { id: 'working-days', label: 'Hari Kerja', icon: Calendar, module: 'working-days' },
    { id: 'holidays', label: 'Hari Libur', icon: CalendarDays, module: 'holidays' },
    { id: 'attendance', label: 'Data Presensi', icon: ClipboardCheck, module: 'attendance' },
    { id: 'leave', label: 'Cuti Karyawan', icon: Umbrella, module: 'leave' },
  ];

  /**
   * Menu configuration - Administration submenu
   * #MenuConfig #AdministrationMenu
   */
  const administrationMenuItems = [
    { id: 'user-management', label: 'Manajemen User', icon: Users, module: 'user-management' },
    { id: 'role-management', label: 'Otorisasi', icon: Shield, module: 'role-management' },
  ];

  /**
   * ==========================================================================
   * CLINIC MENU CONFIGURATION
   * ==========================================================================
   * #MenuConfig #ClinicMenu
   */

  // Dashboard Clinic
  const clinicDashboardItems = [
    { id: 'clinic-dashboard', label: 'Dashboard Klinik', icon: BarChart3, module: 'clinic_dashboard' },
  ];

  // Master Data Clinic
  const clinicMasterDataItems = [
    { id: 'clinic-medicines', label: 'Data Obat', icon: Pill, module: 'clinic_master_medicines' },
    { id: 'clinic-suppliers', label: 'Data Supplier', icon: PackageSearch, module: 'clinic_master_suppliers' },
    { id: 'clinic-doctors', label: 'Data Dokter', icon: Stethoscope, module: 'clinic_master_doctors' },
    { id: 'clinic-nurses', label: 'Data Perawat', icon: Heart, module: 'clinic_master_nurses' },
    { id: 'clinic-diseases', label: 'Jenis Penyakit', icon: FileText, module: 'clinic_master_diseases' },
  ];

  // Pelayanan Clinic
  const clinicServiceItems = [
    { id: 'clinic-registration', label: 'Pendaftaran Pasien', icon: ClipboardList, module: 'clinic_registration' },
    { id: 'clinic-examination', label: 'Pemeriksaan Diagnosa', icon: Stethoscope, module: 'clinic_examination' },
    { id: 'clinic-prescription', label: 'Resep Obat', icon: FileText, module: 'clinic_prescription' },
    { id: 'clinic-dispensing', label: 'Penyerahan Obat', icon: Syringe, module: 'clinic_dispensing' },
  ];

  // Manajemen Stok Clinic
  const clinicInventoryItems = [
    { id: 'clinic-stock', label: 'Stok Obat', icon: Database, module: 'clinic_stock_management' },
    { id: 'clinic-receiving', label: 'Penerimaan Obat', icon: PackageSearch, module: 'clinic_stock_management' },
    { id: 'clinic-opname', label: 'Opname Stok', icon: ClipboardCheck, module: 'clinic_stock_management' },
  ];

  // Laporan Clinic
  const clinicReportsItems = [
    { id: 'clinic-report-visits', label: 'Laporan Kunjungan', icon: FileBarChart, module: 'clinic_reports' },
    { id: 'clinic-report-diseases', label: 'Penyakit Terbanyak', icon: BarChart3, module: 'clinic_reports' },
    { id: 'clinic-report-medicines', label: 'Pemakaian Obat', icon: TrendingUp, module: 'clinic_reports' },
    { id: 'clinic-report-costs', label: 'Biaya Operasional', icon: DollarSign, module: 'clinic_reports' },
  ];

  /**
   * Menu configuration - Bottom menu items
   * #MenuConfig #BottomMenu
   */
  const bottomMenuItems = [
    { id: 'reports', label: 'Analitik', icon: FileText, module: 'reports' },
    { id: 'engagement', label: 'Engagement Dasbor', icon: BarChart3, module: 'engagement' },
    { id: 'settings', label: 'Pengaturan', icon: SettingsIcon, module: 'settings' },
  ];

  /**
   * Filter menu items berdasarkan user permissions
   * Hanya menu yang bisa diakses user yang akan ditampilkan
   * #PermissionFilter #MenuVisibility
   */

  // Filter Payroll menu items
  const filteredPayrollMasterDataItems = payrollMasterDataItems.filter(item => canAccessMenu(item.module));
  const filteredPayrollProcessItems = payrollProcessItems.filter(item => canAccessMenu(item.module));
  const filteredPayrollReportsItems = payrollReportsItems.filter(item => canAccessMenu(item.module));

  // Filter HR menu items
  const filteredHrMasterDataItems = hrMasterDataItems.filter(item => canAccessMenu(item.module));
  const filteredPresenceMenuItems = presenceMenuItems.filter(item => canAccessMenu(item.module));
  const filteredAdministrationMenuItems = administrationMenuItems.filter(item => canAccessMenu(item.module));

  // Filter Clinic menu items
  const filteredClinicDashboardItems = clinicDashboardItems.filter(item => canAccessMenu(item.id));
  const filteredClinicMasterDataItems = clinicMasterDataItems.filter(item => canAccessMenu(item.id));
  const filteredClinicServiceItems = clinicServiceItems.filter(item => canAccessMenu(item.id));
  const filteredClinicInventoryItems = clinicInventoryItems.filter(item => canAccessMenu(item.id));
  const filteredClinicReportsItems = clinicReportsItems.filter(item => canAccessMenu(item.id));

  // Filter bottom menu items
  const filteredBottomMenuItems = bottomMenuItems.filter(item => canAccessMenu(item.module));

  /**
   * Render individual menu item dengan handling untuk collapsed state
   * #MenuItemRenderer #TooltipSupport
   * 
   * @param item - Menu item data (id, label, icon)
   * @param isSubMenu - Flag untuk submenu (untuk indentasi)
   * @returns JSX Element - Rendered menu item
   */
  const renderMenuItem = (item: any, isSubMenu = false) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    
    // Handler untuk klik menu dengan prevent scroll
    const handleMenuClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onViewChange(item.id as any);
    };

    // Menu button dengan conditional styling
    const button = (
      <button
        onClick={handleMenuClick}
        className={`w-full flex items-center ${collapsed ? 'justify-center px-4' : isSubMenu ? 'gap-3 pl-10 pr-4' : 'gap-3 px-4'} py-2.5 rounded transition-colors ${
          isActive
            ? 'bg-[#12263f] text-white'
            : 'text-[#9fa6bc] hover:bg-[#12263f] hover:text-white'
        }`}
      >
        <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
          <Icon size={18} />
        </div>
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </button>
    );

    // Jika collapsed, wrap dengan Tooltip
    if (collapsed) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#12263f] text-white border-[#1c3353]">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.id}>{button}</div>;
  };

  /**
   * Render nested collapsible menu (menu utama dengan sub-group di dalamnya)
   * #NestedMenu #MainMenuRenderer
   *
   * @param title - Judul menu utama
   * @param icon - Icon component untuk menu utama
   * @param isOpen - State apakah menu utama terbuka
   * @param setIsOpen - Function untuk toggle menu utama
   * @param subGroups - Array sub-groups dalam menu utama
   * @returns JSX Element - Rendered nested menu
   */
  const renderNestedMenu = (
    title: string,
    icon: any,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    subGroups: Array<{ title: string; icon: any; items: any[]; isOpen: boolean; setIsOpen: (open: boolean) => void }>
  ) => {
    const Icon = icon;

    // Mode collapsed: Tampil icon dengan tooltip yang menampilkan semua sub-groups
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-4 py-2.5 cursor-pointer flex justify-center">
                <div className="w-[18px] h-[18px] flex items-center justify-center">
                  <Icon size={18} className="text-[#9fa6bc]" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#12263f] text-white border-[#1c3353] p-2 max-w-xs">
              <div className="space-y-2 min-w-[180px]">
                <p className="font-semibold text-sm px-2 py-1 border-b border-[#1c3353]">{title}</p>
                {subGroups.map((group, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="text-xs font-medium px-2 py-1 text-[#9fa6bc]">{group.title}</p>
                    <div className="space-y-0.5">
                      {group.items.map(item => {
                        const ItemIcon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onViewChange(item.id as any);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                              isActive
                                ? 'bg-[#1c3353] text-white'
                                : 'text-[#9fa6bc] hover:bg-[#1c3353] hover:text-white'
                            }`}
                          >
                            <div className="w-[14px] h-[14px] flex items-center justify-center flex-shrink-0">
                              <ItemIcon size={14} />
                            </div>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Mode expanded: Collapsible menu utama dengan sub-groups
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 rounded transition-colors text-white bg-[#12263f] hover:bg-[#1c3353] font-medium">
          <div className="flex items-center gap-3">
            <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
              <Icon size={18} />
            </div>
            <span className="text-sm">{title}</span>
          </div>
          {isOpen ? (
            <ChevronDown size={16} className="flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="flex-shrink-0" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1 ml-2">
          {subGroups.map((group, idx) => (
            <div key={idx}>
              {renderCollapsibleMenu(group.title, group.icon, group.items, group.isOpen, group.setIsOpen)}
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  /**
   * Render Klinik menu dengan direct items + sub-groups
   */
  const renderClinicMenu = (
    title: string,
    icon: any,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    directItems: any[],
    subGroups: Array<{ title: string; icon: any; items: any[]; isOpen: boolean; setIsOpen: (open: boolean) => void }>
  ) => {
    const Icon = icon;

    // Mode collapsed: Tampil icon dengan tooltip
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-4 py-2.5 cursor-pointer flex justify-center">
                <div className="w-[18px] h-[18px] flex items-center justify-center">
                  <Icon size={18} className="text-[#9fa6bc]" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#12263f] text-white border-[#1c3353] p-2 max-w-xs">
              <div className="space-y-2 min-w-[180px]">
                <p className="font-semibold text-sm px-2 py-1 border-b border-[#1c3353]">{title}</p>

                {/* Direct items */}
                {directItems.length > 0 && (
                  <div className="space-y-0.5">
                    {directItems.map(item => {
                      const ItemIcon = item.icon;
                      const isActive = activeView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onViewChange(item.id as any);
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                            isActive
                              ? 'bg-[#1c3353] text-white'
                              : 'text-[#9fa6bc] hover:bg-[#1c3353] hover:text-white'
                          }`}
                        >
                          <div className="w-[14px] h-[14px] flex items-center justify-center flex-shrink-0">
                            <ItemIcon size={14} />
                          </div>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sub-groups */}
                {subGroups.map((group, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="text-xs font-medium px-2 py-1 text-[#9fa6bc]">{group.title}</p>
                    <div className="space-y-0.5">
                      {group.items.map(item => {
                        const ItemIcon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onViewChange(item.id as any);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                              isActive
                                ? 'bg-[#1c3353] text-white'
                                : 'text-[#9fa6bc] hover:bg-[#1c3353] hover:text-white'
                            }`}
                          >
                            <div className="w-[14px] h-[14px] flex items-center justify-center flex-shrink-0">
                              <ItemIcon size={14} />
                            </div>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Mode expanded: Collapsible menu dengan direct items + sub-groups
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 rounded transition-colors text-white bg-[#12263f] hover:bg-[#1c3353] font-medium">
          <div className="flex items-center gap-3">
            <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
              <Icon size={18} />
            </div>
            <span className="text-sm">{title}</span>
          </div>
          {isOpen ? (
            <ChevronDown size={16} className="flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="flex-shrink-0" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1 ml-2">
          {/* Direct items as menu items */}
          {directItems.map(item => renderMenuItem(item, true))}

          {/* Sub-groups as collapsible menus */}
          {subGroups.map((group, idx) => (
            <div key={idx}>
              {renderCollapsibleMenu(group.title, group.icon, group.items, group.isOpen, group.setIsOpen)}
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  /**
   * Render collapsible menu group (parent menu dengan submenu)
   * #CollapsibleMenu #SubMenuRenderer
   *
   * Handling dua mode:
   * 1. Collapsed: Tampil sebagai icon dengan tooltip list submenu
   * 2. Expanded: Tampil dengan collapsible trigger dan submenu items
   *
   * @param title - Judul menu group
   * @param icon - Icon component untuk menu group
   * @param items - Array submenu items
   * @param isOpen - State apakah submenu terbuka
   * @param setIsOpen - Function untuk toggle submenu
   * @returns JSX Element - Rendered collapsible menu
   */
  const renderCollapsibleMenu = (title: string, icon: any, items: any[], isOpen: boolean, setIsOpen: (open: boolean) => void) => {
    const Icon = icon;
    
    // Mode collapsed: Tampil icon dengan tooltip yang bisa diklik
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-4 py-2.5 cursor-pointer flex justify-center">
                <div className="w-[18px] h-[18px] flex items-center justify-center">
                  <Icon size={18} className="text-[#9fa6bc]" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#12263f] text-white border-[#1c3353] p-2">
              <div className="space-y-1 min-w-[160px]">
                <p className="font-semibold text-sm px-2 py-1">{title}</p>
                <div className="space-y-0.5">
                  {items.map(item => {
                    const ItemIcon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onViewChange(item.id as any);
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                          isActive
                            ? 'bg-[#1c3353] text-white'
                            : 'text-[#9fa6bc] hover:bg-[#1c3353] hover:text-white'
                        }`}
                      >
                        <div className="w-[14px] h-[14px] flex items-center justify-center flex-shrink-0">
                          <ItemIcon size={14} />
                        </div>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Mode expanded: Collapsible menu dengan submenu items
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 rounded transition-colors text-[#9fa6bc] hover:bg-[#12263f] hover:text-white group">
          <div className="flex items-center gap-3">
            <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
              <Icon size={18} />
            </div>
            <span className="text-sm">{title}</span>
          </div>
          {isOpen ? (
            <ChevronDown size={16} className="flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="flex-shrink-0" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {items.map(item => renderMenuItem(item, true))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  /**
   * ==========================================================================
   * DESKTOP SIDEBAR COMPONENT
   * ==========================================================================
   * 
   * Sidebar untuk tampilan desktop dengan fitur collapse/expand.
   * Hidden pada mobile (< lg breakpoint).
   * 
   * #DesktopSidebar #CollapsibleSidebar
   * 
   * FEATURES:
   * - Width transition (w-20 collapsed, w-64 expanded)
   * - Logo dan brand name
   * - Collapsible menu groups
   * - System status indicator
   * ==========================================================================
   */
  const DesktopSidebar = () => (
    <div className={`hidden lg:flex bg-[#0b1727] flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Header/Logo area */}
      <div className={`p-6 ${collapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {collapsed ? (
            <div className="w-12 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 px-1.5 py-1.5">
              <svg
                viewBox="0 0 48 36"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path 
                  fill="#09773A" 
                  d="M4,1c12.9,0,25.7,0,39,0c0,2.7,0,5.4,0,8.2c-0.7,0-1.4,0-2.1,0c-0.5-1.3-0.9-2.7-1.4-4.1c-8.7,0-17.3,0-26.2,0
                  c2.1,1.3,4.4,2.6,6.4,4.1c5.1,4.6,4.9,4.8,5.7,8.2c-0.1,2.8-0.7,4.3-2.7,6.2c-0.8,0.7-1.7,1.4-2.5,2.1c-0.6,0.5-0.6,0.5-1.3,1.1
                  c-3.1,2.6-3.1,2.6-4.8,3.4c8.2,0,16.4,0,24.8,0c0.7-1.3,1.4-2.7,2.1-4.1c0.7,0,1.4,0,2.1,0c0,2.9,0,5.8,0,8.8c-12.9,0-25.7,0-39,0
                  c3.5-6.6,11.7-11.2,17.7-15.6c-0.3-2-0.4-3.1-1.9-4.6c-0.5-0.3-0.9-0.7-1.4-1c-0.5-0.3-0.9-0.7-1.4-1.1c-0.4-0.3-0.7-0.5-1.1-0.8
                  c0.3,0.3,0.6,0.5,0.9,0.8c0.4,0.4,0.8,0.7,1.2,1.1c0.6,0.5,0.6,0.5,1.2,1.1c0.9,1.2,0.9,1.2,0.9,3.9c-5.4-0.7-9.8-4.2-13.1-8.2
                  C4.9,7.2,4,5.1,4,1"
                />
                <path 
                  fill="#197D43" 
                  d="M23.9,16.6c0.5,0.2,0.9,0.4,1.4,0.7c-0.1,2.1-0.2,3.6-1.7,5.1c-1.1,0.8-2.2,1.6-3.3,2.4
                  c-0.5-0.4-0.9-0.9-1.4-1.4c0.3-0.3,0.7-0.6,1-0.9c1.3-1.2,1.3-1.2,1.8-3.2c0.7,0,1.4,0,2.1,0C23.9,18.5,23.9,17.6,23.9,16.6z"
                />
              </svg>
            </div>
          ) : (
            <>
              <div className="w-14 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 px-2 py-1.5">
                <svg
                  viewBox="0 0 48 36"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path 
                    fill="#09773A" 
                    d="M4,1c12.9,0,25.7,0,39,0c0,2.7,0,5.4,0,8.2c-0.7,0-1.4,0-2.1,0c-0.5-1.3-0.9-2.7-1.4-4.1c-8.7,0-17.3,0-26.2,0
                    c2.1,1.3,4.4,2.6,6.4,4.1c5.1,4.6,4.9,4.8,5.7,8.2c-0.1,2.8-0.7,4.3-2.7,6.2c-0.8,0.7-1.7,1.4-2.5,2.1c-0.6,0.5-0.6,0.5-1.3,1.1
                    c-3.1,2.6-3.1,2.6-4.8,3.4c8.2,0,16.4,0,24.8,0c0.7-1.3,1.4-2.7,2.1-4.1c0.7,0,1.4,0,2.1,0c0,2.9,0,5.8,0,8.8c-12.9,0-25.7,0-39,0
                    c3.5-6.6,11.7-11.2,17.7-15.6c-0.3-2-0.4-3.1-1.9-4.6c-0.5-0.3-0.9-0.7-1.4-1c-0.5-0.3-0.9-0.7-1.4-1.1c-0.4-0.3-0.7-0.5-1.1-0.8
                    c0.3,0.3,0.6,0.5,0.9,0.8c0.4,0.4,0.8,0.7,1.2,1.1c0.6,0.5,0.6,0.5,1.2,1.1c0.9,1.2,0.9,1.2,0.9,3.9c-5.4-0.7-9.8-4.2-13.1-8.2
                    C4.9,7.2,4,5.1,4,1"
                  />
                  <path 
                    fill="#197D43" 
                    d="M23.9,16.6c0.5,0.2,0.9,0.4,1.4,0.7c-0.1,2.1-0.2,3.6-1.7,5.1c-1.1,0.8-2.2,1.6-3.3,2.4
                    c-0.5-0.4-0.9-0.9-1.4-1.4c0.3-0.3,0.7-0.6,1-0.9c1.3-1.2,1.3-1.2,1.8-3.2c0.7,0,1.4,0,2.1,0C23.9,18.5,23.9,17.6,23.9,16.6z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">Sigma Payroll</h2>
                <p className="text-[#9fa6bc] text-xs">Sistem Penggajian</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation menu area */}
      <nav
        ref={desktopScrollRef}
        onScroll={handleDesktopScroll}
        className="flex-1 px-4 overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <TooltipProvider delayDuration={0}>
          <ul className="space-y-1">
            {/* Single Menu Items - Dashboard */}
            {singleMenuItems.map(item => (
              <li key={item.id}>{renderMenuItem(item)}</li>
            ))}

            {/* PAYROLL - Menu Utama */}
            <li className="pt-2">
              {renderNestedMenu(
                'Payroll',
                DollarSign,
                payrollMainOpen,
                setPayrollMainOpen,
                [
                  {
                    title: 'Master Data',
                    icon: Database,
                    items: filteredPayrollMasterDataItems,
                    isOpen: payrollMasterDataOpen,
                    setIsOpen: setPayrollMasterDataOpen
                  },
                  {
                    title: 'Penggajian',
                    icon: Calculator,
                    items: filteredPayrollProcessItems,
                    isOpen: payrollProcessOpen,
                    setIsOpen: setPayrollProcessOpen
                  },
                  {
                    title: 'Laporan',
                    icon: FileText,
                    items: filteredPayrollReportsItems,
                    isOpen: payrollReportsOpen,
                    setIsOpen: setPayrollReportsOpen
                  }
                ]
              )}
            </li>

            {/* HR - Menu Utama */}
            <li className="pt-2">
              {renderNestedMenu(
                'HR',
                Users,
                hrMainOpen,
                setHrMainOpen,
                [
                  {
                    title: 'Master Data',
                    icon: Database,
                    items: filteredHrMasterDataItems,
                    isOpen: hrMasterDataOpen,
                    setIsOpen: setHrMasterDataOpen
                  },
                  {
                    title: 'Presensi',
                    icon: ClipboardCheck,
                    items: filteredPresenceMenuItems,
                    isOpen: presenceOpen,
                    setIsOpen: setPresenceOpen
                  },
                  {
                    title: 'Administrasi',
                    icon: ShieldCheck,
                    items: filteredAdministrationMenuItems,
                    isOpen: administrationOpen,
                    setIsOpen: setAdministrationOpen
                  }
                ]
              )}
            </li>

            {/* CLINIC - Menu Utama */}
            <li className="pt-2">
              {renderClinicMenu(
                'Klinik',
                Heart,
                clinicMainOpen,
                setClinicMainOpen,
                filteredClinicDashboardItems,
                [
                  {
                    title: 'Master Data',
                    icon: Database,
                    items: filteredClinicMasterDataItems,
                    isOpen: clinicMasterDataOpen,
                    setIsOpen: setClinicMasterDataOpen
                  },
                  {
                    title: 'Pelayanan',
                    icon: Stethoscope,
                    items: filteredClinicServiceItems,
                    isOpen: clinicServiceOpen,
                    setIsOpen: setClinicServiceOpen
                  },
                  {
                    title: 'Manajemen Stok',
                    icon: PackageSearch,
                    items: filteredClinicInventoryItems,
                    isOpen: clinicInventoryOpen,
                    setIsOpen: setClinicInventoryOpen
                  },
                  {
                    title: 'Laporan',
                    icon: FileBarChart,
                    items: filteredClinicReportsItems,
                    isOpen: clinicReportsOpen,
                    setIsOpen: setClinicReportsOpen
                  }
                ]
              )}
            </li>

            {/* Bottom Menu Items - Analitik, Engagement & Pengaturan */}
            {filteredBottomMenuItems.length > 0 && (
              <li className="pt-4 border-t border-[#1c3353] mt-4">
                <ul className="space-y-1">
                  {filteredBottomMenuItems.map(item => (
                    <li key={item.id}>{renderMenuItem(item)}</li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </TooltipProvider>
      </nav>

      {/* Footer - System Status Indicator */}
      <div className="p-4 border-t border-[#1c3353]">
        <div className={`px-4 py-3 bg-[#12263f] rounded ${collapsed ? 'px-2' : ''}`}>
          {collapsed ? (
            // Collapsed mode: hanya tampil indicator dot
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          ) : (
            // Expanded mode: tampil status lengkap
            <>
              <p className="text-xs text-[#9fa6bc] mb-2">Status Sistem</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-white">Semua Sistem Beroperasi</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * ==========================================================================
   * MOBILE SIDEBAR COMPONENT
   * ==========================================================================
   * 
   * Sidebar untuk tampilan mobile dengan fitur slide-in from left.
   * Visible hanya pada mobile (< lg breakpoint).
   * 
   * #MobileSidebar #SlideInMenu #ResponsiveDesign
   * 
   * FEATURES:
   * - Slide animation (translate-x)
   * - Close button
   * - Full menu (tanpa collapsed mode)
   * - Overlay backdrop (rendered di MainApp)
   * ==========================================================================
   */
  const MobileSidebar = () => (
    <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#0b1727] flex flex-col transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Header dengan logo dan close button */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-10 bg-white rounded-lg flex items-center justify-center px-2 py-1.5">
              <svg
                viewBox="0 0 48 36"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path 
                  fill="#09773A" 
                  d="M4,1c12.9,0,25.7,0,39,0c0,2.7,0,5.4,0,8.2c-0.7,0-1.4,0-2.1,0c-0.5-1.3-0.9-2.7-1.4-4.1c-8.7,0-17.3,0-26.2,0
                  c2.1,1.3,4.4,2.6,6.4,4.1c5.1,4.6,4.9,4.8,5.7,8.2c-0.1,2.8-0.7,4.3-2.7,6.2c-0.8,0.7-1.7,1.4-2.5,2.1c-0.6,0.5-0.6,0.5-1.3,1.1
                  c-3.1,2.6-3.1,2.6-4.8,3.4c8.2,0,16.4,0,24.8,0c0.7-1.3,1.4-2.7,2.1-4.1c0.7,0,1.4,0,2.1,0c0,2.9,0,5.8,0,8.8c-12.9,0-25.7,0-39,0
                  c3.5-6.6,11.7-11.2,17.7-15.6c-0.3-2-0.4-3.1-1.9-4.6c-0.5-0.3-0.9-0.7-1.4-1c-0.5-0.3-0.9-0.7-1.4-1.1c-0.4-0.3-0.7-0.5-1.1-0.8
                  c0.3,0.3,0.6,0.5,0.9,0.8c0.4,0.4,0.8,0.7,1.2,1.1c0.6,0.5,0.6,0.5,1.2,1.1c0.9,1.2,0.9,1.2,0.9,3.9c-5.4-0.7-9.8-4.2-13.1-8.2
                  C4.9,7.2,4,5.1,4,1"
                />
                <path 
                  fill="#197D43" 
                  d="M23.9,16.6c0.5,0.2,0.9,0.4,1.4,0.7c-0.1,2.1-0.2,3.6-1.7,5.1c-1.1,0.8-2.2,1.6-3.3,2.4
                  c-0.5-0.4-0.9-0.9-1.4-1.4c0.3-0.3,0.7-0.6,1-0.9c1.3-1.2,1.3-1.2,1.8-3.2c0.7,0,1.4,0,2.1,0C23.9,18.5,23.9,17.6,23.9,16.6z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Sigma Payroll</h2>
              <p className="text-[#9fa6bc] text-xs">Sistem Penggajian</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9fa6bc] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <nav
        ref={mobileScrollRef}
        onScroll={handleMobileScroll}
        className="flex-1 px-4 overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <ul className="space-y-1">
          {/* Single Menu Items - Dashboard */}
          {singleMenuItems.map(item => (
            <li key={item.id}>{renderMenuItem(item)}</li>
          ))}

          {/* PAYROLL - Menu Utama */}
          <li className="pt-2">
            {renderNestedMenu(
              'Payroll',
              DollarSign,
              payrollMainOpen,
              setPayrollMainOpen,
              [
                {
                  title: 'Master Data',
                  icon: Database,
                  items: filteredPayrollMasterDataItems,
                  isOpen: payrollMasterDataOpen,
                  setIsOpen: setPayrollMasterDataOpen
                },
                {
                  title: 'Penggajian',
                  icon: Calculator,
                  items: filteredPayrollProcessItems,
                  isOpen: payrollProcessOpen,
                  setIsOpen: setPayrollProcessOpen
                },
                {
                  title: 'Laporan',
                  icon: FileText,
                  items: filteredPayrollReportsItems,
                  isOpen: payrollReportsOpen,
                  setIsOpen: setPayrollReportsOpen
                }
              ]
            )}
          </li>

          {/* HR - Menu Utama */}
          <li className="pt-2">
            {renderNestedMenu(
              'HR',
              Users,
              hrMainOpen,
              setHrMainOpen,
              [
                {
                  title: 'Master Data',
                  icon: Database,
                  items: filteredHrMasterDataItems,
                  isOpen: hrMasterDataOpen,
                  setIsOpen: setHrMasterDataOpen
                },
                {
                  title: 'Presensi',
                  icon: ClipboardCheck,
                  items: filteredPresenceMenuItems,
                  isOpen: presenceOpen,
                  setIsOpen: setPresenceOpen
                },
                {
                  title: 'Administrasi',
                  icon: ShieldCheck,
                  items: filteredAdministrationMenuItems,
                  isOpen: administrationOpen,
                  setIsOpen: setAdministrationOpen
                }
              ]
            )}
          </li>

          {/* CLINIC - Menu Utama */}
          <li className="pt-2">
            {renderClinicMenu(
              'Klinik',
              Heart,
              clinicMainOpen,
              setClinicMainOpen,
              filteredClinicDashboardItems,
              [
                {
                  title: 'Master Data',
                  icon: Database,
                  items: filteredClinicMasterDataItems,
                  isOpen: clinicMasterDataOpen,
                  setIsOpen: setClinicMasterDataOpen
                },
                {
                  title: 'Pelayanan',
                  icon: Stethoscope,
                  items: filteredClinicServiceItems,
                  isOpen: clinicServiceOpen,
                  setIsOpen: setClinicServiceOpen
                },
                {
                  title: 'Manajemen Stok',
                  icon: PackageSearch,
                  items: filteredClinicInventoryItems,
                  isOpen: clinicInventoryOpen,
                  setIsOpen: setClinicInventoryOpen
                },
                {
                  title: 'Laporan',
                  icon: FileBarChart,
                  items: filteredClinicReportsItems,
                  isOpen: clinicReportsOpen,
                  setIsOpen: setClinicReportsOpen
                }
              ]
            )}
          </li>

          {/* Bottom Menu Items - Analitik, Engagement & Pengaturan */}
          {filteredBottomMenuItems.length > 0 && (
            <li className="pt-4 border-t border-[#1c3353] mt-4">
              <ul className="space-y-1">
                {filteredBottomMenuItems.map(item => (
                  <li key={item.id}>{renderMenuItem(item)}</li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#1c3353]">
        <div className="px-4 py-3 bg-[#12263f] rounded">
          <p className="text-xs text-[#9fa6bc] mb-2">Status Sistem</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-white">Semua Sistem Beroperasi</span>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Return both sidebar versions
   * CSS breakpoints akan handle visibility
   * #ResponsiveSidebar
   */
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
