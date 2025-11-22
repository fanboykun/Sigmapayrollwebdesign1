/**
 * ==========================================================================
 * NAVBAR COMPONENT - TOP NAVIGATION BAR
 * ==========================================================================
 * 
 * Top navigation bar dengan fitur:
 * - Sidebar toggle (mobile & desktop)
 * - Command Palette (Ctrl+K)
 * - Notifications dropdown
 * - Messages dropdown
 * - User menu (profile, settings, logout)
 * 
 * #Navbar #TopNavigation #UserMenu #Notifications
 * #CommandPalette #ResponsiveHeader
 * 
 * FITUR UTAMA:
 * - Mobile: Hamburger menu untuk buka sidebar
 * - Desktop: Toggle button untuk collapse/expand sidebar
 * - Command Palette: Quick search menu (Ctrl+K)
 * - Notification center: Bell icon dengan badge
 * - Messages: Mail icon dengan badge
 * - User menu: Avatar dengan dropdown (profile, settings, logout)
 * 
 * @author Sistem Payroll Team
 * @version 1.0.0
 * @since 2024-10-26
 * ==========================================================================
 */

import { Bell, Mail, Menu, PanelLeftClose, PanelLeft, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { CommandPalette } from './CommandPalette';

/**
 * Props interface untuk Navbar component
 * #NavbarProps #ComponentProps
 */
interface NavbarProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onNavigate: (view: string) => void;
}

/**
 * ==========================================================================
 * NAVBAR COMPONENT IMPLEMENTATION
 * ==========================================================================
 */
export function Navbar({ onMenuClick, onToggleSidebar, sidebarCollapsed, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const { colorTheme, mode } = useTheme();
  
  /**
   * Helper function untuk get avatar background color berdasarkan theme
   * #AvatarColor #ThemeHelper
   */
  const getAvatarBgColor = () => {
    if (mode === 'dark') {
      return '#1a1a1a'; // Dark background for dark mode
    }
    return colorTheme === 'blue' ? '#2c7be5' : '#0C6037'; // Blue or Green primary color
  };
  
  /**
   * Helper function untuk convert role ke label yang user-friendly
   * #RoleLabel #Helper
   */
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      karyawan: 'Karyawan'
    };
    return labels[role] || role;
  };

  /**
   * Helper function untuk generate initial dari nama user
   * #UserInitials #AvatarHelper
   */
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      {/* Left section - Menu toggle & Command Palette */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Mobile: Hamburger menu untuk buka sidebar */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>
        
        {/* Desktop: Toggle button untuk collapse/expand sidebar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden lg:flex" 
          onClick={onToggleSidebar}
        >
          {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </Button>
        
        {/* Command Palette - Search menu (Ctrl+K) */}
        <div className="relative flex-1">
          <CommandPalette onNavigate={onNavigate} />
        </div>
      </div>

      {/* Right section - Notifications, Messages, User menu */}
      <div className="flex items-center gap-2">
        {/* Notifications Dropdown - Bell icon dengan badge */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              {/* Red dot indicator untuk unread notifications */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Sample notifications - akan diganti dengan data real */}
            <DropdownMenuItem className="flex flex-col items-start py-3">
              <div className="flex items-start gap-3 w-full">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm mb-1">Penggajian berhasil diproses</p>
                  <p className="text-xs text-muted-foreground">2 jam yang lalu</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start py-3">
              <div className="flex items-start gap-3 w-full">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm mb-1">3 karyawan perlu persetujuan</p>
                  <p className="text-xs text-muted-foreground">5 jam yang lalu</p>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hidden sm:flex">
              <Mail size={18} />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive hover:bg-destructive">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Pesan</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-start gap-3 py-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: getAvatarBgColor() }}>
                BH
              </div>
              <div className="flex-1">
                <p className="text-sm mb-1">Budi Hartono mengirim pesan</p>
                <p className="text-xs text-muted-foreground">Tentang peninjauan gaji</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>

        {/* User Menu Dropdown - Avatar dengan nama & role */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 px-2 md:px-3">
              {/* Avatar dengan initial user */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: getAvatarBgColor() }}>
                {user ? getInitials(user.name) : 'U'}
              </div>
              {/* User info - hidden di mobile */}
              <div className="text-left hidden md:block">
                <p className="text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user ? getRoleLabel(user.role) : ''}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Menu item: Profile */}
            <DropdownMenuItem onClick={() => onNavigate('profile')}>
              <User className="w-4 h-4 mr-2" />
              Profil
            </DropdownMenuItem>
            {/* Menu item: Account Settings */}
            <DropdownMenuItem onClick={() => onNavigate('account-settings')}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Pengaturan Akun
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Menu item: Logout */}
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
