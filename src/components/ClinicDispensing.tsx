/**
 * ==========================================================================
 * CLINIC MODULE - PENYERAHAN OBAT (DISPENSING)
 * ==========================================================================
 *
 * Komponen untuk proses penyerahan obat ke pasien berdasarkan resep dokter.
 * Fitur: Process pending prescriptions, stock tracking, batch management
 *
 * #ClinicModule #Dispensing #Pharmacy
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-10
 * ==========================================================================
 */

import { useState, useEffect } from 'react'
import {
  Search,
  Pill,
  Package,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Clock,
  Eye,
  ShoppingBag,
  Scan,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
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
  Alert,
  AlertDescription,
  AlertTitle,
} from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

// TypeScript interfaces
interface Prescription {
  id: string
  prescription_number: string
  prescription_date: string
  status: string
  notes: string | null
  medical_record: {
    examination_date: string
    patient: {
      id: string
      patient_code: string
      full_name: string
      gender: string
      birth_date: string
      allergies: string | null
    }
    doctor: {
      full_name: string
      specialization: string
    }
  }
  prescription_details: PrescriptionDetail[]
}

interface PrescriptionDetail {
  id: string
  medicine_id: string
  quantity: number
  dosage: string
  duration_days: number | null
  instructions: string | null
  medicine: {
    medicine_code: string
    name: string
    generic_name: string
    dosage_form: string
    strength: string
    unit: string
  }
  available_stock?: StockBatch[]
  selected_batch?: string
  quantity_to_dispense?: number
}

interface StockBatch {
  id: string
  batch_number: string
  quantity: number
  available_quantity: number
  expiry_date: string
  unit_price: number
  status: string
}

interface DispensingRecord {
  id: string
  prescription_number: string
  patient_name: string
  dispensed_date: string
  total_items: number
  dispensed_by_name: string
  details: {
    medicine_name: string
    quantity: number
    batch_number: string
  }[]
}

export function ClinicDispensing() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')

  // States for pending prescriptions
  const [pendingPrescriptions, setPendingPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // States for dispensing dialog
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showDispensingDialog, setShowDispensingDialog] = useState(false)
  const [dispensingNotes, setDispensingNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  // States for history
  const [dispensingHistory, setDispensingHistory] = useState<DispensingRecord[]>([])
  const [historySearchQuery, setHistorySearchQuery] = useState('')

  // Load pending prescriptions
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingPrescriptions()
    }
  }, [activeTab])

  // Load dispensing history
  useEffect(() => {
    if (activeTab === 'history') {
      loadDispensingHistory()
    }
  }, [activeTab])

  const loadPendingPrescriptions = async () => {
    try {
      setLoading(true)

      const { data: prescriptions, error: prescError } = await supabase
        .from('clinic_prescriptions')
        .select(`
          id,
          prescription_number,
          prescription_date,
          status,
          notes,
          medical_record:clinic_medical_records!inner(
            examination_date,
            patient:patients!inner(
              id,
              patient_code,
              full_name,
              gender,
              birth_date,
              allergies
            ),
            doctor:clinic_doctors!inner(
              full_name,
              specialization
            )
          )
        `)
        .eq('status', 'pending')
        .order('prescription_date', { ascending: false })
        .order('prescription_number', { ascending: false })

      if (prescError) throw prescError

      // Load prescription details for each prescription
      const prescriptionsWithDetails = await Promise.all(
        (prescriptions || []).map(async (prescription) => {
          const { data: details, error: detailsError } = await supabase
            .from('clinic_prescription_details')
            .select(`
              id,
              medicine_id,
              quantity,
              dosage,
              duration_days,
              instructions,
              medicine:clinic_medicines!inner(
                medicine_code,
                name,
                generic_name,
                dosage_form,
                strength,
                unit
              )
            `)
            .eq('prescription_id', prescription.id)

          if (detailsError) throw detailsError

          return {
            ...prescription,
            prescription_details: details || [],
          }
        })
      )

      setPendingPrescriptions(prescriptionsWithDetails)
    } catch (error: any) {
      console.error('Error loading pending prescriptions:', error)
      toast.error('Gagal memuat daftar resep')
    } finally {
      setLoading(false)
    }
  }

  const loadStockForMedicine = async (medicineId: string): Promise<StockBatch[]> => {
    try {
      const { data, error } = await supabase
        .from('clinic_medicine_stock')
        .select('id, batch_number, quantity, available_quantity, expiry_date, unit_price, status')
        .eq('medicine_id', medicineId)
        .eq('status', 'available')
        .gt('available_quantity', 0)
        .order('expiry_date', { ascending: true }) // FEFO: First Expiry First Out

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error loading stock:', error)
      return []
    }
  }

  const handlePrepareDispensing = async (prescription: Prescription) => {
    try {
      setLoading(true)

      // Load stock for each medicine in the prescription
      const detailsWithStock = await Promise.all(
        prescription.prescription_details.map(async (detail) => {
          const stock = await loadStockForMedicine(detail.medicine_id)
          return {
            ...detail,
            available_stock: stock,
            selected_batch: stock.length > 0 ? stock[0].batch_number : undefined,
            quantity_to_dispense: detail.quantity,
          }
        })
      )

      setSelectedPrescription({
        ...prescription,
        prescription_details: detailsWithStock,
      })
      setShowDispensingDialog(true)
    } catch (error: any) {
      console.error('Error preparing dispensing:', error)
      toast.error('Gagal menyiapkan data penyerahan obat')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDispensingDetail = (
    index: number,
    field: 'selected_batch' | 'quantity_to_dispense',
    value: any
  ) => {
    if (!selectedPrescription) return

    const updated = [...selectedPrescription.prescription_details]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedPrescription({
      ...selectedPrescription,
      prescription_details: updated,
    })
  }

  const validateDispensing = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!selectedPrescription) {
      errors.push('Tidak ada resep yang dipilih')
      return { valid: false, errors }
    }

    // Check each medicine
    selectedPrescription.prescription_details.forEach((detail, index) => {
      if (!detail.selected_batch) {
        errors.push(`${detail.medicine.name}: Batch belum dipilih`)
      }

      if (!detail.quantity_to_dispense || detail.quantity_to_dispense <= 0) {
        errors.push(`${detail.medicine.name}: Jumlah tidak valid`)
      }

      // Check if quantity exceeds available stock
      if (detail.selected_batch && detail.available_stock) {
        const batch = detail.available_stock.find((b) => b.batch_number === detail.selected_batch)
        if (batch && detail.quantity_to_dispense && detail.quantity_to_dispense > batch.available_quantity) {
          errors.push(
            `${detail.medicine.name}: Jumlah melebihi stok tersedia (batch ${batch.batch_number}: ${batch.available_quantity} ${detail.medicine.unit})`
          )
        }
      }

      // Check if quantity exceeds prescription quantity
      if (detail.quantity_to_dispense && detail.quantity_to_dispense > detail.quantity) {
        errors.push(
          `${detail.medicine.name}: Jumlah diserahkan (${detail.quantity_to_dispense}) melebihi jumlah resep (${detail.quantity})`
        )
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  const handleDispense = async () => {
    try {
      // Validate
      const validation = validateDispensing()
      if (!validation.valid) {
        validation.errors.forEach((error) => toast.error(error))
        return
      }

      if (!selectedPrescription || !user) return

      setProcessing(true)

      // Create dispensing records
      const dispensingRecords = selectedPrescription.prescription_details.map((detail) => {
        const batch = detail.available_stock?.find((b) => b.batch_number === detail.selected_batch)

        return {
          prescription_id: selectedPrescription.id,
          prescription_detail_id: detail.id,
          medicine_id: detail.medicine_id,
          batch_number: detail.selected_batch!,
          quantity_dispensed: detail.quantity_to_dispense!,
          expiry_date: batch?.expiry_date,
          dispensed_by: user.id,
          notes: dispensingNotes || null,
        }
      })

      const { error: dispensingError } = await supabase
        .from('clinic_medicine_dispensing')
        .insert(dispensingRecords)

      if (dispensingError) throw dispensingError

      // Update stock quantities
      for (const detail of selectedPrescription.prescription_details) {
        const batch = detail.available_stock?.find((b) => b.batch_number === detail.selected_batch)
        if (!batch) continue

        const newQuantity = batch.quantity - (detail.quantity_to_dispense || 0)

        const { error: stockError } = await supabase
          .from('clinic_medicine_stock')
          .update({ quantity: newQuantity })
          .eq('id', batch.id)

        if (stockError) throw stockError
      }

      // Update prescription status to dispensed
      const { error: statusError } = await supabase
        .from('clinic_prescriptions')
        .update({ status: 'dispensed' })
        .eq('id', selectedPrescription.id)

      if (statusError) throw statusError

      toast.success('Obat berhasil diserahkan ke pasien')

      // Reset and refresh
      setShowDispensingDialog(false)
      setSelectedPrescription(null)
      setDispensingNotes('')
      loadPendingPrescriptions()
    } catch (error: any) {
      console.error('Error dispensing medicine:', error)
      toast.error('Gagal menyerahkan obat')
    } finally {
      setProcessing(false)
    }
  }

  const loadDispensingHistory = async () => {
    try {
      setLoading(true)

      const { data: dispensingData, error: dispensingError } = await supabase
        .from('clinic_medicine_dispensing')
        .select(`
          id,
          prescription_id,
          medicine_id,
          batch_number,
          quantity_dispensed,
          dispensed_date,
          prescription:clinic_prescriptions!inner(
            prescription_number,
            medical_record:clinic_medical_records!inner(
              patient:patients!inner(
                full_name
              )
            )
          ),
          medicine:clinic_medicines!inner(
            name,
            unit
          ),
          dispensed_by_user:users!inner(
            name
          )
        `)
        .order('dispensed_date', { ascending: false })
        .limit(100)

      if (dispensingError) throw dispensingError

      // Group by prescription
      const groupedByPrescription = new Map<string, any>()

      dispensingData?.forEach((item: any) => {
        const prescId = item.prescription_id

        if (!groupedByPrescription.has(prescId)) {
          groupedByPrescription.set(prescId, {
            id: prescId,
            prescription_number: item.prescription.prescription_number,
            patient_name: item.prescription.medical_record.patient.full_name,
            dispensed_date: item.dispensed_date,
            dispensed_by_name: item.dispensed_by_user.name,
            total_items: 0,
            details: [],
          })
        }

        const record = groupedByPrescription.get(prescId)
        record.total_items += 1
        record.details.push({
          medicine_name: item.medicine.name,
          quantity: item.quantity_dispensed,
          batch_number: item.batch_number,
          unit: item.medicine.unit,
        })
      })

      setDispensingHistory(Array.from(groupedByPrescription.values()))
    } catch (error: any) {
      console.error('Error loading dispensing history:', error)
      toast.error('Gagal memuat riwayat penyerahan obat')
    } finally {
      setLoading(false)
    }
  }

  // Filter pending prescriptions
  const filteredPendingPrescriptions = pendingPrescriptions.filter((prescription) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      prescription.prescription_number.toLowerCase().includes(searchLower) ||
      prescription.medical_record.patient.full_name.toLowerCase().includes(searchLower) ||
      prescription.medical_record.patient.patient_code.toLowerCase().includes(searchLower)
    )
  })

  // Filter history
  const filteredHistory = dispensingHistory.filter((record) => {
    const searchLower = historySearchQuery.toLowerCase()
    return (
      record.prescription_number.toLowerCase().includes(searchLower) ||
      record.patient_name.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 90 // 3 months
  }

  const getTotalQuantityAvailable = (detail: PrescriptionDetail) => {
    if (!detail.available_stock) return 0
    return detail.available_stock.reduce((sum, batch) => sum + batch.available_quantity, 0)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Penyerahan Obat</h1>
              <p className="text-sm text-gray-500">Proses penyerahan obat ke pasien berdasarkan resep</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending">
              Resep Menunggu {pendingPrescriptions.length > 0 && `(${pendingPrescriptions.length})`}
            </TabsTrigger>
            <TabsTrigger value="history">Riwayat Penyerahan</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4 mt-4">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari no resep, nama pasien, kode pasien..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pending Prescriptions */}
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Memuat data resep...
                </CardContent>
              </Card>
            ) : filteredPendingPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Tidak ada resep yang menunggu</p>
                  <p className="text-sm mt-1">Semua resep sudah diserahkan atau belum ada resep baru</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPendingPrescriptions.map((prescription) => (
                  <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-semibold text-lg">{prescription.prescription_number}</p>
                              <p className="text-sm text-gray-500">
                                Tanggal Resep: {formatDate(prescription.prescription_date)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">Informasi Pasien</p>
                              </div>
                              <div className="ml-6 space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">{prescription.medical_record.patient.full_name}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  {prescription.medical_record.patient.patient_code} •{' '}
                                  {prescription.medical_record.patient.gender === 'male' ? 'L' : 'P'} •{' '}
                                  {calculateAge(prescription.medical_record.patient.birth_date)} tahun
                                </p>
                                {prescription.medical_record.patient.allergies && (
                                  <Alert className="mt-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                      <span className="font-medium">Alergi:</span>{' '}
                                      {prescription.medical_record.patient.allergies}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Pill className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">Obat yang Diresepkan</p>
                              </div>
                              <div className="ml-6 space-y-2">
                                {prescription.prescription_details.map((detail, idx) => (
                                  <div key={idx} className="text-sm">
                                    <p className="font-medium">{detail.medicine.name}</p>
                                    <p className="text-gray-600">
                                      {detail.quantity} {detail.medicine.unit} • {detail.dosage}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button onClick={() => handlePrepareDispensing(prescription)} size="lg">
                          <Package className="w-4 h-4 mr-2" />
                          Serahkan Obat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari no resep, nama pasien..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* History Table */}
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Memuat riwayat...
                </CardContent>
              </Card>
            ) : filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada riwayat penyerahan obat</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Resep</TableHead>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Tanggal Serah</TableHead>
                        <TableHead>Jumlah Item</TableHead>
                        <TableHead>Diserahkan Oleh</TableHead>
                        <TableHead>Detail Obat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.prescription_number}</TableCell>
                          <TableCell>{record.patient_name}</TableCell>
                          <TableCell>{formatDateTime(record.dispensed_date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.total_items} item</Badge>
                          </TableCell>
                          <TableCell>{record.dispensed_by_name}</TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              {record.details.map((detail: any, idx: number) => (
                                <p key={idx}>
                                  {detail.medicine_name}: {detail.quantity} {detail.unit} (Batch: {detail.batch_number})
                                </p>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dispensing Dialog */}
      <Dialog open={showDispensingDialog} onOpenChange={setShowDispensingDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Penyerahan Obat</DialogTitle>
            <DialogDescription>
              Pilih batch dan jumlah obat yang akan diserahkan ke pasien
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Pasien</p>
                    <p className="font-medium">{selectedPrescription.medical_record.patient.full_name}</p>
                    <p className="text-gray-600">
                      {selectedPrescription.medical_record.patient.patient_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">No. Resep</p>
                    <p className="font-medium">{selectedPrescription.prescription_number}</p>
                    <p className="text-gray-600">{formatDate(selectedPrescription.prescription_date)}</p>
                  </div>
                </div>

                {selectedPrescription.medical_record.patient.allergies && (
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Perhatian: Alergi Pasien</AlertTitle>
                    <AlertDescription>
                      {selectedPrescription.medical_record.patient.allergies}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Medicine Items */}
              <div className="space-y-4">
                <h4 className="font-medium">Daftar Obat:</h4>
                {selectedPrescription.prescription_details.map((detail, index) => {
                  const totalAvailable = getTotalQuantityAvailable(detail)
                  const isStockSufficient = totalAvailable >= detail.quantity

                  return (
                    <div key={detail.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{detail.medicine.name}</p>
                          <p className="text-sm text-gray-500">
                            {detail.medicine.generic_name} • {detail.medicine.dosage_form}{' '}
                            {detail.medicine.strength}
                          </p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>
                              <span className="text-gray-600">Dosis:</span>{' '}
                              <span className="font-medium">{detail.dosage}</span>
                            </p>
                            <p>
                              <span className="text-gray-600">Jumlah Resep:</span>{' '}
                              <span className="font-medium">
                                {detail.quantity} {detail.medicine.unit}
                              </span>
                            </p>
                            {detail.instructions && (
                              <p>
                                <span className="text-gray-600">Instruksi:</span>{' '}
                                <span className="font-medium">{detail.instructions}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {!isStockSufficient && (
                          <Badge variant="destructive" className="ml-2">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Stok Kurang
                          </Badge>
                        )}
                      </div>

                      {/* Stock Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Pilih Batch *</Label>
                          {detail.available_stock && detail.available_stock.length > 0 ? (
                            <Select
                              value={detail.selected_batch}
                              onValueChange={(value) =>
                                handleUpdateDispensingDetail(index, 'selected_batch', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih batch" />
                              </SelectTrigger>
                              <SelectContent>
                                {detail.available_stock.map((batch) => (
                                  <SelectItem key={batch.id} value={batch.batch_number}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>
                                        Batch {batch.batch_number} - Stok: {batch.available_quantity}{' '}
                                        {detail.medicine.unit}
                                      </span>
                                      {isExpiringSoon(batch.expiry_date) && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          ED: {formatDate(batch.expiry_date)}
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                Tidak ada stok tersedia untuk obat ini
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div>
                          <Label>Jumlah Diserahkan *</Label>
                          <Input
                            type="number"
                            min="1"
                            max={detail.quantity}
                            value={detail.quantity_to_dispense || ''}
                            onChange={(e) =>
                              handleUpdateDispensingDetail(
                                index,
                                'quantity_to_dispense',
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Total stok tersedia: {totalAvailable} {detail.medicine.unit}
                          </p>
                        </div>
                      </div>

                      {/* Batch Details */}
                      {detail.selected_batch && detail.available_stock && (
                        <div className="pt-3 border-t">
                          {(() => {
                            const batch = detail.available_stock.find(
                              (b) => b.batch_number === detail.selected_batch
                            )
                            if (!batch) return null

                            return (
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Batch Number</p>
                                  <p className="font-medium">{batch.batch_number}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Tanggal Kadaluarsa</p>
                                  <p className={`font-medium ${isExpiringSoon(batch.expiry_date) ? 'text-orange-600' : ''}`}>
                                    {formatDate(batch.expiry_date)}
                                    {isExpiringSoon(batch.expiry_date) && ' ⚠️'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Stok Tersedia</p>
                                  <p className="font-medium">
                                    {batch.available_quantity} {detail.medicine.unit}
                                  </p>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Notes */}
              <div>
                <Label>Catatan Penyerahan (Opsional)</Label>
                <Textarea
                  placeholder="Catatan tambahan untuk penyerahan obat..."
                  value={dispensingNotes}
                  onChange={(e) => setDispensingNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispensingDialog(false)} disabled={processing}>
              Batal
            </Button>
            <Button onClick={handleDispense} disabled={processing}>
              {processing ? 'Memproses...' : 'Serahkan Obat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
