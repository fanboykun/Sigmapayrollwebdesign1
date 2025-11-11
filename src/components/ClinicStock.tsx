/**
 * ==========================================================================
 * CLINIC MODULE - STOCK OBAT (MEDICINE STOCK MANAGEMENT)
 * ==========================================================================
 *
 * Komponen untuk monitoring dan mengelola stok obat.
 * Fitur:
 * - Dashboard stock statistics
 * - FEFO (First Expiry First Out) monitoring
 * - Expiry alerts (30/60/90 hari)
 * - Low stock alerts
 * - Batch tracking
 * - Stock adjustment
 *
 * #ClinicModule #Inventory #StockManagement
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Package,
  AlertTriangle,
  TrendingDown,
  Calendar,
  DollarSign,
  Eye,
  Clock,
  Archive,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  MedicineStockWithDetails,
  StockStats,
  StockAggregation,
  StockStatus
} from '../types/clinic-registration';

export function ClinicStock() {
  const [stocks, setStocks] = useState<MedicineStockWithDetails[]>([]);
  const [aggregatedStocks, setAggregatedStocks] = useState<StockAggregation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAlert, setFilterAlert] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StockStats>({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    expiringSoon: 0,
    lowStock: 0,
    expired: 0
  });

  // Dialog states
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MedicineStockWithDetails | null>(null);

  useEffect(() => {
    loadStocks();
  }, []);

  // ========================================================================
  // DATA LOADING FUNCTIONS
  // ========================================================================

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clinic_medicine_stock')
        .select(`
          *,
          clinic_medicines (
            name,
            medicine_code,
            unit,
            min_stock,
            category_id,
            clinic_medicine_categories (
              name
            )
          ),
          clinic_medicine_receiving (
            receiving_number,
            supplier_id
          )
        `)
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      setStocks(data || []);
      calculateStats(data || []);
      calculateAggregatedStocks(data || []);
    } catch (error: any) {
      console.error('Error loading stocks:', error);
      toast.error('Gagal memuat data stok obat');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: MedicineStockWithDetails[]) => {
    const today = new Date();
    const in90Days = addDays(today, 90);

    // Get unique medicine IDs
    const uniqueMedicines = new Set(data.map(s => s.medicine_id));

    const stats: StockStats = {
      totalItems: uniqueMedicines.size,
      totalQuantity: data.reduce((sum, s) => sum + (s.status === 'available' ? s.quantity : 0), 0),
      totalValue: data.reduce((sum, s) => sum + (s.status === 'available' ? s.quantity * s.unit_price : 0), 0),
      expiringSoon: data.filter(s => {
        const expiryDate = parseISO(s.expiry_date);
        return s.status === 'available' && expiryDate <= in90Days && expiryDate >= today;
      }).length,
      lowStock: 0, // Will calculate from aggregated stocks
      expired: data.filter(s => s.status === 'expired' || parseISO(s.expiry_date) < today).length
    };

    setStats(stats);
  };

  const calculateAggregatedStocks = (data: MedicineStockWithDetails[]) => {
    const grouped = data.reduce((acc, stock) => {
      if (!stock.clinic_medicines) return acc;

      const key = stock.medicine_id;
      if (!acc[key]) {
        acc[key] = {
          medicine_id: stock.medicine_id,
          medicine_code: stock.clinic_medicines.medicine_code,
          medicine_name: stock.clinic_medicines.name,
          category_name: stock.clinic_medicines.clinic_medicine_categories?.name || '-',
          unit: stock.clinic_medicines.unit,
          total_quantity: 0,
          total_reserved: 0,
          total_available: 0,
          total_value: 0,
          min_stock: stock.clinic_medicines.min_stock,
          batch_count: 0,
          oldest_expiry: stock.expiry_date,
          is_low_stock: false,
          is_expiring_soon: false
        };
      }

      if (stock.status === 'available') {
        acc[key].total_quantity += stock.quantity;
        acc[key].total_reserved += stock.reserved_quantity;
        acc[key].total_available += stock.available_quantity;
        acc[key].total_value += stock.quantity * stock.unit_price;
        acc[key].batch_count += 1;

        // Track oldest expiry
        if (parseISO(stock.expiry_date) < parseISO(acc[key].oldest_expiry)) {
          acc[key].oldest_expiry = stock.expiry_date;
        }
      }

      return acc;
    }, {} as Record<string, StockAggregation>);

    const aggregated = Object.values(grouped);

    // Calculate low stock and expiring soon
    const today = new Date();
    const in90Days = addDays(today, 90);

    aggregated.forEach(agg => {
      agg.is_low_stock = agg.total_available < agg.min_stock;
      agg.is_expiring_soon = parseISO(agg.oldest_expiry) <= in90Days;
    });

    // Update low stock count in stats
    setStats(prev => ({
      ...prev,
      lowStock: aggregated.filter(a => a.is_low_stock).length
    }));

    setAggregatedStocks(aggregated);
  };

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  const getExpiryDays = (expiryDate: string): number => {
    return differenceInDays(parseISO(expiryDate), new Date());
  };

  const getExpiryBadge = (expiryDate: string, status: StockStatus) => {
    if (status === 'expired') {
      return <Badge className="bg-red-600">Expired</Badge>;
    }

    const days = getExpiryDays(expiryDate);

    if (days < 0) {
      return <Badge className="bg-red-600">Expired {Math.abs(days)} hari</Badge>;
    } else if (days <= 30) {
      return <Badge className="bg-red-500">Kadaluarsa dalam {days} hari</Badge>;
    } else if (days <= 60) {
      return <Badge className="bg-orange-500">Kadaluarsa dalam {days} hari</Badge>;
    } else if (days <= 90) {
      return <Badge className="bg-yellow-500">Kadaluarsa dalam {days} hari</Badge>;
    } else {
      return <Badge variant="outline">{days} hari lagi</Badge>;
    }
  };

  const getStatusBadge = (status: StockStatus) => {
    const statusConfig = {
      available: { label: 'Available', className: 'bg-green-500' },
      expired: { label: 'Expired', className: 'bg-red-500' },
      damaged: { label: 'Rusak', className: 'bg-gray-500' },
      recalled: { label: 'Recalled', className: 'bg-purple-500' }
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
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: idLocale });
    } catch {
      return dateString;
    }
  };

  // ========================================================================
  // VIEW FUNCTIONS
  // ========================================================================

  const handleViewDetail = (stock: MedicineStockWithDetails) => {
    setSelectedStock(stock);
    setIsDetailDialogOpen(true);
  };

  // ========================================================================
  // FILTERING
  // ========================================================================

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      stock.clinic_medicines?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.clinic_medicines?.medicine_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.batch_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || stock.status === filterStatus;

    let matchesAlert = true;
    if (filterAlert === 'expiring') {
      const days = getExpiryDays(stock.expiry_date);
      matchesAlert = days >= 0 && days <= 90;
    } else if (filterAlert === 'expired') {
      matchesAlert = stock.status === 'expired' || getExpiryDays(stock.expiry_date) < 0;
    }

    return matchesSearch && matchesStatus && matchesAlert;
  });

  const filteredAggregated = aggregatedStocks.filter(agg => {
    const matchesSearch =
      agg.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agg.medicine_code.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesAlert = true;
    if (filterAlert === 'low-stock') {
      matchesAlert = agg.is_low_stock;
    } else if (filterAlert === 'expiring') {
      matchesAlert = agg.is_expiring_soon;
    }

    return matchesSearch && matchesAlert;
  });

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stok Obat</h1>
          <p className="text-gray-500 mt-1">
            Monitor dan kelola stok obat dengan FEFO (First Expiry First Out)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Item Obat</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Kuantitas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity.toLocaleString('id-ID')}</p>
            </div>
            <Archive className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nilai Stok</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Akan Kadaluarsa</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
              <p className="text-xs text-gray-500">90 hari</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stok Rendah</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              <p className="text-xs text-gray-500">{'< min stock'}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kadaluarsa</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Main Content - Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="summary">Ringkasan Stok</TabsTrigger>
          <TabsTrigger value="batch">Detail Per Batch</TabsTrigger>
          <TabsTrigger value="expiry">Alert Kadaluarsa</TabsTrigger>
          <TabsTrigger value="low-stock">Alert Stok Rendah</TabsTrigger>
        </TabsList>

        {/* Tab 1: Stock Summary (Aggregated) */}
        <TabsContent value="summary" className="space-y-4">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari nama obat, kode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAlert} onValueChange={setFilterAlert}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter Alert" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="low-stock">Stok Rendah</SelectItem>
                  <SelectItem value="expiring">Akan Kadaluarsa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Summary Table */}
          <Card className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Memuat data...</p>
              </div>
            ) : filteredAggregated.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada data stok obat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kode</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Obat</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Batch</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Reserved</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Available</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Min Stock</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Nilai Stok</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAggregated.map((agg) => (
                      <tr key={agg.medicine_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{agg.medicine_code}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{agg.medicine_name}</div>
                          <div className="text-sm text-gray-500">{agg.unit}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{agg.category_name}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{agg.batch_count} batch</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {agg.total_quantity.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600">
                          {agg.total_reserved.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {agg.total_available.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500">
                          {agg.min_stock}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {formatCurrency(agg.total_value)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-center">
                            {agg.is_low_stock && (
                              <Badge className="bg-orange-500 text-xs">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Low Stock
                              </Badge>
                            )}
                            {agg.is_expiring_soon && (
                              <Badge className="bg-yellow-500 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Expiring
                              </Badge>
                            )}
                            {!agg.is_low_stock && !agg.is_expiring_soon && (
                              <Badge className="bg-green-500 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                OK
                              </Badge>
                            )}
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

        {/* Tab 2: Stock Detail (Per Batch) */}
        <TabsContent value="batch" className="space-y-4">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari nama obat, kode, batch..."
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="damaged">Rusak</SelectItem>
                  <SelectItem value="recalled">Recalled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Batch Detail Table */}
          <Card className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Memuat data...</p>
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada data stok obat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Obat</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Reserved</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Available</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Harga/Unit</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Expired</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Lokasi</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map((stock) => (
                      <tr key={stock.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {stock.clinic_medicines?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.clinic_medicines?.medicine_code}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{stock.batch_number}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {stock.quantity} {stock.clinic_medicines?.unit}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600">
                          {stock.reserved_quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {stock.available_quantity}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(stock.unit_price)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <div className="text-sm">{formatDate(stock.expiry_date)}</div>
                            {getExpiryBadge(stock.expiry_date, stock.status)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {stock.location || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(stock.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(stock)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 3: Expiry Alerts */}
        <TabsContent value="expiry" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Obat yang Akan Kadaluarsa (90 Hari)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Obat</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Expired</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Sisa Hari</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks
                    .filter(s => {
                      const days = getExpiryDays(s.expiry_date);
                      return s.status === 'available' && days >= 0 && days <= 90;
                    })
                    .sort((a, b) => getExpiryDays(a.expiry_date) - getExpiryDays(b.expiry_date))
                    .map((stock) => (
                      <tr key={stock.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {stock.clinic_medicines?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.clinic_medicines?.medicine_code}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{stock.batch_number}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {stock.available_quantity} {stock.clinic_medicines?.unit}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {formatDate(stock.expiry_date)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getExpiryBadge(stock.expiry_date, stock.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {stock.location || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Low Stock Alerts */}
        <TabsContent value="low-stock" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-500" />
              Obat dengan Stok Rendah (Di Bawah Min Stock)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kode</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Obat</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Stok Saat Ini</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Min Stock</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Kurang</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedStocks
                    .filter(agg => agg.is_low_stock)
                    .sort((a, b) => (a.total_available - a.min_stock) - (b.total_available - b.min_stock))
                    .map((agg) => (
                      <tr key={agg.medicine_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{agg.medicine_code}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{agg.medicine_name}</div>
                          <div className="text-sm text-gray-500">{agg.category_name}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-orange-600">
                          {agg.total_available} {agg.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {agg.min_stock} {agg.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">
                          {agg.min_stock - agg.total_available} {agg.unit}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-orange-500">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Perlu Restock
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Detail Stock Batch
            </DialogTitle>
            <DialogDescription>
              {selectedStock?.batch_number}
            </DialogDescription>
          </DialogHeader>

          {selectedStock && (
            <div className="space-y-4">
              {/* Medicine Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-gray-500">Nama Obat</Label>
                  <p className="font-semibold">{selectedStock.clinic_medicines?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Kode Obat</Label>
                  <p className="font-semibold">{selectedStock.clinic_medicines?.medicine_code}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Kategori</Label>
                  <p className="font-semibold">
                    {selectedStock.clinic_medicines?.clinic_medicine_categories?.name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Satuan</Label>
                  <p className="font-semibold">{selectedStock.clinic_medicines?.unit}</p>
                </div>
              </div>

              {/* Stock Info */}
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-gray-500">Total Quantity</Label>
                  <p className="text-2xl font-bold text-gray-900">{selectedStock.quantity}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Reserved</Label>
                  <p className="text-2xl font-bold text-orange-600">{selectedStock.reserved_quantity}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Available</Label>
                  <p className="text-2xl font-bold text-green-600">{selectedStock.available_quantity}</p>
                </div>
              </div>

              {/* Batch Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Nomor Batch</Label>
                  <p className="font-semibold font-mono">{selectedStock.batch_number}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Harga Satuan</Label>
                  <p className="font-semibold">{formatCurrency(selectedStock.unit_price)}</p>
                </div>
                {selectedStock.manufacturing_date && (
                  <div>
                    <Label className="text-gray-500">Tanggal Produksi</Label>
                    <p className="font-semibold">{formatDate(selectedStock.manufacturing_date)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-500">Tanggal Kadaluarsa</Label>
                  <p className="font-semibold">{formatDate(selectedStock.expiry_date)}</p>
                  <div className="mt-1">{getExpiryBadge(selectedStock.expiry_date, selectedStock.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Lokasi</Label>
                  <p className="font-semibold">{selectedStock.location || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedStock.status)}</div>
                </div>
              </div>

              {selectedStock.notes && (
                <div>
                  <Label className="text-gray-500">Catatan</Label>
                  <p className="text-gray-700 mt-1">{selectedStock.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
