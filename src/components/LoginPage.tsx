/**
 * ==========================================================================
 * LOGIN PAGE COMPONENT
 * ==========================================================================
 * 
 * Halaman login aplikasi dengan fitur:
 * - Form login (email & password)
 * - Show/hide password
 * - Loading state
 * - Error handling
 * - Demo account quick login
 * - Responsive design (2 column layout di desktop)
 * 
 * #LoginPage #Authentication #LoginForm
 * #DemoAccounts #ResponsiveLayout #SecurityUI
 * 
 * FITUR UTAMA:
 * - Email & password validation
 * - Show/hide password toggle
 * - Demo account buttons untuk testing
 * - Error alerts
 * - Loading states
 * - Branding section (desktop only)
 * 
 * DEMO ACCOUNTS:
 * - Super Admin: superadmin@sawit.com / Super123!
 * - Admin: admin@sawit.com / admin123
 * - Manager: manager@sawit.com / manager123
 * - Karyawan: budi@sawit.com / karyawan123
 * 
 * @author Sistem Payroll Team
 * @version 1.0.0
 * @since 2024-10-26
 * ==========================================================================
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { SigmaLogoHorizontal } from './SigmaLogo';

/**
 * ==========================================================================
 * LOGIN PAGE COMPONENT IMPLEMENTATION
 * ==========================================================================
 */
export function LoginPage() {
  const { login } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handler untuk submit login form
   * #LoginHandler #FormSubmit
   * 
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Call login function dari AuthContext
    const success = await login(email, password);
    
    // Show error jika login gagal
    if (!success) {
      setError('Email atau password salah. Silakan coba lagi.');
    }
    
    setIsLoading(false);
  };

  /**
   * Demo accounts configuration untuk quick login
   * #DemoAccounts #QuickLogin
   */
  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@sawit.com', password: 'Super123!' },
    { role: 'Admin', email: 'admin@sawit.com', password: 'Admin123!' },
    { role: 'Manager', email: 'manager@sawit.com', password: 'Manager123!' },
    { role: 'Karyawan', email: 'budi@sawit.com', password: 'Karyawan123!' }
  ];

  /**
   * Quick login function - auto-fill email & password
   * #QuickLogin #DemoHelper
   * 
   * @param email - Email akun demo
   * @param password - Password akun demo
   */
  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 px-8">
          <div className="space-y-4">
            <SigmaLogoHorizontal 
              showSubtitle={true} 
              subtitle="Sistem Payroll ERP - Perkebunan Kelapa Sawit"
            />
            
            <div className="space-y-3 pt-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary">✓</span>
                </div>
                <div>
                  <h3 className="text-foreground">Manajemen Payroll Terintegrasi</h3>
                  <p className="text-muted-foreground">Kelola penggajian karyawan dengan mudah dan akurat</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary">✓</span>
                </div>
                <div>
                  <h3 className="text-foreground">Perhitungan Pajak Otomatis</h3>
                  <p className="text-muted-foreground">Sistem perhitungan PPh 21 dan BPJS terintegrasi</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary">✓</span>
                </div>
                <div>
                  <h3 className="text-foreground">Laporan Komprehensif</h3>
                  <p className="text-muted-foreground">Dashboard dan laporan real-time untuk analisis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full">
          <Card className="border-border shadow-lg">
            <CardHeader className="space-y-3">
              {/* Logo untuk mobile */}
              <div className="lg:hidden flex justify-center pb-2">
                <SigmaLogoHorizontal 
                  showSubtitle={true} 
                  subtitle="Sistem Payroll ERP"
                />
              </div>
              <CardTitle className="text-foreground">Selamat Datang Kembali</CardTitle>
              <CardDescription>
                Masukkan email dan password Anda untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@perusahaan.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-muted-foreground">
                    Akun Demo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin(account.email, account.password)}
                    disabled={isLoading}
                  >
                    {account.role}
                  </Button>
                ))}
              </div>

              <div className="text-center text-muted-foreground">
                <p>Gunakan akun demo di atas untuk mencoba sistem</p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile branding */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sistem Payroll ERP - Perkebunan Kelapa Sawit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
