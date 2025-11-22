/**
 * ==========================================================================
 * COMMAND PALETTE COMPONENT - QUICK SEARCH MENU
 * ==========================================================================
 *
 * Command palette untuk quick search dan navigasi menu menggunakan keyboard.
 * Model: Search-First (hanya tampilkan hasil ketika user mengetik)
 *
 * #CommandPalette #QuickSearch #KeyboardNavigation
 * #SearchMenu #CommandK #ProductivityTool
 *
 * FITUR UTAMA:
 * - Keyboard shortcut: Ctrl+K atau Cmd+K
 * - Search-first: Hanya tampilkan hasil ketika user ketik minimal 2 karakter
 * - Fuzzy search berdasarkan nama menu & keywords
 * - Permission-based menu filtering
 * - Compact result display
 *
 * SHORTCUTS:
 * - Ctrl/Cmd + K: Buka/tutup command palette
 * - ESC: Tutup command palette
 * - Arrow Up/Down: Navigate menu items
 * - Enter: Select menu item
 *
 * @author Sistem Payroll Team
 * @version 3.0.0 - Search-First Model
 * @since 2024-11-13
 * ==========================================================================
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import {
  LayoutDashboard,
  Receipt,
  Calculator,
  DollarSign,
  Users,
  UserCog,
  Layers,
  Briefcase,
  Award,
  FileText,
  Settings,
  Shield,
  User,
  Search,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  Gift,
  Umbrella,
  TrendingUp,
  ArrowRightLeft,
  BarChart3,
  Wallet,
  Sprout,
  Droplets,
  Heart,
  Pill,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';

/**
 * Props interface untuk CommandPalette
 * #CommandPaletteProps #ComponentProps
 */
interface CommandPaletteProps {
  onNavigate: (view: string) => void;
}

/**
 * Menu item interface
 */
interface MenuItem {
  id: string;
  label: string;
  group: string;
  icon: any;
  keywords: string;
}

/**
 * ==========================================================================
 * COMMAND PALETTE COMPONENT IMPLEMENTATION
 * ==========================================================================
 */
export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const { canAccessMenu } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  /**
   * Effect untuk register keyboard shortcut (Ctrl+K / Cmd+K)
   * #KeyboardShortcut #EventListener
   */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Check untuk Ctrl+K (Windows/Linux) atau Cmd+K (Mac)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    // Register event listener
    document.addEventListener('keydown', down);
    // Cleanup on unmount
    return () => document.removeEventListener('keydown', down);
  }, []);

  /**
   * Reset search dan selected index ketika dialog dibuka/ditutup
   */
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  /**
   * Flat list of all menu items dengan permission check
   * #MenuConfig #FlatStructure
   */
  const allMenuItems: MenuItem[] = [
    // Navigasi Utama
    { id: 'dashboard', label: 'Dasbor', group: 'Navigasi', icon: LayoutDashboard, keywords: 'dashboard home beranda statistik' },

    // Penggajian
    { id: 'annual-payroll', label: 'Penggajian Tahunan', group: 'Penggajian', icon: Gift, keywords: 'penggajian tahunan thr bonus annual' },
    { id: 'processing', label: 'Proses Penggajian', group: 'Penggajian', icon: DollarSign, keywords: 'proses penggajian payroll processing hitung gaji' },
    { id: 'employees', label: 'Gaji Karyawan', group: 'Penggajian', icon: Users, keywords: 'gaji karyawan employee payroll salary' },
    { id: 'premi-penggajian', label: 'Premi Sawit', group: 'Penggajian', icon: Sprout, keywords: 'premi sawit penggajian tbs produksi kebun' },
    { id: 'premi-deres-penggajian', label: 'Premi Deres', group: 'Penggajian', icon: Droplets, keywords: 'premi deres penggajian lateks karet' },

    // Laporan
    { id: 'payroll-view', label: 'Buku Gaji', group: 'Laporan', icon: Receipt, keywords: 'buku gaji payroll slip salary laporan' },
    { id: 'tax-worksheet', label: 'Tax Worksheet', group: 'Laporan', icon: Calculator, keywords: 'tax pajak worksheet perhitungan pph 21' },
    { id: 'premi-laporan', label: 'Laporan Premi Sawit', group: 'Laporan', icon: Sprout, keywords: 'laporan premi sawit report tbs' },
    { id: 'premi-deres-laporan', label: 'Laporan Premi Deres', group: 'Laporan', icon: Droplets, keywords: 'laporan premi deres report lateks' },
    { id: 'bpjs-report', label: 'Laporan BPJS', group: 'Laporan', icon: FileText, keywords: 'laporan bpjs kesehatan ketenagakerjaan report' },

    // Master Data
    { id: 'hrm', label: 'Data Karyawan', group: 'Master Data', icon: UserCog, keywords: 'karyawan employee data hrm pegawai' },
    { id: 'employee-transfer', label: 'Mutasi Karyawan', group: 'Master Data', icon: ArrowRightLeft, keywords: 'mutasi transfer karyawan employee perpindahan' },
    { id: 'division', label: 'Divisi', group: 'Master Data', icon: Layers, keywords: 'divisi division departemen unit kerja' },
    { id: 'position', label: 'Jabatan', group: 'Master Data', icon: Briefcase, keywords: 'jabatan position title posisi' },
    { id: 'wage-master', label: 'Skala Upah', group: 'Master Data', icon: TrendingUp, keywords: 'skala upah wage salary gaji pokok' },
    { id: 'premium', label: 'Premi & Tunjangan', group: 'Master Data', icon: Award, keywords: 'premi tunjangan premium allowance natura catu beras' },
    { id: 'tax-master', label: 'Pajak & BPJS', group: 'Master Data', icon: Receipt, keywords: 'pajak bpjs tax ptkp kesehatan ketenagakerjaan' },
    { id: 'potongan', label: 'Potongan', group: 'Master Data', icon: Wallet, keywords: 'potongan deduction pinjaman koperasi' },
    { id: 'premi-master', label: 'Premi Sawit', group: 'Master Data', icon: Sprout, keywords: 'premi sawit master data kebun tbs' },
    { id: 'premi-deres-master', label: 'Premi Deres', group: 'Master Data', icon: Droplets, keywords: 'premi deres master data lateks karet' },

    // Presensi
    { id: 'working-days', label: 'Hari Kerja', group: 'Presensi', icon: Calendar, keywords: 'hari kerja working days kalender' },
    { id: 'holidays', label: 'Hari Libur', group: 'Presensi', icon: CalendarDays, keywords: 'hari libur holidays cuti bersama tanggal merah' },
    { id: 'attendance', label: 'Data Presensi', group: 'Presensi', icon: ClipboardCheck, keywords: 'presensi attendance kehadiran absensi' },
    { id: 'leave', label: 'Cuti Karyawan', group: 'Presensi', icon: Umbrella, keywords: 'cuti leave karyawan annual sick sakit tahunan' },

    // Clinic
    { id: 'clinic-registration', label: 'Antrian Pasien', group: 'Clinic', icon: ClipboardList, keywords: 'antrian pasien clinic queue pemeriksaan registrasi' },
    { id: 'clinic-examination', label: 'Pemeriksaan Diagnosa', group: 'Clinic', icon: Stethoscope, keywords: 'pemeriksaan diagnosa icd-10 medical examination' },
    { id: 'clinic-prescription', label: 'Pembuatan Resep', group: 'Clinic', icon: Pill, keywords: 'resep obat prescription medicine pharmacy' },
    { id: 'clinic-stock', label: 'Stock Obat', group: 'Clinic', icon: Heart, keywords: 'stock obat medicine inventory farmasi' },
    { id: 'clinic-dispensing', label: 'Pemberian Obat', group: 'Clinic', icon: Pill, keywords: 'pemberian obat medicine distribution apotek' },
    { id: 'clinic-opname', label: 'Stock Opname', group: 'Clinic', icon: ClipboardCheck, keywords: 'stock opname inventory count farmasi' },

    // Administrasi
    { id: 'user-management', label: 'Manajemen User', group: 'Administrasi', icon: Users, keywords: 'user manajemen pengguna akses' },
    { id: 'role-management', label: 'Role & Permission', group: 'Administrasi', icon: Shield, keywords: 'role permission hak akses otorisasi' },

    // Lainnya
    { id: 'reports', label: 'Analitik', group: 'Lainnya', icon: FileText, keywords: 'analitik analytics laporan report statistik' },
    { id: 'engagement', label: 'Engagement Dashboard', group: 'Lainnya', icon: BarChart3, keywords: 'engagement dashboard kemitraan petani plasma' },
    { id: 'settings', label: 'Pengaturan', group: 'Lainnya', icon: Settings, keywords: 'pengaturan settings konfigurasi sistem' },
    { id: 'profile', label: 'Profil Saya', group: 'Lainnya', icon: User, keywords: 'profil profile akun account saya' },
    { id: 'account-settings', label: 'Pengaturan Akun', group: 'Lainnya', icon: Settings, keywords: 'pengaturan akun account settings password' },
  ];

  /**
   * Menu populer (sering diakses)
   * Ditampilkan ketika search kosong
   */
  const popularMenuIds = [
    'dashboard',
    'employees',
    'processing',
    'payroll-view',
    'hrm',
    'attendance',
    'premi-master',
    'premi-deres-master',
  ];

  const popularItems = allMenuItems.filter(item => {
    const hasAccess = item.id === 'profile' || item.id === 'account-settings' || canAccessMenu(item.id);
    return hasAccess && popularMenuIds.includes(item.id);
  });

  /**
   * Filter menu berdasarkan search dan permission
   */
  const filteredItems = search.length >= 1
    ? allMenuItems.filter(item => {
        // Check permission (profile & account-settings selalu accessible)
        const hasAccess = item.id === 'profile' || item.id === 'account-settings' || canAccessMenu(item.id);
        if (!hasAccess) return false;

        // Search matching
        const searchLower = search.toLowerCase();
        const matchLabel = item.label.toLowerCase().includes(searchLower);
        const matchKeywords = item.keywords.toLowerCase().includes(searchLower);
        const matchGroup = item.group.toLowerCase().includes(searchLower);

        return matchLabel || matchKeywords || matchGroup;
      })
    : popularItems;

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter' && filteredItems.length > 0) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex].id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredItems, selectedIndex]);

  /**
   * Reset selected index ketika filtered items berubah
   */
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (id: string) => {
    onNavigate(id);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-background border border-border rounded-md hover:bg-accent transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Cari menu...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Search Menu</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="border-b px-4 py-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
            {search.length === 0 ? (
              <div className="py-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Menu Sering Diakses
                  </p>
                </div>
                {popularItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full text-left px-4 py-2.5 transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'hover:bg-accent border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.group}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 px-4 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium mb-1">Tidak ada hasil ditemukan</p>
                <p className="text-xs text-muted-foreground">
                  Coba gunakan kata kunci lain
                </p>
              </div>
            ) : (
              <div className="py-2">
                {filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full text-left px-4 py-2.5 transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'hover:bg-accent border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.group}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hint */}
          {filteredItems.length > 0 && (
            <div className="border-t border-border px-4 py-2 bg-muted flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono text-foreground">↑↓</kbd>
                    <span>navigasi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono text-foreground">Enter</kbd>
                    <span>pilih</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono text-foreground">Esc</kbd>
                    <span>tutup</span>
                  </div>
                </div>
                <span className="text-muted-foreground">{filteredItems.length} hasil</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
