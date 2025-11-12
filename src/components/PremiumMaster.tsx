import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Filter, Download, Edit2, Trash2, Plus, Award } from 'lucide-react';
import { NaturaMaster } from './NaturaMaster';

interface Premium {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'production' | 'attendance' | 'overtime' | 'transport' | 'meal' | 'quality' | 'target' | 'other';
  calculationType: 'fixed' | 'percentage' | 'per-unit' | 'per-ton';
  baseAmount: number;
  minValue?: number;
  maxValue?: number;
  isActive: boolean;
  isTaxable: boolean;
  createdDate: Date;
}

export function PremiumMaster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPremium, setSelectedPremium] = useState<Premium | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'production',
    calculationType: 'fixed',
    baseAmount: '',
    minValue: '',
    maxValue: '',
    isActive: true,
    isTaxable: false,
  });

  const [premiums, setPremiums] = useState<Premium[]>([
    {
      id: '1',
      code: 'PROD-001',
      name: 'Premi Produksi TBS',
      description: 'Premi berdasarkan tonase Tandan Buah Segar (TBS) yang dipanen',
      type: 'production',
      calculationType: 'per-ton',
      baseAmount: 50000,
      minValue: 0,
      maxValue: 1000000,
      isActive: true,
      isTaxable: true,
      createdDate: new Date('2024-01-15'),
    },
    {
      id: '2',
      code: 'HADIR-001',
      name: 'Premi Kehadiran',
      description: 'Premi untuk kehadiran penuh dalam satu bulan',
      type: 'attendance',
      calculationType: 'fixed',
      baseAmount: 500000,
      isActive: true,
      isTaxable: true,
      createdDate: new Date('2024-01-15'),
    },
    {
      id: '3',
      code: 'KUALITAS-001',
      name: 'Premi Kualitas Panen',
      description: 'Premi untuk kualitas buah yang dipanen (brondolan minimal)',
      type: 'quality',
      calculationType: 'percentage',
      baseAmount: 10,
      minValue: 0,
      maxValue: 25,
      isActive: true,
      isTaxable: true,
      createdDate: new Date('2024-02-01'),
    },
    {
      id: '4',
      code: 'TRANS-001',
      name: 'Tunjangan Transportasi',
      description: 'Tunjangan biaya transportasi harian',
      type: 'transport',
      calculationType: 'fixed',
      baseAmount: 300000,
      isActive: true,
      isTaxable: false,
      createdDate: new Date('2024-01-15'),
    },
    {
      id: '5',
      code: 'MAKAN-001',
      name: 'Tunjangan Makan',
      description: 'Tunjangan makan harian untuk karyawan lapangan',
      type: 'meal',
      calculationType: 'fixed',
      baseAmount: 400000,
      isActive: true,
      isTaxable: false,
      createdDate: new Date('2024-01-15'),
    },
    {
      id: '6',
      code: 'LEMBUR-001',
      name: 'Premi Lembur',
      description: 'Premi untuk jam kerja lembur',
      type: 'overtime',
      calculationType: 'per-unit',
      baseAmount: 25000,
      isActive: true,
      isTaxable: true,
      createdDate: new Date('2024-01-20'),
    },
  ]);

  const filteredPremiums = premiums.filter((premium) => {
    const matchesSearch = 
      premium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      premium.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || premium.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && premium.isActive) ||
      (statusFilter === 'inactive' && !premium.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'production',
      calculationType: 'fixed',
      baseAmount: '',
      minValue: '',
      maxValue: '',
      isActive: true,
      isTaxable: false,
    });
  };

  const handleAddPremium = () => {
    const newPremium: Premium = {
      id: String(premiums.length + 1),
      code: formData.code,
      name: formData.name,
      description: formData.description,
      type: formData.type as Premium['type'],
      calculationType: formData.calculationType as Premium['calculationType'],
      baseAmount: parseFloat(formData.baseAmount) || 0,
      minValue: formData.minValue ? parseFloat(formData.minValue) : undefined,
      maxValue: formData.maxValue ? parseFloat(formData.maxValue) : undefined,
      isActive: formData.isActive,
      isTaxable: formData.isTaxable,
      createdDate: new Date(),
    };

    setPremiums([...premiums, newPremium]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditPremium = (premium: Premium) => {
    setSelectedPremium(premium);
    setFormData({
      code: premium.code,
      name: premium.name,
      description: premium.description,
      type: premium.type,
      calculationType: premium.calculationType,
      baseAmount: String(premium.baseAmount),
      minValue: premium.minValue ? String(premium.minValue) : '',
      maxValue: premium.maxValue ? String(premium.maxValue) : '',
      isActive: premium.isActive,
      isTaxable: premium.isTaxable,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePremium = () => {
    if (!selectedPremium) return;

    const updatedPremiums = premiums.map(premium => 
      premium.id === selectedPremium.id 
        ? {
            ...premium,
            code: formData.code,
            name: formData.name,
            description: formData.description,
            type: formData.type as Premium['type'],
            calculationType: formData.calculationType as Premium['calculationType'],
            baseAmount: parseFloat(formData.baseAmount) || 0,
            minValue: formData.minValue ? parseFloat(formData.minValue) : undefined,
            maxValue: formData.maxValue ? parseFloat(formData.maxValue) : undefined,
            isActive: formData.isActive,
            isTaxable: formData.isTaxable,
          }
        : premium
    );

    setPremiums(updatedPremiums);
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedPremium(null);
  };

  const handleDeletePremium = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus premi ini?')) {
      setPremiums(premiums.filter(premium => premium.id !== id));
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      production: 'Produksi',
      attendance: 'Kehadiran',
      overtime: 'Lembur',
      transport: 'Transportasi',
      meal: 'Makan',
      quality: 'Kualitas',
      target: 'Target',
      other: 'Lainnya',
    };
    return types[type] || type;
  };

  const getCalculationLabel = (type: string) => {
    const types: Record<string, string> = {
      fixed: 'Tetap',
      percentage: 'Persentase',
      'per-unit': 'Per Unit',
      'per-ton': 'Per Ton',
    };
    return types[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { className: string }> = {
      production: { className: 'bg-[#2c7be5]/10 text-[#2c7be5]' },
      attendance: { className: 'bg-[#00d27a]/10 text-[#00d27a]' },
      overtime: { className: 'bg-[#f5803e]/10 text-[#f5803e]' },
      transport: { className: 'bg-[#27bcfd]/10 text-[#27bcfd]' },
      meal: { className: 'bg-[#e63757]/10 text-[#e63757]' },
      quality: { className: 'bg-[#95aac9]/10 text-[#95aac9]' },
      target: { className: 'bg-primary/10 text-primary' },
      other: { className: 'bg-muted text-muted-foreground' },
    };
    
    const config = typeConfig[type] || typeConfig.other;
    return <Badge variant="secondary" className={`${config.className} hover:${config.className}`}>{getTypeLabel(type)}</Badge>;
  };

  const PremiumFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Kode Premi *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="PROD-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama Premi *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Premi Produksi TBS"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Deskripsi premi..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Jenis Premi *</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Produksi</SelectItem>
              <SelectItem value="attendance">Kehadiran</SelectItem>
              <SelectItem value="overtime">Lembur</SelectItem>
              <SelectItem value="transport">Transportasi</SelectItem>
              <SelectItem value="meal">Makan</SelectItem>
              <SelectItem value="quality">Kualitas</SelectItem>
              <SelectItem value="target">Target</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="calculationType">Tipe Perhitungan *</Label>
          <Select value={formData.calculationType} onValueChange={(value) => handleInputChange('calculationType', value)}>
            <SelectTrigger id="calculationType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Tetap</SelectItem>
              <SelectItem value="percentage">Persentase (%)</SelectItem>
              <SelectItem value="per-unit">Per Unit</SelectItem>
              <SelectItem value="per-ton">Per Ton</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="baseAmount">
            {formData.calculationType === 'percentage' ? 'Persentase (%)' : 'Nilai Dasar (Rp)'} *
          </Label>
          <Input
            id="baseAmount"
            type="number"
            value={formData.baseAmount}
            onChange={(e) => handleInputChange('baseAmount', e.target.value)}
            placeholder={formData.calculationType === 'percentage' ? '10' : '50000'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minValue">Nilai Minimum (Opsional)</Label>
          <Input
            id="minValue"
            type="number"
            value={formData.minValue}
            onChange={(e) => handleInputChange('minValue', e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxValue">Nilai Maksimum (Opsional)</Label>
          <Input
            id="maxValue"
            type="number"
            value={formData.maxValue}
            onChange={(e) => handleInputChange('maxValue', e.target.value)}
            placeholder="1000000"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
          <div>
            <Label htmlFor="isActive" className="cursor-pointer">Status Aktif</Label>
            <p className="text-sm text-muted-foreground">Premi dapat digunakan dalam perhitungan gaji</p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleInputChange('isActive', checked)}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
          <div>
            <Label htmlFor="isTaxable" className="cursor-pointer">Kena Pajak</Label>
            <p className="text-sm text-muted-foreground">Premi dikenakan pajak penghasilan</p>
          </div>
          <Switch
            id="isTaxable"
            checked={formData.isTaxable}
            onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Tunjangan & Natura</h1>
        <p className="text-muted-foreground">Kelola komponen tunjangan tetap, dan natura untuk karyawan perkebunan sawit</p>
      </div>

      <Tabs defaultValue="premium" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="premium">Tunjangan</TabsTrigger>
          <TabsTrigger value="natura">Natura</TabsTrigger>
        </TabsList>

        <TabsContent value="premium" className="space-y-4">
          {/* Premium Content Start */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Premi</p>
              <h3 className="text-2xl">{premiums.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <Award size={24} className="text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Premi Aktif</p>
              <h3 className="text-2xl">{premiums.filter(p => p.isActive).length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#00d27a]/10 rounded flex items-center justify-center">
              <Award size={24} className="text-[#00d27a]" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Premi Produksi</p>
              <h3 className="text-2xl">{premiums.filter(p => p.type === 'production').length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#2c7be5]/10 rounded flex items-center justify-center">
              <Award size={24} className="text-[#2c7be5]" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kena Pajak</p>
              <h3 className="text-2xl">{premiums.filter(p => p.isTaxable).length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#f5803e]/10 rounded flex items-center justify-center">
              <Award size={24} className="text-[#f5803e]" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari berdasarkan nama atau kode premi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Jenis Premi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="production">Produksi</SelectItem>
                  <SelectItem value="attendance">Kehadiran</SelectItem>
                  <SelectItem value="overtime">Lembur</SelectItem>
                  <SelectItem value="transport">Transportasi</SelectItem>
                  <SelectItem value="meal">Makan</SelectItem>
                  <SelectItem value="quality">Kualitas</SelectItem>
                  <SelectItem value="target">Target</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                <Download size={16} />
                <span className="hidden sm:inline">Ekspor</span>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 flex-1 sm:flex-none" onClick={resetForm}>
                    <Plus size={16} />
                    Tambah Premi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Premi Baru</DialogTitle>
                    <DialogDescription>
                      Tambahkan premi atau tunjangan baru ke dalam sistem
                    </DialogDescription>
                  </DialogHeader>
                  <PremiumFormFields />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                    <Button onClick={handleAddPremium}>Simpan Premi</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Kode</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Nama Premi</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Jenis</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Perhitungan</th>
                <th className="text-right px-4 md:px-6 py-3 text-sm text-muted-foreground">Nilai Dasar</th>
                <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Pajak</th>
                <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Status</th>
                <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPremiums.map((premium) => (
                <tr key={premium.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 md:px-6 py-4">
                    <span className="font-medium">{premium.code}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <p className="mb-0">{premium.name}</p>
                      {premium.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{premium.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">{getTypeBadge(premium.type)}</td>
                  <td className="px-4 md:px-6 py-4 text-muted-foreground">{getCalculationLabel(premium.calculationType)}</td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    {premium.calculationType === 'percentage' 
                      ? `${premium.baseAmount}%` 
                      : formatCurrency(premium.baseAmount)
                    }
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    {premium.isTaxable ? (
                      <Badge variant="secondary" className="bg-[#f5803e]/10 text-[#f5803e]">Ya</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">Tidak</Badge>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    {premium.isActive ? (
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
                        onClick={() => handleEditPremium(premium)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeletePremium(premium.id)}
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

        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground">
            Menampilkan {filteredPremiums.length} dari {premiums.length} premi
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Sebelumnya</Button>
            <Button variant="outline" size="sm">Berikutnya</Button>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Premi</DialogTitle>
            <DialogDescription>
              Perbarui informasi premi atau tunjangan yang dipilih
            </DialogDescription>
          </DialogHeader>
          <PremiumFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleUpdatePremium}>Update Premi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          {/* Premium Content End */}
        </TabsContent>

        <TabsContent value="natura">
          <NaturaMaster />
        </TabsContent>
      </Tabs>
    </div>
  );
}
