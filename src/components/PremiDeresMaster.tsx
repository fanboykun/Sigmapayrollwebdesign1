import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Edit, Trash2, Save, X, Settings, Droplets, TrendingUp, Award, Users, FileText } from 'lucide-react';

const PremiDeresMaster = () => {
  const [activeTab, setActiveTab] = useState('konfigurasi');
  const [isEditing, setIsEditing] = useState(false);

  // =====================================================
  // TAB 1: KONFIGURASI PREMI
  // =====================================================
  const konfigurasiData = {
    kode_konfigurasi: 'PD-2024-001',
    estate: 'Estate Afdeling I',
    tahun_berlaku: 2024,
    tanggal_mulai: '2024-05-01',
    tanggal_akhir: '2024-12-31',
    nomor_surat: 'TN/GR III/R/099/2024',
    tanggal_surat: '2024-05-25',
    status: 'aktif',
    deskripsi: 'Sistem Premi Deres Tahun 2024 berlaku mulai 01 Mei 2024'
  };

  const koefisienPendapatan = [
    { persentase_min: 0, persentase_max: 96, koefisien: 0.97 },
    { persentase_min: 97, persentase_max: 97, koefisien: 0.97 },
    { persentase_min: 98, persentase_max: 98, koefisien: 0.98 },
    { persentase_min: 99, persentase_max: 99, koefisien: 0.99 },
    { persentase_min: 100, persentase_max: 100, koefisien: 1.00 },
    { persentase_min: 101, persentase_max: 101, koefisien: 1.01 },
    { persentase_min: 102, persentase_max: 102, koefisien: 1.02 },
    { persentase_min: 103, persentase_max: null, koefisien: 1.03 },
  ];

  // =====================================================
  // TAB 2: TARIF PREMI PRODUKSI
  // =====================================================
  const tarifProduksi = [
    {
      divisi: 'AP Div I',
      lateks_normal: 337,
      lateks_ekstra: 397,
      lower_grades: 201,
      lump_cuka: 704,
      scraps: 704
    },
    {
      divisi: 'AP Div II',
      lateks_normal: 337,
      lateks_ekstra: 397,
      lower_grades: 201,
      lump_cuka: 704,
      scraps: 704
    },
    {
      divisi: 'AP Div III',
      lateks_normal: 337,
      lateks_ekstra: 397,
      lower_grades: 201,
      lump_cuka: 704,
      scraps: 704
    },
    {
      divisi: 'AP Div IV',
      lateks_normal: 357,
      lateks_ekstra: 427,
      lower_grades: 211,
      lump_cuka: 734,
      scraps: 734
    },
    {
      divisi: 'AP Div V',
      lateks_normal: 357,
      lateks_ekstra: 427,
      lower_grades: 211,
      lump_cuka: 734,
      scraps: 734
    },
    {
      divisi: 'AP Div VI',
      lateks_normal: 357,
      lateks_ekstra: 427,
      lower_grades: 211,
      lump_cuka: 734,
      scraps: 734
    }
  ];

  const tarifTetel = [
    {
      divisi: 'AP Div I',
      lateks_normal: 715,
      lateks_ekstra: 725,
      lower_grades: 201,
      lump_cuka: 705,
      scraps: 705
    },
    {
      divisi: 'AP Div II',
      lateks_normal: 715,
      lateks_ekstra: 725,
      lower_grades: 201,
      lump_cuka: 705,
      scraps: 705
    },
    {
      divisi: 'AP Div III',
      lateks_normal: 715,
      lateks_ekstra: 725,
      lower_grades: 201,
      lump_cuka: 705,
      scraps: 705
    },
    {
      divisi: 'AP Div IV',
      lateks_normal: 715,
      lateks_ekstra: 725,
      lower_grades: 211,
      lump_cuka: 735,
      scraps: 735
    },
    {
      divisi: 'AP Div V',
      lateks_normal: 715,
      lateks_ekstra: 725,
      lower_grades: 211,
      lump_cuka: 735,
      scraps: 735
    },
    {
      divisi: 'AP Div VI',
      lateks_normal: 715,
      lateks_ekstra: 725,
      lower_grades: 211,
      lump_cuka: 735,
      scraps: 735
    }
  ];

  const biayaCuciMangkok = [
    { divisi: 'AP Div I', tarif_per_ancak: 90500 },
    { divisi: 'AP Div II', tarif_per_ancak: 90500 },
    { divisi: 'AP Div III', tarif_per_ancak: 90500 },
    { divisi: 'AP Div IV', tarif_per_ancak: 106500 },
    { divisi: 'AP Div V', tarif_per_ancak: 106500 },
    { divisi: 'AP Div VI', tarif_per_ancak: 106500 }
  ];

  // =====================================================
  // TAB 3: PREMI KUALITAS (PQ)
  // =====================================================
  const premiKualitas = [
    { nilai_kesalahan_min: 0, nilai_kesalahan_max: 8, koefisien: 1.00, tarif_pq: 237000 },
    { nilai_kesalahan_min: 1, nilai_kesalahan_max: 17, koefisien: 0.75, tarif_pq: 237000 },
    { nilai_kesalahan_min: 18, nilai_kesalahan_max: 26, koefisien: 0.60, tarif_pq: 237000 },
    { nilai_kesalahan_min: 27, nilai_kesalahan_max: 35, koefisien: 0.45, tarif_pq: 237000 },
    { nilai_kesalahan_min: 36, nilai_kesalahan_max: 42, koefisien: 0.30, tarif_pq: 237000 },
    { nilai_kesalahan_min: 43, nilai_kesalahan_max: 48, koefisien: 0.15, tarif_pq: 237000 },
    { nilai_kesalahan_min: 49, nilai_kesalahan_max: null, koefisien: 0.00, tarif_pq: 237000 }
  ];

  const kriteriaKesalahan = [
    { kode: 'DANGKAL', nama: 'Deres terlalu dangkal', bobot: 1 },
    { kode: 'LUKA', nama: 'Luka pada kulit pohon', bobot: 1 },
    { kode: 'SUDUT', nama: 'Sudut deresan tidak sesuai', bobot: 1 },
    { kode: 'KULIT', nama: 'Pemakaian kulit berlebihan', bobot: 1 },
    { kode: 'ALAT', nama: 'Alat-alat tidak berpedoman pada cara-cara pemeriksaan', bobot: 1 },
    { kode: 'DISIPLIN', nama: 'Tidak disiplin dalam pekerjaan', bobot: 1 }
  ];

  const praPeteruna = {
    tarif_per_bulan: 267000,
    durasi_bulan: 6,
    keterangan: 'Premi kualitas untuk tanaman pra teruna diberikan selama 6 bulan pertama setelah buka deresan baru'
  };

  // =====================================================
  // TAB 4: PREMI SUPERVISOR
  // =====================================================
  const mandorDeres = [
    { jumlah_karyawan_min: 0, jumlah_karyawan_max: 10, multiplier: 1.50, keterangan: 'Kurang dari 10 karyawan' },
    { jumlah_karyawan_min: 11, jumlah_karyawan_max: 15, multiplier: 1.75, keterangan: '11 sampai 15 karyawan' },
    { jumlah_karyawan_min: 16, jumlah_karyawan_max: 20, multiplier: 2.00, keterangan: '16 sampai 20 karyawan' },
    { jumlah_karyawan_min: 21, jumlah_karyawan_max: null, multiplier: 2.25, keterangan: 'Lebih dari 20 karyawan' }
  ];

  const mandorIDeres = [
    { jumlah_karyawan_min: 0, jumlah_karyawan_max: 50, multiplier: 1.50, keterangan: 'Kurang dari 50 karyawan' },
    { jumlah_karyawan_min: 51, jumlah_karyawan_max: 75, multiplier: 1.75, keterangan: '51 sampai 75 karyawan' },
    { jumlah_karyawan_min: 76, jumlah_karyawan_max: 100, multiplier: 2.00, keterangan: '76 sampai 100 karyawan' },
    { jumlah_karyawan_min: 101, jumlah_karyawan_max: null, multiplier: 2.25, keterangan: 'Lebih dari 100 karyawan' }
  ];

  const kraniLateks = {
    multiplier: 1.25,
    penalti: 'Melakukan manipulasi data, Tidak membuat atau terlambat melaporkan produksi harian dan bulanan yang harus diinput ke sistem, Tidak membuat rencana aplikasi stimulasi dan laporan kenaikan stimulasi, Tidak melakukan pengukuran DRC permandoran dan sampling 10% dari jumlah penderes permandoran, Tidak berperan aktif dalam perawatan lateks collection dan pekerjaan stimulasi'
  };

  const kraniProduksi = {
    multiplier: 1.50,
    penalti: 'Melakukan manipulasi data, Tidak membuat atau terlambat melaporkan produksi harian dan bulanan yang harus diinput ke sistem, Tidak membuat rencana aplikasi stimulasi dan laporan kenaikan stimulasi, Tidak melakukan pengukuran DRC permandoran dan sampling 10% dari jumlah penderes permandoran, Tidak berperan aktif dalam perawatan lateks collection dan pekerjaan stimulasi'
  };

  const tapKontrol = {
    kebun_type: 'AP/HL',
    tarif_per_bulan: 1510000,
    keterangan: 'Premi Tap Kontrol untuk kebun AP/HL'
  };

  // =====================================================
  // TAB 5: PREMI KELUAR/KONTANAN
  // =====================================================
  const premiKeluarKontanan = [
    { jenis_karyawan: 'Karyawan Penderes', tarif_per_hb: 151000 },
    { jenis_karyawan: 'Mandor-I Deres', tarif_per_hb: 171000 },
    { jenis_karyawan: 'Mandor Deres', tarif_per_hb: 161000 },
    { jenis_karyawan: 'Krani Latex', tarif_per_hb: 151000 },
    { jenis_karyawan: 'Premi Tap Kontrol', tarif_per_hb: 171000 }
  ];

  const hariBerlaku = [
    'Maulid Nabi Muhammad SAW',
    'Isra Mi\'raj Nabi Muhammad SAW',
    'Wafat Yesus Kristus',
    '1 Muharram (Tahun Baru Islam)',
    'Natal'
  ];

  // =====================================================
  // TAB 6: MASTER ANCAK
  // =====================================================
  const masterAncak = [
    { id: 1, kode: 'ANC-001', nama: 'Ancak Blok A-001', blok: 'Blok A', estate: 'Estate Afdeling I', divisi: 'AP Div I-III', jumlah_pokok: 450, status: 'aktif' },
    { id: 2, kode: 'ANC-002', nama: 'Ancak Blok A-002', blok: 'Blok A', estate: 'Estate Afdeling I', divisi: 'AP Div I-III', jumlah_pokok: 480, status: 'aktif' },
    { id: 3, kode: 'ANC-003', nama: 'Ancak Blok B-001', blok: 'Blok B', estate: 'Estate Afdeling I', divisi: 'AP Div IV-VI', jumlah_pokok: 500, status: 'aktif' },
    { id: 4, kode: 'ANC-004', nama: 'Ancak Blok B-002', blok: 'Blok B', estate: 'Estate Afdeling I', divisi: 'AP Div IV-VI', jumlah_pokok: 520, status: 'aktif' },
    { id: 5, kode: 'ANC-005', nama: 'Ancak Blok C-001 (Tetel)', blok: 'Blok C', estate: 'Estate Afdeling I', divisi: 'AP Div I-III', jumlah_pokok: 400, status: 'tetel' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      aktif: 'default',
      tidak_aktif: 'secondary',
      tetel: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            Master Data Premi Deres
          </h1>
          <p className="text-muted-foreground">Konfigurasi dan tarif premi deres tahun 2024</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Konfigurasi Baru
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <TabsTrigger value="konfigurasi" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Settings className="mr-2 h-4 w-4" />
              Konfigurasi Premi
            </TabsTrigger>
            <TabsTrigger value="tarif-produksi" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <TrendingUp className="mr-2 h-4 w-4" />
              Tarif Produksi
            </TabsTrigger>
            <TabsTrigger value="premi-kualitas" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Award className="mr-2 h-4 w-4" />
              Premi Kualitas
            </TabsTrigger>
            <TabsTrigger value="premi-supervisor" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Users className="mr-2 h-4 w-4" />
              Premi Supervisor
            </TabsTrigger>
            <TabsTrigger value="premi-keluar" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <FileText className="mr-2 h-4 w-4" />
              Premi Keluar/Kontanan
            </TabsTrigger>
            <TabsTrigger value="master-ancak" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Droplets className="mr-2 h-4 w-4" />
              Master Ancak
            </TabsTrigger>
          </TabsList>
        </div>

        {/* =====================================================
            TAB 1: KONFIGURASI PREMI
            ===================================================== */}
        <TabsContent value="konfigurasi" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Konfigurasi Premi Deres</CardTitle>
                  <CardDescription>Header konfigurasi sistem premi deres tahun 2024</CardDescription>
                </div>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kode Konfigurasi</Label>
                    <Input value={konfigurasiData.kode_konfigurasi} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Estate</Label>
                    <Select value={konfigurasiData.estate} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun Berlaku</Label>
                    <Input type="number" value={konfigurasiData.tahun_berlaku} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Input type="date" value={konfigurasiData.tanggal_mulai} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Akhir</Label>
                    <Input type="date" value={konfigurasiData.tanggal_akhir} disabled />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nomor Surat</Label>
                    <Input value={konfigurasiData.nomor_surat} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Surat</Label>
                    <Input type="date" value={konfigurasiData.tanggal_surat} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    {getStatusBadge(konfigurasiData.status)}
                  </div>
                  <div className="space-y-2">
                    <Label>Deskripsi</Label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                      value={konfigurasiData.deskripsi}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-4">Koefisien Pendapatan</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Persentase Pendapatan Min (%)</TableHead>
                      <TableHead>Persentase Pendapatan Max (%)</TableHead>
                      <TableHead className="text-right">Koefisien Premi</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {koefisienPendapatan.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.persentase_min}%</TableCell>
                        <TableCell>{item.persentase_max ? `${item.persentase_max}%` : 'dst'}</TableCell>
                        <TableCell className="text-right font-semibold">{item.koefisien.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 2: TARIF PREMI PRODUKSI
            ===================================================== */}
        <TabsContent value="tarif-produksi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarif Premi Produksi</CardTitle>
              <CardDescription>Tarif premi produksi normal, ekstra, tetel, dan biaya cuci mangkok</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section A: Tarif Normal & Ekstra */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tarif Produksi Normal & Ekstra/Libur</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Divisi</TableHead>
                      <TableHead className="text-right">Lateks Normal<br />(Rp/Kg KK)</TableHead>
                      <TableHead className="text-right">Lateks Ekstra<br />(Rp/Kg KK)</TableHead>
                      <TableHead className="text-right">Lower Grades<br />(Rp/Kg Basah)</TableHead>
                      <TableHead className="text-right">Lump Cuka<br />(Rp/Kg Basah)</TableHead>
                      <TableHead className="text-right">Scraps<br />(Rp/Kg Basah)</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tarifProduksi.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.divisi}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.lateks_normal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.lateks_ekstra)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.lower_grades)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.lump_cuka)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.scraps)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Section B: Tarif Tetel */}
              <Accordion type="single" collapsible>
                <AccordionItem value="tetel">
                  <AccordionTrigger>
                    <h3 className="text-lg font-semibold">Tarif Premi Deres Tetel (Area Replanting)</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Divisi</TableHead>
                          <TableHead className="text-right">Lateks Normal<br />(Rp/Kg KK)</TableHead>
                          <TableHead className="text-right">Lateks Ekstra<br />(Rp/Kg KK)</TableHead>
                          <TableHead className="text-right">Lower Grades<br />(Rp/Kg Basah)</TableHead>
                          <TableHead className="text-right">Lump Cuka<br />(Rp/Kg Basah)</TableHead>
                          <TableHead className="text-right">Scraps<br />(Rp/Kg Basah)</TableHead>
                          <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tarifTetel.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.divisi}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.lateks_normal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.lateks_ekstra)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.lower_grades)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.lump_cuka)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.scraps)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator />

              {/* Section C: Biaya Cuci Mangkok */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Biaya Cuci Mangkok</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Divisi</TableHead>
                      <TableHead className="text-right">Tarif per Ancak</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {biayaCuciMangkok.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.divisi}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {formatCurrency(item.tarif_per_ancak)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 3: PREMI KUALITAS (PQ)
            ===================================================== */}
        <TabsContent value="premi-kualitas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premi Kualitas (PQ)</CardTitle>
              <CardDescription>Konfigurasi premi kualitas regular dan pra teruna</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section A: Premi Kualitas Regular */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Premi Kualitas Regular</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Tarif Dasar PQ</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(237000)}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Tarif
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nilai Kesalahan Min</TableHead>
                      <TableHead>Nilai Kesalahan Max</TableHead>
                      <TableHead className="text-right">Koefisien</TableHead>
                      <TableHead className="text-right">Premi Diterima</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {premiKualitas.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.nilai_kesalahan_min}</TableCell>
                        <TableCell>{item.nilai_kesalahan_max || 'dst'}</TableCell>
                        <TableCell className="text-right font-semibold">{item.koefisien.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(item.tarif_pq * item.koefisien)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator className="my-6" />

                <h4 className="font-semibold mb-3">Kriteria Kesalahan Pemeriksaan Kualitas</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Kesalahan</TableHead>
                      <TableHead className="text-right">Bobot</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kriteriaKesalahan.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{item.kode}</Badge>
                        </TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell className="text-right">{item.bobot}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm" className="mt-3">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kriteria
                </Button>
              </div>

              <Separator />

              {/* Section B: Premi Pra Teruna */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Premi Kualitas Pra Teruna</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Tarif per Bulan</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(praPeteruna.tarif_per_bulan)}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 font-medium">Durasi</p>
                      <p className="text-green-900">{praPeteruna.durasi_bulan} bulan</p>
                    </div>
                    <div>
                      <p className="text-green-700 font-medium">Keterangan</p>
                      <p className="text-green-900">{praPeteruna.keterangan}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 4: PREMI SUPERVISOR
            ===================================================== */}
        <TabsContent value="premi-supervisor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premi Supervisor</CardTitle>
              <CardDescription>Formula premi untuk mandor, krani, dan tap kontrol</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="mandor-deres">
                {/* Section A: Mandor Deres */}
                <AccordionItem value="mandor-deres">
                  <AccordionTrigger>
                    <h3 className="text-lg font-semibold">Mandor Deres</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Formula: Multiplier × Rata-rata Premi Penderes Yang Diawasi
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jumlah Karyawan Min</TableHead>
                          <TableHead>Jumlah Karyawan Max</TableHead>
                          <TableHead className="text-right">Multiplier</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mandorDeres.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.jumlah_karyawan_min}</TableCell>
                            <TableCell>{item.jumlah_karyawan_max || 'dst'}</TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              {item.multiplier.toFixed(2)}x
                            </TableCell>
                            <TableCell>{item.keterangan}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>

                {/* Section B: Mandor-I Deres */}
                <AccordionItem value="mandor-i-deres">
                  <AccordionTrigger>
                    <h3 className="text-lg font-semibold">Mandor-I Deres</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Formula: Multiplier × Rata-rata Premi Mandor Yang Diawasi
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jumlah Karyawan Min</TableHead>
                          <TableHead>Jumlah Karyawan Max</TableHead>
                          <TableHead className="text-right">Multiplier</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mandorIDeres.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.jumlah_karyawan_min}</TableCell>
                            <TableCell>{item.jumlah_karyawan_max || 'dst'}</TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              {item.multiplier.toFixed(2)}x
                            </TableCell>
                            <TableCell>{item.keterangan}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>

                {/* Section C: Krani Lateks */}
                <AccordionItem value="krani-lateks">
                  <AccordionTrigger>
                    <h3 className="text-lg font-semibold">Krani Lateks</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Multiplier</p>
                            <p className="text-2xl font-bold text-blue-600">{kraniLateks.multiplier.toFixed(2)}x</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Formula: 1.25 × Rata-rata Premi Penderes Yang Diawasi
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Penalti - Premi Menjadi Nol Jika:</h4>
                        <p className="text-sm text-red-800">{kraniLateks.penalti}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section D: Krani Produksi */}
                <AccordionItem value="krani-produksi">
                  <AccordionTrigger>
                    <h3 className="text-lg font-semibold">Krani Produksi</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Multiplier</p>
                            <p className="text-2xl font-bold text-blue-600">{kraniProduksi.multiplier.toFixed(2)}x</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Formula: 1.5 × Rata-rata Premi Seluruh Penderes
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Penalti - Premi Menjadi Nol Jika:</h4>
                        <p className="text-sm text-red-800">{kraniProduksi.penalti}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section E: Tap Kontrol */}
                <AccordionItem value="tap-kontrol">
                  <AccordionTrigger>
                    <h3 className="text-lg font-semibold">Premi Tap Kontrol</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-900">Tarif per Bulan</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(tapKontrol.tarif_per_bulan)}</p>
                          <p className="text-xs text-green-700 mt-1">Kebun Type: {tapKontrol.kebun_type}</p>
                          <p className="text-xs text-green-700">{tapKontrol.keterangan}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 5: PREMI KELUAR/KONTANAN
            ===================================================== */}
        <TabsContent value="premi-keluar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premi Keluar/Kontanan (Deres Ekstra/Hari Libur)</CardTitle>
              <CardDescription>Tarif premi deres untuk hari besar keagamaan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Tarif Premi per Hari Besar</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Karyawan</TableHead>
                      <TableHead className="text-right">Tarif per Hari Besar</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {premiKeluarKontanan.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.jenis_karyawan}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(item.tarif_per_hb)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Hari Besar Yang Berlaku</h3>
                <div className="grid grid-cols-2 gap-3">
                  {hariBerlaku.map((hari, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">{hari}</span>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Hari Besar
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Catatan Penting:</h4>
                <p className="text-sm text-yellow-800">
                  Premi Deres Ekstra/Hari Libur ditambah dengan uang makan siang.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =====================================================
            TAB 6: MASTER ANCAK
            ===================================================== */}
        <TabsContent value="master-ancak" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Master Ancak</CardTitle>
                  <CardDescription>Data ancak untuk penugasan deres</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Ancak
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Ancak</TableHead>
                    <TableHead>Blok</TableHead>
                    <TableHead>Estate</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead className="text-right">Jumlah Pokok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {masterAncak.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.kode}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.blok}</TableCell>
                      <TableCell>{item.estate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.divisi}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.jumlah_pokok.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4" />
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
      </Tabs>
    </div>
  );
};

export default PremiDeresMaster;
