/**
 * ==========================================================================
 * TERMINATION MANAGEMENT - MANAJEMEN TERMINASI KARYAWAN
 * ==========================================================================
 *
 * Komponen untuk mengelola proses terminasi/pemberhentian karyawan:
 * - Pengajuan terminasi (resign, retirement, layoff, termination)
 * - Approval workflow
 * - Perhitungan pesangon dan benefit
 * - Update status karyawan
 *
 * #Termination #HR #ExitProcess #Resignation
 *
 * @author Sistem Payroll Team
 * @version 2.0.0
 * @since 2025-01-08
 * ==========================================================================
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Search,
  Eye,
  UserMinus,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { usePositions } from '../hooks/usePositions';
import { useDivisions } from '../hooks/useDivisions';

interface TerminationEmployee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  divisionId: string;
  divisionName: string;
  positionId: string;
  positionName: string;
  joinDate: Date;
  status: string;
}

export function Termination() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<TerminationEmployee | null>(null);
  const [employees, setEmployees] = useState<TerminationEmployee[]>([]);
  const [loading, setLoading] = useState(false);

  // Action dialog state
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [severancePay, setSeverancePay] = useState('');
  const [terminationReason, setTerminationReason] = useState<'resignation' | 'retirement' | 'contract_end' | 'layoff'>('resignation');

  const { positions } = usePositions();
  const { divisions } = useDivisions();

  // Load employees with termination status
  const loadTerminationEmployees = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('workflow_status', 'termination')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const transformedData: TerminationEmployee[] = (data || []).map((emp: any) => {
        const division = divisions.find(d => d.id === emp.division_id);
        const position = positions.find(p => p.id === emp.position_id);

        return {
          id: emp.id,
          employeeId: emp.employee_id,
          fullName: emp.full_name,
          email: emp.email,
          phone: emp.phone,
          divisionId: emp.division_id,
          divisionName: division?.nama_divisi || emp.division_id,
          positionId: emp.position_id,
          positionName: position?.name || emp.position_id,
          joinDate: new Date(emp.join_date),
          status: emp.status,
        };
      });

      setEmployees(transformedData);
    } catch (error: any) {
      console.error('Error loading termination employees:', error);
      toast.error('Gagal memuat data karyawan terminasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerminationEmployees();
  }, [divisions, positions]);

  // Filter karyawan
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || emp.divisionId === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleViewDetails = (employee: TerminationEmployee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleOpenActionDialog = (employee: TerminationEmployee, action: 'approve' | 'reject') => {
    setSelectedEmployee(employee);
    setActionType(action);
    setActionNotes('');
    setSeverancePay('');
    setTerminationReason('resignation');
    setIsActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedEmployee || !actionType) return;

    try {
      if (actionType === 'approve') {
        // Approve termination: set status to inactive, workflow_status to none, and save termination_reason
        const { error } = await supabase
          .from('employees')
          .update({
            workflow_status: 'none',
            status: 'inactive',
            termination_reason: terminationReason,
          })
          .eq('id', selectedEmployee.id);

        if (error) throw error;
        toast.success('Terminasi disetujui, status karyawan diupdate menjadi inactive');
      } else if (actionType === 'reject') {
        // Reject termination: set workflow_status back to none and ensure status is active
        const { error } = await supabase
          .from('employees')
          .update({
            workflow_status: 'none',
            status: 'active',
            termination_reason: null, // Clear termination reason
          })
          .eq('id', selectedEmployee.id);

        if (error) throw error;
        toast.success('Terminasi ditolak, karyawan kembali aktif dengan status workflow normal');
      }

      // Reload data
      await loadTerminationEmployees();
      setIsActionDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error('Error updating termination status:', error);
      toast.error('Gagal mengupdate status terminasi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Terminasi</p>
              <h3 className="text-2xl">{employees.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <UserMinus size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Menunggu Approval</p>
              <h3 className="text-2xl">{employees.length}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded flex items-center justify-center">
              <Clock size={24} className="text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Disetujui</p>
              <h3 className="text-2xl">0</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded flex items-center justify-center">
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ditolak</p>
              <h3 className="text-2xl">0</h3>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded flex items-center justify-center">
              <XCircle size={24} className="text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="shadow-sm">
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div>
              <h2 className="mb-1">Pengajuan Terminasi Karyawan</h2>
              <p className="text-sm text-muted-foreground">Kelola proses terminasi dan pemberhentian karyawan</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 border-b border-border">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map(div => (
                  <SelectItem key={div.id} value={div.id}>{div.nama_divisi}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Karyawan</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Divisi</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Tanggal Masuk</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-8 text-center text-muted-foreground">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-8 text-center text-muted-foreground">
                    Tidak ada pengajuan terminasi
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="mb-0 truncate">{employee.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="mb-0">{employee.divisionName}</p>
                        <p className="text-xs text-muted-foreground">{employee.positionName}</p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      {format(employee.joinDate, 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock size={12} className="mr-1" />
                        Menunggu Approval
                      </Badge>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(employee)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-600"
                          onClick={() => handleOpenActionDialog(employee, 'approve')}
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-600"
                          onClick={() => handleOpenActionDialog(employee, 'reject')}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground">
            Menampilkan {filteredEmployees.length} dari {employees.length} pengajuan terminasi
          </p>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Terminasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap pengajuan terminasi karyawan
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                  {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3>{selectedEmployee.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.employeeId} • {selectedEmployee.positionName}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Menunggu Approval
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="mb-0">{selectedEmployee.email}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Telepon</p>
                  <p className="mb-0">{selectedEmployee.phone}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Divisi</p>
                  <p className="mb-0">{selectedEmployee.divisionName}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Jabatan</p>
                  <p className="mb-0">{selectedEmployee.positionName}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Tanggal Masuk</p>
                  <p className="mb-0">{format(selectedEmployee.joinDate, 'dd MMMM yyyy', { locale: id })}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Status Saat Ini</p>
                  <p className="mb-0">{selectedEmployee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="mb-1 text-yellow-900 dark:text-yellow-100 font-medium">Pengajuan Terminasi</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-0">
                      Karyawan ini telah diajukan untuk proses terminasi. Silakan review dan putuskan untuk menyetujui atau menolak pengajuan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Setujui Terminasi' : 'Tolak Terminasi'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee && `Proses terminasi untuk ${selectedEmployee.fullName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'approve' && (
              <>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-0">
                        Dengan menyetujui terminasi, status karyawan akan otomatis berubah menjadi <strong>Inactive</strong> dan workflow status akan direset.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminationReason">Alasan Terminasi *</Label>
                  <Select value={terminationReason} onValueChange={(value) => setTerminationReason(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih alasan terminasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resignation">Pengunduran Diri</SelectItem>
                      <SelectItem value="retirement">Pensiun</SelectItem>
                      <SelectItem value="contract_end">Akhir Masa Kontrak</SelectItem>
                      <SelectItem value="layoff">Afkir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severance">Pesangon (Optional)</Label>
                  <Input
                    id="severance"
                    type="number"
                    min="0"
                    value={severancePay}
                    onChange={(e) => setSeverancePay(e.target.value)}
                    placeholder="Masukkan jumlah pesangon"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Tambahkan catatan..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitAction}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {actionType === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
