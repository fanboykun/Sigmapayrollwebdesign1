/**
 * ==========================================================================
 * CLINIC MODULE - STOCK OPNAME
 * ==========================================================================
 *
 * Komponen untuk stock opname (stock taking) obat secara periodik.
 * Fitur:
 * - Create new stock opname
 * - Record system vs physical quantity
 * - Calculate variance
 * - Approve/verify opname
 * - Auto-adjust stock based on opname results
 *
 * #ClinicModule #Inventory #StockOpname
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-12
 * ==========================================================================
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Search,
  ClipboardCheck,
  Plus,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Package,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { format, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// TypeScript interfaces
interface StockOpname {
  id: string
  opname_number: string
  opname_date: string
  period_month: number
  period_year: number
  status: 'draft' | 'completed' | 'approved'
  total_items_checked: number
  total_variance: number
  notes: string | null
  performed_by: string
  verified_by: string | null
  approved_by: string | null
  approved_date: string | null
  performer?: {
    full_name: string
  }
  verifier?: {
    full_name: string
  }
  approver?: {
    full_name: string
  }
}

interface OpnameDetail {
  id: string
  opname_id: string
  medicine_id: string
  batch_number: string
  system_quantity: number
  physical_quantity: number
  variance: number
  variance_reason: string | null
  adjustment_type: 'plus' | 'minus' | 'none'
  expiry_date: string
  notes: string | null
  medicine?: {
    medicine_code: string
    name: string
    unit: string
  }
}

interface StockItem {
  id: string
  medicine_id: string
  medicine_code: string
  medicine_name: string
  unit: string
  batch_number: string
  system_quantity: number
  expiry_date: string
  location: string | null
  status: string
}

interface OpnameFormItem {
  stock_id: string
  medicine_id: string
  medicine_code: string
  medicine_name: string
  unit: string
  batch_number: string
  system_quantity: number
  physical_quantity: number
  expiry_date: string
  variance_reason: string
  notes: string
}

export function ClinicOpname() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')

  // States for opname list
  const [opnameRecords, setOpnameRecords] = useState<StockOpname[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // States for detail dialog
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null)
  const [opnameDetails, setOpnameDetails] = useState<OpnameDetail[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // States for create opname
  const [currentStocks, setCurrentStocks] = useState<StockItem[]>([])
  const [opnameItems, setOpnameItems] = useState<OpnameFormItem[]>([])
  const [opnameDate, setOpnameDate] = useState(new Date().toISOString().split('T')[0])
  const [opnameNotes, setOpnameNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [loadingStocks, setLoadingStocks] = useState(false)

  // Load opname records
  useEffect(() => {
    if (activeTab === 'list') {
      loadOpnameRecords()
    }
  }, [activeTab])

  // Load current stocks for create form
  useEffect(() => {
    if (activeTab === 'create') {
      loadCurrentStocks()
    }
  }, [activeTab])

  const loadOpnameRecords = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('clinic_stock_opname')
        .select(`
          *,
          performer:users!clinic_stock_opname_performed_by_fkey(full_name),
          verifier:users!clinic_stock_opname_verified_by_fkey(full_name),
          approver:users!clinic_stock_opname_approved_by_fkey(full_name)
        `)
        .order('opname_date', { ascending: false })
        .order('opname_number', { ascending: false })

      if (error) throw error

      setOpnameRecords(data || [])
    } catch (error: any) {
      console.error('Error loading opname records:', error)
      toast.error('Gagal memuat data stock opname')
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentStocks = async () => {
    try {
      setLoadingStocks(true)

      const { data, error } = await supabase
        .from('clinic_medicine_stock')
        .select(`
          id,
          medicine_id,
          batch_number,
          quantity,
          expiry_date,
          location,
          status,
          clinic_medicines!inner(
            medicine_code,
            name,
            unit
          )
        `)
        .eq('status', 'available')
        .gt('quantity', 0)
        .order('clinic_medicines(name)')

      if (error) throw error

      const stocks: StockItem[] = (data || []).map((s: any) => ({
        id: s.id,
        medicine_id: s.medicine_id,
        medicine_code: s.clinic_medicines.medicine_code,
        medicine_name: s.clinic_medicines.name,
        unit: s.clinic_medicines.unit,
        batch_number: s.batch_number,
        system_quantity: s.quantity,
        expiry_date: s.expiry_date,
        location: s.location,
        status: s.status,
      }))

      setCurrentStocks(stocks)

      // Initialize opname items with all stocks
      const items: OpnameFormItem[] = stocks.map(stock => ({
        stock_id: stock.id,
        medicine_id: stock.medicine_id,
        medicine_code: stock.medicine_code,
        medicine_name: stock.medicine_name,
        unit: stock.unit,
        batch_number: stock.batch_number,
        system_quantity: stock.system_quantity,
        physical_quantity: stock.system_quantity, // Default to system quantity
        expiry_date: stock.expiry_date,
        variance_reason: '',
        notes: '',
      }))

      setOpnameItems(items)
    } catch (error: any) {
      console.error('Error loading current stocks:', error)
      toast.error('Gagal memuat data stok obat')
    } finally {
      setLoadingStocks(false)
    }
  }

  const loadOpnameDetails = async (opnameId: string) => {
    try {
      setLoadingDetails(true)

      const { data, error } = await supabase
        .from('clinic_stock_opname_details')
        .select(`
          *,
          medicine:clinic_medicines!inner(
            medicine_code,
            name,
            unit
          )
        `)
        .eq('opname_id', opnameId)
        .order('medicine(name)')

      if (error) throw error

      setOpnameDetails(data || [])
    } catch (error: any) {
      console.error('Error loading opname details:', error)
      toast.error('Gagal memuat detail stock opname')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleViewDetail = async (opname: StockOpname) => {
    setSelectedOpname(opname)
    await loadOpnameDetails(opname.id)
    setShowDetailDialog(true)
  }

  const handleUpdatePhysicalQuantity = (index: number, value: number) => {
    const updated = [...opnameItems]
    updated[index].physical_quantity = value
    setOpnameItems(updated)
  }

  const handleUpdateVarianceReason = (index: number, value: string) => {
    const updated = [...opnameItems]
    updated[index].variance_reason = value
    setOpnameItems(updated)
  }

  const handleUpdateNotes = (index: number, value: string) => {
    const updated = [...opnameItems]
    updated[index].notes = value
    setOpnameItems(updated)
  }

  const calculateVariance = (item: OpnameFormItem) => {
    return item.physical_quantity - item.system_quantity
  }

  const getAdjustmentType = (variance: number): 'plus' | 'minus' | 'none' => {
    if (variance > 0) return 'plus'
    if (variance < 0) return 'minus'
    return 'none'
  }

  const handleCreateOpname = async () => {
    try {
      if (!user) {
        toast.error('User tidak ditemukan')
        return
      }

      // Validate: at least one item should have variance
      const itemsWithVariance = opnameItems.filter(item => calculateVariance(item) !== 0)

      if (itemsWithVariance.length === 0) {
        toast.error('Tidak ada perbedaan antara stok sistem dan fisik. Tidak perlu membuat opname.')
        return
      }

      // Validate: items with variance must have reason
      const itemsNeedingReason = itemsWithVariance.filter(
        item => Math.abs(calculateVariance(item)) > 0 && !item.variance_reason.trim()
      )

      if (itemsNeedingReason.length > 0) {
        toast.error('Harap isi alasan selisih untuk semua item yang memiliki perbedaan')
        return
      }

      setCreating(true)

      // Generate opname number
      const dateStr = format(parseISO(opnameDate), 'yyyyMMdd')
      const { data: lastOpname } = await supabase
        .from('clinic_stock_opname')
        .select('opname_number')
        .like('opname_number', `OPN-${dateStr}%`)
        .order('opname_number', { ascending: false })
        .limit(1)
        .maybeSingle()

      let sequence = 1
      if (lastOpname) {
        const lastSeq = parseInt(lastOpname.opname_number.split('-')[2])
        sequence = lastSeq + 1
      }

      const opnameNumber = `OPN-${dateStr}-${sequence.toString().padStart(4, '0')}`

      const selectedDate = parseISO(opnameDate)
      const periodMonth = selectedDate.getMonth() + 1
      const periodYear = selectedDate.getFullYear()

      // Calculate totals
      const totalVariance = opnameItems.reduce((sum, item) => {
        return sum + Math.abs(calculateVariance(item))
      }, 0)

      // Create opname record
      const { data: opname, error: opnameError } = await supabase
        .from('clinic_stock_opname')
        .insert({
          opname_number: opnameNumber,
          opname_date: opnameDate,
          period_month: periodMonth,
          period_year: periodYear,
          status: 'draft',
          total_items_checked: opnameItems.length,
          total_variance: totalVariance,
          performed_by: user.id,
          notes: opnameNotes || null,
        })
        .select()
        .single()

      if (opnameError) throw opnameError

      // Create opname details
      const details = opnameItems.map(item => {
        const variance = calculateVariance(item)
        return {
          opname_id: opname.id,
          medicine_id: item.medicine_id,
          batch_number: item.batch_number,
          system_quantity: item.system_quantity,
          physical_quantity: item.physical_quantity,
          variance: variance,
          variance_reason: item.variance_reason || null,
          adjustment_type: getAdjustmentType(variance),
          expiry_date: item.expiry_date,
          notes: item.notes || null,
        }
      })

      const { error: detailsError } = await supabase
        .from('clinic_stock_opname_details')
        .insert(details)

      if (detailsError) throw detailsError

      toast.success('Stock opname berhasil dibuat')

      // Reset form
      setOpnameItems([])
      setOpnameNotes('')
      setActiveTab('list')
    } catch (error: any) {
      console.error('Error creating opname:', error)
      toast.error('Gagal membuat stock opname: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleCompleteOpname = async (opnameId: string) => {
    try {
      const { error } = await supabase
        .from('clinic_stock_opname')
        .update({
          status: 'completed',
          verified_by: user?.id,
        })
        .eq('id', opnameId)

      if (error) throw error

      toast.success('Stock opname ditandai sebagai selesai')
      loadOpnameRecords()
      setShowDetailDialog(false)
    } catch (error: any) {
      console.error('Error completing opname:', error)
      toast.error('Gagal menyelesaikan stock opname')
    }
  }

  const handleApproveOpname = async (opnameId: string) => {
    try {
      // Update opname status
      const { error: opnameError } = await supabase
        .from('clinic_stock_opname')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_date: new Date().toISOString(),
        })
        .eq('id', opnameId)

      if (opnameError) throw opnameError

      // Get opname details to adjust stock
      const { data: details, error: detailsError } = await supabase
        .from('clinic_stock_opname_details')
        .select('*')
        .eq('opname_id', opnameId)

      if (detailsError) throw detailsError

      // Adjust stock quantities based on physical count
      for (const detail of details || []) {
        if (detail.variance !== 0) {
          const { error: stockError } = await supabase
            .from('clinic_medicine_stock')
            .update({
              quantity: detail.physical_quantity,
              last_stock_check: new Date().toISOString(),
            })
            .eq('medicine_id', detail.medicine_id)
            .eq('batch_number', detail.batch_number)

          if (stockError) {
            console.error('Error adjusting stock:', stockError)
          }
        }
      }

      toast.success('Stock opname disetujui dan stok telah disesuaikan')
      loadOpnameRecords()
      setShowDetailDialog(false)
    } catch (error: any) {
      console.error('Error approving opname:', error)
      toast.error('Gagal menyetujui stock opname')
    }
  }

  // Filter opname records
  const filteredOpnames = opnameRecords.filter(opname => {
    const matchesSearch =
      opname.opname_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opname.performer?.full_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || opname.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Filter opname items for create form
  const filteredOpnameItems = opnameItems.filter(item =>
    searchQuery === '' ||
    item.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.medicine_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Selesai
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVarianceBadge = (variance: number) => {
    if (variance > 0) {
      return (
        <Badge className="bg-green-500">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{variance}
        </Badge>
      )
    } else if (variance < 0) {
      return (
        <Badge className="bg-red-500">
          <TrendingDown className="w-3 h-3 mr-1" />
          {variance}
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50">
          <Minus className="w-3 h-3 mr-1" />
          0
        </Badge>
      )
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: idLocale })
    } catch {
      return dateString
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[month - 1]
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Stock Opname</h1>
              <p className="text-sm text-gray-500">Pencatatan stock taking periodik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">Daftar Opname</TabsTrigger>
            <TabsTrigger value="create">Buat Opname Baru</TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4 mt-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari no opname, petugas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="approved">Disetujui</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Opname Table */}
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Memuat data opname...
                </CardContent>
              </Card>
            ) : filteredOpnames.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Tidak ada data stock opname</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Opname</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Item Diperiksa</TableHead>
                        <TableHead>Total Selisih</TableHead>
                        <TableHead>Petugas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOpnames.map((opname) => (
                        <TableRow key={opname.id}>
                          <TableCell className="font-medium">{opname.opname_number}</TableCell>
                          <TableCell>{formatDate(opname.opname_date)}</TableCell>
                          <TableCell>
                            {getMonthName(opname.period_month)} {opname.period_year}
                          </TableCell>
                          <TableCell>{opname.total_items_checked}</TableCell>
                          <TableCell>
                            <span className={opname.total_variance > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {opname.total_variance}
                            </span>
                          </TableCell>
                          <TableCell>{opname.performer?.full_name}</TableCell>
                          <TableCell>{getStatusBadge(opname.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(opname)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Opname</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tanggal Opname *</Label>
                    <Input
                      type="date"
                      value={opnameDate}
                      onChange={(e) => setOpnameDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Periode</Label>
                    <Input
                      value={`${getMonthName(new Date(opnameDate).getMonth() + 1)} ${new Date(opnameDate).getFullYear()}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <Label>Catatan</Label>
                  <Textarea
                    placeholder="Catatan stock opname (opsional)"
                    value={opnameNotes}
                    onChange={(e) => setOpnameNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Data Stock ({opnameItems.length} item)</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari obat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingStocks ? (
                  <div className="text-center py-12 text-gray-500">
                    Memuat data stok...
                  </div>
                ) : filteredOpnameItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada data stok tersedia</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Obat</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead className="text-right">Stok Sistem</TableHead>
                          <TableHead className="text-right">Stok Fisik *</TableHead>
                          <TableHead className="text-right">Selisih</TableHead>
                          <TableHead className="min-w-[200px]">Alasan Selisih</TableHead>
                          <TableHead className="min-w-[150px]">Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOpnameItems.map((item, index) => {
                          const variance = calculateVariance(item)
                          const realIndex = opnameItems.findIndex(
                            i => i.stock_id === item.stock_id
                          )

                          return (
                            <TableRow key={item.stock_id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.medicine_name}</p>
                                  <p className="text-sm text-gray-500">{item.medicine_code}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {item.batch_number}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {item.system_quantity} {item.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.physical_quantity}
                                  onChange={(e) =>
                                    handleUpdatePhysicalQuantity(
                                      realIndex,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-24 text-right"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {getVarianceBadge(variance)}
                              </TableCell>
                              <TableCell>
                                {variance !== 0 && (
                                  <Input
                                    placeholder="Wajib diisi..."
                                    value={item.variance_reason}
                                    onChange={(e) =>
                                      handleUpdateVarianceReason(realIndex, e.target.value)
                                    }
                                    className={
                                      !item.variance_reason.trim()
                                        ? 'border-red-300 focus:border-red-500'
                                        : ''
                                    }
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Opsional"
                                  value={item.notes}
                                  onChange={(e) =>
                                    handleUpdateNotes(realIndex, e.target.value)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Item dengan selisih wajib diisi alasannya
                  </div>
                  <Button onClick={handleCreateOpname} disabled={creating || loadingStocks}>
                    {creating ? 'Menyimpan...' : 'Simpan Stock Opname'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Stock Opname</DialogTitle>
            <DialogDescription>
              Informasi lengkap stock opname
            </DialogDescription>
          </DialogHeader>

          {selectedOpname && (
            <div className="space-y-4">
              {/* Opname Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">No. Opname</p>
                  <p className="font-medium">{selectedOpname.opname_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium">{formatDate(selectedOpname.opname_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Periode</p>
                  <p className="font-medium">
                    {getMonthName(selectedOpname.period_month)} {selectedOpname.period_year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOpname.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Petugas</p>
                  <p className="font-medium">{selectedOpname.performer?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Item</p>
                  <p className="font-medium">{selectedOpname.total_items_checked}</p>
                </div>
              </div>

              {/* Details Table */}
              <div>
                <h4 className="font-medium mb-3">Detail Per Item</h4>
                {loadingDetails ? (
                  <div className="text-center py-8 text-gray-500">Memuat detail...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Obat</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead className="text-right">Sistem</TableHead>
                        <TableHead className="text-right">Fisik</TableHead>
                        <TableHead className="text-right">Selisih</TableHead>
                        <TableHead>Alasan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opnameDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{detail.medicine?.name}</p>
                              <p className="text-sm text-gray-500">
                                {detail.medicine?.medicine_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {detail.batch_number}
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.system_quantity} {detail.medicine?.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {detail.physical_quantity} {detail.medicine?.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {getVarianceBadge(detail.variance)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {detail.variance_reason || '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Notes */}
              {selectedOpname.notes && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Catatan</h4>
                  <p className="text-sm text-gray-600">{selectedOpname.notes}</p>
                </div>
              )}

              {/* Actions */}
              <DialogFooter>
                {selectedOpname.status === 'draft' && (
                  <Button onClick={() => handleCompleteOpname(selectedOpname.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tandai Selesai
                  </Button>
                )}
                {selectedOpname.status === 'completed' && (
                  <Button onClick={() => handleApproveOpname(selectedOpname.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setujui & Sesuaikan Stok
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
