import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Edit2, Trash2, Plus, DollarSign, TrendingUp, Building, Loader2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { useWageScales } from '../hooks/useWageScales';
import { useDivisions } from '../hooks/useDivisions';
import { toast } from 'sonner';

interface WageFormData {
  year: string;
  divisionId: string;
  grade: string;
  scale: string;
  baseSalary: string;
  description: string;
  isActive: boolean;
}

interface WageFormFieldsProps {
  formData: WageFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  minimumWage: number;
  divisions: any[];
}

const WageFormFields = ({ formData, onInputChange, minimumWage, divisions }: WageFormFieldsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate year options (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Tahun *</Label>
          <Select
            value={formData.year}
            onValueChange={(value) => onInputChange('year', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="divisionId">Divisi *</Label>
          <Select
            value={formData.divisionId}
            onValueChange={(value) => onInputChange('divisionId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih divisi" />
            </SelectTrigger>
            <SelectContent>
              {divisions.filter(d => d.kode_divisi).map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.kode_divisi} - {division.nama_divisi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade">Golongan *</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) => onInputChange('grade', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih golongan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pegawai">Pegawai</SelectItem>
              <SelectItem value="karyawan">Karyawan</SelectItem>
              <SelectItem value="pkwt">PKWT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scale">Skala *</Label>
          <Input
            id="scale"
            value={formData.scale}
            onChange={(e) => onInputChange('scale', e.target.value)}
            placeholder="I-1, II-1, III-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseSalary">Upah Pokok *</Label>
        <Input
          id="baseSalary"
          type="number"
          value={formData.baseSalary}
          onChange={(e) => onInputChange('baseSalary', e.target.value)}
          placeholder="2900000"
        />
        <p className="text-xs text-muted-foreground">
          Upah minimum: {formatCurrency(minimumWage)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Deskripsi skala upah..."
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
        <div>
          <Label htmlFor="isActive" className="cursor-pointer">Status Aktif</Label>
          <p className="text-sm text-muted-foreground">Skala upah dapat digunakan</p>
        </div>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => onInputChange('isActive', checked)}
        />
      </div>
    </div>
  );
};

export function WageMaster() {
  const currentYear = new Date().getFullYear();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWage, setSelectedWage] = useState<any>(null);

  // Use Supabase hooks
  const { wageScales, loading, error, addWageScale, updateWageScale, deleteWageScale } = useWageScales();
  const { divisions, loading: divisionsLoading } = useDivisions();

  const [formData, setFormData] = useState({
    year: String(currentYear),
    divisionId: '',
    grade: 'pegawai',
    scale: '',
    baseSalary: '',
    description: '',
    isActive: true,
  });

  // Upah Minimum dari divisi kebun (berdasarkan UMP Sumatera Utara)
  const MINIMUM_WAGE = 2900000;

  // Filter wage scales based on search and filters
  const filteredWageScales = wageScales.filter((wage) => {
    const matchesSearch =
      wage.skala.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wage.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || wage.golongan === gradeFilter;
    const matchesDivision = divisionFilter === 'all' || wage.divisi_id === divisionFilter;
    const matchesYear = yearFilter === 'all' || String(wage.tahun) === yearFilter;
    return matchesSearch && matchesGrade && matchesDivision && matchesYear;
  });

  /*
  // Old hardcoded data - now fetched from Supabase
  const [wageScales, setWageScales] = useState<WageScale[]>([
    // TAHUN 2024
    // DIVISI BB - Bangun Bandar
    {
      id: '1',
      year: 2024,
      divisionId: '7',
      grade: 'pegawai',
      scale: 'I-1',
      baseSalary: 2900000,
      description: 'Pegawai tingkat awal',
      isActive: true,
    },
    {
      id: '2',
      year: 2024,
      divisionId: '7',
      grade: 'pegawai',
      scale: 'I-2',
      baseSalary: 2950000,
      description: 'Pegawai dengan pengalaman 1-2 tahun',
      isActive: true,
    },
    {
      id: '3',
      year: 2024,
      divisionId: '7',
      grade: 'pegawai',
      scale: 'I-3',
      baseSalary: 3000000,
      description: 'Pegawai dengan pengalaman 2-3 tahun',
      isActive: true,
    },
    {
      id: '11',
      year: 2024,
      divisionId: '7',
      grade: 'karyawan',
      scale: 'II-1',
      baseSalary: 2900000,
      description: 'Karyawan tingkat awal',
      isActive: true,
    },
    {
      id: '12',
      year: 2024,
      divisionId: '7',
      grade: 'karyawan',
      scale: 'II-2',
      baseSalary: 2950000,
      description: 'Karyawan dengan pengalaman 1-2 tahun',
      isActive: true,
    },
    {
      id: '21',
      year: 2024,
      divisionId: '7',
      grade: 'pkwt',
      scale: 'III-1',
      baseSalary: 2900000,
      description: 'Karyawan Kontrak (PKWT) sesuai UMP',
      isActive: true,
    },
    
    // DIVISI TG - PT Socfindo Kebun TG
    {
      id: '31',
      year: 2024,
      divisionId: '8',
      grade: 'pegawai',
      scale: 'I-1',
      baseSalary: 2900000,
      description: 'Pegawai tingkat awal',
      isActive: true,
    },
    {
      id: '32',
      year: 2024,
      divisionId: '8',
      grade: 'pegawai',
      scale: 'I-2',
      baseSalary: 2950000,
      description: 'Pegawai dengan pengalaman 1-2 tahun',
      isActive: true,
    },
    {
      id: '41',
      year: 2024,
      divisionId: '8',
      grade: 'karyawan',
      scale: 'II-1',
      baseSalary: 2900000,
      description: 'Karyawan tingkat awal',
      isActive: true,
    },
    
    // DIVISI HO - Head Office
    {
      id: '51',
      year: 2024,
      divisionId: '13',
      grade: 'pegawai',
      scale: 'I-1',
      baseSalary: 3200000,
      description: 'Pegawai tingkat awal - Head Office',
      isActive: true,
    },
    {
      id: '52',
      year: 2024,
      divisionId: '13',
      grade: 'pegawai',
      scale: 'I-2',
      baseSalary: 3300000,
      description: 'Pegawai dengan pengalaman 1-2 tahun - Head Office',
      isActive: true,
    },
    {
      id: '61',
      year: 2024,
      divisionId: '13',
      grade: 'karyawan',
      scale: 'II-1',
      baseSalary: 3200000,
      description: 'Karyawan tingkat awal - Head Office',
      isActive: true,
    },
    
    // TAHUN 2025 - Dengan kenaikan upah
    // DIVISI BB - Bangun Bandar
    {
      id: '101',
      year: 2025,
      divisionId: '7',
      grade: 'pegawai',
      scale: 'I-1',
      baseSalary: 3050000,
      description: 'Pegawai tingkat awal',
      isActive: true,
    },
    {
      id: '102',
      year: 2025,
      divisionId: '7',
      grade: 'pegawai',
      scale: 'I-2',
      baseSalary: 3100000,
      description: 'Pegawai dengan pengalaman 1-2 tahun',
      isActive: true,
    },
    {
      id: '103',
      year: 2025,
      divisionId: '7',
      grade: 'pegawai',
      scale: 'I-3',
      baseSalary: 3150000,
      description: 'Pegawai dengan pengalaman 2-3 tahun',
      isActive: true,
    },
    {
      id: '111',
      year: 2025,
      divisionId: '7',
      grade: 'karyawan',
      scale: 'II-1',
      baseSalary: 3050000,
      description: 'Karyawan tingkat awal',
      isActive: true,
    },
    {
      id: '112',
      year: 2025,
      divisionId: '7',
      grade: 'karyawan',
      scale: 'II-2',
      baseSalary: 3100000,
      description: 'Karyawan dengan pengalaman 1-2 tahun',
      isActive: true,
    },
    {
      id: '121',
      year: 2025,
      divisionId: '7',
      grade: 'pkwt',
      scale: 'III-1',
      baseSalary: 3050000,
      description: 'Karyawan Kontrak (PKWT) sesuai UMP',
      isActive: true,
    },
    
    // DIVISI HO - Head Office 2025
    {
      id: '151',
      year: 2025,
      divisionId: '13',
      grade: 'pegawai',
      scale: 'I-1',
      baseSalary: 3400000,
      description: 'Pegawai tingkat awal - Head Office',
      isActive: true,
    },
    {
      id: '152',
      year: 2025,
      divisionId: '13',
      grade: 'pegawai',
      scale: 'I-2',
      baseSalary: 3500000,
      description: 'Pegawai dengan pengalaman 1-2 tahun - Head Office',
      isActive: true,
    },
    {
      id: '161',
      year: 2025,
      divisionId: '13',
      grade: 'karyawan',
      scale: 'II-1',
      baseSalary: 3400000,
      description: 'Karyawan tingkat awal - Head Office',
      isActive: true,
    },
  ]);
  */

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      year: String(currentYear),
      divisionId: '',
      grade: 'pegawai',
      scale: '',
      baseSalary: '',
      description: '',
      isActive: true,
    });
  };

  const handleAddWage = async () => {
    if (!formData.year || !formData.divisionId || !formData.scale || !formData.baseSalary) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const { error } = await addWageScale({
      tahun: parseInt(formData.year),
      divisi_id: formData.divisionId,
      golongan: formData.grade as 'pegawai' | 'karyawan' | 'pkwt',
      skala: formData.scale,
      upah_pokok: parseInt(formData.baseSalary),
      deskripsi: formData.description,
      is_active: formData.isActive,
    });

    if (!error) {
      toast.success('Skala upah berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      if (error.includes('duplicate') || error.includes('unique')) {
        toast.error('Skala upah dengan kombinasi tahun, divisi, golongan, dan skala yang sama sudah ada!');
      } else {
        toast.error('Gagal menambahkan skala upah: ' + error);
      }
    }
  };

  const handleEditWage = (wage: any) => {
    setSelectedWage(wage);
    setFormData({
      year: String(wage.tahun),
      divisionId: wage.divisi_id,
      grade: wage.golongan,
      scale: wage.skala,
      baseSalary: String(wage.upah_pokok),
      description: wage.deskripsi,
      isActive: wage.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateWage = async () => {
    if (!selectedWage) return;

    if (!formData.year || !formData.divisionId || !formData.scale || !formData.baseSalary) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const { error } = await updateWageScale(selectedWage.id, {
      tahun: parseInt(formData.year),
      divisi_id: formData.divisionId,
      golongan: formData.grade as 'pegawai' | 'karyawan' | 'pkwt',
      skala: formData.scale,
      upah_pokok: parseInt(formData.baseSalary),
      deskripsi: formData.description,
      is_active: formData.isActive,
    });

    if (!error) {
      toast.success('Skala upah berhasil diupdate');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedWage(null);
    } else {
      if (error.includes('duplicate') || error.includes('unique')) {
        toast.error('Skala upah dengan kombinasi tahun, divisi, golongan, dan skala yang sama sudah ada!');
      } else {
        toast.error('Gagal mengupdate skala upah: ' + error);
      }
    }
  };

  const handleDeleteWage = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus skala upah ini?')) {
      return;
    }

    const { error } = await deleteWageScale(id);

    if (!error) {
      toast.success('Skala upah berhasil dihapus');
    } else {
      toast.error('Gagal menghapus skala upah: ' + error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'pegawai':
        return 'bg-[#2c7be5]/10 text-[#2c7be5]';
      case 'karyawan':
        return 'bg-[#00d27a]/10 text-[#00d27a]';
      case 'pkwt':
        return 'bg-[#f5803e]/10 text-[#f5803e]';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getGradeLabel = (grade: string) => {
    switch (grade) {
      case 'pegawai':
        return 'Pegawai';
      case 'karyawan':
        return 'Karyawan';
      case 'pkwt':
        return 'PKWT';
      default:
        return grade;
    }
  };

  const getDivisionName = (divisionId: string) => {
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.kode_divisi : '-';
  };

  const getDivisionFullName = (divisionId: string) => {
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.nama_divisi : '-';
  };

  const calculateStats = () => {
    // Filter by current year filter
    const filteredByYear = yearFilter === 'all'
      ? wageScales
      : wageScales.filter(w => String(w.tahun) === yearFilter);

    const pegawaiScales = filteredByYear.filter(w => w.golongan === 'pegawai');
    const karyawanScales = filteredByYear.filter(w => w.golongan === 'karyawan');
    const pkwtScales = filteredByYear.filter(w => w.golongan === 'pkwt');

    const avgPegawai = pegawaiScales.length > 0
      ? Math.round(pegawaiScales.reduce((sum, w) => sum + w.upah_pokok, 0) / pegawaiScales.length)
      : 0;

    const avgKaryawan = karyawanScales.length > 0
      ? Math.round(karyawanScales.reduce((sum, w) => sum + w.upah_pokok, 0) / karyawanScales.length)
      : 0;

    // Hitung jumlah divisi unik yang memiliki skala upah (untuk tahun yang dipilih)
    const divisionsWithWages = new Set(filteredByYear.map(w => w.divisi_id)).size;

    // Hitung jumlah tahun unik
    const uniqueYears = new Set(wageScales.map(w => w.tahun)).size;

    return { pegawaiScales, karyawanScales, pkwtScales, avgPegawai, avgKaryawan, divisionsWithWages, uniqueYears };
  };

  const stats = calculateStats();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Master Skala Upah</h1>
        <p className="text-muted-foreground">Kelola skala upah pokok karyawan berdasarkan tahun, divisi dan golongan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Skala</p>
              <h3 className="text-2xl">{wageScales.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <DollarSign size={24} className="text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Jumlah Tahun</p>
              <h3 className="text-2xl">{stats.uniqueYears}</h3>
            </div>
            <div className="w-12 h-12 bg-[#e83e8c]/10 rounded flex items-center justify-center">
              <DollarSign size={24} className="text-[#e83e8c]" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Divisi</p>
              <h3 className="text-2xl">{stats.divisionsWithWages}</h3>
            </div>
            <div className="w-12 h-12 bg-[#6f42c1]/10 rounded flex items-center justify-center">
              <Building size={24} className="text-[#6f42c1]" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Skala Pegawai</p>
              <h3 className="text-2xl">{stats.pegawaiScales.length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#2c7be5]/10 rounded flex items-center justify-center">
              <TrendingUp size={24} className="text-[#2c7be5]" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Skala Karyawan</p>
              <h3 className="text-2xl">{stats.karyawanScales.length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#00d27a]/10 rounded flex items-center justify-center">
              <TrendingUp size={24} className="text-[#00d27a]" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Cari skala upah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {Array.from(new Set(wageScales.map(w => w.tahun)))
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {divisions.filter(d => d.kode_divisi).map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.kode_divisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter golongan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Golongan</SelectItem>
                  <SelectItem value="pegawai">Pegawai</SelectItem>
                  <SelectItem value="karyawan">Karyawan</SelectItem>
                  <SelectItem value="pkwt">PKWT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm}>
                  <Plus size={16} />
                  Tambah Skala
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Skala Upah Baru</DialogTitle>
                  <DialogDescription>
                    Lengkapi informasi skala upah baru
                  </DialogDescription>
                </DialogHeader>
                <WageFormFields
                  formData={formData}
                  onInputChange={handleInputChange}
                  minimumWage={MINIMUM_WAGE}
                  divisions={divisions}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                  <Button onClick={handleAddWage}>Simpan Data</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error: {error}
          </div>
        ) : filteredWageScales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data skala upah ditemukan
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Tahun</th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Divisi</th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Golongan</th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Skala</th>
                    <th className="text-right px-4 md:px-6 py-3 text-sm text-muted-foreground">Upah Pokok</th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Deskripsi</th>
                    <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Status</th>
                    <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWageScales.map((wage) => (
                <tr key={wage.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 md:px-6 py-4">
                    <span className="font-medium">{wage.tahun}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <div className="font-medium">{getDivisionName(wage.divisi_id)}</div>
                      <div className="text-xs text-muted-foreground">{getDivisionFullName(wage.divisi_id)}</div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <Badge variant="secondary" className={getGradeBadgeColor(wage.golongan)}>
                      {getGradeLabel(wage.golongan)}
                    </Badge>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="font-medium">{wage.skala}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <span className="font-medium">{formatCurrency(wage.upah_pokok)}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-muted-foreground">{wage.deskripsi}</td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    {wage.is_active ? (
                      <Badge variant="secondary" className="bg-[#00d27a]/10 text-[#00d27a]">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">Tidak Aktif</Badge>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditWage(wage)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteWage(wage.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border">
              <p className="text-xs md:text-sm text-muted-foreground">
                Menampilkan {filteredWageScales.length} dari {wageScales.length} skala upah
              </p>
            </div>
          </>
        )}
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Skala Upah</DialogTitle>
            <DialogDescription>
              Update informasi skala upah
            </DialogDescription>
          </DialogHeader>
          <WageFormFields
            formData={formData}
            onInputChange={handleInputChange}
            minimumWage={MINIMUM_WAGE}
            divisions={divisions}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleUpdateWage}>Update Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
