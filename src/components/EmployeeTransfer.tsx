import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Filter, Download, Eye, ArrowRightLeft, History, Clock, CheckCircle2, XCircle, UserPlus, Briefcase, Building2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { EmployeeTransferForm } from './EmployeeTransferForm';
import { useAuth } from '../contexts/AuthContext';
import { useEmployeeTransfers } from '../hooks/useEmployeeTransfers';
import { toast } from 'sonner';
import type { EmployeeTransfer, TransferType } from '../types/employee-transfer';

export function EmployeeTransfer() {
  const { user, hasPermission } = useAuth();
  const {
    transfers,
    loading,
    createTransfer,
    approveTransfer,
    rejectTransfer,
    completeTransfer,
    autoCompleteTransfers,
    getTransferType,
    getStats
  } = useEmployeeTransfers();

  const [activeTab, setActiveTab] = useState('transfers');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transferTypeFilter, setTransferTypeFilter] = useState<'all' | TransferType>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<EmployeeTransfer | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Auto-complete transfers on mount
  useEffect(() => {
    autoCompleteTransfers();
  }, []);

  // Filter transfers
  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch =
      transfer.employee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.employee?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' ||
      transfer.from_division?.nama_divisi === departmentFilter ||
      transfer.to_division?.nama_divisi === departmentFilter;

    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesTransferType = transferTypeFilter === 'all' || getTransferType(transfer) === transferTypeFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesTransferType;
  });

  // Get unique departments
  const departments = Array.from(new Set([
    ...transfers.map(t => t.from_division?.nama_divisi).filter(Boolean),
    ...transfers.map(t => t.to_division?.nama_divisi).filter(Boolean)
  ])) as string[];

  // Statistics
  const stats = getStats();

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, icon: Clock, className: '' },
      approved: { label: 'Disetujui', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      rejected: { label: 'Ditolak', variant: 'destructive' as const, icon: XCircle, className: '' },
      completed: { label: 'Selesai', variant: 'default' as const, icon: CheckCircle2, className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' }
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

  // Get transfer type badge
  const getTransferTypeBadge = (type: TransferType) => {
    if (type === 'position') {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Briefcase size={12} className="mr-1" />
          Mutasi Jabatan
        </Badge>
      );
    }
    if (type === 'division') {
      return (
        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
          <Building2 size={12} className="mr-1" />
          Mutasi Divisi
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        <ArrowRightLeft size={12} className="mr-1" />
        Mutasi Keduanya
      </Badge>
    );
  };

  const handleViewDetails = (transfer: EmployeeTransfer) => {
    setSelectedTransfer(transfer);
    setIsViewDialogOpen(true);
  };

  const handleApprovalClick = (transfer: EmployeeTransfer, action: 'approve' | 'reject') => {
    setSelectedTransfer(transfer);
    setApprovalAction(action);
    setApprovalNotes('');
    setIsApprovalDialogOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedTransfer || !user?.id) return;

    try {
      if (approvalAction === 'approve') {
        const result = await approveTransfer(selectedTransfer.id, user.id);
        if (result.error) {
          toast.error('Gagal Menyetujui', {
            description: result.error
          });
        } else {
          toast.success('Mutasi Disetujui', {
            description: `Mutasi ${selectedTransfer.employee?.full_name} telah disetujui`
          });
          setIsApprovalDialogOpen(false);
          setIsViewDialogOpen(false);
        }
      } else {
        const result = await rejectTransfer(selectedTransfer.id, user.id, approvalNotes);
        if (result.error) {
          toast.error('Gagal Menolak', {
            description: result.error
          });
        } else {
          toast.success('Mutasi Ditolak', {
            description: `Mutasi ${selectedTransfer.employee?.full_name} telah ditolak`
          });
          setIsApprovalDialogOpen(false);
          setIsViewDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error handling approval:', error);
      toast.error('Terjadi Kesalahan', {
        description: 'Gagal memproses approval'
      });
    }
  };

  const handleCompleteTransfer = async (transferId: string) => {
    try {
      const result = await completeTransfer(transferId);
      if (result.error) {
        toast.error('Gagal Menyelesaikan', {
          description: result.error
        });
      } else {
        toast.success('Mutasi Selesai', {
          description: 'Data karyawan telah diupdate'
        });
      }
    } catch (error) {
      console.error('Error completing transfer:', error);
      toast.error('Terjadi Kesalahan');
    }
  };

  // Filter untuk history (completed dan rejected)
  const historyTransfers = transfers.filter(t => t.status === 'completed' || t.status === 'rejected');

  const canApprove = hasPermission('employee_management', 'edit');

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Mutasi Karyawan</h1>
        <p className="text-muted-foreground">Kelola mutasi dan promosi karyawan</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="transfers" className="gap-2">
            <ArrowRightLeft size={16} />
            Mutasi Karyawan
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History size={16} />
            History Mutasi
          </TabsTrigger>
        </TabsList>

        {/* Tab: Mutasi Karyawan */}
        <TabsContent value="transfers" className="mt-0 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Mutasi</p>
                  <h3 className="text-2xl">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                  <ArrowRightLeft size={24} className="text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mutasi Jabatan</p>
                  <h3 className="text-2xl">{stats.positionTransfer}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded flex items-center justify-center">
                  <Briefcase size={24} className="text-purple-500" />
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mutasi Divisi</p>
                  <h3 className="text-2xl">{stats.divisionTransfer}</h3>
                </div>
                <div className="w-12 h-12 bg-cyan-500/10 rounded flex items-center justify-center">
                  <Building2 size={24} className="text-cyan-500" />
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mutasi Keduanya</p>
                  <h3 className="text-2xl">{stats.bothTransfer}</h3>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded flex items-center justify-center">
                  <ArrowRightLeft size={24} className="text-orange-500" />
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Menunggu</p>
                  <h3 className="text-2xl">{stats.pending}</h3>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded flex items-center justify-center">
                  <Clock size={24} className="text-yellow-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card className="shadow-sm">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div>
                  <h2 className="mb-1">Daftar Mutasi Karyawan</h2>
                  <p className="text-sm text-muted-foreground">Kelola pengajuan mutasi dan promosi karyawan</p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus size={16} className="mr-2" />
                        Tambah Mutasi
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tambah Mutasi Karyawan</DialogTitle>
                        <DialogDescription>
                          Formulir pencatatan mutasi karyawan baru
                        </DialogDescription>
                      </DialogHeader>
                      <EmployeeTransferForm
                        onSubmit={async (data) => {
                          if (!user?.id) {
                            toast.error('Error', { description: 'User not authenticated' });
                            return;
                          }

                          const transferData = {
                            employee_id: data.employeeId,
                            from_division_id: data.fromDivision || null,
                            from_position_id: data.fromPosition || null,
                            to_division_id: data.toDepartment || null,
                            to_position_id: data.toPosition || null,
                            transfer_date: data.transferDate?.toISOString() || new Date().toISOString(),
                            effective_date: data.effectiveDate?.toISOString() || new Date().toISOString(),
                            reason: data.reason || '',
                            notes: data.notes || '',
                            requested_by: user.id
                          };

                          const result = await createTransfer(transferData);

                          if (result.error) {
                            toast.error('Gagal Menambahkan Mutasi', {
                              description: result.error
                            });
                          } else {
                            toast.success('Mutasi Berhasil Ditambahkan', {
                              description: `Mutasi ${data.employeeName} telah berhasil dicatat dengan status Menunggu.`
                            });
                            setIsAddDialogOpen(false);
                          }
                        }}
                        onCancel={() => {
                          setIsAddDialogOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
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
                <Select value={transferTypeFilter} onValueChange={setTransferTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Jenis Mutasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="position">Mutasi Jabatan</SelectItem>
                    <SelectItem value="division">Mutasi Divisi</SelectItem>
                    <SelectItem value="both">Mutasi Keduanya</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Semua Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Divisi</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Karyawan</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Jenis</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Dari</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Ke</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Tgl Efektif</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-4 md:px-6 py-8 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && filteredTransfers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 md:px-6 py-8 text-center text-muted-foreground">
                        Tidak ada data mutasi
                      </td>
                    </tr>
                  )}
                  {!loading && filteredTransfers.map((transfer) => {
                    const transferType = getTransferType(transfer);
                    return (
                      <tr key={transfer.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                              {transfer.employee?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'}
                            </div>
                            <div className="min-w-0">
                              <p className="mb-0 truncate">{transfer.employee?.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground truncate">{transfer.employee?.employee_id || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getTransferTypeBadge(transferType)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <p className="mb-0 text-sm">{transfer.from_division?.nama_divisi || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{transfer.from_position?.name || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            {transfer.from_division_id !== transfer.to_division_id && (
                              <p className="mb-0 text-sm text-cyan-700">{transfer.to_division?.nama_divisi || 'N/A'}</p>
                            )}
                            {transfer.from_position_id !== transfer.to_position_id && (
                              <p className={`text-sm mb-0 ${transfer.from_division_id !== transfer.to_division_id ? '' : 'text-purple-700'}`}>
                                {transfer.to_position?.name || 'N/A'}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm">
                          {format(new Date(transfer.effective_date), 'dd MMM yyyy', { locale: id })}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getStatusBadge(transfer.status)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(transfer)}
                            >
                              <Eye size={16} />
                            </Button>
                            {canApprove && transfer.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprovalClick(transfer, 'approve')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <ThumbsUp size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprovalClick(transfer, 'reject')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <ThumbsDown size={16} />
                                </Button>
                              </>
                            )}
                            {canApprove && transfer.status === 'approved' && new Date(transfer.effective_date) <= new Date() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCompleteTransfer(transfer.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <CheckCircle2 size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs md:text-sm text-muted-foreground">
                Menampilkan {filteredTransfers.length} dari {transfers.length} mutasi
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: History Mutasi */}
        <TabsContent value="history" className="mt-0">
          <Card className="shadow-sm">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-border">
              <div>
                <h2 className="mb-1">Riwayat Mutasi Karyawan</h2>
                <p className="text-sm text-muted-foreground">Daftar mutasi yang telah selesai atau ditolak</p>
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
                <Button variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Karyawan</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Jenis</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Dari</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Ke</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Tgl Efektif</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {historyTransfers.filter((transfer) => {
                    const matchesSearch =
                      transfer.employee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      transfer.employee?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesSearch;
                  }).map((transfer) => {
                    const transferType = getTransferType(transfer);
                    return (
                      <tr key={transfer.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                              {transfer.employee?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'}
                            </div>
                            <div className="min-w-0">
                              <p className="mb-0 truncate">{transfer.employee?.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground truncate">{transfer.employee?.employee_id || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getTransferTypeBadge(transferType)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <p className="mb-0 text-sm">{transfer.from_division?.nama_divisi || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{transfer.from_position?.name || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <p className="mb-0 text-sm">{transfer.to_division?.nama_divisi || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{transfer.to_position?.name || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm">
                          {format(new Date(transfer.effective_date), 'dd MMM yyyy', { locale: id })}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getStatusBadge(transfer.status)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transfer)}
                          >
                            <Eye size={16} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs md:text-sm text-muted-foreground">
                Menampilkan {historyTransfers.length} riwayat mutasi
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Mutasi Karyawan</DialogTitle>
            <DialogDescription>
              Informasi lengkap mutasi karyawan
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (() => {
            const transferType = getTransferType(selectedTransfer);
            const isDivisionChanged = selectedTransfer.from_division_id !== selectedTransfer.to_division_id;
            const isPositionChanged = selectedTransfer.from_position_id !== selectedTransfer.to_position_id;

            return (
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                    {selectedTransfer.employee?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'}
                  </div>
                  <div>
                    <h3>{selectedTransfer.employee?.full_name || 'N/A'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTransfer.employee?.employee_id || 'N/A'}</p>
                    <div className="flex gap-2 mt-2">
                      {getTransferTypeBadge(transferType)}
                      {getStatusBadge(selectedTransfer.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-muted-foreground mb-2">Dari</p>
                      <p className="mb-1">{selectedTransfer.from_division?.nama_divisi || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground mb-0">{selectedTransfer.from_position?.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-muted-foreground mb-2">Ke</p>
                      <p className={`mb-1 ${isDivisionChanged ? 'text-green-700' : ''}`}>
                        {selectedTransfer.to_division?.nama_divisi || 'N/A'}
                        {!isDivisionChanged && ' (Tetap)'}
                      </p>
                      <p className={`text-sm mb-0 ${isPositionChanged ? 'text-green-700' : 'text-muted-foreground'}`}>
                        {selectedTransfer.to_position?.name || 'N/A'}
                        {!isPositionChanged && ' (Tetap)'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Tanggal Pengajuan</p>
                      <p className="mb-0">{format(new Date(selectedTransfer.transfer_date), 'dd MMMM yyyy', { locale: id })}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Tanggal Efektif</p>
                      <p className="mb-0">{format(new Date(selectedTransfer.effective_date), 'dd MMMM yyyy', { locale: id })}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Diajukan Oleh</p>
                      <p className="mb-0">{selectedTransfer.requested_by_user?.full_name || 'N/A'}</p>
                    </div>
                    {selectedTransfer.approved_by_user && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">Disetujui Oleh</p>
                        <p className="mb-0">{selectedTransfer.approved_by_user.full_name}</p>
                        {selectedTransfer.approved_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(selectedTransfer.approved_date), 'dd MMMM yyyy', { locale: id })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedTransfer.reason && (
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-2">Alasan Mutasi</p>
                      <p className="mb-0">{selectedTransfer.reason}</p>
                    </div>
                  )}

                  {selectedTransfer.notes && (
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                      <p className="mb-0">{selectedTransfer.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Setujui Mutasi' : 'Tolak Mutasi'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve'
                ? 'Apakah Anda yakin ingin menyetujui mutasi ini?'
                : 'Berikan alasan penolakan mutasi'}
            </DialogDescription>
          </DialogHeader>
          {approvalAction === 'reject' && (
            <div className="space-y-2">
              <Label>Alasan Penolakan</Label>
              <Input
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
            >
              {approvalAction === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
