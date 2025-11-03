/**
 * ==========================================================================
 * CLINIC MODULE - MASTER DATA PENYAKIT (ICD-10)
 * ==========================================================================
 *
 * Komponen untuk mengelola master data penyakit/diagnosa menggunakan kode ICD-10.
 * Fitur: CRUD, search, filter by category, common diseases marking
 *
 * #ClinicModule #MasterData #Diseases #ICD10
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
  FileText,
  Activity,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

// TypeScript interfaces
interface Disease {
  id: string;
  icd10_code: string;
  name: string;
  category: string;
  description: string | null;
  is_common: boolean;
  is_active: boolean;
  created_at?: string;
}

interface DiseaseFormData {
  icd10_code: string;
  name: string;
  category: string;
  description: string;
  is_common: boolean;
  is_active: boolean;
}

const DISEASE_CATEGORIES = [
  'General', 'Respiratory', 'Digestive', 'Cardiovascular', 'Endocrine',
  'Musculoskeletal', 'Skin', 'Eye', 'ENT', 'Infections', 'Neurological',
  'Psychiatric', 'Reproductive', 'Urinary', 'Other'
];

export function ClinicDiseases() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCommonOnly, setShowCommonOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<DiseaseFormData>({
    icd10_code: '',
    name: '',
    category: 'General',
    description: '',
    is_common: false,
    is_active: true,
  });

  // Load diseases
  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clinic_diseases')
        .select('*')
        .order('icd10_code');

      if (error) throw error;
      setDiseases(data || []);
    } catch (error: any) {
      console.error('Error loading diseases:', error);
      toast.error('Gagal memuat data penyakit');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter diseases
  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch =
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.icd10_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || disease.category === selectedCategory;

    const matchesCommon = !showCommonOnly || disease.is_common;

    return matchesSearch && matchesCategory && matchesCommon;
  });

  const handleInputChange = (field: keyof DiseaseFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      icd10_code: '',
      name: '',
      category: 'General',
      description: '',
      is_common: false,
      is_active: true,
    });
  };

  const handleAddDisease = async () => {
    try {
      // Validation
      if (!formData.icd10_code || !formData.name) {
        toast.error('Mohon lengkapi field yang wajib diisi');
        return;
      }

      const { data, error } = await supabase
        .from('clinic_diseases')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Penyakit berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
      loadDiseases();
    } catch (error: any) {
      console.error('Error adding disease:', error);
      if (error.code === '23505') {
        toast.error('Kode ICD-10 sudah digunakan');
      } else {
        toast.error('Gagal menambahkan penyakit');
      }
    }
  };

  const handleEditDisease = (disease: Disease) => {
    setSelectedDisease(disease);
    setFormData({
      icd10_code: disease.icd10_code,
      name: disease.name,
      category: disease.category,
      description: disease.description || '',
      is_common: disease.is_common,
      is_active: disease.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDisease = async () => {
    try {
      if (!selectedDisease) return;

      const { error } = await supabase
        .from('clinic_diseases')
        .update(formData)
        .eq('id', selectedDisease.id);

      if (error) throw error;

      toast.success('Penyakit berhasil diupdate');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedDisease(null);
      loadDiseases();
    } catch (error: any) {
      console.error('Error updating disease:', error);
      toast.error('Gagal mengupdate penyakit');
    }
  };

  const handleDeleteDisease = async (disease: Disease) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus penyakit "${disease.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clinic_diseases')
        .delete()
        .eq('id', disease.id);

      if (error) throw error;

      toast.success('Penyakit berhasil dihapus');
      loadDiseases();
    } catch (error: any) {
      console.error('Error deleting disease:', error);
      if (error.code === '23503') {
        toast.error('Penyakit tidak dapat dihapus karena masih digunakan dalam rekam medis');
      } else {
        toast.error('Gagal menghapus penyakit');
      }
    }
  };

  const DiseaseFormFields = () => (
    <div className="space-y-4">
      {/* Row 1: ICD-10 Code & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icd10_code">Kode ICD-10 *</Label>
          <Input
            id="icd10_code"
            value={formData.icd10_code}
            onChange={(e) => handleInputChange('icd10_code', e.target.value.toUpperCase())}
            placeholder="J00"
          />
          <p className="text-xs text-gray-500">
            Gunakan kode ICD-10 standar internasional
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategori *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISEASE_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nama Penyakit *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Nasofaringitis akut (Common cold)"
        />
      </div>

      {/* Row 3: Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi / Catatan</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Deskripsi singkat tentang penyakit ini..."
          rows={3}
        />
      </div>

      {/* Row 4: Switches */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Penyakit Umum</Label>
            <p className="text-sm text-muted-foreground">
              Tandai jika penyakit ini sering terjadi (untuk quick access)
            </p>
          </div>
          <Switch
            checked={formData.is_common}
            onCheckedChange={(checked) => handleInputChange('is_common', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Status Aktif</Label>
            <p className="text-sm text-muted-foreground">
              Penyakit dapat digunakan dalam sistem
            </p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Master Data Penyakit</h1>
              <p className="text-sm text-gray-500">Kelola data penyakit dan diagnosa (ICD-10)</p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Penyakit
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Penyakit Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi form di bawah untuk menambahkan data penyakit baru
                </DialogDescription>
              </DialogHeader>
              <DiseaseFormFields />
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  Batal
                </Button>
                <Button onClick={handleAddDisease} className="bg-purple-600 hover:bg-purple-700">
                  Simpan
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
                  placeholder="Cari penyakit (nama, kode ICD-10, kategori)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {DISEASE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Common Filter */}
              <Button
                variant={showCommonOnly ? 'default' : 'outline'}
                onClick={() => setShowCommonOnly(!showCommonOnly)}
                className={showCommonOnly ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                <Star className="w-4 h-4 mr-2" />
                Umum Saja
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Penyakit</p>
                <p className="text-2xl font-bold text-gray-900">{diseases.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Penyakit Umum</p>
                <p className="text-2xl font-bold text-amber-600">
                  {diseases.filter(d => d.is_common).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-amber-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Penyakit Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {diseases.filter(d => d.is_active).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(diseases.map(d => d.category)).size}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
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
                    ICD-10
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Penyakit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
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
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredDiseases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data penyakit
                    </td>
                  </tr>
                ) : (
                  filteredDiseases.map((disease) => (
                    <tr key={disease.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                        {disease.icd10_code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {disease.name}
                        </div>
                        {disease.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {disease.description.slice(0, 60)}
                            {disease.description.length > 60 && '...'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <Badge variant="outline">{disease.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {disease.is_active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Nonaktif</Badge>
                          )}
                          {disease.is_common && (
                            <Badge variant="default" className="bg-amber-100 text-amber-800">
                              <Star className="w-3 h-3 mr-1" />
                              Umum
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDisease(disease)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDisease(disease)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Penyakit</DialogTitle>
            <DialogDescription>
              Update informasi penyakit {selectedDisease?.name}
            </DialogDescription>
          </DialogHeader>
          <DiseaseFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedDisease(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleUpdateDisease} className="bg-purple-600 hover:bg-purple-700">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
