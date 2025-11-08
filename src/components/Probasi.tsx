import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Download, Eye, UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, Check, X } from 'lucide-react';
import { format, differenceInDays, addMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { usePositions } from '../hooks/usePositions';
import { useDivisions } from '../hooks/useDivisions';

interface ProbationEmployee {
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
  probationEndDate: Date;
  probationStatus: 'ongoing' | 'passed' | 'extended' | 'failed';
  performanceScore?: number;
  notes?: string;
}

export function Probasi() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ProbationEmployee | null>(null);
  const [employees, setEmployees] = useState<ProbationEmployee[]>([]);
  const [loading, setLoading] = useState(false);

  // Action dialog state
  const [actionType, setActionType] = useState<'pass' | 'extend' | 'fail' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [performanceScore, setPerformanceScore] = useState('');
  const [extensionMonths, setExtensionMonths] = useState('1');

  const { positions } = usePositions();
  const { divisions } = useDivisions();

  // Load employees with probation status
  const loadProbationEmployees = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('workflow_status', 'probation')
        .order('join_date', { ascending: false });

      if (error) throw error;

      const transformedData: ProbationEmployee[] = (data || []).map((emp: any) => {
        const division = divisions.find(d => d.id === emp.division_id);
        const position = positions.find(p => p.id === emp.position_id);

        // Calculate probation end date (3 months from join date by default)
        const probationEndDate = addMonths(new Date(emp.join_date), 3);

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
          probationEndDate: probationEndDate,
          probationStatus: 'ongoing', // Default status, bisa dikustomisasi
          performanceScore: undefined,
          notes: emp.notes || '',
        };
      });

      setEmployees(transformedData);
    } catch (error: any) {
      console.error('Error loading probation employees:', error);
      toast.error('Gagal memuat data karyawan probasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProbationEmployees();
  }, [divisions, positions]);

  // Filter karyawan
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || emp.divisionId === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.probationStatus === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Hitung statistik
  const stats = {
    total: employees.length,
    ongoing: employees.filter(e => e.probationStatus === 'ongoing').length,
    passed: employees.filter(e => e.probationStatus === 'passed').length,
    extended: employees.filter(e => e.probationStatus === 'extended').length,
    failed: employees.filter(e => e.probationStatus === 'failed').length,
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ongoing: { label: 'Berlangsung', variant: 'default' as const, icon: Clock },
      passed: { label: 'Lulus', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      extended: { label: 'Diperpanjang', variant: 'secondary' as const, icon: AlertCircle },
      failed: { label: 'Tidak Lulus', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon;

    return (
      <Badge variant={config?.variant || 'default'} className={config?.className || ''}>
        {Icon && <Icon size={12} className="mr-1" />}
        {config?.label || status}
      </Badge>
    );
  };

  // Hitung sisa hari probasi
  const getRemainingDays = (endDate: Date) => {
    const today = new Date();
    const remaining = differenceInDays(endDate, today);
    return remaining;
  };

  // Get performance badge
  const getPerformanceBadge = (score?: number) => {
    if (!score) return null;

    if (score >= 85) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sangat Baik ({score})</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Baik ({score})</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Cukup ({score})</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Kurang ({score})</Badge>;
    }
  };

  const handleViewDetails = (employee: ProbationEmployee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleOpenActionDialog = (employee: ProbationEmployee, action: 'pass' | 'extend' | 'fail') => {
    setSelectedEmployee(employee);
    setActionType(action);
    setActionNotes('');
    setPerformanceScore('');
    setExtensionMonths('1');
    setIsActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedEmployee || !actionType) return;

    try {
      const score = performanceScore ? parseInt(performanceScore) : undefined;

      // Update workflow_status based on action
      let newWorkflowStatus = 'none';
      let newStatus = 'active';

      if (actionType === 'pass') {
        newWorkflowStatus = 'none'; // Lulus probasi, kembali ke normal
        newStatus = 'active';
        toast.success('Karyawan berhasil lulus probasi');
      } else if (actionType === 'extend') {
        newWorkflowStatus = 'probation'; // Tetap probasi
        newStatus = 'active';
        toast.success('Masa probasi berhasil diperpanjang');
      } else if (actionType === 'fail') {
        newWorkflowStatus = 'none';
        newStatus = 'inactive'; // Set inactive jika tidak lulus
        toast.success('Karyawan tidak lulus probasi');
      }

      const { error } = await supabase
        .from('employees')
        .update({
          workflow_status: newWorkflowStatus,
          status: newStatus,
        })
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      // Reload data
      await loadProbationEmployees();
      setIsActionDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error('Error updating probation status:', error);
      toast.error('Gagal mengupdate status probasi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Probasi</p>
              <h3 className="text-2xl">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <UserCheck size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Berlangsung</p>
              <h3 className="text-2xl">{stats.ongoing}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded flex items-center justify-center">
              <Clock size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lulus</p>
              <h3 className="text-2xl">{stats.passed}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded flex items-center justify-center">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Diperpanjang</p>
              <h3 className="text-2xl">{stats.extended}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded flex items-center justify-center">
              <AlertCircle size={24} className="text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tidak Lulus</p>
              <h3 className="text-2xl">{stats.failed}</h3>
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
              <h2 className="mb-1">Daftar Karyawan Probasi</h2>
              <p className="text-sm text-muted-foreground">Kelola dan monitor karyawan dalam masa probasi</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export
              </Button>
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
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map(div => (
                  <SelectItem key={div.id} value={div.id}>{div.nama_divisi}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="ongoing">Berlangsung</SelectItem>
                <SelectItem value="passed">Lulus</SelectItem>
                <SelectItem value="extended">Diperpanjang</SelectItem>
                <SelectItem value="failed">Tidak Lulus</SelectItem>
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
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Akhir Probasi</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Sisa Hari</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 md:px-6 py-8 text-center text-muted-foreground">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 md:px-6 py-8 text-center text-muted-foreground">
                    Tidak ada karyawan probasi
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const remainingDays = getRemainingDays(employee.probationEndDate);
                  return (
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
                      <td className="px-4 md:px-6 py-4 text-sm">
                        {format(employee.probationEndDate, 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {employee.probationStatus === 'ongoing' ? (
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-muted-foreground" />
                            <span className={`text-sm ${remainingDays <= 7 ? 'text-red-500 font-semibold' : remainingDays <= 14 ? 'text-yellow-500 font-semibold' : ''}`}>
                              {remainingDays > 0 ? `${remainingDays} hari` : 'Berakhir'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {getStatusBadge(employee.probationStatus)}
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
                          {employee.probationStatus === 'ongoing' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-600"
                                onClick={() => handleOpenActionDialog(employee, 'pass')}
                              >
                                <Check size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-600"
                                onClick={() => handleOpenActionDialog(employee, 'fail')}
                              >
                                <X size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground">
            Menampilkan {filteredEmployees.length} dari {employees.length} karyawan probasi
          </p>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Karyawan Probasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap karyawan dalam masa probasi
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
                    {getStatusBadge(selectedEmployee.probationStatus)}
                    {getPerformanceBadge(selectedEmployee.performanceScore)}
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
                  <p className="text-sm text-muted-foreground mb-1">Akhir Probasi</p>
                  <p className="mb-0">{format(selectedEmployee.probationEndDate, 'dd MMMM yyyy', { locale: id })}</p>
                </div>
              </div>

              {selectedEmployee.probationStatus === 'ongoing' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="mb-1 text-blue-900 dark:text-blue-100">Masa Probasi Berlangsung</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-0">
                        Sisa waktu: {getRemainingDays(selectedEmployee.probationEndDate)} hari lagi
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEmployee.notes && (
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                  <p className="mb-0">{selectedEmployee.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog (Pass/Fail/Extend) */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'pass' && 'Luluskan Probasi'}
              {actionType === 'fail' && 'Tidak Lulus Probasi'}
              {actionType === 'extend' && 'Perpanjang Probasi'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee && `Proses probasi untuk ${selectedEmployee.fullName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'pass' && (
              <div className="space-y-2">
                <Label htmlFor="score">Skor Performa</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={performanceScore}
                  onChange={(e) => setPerformanceScore(e.target.value)}
                  placeholder="Masukkan skor (0-100)"
                />
              </div>
            )}

            {actionType === 'extend' && (
              <div className="space-y-2">
                <Label htmlFor="months">Durasi Perpanjangan (Bulan)</Label>
                <Select value={extensionMonths} onValueChange={setExtensionMonths}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bulan</SelectItem>
                    <SelectItem value="2">2 Bulan</SelectItem>
                    <SelectItem value="3">3 Bulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <Button onClick={handleSubmitAction}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
