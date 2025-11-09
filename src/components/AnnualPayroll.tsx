/**
 * ==========================================================================
 * ANNUAL PAYROLL - PENGGAJIAN TAHUNAN (THR & BONUS)
 * ==========================================================================
 * 
 * Komponen untuk manajemen penggajian tahunan yang mencakup:
 * - THR (Tunjangan Hari Raya): 1x Upah Pokok + Catu Beras
 * - Bonus Tahunan: Upah Pokok x Multiplier (default 3 bulan)
 * - Surut: Selisih kenaikan upah pokok tahunan
 * 
 * #AnnualPayroll #THR #Bonus #Surut #YearlyCompensation
 * 
 * FITUR:
 * - Perhitungan otomatis THR, Bonus, dan Surut (terpisah dalam tab)
 * - Tab khusus untuk THR (Gaji + Catu Beras)
 * - Tab khusus untuk Bonus Tahunan
 * - Tab khusus untuk Surut (Selisih kenaikan upah)
 * - Modifikasi multiplier bonus dan persentase kenaikan upah
 * - Filter berdasarkan tahun
 * - Statistik dan ringkasan pembayaran
 * - Export data
 * - Status pembayaran dan approval
 * 
 * @author Sistem Payroll Team
 * @version 2.0.0
 * @since 2024-10-27
 * ==========================================================================
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Search,
  Gift,
  Award,
  Users,
  DollarSign,
  FileDown,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Calendar,
  Package,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MASTER_EMPLOYEES } from '../shared/employeeData';
import { calculatePPh21ForTHR } from '../shared/taxBpjsData';

/**
 * Interface untuk data penggajian tahunan
 */
interface AnnualPayrollData {
  id: string;
  employeeId: string;
  employeeName: string;
  division: string;
  position: string;
  baseSalary: number;
  riceAllowance: number; // Catu beras/natura
  meatAllowance: number; // Uang daging
  showAllowance: number; // Uang tontonan
  thr: number;
  pph21Thr: number; // PPh 21 untuk THR
  thrNet: number; // THR setelah dipotong pajak
  bonus: number;
  total: number;
  status: 'pending' | 'approved' | 'paid';
  year: number;
  paidDate?: string;
}

/**
 * Nilai default catu beras berdasarkan level jabatan
 */
const RICE_ALLOWANCE_BY_LEVEL: Record<string, number> = {
  'Karyawan': 200000,
  'Pegawai': 300000,
  'PKWT': 200000,
  'Staff': 400000,
  'default': 200000,
};

/**
 * Nilai default uang daging berdasarkan level jabatan
 */
const MEAT_ALLOWANCE_BY_LEVEL: Record<string, number> = {
  'Karyawan': 300000,
  'Pegawai': 400000,
  'PKWT': 300000,
  'Staff': 500000,
  'default': 300000,
};

/**
 * Nilai default uang tontonan berdasarkan level jabatan
 */
const SHOW_ALLOWANCE_BY_LEVEL: Record<string, number> = {
  'Karyawan': 250000,
  'Pegawai': 350000,
  'PKWT': 250000,
  'Staff': 450000,
  'default': 250000,
};

/**
 * Main component - Annual Payroll
 */
export function AnnualPayroll() {
  const [activeTab, setActiveTab] = useState('thr');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [bonusMultiplier, setBonusMultiplier] = useState(3);
  const [wageIncreasePercentage, setWageIncreasePercentage] = useState(6); // Default 6%
  const [realizationMonth, setRealizationMonth] = useState(3); // Default Maret
  const [selectedEmployee, setSelectedEmployee] = useState<AnnualPayrollData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<AnnualPayrollData>>({});

  // State untuk progress bar
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'thr' | 'bonus' | 'surut' | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  /**
   * Generate data penggajian tahunan dari master employee
   */
  const annualPayrollData = useMemo(() => {
    return MASTER_EMPLOYEES.filter(emp => emp.status === 'active').map(emp => {
      // Tentukan level jabatan untuk catu beras
      let positionLevel = 'default';
      if (emp.position.includes('Staff') || emp.position.includes('Asisten')) {
        positionLevel = 'Staff';
      } else if (emp.position.includes('Mandor') || emp.position.includes('Operator')) {
        positionLevel = 'Pegawai';
      } else if (emp.employmentType === 'contract') {
        positionLevel = 'PKWT';
      } else {
        positionLevel = 'Karyawan';
      }

      const riceAllowance = RICE_ALLOWANCE_BY_LEVEL[positionLevel];
      const meatAllowance = MEAT_ALLOWANCE_BY_LEVEL[positionLevel];
      const showAllowance = SHOW_ALLOWANCE_BY_LEVEL[positionLevel];
      const thr = emp.baseSalary + riceAllowance + meatAllowance + showAllowance;
      const pph21Thr = calculatePPh21ForTHR(thr); // Hitung PPh 21 untuk THR
      const thrNet = thr - pph21Thr; // THR bersih setelah pajak
      const bonus = emp.baseSalary * bonusMultiplier;
      const total = thrNet + bonus; // Total menggunakan THR bersih

      return {
        id: `annual-${emp.id}-${selectedYear}`,
        employeeId: emp.employeeId,
        employeeName: emp.fullName,
        division: emp.division,
        position: emp.position,
        baseSalary: emp.baseSalary,
        riceAllowance,
        meatAllowance,
        showAllowance,
        thr,
        pph21Thr,
        thrNet,
        bonus,
        total,
        status: 'pending' as const,
        year: selectedYear,
      };
    });
  }, [selectedYear, bonusMultiplier]);

  /**
   * Filter data berdasarkan search term
   */
  const filteredData = useMemo(() => {
    if (!searchTerm) return annualPayrollData;

    const term = searchTerm.toLowerCase();
    return annualPayrollData.filter(
      item =>
        item.employeeId.toLowerCase().includes(term) ||
        item.employeeName.toLowerCase().includes(term) ||
        item.division.toLowerCase().includes(term) ||
        item.position.toLowerCase().includes(term)
    );
  }, [annualPayrollData, searchTerm]);

  /**
   * Generate data Surut (selisih kenaikan upah)
   */
  const surutData = useMemo(() => {
    return filteredData.map(emp => {
      const previousYearSalary = emp.baseSalary; // Gaji tahun sebelumnya (2025)
      const newYearSalary = emp.baseSalary * (1 + wageIncreasePercentage / 100); // Gaji tahun baru (2026)
      const previousYearNatura = emp.riceAllowance; // Natura tahun sebelumnya
      const newYearNatura = emp.riceAllowance * (1 + wageIncreasePercentage / 100); // Natura tahun baru (dengan kenaikan)
      
      // Selisih per bulan (gaji + natura)
      const salaryDifference = newYearSalary - previousYearSalary;
      const naturaDifference = newYearNatura - previousYearNatura;
      const monthlyDifference = salaryDifference + naturaDifference;
      
      // Total surut bruto (selisih × bulan realisasi)
      const surutBruto = monthlyDifference * realizationMonth;
      
      // PPh21 untuk surut (5% dari surut bruto)
      const pph21Surut = calculatePPh21ForTHR(surutBruto);
      
      // Surut bersih setelah dipotong PPh21
      const surutBersih = surutBruto - pph21Surut;

      return {
        ...emp,
        previousYearSalary,
        newYearSalary,
        previousYearNatura,
        newYearNatura,
        salaryDifference,
        naturaDifference,
        monthlyDifference,
        surutBruto,
        pph21Surut,
        surutBersih,
      };
    });
  }, [filteredData, wageIncreasePercentage, realizationMonth]);

  /**
   * Kalkulasi statistik
   */
  const statistics = useMemo(() => {
    const totalEmployees = filteredData.length;
    const totalTHR = filteredData.reduce((sum, item) => sum + item.thr, 0);
    const totalPPh21Thr = filteredData.reduce((sum, item) => sum + item.pph21Thr, 0);
    const totalTHRNet = filteredData.reduce((sum, item) => sum + item.thrNet, 0);
    const totalBonus = filteredData.reduce((sum, item) => sum + item.bonus, 0);
    const totalPayout = filteredData.reduce((sum, item) => sum + item.total, 0);
    const totalRiceAllowance = filteredData.reduce((sum, item) => sum + item.riceAllowance, 0);
    const totalMeatAllowance = filteredData.reduce((sum, item) => sum + item.meatAllowance, 0);
    const totalShowAllowance = filteredData.reduce((sum, item) => sum + item.showAllowance, 0);
    const totalBaseSalary = filteredData.reduce((sum, item) => sum + item.baseSalary, 0);
    
    // Statistik Surut
    const totalMonthlyDifference = surutData.reduce((sum, item) => sum + item.monthlyDifference, 0);
    const totalSurutBruto = surutData.reduce((sum, item) => sum + item.surutBruto, 0);
    const totalPPh21Surut = surutData.reduce((sum, item) => sum + item.pph21Surut, 0);
    const totalSurutBersih = surutData.reduce((sum, item) => sum + item.surutBersih, 0);
    const totalNewYearSalary = surutData.reduce((sum, item) => sum + item.newYearSalary, 0);
    const totalNewYearNatura = surutData.reduce((sum, item) => sum + item.newYearNatura, 0);

    return {
      totalEmployees,
      totalTHR,
      totalPPh21Thr,
      totalTHRNet,
      totalBonus,
      totalPayout,
      totalRiceAllowance,
      totalMeatAllowance,
      totalShowAllowance,
      totalBaseSalary,
      totalMonthlyDifference,
      totalSurutBruto,
      totalPPh21Surut,
      totalSurutBersih,
      totalNewYearSalary,
      totalNewYearNatura,
    };
  }, [filteredData, surutData]);

  /**
   * Format currency IDR
   */
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Handle view detail
   */
  const handleViewDetail = (employee: AnnualPayrollData) => {
    setSelectedEmployee(employee);
    setShowDetailDialog(true);
  };

  /**
   * Handle edit
   */
  const handleEdit = (employee: AnnualPayrollData) => {
    setSelectedEmployee(employee);
    setEditFormData(employee);
    setShowEditDialog(true);
  };

  /**
   * Handle approve payment
   */
  const handleApprove = (employeeId: string) => {
    toast.success(`Pembayaran tahunan untuk karyawan ${employeeId} telah disetujui`);
  };

  /**
   * Handle process payment
   */
  const handleProcessPayment = async (type: 'thr' | 'bonus' | 'surut') => {
    const labels = { thr: 'THR', bonus: 'Bonus', surut: 'Surut' };
    const label = labels[type];
    const totalEmployees = filteredData.length;

    if (totalEmployees === 0) {
      toast.error('Tidak ada karyawan yang akan diproses');
      return;
    }

    setIsProcessing(true);
    setProcessingType(type);
    setProcessingProgress(0);
    setProcessedCount(0);

    toast.info(`Memulai pemrosesan ${label} untuk ${totalEmployees} karyawan...`);

    // Simulasi proses pembayaran per karyawan
    for (let i = 0; i < totalEmployees; i++) {
      // Simulasi delay untuk setiap karyawan (100ms per karyawan)
      await new Promise(resolve => setTimeout(resolve, 100));

      const progress = ((i + 1) / totalEmployees) * 100;
      setProcessingProgress(progress);
      setProcessedCount(i + 1);
    }

    // Selesai
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingType(null);
      setProcessingProgress(0);
      setProcessedCount(0);
      toast.success(`Pembayaran ${label} untuk ${totalEmployees} karyawan berhasil diproses!`);
    }, 500);
  };

  /**
   * Handle export data
   */
  const handleExport = (type: 'thr' | 'bonus' | 'surut') => {
    const labels = { thr: 'THR', bonus: 'Bonus', surut: 'Surut' };
    const label = labels[type];
    toast.success(`Data ${label} berhasil diekspor`);
  };

  /**
   * Status badge component
   */
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'outline' as const, icon: Clock, label: 'Menunggu' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Disetujui' },
      paid: { variant: 'default' as const, icon: CheckCircle, label: 'Terbayar' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#0a1929] mb-2">Penggajian Tahunan</h1>
        <p className="text-sm text-[#4a5568]">
          Kelola THR dan Bonus karyawan untuk tahun {selectedYear}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-3">
          <TabsTrigger value="thr" className="gap-2">
            <Gift size={16} />
            THR
          </TabsTrigger>
          <TabsTrigger value="bonus" className="gap-2">
            <Award size={16} />
            Bonus
          </TabsTrigger>
          <TabsTrigger value="surut" className="gap-2">
            <TrendingUp size={16} />
            Surut
          </TabsTrigger>
        </TabsList>

        {/* Progress Bar */}
        {isProcessing && processingType && (
          <Card className="border-2 border-blue-500 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={16} className="animate-spin text-blue-600" />
                Memproses {processingType === 'thr' ? 'THR' : processingType === 'bonus' ? 'Bonus' : 'Surut'}...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4a5568]">
                  Karyawan yang diproses: <span className="font-semibold text-blue-600">{processedCount}</span> dari {filteredData.length}
                </span>
                <span className="font-semibold text-blue-600">
                  {Math.round(processingProgress)}%
                </span>
              </div>
              <Progress value={processingProgress} className="h-3" />
              <p className="text-xs text-[#6b7280]">
                Mohon tunggu, sistem sedang memproses pembayaran untuk setiap karyawan...
              </p>
            </CardContent>
          </Card>
        )}

        {/* TAB CONTENT: THR */}
        <TabsContent value="thr" className="space-y-6 mt-0">
          {/* Statistics Cards - THR */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <Users size={16} className="text-[#3b82f6]" />
                  Total Karyawan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#0a1929]">{statistics.totalEmployees}</div>
                <p className="text-xs text-[#6b7280] mt-1">Karyawan aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <Package size={16} className="text-[#f59e0b]" />
                  Total Catu Beras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#0a1929] break-words">{formatIDR(statistics.totalRiceAllowance)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Natura beras</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#06b6d4]" />
                  Total Uang Daging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#0a1929] break-words">{formatIDR(statistics.totalMeatAllowance)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Natura daging</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#8b5cf6]" />
                  Total Uang Tontonan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#0a1929] break-words">{formatIDR(statistics.totalShowAllowance)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Natura tontonan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <Gift size={16} className="text-[#10b981]" />
                  Total THR Kotor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#10b981] break-words">{formatIDR(statistics.totalTHR)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Sebelum pajak</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#ef4444]" />
                  Total PPh 21
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#ef4444] break-words">{formatIDR(statistics.totalPPh21Thr)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Potongan pajak</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#10b981]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#10b981]" />
                  Total THR Bersih
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#10b981] break-words">{formatIDR(statistics.totalTHRNet)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Setelah pajak</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Actions - THR */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9fa6bc]" size={18} />
                    <Input
                      type="text"
                      placeholder="Cari karyawan, NIK, divisi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Year Filter */}
                  <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                    <SelectTrigger className="w-[140px]">
                      <Calendar size={16} className="mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">Tahun 2023</SelectItem>
                      <SelectItem value="2024">Tahun 2024</SelectItem>
                      <SelectItem value="2025">Tahun 2025</SelectItem>
                      <SelectItem value="2026">Tahun 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExport('thr')} disabled={isProcessing}>
                    <FileDown size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={() => handleProcessPayment('thr')}
                    className="bg-[#10b981] hover:bg-[#059669]"
                    disabled={isProcessing}
                  >
                    {isProcessing && processingType === 'thr' ? (
                      <>
                        <Clock size={16} className="mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Proses THR
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Table - THR */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">NIK</TableHead>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead className="text-right">Upah Pokok</TableHead>
                      <TableHead className="text-right">Catu Beras</TableHead>
                      <TableHead className="text-right">Uang Daging</TableHead>
                      <TableHead className="text-right">Uang Tontonan</TableHead>
                      <TableHead className="text-right">THR Total</TableHead>
                      <TableHead className="text-right">PPh 21</TableHead>
                      <TableHead className="text-right">THR Bersih</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-8 text-[#6b7280]">
                          Tidak ada data karyawan ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono text-sm">{employee.employeeId}</TableCell>
                          <TableCell>
                            <div className="font-medium text-[#0a1929]">{employee.employeeName}</div>
                          </TableCell>
                          <TableCell className="text-sm text-[#4a5568]">{employee.division}</TableCell>
                          <TableCell className="text-sm text-[#4a5568]">{employee.position}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatIDR(employee.baseSalary)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#f59e0b]">
                            {formatIDR(employee.riceAllowance)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#06b6d4]">
                            {formatIDR(employee.meatAllowance)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#8b5cf6]">
                            {formatIDR(employee.showAllowance)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium text-[#10b981]">
                            {formatIDR(employee.thr)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#ef4444]">
                            {formatIDR(employee.pph21Thr)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-semibold text-[#10b981]">
                            {formatIDR(employee.thrNet)}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={employee.status} />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(employee)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(employee.employeeId)}
                              >
                                <CheckCircle size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Info */}
              {filteredData.length > 0 && (
                <div className="mt-4 text-sm text-[#6b7280]">
                  Menampilkan {filteredData.length} dari {annualPayrollData.length} karyawan
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB CONTENT: BONUS */}
        <TabsContent value="bonus" className="space-y-6 mt-0">
          {/* Statistics Cards - Bonus */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <Users size={16} className="text-[#3b82f6]" />
                  Total Karyawan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#0a1929]">{statistics.totalEmployees}</div>
                <p className="text-xs text-[#6b7280] mt-1">Karyawan aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#10b981]" />
                  Total Gaji Pokok
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#0a1929] break-words">{formatIDR(statistics.totalBaseSalary)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Dasar perhitungan bonus</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <Award size={16} className="text-[#8b5cf6]" />
                  Multiplier Bonus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#0a1929]">{bonusMultiplier}x</div>
                <p className="text-xs text-[#6b7280] mt-1">Pengali bonus saat ini</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#f59e0b]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <Award size={16} className="text-[#f59e0b]" />
                  Total Bonus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#f59e0b] break-words">{formatIDR(statistics.totalBonus)}</div>
                <p className="text-xs text-[#6b7280] mt-1">{bonusMultiplier}x Gaji Pokok</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Actions - Bonus */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9fa6bc]" size={18} />
                    <Input
                      type="text"
                      placeholder="Cari karyawan, NIK, divisi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Year Filter */}
                  <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                    <SelectTrigger className="w-[140px]">
                      <Calendar size={16} className="mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">Tahun 2023</SelectItem>
                      <SelectItem value="2024">Tahun 2024</SelectItem>
                      <SelectItem value="2025">Tahun 2025</SelectItem>
                      <SelectItem value="2026">Tahun 2026</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Bonus Multiplier */}
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <Label className="text-sm whitespace-nowrap">Bonus:</Label>
                    <Select value={bonusMultiplier.toString()} onValueChange={(val) => setBonusMultiplier(parseInt(val))}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bulan Upah</SelectItem>
                        <SelectItem value="2">2 Bulan Upah</SelectItem>
                        <SelectItem value="3">3 Bulan Upah</SelectItem>
                        <SelectItem value="4">4 Bulan Upah</SelectItem>
                        <SelectItem value="6">6 Bulan Upah</SelectItem>
                        <SelectItem value="12">12 Bulan Upah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExport('bonus')} disabled={isProcessing}>
                    <FileDown size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={() => handleProcessPayment('bonus')}
                    className="bg-[#f59e0b] hover:bg-[#d97706]"
                    disabled={isProcessing}
                  >
                    {isProcessing && processingType === 'bonus' ? (
                      <>
                        <Clock size={16} className="mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Proses Bonus
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Table - Bonus */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">NIK</TableHead>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead className="text-right">Upah Pokok</TableHead>
                      <TableHead className="text-center">Multiplier</TableHead>
                      <TableHead className="text-right">Bonus Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-[#6b7280]">
                          Tidak ada data karyawan ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono text-sm">{employee.employeeId}</TableCell>
                          <TableCell>
                            <div className="font-medium text-[#0a1929]">{employee.employeeName}</div>
                          </TableCell>
                          <TableCell className="text-sm text-[#4a5568]">{employee.division}</TableCell>
                          <TableCell className="text-sm text-[#4a5568]">{employee.position}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatIDR(employee.baseSalary)}
                          </TableCell>
                          <TableCell className="text-center font-medium text-[#8b5cf6]">
                            {bonusMultiplier}x
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-semibold text-[#f59e0b]">
                            {formatIDR(employee.bonus)}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={employee.status} />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(employee)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(employee.employeeId)}
                              >
                                <CheckCircle size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Info */}
              {filteredData.length > 0 && (
                <div className="mt-4 text-sm text-[#6b7280]">
                  Menampilkan {filteredData.length} dari {annualPayrollData.length} karyawan
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB CONTENT: SURUT */}
        <TabsContent value="surut" className="space-y-6 mt-0">
          {/* Statistics Cards - Surut */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <Users size={16} className="text-[#3b82f6]" />
                  Total Karyawan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#0a1929]">{statistics.totalEmployees}</div>
                <p className="text-xs text-[#6b7280] mt-1">Karyawan aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#8b5cf6]" />
                  Kenaikan Upah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#0a1929]">{wageIncreasePercentage}%</div>
                <p className="text-xs text-[#6b7280] mt-1">Persentase kenaikan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#f59e0b]" />
                  Selisih Per Bulan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#f59e0b] break-words">{formatIDR(statistics.totalMonthlyDifference)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Gaji + Natura</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#10b981]" />
                  Surut Bruto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#10b981] break-words">{formatIDR(statistics.totalSurutBruto)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Sebelum pajak</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#ef4444]" />
                  PPh 21
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#ef4444] break-words">{formatIDR(statistics.totalPPh21Surut)}</div>
                <p className="text-xs text-[#6b7280] mt-1">Potongan pajak</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#3b82f6]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#4a5568] flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#3b82f6]" />
                  Surut Bersih
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-[#3b82f6] break-words">{formatIDR(statistics.totalSurutBersih)}</div>
                <p className="text-xs text-[#6b7280] mt-1">{realizationMonth} bulan realisasi</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Actions - Surut */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9fa6bc]" size={18} />
                    <Input
                      type="text"
                      placeholder="Cari karyawan, NIK, divisi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Year Filter */}
                  <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                    <SelectTrigger className="w-[140px]">
                      <Calendar size={16} className="mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">Tahun 2023</SelectItem>
                      <SelectItem value="2024">Tahun 2024</SelectItem>
                      <SelectItem value="2025">Tahun 2025</SelectItem>
                      <SelectItem value="2026">Tahun 2026</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Wage Increase Percentage */}
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <Label className="text-sm whitespace-nowrap">Kenaikan:</Label>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={wageIncreasePercentage}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setWageIncreasePercentage(0);
                            return;
                          }
                          const numValue = parseFloat(value);
                          // Validasi: hanya terima angka valid 0-100 dengan max 1 digit desimal
                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                            // Batasi ke 1 digit desimal
                            const rounded = Math.round(numValue * 10) / 10;
                            setWageIncreasePercentage(rounded);
                          }
                        }}
                        className="pr-8"
                        placeholder="6.0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[#6b7280] pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Realization Month */}
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <Label className="text-sm whitespace-nowrap">Realisasi:</Label>
                    <Select value={realizationMonth.toString()} onValueChange={(val) => setRealizationMonth(parseInt(val))}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Januari (1 bln)</SelectItem>
                        <SelectItem value="2">Februari (2 bln)</SelectItem>
                        <SelectItem value="3">Maret (3 bln)</SelectItem>
                        <SelectItem value="4">April (4 bln)</SelectItem>
                        <SelectItem value="5">Mei (5 bln)</SelectItem>
                        <SelectItem value="6">Juni (6 bln)</SelectItem>
                        <SelectItem value="7">Juli (7 bln)</SelectItem>
                        <SelectItem value="8">Agustus (8 bln)</SelectItem>
                        <SelectItem value="9">September (9 bln)</SelectItem>
                        <SelectItem value="10">Oktober (10 bln)</SelectItem>
                        <SelectItem value="11">November (11 bln)</SelectItem>
                        <SelectItem value="12">Desember (12 bln)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExport('surut')} disabled={isProcessing}>
                    <FileDown size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={() => handleProcessPayment('surut')}
                    className="bg-[#3b82f6] hover:bg-[#2563eb]"
                    disabled={isProcessing}
                  >
                    {isProcessing && processingType === 'surut' ? (
                      <>
                        <Clock size={16} className="mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Proses Surut
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Info Box */}
              <div className="mb-4 p-4 bg-[#eff6ff] border border-[#3b82f6] rounded-lg">
                <h4 className="font-medium text-[#0a1929] mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#3b82f6]" />
                  Informasi Perhitungan Surut
                </h4>
                <p className="text-sm text-[#4a5568] leading-relaxed">
                  Surut adalah pembayaran selisih kenaikan gaji pokok karyawan hasil kenaikan upah pokok tahunan berdasarkan aturan pemerintah. 
                  Dengan kenaikan upah <span className="font-semibold text-[#3b82f6]">{wageIncreasePercentage}%</span> pada tahun <span className="font-semibold">{selectedYear}</span>, 
                  dan realisasi pada bulan <span className="font-semibold text-[#3b82f6]">
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][realizationMonth - 1]}
                  </span>, 
                  maka karyawan berhak mendapat selisih kenaikan untuk <span className="font-semibold text-[#3b82f6]">{realizationMonth} bulan</span>.
                </p>
              </div>

              {/* Table - Surut */}
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">NIK</TableHead>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead className="text-right">Gaji {selectedYear - 1}</TableHead>
                      <TableHead className="text-right">Natura {selectedYear - 1}</TableHead>
                      <TableHead className="text-right">Gaji {selectedYear}</TableHead>
                      <TableHead className="text-right">Natura {selectedYear}</TableHead>
                      <TableHead className="text-right">Selisih/Bulan</TableHead>
                      <TableHead className="text-center">Bulan</TableHead>
                      <TableHead className="text-right">Surut Bruto</TableHead>
                      <TableHead className="text-right">PPh 21</TableHead>
                      <TableHead className="text-right">Surut Bersih</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surutData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={15} className="text-center py-8 text-[#6b7280]">
                          Tidak ada data karyawan ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      surutData.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono text-sm">{employee.employeeId}</TableCell>
                          <TableCell>
                            <div className="font-medium text-[#0a1929]">{employee.employeeName}</div>
                          </TableCell>
                          <TableCell className="text-sm text-[#4a5568]">{employee.division}</TableCell>
                          <TableCell className="text-sm text-[#4a5568]">{employee.position}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatIDR(employee.previousYearSalary)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#f59e0b]">
                            {formatIDR(employee.previousYearNatura)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#10b981]">
                            {formatIDR(employee.newYearSalary)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#10b981]">
                            {formatIDR(employee.newYearNatura)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#f59e0b]">
                            {formatIDR(employee.monthlyDifference)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-medium">
                              {realizationMonth}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-semibold text-[#10b981]">
                            {formatIDR(employee.surutBruto)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-[#ef4444]">
                            {formatIDR(employee.pph21Surut)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-semibold text-[#3b82f6]">
                            {formatIDR(employee.surutBersih)}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={employee.status} />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(employee)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(employee.employeeId)}
                              >
                                <CheckCircle size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Info */}
              {surutData.length > 0 && (
                <div className="mt-4 text-sm text-[#6b7280]">
                  Menampilkan {surutData.length} dari {annualPayrollData.length} karyawan
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'thr' && 'Detail THR Karyawan'}
              {activeTab === 'bonus' && 'Detail Bonus Karyawan'}
              {activeTab === 'surut' && 'Detail Surut Karyawan'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'thr' && 'Rincian perhitungan Tunjangan Hari Raya (THR)'}
              {activeTab === 'bonus' && 'Rincian perhitungan Bonus Tahunan'}
              {activeTab === 'surut' && 'Rincian perhitungan Surut (Selisih Kenaikan Upah)'}
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[#6b7280]">NIK</Label>
                  <div className="font-mono text-sm mt-1">{selectedEmployee.employeeId}</div>
                </div>
                <div>
                  <Label className="text-xs text-[#6b7280]">Nama Karyawan</Label>
                  <div className="font-medium mt-1">{selectedEmployee.employeeName}</div>
                </div>
                <div>
                  <Label className="text-xs text-[#6b7280]">Divisi</Label>
                  <div className="text-sm mt-1">{selectedEmployee.division}</div>
                </div>
                <div>
                  <Label className="text-xs text-[#6b7280]">Jabatan</Label>
                  <div className="text-sm mt-1">{selectedEmployee.position}</div>
                </div>
              </div>

              {/* KONTEN UNTUK TAB THR */}
              {activeTab === 'thr' && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Rincian Perhitungan THR</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b7280]">Upah Pokok</span>
                      <span className="font-mono">{formatIDR(selectedEmployee.baseSalary)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b7280]">Catu Beras (Natura)</span>
                      <span className="font-mono">{formatIDR(selectedEmployee.riceAllowance)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b7280]">Uang Daging (Natura)</span>
                      <span className="font-mono">{formatIDR(selectedEmployee.meatAllowance)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b7280]">Uang Tontonan (Natura)</span>
                      <span className="font-mono">{formatIDR(selectedEmployee.showAllowance)}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#10b981]">THR Kotor</span>
                        <span className="font-mono font-medium text-[#10b981]">
                          {formatIDR(selectedEmployee.thr)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1">
                        (Upah Pokok + Catu Beras + Uang Daging + Uang Tontonan)
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#ef4444]">PPh 21 THR (5%)</span>
                        <span className="font-mono text-[#ef4444]">
                          - {formatIDR(selectedEmployee.pph21Thr)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1">
                        Potongan pajak THR
                      </p>
                    </div>
                    
                    <div className="border-t pt-3 bg-[#f0fdf4] -mx-6 px-6 py-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#10b981]">THR Bersih</span>
                        <span className="font-mono font-semibold text-[#10b981] text-lg">
                          {formatIDR(selectedEmployee.thrNet)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1">
                        Jumlah yang diterima karyawan setelah dipotong pajak
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* KONTEN UNTUK TAB BONUS */}
              {activeTab === 'bonus' && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Rincian Perhitungan Bonus</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b7280]">Upah Pokok</span>
                      <span className="font-mono">{formatIDR(selectedEmployee.baseSalary)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b7280]">Multiplier Bonus</span>
                      <span className="font-mono">{bonusMultiplier}x</span>
                    </div>
                    
                    <div className="border-t pt-3 bg-[#fef3c7] -mx-6 px-6 py-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#f59e0b]">Bonus Tahunan</span>
                        <span className="font-mono font-semibold text-[#f59e0b] text-lg">
                          {formatIDR(selectedEmployee.bonus)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1">
                        ({bonusMultiplier}x Upah Pokok)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* KONTEN UNTUK TAB SURUT */}
              {activeTab === 'surut' && (() => {
                const surutEmployee = surutData.find(emp => emp.employeeId === selectedEmployee.employeeId);
                if (!surutEmployee) return null;
                
                return (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Rincian Perhitungan Surut</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-[#f1f5f9] -mx-6 px-6 py-3">
                        <div className="text-xs text-[#6b7280] mb-2">Gaji Tahun Sebelumnya (2025)</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#4a5568]">Upah Pokok</span>
                          <span className="font-mono">{formatIDR(surutEmployee.previousYearSalary)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-[#4a5568]">Natura</span>
                          <span className="font-mono">{formatIDR(surutEmployee.previousYearNatura)}</span>
                        </div>
                      </div>

                      <div className="bg-[#f1f5f9] -mx-6 px-6 py-3">
                        <div className="text-xs text-[#6b7280] mb-2">Gaji Tahun Baru (2026)</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#4a5568]">Upah Pokok</span>
                          <span className="font-mono">{formatIDR(surutEmployee.newYearSalary)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-[#4a5568]">Natura</span>
                          <span className="font-mono">{formatIDR(surutEmployee.newYearNatura)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-[#6b7280]">Persentase Kenaikan</span>
                        <span className="font-mono font-medium text-[#3b82f6]">{wageIncreasePercentage}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6b7280]">Selisih per Bulan</span>
                        <span className="font-mono">{formatIDR(surutEmployee.monthlyDifference)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6b7280]">Bulan Realisasi</span>
                        <span className="font-mono">{realizationMonth} bulan</span>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[#3b82f6]">Surut Bruto</span>
                          <span className="font-mono font-medium text-[#3b82f6]">
                            {formatIDR(surutEmployee.surutBruto)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] mt-1">
                          (Selisih per Bulan × {realizationMonth} bulan)
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#ef4444]">PPh 21 Surut (5%)</span>
                          <span className="font-mono text-[#ef4444]">
                            - {formatIDR(surutEmployee.pph21Surut)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] mt-1">
                          Potongan pajak surut
                        </p>
                      </div>
                      
                      <div className="border-t pt-3 bg-[#dbeafe] -mx-6 px-6 py-3 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[#3b82f6]">Surut Bersih</span>
                          <span className="font-mono font-semibold text-[#3b82f6] text-lg">
                            {formatIDR(surutEmployee.surutBersih)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] mt-1">
                          Jumlah yang diterima karyawan setelah dipotong pajak
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-[#6b7280]">Status Pembayaran</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedEmployee.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-[#6b7280]">Tahun</Label>
                    <div className="font-medium mt-1">{selectedEmployee.year}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
            <Button onClick={() => {
              if (selectedEmployee) {
                handleApprove(selectedEmployee.employeeId);
                setShowDetailDialog(false);
              }
            }}>
              <CheckCircle size={16} className="mr-2" />
              Setujui Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
