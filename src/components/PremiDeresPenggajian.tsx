import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplets, Upload, CheckCircle, Calculator, Plus, Edit, Trash2, Save, CalendarIcon, FileDown, Eye, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const PremiDeresPenggajian = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input-produksi');
  const [isLoading, setIsLoading] = useState(false);

  // =====================================================
  // TAB 1: INPUT PRODUKSI HARIAN - STATE
  // =====================================================
  const [produksiHarian, setProduksiHarian] = useState<any[]>([]);
  const [ancakList, setAncakList] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  const [isDialogProduksiOpen, setIsDialogProduksiOpen] = useState(false);
  const [selectedDateProduksi, setSelectedDateProduksi] = useState<Date>();
  const [filterDivisi, setFilterDivisi] = useState('all');
  const [searchNIK, setSearchNIK] = useState('');
  const [editingProduksi, setEditingProduksi] = useState<any>(null);

  // Form state for produksi
  const [formProduksi, setFormProduksi] = useState({
    employee_id: '',
    ancak_id: '',
    jenis_produksi: 'normal',
    lateks_kg: '',
    lower_grades_kg: '',
    lump_kg: '',
    scraps_kg: '',
    keterangan: ''
  });

  // =====================================================
  // TAB 2: QUALITY CHECK HARIAN - STATE
  // =====================================================
  const [qualityCheckData, setQualityCheckData] = useState<any[]>([]);
  const [isDialogQualityOpen, setIsDialogQualityOpen] = useState(false);
  const [selectedDateQuality, setSelectedDateQuality] = useState<Date>();
  const [editingQuality, setEditingQuality] = useState<any>(null);

  const [formQuality, setFormQuality] = useState({
    employee_id: '',
    kesalahan_dangkal: 0,
    kesalahan_luka: 0,
    kesalahan_sudut: 0,
    kesalahan_kulit: 0,
    kesalahan_alat: 0,
    kesalahan_disiplin: 0,
    keterangan: ''
  });

  const kriteriaKesalahan = [
    { kode: 'DANGKAL', nama: 'Deres terlalu dangkal', field: 'kesalahan_dangkal' },
    { kode: 'LUKA', nama: 'Luka pada kulit pohon', field: 'kesalahan_luka' },
    { kode: 'SUDUT', nama: 'Sudut deresan tidak sesuai', field: 'kesalahan_sudut' },
    { kode: 'KULIT', nama: 'Pemakaian kulit berlebihan', field: 'kesalahan_kulit' },
    { kode: 'ALAT', nama: 'Alat tidak sesuai prosedur', field: 'kesalahan_alat' },
    { kode: 'DISIPLIN', nama: 'Tidak disiplin dalam pekerjaan', field: 'kesalahan_disiplin' }
  ];

  // =====================================================
  // TAB 3: PERHITUNGAN PREMI - STATE
  // =====================================================
  const [periodePerhitungan, setPeriodePerhitungan] = useState<any[]>([]);
  const [isDialogPerhitunganOpen, setIsDialogPerhitunganOpen] = useState(false);

  // =====================================================
  // FETCH DATA FUNCTIONS
  // =====================================================

  // Fetch produksi harian
  const fetchProduksiHarian = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('premi_deres_produksi_harian')
        .select(`
          *,
          employees:employee_id (employee_id, full_name),
          premi_deres_ancak_master:ancak_id (kode_ancak, nama_ancak, divisi)
        `)
        .order('tanggal_produksi', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProduksiHarian(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal memuat data produksi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch ancak master
  const fetchAncakList = async () => {
    try {
      const { data, error } = await supabase
        .from('premi_deres_ancak_master')
        .select('*')
        .eq('status', 'aktif')
        .order('kode_ancak');

      if (error) throw error;
      setAncakList(data || []);
    } catch (error: any) {
      console.error('Error fetching ancak:', error);
    }
  };

  // Fetch employee list
  const fetchEmployeeList = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, full_name')
        .order('full_name');

      if (error) throw error;
      setEmployeeList(data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch quality check data
  const fetchQualityCheckData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('premi_deres_quality_check_harian')
        .select(`
          *,
          employees:employee_id (employee_id, full_name),
          premi_deres_ancak_master:ancak_id (kode_ancak, nama_ancak)
        `)
        .order('tanggal_pemeriksaan', { ascending: false })
        .limit(50);

      if (error) throw error;
      setQualityCheckData(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal memuat data quality check',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch periode perhitungan
  const fetchPeriodePerhitungan = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('premi_deres_periode_perhitungan')
        .select('*')
        .order('tanggal_mulai', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPeriodePerhitungan(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal memuat data periode',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // CRUD FUNCTIONS - PRODUKSI HARIAN
  // =====================================================

  const handleSubmitProduksi = async () => {
    try {
      if (!selectedDateProduksi) {
        toast({
          title: 'Error',
          description: 'Tanggal produksi harus diisi',
          variant: 'destructive'
        });
        return;
      }

      if (!formProduksi.employee_id || !formProduksi.ancak_id) {
        toast({
          title: 'Error',
          description: 'Karyawan dan Ancak harus dipilih',
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);

      const dataToSubmit = {
        tanggal_produksi: format(selectedDateProduksi, 'yyyy-MM-dd'),
        employee_id: formProduksi.employee_id,
        ancak_id: formProduksi.ancak_id,
        jenis_produksi: formProduksi.jenis_produksi,
        lateks_kg: parseFloat(formProduksi.lateks_kg) || 0,
        lower_grades_kg: parseFloat(formProduksi.lower_grades_kg) || 0,
        lump_kg: parseFloat(formProduksi.lump_kg) || 0,
        scraps_kg: parseFloat(formProduksi.scraps_kg) || 0,
        keterangan: formProduksi.keterangan,
        status: 'submitted'
      };

      let error;
      if (editingProduksi) {
        const result = await supabase
          .from('premi_deres_produksi_harian')
          .update(dataToSubmit)
          .eq('id', editingProduksi.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('premi_deres_produksi_harian')
          .insert([dataToSubmit]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: 'Sukses',
        description: editingProduksi ? 'Data produksi berhasil diupdate' : 'Data produksi berhasil ditambahkan'
      });

      setIsDialogProduksiOpen(false);
      resetFormProduksi();
      fetchProduksiHarian();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan data produksi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduksi = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('premi_deres_produksi_harian')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sukses',
        description: 'Data produksi berhasil dihapus'
      });

      fetchProduksiHarian();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus data produksi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormProduksi = () => {
    setFormProduksi({
      employee_id: '',
      ancak_id: '',
      jenis_produksi: 'normal',
      lateks_kg: '',
      lower_grades_kg: '',
      lump_kg: '',
      scraps_kg: '',
      keterangan: ''
    });
    setSelectedDateProduksi(undefined);
    setEditingProduksi(null);
  };

  // =====================================================
  // CRUD FUNCTIONS - QUALITY CHECK
  // =====================================================

  const calculateKoefisienPQ = (totalKesalahan: number): number => {
    if (totalKesalahan >= 0 && totalKesalahan <= 8) return 1.00;
    if (totalKesalahan >= 9 && totalKesalahan <= 17) return 0.75;
    if (totalKesalahan >= 18 && totalKesalahan <= 26) return 0.60;
    if (totalKesalahan >= 27 && totalKesalahan <= 35) return 0.45;
    if (totalKesalahan >= 36 && totalKesalahan <= 42) return 0.30;
    if (totalKesalahan >= 43 && totalKesalahan <= 48) return 0.15;
    return 0.00;
  };

  const getTotalKesalahan = () => {
    return formQuality.kesalahan_dangkal +
      formQuality.kesalahan_luka +
      formQuality.kesalahan_sudut +
      formQuality.kesalahan_kulit +
      formQuality.kesalahan_alat +
      formQuality.kesalahan_disiplin;
  };

  const handleSubmitQuality = async () => {
    try {
      if (!selectedDateQuality) {
        toast({
          title: 'Error',
          description: 'Tanggal pemeriksaan harus diisi',
          variant: 'destructive'
        });
        return;
      }

      if (!formQuality.employee_id) {
        toast({
          title: 'Error',
          description: 'Karyawan harus dipilih',
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);

      const totalKesalahan = getTotalKesalahan();
      const koefisienPQ = calculateKoefisienPQ(totalKesalahan);

      const dataToSubmit = {
        tanggal_pemeriksaan: format(selectedDateQuality, 'yyyy-MM-dd'),
        employee_id: formQuality.employee_id,
        kesalahan_dangkal: formQuality.kesalahan_dangkal,
        kesalahan_luka: formQuality.kesalahan_luka,
        kesalahan_sudut: formQuality.kesalahan_sudut,
        kesalahan_kulit: formQuality.kesalahan_kulit,
        kesalahan_alat: formQuality.kesalahan_alat,
        kesalahan_disiplin: formQuality.kesalahan_disiplin,
        total_kesalahan: totalKesalahan,
        koefisien_pq: koefisienPQ,
        keterangan: formQuality.keterangan,
        status: 'submitted'
      };

      let error;
      if (editingQuality) {
        const result = await supabase
          .from('premi_deres_quality_check_harian')
          .update(dataToSubmit)
          .eq('id', editingQuality.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('premi_deres_quality_check_harian')
          .insert([dataToSubmit]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: 'Sukses',
        description: editingQuality ? 'Data quality check berhasil diupdate' : 'Data quality check berhasil ditambahkan'
      });

      setIsDialogQualityOpen(false);
      resetFormQuality();
      fetchQualityCheckData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan data quality check',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuality = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('premi_deres_quality_check_harian')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sukses',
        description: 'Data quality check berhasil dihapus'
      });

      fetchQualityCheckData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus data quality check',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormQuality = () => {
    setFormQuality({
      employee_id: '',
      kesalahan_dangkal: 0,
      kesalahan_luka: 0,
      kesalahan_sudut: 0,
      kesalahan_kulit: 0,
      kesalahan_alat: 0,
      kesalahan_disiplin: 0,
      keterangan: ''
    });
    setSelectedDateQuality(undefined);
    setEditingQuality(null);
  };

  // =====================================================
  // USEEFFECT - FETCH DATA ON MOUNT
  // =====================================================

  useEffect(() => {
    fetchProduksiHarian();
    fetchAncakList();
    fetchEmployeeList();
    fetchQualityCheckData();
    fetchPeriodePerhitungan();
  }, []);

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      submitted: 'secondary',
      approved: 'default',
      calculated: 'default',
      reviewed: 'outline',
      rejected: 'destructive'
    };
    const labels: Record<string, string> = {
      submitted: 'DIAJUKAN',
      approved: 'DISETUJUI',
      calculated: 'DIHITUNG',
      reviewed: 'DIREVIEW',
      rejected: 'DITOLAK'
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status.toUpperCase()}</Badge>;
  };

  // Filter produksi
  const filteredProduksi = produksiHarian.filter((item) => {
    const matchDivisi = filterDivisi === 'all' || item.premi_deres_ancak_master?.divisi === filterDivisi;
    const matchSearch = !searchNIK ||
      item.employees?.employee_id?.toLowerCase().includes(searchNIK.toLowerCase()) ||
      item.employees?.full_name?.toLowerCase().includes(searchNIK.toLowerCase());
    return matchDivisi && matchSearch;
  });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            Penggajian Premi Deres
          </h1>
          <p className="text-muted-foreground">Input produksi harian dan perhitungan premi deres</p>
        </div>
        <Button variant="outline" onClick={() => {
          fetchProduksiHarian();
          fetchQualityCheckData();
          fetchPeriodePerhitungan();
        }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {isLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Memuat data...</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <TabsTrigger value="input-produksi" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Upload className="mr-2 h-4 w-4" />
              Input Produksi
            </TabsTrigger>
            <TabsTrigger value="quality-check" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <CheckCircle className="mr-2 h-4 w-4" />
              Quality Check
            </TabsTrigger>
            <TabsTrigger value="perhitungan" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Calculator className="mr-2 h-4 w-4" />
              Perhitungan Premi
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: INPUT PRODUKSI */}
        <TabsContent value="input-produksi" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Input Produksi Harian</CardTitle>
                  <CardDescription>Pencatatan hasil produksi deres harian per penderes ({filteredProduksi.length} records)</CardDescription>
                </div>
                <Dialog open={isDialogProduksiOpen} onOpenChange={(open) => {
                  setIsDialogProduksiOpen(open);
                  if (!open) resetFormProduksi();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Input Produksi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduksi ? 'Edit' : 'Input'} Produksi Harian Deres</DialogTitle>
                      <DialogDescription>Masukkan data produksi harian penderes</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tanggal Produksi *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDateProduksi ? format(selectedDateProduksi, 'PPP', { locale: localeId }) : <span>Pilih tanggal</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={selectedDateProduksi} onSelect={setSelectedDateProduksi} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Karyawan *</Label>
                        <Select value={formProduksi.employee_id} onValueChange={(value) => setFormProduksi({ ...formProduksi, employee_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih karyawan" />
                          </SelectTrigger>
                          <SelectContent>
                            {employeeList.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.employee_id} - {emp.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ancak *</Label>
                        <Select value={formProduksi.ancak_id} onValueChange={(value) => setFormProduksi({ ...formProduksi, ancak_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih ancak" />
                          </SelectTrigger>
                          <SelectContent>
                            {ancakList.map((ancak) => (
                              <SelectItem key={ancak.id} value={ancak.id}>
                                {ancak.kode_ancak} - {ancak.nama_ancak}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Jenis Produksi</Label>
                        <Select value={formProduksi.jenis_produksi} onValueChange={(value) => setFormProduksi({ ...formProduksi, jenis_produksi: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="ekstra">Ekstra/Libur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Separator className="my-2" />
                        <h4 className="font-semibold mb-3">Data Produksi (Kg)</h4>
                      </div>
                      <div className="space-y-2">
                        <Label>Lateks (Kg KK)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={formProduksi.lateks_kg}
                          onChange={(e) => setFormProduksi({ ...formProduksi, lateks_kg: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lower Grades (Kg Basah)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={formProduksi.lower_grades_kg}
                          onChange={(e) => setFormProduksi({ ...formProduksi, lower_grades_kg: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lump Cuka (Kg Basah)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={formProduksi.lump_kg}
                          onChange={(e) => setFormProduksi({ ...formProduksi, lump_kg: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Scraps (Kg Basah)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={formProduksi.scraps_kg}
                          onChange={(e) => setFormProduksi({ ...formProduksi, scraps_kg: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Keterangan (Opsional)</Label>
                        <Textarea
                          placeholder="Catatan tambahan..."
                          value={formProduksi.keterangan}
                          onChange={(e) => setFormProduksi({ ...formProduksi, keterangan: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogProduksiOpen(false)} disabled={isLoading}>Batal</Button>
                      <Button onClick={handleSubmitProduksi} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {editingProduksi ? 'Update' : 'Simpan'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter Section */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Cari ID Karyawan atau nama..."
                    value={searchNIK}
                    onChange={(e) => setSearchNIK(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={filterDivisi} onValueChange={setFilterDivisi}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Divisi</SelectItem>
                    <SelectItem value="AP Div I">AP Div I</SelectItem>
                    <SelectItem value="AP Div II">AP Div II</SelectItem>
                    <SelectItem value="AP Div III">AP Div III</SelectItem>
                    <SelectItem value="AP Div IV">AP Div IV</SelectItem>
                    <SelectItem value="AP Div V">AP Div V</SelectItem>
                    <SelectItem value="AP Div VI">AP Div VI</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {/* Data Table */}
              {filteredProduksi.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Belum ada data produksi. Klik tombol "Input Produksi" untuk menambah data.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>ID Karyawan</TableHead>
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead>Ancak</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className="text-right">Lateks (Kg)</TableHead>
                        <TableHead className="text-right">LG (Kg)</TableHead>
                        <TableHead className="text-right">Lump (Kg)</TableHead>
                        <TableHead className="text-right">Scraps (Kg)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProduksi.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{format(new Date(item.tanggal_produksi), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                          <TableCell className="font-mono">{item.employees?.employee_id || '-'}</TableCell>
                          <TableCell className="font-medium">{item.employees?.full_name || '-'}</TableCell>
                          <TableCell>{item.premi_deres_ancak_master?.kode_ancak || '-'}</TableCell>
                          <TableCell>{item.premi_deres_ancak_master?.divisi || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={item.jenis_produksi === 'normal' ? 'outline' : 'secondary'}>
                              {item.jenis_produksi === 'normal' ? 'Normal' : 'Ekstra'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{item.lateks_kg?.toFixed(1) || '0.0'}</TableCell>
                          <TableCell className="text-right">{item.lower_grades_kg?.toFixed(1) || '0.0'}</TableCell>
                          <TableCell className="text-right">{item.lump_kg?.toFixed(1) || '0.0'}</TableCell>
                          <TableCell className="text-right">{item.scraps_kg?.toFixed(1) || '0.0'}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingProduksi(item);
                                  setFormProduksi({
                                    employee_id: item.employee_id,
                                    ancak_id: item.ancak_id,
                                    jenis_produksi: item.jenis_produksi,
                                    lateks_kg: item.lateks_kg?.toString() || '',
                                    lower_grades_kg: item.lower_grades_kg?.toString() || '',
                                    lump_kg: item.lump_kg?.toString() || '',
                                    scraps_kg: item.scraps_kg?.toString() || '',
                                    keterangan: item.keterangan || ''
                                  });
                                  setSelectedDateProduksi(new Date(item.tanggal_produksi));
                                  setIsDialogProduksiOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduksi(item.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: QUALITY CHECK */}
        <TabsContent value="quality-check" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pemeriksaan Kualitas Deres</CardTitle>
                  <CardDescription>Pencatatan hasil pemeriksaan kualitas deres harian ({qualityCheckData.length} records)</CardDescription>
                </div>
                <Dialog open={isDialogQualityOpen} onOpenChange={(open) => {
                  setIsDialogQualityOpen(open);
                  if (!open) resetFormQuality();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Input Quality Check
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingQuality ? 'Edit' : 'Input'} Pemeriksaan Kualitas Deres</DialogTitle>
                      <DialogDescription>Masukkan hasil pemeriksaan kualitas deres</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tanggal Pemeriksaan *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDateQuality ? format(selectedDateQuality, 'PPP', { locale: localeId }) : <span>Pilih tanggal</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={selectedDateQuality} onSelect={setSelectedDateQuality} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Karyawan *</Label>
                        <Select value={formQuality.employee_id} onValueChange={(value) => setFormQuality({ ...formQuality, employee_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih karyawan" />
                          </SelectTrigger>
                          <SelectContent>
                            {employeeList.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.employee_id} - {emp.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Separator className="my-2" />
                        <h4 className="font-semibold mb-3">Kriteria Kesalahan</h4>
                      </div>
                      {kriteriaKesalahan.map((kriteria) => (
                        <div key={kriteria.kode} className="space-y-2">
                          <Label>{kriteria.nama}</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formQuality[kriteria.field as keyof typeof formQuality]}
                            onChange={(e) => setFormQuality({ ...formQuality, [kriteria.field]: parseInt(e.target.value) || 0 })}
                            placeholder="Jumlah kesalahan"
                          />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <Separator className="my-2" />
                        <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Total Nilai Kesalahan</p>
                            <p className="text-2xl font-bold text-blue-600">{getTotalKesalahan()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Koefisien PQ</p>
                            <p className="text-2xl font-bold text-green-600">{calculateKoefisienPQ(getTotalKesalahan()).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Keterangan (Opsional)</Label>
                        <Textarea
                          placeholder="Catatan tambahan..."
                          value={formQuality.keterangan}
                          onChange={(e) => setFormQuality({ ...formQuality, keterangan: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogQualityOpen(false)} disabled={isLoading}>Batal</Button>
                      <Button onClick={handleSubmitQuality} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {editingQuality ? 'Update' : 'Simpan'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Table */}
              {qualityCheckData.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Belum ada data quality check. Klik tombol "Input Quality Check" untuk menambah data.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>ID Karyawan</TableHead>
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead className="text-center">Dangkal</TableHead>
                        <TableHead className="text-center">Luka</TableHead>
                        <TableHead className="text-center">Sudut</TableHead>
                        <TableHead className="text-center">Kulit</TableHead>
                        <TableHead className="text-center">Alat</TableHead>
                        <TableHead className="text-center">Disiplin</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Koef. PQ</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qualityCheckData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{format(new Date(item.tanggal_pemeriksaan), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                          <TableCell className="font-mono">{item.employees?.employee_id || '-'}</TableCell>
                          <TableCell className="font-medium">{item.employees?.full_name || '-'}</TableCell>
                          <TableCell className="text-center">{item.kesalahan_dangkal || 0}</TableCell>
                          <TableCell className="text-center">{item.kesalahan_luka || 0}</TableCell>
                          <TableCell className="text-center">{item.kesalahan_sudut || 0}</TableCell>
                          <TableCell className="text-center">{item.kesalahan_kulit || 0}</TableCell>
                          <TableCell className="text-center">{item.kesalahan_alat || 0}</TableCell>
                          <TableCell className="text-center">{item.kesalahan_disiplin || 0}</TableCell>
                          <TableCell className="text-center font-semibold">{item.total_kesalahan || 0}</TableCell>
                          <TableCell className="text-center font-semibold text-green-600">{item.koefisien_pq?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingQuality(item);
                                  setFormQuality({
                                    employee_id: item.employee_id,
                                    kesalahan_dangkal: item.kesalahan_dangkal || 0,
                                    kesalahan_luka: item.kesalahan_luka || 0,
                                    kesalahan_sudut: item.kesalahan_sudut || 0,
                                    kesalahan_kulit: item.kesalahan_kulit || 0,
                                    kesalahan_alat: item.kesalahan_alat || 0,
                                    kesalahan_disiplin: item.kesalahan_disiplin || 0,
                                    keterangan: item.keterangan || ''
                                  });
                                  setSelectedDateQuality(new Date(item.tanggal_pemeriksaan));
                                  setIsDialogQualityOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteQuality(item.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PERHITUNGAN PREMI */}
        <TabsContent value="perhitungan" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Perhitungan Premi Deres</CardTitle>
                  <CardDescription>Perhitungan premi deres per periode (Coming Soon)</CardDescription>
                </div>
                <Button disabled>
                  <Calculator className="mr-2 h-4 w-4" />
                  Hitung Premi Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Fitur perhitungan premi otomatis sedang dalam pengembangan. Saat ini fokus pada input data produksi dan quality check terlebih dahulu.
                </AlertDescription>
              </Alert>

              {periodePerhitungan.length > 0 && (
                <div className="mt-4 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periode</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periodePerhitungan.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.periode_nama}</TableCell>
                          <TableCell>
                            {format(new Date(item.tanggal_mulai), 'dd MMM', { locale: localeId })} - {format(new Date(item.tanggal_akhir), 'dd MMM yyyy', { locale: localeId })}
                          </TableCell>
                          <TableCell>{item.divisi || '-'}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiDeresPenggajian;
