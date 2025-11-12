import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PremiLaporan = () => {
  const [activeTab, setActiveTab] = useState('summary-premi');
  const [selectedPeriode, setSelectedPeriode] = useState('periode-1');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // =====================================================
  // TAB 1: SUMMARY PREMI
  // =====================================================
  const summaryPremi = [
    {
      id: '1',
      employee_id: 'emp-001',
      nama_karyawan: 'Ahmad Sutanto',
      jabatan: 'Pemanen',
      total_hari_kerja: 6,
      total_janjang: 720,
      rata_rata_basis: 1.45,
      premi_lebih_basis: 230000,
      premi_siap: 210000,
      premi_overtime: 0,
      total_premi_kotor: 440000,
      total_denda: 5000,
      premi_netto: 435000
    },
    {
      id: '2',
      employee_id: 'emp-002',
      nama_karyawan: 'Siti Nurhaliza',
      jabatan: 'Pemanen',
      total_hari_kerja: 6,
      total_janjang: 570,
      rata_rata_basis: 1.44,
      premi_lebih_basis: 195000,
      premi_siap: 210000,
      premi_overtime: 0,
      total_premi_kotor: 405000,
      total_denda: 3000,
      premi_netto: 402000
    },
    {
      id: '3',
      employee_id: 'mdr-001',
      nama_karyawan: 'Budi Setiawan',
      jabatan: 'Mandor Panen',
      total_hari_kerja: 6,
      jumlah_bawahan: 15,
      total_premi_bawahan: 6250000,
      persentase_premi: 12,
      total_premi_kotor: 750000,
      total_denda: 0,
      premi_netto: 750000
    },
    {
      id: '4',
      employee_id: 'ker-001',
      nama_karyawan: 'Candra Wijaya',
      jabatan: 'Kerani Buah',
      total_hari_kerja: 6,
      jumlah_area_karyawan: 20,
      total_premi_area: 8750000,
      persentase_premi: 10,
      total_premi_kotor: 875000,
      total_denda: 0,
      premi_netto: 875000
    }
  ];

  // =====================================================
  // TAB 2: DETAIL PANEN
  // =====================================================
  const detailPanen = [
    {
      id: '1',
      tanggal: '2024-12-01',
      employee_id: 'emp-001',
      nama_karyawan: 'Ahmad Sutanto',
      blok: 'SL-001 - Blok I',
      tipe_hari: 'hari_biasa',
      janjang_dipanen: 120,
      basis_janjang: 84,
      basis_dicapai: 1.43,
      premi_lebih_basis: 38000,
      premi_siap: 35000,
      premi_overtime: 0,
      total_premi: 73000
    },
    {
      id: '2',
      tanggal: '2024-12-01',
      employee_id: 'emp-002',
      nama_karyawan: 'Siti Nurhaliza',
      blok: 'SL-002 - Blok II',
      tipe_hari: 'hari_biasa',
      janjang_dipanen: 95,
      basis_janjang: 66,
      basis_dicapai: 1.44,
      premi_lebih_basis: 32000,
      premi_siap: 35000,
      premi_overtime: 0,
      total_premi: 67000
    },
    {
      id: '3',
      tanggal: '2024-12-02',
      employee_id: 'emp-001',
      nama_karyawan: 'Ahmad Sutanto',
      blok: 'SL-001 - Blok I',
      tipe_hari: 'hari_biasa',
      janjang_dipanen: 125,
      basis_janjang: 84,
      basis_dicapai: 1.49,
      premi_lebih_basis: 42000,
      premi_siap: 35000,
      premi_overtime: 0,
      total_premi: 77000
    },
    {
      id: '4',
      tanggal: '2024-12-03',
      employee_id: 'emp-001',
      nama_karyawan: 'Ahmad Sutanto',
      blok: 'SL-001 - Blok I',
      tipe_hari: 'minggu_libur',
      janjang_dipanen: 270,
      basis_janjang: 84,
      basis_dicapai: 3.21,
      premi_lebih_basis: 85000,
      premi_siap: 65000,
      premi_overtime: 75000,
      total_premi: 225000
    }
  ];

  // =====================================================
  // TAB 3: DETAIL DENDA
  // =====================================================
  const detailDenda = [
    {
      id: '1',
      tanggal: '2024-12-01',
      employee_id: 'emp-001',
      nama_karyawan: 'Ahmad Sutanto',
      kode_denda: 'G',
      nama_pelanggaran: 'Gagang Panjang tidak dipotong rapat',
      jumlah: 3,
      nilai_satuan: 1000,
      total_denda: 3000,
      dikenakan_oleh: 'Candra Wijaya'
    },
    {
      id: '2',
      tanggal: '2024-12-02',
      employee_id: 'emp-001',
      nama_karyawan: 'Ahmad Sutanto',
      kode_denda: 'M3',
      nama_pelanggaran: 'Brondolan tinggal di potongan gagang',
      jumlah: 2,
      nilai_satuan: 1000,
      total_denda: 2000,
      dikenakan_oleh: 'Candra Wijaya'
    },
    {
      id: '3',
      tanggal: '2024-12-01',
      employee_id: 'emp-002',
      nama_karyawan: 'Siti Nurhaliza',
      kode_denda: 'B1',
      nama_pelanggaran: 'Brondolan tidak dikutip bersih',
      jumlah: 2,
      nilai_satuan: 1000,
      total_denda: 2000,
      dikenakan_oleh: 'Candra Wijaya'
    },
    {
      id: '4',
      tanggal: '2024-12-03',
      employee_id: 'emp-002',
      nama_karyawan: 'Siti Nurhaliza',
      kode_denda: 'R',
      nama_pelanggaran: 'Rumpukan tidak disusun rapi',
      jumlah: 1,
      nilai_satuan: 1000,
      total_denda: 1000,
      dikenakan_oleh: 'Candra Wijaya'
    }
  ];

  // Aggregate denda by type
  const dendaByType = detailDenda.reduce((acc, item) => {
    const existing = acc.find((x) => x.kode === item.kode_denda);
    if (existing) {
      existing.jumlah += item.jumlah;
      existing.total += item.total_denda;
    } else {
      acc.push({
        kode: item.kode_denda,
        nama: item.nama_pelanggaran,
        jumlah: item.jumlah,
        total: item.total_denda
      });
    }
    return acc;
  }, [] as { kode: string; nama: string; jumlah: number; total: number }[]);

  // =====================================================
  // TAB 4: ANALISIS PRODUKTIVITAS
  // =====================================================
  const produktivitasBlok = [
    {
      blok_id: 'SL-001',
      nama_blok: 'Blok I',
      umur_tanaman: 14,
      basis_target: 250,
      basis_tercapai: 245,
      persentase_capaian: 98.0,
      total_karyawan: 12,
      rata_rata_basis_karyawan: 1.52,
      total_janjang: 2940,
      total_premi: 4850000,
      status: 'excellent'
    },
    {
      blok_id: 'SL-002',
      nama_blok: 'Blok II',
      umur_tanaman: 16,
      basis_target: 280,
      basis_tercapai: 275,
      persentase_capaian: 98.2,
      total_karyawan: 15,
      rata_rata_basis_karyawan: 1.47,
      total_janjang: 2750,
      total_premi: 5200000,
      status: 'excellent'
    },
    {
      blok_id: 'SL-003',
      nama_blok: 'Blok III',
      umur_tanaman: 18,
      basis_target: 300,
      basis_tercapai: 270,
      persentase_capaian: 90.0,
      total_karyawan: 18,
      rata_rata_basis_karyawan: 1.35,
      total_janjang: 2700,
      total_premi: 4650000,
      status: 'good'
    },
    {
      blok_id: 'SL-004',
      nama_blok: 'Blok Muda A',
      umur_tanaman: 5,
      basis_target: 150,
      basis_tercapai: 120,
      persentase_capaian: 80.0,
      total_karyawan: 8,
      rata_rata_basis_karyawan: 1.25,
      total_janjang: 2040,
      total_premi: 2450000,
      status: 'fair'
    }
  ];

  const chartDataProduktivitas = produktivitasBlok.map((item) => ({
    blok: item.nama_blok,
    target: item.basis_target,
    tercapai: item.basis_tercapai,
    persentase: item.persentase_capaian
  }));

  const chartDataPremiPerBlok = produktivitasBlok.map((item) => ({
    blok: item.nama_blok,
    premi: item.total_premi / 1000000 // Convert to million
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: React.ReactNode }> = {
      excellent: { variant: 'default', label: 'Excellent', icon: <TrendingUp className="h-3 w-3" /> },
      good: { variant: 'default', label: 'Good', icon: <TrendingUp className="h-3 w-3" /> },
      fair: { variant: 'secondary', label: 'Fair', icon: <Minus className="h-3 w-3" /> },
      poor: { variant: 'destructive', label: 'Poor', icon: <TrendingDown className="h-3 w-3" /> }
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status, icon: null };
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: localeId });
  };

  const exportToExcel = () => {
    alert('Export ke Excel - Fitur akan diimplementasikan');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laporan Premi Sawit</h1>
        <p className="text-muted-foreground">Analisis dan laporan premi panen TBS</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periode_filter">Periode</Label>
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="periode-1">Desember 2024 - Minggu 1</SelectItem>
                  <SelectItem value="periode-2">Desember 2024 - Minggu 2</SelectItem>
                  <SelectItem value="periode-3">Desember 2024 - Minggu 3</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_from">Dari Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !dateFrom && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PPP', { locale: localeId }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_to">Sampai Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !dateTo && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PPP', { locale: localeId }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blok_filter">Blok Kebun</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Semua blok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Blok</SelectItem>
                  <SelectItem value="SL-001">SL-001 - Blok I</SelectItem>
                  <SelectItem value="SL-002">SL-002 - Blok II</SelectItem>
                  <SelectItem value="SL-003">SL-003 - Blok III</SelectItem>
                  <SelectItem value="SL-004">SL-004 - Blok Muda A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <TabsTrigger value="summary-premi" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Summary Premi
            </TabsTrigger>
            <TabsTrigger value="detail-panen" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Detail Panen
            </TabsTrigger>
            <TabsTrigger value="detail-denda" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Detail Denda
            </TabsTrigger>
            <TabsTrigger value="analisis" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Analisis Produktivitas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* =====================================================
            TAB 1: SUMMARY PREMI
            ===================================================== */}
        <TabsContent value="summary-premi" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Karyawan</CardDescription>
                <CardTitle className="text-3xl">45</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Premi Kotor</CardDescription>
                <CardTitle className="text-3xl text-green-600">{formatCurrency(15750000)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Denda</CardDescription>
                <CardTitle className="text-3xl text-red-600">{formatCurrency(125000)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Premi Netto</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{formatCurrency(15625000)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ringkasan Premi Per Karyawan</CardTitle>
                  <CardDescription>Periode: Desember 2024 - Minggu 1</CardDescription>
                </div>
                <Button onClick={exportToExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead className="text-right">Hari Kerja</TableHead>
                    <TableHead className="text-right">Total Janjang</TableHead>
                    <TableHead className="text-right">Rata² Basis</TableHead>
                    <TableHead className="text-right">Premi Kotor</TableHead>
                    <TableHead className="text-right">Denda</TableHead>
                    <TableHead className="text-right">Premi Netto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryPremi.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.employee_id}</TableCell>
                      <TableCell className="font-medium">{item.nama_karyawan}</TableCell>
                      <TableCell>
                        <Badge variant={item.jabatan === 'Pemanen' ? 'secondary' : 'default'}>{item.jabatan}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.total_hari_kerja}</TableCell>
                      <TableCell className="text-right">
                        {item.jabatan === 'Pemanen' ? (
                          item.total_janjang
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.jabatan === 'Pemanen' ? (
                          <span className="font-semibold">{item.rata_rata_basis?.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-green-600">{formatCurrency(item.total_premi_kotor)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-red-600">{formatCurrency(item.total_denda)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-blue-600">{formatCurrency(item.premi_netto)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 2: DETAIL PANEN
            ===================================================== */}
        <TabsContent value="detail-panen" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detail Panen Harian</CardTitle>
                  <CardDescription>Rincian panen per hari per karyawan</CardDescription>
                </div>
                <Button onClick={exportToExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Blok</TableHead>
                    <TableHead>Tipe Hari</TableHead>
                    <TableHead className="text-right">Janjang</TableHead>
                    <TableHead className="text-right">Basis</TableHead>
                    <TableHead className="text-right">Premi Lebih</TableHead>
                    <TableHead className="text-right">Premi Siap</TableHead>
                    <TableHead className="text-right">Overtime</TableHead>
                    <TableHead className="text-right">Total Premi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailPanen.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.tanggal)}</TableCell>
                      <TableCell className="font-mono text-xs">{item.employee_id}</TableCell>
                      <TableCell className="font-medium">{item.nama_karyawan}</TableCell>
                      <TableCell>
                        <div className="text-xs">{item.blok}</div>
                      </TableCell>
                      <TableCell>
                        {item.tipe_hari === 'hari_biasa' && <Badge variant="secondary">Hari Biasa</Badge>}
                        {item.tipe_hari === 'jumat' && <Badge variant="secondary">Jumat</Badge>}
                        {item.tipe_hari === 'minggu_libur' && <Badge variant="default">Minggu/Libur</Badge>}
                      </TableCell>
                      <TableCell className="text-right">{item.janjang_dipanen}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold">{item.basis_dicapai.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">({item.basis_janjang})</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.premi_lebih_basis)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.premi_siap)}</TableCell>
                      <TableCell className="text-right">
                        {item.premi_overtime > 0 ? (
                          <span className="font-semibold text-green-600">{formatCurrency(item.premi_overtime)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-blue-600">{formatCurrency(item.total_premi)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 3: DETAIL DENDA
            ===================================================== */}
        <TabsContent value="detail-denda" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Denda Per Jenis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dendaByType.map((item) => (
                    <div key={item.kode} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {item.kode}
                        </Badge>
                        <div>
                          <div className="font-medium">{item.nama}</div>
                          <div className="text-xs text-muted-foreground">{item.jumlah} kejadian</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{formatCurrency(item.total)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="font-bold">Total Semua Denda</div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(dendaByType.reduce((sum, item) => sum + item.total, 0))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Denda</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dendaByType}
                      dataKey="total"
                      nameKey="kode"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.kode}: ${formatCurrency(entry.total)}`}
                    >
                      {dendaByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detail Denda Per Karyawan</CardTitle>
                  <CardDescription>Rincian denda yang diterima karyawan</CardDescription>
                </div>
                <Button onClick={exportToExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Jenis Pelanggaran</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Nilai Satuan</TableHead>
                    <TableHead className="text-right">Total Denda</TableHead>
                    <TableHead>Dikenakan Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailDenda.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.tanggal)}</TableCell>
                      <TableCell className="font-mono text-xs">{item.employee_id}</TableCell>
                      <TableCell className="font-medium">{item.nama_karyawan}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {item.kode_denda}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">{item.nama_pelanggaran}</TableCell>
                      <TableCell className="text-right">{item.jumlah}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.nilai_satuan)}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-red-600">{formatCurrency(item.total_denda)}</span>
                      </TableCell>
                      <TableCell>{item.dikenakan_oleh}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 4: ANALISIS PRODUKTIVITAS
            ===================================================== */}
        <TabsContent value="analisis" className="space-y-4">
          {/* Chart Section */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Produktivitas Blok - Target vs Tercapai</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataProduktivitas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="blok" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="target" fill="#94a3b8" name="Target Basis" />
                    <Bar dataKey="tercapai" fill="#3b82f6" name="Tercapai Basis" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Premi Per Blok (Juta Rupiah)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartDataPremiPerBlok}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="blok" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `Rp ${value.toFixed(2)}M`} />
                    <Legend />
                    <Line type="monotone" dataKey="premi" stroke="#10b981" strokeWidth={2} name="Total Premi (Jt)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analisis Produktivitas Per Blok</CardTitle>
                  <CardDescription>Performance blok kebun berdasarkan target dan pencapaian</CardDescription>
                </div>
                <Button onClick={exportToExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Blok</TableHead>
                    <TableHead className="text-right">Umur</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Tercapai</TableHead>
                    <TableHead className="text-right">% Capaian</TableHead>
                    <TableHead className="text-right">Karyawan</TableHead>
                    <TableHead className="text-right">Rata² Basis</TableHead>
                    <TableHead className="text-right">Total Janjang</TableHead>
                    <TableHead className="text-right">Total Premi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produktivitasBlok.map((item) => (
                    <TableRow key={item.blok_id}>
                      <TableCell className="font-mono">{item.blok_id}</TableCell>
                      <TableCell className="font-medium">{item.nama_blok}</TableCell>
                      <TableCell className="text-right">{item.umur_tanaman} tahun</TableCell>
                      <TableCell className="text-right">{item.basis_target}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">{item.basis_tercapai}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-bold',
                            item.persentase_capaian >= 95 ? 'text-green-600' : item.persentase_capaian >= 80 ? 'text-blue-600' : 'text-orange-600'
                          )}
                        >
                          {item.persentase_capaian.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{item.total_karyawan}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">{item.rata_rata_basis_karyawan.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right">{item.total_janjang.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-blue-600">{formatCurrency(item.total_premi)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiLaporan;
