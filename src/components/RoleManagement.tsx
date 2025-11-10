import { useState, useEffect } from 'react';
import { UserRole } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Shield, ShieldCheck, ShieldAlert, User, Check, X, Loader2, AlertCircle } from 'lucide-react';
import {
  fetchRolesWithPermissions,
  updatePermission,
  type Role,
  type RolePermission,
} from '../services/rolePermissionService';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ModulePermission {
  module: string;
  moduleName: string;
  category: string;
  description: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface RolePermissions {
  role: UserRole;
  roleName: string;
  roleDescription: string;
  icon: typeof Shield;
  color: string;
  permissions: ModulePermission[];
}

export function RoleManagement() {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Mapping role code to UI properties
   */
  const roleUIConfig: Record<string, { icon: typeof Shield; color: string; description: string }> = {
    super_admin: {
      icon: ShieldCheck,
      color: 'text-red-600',
      description: 'Akses penuh ke seluruh sistem termasuk manajemen user dan role',
    },
    admin: {
      icon: Shield,
      color: 'text-blue-600',
      description: 'Akses penuh ke operasional payroll dan master data, tanpa manajemen user',
    },
    manager: {
      icon: ShieldAlert,
      color: 'text-orange-600',
      description: 'Akses view untuk monitoring dan laporan, tanpa kemampuan edit',
    },
    karyawan: {
      icon: User,
      color: 'text-gray-600',
      description: 'Akses terbatas hanya untuk melihat slip gaji sendiri',
    },
  };

  /**
   * Mapping module names to display properties
   */
  const moduleDisplayConfig: Record<string, { name: string; category: string; description: string }> = {
    // Dashboard
    dashboard: { name: 'Dashboard', category: 'Umum', description: 'Lihat dashboard dan statistik' },

    // Penggajian
    annual_payroll: { name: 'Penggajian Tahunan', category: 'Penggajian', description: 'Kelola penggajian tahunan' },
    payroll_processing: { name: 'Proses Penggajian', category: 'Penggajian', description: 'Proses perhitungan payroll' },
    employee_payroll: { name: 'Gaji Karyawan', category: 'Penggajian', description: 'Kelola payroll per karyawan' },

    // Laporan
    payroll_view: { name: 'Buku Gaji', category: 'Laporan', description: 'Lihat dan kelola slip gaji' },
    tax_worksheet: { name: 'Tax Worksheet', category: 'Laporan', description: 'Perhitungan dan worksheet pajak' },
    payroll_reports: { name: 'Analitik', category: 'Lainnya', description: 'Lihat dan export laporan' },
    presensi_report: { name: 'Laporan Presensi', category: 'Laporan', description: 'Laporan data presensi' },
    bpjs_report: { name: 'Laporan BPJS', category: 'Laporan', description: 'Laporan BPJS Kesehatan dan Ketenagakerjaan' },

    // Master Data
    employee_management: { name: 'Data Karyawan', category: 'Master Data', description: 'Kelola data karyawan' },
    employee_transfer: { name: 'Mutasi Karyawan', category: 'Master Data', description: 'Kelola mutasi karyawan' },
    division_master: { name: 'Divisi', category: 'Master Data', description: 'Kelola data divisi' },
    position_master: { name: 'Jabatan', category: 'Master Data', description: 'Kelola data jabatan' },
    wage_master: { name: 'Skala Upah', category: 'Master Data', description: 'Kelola skala upah' },
    natura_master: { name: 'Natura', category: 'Master Data', description: 'Kelola data natura' },
    premium_master: { name: 'Premi & Tunjangan', category: 'Master Data', description: 'Kelola data premi' },
    tax_master: { name: 'Pajak & BPJS', category: 'Master Data', description: 'Kelola PTKP, tarif pajak, BPJS' },
    potongan_master: { name: 'Potongan', category: 'Master Data', description: 'Kelola jenis potongan gaji' },

    // Presensi
    working_days_master: { name: 'Hari Kerja', category: 'Presensi', description: 'Kelola hari kerja' },
    holiday_master: { name: 'Hari Libur', category: 'Presensi', description: 'Kelola hari libur' },
    attendance_master: { name: 'Data Presensi', category: 'Presensi', description: 'Kelola data presensi' },
    leave_management: { name: 'Cuti Karyawan', category: 'Presensi', description: 'Kelola cuti karyawan' },

    // Administrasi
    user_management: { name: 'Manajemen User', category: 'Administrasi', description: 'Kelola user sistem' },
    role_management: { name: 'Role & Permission', category: 'Administrasi', description: 'Kelola role dan permission' },

    // Lainnya
    engagement: { name: 'Engagement Dashboard', category: 'Lainnya', description: 'Lihat engagement karyawan' },
    settings: { name: 'Pengaturan', category: 'Lainnya', description: 'Konfigurasi sistem' },
    recruitment: { name: 'Rekrutmen', category: 'HR', description: 'Kelola rekrutmen karyawan' },
    termination: { name: 'Terminasi', category: 'HR', description: 'Kelola terminasi karyawan' },

    // Clinic Module - Dashboard
    clinic_dashboard: { name: 'Dashboard Klinik', category: 'Klinik', description: 'Lihat statistik dan aktivitas klinik' },

    // Clinic Module - Master Data
    clinic_master_medicines: { name: 'Master Data Obat', category: 'Klinik - Master Data', description: 'Kelola data obat dan kategori' },
    clinic_master_suppliers: { name: 'Master Data Supplier', category: 'Klinik - Master Data', description: 'Kelola data supplier obat' },
    clinic_master_doctors: { name: 'Master Data Dokter', category: 'Klinik - Master Data', description: 'Kelola data dokter yang bertugas' },
    clinic_master_nurses: { name: 'Master Data Perawat', category: 'Klinik - Master Data', description: 'Kelola data perawat yang bertugas' },
    clinic_master_diseases: { name: 'Master Data Penyakit', category: 'Klinik - Master Data', description: 'Kelola data penyakit/diagnosa (ICD-10)' },

    // Clinic Module - Pelayanan
    clinic_registration: { name: 'Pendaftaran Pasien', category: 'Klinik - Pelayanan', description: 'Registrasi pasien untuk kunjungan' },
    clinic_examination: { name: 'Pemeriksaan & Diagnosa', category: 'Klinik - Pelayanan', description: 'Rekam medis pemeriksaan dokter' },
    clinic_prescription: { name: 'Resep Obat', category: 'Klinik - Pelayanan', description: 'Kelola resep obat dari dokter' },
    clinic_dispensing: { name: 'Penyerahan Obat', category: 'Klinik - Pelayanan', description: 'Proses penyerahan obat ke pasien' },
    clinic_sick_letter: { name: 'Surat Sakit', category: 'Klinik - Pelayanan', description: 'Cetak surat keterangan sakit' },

    // Clinic Module - Inventory
    clinic_stock_management: { name: 'Manajemen Stok Obat', category: 'Klinik - Inventori', description: 'Monitor dan kelola stok obat' },

    // Clinic Module - Reports
    clinic_reports: { name: 'Laporan Klinik', category: 'Klinik - Laporan', description: 'Lihat berbagai laporan klinik' },
  };

  /**
   * Load permissions from Supabase on mount
   */
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      console.log('📡 RoleManagement: Starting to load permissions from Supabase');
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await fetchRolesWithPermissions();

      console.log('📡 RoleManagement: Fetch result', { data, fetchError });

      if (fetchError) {
        console.error('❌ RoleManagement: Fetch error', fetchError);
        throw fetchError;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ RoleManagement: No data returned from Supabase');
        throw new Error('No roles found in database');
      }

      console.log(`✅ RoleManagement: Fetched ${data.length} roles from Supabase`);

      // Transform Supabase data to component format
      const transformed: RolePermissions[] = data.map((role) => {
        console.log(`🔄 Transforming role: ${role.code} with ${role.permissions?.length || 0} permissions`);

        const uiConfig = roleUIConfig[role.code] || {
          icon: Shield,
          color: 'text-gray-600',
          description: role.description || '',
        };

        // Safety check: ensure permissions is an array
        const rolePermissions = Array.isArray(role.permissions) ? role.permissions : [];

        const permissions: ModulePermission[] = rolePermissions
          .filter(perm => perm && perm.module_name) // Filter out null/undefined permissions
          .map((perm) => {
            const displayConfig = moduleDisplayConfig[perm.module_name] || {
              name: perm.module_name,
              category: 'Lainnya',
              description: '',
            };

            return {
              module: perm.module_name,
              moduleName: displayConfig.name,
              category: displayConfig.category,
              description: displayConfig.description,
              canView: perm.can_view ?? false,
              canCreate: perm.can_create ?? false,
              canEdit: perm.can_edit ?? false,
              canDelete: perm.can_delete ?? false,
            };
          });

        return {
          role: role.code as UserRole,
          roleName: role.name,
          roleDescription: uiConfig.description,
          icon: uiConfig.icon,
          color: uiConfig.color,
          permissions,
        };
      });

      console.log('✅ RoleManagement: Transformation complete, setting state');
      setRolePermissions(transformed);
      console.log('✅ RoleManagement: Permissions loaded successfully');

    } catch (err) {
      console.error('❌ RoleManagement: Error loading permissions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data permissions dari Supabase';
      console.warn('⚠️ RoleManagement: Loading fallback permissions due to error:', errorMessage);
      setError(errorMessage);

      // Load default hardcoded data as fallback
      loadDefaultPermissions();
    } finally {
      setIsLoading(false);
      console.log('🏁 RoleManagement: Loading process complete');
    }
  };

  /**
   * Load default hardcoded permissions as fallback
   */
  const loadDefaultPermissions = () => {
    console.log('⚠️ Loading default fallback permissions');

    // Minimal fallback data - just enough to show something
    setRolePermissions([
      {
        role: 'super_admin',
        roleName: 'Super Admin',
        roleDescription: 'Akses penuh ke seluruh sistem',
        icon: ShieldCheck,
        color: 'text-red-600',
        permissions: [
          { module: 'dashboard', moduleName: 'Dashboard', category: 'Umum', description: 'Dashboard utama', canView: true, canCreate: true, canEdit: true, canDelete: true },
          { module: 'user_management', moduleName: 'Manajemen User', category: 'Administrasi', description: 'Kelola user', canView: true, canCreate: true, canEdit: true, canDelete: true },
          { module: 'role_management', moduleName: 'Role & Permission', category: 'Administrasi', description: 'Kelola role', canView: true, canCreate: true, canEdit: true, canDelete: true },
        ]
      },
      {
        role: 'admin',
        roleName: 'Admin',
        roleDescription: 'Akses operasional',
        icon: Shield,
        color: 'text-blue-600',
        permissions: [
          { module: 'dashboard', moduleName: 'Dashboard', category: 'Umum', description: 'Dashboard utama', canView: true, canCreate: true, canEdit: true, canDelete: true },
          { module: 'user_management', moduleName: 'Manajemen User', category: 'Administrasi', description: 'Kelola user', canView: false, canCreate: false, canEdit: false, canDelete: false },
        ]
      },
      {
        role: 'manager',
        roleName: 'Manager',
        roleDescription: 'Akses monitoring',
        icon: ShieldAlert,
        color: 'text-orange-600',
        permissions: [
          { module: 'dashboard', moduleName: 'Dashboard', category: 'Umum', description: 'Dashboard utama', canView: true, canCreate: false, canEdit: false, canDelete: false },
        ]
      },
      {
        role: 'karyawan',
        roleName: 'Karyawan',
        roleDescription: 'Akses terbatas',
        icon: User,
        color: 'text-gray-600',
        permissions: [
          { module: 'dashboard', moduleName: 'Dashboard', category: 'Umum', description: 'Dashboard utama', canView: true, canCreate: false, canEdit: false, canDelete: false },
          { module: 'payroll_view', moduleName: 'Slip Gaji', category: 'Laporan', description: 'Lihat slip gaji', canView: true, canCreate: false, canEdit: false, canDelete: false },
        ]
      }
    ]);
  };

  const togglePermission = async (
    roleIndex: number,
    moduleIndex: number,
    permission: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'
  ) => {
    const roleData = rolePermissions[roleIndex];
    const modulePermission = roleData.permissions[moduleIndex];
    const newValue = !modulePermission[permission];

    try {
      setIsSaving(true);

      // Get role ID from Supabase
      const { data: roleRecord, error: roleError } = await fetchRolesWithPermissions();
      if (roleError || !roleRecord) {
        throw new Error('Failed to fetch role data');
      }

      const currentRole = roleRecord.find(r => r.code === roleData.role);
      if (!currentRole) {
        throw new Error('Role not found');
      }

      // Map UI permission names to database column names
      const permissionMap: Record<typeof permission, keyof RolePermission> = {
        canView: 'can_view',
        canCreate: 'can_create',
        canEdit: 'can_edit',
        canDelete: 'can_delete',
      };

      const dbPermissionName = permissionMap[permission];

      // Update permission in Supabase
      const { error: updateError } = await updatePermission({
        role_id: currentRole.id,
        module_name: modulePermission.module,
        [dbPermissionName]: newValue,
      });

      if (updateError) {
        throw updateError;
      }

      // Update local state
      const updated = [...rolePermissions];
      updated[roleIndex].permissions[moduleIndex][permission] = newValue;
      setRolePermissions(updated);

      console.log('✅ Permission updated successfully');
    } catch (err) {
      console.error('Error updating permission:', err);
      alert(`Gagal menyimpan permission: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by category
  const getGroupedPermissions = (permissions: ModulePermission[]) => {
    const grouped: { [key: string]: ModulePermission[] } = {};
    permissions.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  };

  // Safety check - prevent rendering with invalid data
  if (!isLoading && (!rolePermissions || rolePermissions.length === 0)) {
    console.error('⚠️ RoleManagement: No permissions data available for rendering');
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Tidak ada data permissions yang tersedia. Pastikan tabel roles dan role_permissions sudah terisi di database Supabase.
            <br /><br />
            <strong>Solusi:</strong>
            <ol className="list-decimal ml-4 mt-2">
              <li>Jalankan migration: <code>npx supabase db push</code></li>
              <li>Atau insert data manual ke tabel <code>roles</code> dan <code>role_permissions</code></li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Memuat data permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">Manajemen Role & Permission</h2>
        <p className="text-muted-foreground">
          Kelola hak akses untuk setiap role dalam sistem
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <br />
            <span className="text-sm">Menggunakan data default sebagai fallback.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Menyimpan</AlertTitle>
          <AlertDescription>
            Menyimpan perubahan permission...
          </AlertDescription>
        </Alert>
      )}

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rolePermissions.map((roleData) => {
          const Icon = roleData.icon;
          // Safety check: ensure permissions array exists and filter out invalid items
          const validPermissions = roleData.permissions?.filter(p => p && p.canView !== undefined) || [];
          const activePermissions = validPermissions.filter(p => p.canView).length;
          const totalPermissions = roleData.permissions?.length || 0;
          
          return (
            <Card key={roleData.role}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg bg-background flex items-center justify-center ${roleData.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary">
                    {activePermissions}/{totalPermissions}
                  </Badge>
                </div>
                <CardTitle className="text-foreground">{roleData.roleName}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {roleData.roleDescription}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Detailed Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Hak Akses Detail</CardTitle>
          <CardDescription>
            Atur permission untuk setiap modul berdasarkan role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="super_admin" className="w-full">
            {/* Scrollable tabs untuk mobile, grid untuk desktop */}
            <div className="overflow-x-auto -mx-6 px-6 mb-4">
              <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
                {rolePermissions.map((roleData) => {
                  const Icon = roleData.icon;
                  return (
                    <TabsTrigger
                      key={roleData.role}
                      value={roleData.role}
                      className="flex items-center gap-2 whitespace-nowrap px-3 py-2 min-w-fit"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{roleData.roleName}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {rolePermissions.map((roleData, roleIndex) => {
              const groupedPermissions = getGroupedPermissions(roleData.permissions);
              
              return (
                <TabsContent key={roleData.role} value={roleData.role} className="space-y-4">
                  <div className="rounded-lg border border-border p-4 bg-muted/30">
                    <div className="flex items-start gap-3">
                      {(() => {
                        const Icon = roleData.icon;
                        return <Icon className={`w-5 h-5 mt-0.5 ${roleData.color}`} />;
                      })()}
                      <div>
                        <h3 className="text-foreground">{roleData.roleName}</h3>
                        <p className="text-muted-foreground">{roleData.roleDescription}</p>
                      </div>
                    </div>
                  </div>

                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <div className="px-2 py-1 bg-muted/50 rounded">
                        <h4 className="text-foreground">{category}</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[200px]">Modul</TableHead>
                              <TableHead>Lihat</TableHead>
                              <TableHead>Buat</TableHead>
                              <TableHead>Edit</TableHead>
                              <TableHead>Hapus</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {permissions.map((permission) => {
                              const moduleIndex = roleData.permissions?.findIndex(p => p && p.module === permission.module) ?? -1;
                              if (moduleIndex === -1) {
                                console.warn(`⚠️ Module not found in roleData.permissions: ${permission.module}`);
                                return null;
                              }
                              return (
                                <TableRow key={permission.module}>
                                  <TableCell>
                                    <div>
                                      <div>{permission.moduleName}</div>
                                      <div className="text-muted-foreground">
                                        {permission.description}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={permission.canView}
                                        onCheckedChange={() => togglePermission(roleIndex, moduleIndex, 'canView')}
                                      />
                                      {permission.canView ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <X className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={permission.canCreate}
                                        onCheckedChange={() => togglePermission(roleIndex, moduleIndex, 'canCreate')}
                                        disabled={!permission.canView}
                                      />
                                      {permission.canCreate ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <X className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={permission.canEdit}
                                        onCheckedChange={() => togglePermission(roleIndex, moduleIndex, 'canEdit')}
                                        disabled={!permission.canView}
                                      />
                                      {permission.canEdit ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <X className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={permission.canDelete}
                                        onCheckedChange={() => togglePermission(roleIndex, moduleIndex, 'canDelete')}
                                        disabled={!permission.canView}
                                      />
                                      {permission.canDelete ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <X className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Permission Matrix Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Matriks Permission</CardTitle>
          <CardDescription>
            Ringkasan hak akses semua role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Modul</TableHead>
                  {rolePermissions.map((roleData) => (
                    <TableHead key={roleData.role} className="text-center">
                      {roleData.roleName}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolePermissions[0].permissions.map((permission, idx) => (
                  <TableRow key={permission.module}>
                    <TableCell>
                      <div>
                        <div>{permission.moduleName}</div>
                        <div className="text-xs text-muted-foreground">{permission.category}</div>
                      </div>
                    </TableCell>
                    {rolePermissions.map((roleData) => {
                      const perm = roleData.permissions?.[idx];

                      // Safety check: if permission not found, show no access
                      if (!perm) {
                        return (
                          <TableCell key={roleData.role} className="text-center">
                            <Badge variant="secondary">Tidak Ada Akses</Badge>
                          </TableCell>
                        );
                      }

                      const hasFullAccess = perm.canView && perm.canCreate && perm.canEdit && perm.canDelete;
                      const hasViewOnly = perm.canView && !perm.canCreate && !perm.canEdit && !perm.canDelete;
                      const hasPartialAccess = perm.canView && (perm.canCreate || perm.canEdit || perm.canDelete);

                      return (
                        <TableCell key={roleData.role} className="text-center">
                          {!perm.canView ? (
                            <Badge variant="secondary">Tidak Ada Akses</Badge>
                          ) : hasFullAccess ? (
                            <Badge variant="default">Full Access</Badge>
                          ) : hasViewOnly ? (
                            <Badge variant="outline">View Only</Badge>
                          ) : hasPartialAccess ? (
                            <Badge variant="secondary">Partial Access</Badge>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
