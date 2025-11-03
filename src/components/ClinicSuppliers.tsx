/**
 * ==========================================================================
 * CLINIC MODULE - MASTER DATA SUPPLIER
 * ==========================================================================
 *
 * Komponen untuk mengelola master data supplier obat di klinik.
 * Fitur: CRUD, search, status tracking
 *
 * #ClinicModule #MasterData #Suppliers
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
  PackageSearch,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

// TypeScript interfaces
interface Supplier {
  id: string;
  supplier_code: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  payment_terms: string | null;
  is_active: boolean;
  notes: string | null;
  created_at?: string;
}

interface SupplierFormData {
  supplier_code: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  payment_terms: string;
  is_active: boolean;
  notes: string;
}

const PAYMENT_TERMS = [
  'Cash', 'COD', '7 hari', '14 hari', '30 hari', '45 hari', '60 hari', '90 hari'
];

export function ClinicSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<SupplierFormData>({
    supplier_code: '',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    payment_terms: '30 hari',
    is_active: true,
    notes: '',
  });

  // Load suppliers
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clinic_suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
      toast.error('Gagal memuat data supplier');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((sup) =>
    sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.supplier_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (field: keyof SupplierFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      supplier_code: '',
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      postal_code: '',
      payment_terms: '30 hari',
      is_active: true,
      notes: '',
    });
  };

  const handleAddSupplier = async () => {
    try {
      // Validation
      if (!formData.supplier_code || !formData.name) {
        toast.error('Mohon lengkapi field yang wajib diisi');
        return;
      }

      const { data, error } = await supabase
        .from('clinic_suppliers')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Supplier berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
      loadSuppliers();
    } catch (error: any) {
      console.error('Error adding supplier:', error);
      if (error.code === '23505') {
        toast.error('Kode supplier sudah digunakan');
      } else {
        toast.error('Gagal menambahkan supplier');
      }
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      supplier_code: supplier.supplier_code,
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      postal_code: supplier.postal_code || '',
      payment_terms: supplier.payment_terms || '30 hari',
      is_active: supplier.is_active,
      notes: supplier.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSupplier = async () => {
    try {
      if (!selectedSupplier) return;

      const { error } = await supabase
        .from('clinic_suppliers')
        .update(formData)
        .eq('id', selectedSupplier.id);

      if (error) throw error;

      toast.success('Supplier berhasil diupdate');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      toast.error('Gagal mengupdate supplier');
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clinic_suppliers')
        .delete()
        .eq('id', supplier.id);

      if (error) throw error;

      toast.success('Supplier berhasil dihapus');
      loadSuppliers();
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      if (error.code === '23503') {
        toast.error('Supplier tidak dapat dihapus karena masih digunakan');
      } else {
        toast.error('Gagal menghapus supplier');
      }
    }
  };
  const SupplierFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {/* Row 1: Code & Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier_code">Kode Supplier *</Label>
          <Input
            id="supplier_code"
            value={formData.supplier_code}
            onChange={(e) => handleInputChange('supplier_code', e.target.value)}
            placeholder="SUP001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama Supplier *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="PT Kimia Farma"
          />
        </div>
      </div>

      {/* Row 2: Contact Person & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            placeholder="Nama PIC"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">No. Telepon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="021-1234567"
          />
        </div>
      </div>

      {/* Row 3: Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="supplier@example.com"
        />
      </div>

      {/* Row 4: Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Alamat</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Alamat lengkap supplier..."
          rows={3}
        />
      </div>

      {/* Row 5: City & Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Kota</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Jakarta"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">Kode Pos</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            placeholder="12345"
          />
        </div>
      </div>

      {/* Row 6: Payment Terms */}
      <div className="space-y-2">
        <Label htmlFor="payment_terms">Termin Pembayaran</Label>
        <Select
          value={formData.payment_terms}
          onValueChange={(value) => handleInputChange('payment_terms', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_TERMS.map(term => (
              <SelectItem key={term} value={term}>{term}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 7: Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Catatan tambahan tentang supplier..."
          rows={3}
        />
      </div>

      {/* Row 8: Active Status */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="space-y-0.5">
          <Label>Status Aktif</Label>
          <p className="text-sm text-muted-foreground">
            Supplier dapat digunakan dalam sistem
          </p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
        />
      </div>
    </div>
  );


  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Master Data Supplier</h1>
              <p className="text-sm text-gray-500">Kelola data supplier obat</p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Supplier
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Supplier Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi form di bawah untuk menambahkan supplier baru
                </DialogDescription>
              </DialogHeader>
              <SupplierFormFields />
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  Batal
                </Button>
                <Button onClick={handleAddSupplier} className="bg-blue-600 hover:bg-blue-700">
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari supplier (nama, kode, PIC, kota)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Supplier</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Supplier Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers.filter(s => s.is_active).length}
                </p>
              </div>
              <PackageSearch className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Supplier Nonaktif</p>
                <p className="text-2xl font-bold text-gray-600">
                  {suppliers.filter(s => !s.is_active).length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-gray-400" />
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
                    Nama Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Termin
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
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data supplier
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {supplier.supplier_code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{supplier.name}</div>
                          {supplier.contact_person && (
                            <div className="text-gray-500 text-xs">PIC: {supplier.contact_person}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {supplier.phone && (
                          <div className="flex items-center gap-1 mb-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{supplier.phone}</span>
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{supplier.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {supplier.city || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {supplier.payment_terms || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {supplier.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Nonaktif</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSupplier(supplier)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier)}
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
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update informasi supplier {selectedSupplier?.name}
            </DialogDescription>
          </DialogHeader>
          <SupplierFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedSupplier(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleUpdateSupplier} className="bg-blue-600 hover:bg-blue-700">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
