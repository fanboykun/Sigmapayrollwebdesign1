import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Edit, Trash2, Save, Calculator, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const PremiPenggajian = () => {
  const [activeTab, setActiveTab] = useState('panen-harian');

  // =====================================================
  // TAB 1: INPUT PANEN HARIAN
  // =====================================================
  const [panenHarian, setPanenHarian] = useState([
    {
      id: '1',
      tanggal: '2024-12-01',
      employee_id: 'emp-001',
      nama_karyawan: 'Ahmad Sutanto',
      blok_id: 'SL-001',
      nama_blok: 'Blok I',
      tipe_hari: 'hari_biasa',
      janjang_dipanen: 120,
      basis_janjang: 84,
      basis_dicapai: 1.43,
      kategori_premi: 'siap_1_basis',
      mandor: 'Budi Setiawan',
      kerani: 'Candra Wijaya',
      status: 'approved'
    },
    {
      id: '2',
      tanggal: '2024-12-01',
      employee_id: 'emp-002',
      nama_karyawan: 'Siti Nurhaliza',
      blok_id: 'SL-002',
      nama_blok: 'Blok II',
      tipe_hari: 'hari_biasa',
      janjang_dipanen: 95,
      basis_janjang: 66,
      basis_dicapai: 1.44,
      kategori_premi: 'siap_1_basis',
      mandor: 'Budi Setiawan',
      kerani: 'Candra Wijaya',
      status: 'submitted'
    }
  ]);

  const [isDialogPanenOpen, setIsDialogPanenOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  // =====================================================
  // TAB 2: INPUT DENDA
  // =====================================================
  const [dendaHarian, setDendaHarian] = useState([
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
      dikenakan_oleh: 'Candra Wijaya',
      keterangan: 'Pelanggaran berulang'
    },
    {
      id: '2',
      tanggal: '2024-12-01',
      employee_id: 'emp-002',
      nama_karyawan: 'Siti Nurhaliza',
      kode_denda: 'B1',
      nama_pelanggaran: 'Brondolan tidak dikutip bersih',
      jumlah: 2,
      nilai_satuan: 1000,
      total_denda: 2000,
      dikenakan_oleh: 'Candra Wijaya',
      keterangan: ''
    }
  ]);

  const [isDialogDendaOpen, setIsDialogDendaOpen] = useState(false);

  const masterDenda = [
    { kode: 'A', nama: 'Buah Mentah', satuan: 'per_janjang', nilai: 10000 },
    { kode: 'G', nama: 'Gagang Panjang tidak dipotong rapat', satuan: 'per_janjang', nilai: 1000 },
    { kode: 'S', nama: 'Buah masak tinggal di pokok', satuan: 'per_janjang', nilai: 2000 },
    { kode: 'M1', nama: 'Buah mentah diperam di ancak', satuan: 'per_janjang', nilai: 10000 },
    { kode: 'M2', nama: 'Buah tinggal di piringan', satuan: 'per_janjang', nilai: 2000 },
    { kode: 'M3', nama: 'Brondolan tinggal di potongan gagang', satuan: 'per_janjang', nilai: 1000 },
    { kode: 'B1', nama: 'Brondolan tidak dikutip bersih', satuan: 'per_pokok', nilai: 1000 },
    { kode: 'B2', nama: 'Brondolan dibuang (>= 20 butir)', satuan: 'per_pokok', nilai: 3000 },
    { kode: 'R', nama: 'Rumpukan tidak disusun rapi', satuan: 'per_rumpukan', nilai: 1000 },
    { kode: 'C', nama: 'Cabang sengleh', satuan: 'per_pokok', nilai: 1000 },
    { kode: 'ABSENT', nama: 'Pulang sebelum 7 jam kerja', satuan: 'per_hari', nilai: 10000 }
  ];

  // =====================================================
  // TAB 3: PERHITUNGAN PREMI
  // =====================================================
  const [periodePerhitungan, setPeriodePerhitungan] = useState([
    {
      id: '1',
      periode_nama: 'Desember 2024 - Minggu 1',
      tanggal_mulai: '2024-12-01',
      tanggal_akhir: '2024-12-07',
      total_karyawan: 45,
      total_premi_kotor: 15750000,
      total_denda: 125000,
      total_premi_netto: 15625000,
      status: 'calculated',
      calculated_at: '2024-12-08 10:30:00'
    },
    {
      id: '2',
      periode_nama: 'Desember 2024 - Minggu 2',
      tanggal_mulai: '2024-12-08',
      tanggal_akhir: '2024-12-14',
      total_karyawan: 47,
      total_premi_kotor: 16200000,
      total_denda: 98000,
      total_premi_netto: 16102000,
      status: 'reviewed',
      calculated_at: '2024-12-15 09:15:00'
    }
  ]);

  const [isDialogPerhitunganOpen, setIsDialogPerhitunganOpen] = useState(false);

  // =====================================================
  // TAB 4: ADJUSTMENT BLOK
  // =====================================================
  const [adjustmentBlok, setAdjustmentBlok] = useState([
    {
      id: '1',
      periode_id: '1',
      periode_nama: 'Desember 2024 - Minggu 1',
      blok_dari: 'SL-001 - Blok I',
      blok_ke: 'SL-002 - Blok II',
      basis_target: 250,
      basis_tercapai: 220,
      persentase_kekurangan: 12.0,
      jumlah_adjustment: 30,
      keterangan: 'Adjustment karena cuaca hujan',
      created_by: 'Manager Estate',
      created_at: '2024-12-08 11:00:00'
    }
  ]);

  const [isDialogAdjustmentOpen, setIsDialogAdjustmentOpen] = useState(false);

  // =====================================================
  // TAB 5: APPROVAL & INTEGRASI
  // =====================================================
  const [approvalList, setApprovalList] = useState([
    {
      id: '1',
      periode_nama: 'Desember 2024 - Minggu 1',
      tanggal_mulai: '2024-12-01',
      tanggal_akhir: '2024-12-07',
      total_premi_netto: 15625000,
      status: 'approved',
      approval_level_1: { nama: 'Candra Wijaya', jabatan: 'Kerani Buah', status: 'approved', tanggal: '2024-12-08 14:00:00' },
      approval_level_2: { nama: 'Budi Setiawan', jabatan: 'Mandor Panen', status: 'approved', tanggal: '2024-12-08 15:30:00' },
      approval_level_3: { nama: 'Hendra Gunawan', jabatan: 'Group Manager', status: 'approved', tanggal: '2024-12-08 16:00:00' },
      integrated: true,
      integrated_at: '2024-12-08 16:30:00'
    },
    {
      id: '2',
      periode_nama: 'Desember 2024 - Minggu 2',
      tanggal_mulai: '2024-12-08',
      tanggal_akhir: '2024-12-14',
      total_premi_netto: 16102000,
      status: 'pending_approval_2',
      approval_level_1: { nama: 'Candra Wijaya', jabatan: 'Kerani Buah', status: 'approved', tanggal: '2024-12-15 10:00:00' },
      approval_level_2: { nama: 'Budi Setiawan', jabatan: 'Mandor Panen', status: 'pending', tanggal: null },
      approval_level_3: { nama: 'Hendra Gunawan', jabatan: 'Group Manager', status: 'pending', tanggal: null },
      integrated: false,
      integrated_at: null
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      submitted: { variant: 'default', label: 'Submitted' },
      approved: { variant: 'default', label: 'Approved' },
      processed: { variant: 'default', label: 'Processed' },
      calculated: { variant: 'default', label: 'Calculated' },
      reviewed: { variant: 'default', label: 'Reviewed' },
      pending_approval_1: { variant: 'secondary', label: 'Pending Level 1' },
      pending_approval_2: { variant: 'secondary', label: 'Pending Level 2' },
      pending_approval_3: { variant: 'secondary', label: 'Pending Level 3' },
      rejected: { variant: 'destructive', label: 'Rejected' }
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getApprovalIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'rejected') return <XCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: localeId });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Premi Kebun - Penggajian</h1>
        <p className="text-muted-foreground">Transaksi dan perhitungan premi panen TBS</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <TabsTrigger value="panen-harian" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Input Panen Harian
            </TabsTrigger>
            <TabsTrigger value="input-denda" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Input Denda
            </TabsTrigger>
            <TabsTrigger value="perhitungan" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Perhitungan Premi
            </TabsTrigger>
            <TabsTrigger value="adjustment" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Adjustment Blok
            </TabsTrigger>
            <TabsTrigger value="approval" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Approval & Integrasi
            </TabsTrigger>
          </TabsList>
        </div>

        {/* =====================================================
            TAB 1: INPUT PANEN HARIAN
            ===================================================== */}
        <TabsContent value="panen-harian" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Input Panen Harian</CardTitle>
                  <CardDescription>Input data panen harian per karyawan</CardDescription>
                </div>
                <Dialog open={isDialogPanenOpen} onOpenChange={setIsDialogPanenOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Data Panen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Tambah Data Panen Harian</DialogTitle>
                      <DialogDescription>Input data panen harian karyawan</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tanggal">Tanggal Panen</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !selectedDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP', { locale: localeId }) : <span>Pilih tanggal</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipe_hari">Tipe Hari</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe hari" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hari_biasa">Hari Biasa (7 jam)</SelectItem>
                              <SelectItem value="jumat">Jumat (5 jam)</SelectItem>
                              <SelectItem value="minggu_libur">Minggu/Libur (Overtime)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employee">Karyawan</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih karyawan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="emp-001">Ahmad Sutanto</SelectItem>
                              <SelectItem value="emp-002">Siti Nurhaliza</SelectItem>
                              <SelectItem value="emp-003">Budi Santoso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="blok">Blok Kebun</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih blok" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SL-001">SL-001 - Blok I (Umur 14 thn)</SelectItem>
                              <SelectItem value="SL-002">SL-002 - Blok II (Umur 16 thn)</SelectItem>
                              <SelectItem value="SL-003">SL-003 - Blok III (Umur 18 thn)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="janjang">Janjang Dipanen</Label>
                          <Input id="janjang" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="basis_janjang">Basis Janjang</Label>
                          <Input id="basis_janjang" type="number" placeholder="Auto" disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="basis_dicapai">Basis Dicapai</Label>
                          <Input id="basis_dicapai" type="number" placeholder="Auto" disabled />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mandor">Mandor</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih mandor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mdr-001">Budi Setiawan</SelectItem>
                              <SelectItem value="mdr-002">Agus Prasetyo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kerani">Kerani Buah</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kerani" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ker-001">Candra Wijaya</SelectItem>
                              <SelectItem value="ker-002">Dedi Hermawan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <Textarea id="keterangan" placeholder="Keterangan tambahan (opsional)" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogPanenOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={() => setIsDialogPanenOpen(false)}>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Blok</TableHead>
                    <TableHead>Tipe Hari</TableHead>
                    <TableHead className="text-right">Janjang</TableHead>
                    <TableHead className="text-right">Basis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Mandor</TableHead>
                    <TableHead>Kerani</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {panenHarian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(new Date(item.tanggal), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nama_karyawan}</div>
                          <div className="text-xs text-muted-foreground">{item.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.blok_id}</div>
                          <div className="text-xs text-muted-foreground">{item.nama_blok}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.tipe_hari === 'hari_biasa' && 'Hari Biasa'}
                        {item.tipe_hari === 'jumat' && 'Jumat'}
                        {item.tipe_hari === 'minggu_libur' && 'Minggu/Libur'}
                      </TableCell>
                      <TableCell className="text-right">{item.janjang_dipanen}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-medium">{item.basis_dicapai.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">({item.basis_janjang} janjang)</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.kategori_premi === 'siap_1_basis' && <Badge variant="default">1 Basis</Badge>}
                        {item.kategori_premi === 'siap_2_basis' && <Badge variant="default">2 Basis</Badge>}
                        {item.kategori_premi === 'siap_3_basis' && <Badge variant="default">3 Basis</Badge>}
                      </TableCell>
                      <TableCell>{item.mandor}</TableCell>
                      <TableCell>{item.kerani}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 2: INPUT DENDA
            ===================================================== */}
        <TabsContent value="input-denda" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Input Denda & Sanksi</CardTitle>
                  <CardDescription>Input denda/sanksi yang diterima karyawan</CardDescription>
                </div>
                <Dialog open={isDialogDendaOpen} onOpenChange={setIsDialogDendaOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Denda
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Tambah Denda/Sanksi</DialogTitle>
                      <DialogDescription>Input denda atau sanksi untuk karyawan</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tanggal_denda">Tanggal</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !selectedDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP', { locale: localeId }) : <span>Pilih tanggal</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee_denda">Karyawan</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih karyawan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="emp-001">Ahmad Sutanto</SelectItem>
                              <SelectItem value="emp-002">Siti Nurhaliza</SelectItem>
                              <SelectItem value="emp-003">Budi Santoso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jenis_denda">Jenis Pelanggaran</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis pelanggaran" />
                          </SelectTrigger>
                          <SelectContent>
                            {masterDenda.map((denda) => (
                              <SelectItem key={denda.kode} value={denda.kode}>
                                {denda.kode} - {denda.nama} ({formatCurrency(denda.nilai)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="jumlah_denda">Jumlah</Label>
                          <Input id="jumlah_denda" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nilai_satuan_denda">Nilai Satuan</Label>
                          <Input id="nilai_satuan_denda" type="number" placeholder="Auto" disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="total_denda">Total Denda</Label>
                          <Input id="total_denda" type="number" placeholder="Auto" disabled />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dikenakan_oleh">Dikenakan Oleh</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pengawas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ker-001">Candra Wijaya (Kerani Buah)</SelectItem>
                            <SelectItem value="mnt-001">Eko Prasetyo (Mantri Recolte)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="keterangan_denda">Keterangan</Label>
                        <Textarea id="keterangan_denda" placeholder="Keterangan tambahan" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogDendaOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={() => setIsDialogDendaOpen(false)}>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Jenis Pelanggaran</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Nilai Satuan</TableHead>
                    <TableHead className="text-right">Total Denda</TableHead>
                    <TableHead>Dikenakan Oleh</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dendaHarian.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(new Date(item.tanggal), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nama_karyawan}</div>
                          <div className="text-xs text-muted-foreground">{item.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.kode_denda}</Badge>
                      </TableCell>
                      <TableCell>{item.nama_pelanggaran}</TableCell>
                      <TableCell className="text-right">{item.jumlah}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.nilai_satuan)}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-red-600">{formatCurrency(item.total_denda)}</span>
                      </TableCell>
                      <TableCell>{item.dikenakan_oleh}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 3: PERHITUNGAN PREMI
            ===================================================== */}
        <TabsContent value="perhitungan" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Perhitungan Premi Batch</CardTitle>
                  <CardDescription>Kalkulasi premi per periode/minggu</CardDescription>
                </div>
                <Dialog open={isDialogPerhitunganOpen} onOpenChange={setIsDialogPerhitunganOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Calculator className="mr-2 h-4 w-4" />
                      Hitung Premi Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Buat Perhitungan Premi Baru</DialogTitle>
                      <DialogDescription>Tentukan periode perhitungan premi</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="periode_nama">Nama Periode</Label>
                        <Input id="periode_nama" placeholder="Contoh: Desember 2024 - Minggu 3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tanggal_mulai_periode">Tanggal Mulai</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>Pilih tanggal mulai</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tanggal_akhir_periode">Tanggal Akhir</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>Pilih tanggal akhir</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                        <p className="text-sm font-medium">Proses Perhitungan:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Mengambil semua data panen dalam periode</li>
                          <li>Menghitung basis dicapai per karyawan</li>
                          <li>Menghitung premi lebih basis</li>
                          <li>Menghitung premi siap (1/2/3 basis)</li>
                          <li>Menghitung premi overtime (jika berlaku)</li>
                          <li>Menghitung premi jabatan (Mandor I, Mandor Panen, Kerani)</li>
                          <li>Mengurangi denda yang diterima</li>
                        </ul>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogPerhitunganOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={() => setIsDialogPerhitunganOpen(false)}>
                        <Calculator className="mr-2 h-4 w-4" />
                        Mulai Hitung
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Akhir</TableHead>
                    <TableHead className="text-right">Karyawan</TableHead>
                    <TableHead className="text-right">Premi Kotor</TableHead>
                    <TableHead className="text-right">Denda</TableHead>
                    <TableHead className="text-right">Premi Netto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dihitung</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodePerhitungan.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.periode_nama}</TableCell>
                      <TableCell>{format(new Date(item.tanggal_mulai), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                      <TableCell>{format(new Date(item.tanggal_akhir), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                      <TableCell className="text-right">{item.total_karyawan}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-green-600">{formatCurrency(item.total_premi_kotor)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-red-600">{formatCurrency(item.total_denda)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-blue-600">{formatCurrency(item.total_premi_netto)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">{formatDate(item.calculated_at)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Lihat Detail">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Hapus">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 4: ADJUSTMENT BLOK
            ===================================================== */}
        <TabsContent value="adjustment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Adjustment Basis Antar Blok</CardTitle>
                  <CardDescription>Transfer basis dari blok kurang produktif ke blok lebih produktif</CardDescription>
                </div>
                <Dialog open={isDialogAdjustmentOpen} onOpenChange={setIsDialogAdjustmentOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Adjustment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Buat Adjustment Basis Antar Blok</DialogTitle>
                      <DialogDescription>Transfer basis dari blok dengan kekurangan target</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="periode_adj">Periode Perhitungan</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih periode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Desember 2024 - Minggu 1</SelectItem>
                            <SelectItem value="2">Desember 2024 - Minggu 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="blok_dari">Blok Sumber (Kurang Produktif)</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih blok" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SL-001">SL-001 - Blok I</SelectItem>
                              <SelectItem value="SL-002">SL-002 - Blok II</SelectItem>
                              <SelectItem value="SL-003">SL-003 - Blok III</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="blok_ke">Blok Tujuan (Lebih Produktif)</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih blok" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SL-001">SL-001 - Blok I</SelectItem>
                              <SelectItem value="SL-002">SL-002 - Blok II</SelectItem>
                              <SelectItem value="SL-003">SL-003 - Blok III</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="basis_target">Basis Target</Label>
                          <Input id="basis_target" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="basis_tercapai">Basis Tercapai</Label>
                          <Input id="basis_tercapai" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="persentase_kekurangan">% Kekurangan</Label>
                          <Input id="persentase_kekurangan" type="number" placeholder="Auto" disabled />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jumlah_adj">Jumlah Adjustment (Basis)</Label>
                        <Input id="jumlah_adj" type="number" placeholder="Auto calculated" />
                      </div>
                      <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                        <p className="text-sm font-medium">Formula Adjustment:</p>
                        <p className="text-xs text-muted-foreground">
                          Persentase Kekurangan = (Target - Tercapai) / Target × 100%
                          <br />
                          Adjustment = Persentase Kekurangan × Basis Blok Tujuan
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="keterangan_adj">Keterangan</Label>
                        <Textarea id="keterangan_adj" placeholder="Alasan adjustment" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogAdjustmentOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={() => setIsDialogAdjustmentOpen(false)}>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Adjustment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Blok Sumber</TableHead>
                    <TableHead>Blok Tujuan</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Tercapai</TableHead>
                    <TableHead className="text-right">% Kurang</TableHead>
                    <TableHead className="text-right">Adjustment</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustmentBlok.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.periode_nama}</TableCell>
                      <TableCell>{item.blok_dari}</TableCell>
                      <TableCell>{item.blok_ke}</TableCell>
                      <TableCell className="text-right">{item.basis_target}</TableCell>
                      <TableCell className="text-right">{item.basis_tercapai}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-red-600">{item.persentase_kekurangan.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-blue-600">+{item.jumlah_adjustment}</span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.keterangan}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.created_by}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(item.created_at)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 5: APPROVAL & INTEGRASI
            ===================================================== */}
        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval & Integrasi ke Payroll</CardTitle>
              <CardDescription>Workflow approval 3 level dan integrasi ke sistem payroll</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {approvalList.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.periode_nama}</CardTitle>
                          <CardDescription>
                            {format(new Date(item.tanggal_mulai), 'dd MMM', { locale: localeId })} -{' '}
                            {format(new Date(item.tanggal_akhir), 'dd MMM yyyy', { locale: localeId })}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(item.total_premi_netto)}</div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Approval Level 1 */}
                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="mt-1">{getApprovalIcon(item.approval_level_1.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">Level 1: {item.approval_level_1.jabatan}</p>
                                <p className="text-sm text-muted-foreground">{item.approval_level_1.nama}</p>
                              </div>
                              <div className="text-right">
                                {item.approval_level_1.status === 'approved' && (
                                  <div className="text-xs text-muted-foreground">{formatDate(item.approval_level_1.tanggal)}</div>
                                )}
                                {item.approval_level_1.status === 'pending' && (
                                  <Button size="sm">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Approval Level 2 */}
                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="mt-1">{getApprovalIcon(item.approval_level_2.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">Level 2: {item.approval_level_2.jabatan}</p>
                                <p className="text-sm text-muted-foreground">{item.approval_level_2.nama}</p>
                              </div>
                              <div className="text-right">
                                {item.approval_level_2.status === 'approved' && (
                                  <div className="text-xs text-muted-foreground">{formatDate(item.approval_level_2.tanggal)}</div>
                                )}
                                {item.approval_level_2.status === 'pending' && item.approval_level_1.status === 'approved' && (
                                  <Button size="sm">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Approval Level 3 */}
                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="mt-1">{getApprovalIcon(item.approval_level_3.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">Level 3: {item.approval_level_3.jabatan}</p>
                                <p className="text-sm text-muted-foreground">{item.approval_level_3.nama}</p>
                              </div>
                              <div className="text-right">
                                {item.approval_level_3.status === 'approved' && (
                                  <div className="text-xs text-muted-foreground">{formatDate(item.approval_level_3.tanggal)}</div>
                                )}
                                {item.approval_level_3.status === 'pending' && item.approval_level_2.status === 'approved' && (
                                  <Button size="sm">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Integrasi Status */}
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                          <div>
                            <p className="font-semibold">Integrasi ke Payroll</p>
                            {item.integrated ? (
                              <p className="text-sm text-muted-foreground">Terintegrasi: {formatDate(item.integrated_at)}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Belum terintegrasi</p>
                            )}
                          </div>
                          <div>
                            {item.integrated ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Terintegrasi
                              </Badge>
                            ) : item.status === 'approved' ? (
                              <Button size="sm">
                                <Save className="mr-2 h-4 w-4" />
                                Integrasi ke Payroll
                              </Button>
                            ) : (
                              <Badge variant="secondary">Menunggu Approval</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiPenggajian;
