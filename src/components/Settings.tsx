import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle2, XCircle, Code2, Palette, Database, FileText, Users, Shield, BarChart3, Home, Bug, Sun, Moon, Monitor } from 'lucide-react';
import { AuthDebugger } from './AuthDebugger';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  onNavigate?: (view: string) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { colorTheme, mode, setColorTheme, setMode } = useTheme();
  
  // Helper function untuk get theme description berdasarkan current theme
  const getThemeDescription = (theme: 'green' | 'blue') => {
    if (theme === 'green') {
      return colorTheme === 'green' ? 'Tema hijau daun (Aktif)' : 'Tema hijau daun';
    }
    return colorTheme === 'blue' ? 'Tema biru klasik (Aktif)' : 'Tema biru klasik';
  };

  const menuShortcuts = [
    { 
      group: 'Navigasi Utama', 
      items: [
        { id: 'dashboard', label: 'Dasbor', icon: Home, description: 'Dashboard dan statistik sistem' }
      ]
    },
    { 
      group: 'Penggajian', 
      items: [
        { id: 'annual-payroll', label: 'Penggajian Tahunan', icon: FileText, description: 'THR dan bonus tahunan' },
        { id: 'processing', label: 'Proses Penggajian', icon: FileText, description: 'Proses hitung gaji bulanan' },
        { id: 'employees', label: 'Gaji Karyawan', icon: Users, description: 'Data gaji per karyawan' }
      ]
    },
    { 
      group: 'Laporan', 
      items: [
        { id: 'payroll-view', label: 'Buku Gaji', icon: FileText, description: 'Slip gaji dan rincian pembayaran' },
        { id: 'tax-worksheet', label: 'Tax Worksheet', icon: FileText, description: 'Perhitungan pajak PPh 21' }
      ]
    },
    { 
      group: 'Master Data', 
      items: [
        { id: 'hrm', label: 'Data Karyawan', icon: Users, description: 'Database karyawan' },
        { id: 'employee-transfer', label: 'Mutasi Karyawan', icon: Users, description: 'Riwayat mutasi karyawan' },
        { id: 'division', label: 'Divisi', icon: FileText, description: 'Master divisi/departemen' },
        { id: 'position', label: 'Jabatan', icon: FileText, description: 'Master jabatan' },
        { id: 'wage-master', label: 'Skala Upah', icon: FileText, description: 'Skala gaji pokok' },
        { id: 'premium', label: 'Premi & Tunjangan', icon: FileText, description: 'Tunjangan dan natura' },
        { id: 'tax-master', label: 'Pajak & BPJS', icon: FileText, description: 'PTKP, tarif pajak, BPJS' }
      ]
    },
    { 
      group: 'Presensi', 
      items: [
        { id: 'working-days', label: 'Hari Kerja', icon: FileText, description: 'Kalender hari kerja' },
        { id: 'holidays', label: 'Hari Libur', icon: FileText, description: 'Hari libur nasional' },
        { id: 'attendance', label: 'Data Presensi', icon: FileText, description: 'Absensi karyawan' },
        { id: 'leave', label: 'Cuti Karyawan', icon: FileText, description: 'Manajemen cuti' }
      ]
    },
    { 
      group: 'Administrasi', 
      items: [
        { id: 'user-management', label: 'Manajemen User', icon: Users, description: 'Kelola user sistem' },
        { id: 'role-management', label: 'Role & Permission', icon: Shield, description: 'Hak akses role' }
      ]
    },
    { 
      group: 'Lainnya', 
      items: [
        { id: 'reports', label: 'Analitik', icon: BarChart3, description: 'Laporan dan analitik' },
        { id: 'engagement', label: 'Engagement Dashboard', icon: BarChart3, description: 'Dashboard kemitraan' }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi pengaturan dan preferensi penggajian</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="payroll">Aturan Penggajian</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="quick-access">Akses Cepat</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-sm">
            <div className="p-6 border-b border-border">
              <h3>Pengaturan Umum</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="company">Nama Perusahaan</Label>
                  <Input id="company" defaultValue="PT Socfindo" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Mata Uang Default</Label>
                  <Select defaultValue="idr">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idr">IDR - Rupiah Indonesia</SelectItem>
                      <SelectItem value="usd">USD - Dolar Amerika</SelectItem>
                      <SelectItem value="sgd">SGD - Dolar Singapura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payroll-cycle">Siklus Penggajian</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger id="payroll-cycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="biweekly">Dua Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-day">Hari Pembayaran Default</Label>
                  <Select defaultValue="15">
                    <SelectTrigger id="payment-day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tanggal 1 setiap bulan</SelectItem>
                      <SelectItem value="15">Tanggal 15 setiap bulan</SelectItem>
                      <SelectItem value="30">Hari terakhir setiap bulan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-6">
                  <Button>Simpan Perubahan</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="shadow-sm">
            <div className="p-6 border-b border-border">
              <h3>Pengaturan Tampilan</h3>
              <p className="text-sm text-muted-foreground mt-1">Sesuaikan tampilan aplikasi sesuai preferensi Anda</p>
            </div>
            <div className="p-6">
              <div className="space-y-8 max-w-2xl">
                {/* Color Theme Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Tema Warna</Label>
                    <p className="text-sm text-muted-foreground mt-1">Pilih skema warna untuk aplikasi</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        console.log('🟢 Green theme button clicked');
                        setColorTheme('green');
                      }}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        colorTheme === 'green'
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#0C6037]"></div>
                        <span className="font-medium">Hijau (Green)</span>
                        {colorTheme === 'green' && <span className="text-xs text-primary">✓ Aktif</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{getThemeDescription('green')}</p>
                      <div className="flex gap-3 mt-3">
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: '#0F4C2A' }} title="Sidebar"></div>
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: '#0C6037' }} title="Primary"></div>
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: '#9fa6bc' }} title="Text"></div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔵 Blue theme button clicked');
                        setColorTheme('blue');
                      }}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        colorTheme === 'blue'
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#2c7be5]"></div>
                        <span className="font-medium">Biru (Blue)</span>
                        {colorTheme === 'blue' && <span className="text-xs text-primary">✓ Aktif</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{getThemeDescription('blue')}</p>
                      <div className="flex gap-3 mt-3">
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: '#0b1727' }} title="Sidebar"></div>
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: '#2c7be5' }} title="Primary"></div>
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: '#9fa6bc' }} title="Text"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-base">Mode Tampilan</Label>
                    <p className="text-sm text-muted-foreground mt-1">Pilih mode terang atau gelap</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setMode('light')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        mode === 'light'
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Sun size={20} className="text-amber-500" />
                        <span className="font-medium">Terang</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Mode terang untuk siang hari</p>
                    </button>
                    <button
                      onClick={() => setMode('dark')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        mode === 'dark'
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Moon size={20} className="text-indigo-500" />
                        <span className="font-medium">Gelap</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Mode gelap untuk malam hari</p>
                    </button>
                    <button
                      onClick={() => setMode('system')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        mode === 'system'
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Monitor size={20} className="text-gray-500" />
                        <span className="font-medium">Sistem</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Ikuti pengaturan sistem</p>
                    </button>
                  </div>
                </div>

                <div className="pt-4 text-sm text-muted-foreground">
                  <p>Pengaturan tampilan akan disimpan secara otomatis dan diingat saat Anda kembali.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card className="shadow-sm">
            <div className="p-6 border-b border-border">
              <h3>Aturan Penggajian</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Perhitungan Pajak Otomatis</p>
                      <p className="text-sm text-muted-foreground">Hitung pajak secara otomatis berdasarkan detail karyawan</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Sertakan Lembur</p>
                      <p className="text-sm text-muted-foreground">Faktor jam lembur dalam perhitungan penggajian</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Bonus Kinerja</p>
                      <p className="text-sm text-muted-foreground">Izinkan penambahan bonus berbasis kinerja</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Integrasi Kehadiran</p>
                      <p className="text-sm text-muted-foreground">Hubungkan penggajian dengan pelacakan kehadiran</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Potongan Presensi Otomatis</p>
                      <p className="text-sm text-muted-foreground">Potong gaji otomatis berdasarkan ketidakhadiran</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tarif Pajak Default (%)</Label>
                    <Input id="tax-rate" type="number" defaultValue="15" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overtime-multiplier">Pengali Lembur</Label>
                    <Input id="overtime-multiplier" type="number" step="0.1" defaultValue="1.5" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="natura-calculation">Metode Perhitungan Natura</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger id="natura-calculation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Otomatis (berdasarkan master)</SelectItem>
                        <SelectItem value="manual">Manual per karyawan</SelectItem>
                        <SelectItem value="fixed">Fixed amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-6">
                  <Button>Simpan Aturan</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-sm">
            <div className="p-6 border-b border-border">
              <h3>Pengaturan Notifikasi</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Penyelesaian Penggajian</p>
                      <p className="text-sm text-muted-foreground">Beri tahu saat pemrosesan penggajian selesai</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Konfirmasi Pembayaran Karyawan</p>
                      <p className="text-sm text-muted-foreground">Kirim konfirmasi pembayaran ke karyawan</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Pembuatan Slip Gaji</p>
                      <p className="text-sm text-muted-foreground">Buat dan kirim slip gaji secara otomatis</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Pengingat Penggajian Mendatang</p>
                      <p className="text-sm text-muted-foreground">Ingatkan sebelum tanggal penggajian yang dijadwalkan</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Peringatan Error</p>
                      <p className="text-sm text-muted-foreground">Beri tahu tentang error pemrosesan penggajian</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Notifikasi Mutasi Karyawan</p>
                      <p className="text-sm text-muted-foreground">Pemberitahuan saat ada mutasi karyawan</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded">
                    <div>
                      <p className="mb-1">Persetujuan Cuti</p>
                      <p className="text-sm text-muted-foreground">Notifikasi untuk approval cuti karyawan</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-email">Email Notifikasi</Label>
                    <Input id="notification-email" type="email" defaultValue="hr@socfindo.co.id" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-days">Hari Pengingat Sebelumnya</Label>
                    <Select defaultValue="3">
                      <SelectTrigger id="reminder-days">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hari</SelectItem>
                        <SelectItem value="3">3 hari</SelectItem>
                        <SelectItem value="7">7 hari</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-6">
                  <Button>Simpan Preferensi</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quick-access">
          <Card className="shadow-sm">
            <div className="p-6 border-b border-border">
              <h3>Akses Cepat Menu</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Daftar lengkap menu sistem yang tersedia berdasarkan permission Anda
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {menuShortcuts.map((group) => (
                  <div key={group.group}>
                    <h4 className="text-sm text-muted-foreground mb-3">{group.group}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => onNavigate?.(item.id)}
                            className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors text-left"
                          >
                            <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="mb-1">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="developer">
          <Card className="shadow-sm">
            <div className="p-6 border-b border-border">
              <h3>Developer Tools</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Akses ke dokumentasi dan referensi desain untuk pengembangan
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-w-2xl">
                <div className="p-5 border border-border rounded hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette size={18} className="text-primary" />
                        <p>Design Reference</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Template dan contoh implementasi komponen UI untuk referensi desain
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                        <li>• Template tabel dengan dark mode</li>
                        <li>• Code syntax highlighting</li>
                        <li>• Layout sidebar dengan navigasi hierarkis</li>
                        <li>• Top navbar dengan user menu</li>
                      </ul>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => onNavigate?.('design-reference')}
                      >
                        <Code2 size={16} />
                        Buka Design Reference
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-border rounded hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={18} className="text-primary" />
                        <p>Database Seeder</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tool untuk migrasi dan seeding data ke Supabase
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                        <li>• Migrasi struktur database</li>
                        <li>• Seed data master (divisi, jabatan, dll)</li>
                        <li>• Seed data karyawan</li>
                        <li>• Reset dan re-seed data</li>
                      </ul>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => onNavigate?.('database-seeder')}
                      >
                        <Database size={16} />
                        Buka Database Seeder
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-border rounded bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-1">
                      <Code2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1">API Documentation</p>
                      <p className="text-sm text-muted-foreground">
                        Coming soon - Dokumentasi API endpoint dan integrasi sistem
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-border rounded bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-1">
                      <Code2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1">Component Library</p>
                      <p className="text-sm text-muted-foreground">
                        Coming soon - Library komponen UI yang dapat digunakan kembali
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting">
          <div className="space-y-4">
            <Card className="shadow-sm bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <Bug className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="text-amber-900 dark:text-amber-100 mb-1">Authentication Troubleshooting</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Gunakan tool di bawah ini jika Anda mengalami masalah login, terutama di browser Chrome
                      (harus clear cookies setiap refresh).
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <AuthDebugger />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
