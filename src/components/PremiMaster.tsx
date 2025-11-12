import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Calendar, Plus, Edit2, Trash2, Search, Filter, Download, FileText, Award } from 'lucide-react';

interface PremiKonfigurasi {
  id: string;
  kode_konfigurasi: string;
  estate_id: string;
  estate_name: string;
  tahun_berlaku: number;
  tanggal_mulai: string;
  tanggal_akhir: string | null;
  status: 'aktif' | 'tidak_aktif';
  nomor_surat: string;
  tanggal_surat: string;
  deskripsi: string;
}

interface BasisPremi {
  id: string;
  umur_tanaman: number;
  basis_lama: number;
  ratio_basis_baru: number;
  basis_baru: number;
  harga_per_janjang: number;
  harga_lebih_basis: number;
}

export default function PremiMaster() {
  const [activeTab, setActiveTab] = useState('konfigurasi');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Data - Premi Kebun</h1>
          <p className="text-muted-foreground">
            Kelola konfigurasi premi panen TBS (Tandan Buah Segar)
          </p>
        </div>
        <Award className="h-12 w-12 text-primary" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <TabsTrigger value="konfigurasi" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Konfigurasi
            </TabsTrigger>
            <TabsTrigger value="basis" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Basis Premi
            </TabsTrigger>
            <TabsTrigger value="lebih-basis" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Lebih Basis
            </TabsTrigger>
            <TabsTrigger value="jabatan" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Jabatan
            </TabsTrigger>
            <TabsTrigger value="denda" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Denda
            </TabsTrigger>
            <TabsTrigger value="jam-kerja" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Jam Kerja
            </TabsTrigger>
            <TabsTrigger value="blok" className="whitespace-nowrap px-3 py-2 min-w-fit">
              Blok Kebun
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: KONFIGURASI */}
        <TabsContent value="konfigurasi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Premi Kebun</CardTitle>
              <CardDescription>
                Setting utama premi untuk estate/kebun tertentu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari konfigurasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Konfigurasi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Tambah Konfigurasi Premi</DialogTitle>
                      <DialogDescription>
                        Buat konfigurasi premi baru untuk estate dan tahun tertentu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Kode Konfigurasi</Label>
                          <Input placeholder="KP-SL-2024" />
                        </div>
                        <div className="space-y-2">
                          <Label>Estate/Kebun</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih estate" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sei-liput">Sei Liput (SL)</SelectItem>
                              <SelectItem value="bangun-bandar">Bangun Bandar (BB)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Tahun Berlaku</Label>
                          <Input type="number" placeholder="2024" />
                        </div>
                        <div className="space-y-2">
                          <Label>Tanggal Mulai</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>Tanggal Akhir</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nomor Surat</Label>
                          <Input placeholder="TN/Gr I-SL/R/346/24" />
                        </div>
                        <div className="space-y-2">
                          <Label>Tanggal Surat</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea placeholder="Sistem Premi Panen TBS..." />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="status" />
                        <Label htmlFor="status">Status Aktif</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Batal</Button>
                      <Button>Simpan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Estate</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Nomor Surat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">KP-SL-2024</TableCell>
                    <TableCell>Sei Liput</TableCell>
                    <TableCell>2024</TableCell>
                    <TableCell>01 Des 2024 - Sekarang</TableCell>
                    <TableCell>TN/Gr I-SL/R/346/24</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">Aktif</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: BASIS PREMI */}
        <TabsContent value="basis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basis Premi per Umur Tanaman</CardTitle>
              <CardDescription>
                Definisi basis janjang berdasarkan umur tanaman (3-36 tahun)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Select defaultValue="KP-SL-2024">
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih konfigurasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KP-SL-2024">Sei Liput 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Basis
                </Button>
              </div>

              <div className="border rounded-lg max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Umur (tahun)</TableHead>
                      <TableHead>Basis Lama</TableHead>
                      <TableHead>Ratio Baru</TableHead>
                      <TableHead>Basis Baru</TableHead>
                      <TableHead>Harga/Janjang</TableHead>
                      <TableHead>Harga Lebih Basis</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { umur: 3, lama: 220, ratio: 1.2, baru: 264 },
                      { umur: 4, lama: 200, ratio: 1.2, baru: 240 },
                      { umur: 5, lama: 170, ratio: 1.2, baru: 204 },
                      { umur: 14, lama: 60, ratio: 1.4, baru: 84, hargaLebih: 538 },
                      { umur: 16, lama: 50, ratio: 1.5, baru: 75 },
                      { umur: 18, lama: 40, ratio: 1.85, baru: 74 },
                    ].map((item) => (
                      <TableRow key={item.umur}>
                        <TableCell className="font-medium">{item.umur}</TableCell>
                        <TableCell>{item.lama}</TableCell>
                        <TableCell>{item.ratio}</TableCell>
                        <TableCell className="font-semibold">{item.baru}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{item.hargaLebih ? `Rp ${item.hargaLebih.toLocaleString()}` : '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-muted-foreground">
                ℹ️ Basis Baru = Basis Lama × Ratio Baru (auto-calculated)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: LEBIH BASIS */}
        <TabsContent value="lebih-basis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tingkatan Premi Lebih Basis</CardTitle>
              <CardDescription>
                Definisi premi siap berdasarkan pencapaian basis (6 tier)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Select defaultValue="KP-SL-2024">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KP-SL-2024">Sei Liput 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Tier
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tingkat</TableHead>
                    <TableHead>Dari Basis</TableHead>
                    <TableHead>Sampai Basis</TableHead>
                    <TableHead>Premi Siap 1</TableHead>
                    <TableHead>Premi Siap 2</TableHead>
                    <TableHead>Premi Siap 3</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { tier: 1, dari: '< 1.25', sampai: '-', p1: 0, p2: 0, p3: 0 },
                    { tier: 2, dari: '≥ 1.25', sampai: '< 1.5', p1: 35000, p2: 50000, p3: 65000 },
                    { tier: 3, dari: '≥ 1.5', sampai: '< 1.75', p1: 35000, p2: 50000, p3: 65000 },
                    { tier: 4, dari: '≥ 1.75', sampai: '< 2', p1: 35000, p2: 50000, p3: 65000 },
                    { tier: 5, dari: '≥ 2', sampai: '< 3', p1: 35000, p2: 50000, p3: 65000 },
                    { tier: 6, dari: '≥ 3', sampai: '-', p1: 35000, p2: 50000, p3: 65000 },
                  ].map((item) => (
                    <TableRow key={item.tier}>
                      <TableCell className="font-medium">{item.tier}</TableCell>
                      <TableCell>{item.dari}</TableCell>
                      <TableCell>{item.sampai}</TableCell>
                      <TableCell>Rp {item.p1.toLocaleString()}</TableCell>
                      <TableCell>Rp {item.p2.toLocaleString()}</TableCell>
                      <TableCell>Rp {item.p3.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: JABATAN */}
        <TabsContent value="jabatan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premi Jabatan</CardTitle>
              <CardDescription>
                Setting premi untuk Mandor I, Mandor Panen, dan Kerani Buah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Jabatan</TableHead>
                    <TableHead>Tipe Perhitungan</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Syarat Min</TableHead>
                    <TableHead>Syarat Max</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Mandor I</TableCell>
                    <TableCell>
                      <Badge variant="outline">Multiplier</Badge>
                    </TableCell>
                    <TableCell>1.5×</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell>Bila memimpin 3 mandor</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mandor I</TableCell>
                    <TableCell>
                      <Badge variant="outline">Multiplier</Badge>
                    </TableCell>
                    <TableCell>1.6×</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>Bila memimpin &gt; 3 mandor</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mandor Panen</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Persentase</Badge>
                    </TableCell>
                    <TableCell>12%</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>12% dari total premi karyawan</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Kerani Buah</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Persentase</Badge>
                    </TableCell>
                    <TableCell>10%</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>10% dari total premi karyawan</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: DENDA */}
        <TabsContent value="denda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Denda & Sanksi</CardTitle>
              <CardDescription>
                Master jenis pelanggaran dan nilai denda (11 jenis)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Select defaultValue="KP-SL-2024">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KP-SL-2024">Sei Liput 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Denda
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Pelanggaran</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Nilai Denda</TableHead>
                    <TableHead>Dikenakan Oleh</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { kode: 'A', nama: 'Buah Mentah', satuan: 'per janjang', nilai: 10000, oleh: 'Kerani Buah' },
                    { kode: 'G', nama: 'Gagang Panjang', satuan: 'per janjang', nilai: 1000, oleh: 'Kerani Buah' },
                    { kode: 'S', nama: 'Buah Masak Tinggal', satuan: 'per janjang', nilai: 2000, oleh: 'Mantri' },
                    { kode: 'M1', nama: 'Buah Mentah Diperam', satuan: 'per janjang', nilai: 10000, oleh: 'Kerani Buah' },
                    { kode: 'B1', nama: 'Brondolan < 20 butir', satuan: 'per pokok', nilai: 1000, oleh: 'Kerani Buah' },
                    { kode: 'B2', nama: 'Brondolan ≥ 20 butir', satuan: 'per pokok', nilai: 3000, oleh: 'Kerani Buah' },
                  ].map((item) => (
                    <TableRow key={item.kode}>
                      <TableCell className="font-medium">{item.kode}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.satuan}</Badge>
                      </TableCell>
                      <TableCell>Rp {item.nilai.toLocaleString()}</TableCell>
                      <TableCell>{item.oleh}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: JAM KERJA */}
        <TabsContent value="jam-kerja" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Jam Kerja & Overtime</CardTitle>
              <CardDescription>
                Konfigurasi jam kerja standar dan perhitungan basis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Jam Kerja Standar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Hari Biasa (Senin-Kamis, Sabtu)</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="7" className="w-20" />
                        <span className="text-sm text-muted-foreground">jam</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hari Jumat</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="5" className="w-20" />
                        <span className="text-sm text-muted-foreground">jam</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Perhitungan Basis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Basis Minimum untuk Premi</Label>
                      <Input type="number" defaultValue="1.25" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label>Formula Basis Jumat</Label>
                      <Input defaultValue="(5/7) × basis" disabled />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Overtime (Hari Minggu/Libur)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="overtime" defaultChecked />
                    <Label htmlFor="overtime">Aktifkan premi tambahan untuk hari libur</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tarif Overtime (Umur &lt; 16 tahun)</Label>
                      <Input type="number" defaultValue="75000" />
                      <p className="text-xs text-muted-foreground">Max basis: 1.1</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tarif Overtime (Umur ≥ 16 tahun)</Label>
                      <Input type="number" defaultValue="75000" />
                      <p className="text-xs text-muted-foreground">Max basis: 1.2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>Simpan Pengaturan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: BLOK KEBUN */}
        <TabsContent value="blok" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Master Blok Kebun</CardTitle>
              <CardDescription>
                Kelola blok kebun untuk mapping hasil panen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Select defaultValue="sei-liput">
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih estate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sei-liput">Sei Liput (SL)</SelectItem>
                    <SelectItem value="bangun-bandar">Bangun Bandar (BB)</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Blok
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Blok</TableHead>
                    <TableHead>Nama Blok</TableHead>
                    <TableHead>Umur (tahun)</TableHead>
                    <TableHead>Basis Janjang</TableHead>
                    <TableHead>Luas (Ha)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { kode: 'SL-001', nama: 'Blok I', umur: 14, basis: 84, luas: 25.5, status: 'aktif' },
                    { kode: 'SL-002', nama: 'Blok II', umur: 16, basis: 75, luas: 30.0, status: 'aktif' },
                    { kode: 'SL-003', nama: 'Blok III', umur: 18, basis: 74, luas: 28.0, status: 'aktif' },
                    { kode: 'SL-004', nama: 'Blok Muda A', umur: 5, basis: 204, luas: 22.0, status: 'aktif' },
                    { kode: 'SL-005', nama: 'Blok Muda B', umur: 7, basis: 163, luas: 20.0, status: 'aktif' },
                  ].map((item) => (
                    <TableRow key={item.kode}>
                      <TableCell className="font-medium">{item.kode}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.umur}</TableCell>
                      <TableCell className="font-semibold">{item.basis} janjang</TableCell>
                      <TableCell>{item.luas}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Aktif</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
