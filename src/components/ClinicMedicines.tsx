/**
 * ==========================================================================
 * CLINIC MODULE - MASTER DATA OBAT
 * ==========================================================================
 *
 * Komponen untuk mengelola master data obat/medicine di klinik.
 * Fitur: CRUD, search, filter by category, stock info
 *
 * #ClinicModule #MasterData #Medicines
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-03
 * ==========================================================================
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Pill,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

// TypeScript interfaces
interface MedicineCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

interface Medicine {
  id: string;
  medicine_code: string;
  name: string;
  generic_name: string;
  category_id: string;
  category_name?: string;
  dosage_form: string;
  strength: string;
  unit: string;
  manufacturer: string | null;
  min_stock: number;
  price_per_unit: number;
  require_prescription: boolean;
  description: string | null;
  is_active: boolean;
  current_stock?: number;
  created_at?: string;
}

interface MedicineFormData {
  medicine_code: string;
  name: string;
  generic_name: string;
  category_id: string;
  dosage_form: string;
  strength: string;
  unit: string;
  manufacturer: string;
  min_stock: number;
  price_per_unit: number;
  require_prescription: boolean;
  description: string;
  is_active: boolean;
}

const DOSAGE_FORMS = [
  'Tablet', 'Kapsul', 'Sirup', 'Injeksi', 'Salep', 'Krim',
  'Tetes', 'Spray', 'Inhaler', 'Suppositoria', 'Cairan'
];

const UNITS = [
  'tablet', 'kapsul', 'botol', 'tube', 'ampul', 'vial', 'sachet', 'strip', 'box'
];

export function ClinicMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<MedicineFormData>({
    medicine_code: '',
    name: '',
    generic_name: '',
    category_id: '',
    dosage_form: 'Tablet',
    strength: '',
    unit: 'tablet',
    manufacturer: '',
    min_stock: 10,
    price_per_unit: 0,
    require_prescription: false,
    description: '',
    is_active: true,
  });

  // Load categories and medicines
  useEffect(() => {
    loadCategories();
    loadMedicines();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_medicine_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error('Gagal memuat kategori obat');
    }
  };

  const loadMedicines = async () => {
    try {
      setIsLoading(true);

      // Load medicines with category name
      const { data: medicinesData, error: medicinesError } = await supabase
        .from('clinic_medicines')
        .select(`
          *,
          category:clinic_medicine_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (medicinesError) throw medicinesError;

      // Load stock data
      const { data: stockData, error: stockError } = await supabase
        .from('clinic_medicine_stock')
        .select('medicine_id, quantity')
        .eq('status', 'available');

      if (stockError) throw stockError;

      // Aggregate stock by medicine_id
      const stockMap = new Map<string, number>();
      stockData?.forEach(stock => {
        const current = stockMap.get(stock.medicine_id) || 0;
        stockMap.set(stock.medicine_id, current + stock.quantity);
      });

      // Combine data
      const medicinesWithStock = medicinesData?.map(med => ({
        ...med,
        category_name: med.category?.name || 'N/A',
        current_stock: stockMap.get(med.id) || 0,
      })) || [];

      setMedicines(medicinesWithStock);
    } catch (error: any) {
      console.error('Error loading medicines:', error);
      toast.error('Gagal memuat data obat');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.medicine_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || med.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (field: keyof MedicineFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      medicine_code: '',
      name: '',
      generic_name: '',
      category_id: '',
      dosage_form: 'Tablet',
      strength: '',
      unit: 'tablet',
      manufacturer: '',
      min_stock: 10,
      price_per_unit: 0,
      require_prescription: false,
      description: '',
      is_active: true,
    });
  };

  const handleAddMedicine = async () => {
    try {
      // Validation
      if (!formData.medicine_code || !formData.name || !formData.generic_name || !formData.category_id) {
        toast.error('Mohon lengkapi field yang wajib diisi');
        return;
      }

      const { data, error } = await supabase
        .from('clinic_medicines')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Obat berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
      loadMedicines();
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      if (error.code === '23505') {
        toast.error('Kode obat sudah digunakan');
      } else {
        toast.error('Gagal menambahkan obat');
      }
    }
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      medicine_code: medicine.medicine_code,
      name: medicine.name,
      generic_name: medicine.generic_name,
      category_id: medicine.category_id,
      dosage_form: medicine.dosage_form,
      strength: medicine.strength,
      unit: medicine.unit,
      manufacturer: medicine.manufacturer || '',
      min_stock: medicine.min_stock,
      price_per_unit: medicine.price_per_unit,
      require_prescription: medicine.require_prescription,
      description: medicine.description || '',
      is_active: medicine.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMedicine = async () => {
    try {
      if (!selectedMedicine) return;

      const { error } = await supabase
        .from('clinic_medicines')
        .update(formData)
        .eq('id', selectedMedicine.id);

      if (error) throw error;

      toast.success('Obat berhasil diupdate');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedMedicine(null);
      loadMedicines();
    } catch (error: any) {
      console.error('Error updating medicine:', error);
      toast.error('Gagal mengupdate obat: ' + error.message);
    }
  };

  const handleDeleteMedicine = async (medicine: Medicine) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus obat "${medicine.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clinic_medicines')
        .delete()
        .eq('id', medicine.id);

      if (error) throw error;

      toast.success('Obat berhasil dihapus');
      loadMedicines();
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      if (error.code === '23503') {
        toast.error('Obat tidak dapat dihapus karena masih digunakan');
      } else {
        toast.error('Gagal menghapus obat');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Master Data Obat</h1>
              <p className="text-sm text-gray-500">Kelola data obat dan kategorinya</p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Obat
            </Button>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <DialogHeader>
                <DialogTitle>Tambah Obat Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi form di bawah untuk menambahkan obat baru
                </DialogDescription>
              </DialogHeader>

              {/* Form Fields - Scrollable */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[calc(85vh-200px)]">
                {/* Row 1: Code & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine_code">Kode Obat *</Label>
                    <Input
                      id="medicine_code"
                      value={formData.medicine_code}
                      onChange={(e) => handleInputChange('medicine_code', e.target.value)}
                      placeholder="MED001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Kategori *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleInputChange('category_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Name & Generic Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Dagang *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Paracetamol 500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="generic_name">Nama Generik *</Label>
                    <Input
                      id="generic_name"
                      value={formData.generic_name}
                      onChange={(e) => handleInputChange('generic_name', e.target.value)}
                      placeholder="Paracetamol"
                    />
                  </div>
                </div>

                {/* Row 3: Dosage Form, Strength, Unit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage_form">Bentuk Sediaan *</Label>
                    <Select
                      value={formData.dosage_form}
                      onValueChange={(value) => handleInputChange('dosage_form', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOSAGE_FORMS.map(form => (
                          <SelectItem key={form} value={form}>{form}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="strength">Kekuatan *</Label>
                    <Input
                      id="strength"
                      value={formData.strength}
                      onChange={(e) => handleInputChange('strength', e.target.value)}
                      placeholder="500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Satuan *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleInputChange('unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 4: Manufacturer & Min Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Pabrik</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                      placeholder="Kimia Farma"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_stock">Stok Minimum</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) => handleInputChange('min_stock', parseInt(e.target.value) || 0)}
                      placeholder="10"
                    />
                  </div>
                </div>

                {/* Row 5: Price */}
                <div className="space-y-2">
                  <Label htmlFor="price_per_unit">Harga per Unit (Rp)</Label>
                  <Input
                    id="price_per_unit"
                    type="number"
                    value={formData.price_per_unit}
                    onChange={(e) => handleInputChange('price_per_unit', parseFloat(e.target.value) || 0)}
                    placeholder="5000"
                  />
                </div>

                {/* Row 6: Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Keterangan</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Catatan tambahan tentang obat ini..."
                    rows={3}
                  />
                </div>

                {/* Row 7: Switches */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Memerlukan Resep Dokter</Label>
                      <p className="text-sm text-muted-foreground">
                        Obat hanya dapat diberikan dengan resep dokter
                      </p>
                    </div>
                    <Switch
                      checked={formData.require_prescription}
                      onCheckedChange={(checked) => handleInputChange('require_prescription', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Status Aktif</Label>
                      <p className="text-sm text-muted-foreground">
                        Obat dapat digunakan dalam sistem
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 shrink-0 pt-4 pb-2 border-t bg-white sticky bottom-0 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  className="border-gray-300"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleAddMedicine}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Obat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari obat (nama, kode, generic, pabrik)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Obat</p>
                <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
              </div>
              <Pill className="w-8 h-8 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Obat Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {medicines.filter(m => m.is_active).length}
                </p>
              </div>
              <PackageCheck className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Perlu Resep</p>
                <p className="text-2xl font-bold text-amber-600">
                  {medicines.filter(m => m.require_prescription).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stok Rendah</p>
                <p className="text-2xl font-bold text-red-600">
                  {medicines.filter(m => (m.current_stock || 0) < m.min_stock).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Obat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sediaan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data obat
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {medicine.medicine_code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-gray-500">{medicine.generic_name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {medicine.category_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {medicine.dosage_form} {medicine.strength}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${
                          (medicine.current_stock || 0) < medicine.min_stock
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {medicine.current_stock || 0} {medicine.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Rp {medicine.price_per_unit.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {medicine.is_active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Nonaktif</Badge>
                          )}
                          {medicine.require_prescription && (
                            <Badge variant="default" className="bg-amber-100 text-amber-800">
                              Resep
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMedicine(medicine)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMedicine(medicine)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Obat</DialogTitle>
            <DialogDescription>
              Update informasi obat {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[calc(85vh-200px)]">
            {/* Row 1: Code & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_medicine_code">Kode Obat *</Label>
                <Input
                  id="edit_medicine_code"
                  value={formData.medicine_code}
                  onChange={(e) => handleInputChange('medicine_code', e.target.value)}
                  placeholder="MED001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_category_id">Kategori *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Name & Generic Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nama Dagang *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Amoxicillin 500mg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_generic_name">Nama Generik *</Label>
                <Input
                  id="edit_generic_name"
                  value={formData.generic_name}
                  onChange={(e) => handleInputChange('generic_name', e.target.value)}
                  placeholder="Amoxicillin"
                />
              </div>
            </div>

            {/* Row 3: Dosage Form, Strength, Unit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_dosage_form">Bentuk Sediaan *</Label>
                <Select
                  value={formData.dosage_form}
                  onValueChange={(value) => handleInputChange('dosage_form', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOSAGE_FORMS.map(form => (
                      <SelectItem key={form} value={form}>{form}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_strength">Kekuatan *</Label>
                <Input
                  id="edit_strength"
                  value={formData.strength}
                  onChange={(e) => handleInputChange('strength', e.target.value)}
                  placeholder="500mg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_unit">Satuan *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleInputChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Manufacturer & Min Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_manufacturer">Pabrik</Label>
                <Input
                  id="edit_manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="Sanbe Farma"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_min_stock">Stok Minimum</Label>
                <Input
                  id="edit_min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => handleInputChange('min_stock', parseInt(e.target.value) || 0)}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Row 5: Price */}
            <div className="space-y-2">
              <Label htmlFor="edit_price_per_unit">Harga per Unit (Rp)</Label>
              <Input
                id="edit_price_per_unit"
                type="number"
                value={formData.price_per_unit}
                onChange={(e) => handleInputChange('price_per_unit', parseFloat(e.target.value) || 0)}
                placeholder="1500"
              />
            </div>

            {/* Row 6: Description */}
            <div className="space-y-2">
              <Label htmlFor="edit_description">Keterangan</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Catatan tambahan tentang obat ini..."
                rows={3}
              />
            </div>

            {/* Row 7: Switches */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Memerlukan Resep Dokter</Label>
                  <p className="text-sm text-muted-foreground">
                    Obat hanya dapat diberikan dengan resep dokter
                  </p>
                </div>
                <Switch
                  checked={formData.require_prescription}
                  onCheckedChange={(checked) => handleInputChange('require_prescription', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status Aktif</Label>
                  <p className="text-sm text-muted-foreground">
                    Obat dapat digunakan dalam sistem
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0 pt-4 pb-2 border-t bg-white sticky bottom-0 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedMedicine(null);
              }}
              className="border-gray-300"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateMedicine}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Obat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
