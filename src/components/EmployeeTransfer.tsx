import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DatePicker } from './ui/date-picker';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search, Filter, Download, Eye, ArrowRightLeft, History, Clock, CheckCircle2, XCircle, AlertCircle, UserPlus, Briefcase, Building2, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MASTER_EMPLOYEES } from '../shared/employeeData';
import { cn } from './ui/utils';
import { EmployeeTransferForm } from './EmployeeTransferForm';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface EmployeeTransfer {
  id: string;
  employeeId: string;
  employeeName: string;
  fromDepartment: string;
  fromPosition: string;
  toDepartment: string;
  toPosition: string;
  transferDate: Date;
  effectiveDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  requestedBy: string;
  requestDate: Date;
}

// Helper function untuk mendeteksi jenis mutasi
type TransferType = 'position' | 'division' | 'both';

const getTransferType = (transfer: EmployeeTransfer): TransferType => {
  const isDivisionChanged = transfer.fromDepartment !== transfer.toDepartment;
  const isPositionChanged = transfer.fromPosition !== transfer.toPosition;
  
  if (isDivisionChanged && isPositionChanged) return 'both';
  if (isDivisionChanged) return 'division';
  if (isPositionChanged) return 'position';
  return 'position'; // default
};

// Data dummy mutasi karyawan - disesuaikan dengan data perkebunan sawit
const EMPLOYEE_TRANSFERS: EmployeeTransfer[] = [
  {
    id: '1',
    employeeId: '1782829',
    employeeName: 'Ahmad Hidayat',
    fromDepartment: 'Bangun Bandar',
    fromPosition: 'Pemanen',
    toDepartment: 'Bangun Bandar',
    toPosition: 'Mandor Panen',
    transferDate: new Date(2024, 8, 15),
    effectiveDate: new Date(2024, 9, 1),
    reason: 'Promosi jabatan berdasarkan kinerja luar biasa dalam pencapaian target panen dan kepemimpinan',
    status: 'approved',
    approvedBy: 'Yuni Astuti',
    approvedDate: new Date(2024, 8, 18),
    notes: 'Kinerja sangat baik, konsisten mencapai target panen 120% selama 2 tahun',
    requestedBy: 'Suryadi',
    requestDate: new Date(2024, 8, 15)
  },
  {
    id: '2',
    employeeId: '1745623',
    employeeName: 'Budi Santoso',
    fromDepartment: 'Bangun Bandar',
    fromPosition: 'Pemanen',
    toDepartment: 'PT Socfindo Kebun TG',
    toPosition: 'Pemanen',
    transferDate: new Date(2024, 9, 5),
    effectiveDate: new Date(2024, 9, 20),
    reason: 'Rotasi karyawan untuk pemerataan pengalaman di berbagai kebun',
    status: 'completed',
    approvedBy: 'Yuni Astuti',
    approvedDate: new Date(2024, 9, 7),
    notes: 'Rotasi berhasil, sudah menjalani orientasi di kebun TG',
    requestedBy: 'Susanto Wijaya',
    requestDate: new Date(2024, 9, 5)
  },
  {
    id: '3',
    employeeId: '1793012',
    employeeName: 'Susanto Wijaya',
    fromDepartment: 'PT Socfindo Kebun TG',
    fromPosition: 'Mandor Panen',
    toDepartment: 'PT Socfindo Kebun TG',
    toPosition: 'Supervisor Pemanen',
    transferDate: new Date(2024, 8, 10),
    effectiveDate: new Date(2024, 8, 20),
    reason: 'Promosi ke posisi supervisor berdasarkan kompetensi dan pengalaman',
    status: 'approved',
    approvedBy: 'Yuni Astuti',
    approvedDate: new Date(2024, 8, 12),
    notes: 'Promosi untuk mengisi kekosongan posisi supervisor di kebun TG',
    requestedBy: 'Yuni Astuti',
    requestDate: new Date(2024, 8, 10)
  },
  {
    id: '4',
    employeeId: '1794234',
    employeeName: 'Agung Prasetyo',
    fromDepartment: 'PT Socfindo Kebun TG',
    fromPosition: 'Pemanen',
    toDepartment: 'PT Socfindo Kebun AP',
    toPosition: 'Pemanen',
    transferDate: new Date(2024, 9, 12),
    effectiveDate: new Date(2024, 9, 25),
    reason: 'Permintaan mutasi karyawan untuk dekat dengan keluarga',
    status: 'pending',
    requestedBy: 'Indra Gunawan',
    requestDate: new Date(2024, 9, 12)
  },
  {
    id: '5',
    employeeId: '1756789',
    employeeName: 'Sukarman',
    fromDepartment: 'Bangun Bandar',
    fromPosition: 'Pemanen',
    toDepartment: 'Bangun Bandar',
    toPosition: 'Perawatan',
    transferDate: new Date(2024, 7, 20),
    effectiveDate: new Date(2024, 8, 1),
    reason: 'Mutasi jabatan sesuai keahlian baru yang dimiliki',
    status: 'rejected',
    approvedBy: 'Suryadi',
    approvedDate: new Date(2024, 7, 22),
    notes: 'Masih dibutuhkan di posisi pemanen, akan dipertimbangkan periode berikutnya',
    requestedBy: 'Suryadi',
    requestDate: new Date(2024, 7, 20)
  },
  {
    id: '6',
    employeeId: '1799234',
    employeeName: 'Indra Gunawan',
    fromDepartment: 'PT Socfindo Kebun AP',
    fromPosition: 'Mandor Panen',
    toDepartment: 'PT Socfindo Kebun HL',
    toPosition: 'Supervisor Pemanen',
    transferDate: new Date(2024, 8, 1),
    effectiveDate: new Date(2024, 8, 15),
    reason: 'Promosi dan rotasi ke kebun lain untuk pengembangan karir',
    status: 'completed',
    approvedBy: 'Yuni Astuti',
    approvedDate: new Date(2024, 8, 3),
    notes: 'Transfer dan promosi berhasil dilaksanakan, kinerja sangat baik',
    requestedBy: 'Yuni Astuti',
    requestDate: new Date(2024, 8, 1)
  },
  {
    id: '7',
    employeeId: '1792890',
    employeeName: 'Dedi Kurniawan',
    fromDepartment: 'Bangun Bandar',
    fromPosition: 'Operator Mesin',
    toDepartment: 'Bangun Bandar',
    toPosition: 'Mekanik',
    transferDate: new Date(2024, 9, 18),
    effectiveDate: new Date(2024, 10, 1),
    reason: 'Promosi jabatan berdasarkan sertifikasi dan keahlian teknis',
    status: 'approved',
    approvedBy: 'Hendra Gunawan',
    approvedDate: new Date(2024, 9, 20),
    notes: 'Telah menyelesaikan pelatihan mekanik dan mendapat sertifikasi',
    requestedBy: 'Hendra Gunawan',
    requestDate: new Date(2024, 9, 18)
  },
  {
    id: '8',
    employeeId: '1804234',
    employeeName: 'Wahyu Nugroho',
    fromDepartment: 'PT Socfindo Kebun AP',
    fromPosition: 'Operator Mesin',
    toDepartment: 'PT Socfindo Kebun NL',
    toPosition: 'Operator Mesin',
    transferDate: new Date(2024, 9, 8),
    effectiveDate: new Date(2024, 9, 22),
    reason: 'Kebutuhan operasional di kebun NL yang memerlukan operator berpengalaman',
    status: 'completed',
    approvedBy: 'Hendra Gunawan',
    approvedDate: new Date(2024, 9, 10),
    notes: 'Transfer untuk mendukung peningkatan kapasitas produksi di kebun NL',
    requestedBy: 'Wawan Kurniawan',
    requestDate: new Date(2024, 9, 8)
  },
  {
    id: '9',
    employeeId: '1810456',
    employeeName: 'Fajar Nugraha',
    fromDepartment: 'PT Socfindo Kebun HL',
    fromPosition: 'Operator Mesin',
    toDepartment: 'PT Socfindo Kebun HL',
    toPosition: 'Supervisor Maintenance',
    transferDate: new Date(2024, 9, 22),
    effectiveDate: new Date(2024, 10, 5),
    reason: 'Promosi ke posisi supervisor maintenance berdasarkan kompetensi dan kepemimpinan',
    status: 'pending',
    requestedBy: 'Hendra Gunawan',
    requestDate: new Date(2024, 9, 22)
  },
  {
    id: '10',
    employeeId: '1782634',
    employeeName: 'Siti Nurhaliza',
    fromDepartment: 'Head Office/Kantor Besar Medan',
    fromPosition: 'Admin',
    toDepartment: 'Head Office/Kantor Besar Medan',
    toPosition: 'Manajer Administrasi',
    transferDate: new Date(2024, 8, 5),
    effectiveDate: new Date(2024, 8, 20),
    reason: 'Promosi ke posisi manajerial berdasarkan kinerja dan pengalaman',
    status: 'completed',
    approvedBy: 'Yuni Astuti',
    approvedDate: new Date(2024, 8, 7),
    notes: 'Telah berhasil memimpin beberapa proyek administrasi penting',
    requestedBy: 'Yuni Astuti',
    requestDate: new Date(2024, 8, 5)
  },
  {
    id: '11',
    employeeId: '1801234',
    employeeName: 'Andi Wijaya',
    fromDepartment: 'Head Office/Kantor Besar Medan',
    fromPosition: 'Admin',
    toDepartment: 'Head Office/Kantor Besar Medan',
    toPosition: 'Manajer Keuangan',
    transferDate: new Date(2024, 9, 25),
    effectiveDate: new Date(2024, 10, 10),
    reason: 'Promosi dari admin ke manajer keuangan berdasarkan keahlian dan latar belakang pendidikan',
    status: 'pending',
    requestedBy: 'Yuni Astuti',
    requestDate: new Date(2024, 9, 25)
  },
  {
    id: '12',
    employeeId: '1805456',
    employeeName: 'Suryadi',
    fromDepartment: 'PT Socfindo Kebun HL',
    fromPosition: 'Mandor Panen',
    toDepartment: 'Head Office/Kantor Besar Medan',
    toPosition: 'Asisten Manajer',
    transferDate: new Date(2024, 8, 20),
    effectiveDate: new Date(2024, 9, 5),
    reason: 'Promosi dan transfer ke kantor pusat untuk posisi asisten manajer',
    status: 'approved',
    approvedBy: 'Yuni Astuti',
    approvedDate: new Date(2024, 8, 22),
    notes: 'Pengalaman lapangan yang luas menjadi nilai tambah untuk posisi koordinasi',
    requestedBy: 'Yuni Astuti',
    requestDate: new Date(2024, 8, 20)
  },
  {
    id: '13',
    employeeId: '1811678',
    employeeName: 'Wawan Kurniawan',
    fromDepartment: 'PT Socfindo Kebun NL',
    fromPosition: 'Mandor Panen',
    toDepartment: 'PT Socfindo Kebun NL',
    toPosition: 'Supervisor Pemanen',
    transferDate: new Date(2024, 9, 15),
    effectiveDate: new Date(2024, 10, 1),
    reason: 'Promosi berdasarkan pencapaian produktivitas kebun yang konsisten',
    status: 'approved',
    approvedBy: 'Yuni Astuti',
    approvedDate: new Date(2024, 9, 17),
    notes: 'Berhasil meningkatkan produktivitas tim panen sebesar 25%',
    requestedBy: 'Yuni Astuti',
    requestDate: new Date(2024, 9, 15)
  },
  {
    id: '14',
    employeeId: '1806678',
    employeeName: 'Eko Prasetyo',
    fromDepartment: 'PT Socfindo Kebun HL',
    fromPosition: 'Pemanen',
    toDepartment: 'PT Socfindo Kebun NL',
    toPosition: 'Perawatan',
    transferDate: new Date(2024, 7, 10),
    effectiveDate: new Date(2024, 7, 25),
    reason: 'Mutasi divisi dan jabatan sesuai kebutuhan kebun NL untuk tenaga perawatan',
    status: 'completed',
    approvedBy: 'Wawan Kurniawan',
    approvedDate: new Date(2024, 7, 12),
    notes: 'Mutasi berhasil, karyawan telah menjalani training perawatan tanaman',
    requestedBy: 'Wawan Kurniawan',
    requestDate: new Date(2024, 7, 10)
  },
  {
    id: '15',
    employeeId: '1767890',
    employeeName: 'Hendra Gunawan',
    fromDepartment: 'Head Office/Kantor Besar Medan',
    fromPosition: 'Mekanik',
    toDepartment: 'Head Office/Kantor Besar Medan',
    toPosition: 'Supervisor Maintenance',
    transferDate: new Date(2024, 8, 25),
    effectiveDate: new Date(2024, 9, 10),
    reason: 'Promosi ke supervisor maintenance untuk koordinasi perawatan alat di seluruh kebun',
    status: 'completed',
    approvedBy: 'Michael Tanjung',
    approvedDate: new Date(2024, 8, 27),
    notes: 'Kompetensi teknis yang mumpuni dan pengalaman lebih dari 6 tahun',
    requestedBy: 'Michael Tanjung',
    requestDate: new Date(2024, 8, 25)
  }
];

export function EmployeeTransfer() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('transfers');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transferTypeFilter, setTransferTypeFilter] = useState<'all' | TransferType>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<EmployeeTransfer | null>(null);

  const [transfers, setTransfers] = useState<EmployeeTransfer[]>(EMPLOYEE_TRANSFERS);

  // Form state untuk add transfer
  const [transferDate, setTransferDate] = useState<Date | undefined>();
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    fromDepartment: '',
    fromPosition: '',
    toDepartment: '',
    toPosition: '',
    reason: '',
    notes: ''
  });

  // State untuk employee combobox
  const [openEmployeeCombobox, setOpenEmployeeCombobox] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Filter transfers
  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch = 
      transfer.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || 
      transfer.fromDepartment === departmentFilter || 
      transfer.toDepartment === departmentFilter;
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesTransferType = transferTypeFilter === 'all' || getTransferType(transfer) === transferTypeFilter;
    return matchesSearch && matchesDepartment && matchesStatus && matchesTransferType;
  });

  // Get unique departments
  const departments = Array.from(new Set([
    ...transfers.map(t => t.fromDepartment),
    ...transfers.map(t => t.toDepartment)
  ]));

  // Statistics
  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === 'pending').length,
    approved: transfers.filter(t => t.status === 'approved').length,
    rejected: transfers.filter(t => t.status === 'rejected').length,
    completed: transfers.filter(t => t.status === 'completed').length,
    positionTransfer: transfers.filter(t => getTransferType(t) === 'position').length,
    divisionTransfer: transfers.filter(t => getTransferType(t) === 'division').length,
    bothTransfer: transfers.filter(t => getTransferType(t) === 'both').length
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Disetujui', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      rejected: { label: 'Ditolak', variant: 'destructive' as const, icon: XCircle },
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

  const handleViewDetails = (transfer: EmployeeTransfer) => {
    setSelectedTransfer(transfer);
    setIsViewDialogOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      fromDepartment: '',
      fromPosition: '',
      toDepartment: '',
      toPosition: '',
      reason: '',
      notes: ''
    });
    setTransferDate(undefined);
    setEffectiveDate(undefined);
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

  const handleAddTransfer = () => {
    // Logic untuk menambah mutasi
    console.log('Add transfer:', formData);
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Filter untuk history (completed dan rejected)
  const historyTransfers = transfers.filter(t => t.status === 'completed' || t.status === 'rejected');

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
                        onSubmit={(data) => {
                          // Generate new transfer ID (using timestamp for uniqueness)
                          const newId = `transfer-${Date.now()}`;
                          
                          // Create new transfer object
                          const newTransfer: EmployeeTransfer = {
                            id: newId,
                            employeeId: data.employeeId,
                            employeeName: data.employeeName,
                            fromDepartment: data.fromDepartment,
                            fromPosition: data.fromPosition,
                            toDepartment: data.toDepartment,
                            toPosition: data.toPosition,
                            transferDate: data.transferDate || new Date(),
                            effectiveDate: data.effectiveDate || new Date(),
                            reason: data.reason,
                            status: 'pending',
                            notes: data.notes || '',
                            requestedBy: user?.fullName || user?.username || 'Admin',
                            requestDate: new Date()
                          };
                          
                          // Add to transfers array
                          setTransfers(prev => [newTransfer, ...prev]);
                          
                          // Show success notification
                          toast.success('Mutasi Berhasil Ditambahkan', {
                            description: `Mutasi ${data.employeeName} telah berhasil dicatat dengan status Menunggu.`
                          });
                          
                          // Close dialog
                          setIsAddDialogOpen(false);
                        }}
                        onCancel={() => {
                          setIsAddDialogOpen(false);
                          resetForm();
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
                  {filteredTransfers.map((transfer) => {
                    const transferType = getTransferType(transfer);
                    return (
                    <tr key={transfer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            {transfer.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="mb-0 truncate">{transfer.employeeName}</p>
                            <p className="text-xs text-muted-foreground truncate">{transfer.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {getTransferTypeBadge(transferType)}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          <p className="mb-0 text-sm">{transfer.fromDepartment}</p>
                          <p className="text-xs text-muted-foreground">{transfer.fromPosition}</p>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          {transfer.toDepartment !== transfer.fromDepartment && (
                            <p className="mb-0 text-sm text-cyan-700">{transfer.toDepartment}</p>
                          )}
                          {transfer.toPosition !== transfer.fromPosition && (
                            <p className={`text-sm mb-0 ${transfer.toDepartment !== transfer.fromDepartment ? '' : 'text-purple-700'}`}>
                              {transfer.toPosition}
                            </p>
                          )}
                          {transfer.toDepartment === transfer.fromDepartment && transfer.toPosition !== transfer.fromPosition && (
                            <p className="text-xs text-muted-foreground">{transfer.toDepartment}</p>
                          )}
                          {transfer.toPosition === transfer.fromPosition && transfer.toDepartment !== transfer.fromDepartment && (
                            <p className="text-xs text-muted-foreground">{transfer.toPosition}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm">
                        {format(transfer.effectiveDate, 'dd MMM yyyy', { locale: id })}
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
                Menampilkan {filteredTransfers.length} dari {transfers.length} mutasi
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Sebelumnya</Button>
                <Button variant="outline" size="sm">Berikutnya</Button>
              </div>
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
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Disetujui Oleh</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {historyTransfers.filter((transfer) => {
                    const matchesSearch = 
                      transfer.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      transfer.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesDepartment = departmentFilter === 'all' || 
                      transfer.fromDepartment === departmentFilter || 
                      transfer.toDepartment === departmentFilter;
                    const matchesTransferType = transferTypeFilter === 'all' || getTransferType(transfer) === transferTypeFilter;
                    return matchesSearch && matchesDepartment && matchesTransferType;
                  }).map((transfer) => {
                    const transferType = getTransferType(transfer);
                    return (
                    <tr key={transfer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            {transfer.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="mb-0 truncate">{transfer.employeeName}</p>
                            <p className="text-xs text-muted-foreground truncate">{transfer.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {getTransferTypeBadge(transferType)}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          <p className="mb-0 text-sm">{transfer.fromDepartment}</p>
                          <p className="text-xs text-muted-foreground">{transfer.fromPosition}</p>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          {transfer.toDepartment !== transfer.fromDepartment && (
                            <p className="mb-0 text-sm text-cyan-700">{transfer.toDepartment}</p>
                          )}
                          {transfer.toPosition !== transfer.fromPosition && (
                            <p className={`text-sm mb-0 ${transfer.toDepartment !== transfer.fromDepartment ? '' : 'text-purple-700'}`}>
                              {transfer.toPosition}
                            </p>
                          )}
                          {transfer.toDepartment === transfer.fromDepartment && transfer.toPosition !== transfer.fromPosition && (
                            <p className="text-xs text-muted-foreground">{transfer.toDepartment}</p>
                          )}
                          {transfer.toPosition === transfer.fromPosition && transfer.toDepartment !== transfer.fromDepartment && (
                            <p className="text-xs text-muted-foreground">{transfer.toPosition}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm">
                        {format(transfer.effectiveDate, 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          <p className="mb-0 text-sm">{transfer.approvedBy || '-'}</p>
                          {transfer.approvedDate && (
                            <p className="text-xs text-muted-foreground">
                              {format(transfer.approvedDate, 'dd MMM yyyy', { locale: id })}
                            </p>
                          )}
                        </div>
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Sebelumnya</Button>
                <Button variant="outline" size="sm">Berikutnya</Button>
              </div>
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
            const isDivisionChanged = selectedTransfer.fromDepartment !== selectedTransfer.toDepartment;
            const isPositionChanged = selectedTransfer.fromPosition !== selectedTransfer.toPosition;
            
            return (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                  {selectedTransfer.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3>{selectedTransfer.employeeName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTransfer.employeeId}</p>
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
                    <p className="mb-1">{selectedTransfer.fromDepartment}</p>
                    <p className="text-sm text-muted-foreground mb-0">{selectedTransfer.fromPosition}</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-muted-foreground mb-2">Ke</p>
                    <p className={`mb-1 ${isDivisionChanged ? 'text-green-700' : ''}`}>
                      {selectedTransfer.toDepartment}
                      {!isDivisionChanged && ' (Tetap)'}
                    </p>
                    <p className={`text-sm mb-0 ${isPositionChanged ? 'text-green-700' : 'text-muted-foreground'}`}>
                      {selectedTransfer.toPosition}
                      {!isPositionChanged && ' (Tetap)'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Tanggal Pengajuan</p>
                    <p className="mb-0">{format(selectedTransfer.requestDate, 'dd MMMM yyyy', { locale: id })}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Tanggal Efektif</p>
                    <p className="mb-0">{format(selectedTransfer.effectiveDate, 'dd MMMM yyyy', { locale: id })}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Diajukan Oleh</p>
                    <p className="mb-0">{selectedTransfer.requestedBy}</p>
                  </div>
                  {selectedTransfer.approvedBy && (
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Disetujui Oleh</p>
                      <p className="mb-0">{selectedTransfer.approvedBy}</p>
                      {selectedTransfer.approvedDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(selectedTransfer.approvedDate, 'dd MMMM yyyy', { locale: id })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-2">Alasan Mutasi</p>
                  <p className="mb-0">{selectedTransfer.reason}</p>
                </div>

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
    </div>
  );
}