/**
 * ==========================================================================
 * CLINIC MODULE - PENERIMAAN OBAT (MEDICINE RECEIVING)
 * ==========================================================================
 *
 * Komponen untuk mengelola penerimaan obat dari supplier.
 * Fitur:
 * - Input penerimaan obat dengan detail batch
 * - Workflow: draft → verified → posted
 * - Auto-update stock saat posting
 * - FEFO (First Expiry First Out) management
 *
 * #ClinicModule #Inventory #Receiving
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-11
 * ==========================================================================
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
import {
  Search,
  Plus,
  Eye,
  FileCheck,
  CheckCircle,
  PackagePlus,
  Trash2,
  Calendar,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  MedicineReceivingWithDetails,
  ReceivingStatus,
  SupplierOption,
  MedicineOption,
  MedicineReceivingDetailInsert
} from '../types/clinic-registration';

interface ReceivingStats {
  total: number;
  draft: number;
  verified: number;
  posted: number;
  totalAmount: number;
}

interface ReceivingDetailForm extends MedicineReceivingDetailInsert {
  id?: string;
  medicine_name?: string;
  unit?: string;
  total_price: number;
}

export function ClinicReceiving() {
  const [receivings, setReceivings] = useState<MedicineReceivingWithDetails[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [medicines, setMedicines] = useState<MedicineOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReceivingStats>({
    total: 0,
    draft: 0,
    verified: 0,
    posted: 0,
    totalAmount: 0
  });

  // Dialog states
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedReceiving, setSelectedReceiving] = useState<MedicineReceivingWithDetails | null>(null);

  // Form states for new receiving
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    receiving_date: format(new Date(), 'yyyy-MM-dd'),
    supplier_id: '',
    invoice_number: '',
    po_number: '',
    notes: ''
  });
  const [detailItems, setDetailItems] = useState<ReceivingDetailForm[]>([]);
  const [currentItem, setCurrentItem] = useState<ReceivingDetailForm>({
    medicine_id: '',
    batch_number: '',
    quantity: 0,
    unit_price: 0,
    total_price: 0,
    expiry_date: '',
    manufacturing_date: '',
    notes: ''
  });

  useEffect(() => {
    loadSuppliers();
    loadMedicines();
    loadReceivings();
  }, []);

  // ========================================================================
  // DATA LOADING FUNCTIONS
  // ========================================================================

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_suppliers')
        .select('id, supplier_code, name, contact_person, phone')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
      toast.error('Gagal memuat data supplier');
    }
  };

  const loadMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_medicines')
        .select('id, medicine_code, name, generic_name, unit, price_per_unit')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMedicines(data || []);
    } catch (error: any) {
      console.error('Error loading medicines:', error);
      toast.error('Gagal memuat data obat');
    }
  };

  const loadReceivings = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('clinic_medicine_receiving')
        .select(`
          *,
          clinic_suppliers (
            name,
            supplier_code
          ),
          users_clinic_medicine_receiving_received_byTousers:users!clinic_medicine_receiving_received_by_fkey (
            full_name
          ),
          users_clinic_medicine_receiving_verified_byTousers:users!clinic_medicine_receiving_verified_by_fkey (
            full_name
          ),
          clinic_medicine_receiving_details (
            *,
            clinic_medicines (
              name,
              medicine_code,
              unit
            )
          )
        `)
        .order('receiving_date', { ascending: false })
        .order('receiving_number', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setReceivings(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error('Error loading receivings:', error);
      toast.error('Gagal memuat data penerimaan obat');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: MedicineReceivingWithDetails[]) => {
    const stats: ReceivingStats = {
      total: data.length,
      draft: data.filter(r => r.status === 'draft').length,
      verified: data.filter(r => r.status === 'verified').length,
      posted: data.filter(r => r.status === 'posted').length,
      totalAmount: data.reduce((sum, r) => sum + (r.total_amount || 0), 0)
    };
    setStats(stats);
  };

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================

  const handleAddItem = () => {
    if (!currentItem.medicine_id) {
      toast.error('Pilih obat terlebih dahulu');
      return;
    }
    if (!currentItem.batch_number) {
      toast.error('Nomor batch harus diisi');
      return;
    }
    if (currentItem.quantity <= 0) {
      toast.error('Jumlah harus lebih dari 0');
      return;
    }
    if (!currentItem.expiry_date) {
      toast.error('Tanggal kadaluarsa harus diisi');
      return;
    }

    const medicine = medicines.find(m => m.id === currentItem.medicine_id);
    const newItem: ReceivingDetailForm = {
      ...currentItem,
      medicine_name: medicine?.name,
      unit: medicine?.unit,
      total_price: currentItem.quantity * currentItem.unit_price
    };

    setDetailItems([...detailItems, newItem]);

    // Reset current item
    setCurrentItem({
      medicine_id: '',
      batch_number: '',
      quantity: 0,
      unit_price: 0,
      total_price: 0,
      expiry_date: '',
      manufacturing_date: '',
      notes: ''
    });

    toast.success('Item ditambahkan');
  };

  const handleRemoveItem = (index: number) => {
    setDetailItems(detailItems.filter((_, i) => i !== index));
    toast.success('Item dihapus');
  };

  const handleMedicineSelect = (medicineId: string) => {
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine) {
      setCurrentItem({
        ...currentItem,
        medicine_id: medicineId,
        unit_price: medicine.price_per_unit
      });
    }
  };

  const handleQuantityChange = (quantity: number) => {
    setCurrentItem({
      ...currentItem,
      quantity,
      total_price: quantity * currentItem.unit_price
    });
  };

  const handleUnitPriceChange = (unitPrice: number) => {
    setCurrentItem({
      ...currentItem,
      unit_price: unitPrice,
      total_price: currentItem.quantity * unitPrice
    });
  };

  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  const handleCreateReceiving = async () => {
    if (!formData.supplier_id) {
      toast.error('Pilih supplier terlebih dahulu');
      return;
    }

    if (detailItems.length === 0) {
      toast.error('Tambahkan minimal 1 item obat');
      return;
    }

    setIsCreating(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate receiving number
      const today = format(new Date(), 'yyyyMMdd');
      const prefix = `RCV-${today}-`;

      // Get last receiving number for today
      const { data: lastReceivings } = await supabase
        .from('clinic_medicine_receiving')
        .select('receiving_number')
        .like('receiving_number', `${prefix}%`)
        .order('receiving_number', { ascending: false })
        .limit(1);

      let sequenceNumber = 1;
      if (lastReceivings && lastReceivings.length > 0) {
        // Extract sequence number from last receiving number
        const lastSeq = lastReceivings[0].receiving_number.split('-')[2];
        sequenceNumber = parseInt(lastSeq) + 1;
      }

      const receivingNumber = `${prefix}${String(sequenceNumber).padStart(4, '0')}`;

      // Calculate totals
      const totalItems = detailItems.length;
      const totalQuantity = detailItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = detailItems.reduce((sum, item) => sum + item.total_price, 0);

      // Insert receiving header
      const { data: receiving, error: receivingError } = await supabase
        .from('clinic_medicine_receiving')
        .insert({
          receiving_number: receivingNumber,
          receiving_date: formData.receiving_date,
          supplier_id: formData.supplier_id,
          invoice_number: formData.invoice_number || null,
          po_number: formData.po_number || null,
          total_items: totalItems,
          total_quantity: totalQuantity,
          total_amount: totalAmount,
          received_by: user.id,
          status: 'draft',
          notes: formData.notes || null
        })
        .select()
        .single();

      if (receivingError) throw receivingError;

      // Insert receiving details
      const detailsToInsert = detailItems.map(item => ({
        receiving_id: receiving.id,
        medicine_id: item.medicine_id,
        batch_number: item.batch_number,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        expiry_date: item.expiry_date,
        manufacturing_date: item.manufacturing_date || null,
        notes: item.notes || null
      }));

      const { error: detailsError } = await supabase
        .from('clinic_medicine_receiving_details')
        .insert(detailsToInsert);

      if (detailsError) throw detailsError;

      toast.success(`Penerimaan obat berhasil dibuat: ${receivingNumber}`);

      // Reset form
      setFormData({
        receiving_date: format(new Date(), 'yyyy-MM-dd'),
        supplier_id: '',
        invoice_number: '',
        po_number: '',
        notes: ''
      });
      setDetailItems([]);

      // Reload data
      await loadReceivings();

    } catch (error: any) {
      console.error('Error creating receiving:', error);
      toast.error('Gagal membuat penerimaan obat: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyReceiving = async (receiving: MedicineReceivingWithDetails) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('clinic_medicine_receiving')
        .update({
          status: 'verified',
          verified_by: user.id
        })
        .eq('id', receiving.id);

      if (error) throw error;

      toast.success('Penerimaan obat berhasil diverifikasi');
      await loadReceivings();
    } catch (error: any) {
      console.error('Error verifying receiving:', error);
      toast.error('Gagal memverifikasi penerimaan: ' + error.message);
    }
  };

  const handlePostReceiving = async (receiving: MedicineReceivingWithDetails) => {
    try {
      // Validate that receiving is verified
      if (receiving.status !== 'verified') {
        toast.error('Penerimaan harus diverifikasi terlebih dahulu');
        return;
      }

      // Get receiving details
      const { data: details, error: detailsError } = await supabase
        .from('clinic_medicine_receiving_details')
        .select('*')
        .eq('receiving_id', receiving.id);

      if (detailsError) throw detailsError;

      if (!details || details.length === 0) {
        toast.error('Tidak ada detail penerimaan');
        return;
      }

      // Start transaction: Update stock for each item
      for (const detail of details) {
        // Check if batch already exists
        const { data: existingStock, error: checkError } = await supabase
          .from('clinic_medicine_stock')
          .select('*')
          .eq('medicine_id', detail.medicine_id)
          .eq('batch_number', detail.batch_number)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingStock) {
          // Update existing stock
          const { error: updateError } = await supabase
            .from('clinic_medicine_stock')
            .update({
              quantity: existingStock.quantity + detail.quantity,
              unit_price: detail.unit_price, // Update with latest price
              updated_at: new Date().toISOString()
            })
            .eq('id', existingStock.id);

          if (updateError) throw updateError;
        } else {
          // Insert new stock
          const { error: insertError } = await supabase
            .from('clinic_medicine_stock')
            .insert({
              medicine_id: detail.medicine_id,
              batch_number: detail.batch_number,
              quantity: detail.quantity,
              reserved_quantity: 0,
              unit_price: detail.unit_price,
              expiry_date: detail.expiry_date,
              manufacturing_date: detail.manufacturing_date,
              receiving_id: receiving.id,
              status: 'available',
              location: null,
              notes: detail.notes
            });

          if (insertError) throw insertError;
        }
      }

      // Update receiving status to posted
      const { error: updateError } = await supabase
        .from('clinic_medicine_receiving')
        .update({ status: 'posted' })
        .eq('id', receiving.id);

      if (updateError) throw updateError;

      toast.success('Penerimaan obat berhasil diposting ke stock');
      await loadReceivings();
      setIsDetailDialogOpen(false);

    } catch (error: any) {
      console.error('Error posting receiving:', error);
      toast.error('Gagal posting penerimaan: ' + error.message);
    }
  };

  // ========================================================================
  // VIEW FUNCTIONS
  // ========================================================================

  const handleViewDetail = (receiving: MedicineReceivingWithDetails) => {
    setSelectedReceiving(receiving);
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status: ReceivingStatus) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-500' },
      verified: { label: 'Terverifikasi', className: 'bg-blue-500' },
      posted: { label: 'Posted', className: 'bg-green-500' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: idLocale });
    } catch {
      return dateString;
    }
  };

  // ========================================================================
  // FILTERING
  // ========================================================================

  const filteredReceivings = receivings.filter(receiving => {
    const matchesSearch =
      receiving.receiving_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receiving.clinic_suppliers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receiving.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receiving.po_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || receiving.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penerimaan Obat</h1>
          <p className="text-gray-500 mt-1">
            Kelola penerimaan obat dari supplier dengan tracking batch dan FEFO
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Penerimaan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <PackagePlus className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Terverifikasi</p>
              <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
            </div>
            <FileCheck className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Posted</p>
              <p className="text-2xl font-bold text-green-600">{stats.posted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Nilai</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Main Content - Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Daftar Penerimaan</TabsTrigger>
          <TabsTrigger value="create">Buat Penerimaan Baru</TabsTrigger>
        </TabsList>

        {/* Tab 1: List Receivings */}
        <TabsContent value="list" className="space-y-4">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari nomor penerimaan, supplier, invoice, PO..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Receivings Table */}
          <Card className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Memuat data...</p>
              </div>
            ) : filteredReceivings.length === 0 ? (
              <div className="text-center py-12">
                <PackagePlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada data penerimaan obat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">No. Penerimaan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice/PO</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Items</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Nilai</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceivings.map((receiving) => (
                      <tr key={receiving.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-blue-600">
                            {receiving.receiving_number}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatDate(receiving.receiving_date)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {receiving.clinic_suppliers?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {receiving.clinic_suppliers?.supplier_code}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {receiving.invoice_number && (
                              <div className="text-gray-700">INV: {receiving.invoice_number}</div>
                            )}
                            {receiving.po_number && (
                              <div className="text-gray-500">PO: {receiving.po_number}</div>
                            )}
                            {!receiving.invoice_number && !receiving.po_number && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{receiving.total_items} items</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {receiving.total_quantity.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {formatCurrency(receiving.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(receiving.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(receiving)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 2: Create New Receiving */}
        <TabsContent value="create" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Penerimaan</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="receiving_date">
                  Tanggal Penerimaan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="receiving_date"
                  type="date"
                  value={formData.receiving_date}
                  onChange={(e) => setFormData({ ...formData, receiving_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="supplier_id">
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.supplier_code} - {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice_number">Nomor Invoice</Label>
                <Input
                  id="invoice_number"
                  placeholder="INV-2025-001"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="po_number">Nomor PO</Label>
                <Input
                  id="po_number"
                  placeholder="PO-2025-001"
                  value={formData.po_number}
                  onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Tambah Item Obat</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <Label htmlFor="medicine_id">
                    Obat <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={currentItem.medicine_id}
                    onValueChange={handleMedicineSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih obat" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map((medicine) => (
                        <SelectItem key={medicine.id} value={medicine.id}>
                          {medicine.medicine_code} - {medicine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="batch_number">
                    Nomor Batch <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="batch_number"
                    placeholder="BATCH-001"
                    value={currentItem.batch_number}
                    onChange={(e) => setCurrentItem({ ...currentItem, batch_number: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">
                    Jumlah <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={currentItem.quantity || ''}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="unit_price">
                    Harga Satuan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="unit_price"
                    type="number"
                    min="0"
                    value={currentItem.unit_price || ''}
                    onChange={(e) => handleUnitPriceChange(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Total Harga</Label>
                  <Input
                    value={formatCurrency(currentItem.total_price)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="manufacturing_date">Tanggal Produksi</Label>
                  <Input
                    id="manufacturing_date"
                    type="date"
                    value={currentItem.manufacturing_date || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, manufacturing_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="expiry_date">
                    Tanggal Kadaluarsa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={currentItem.expiry_date || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, expiry_date: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="item_notes">Catatan Item</Label>
                  <Input
                    id="item_notes"
                    placeholder="Catatan untuk item ini..."
                    value={currentItem.notes || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleAddItem} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            {/* Items List */}
            {detailItems.length > 0 && (
              <div className="border-t mt-6 pt-6">
                <h3 className="text-lg font-semibold mb-4">Daftar Item ({detailItems.length})</h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Obat</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Batch</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-700">Qty</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Harga Satuan</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Total</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-700">Expired</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailItems.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <div className="font-medium text-gray-900">{item.medicine_name}</div>
                          </td>
                          <td className="py-2 px-3 font-mono text-sm">{item.batch_number}</td>
                          <td className="py-2 px-3 text-center">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold">
                            {formatCurrency(item.total_price)}
                          </td>
                          <td className="py-2 px-3 text-center text-sm">
                            {formatDate(item.expiry_date)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td colSpan={2} className="py-3 px-3 text-right">TOTAL:</td>
                        <td className="py-3 px-3 text-center">
                          {detailItems.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td colSpan={2} className="py-3 px-3 text-right text-lg">
                          {formatCurrency(detailItems.reduce((sum, item) => sum + item.total_price, 0))}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        receiving_date: format(new Date(), 'yyyy-MM-dd'),
                        supplier_id: '',
                        invoice_number: '',
                        po_number: '',
                        notes: ''
                      });
                      setDetailItems([]);
                    }}
                  >
                    Reset Form
                  </Button>
                  <Button
                    onClick={handleCreateReceiving}
                    disabled={isCreating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreating ? 'Menyimpan...' : 'Simpan Penerimaan'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5" />
              Detail Penerimaan Obat
            </DialogTitle>
            <DialogDescription>
              {selectedReceiving?.receiving_number}
            </DialogDescription>
          </DialogHeader>

          {selectedReceiving && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-gray-500">Tanggal Penerimaan</Label>
                  <p className="font-semibold">{formatDate(selectedReceiving.receiving_date)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReceiving.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Supplier</Label>
                  <p className="font-semibold">{selectedReceiving.clinic_suppliers?.name}</p>
                  <p className="text-sm text-gray-500">{selectedReceiving.clinic_suppliers?.supplier_code}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Diterima Oleh</Label>
                  <p className="font-semibold">
                    {selectedReceiving.users_clinic_medicine_receiving_received_byTousers?.full_name || '-'}
                  </p>
                </div>
                {selectedReceiving.invoice_number && (
                  <div>
                    <Label className="text-gray-500">Nomor Invoice</Label>
                    <p className="font-semibold">{selectedReceiving.invoice_number}</p>
                  </div>
                )}
                {selectedReceiving.po_number && (
                  <div>
                    <Label className="text-gray-500">Nomor PO</Label>
                    <p className="font-semibold">{selectedReceiving.po_number}</p>
                  </div>
                )}
                {selectedReceiving.verified_by && (
                  <div>
                    <Label className="text-gray-500">Diverifikasi Oleh</Label>
                    <p className="font-semibold">
                      {selectedReceiving.users_clinic_medicine_receiving_verified_byTousers?.full_name || '-'}
                    </p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-semibold mb-2">Detail Item</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Obat</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Batch</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold">Qty</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold">Harga</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold">Total</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold">Expired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReceiving.clinic_medicine_receiving_details?.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-2 px-3">
                            <div className="font-medium">{item.clinic_medicines?.name}</div>
                            <div className="text-sm text-gray-500">{item.clinic_medicines?.medicine_code}</div>
                          </td>
                          <td className="py-2 px-3 font-mono text-sm">{item.batch_number}</td>
                          <td className="py-2 px-3 text-center">
                            {item.quantity} {item.clinic_medicines?.unit}
                          </td>
                          <td className="py-2 px-3 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="py-2 px-3 text-right font-semibold">{formatCurrency(item.total_price)}</td>
                          <td className="py-2 px-3 text-center text-sm">{formatDate(item.expiry_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-right font-semibold">TOTAL:</td>
                        <td className="py-2 px-3 text-right font-bold text-lg">
                          {formatCurrency(selectedReceiving.total_amount)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedReceiving.notes && (
                <div>
                  <Label className="text-gray-500">Catatan</Label>
                  <p className="text-gray-700 mt-1">{selectedReceiving.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <DialogFooter className="flex gap-2">
                {selectedReceiving.status === 'draft' && (
                  <Button
                    onClick={() => handleVerifyReceiving(selectedReceiving)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Verifikasi Penerimaan
                  </Button>
                )}
                {selectedReceiving.status === 'verified' && (
                  <Button
                    onClick={() => handlePostReceiving(selectedReceiving)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Posting ke Stock
                  </Button>
                )}
                {selectedReceiving.status === 'posted' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Sudah diposting ke stock</span>
                  </div>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
