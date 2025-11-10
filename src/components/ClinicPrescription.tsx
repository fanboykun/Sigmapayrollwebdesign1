/**
 * ==========================================================================
 * CLINIC MODULE - RESEP OBAT (PRESCRIPTION)
 * ==========================================================================
 *
 * Komponen untuk mengelola resep obat dari dokter.
 * Fitur: View prescriptions, create from medical records, prescription details
 *
 * #ClinicModule #Prescription #Medicine
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-10
 * ==========================================================================
 */

import { useState, useEffect } from 'react'
import {
  Search,
  FileText,
  Plus,
  Eye,
  Calendar,
  User,
  Stethoscope,
  Pill,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Printer,
  Edit2,
  Trash2,
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
  status: 'pending' | 'dispensed' | 'cancelled'
  notes: string | null
  medical_record: {
    id: string
    examination_date: string
    diagnosis_notes: string
    patient: {
      patient_code: string
      full_name: string
      gender: string
      birth_date: string
    }
    doctor: {
      full_name: string
      specialization: string
      str_number: string
    }
  }
  prescription_details?: PrescriptionDetail[]
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
    price_per_unit: number
    current_stock?: number
  }
}

interface MedicalRecord {
  id: string
  examination_date: string
  diagnosis_notes: string
  treatment_plan: string
  patient: {
    id: string
    patient_code: string
    full_name: string
    gender: string
    birth_date: string
  }
  doctor: {
    id: string
    full_name: string
    specialization: string
  }
  visit: {
    visit_number: string
    chief_complaint: string
  }
}

interface Medicine {
  id: string
  medicine_code: string
  name: string
  generic_name: string
  dosage_form: string
  strength: string
  unit: string
  price_per_unit: number
  require_prescription: boolean
  current_stock: number
}

interface PrescriptionItemForm {
  medicine_id: string
  quantity: number
  dosage: string
  duration_days: number | null
  instructions: string
}

export function ClinicPrescription() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')

  // States for prescription list
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // States for prescription detail dialog
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // States for create prescription
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecord | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicineSearch, setMedicineSearch] = useState('')
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemForm[]>([])
  const [prescriptionNotes, setPrescriptionNotes] = useState('')
  const [creating, setCreating] = useState(false)

  // Load prescriptions
  useEffect(() => {
    if (activeTab === 'list') {
      loadPrescriptions()
    }
  }, [activeTab])

  // Load medical records for create form
  useEffect(() => {
    if (activeTab === 'create') {
      loadMedicalRecordsWithoutPrescription()
      loadMedicines()
    }
  }, [activeTab])

  const loadPrescriptions = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('clinic_prescriptions')
        .select(`
          id,
          prescription_number,
          prescription_date,
          status,
          notes,
          medical_record:clinic_medical_records!inner(
            id,
            examination_date,
            diagnosis_notes,
            patient:patients!inner(
              patient_code,
              full_name,
              gender,
              birth_date
            ),
            doctor:clinic_doctors!inner(
              full_name,
              specialization,
              str_number
            )
          )
        `)
        .order('prescription_date', { ascending: false })
        .order('prescription_number', { ascending: false })

      if (error) throw error

      setPrescriptions(data || [])
    } catch (error: any) {
      console.error('Error loading prescriptions:', error)
      toast.error('Gagal memuat data resep obat')
    } finally {
      setLoading(false)
    }
  }

  const loadPrescriptionDetails = async (prescriptionId: string) => {
    try {
      const { data, error } = await supabase
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
            unit,
            price_per_unit
          )
        `)
        .eq('prescription_id', prescriptionId)

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error loading prescription details:', error)
      toast.error('Gagal memuat detail resep')
      return []
    }
  }

  const loadMedicalRecordsWithoutPrescription = async () => {
    try {
      // Get medical records that are completed and don't have prescriptions yet
      const { data: records, error: recordsError } = await supabase
        .from('clinic_medical_records')
        .select(`
          id,
          examination_date,
          diagnosis_notes,
          treatment_plan,
          patient:patients!inner(
            id,
            patient_code,
            full_name,
            gender,
            birth_date
          ),
          doctor:clinic_doctors!inner(
            id,
            full_name,
            specialization
          ),
          visit:clinic_visits!inner(
            visit_number,
            chief_complaint
          )
        `)
        .eq('status', 'completed')
        .order('examination_date', { ascending: false })
        .limit(50)

      if (recordsError) throw recordsError

      // Filter out records that already have prescriptions
      const { data: existingPrescriptions, error: prescError } = await supabase
        .from('clinic_prescriptions')
        .select('medical_record_id')

      if (prescError) throw prescError

      const existingIds = new Set(existingPrescriptions?.map(p => p.medical_record_id))
      const availableRecords = records?.filter(r => !existingIds.has(r.id)) || []

      setMedicalRecords(availableRecords)
    } catch (error: any) {
      console.error('Error loading medical records:', error)
      toast.error('Gagal memuat data rekam medis')
    }
  }

  const loadMedicines = async () => {
    try {
      const { data: medicinesData, error: medicinesError } = await supabase
        .from('clinic_medicines')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (medicinesError) throw medicinesError

      // Load stock data
      const { data: stockData, error: stockError } = await supabase
        .from('clinic_medicine_stock')
        .select('medicine_id, quantity')
        .eq('status', 'available')

      if (stockError) throw stockError

      // Aggregate stock by medicine_id
      const stockMap = new Map<string, number>()
      stockData?.forEach(stock => {
        const current = stockMap.get(stock.medicine_id) || 0
        stockMap.set(stock.medicine_id, current + stock.quantity)
      })

      // Combine data
      const medicinesWithStock = medicinesData?.map(med => ({
        ...med,
        current_stock: stockMap.get(med.id) || 0,
      })) || []

      setMedicines(medicinesWithStock)
    } catch (error: any) {
      console.error('Error loading medicines:', error)
      toast.error('Gagal memuat data obat')
    }
  }

  const handleViewDetail = async (prescription: Prescription) => {
    const details = await loadPrescriptionDetails(prescription.id)
    setSelectedPrescription({ ...prescription, prescription_details: details })
    setShowDetailDialog(true)
  }

  const handleAddMedicine = (medicine: Medicine) => {
    // Check if medicine already added
    if (prescriptionItems.find(item => item.medicine_id === medicine.id)) {
      toast.error('Obat sudah ditambahkan ke resep')
      return
    }

    // Add to prescription items
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicine_id: medicine.id,
        quantity: 1,
        dosage: '',
        duration_days: null,
        instructions: '',
      },
    ])

    setMedicineSearch('')
  }

  const handleUpdatePrescriptionItem = (
    index: number,
    field: keyof PrescriptionItemForm,
    value: any
  ) => {
    const updated = [...prescriptionItems]
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptionItems(updated)
  }

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index))
  }

  const handleCreatePrescription = async () => {
    try {
      if (!selectedMedicalRecord) {
        toast.error('Pilih rekam medis terlebih dahulu')
        return
      }

      if (prescriptionItems.length === 0) {
        toast.error('Tambahkan minimal 1 obat ke resep')
        return
      }

      // Validate all items have dosage
      const invalidItems = prescriptionItems.filter(item => !item.dosage || !item.quantity)
      if (invalidItems.length > 0) {
        toast.error('Lengkapi dosis dan jumlah untuk semua obat')
        return
      }

      setCreating(true)

      // Generate prescription number
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

      // Get last prescription number for today
      const { data: lastPrescription } = await supabase
        .from('clinic_prescriptions')
        .select('prescription_number')
        .like('prescription_number', `RES-${dateStr}%`)
        .order('prescription_number', { ascending: false })
        .limit(1)
        .single()

      let sequence = 1
      if (lastPrescription) {
        const lastSeq = parseInt(lastPrescription.prescription_number.split('-')[2])
        sequence = lastSeq + 1
      }

      const prescriptionNumber = `RES-${dateStr}-${sequence.toString().padStart(4, '0')}`

      // Create prescription
      const { data: prescription, error: prescError } = await supabase
        .from('clinic_prescriptions')
        .insert({
          medical_record_id: selectedMedicalRecord.id,
          prescription_number: prescriptionNumber,
          prescription_date: today.toISOString().split('T')[0],
          status: 'pending',
          notes: prescriptionNotes || null,
        })
        .select()
        .single()

      if (prescError) throw prescError

      // Create prescription details
      const details = prescriptionItems.map(item => ({
        prescription_id: prescription.id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        dosage: item.dosage,
        duration_days: item.duration_days,
        instructions: item.instructions || null,
      }))

      const { error: detailsError } = await supabase
        .from('clinic_prescription_details')
        .insert(details)

      if (detailsError) throw detailsError

      toast.success('Resep obat berhasil dibuat')

      // Reset form
      setSelectedMedicalRecord(null)
      setPrescriptionItems([])
      setPrescriptionNotes('')
      setActiveTab('list')
    } catch (error: any) {
      console.error('Error creating prescription:', error)
      toast.error('Gagal membuat resep obat')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateStatus = async (prescriptionId: string, newStatus: 'dispensed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('clinic_prescriptions')
        .update({ status: newStatus })
        .eq('id', prescriptionId)

      if (error) throw error

      toast.success(`Status resep berhasil diubah menjadi ${newStatus === 'dispensed' ? 'Sudah Diserahkan' : 'Dibatalkan'}`)
      loadPrescriptions()
      setShowDetailDialog(false)
    } catch (error: any) {
      console.error('Error updating prescription status:', error)
      toast.error('Gagal mengubah status resep')
    }
  }

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch =
      prescription.prescription_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medical_record.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medical_record.patient.patient_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medical_record.doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Filter medicines for search
  const filteredMedicines = medicines.filter(med =>
    medicineSearch &&
    (med.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      med.generic_name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      med.medicine_code.toLowerCase().includes(medicineSearch.toLowerCase()))
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        )
      case 'dispensed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Diserahkan
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Dibatalkan
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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

  const getMedicineById = (medicineId: string) => {
    return medicines.find(m => m.id === medicineId)
  }

  const calculateTotal = () => {
    return prescriptionItems.reduce((total, item) => {
      const medicine = getMedicineById(item.medicine_id)
      if (medicine) {
        return total + (medicine.price_per_unit * item.quantity)
      }
      return total
    }, 0)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Resep Obat</h1>
              <p className="text-sm text-gray-500">Kelola resep obat dari dokter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">Daftar Resep</TabsTrigger>
            <TabsTrigger value="create">Buat Resep Baru</TabsTrigger>
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
                      placeholder="Cari no resep, pasien, dokter..."
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
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="dispensed">Sudah Diserahkan</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Prescriptions Table */}
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Memuat data resep...
                </CardContent>
              </Card>
            ) : filteredPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Tidak ada data resep obat</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Resep</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Dokter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">
                            {prescription.prescription_number}
                          </TableCell>
                          <TableCell>{formatDate(prescription.prescription_date)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{prescription.medical_record.patient.full_name}</p>
                              <p className="text-sm text-gray-500">{prescription.medical_record.patient.patient_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{prescription.medical_record.doctor.full_name}</p>
                              <p className="text-sm text-gray-500">{prescription.medical_record.doctor.specialization}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(prescription)}
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
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Pilih rekam medis yang sudah selesai untuk membuat resep obat
              </AlertDescription>
            </Alert>

            {/* Select Medical Record */}
            <Card>
              <CardHeader>
                <CardTitle>1. Pilih Rekam Medis</CardTitle>
                <CardDescription>
                  Pilih dari daftar pemeriksaan yang belum memiliki resep
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada rekam medis yang tersedia</p>
                    <p className="text-sm">Semua rekam medis sudah memiliki resep atau belum ada pemeriksaan selesai</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {medicalRecords.map((record) => (
                      <div
                        key={record.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedMedicalRecord?.id === record.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedMedicalRecord(record)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">{record.patient.full_name}</p>
                                <p className="text-sm text-gray-500">
                                  {record.patient.patient_code} • {record.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'} • {calculateAge(record.patient.birth_date)} tahun
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <Stethoscope className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">Dokter:</span> {record.doctor.full_name} ({record.doctor.specialization})
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className="text-sm">
                                <span className="font-medium">Tanggal:</span> {formatDate(record.examination_date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <p className="text-sm">
                                <span className="font-medium">Keluhan:</span> {record.visit.chief_complaint}
                              </p>
                            </div>
                            {record.diagnosis_notes && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Diagnosis:</span> {record.diagnosis_notes}
                                </p>
                              </div>
                            )}
                          </div>
                          {selectedMedicalRecord?.id === record.id && (
                            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Medicines */}
            {selectedMedicalRecord && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>2. Tambah Obat ke Resep</CardTitle>
                    <CardDescription>Cari dan tambahkan obat yang akan diresepkan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Medicine Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Cari obat berdasarkan nama, nama generik, atau kode..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Medicine Search Results */}
                    {medicineSearch && filteredMedicines.length > 0 && (
                      <div className="border rounded-lg max-h-64 overflow-y-auto">
                        {filteredMedicines.map((medicine) => (
                          <div
                            key={medicine.id}
                            className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleAddMedicine(medicine)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{medicine.name}</p>
                                <p className="text-sm text-gray-500">
                                  {medicine.generic_name} • {medicine.dosage_form} {medicine.strength}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500">
                                    Stok: {medicine.current_stock} {medicine.unit}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Rp {medicine.price_per_unit.toLocaleString('id-ID')}
                                  </span>
                                  {medicine.require_prescription && (
                                    <Badge variant="outline" className="text-xs">
                                      Resep Dokter
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Plus className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Added Medicines List */}
                    {prescriptionItems.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="font-medium text-sm text-gray-700">Obat dalam Resep:</h4>
                        {prescriptionItems.map((item, index) => {
                          const medicine = getMedicineById(item.medicine_id)
                          if (!medicine) return null

                          return (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{medicine.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {medicine.generic_name} • {medicine.dosage_form} {medicine.strength}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemovePrescriptionItem(index)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label>Jumlah *</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleUpdatePrescriptionItem(index, 'quantity', parseInt(e.target.value) || 1)
                                    }
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Stok: {medicine.current_stock}</p>
                                </div>

                                <div>
                                  <Label>Dosis/Aturan Pakai *</Label>
                                  <Input
                                    placeholder="Contoh: 3x1 sehari"
                                    value={item.dosage}
                                    onChange={(e) =>
                                      handleUpdatePrescriptionItem(index, 'dosage', e.target.value)
                                    }
                                  />
                                </div>

                                <div>
                                  <Label>Durasi (Hari)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="Opsional"
                                    value={item.duration_days || ''}
                                    onChange={(e) =>
                                      handleUpdatePrescriptionItem(
                                        index,
                                        'duration_days',
                                        e.target.value ? parseInt(e.target.value) : null
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>Instruksi Tambahan</Label>
                                <Textarea
                                  placeholder="Contoh: Diminum setelah makan, hindari minuman beralkohol"
                                  value={item.instructions}
                                  onChange={(e) =>
                                    handleUpdatePrescriptionItem(index, 'instructions', e.target.value)
                                  }
                                  rows={2}
                                />
                              </div>

                              <div className="pt-2 border-t">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Subtotal:</span> Rp{' '}
                                  {(medicine.price_per_unit * item.quantity).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          )
                        })}

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-lg font-semibold text-gray-900">
                            Total Estimasi: Rp {calculateTotal().toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes and Submit */}
                {prescriptionItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>3. Catatan Resep</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Catatan Tambahan (Opsional)</Label>
                        <Textarea
                          placeholder="Catatan khusus untuk resep ini..."
                          value={prescriptionNotes}
                          onChange={(e) => setPrescriptionNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedMedicalRecord(null)
                            setPrescriptionItems([])
                            setPrescriptionNotes('')
                          }}
                        >
                          Batalkan
                        </Button>
                        <Button onClick={handleCreatePrescription} disabled={creating}>
                          {creating ? 'Menyimpan...' : 'Buat Resep'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Resep Obat</DialogTitle>
            <DialogDescription>Informasi lengkap resep obat</DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4">
              {/* Prescription Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">No. Resep</p>
                  <p className="font-medium">{selectedPrescription.prescription_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Resep</p>
                  <p className="font-medium">{formatDate(selectedPrescription.prescription_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPrescription.status)}</div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Informasi Pasien</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Nama Pasien</p>
                    <p className="font-medium">{selectedPrescription.medical_record.patient.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">No. Rekam Medis</p>
                    <p className="font-medium">{selectedPrescription.medical_record.patient.patient_code}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jenis Kelamin</p>
                    <p className="font-medium">
                      {selectedPrescription.medical_record.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Umur</p>
                    <p className="font-medium">
                      {calculateAge(selectedPrescription.medical_record.patient.birth_date)} tahun
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Dokter Pemeriksa</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Nama Dokter</p>
                    <p className="font-medium">{selectedPrescription.medical_record.doctor.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Spesialisasi</p>
                    <p className="font-medium">{selectedPrescription.medical_record.doctor.specialization}</p>
                  </div>
                </div>
              </div>

              {/* Medicine Details */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Daftar Obat</h4>
                {selectedPrescription.prescription_details && selectedPrescription.prescription_details.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPrescription.prescription_details.map((detail, index) => (
                      <div key={detail.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{detail.medicine.name}</p>
                            <p className="text-sm text-gray-500">
                              {detail.medicine.generic_name} • {detail.medicine.dosage_form} {detail.medicine.strength}
                            </p>
                          </div>
                          <Badge variant="outline">{detail.quantity} {detail.medicine.unit}</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Dosis:</span> <span className="font-medium">{detail.dosage}</span>
                          </p>
                          {detail.duration_days && (
                            <p>
                              <span className="text-gray-500">Durasi:</span>{' '}
                              <span className="font-medium">{detail.duration_days} hari</span>
                            </p>
                          )}
                          {detail.instructions && (
                            <p>
                              <span className="text-gray-500">Instruksi:</span>{' '}
                              <span className="font-medium">{detail.instructions}</span>
                            </p>
                          )}
                          <p>
                            <span className="text-gray-500">Subtotal:</span>{' '}
                            <span className="font-medium">
                              Rp {(detail.medicine.price_per_unit * detail.quantity).toLocaleString('id-ID')}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t">
                      <p className="text-lg font-semibold">
                        Total: Rp{' '}
                        {selectedPrescription.prescription_details
                          .reduce((total, detail) => total + detail.medicine.price_per_unit * detail.quantity, 0)
                          .toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada detail obat</p>
                )}
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Catatan</h4>
                  <p className="text-sm text-gray-600">{selectedPrescription.notes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedPrescription.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedPrescription.id, 'cancelled')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Batalkan Resep
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedPrescription.id, 'dispensed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tandai Diserahkan
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
