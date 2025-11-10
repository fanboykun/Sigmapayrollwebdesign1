/**
 * ==========================================================================
 * CLINIC MODULE - MEDICAL EXAMINATION & DIAGNOSIS
 * ==========================================================================
 *
 * Komponen untuk pemeriksaan medis dan diagnosa oleh dokter.
 * Fitur: vital signs, anamnesis, physical exam, diagnosis, treatment plan
 *
 * #ClinicModule #MedicalExamination #Diagnosis
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-09
 * ==========================================================================
 */

import { useState, useEffect } from 'react'
import {
  Search,
  Stethoscope,
  Activity,
  FileText,
  Save,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  FileCheck,
  Pill,
  ClipboardList,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'

// TypeScript interfaces
interface Visit {
  id: string
  visit_number: string
  visit_date: string
  visit_time: string
  queue_number: number
  chief_complaint: string
  visit_type: string
  status: string
  patient: {
    id: string
    patient_number: string
    full_name: string
    gender: string
    birth_date: string
    blood_type: string
    phone: string
    allergies: string
    chronic_diseases: string
  }
}

interface Disease {
  id: string
  icd10_code: string
  name: string
  category: string
  is_common: boolean
}

interface Doctor {
  id: string
  doctor_code: string
  full_name: string
  specialization: string
  str_number: string
}

interface VitalSigns {
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  heart_rate: number | null
  temperature: number | null
  respiratory_rate: number | null
  weight: number | null
  height: number | null
  bmi: number | null
}

interface MedicalRecordFormData extends VitalSigns {
  anamnesis: string
  physical_examination: string
  diagnosis_primary: string
  diagnosis_secondary: string
  diagnosis_notes: string
  treatment_plan: string
  follow_up_date: string
}

export function MedicalExamination() {
  const { user, hasPermission } = useAuth()
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null)
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // States for visits
  const [todayVisits, setTodayVisits] = useState<Visit[]>([])
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // States for diseases
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [commonDiseases, setCommonDiseases] = useState<Disease[]>([])
  const [diseaseSearch, setDiseaseSearch] = useState('')
  const [diseasesByCategory, setDiseasesByCategory] = useState<Record<string, Disease[]>>({})

  // States for form
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    heart_rate: null,
    temperature: null,
    respiratory_rate: null,
    weight: null,
    height: null,
    bmi: null,
    anamnesis: '',
    physical_examination: '',
    diagnosis_primary: '',
    diagnosis_secondary: '',
    diagnosis_notes: '',
    treatment_plan: '',
    follow_up_date: '',
  })

  const [showDiseaseDialog, setShowDiseaseDialog] = useState(false)
  const [selectingPrimaryDiagnosis, setSelectingPrimaryDiagnosis] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Check if user is superadmin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user?.id) return

      // Get user's role
      const { data: userData } = await supabase
        .from('users')
        .select('role:roles(code)')
        .eq('id', user.id)
        .single()

      const isSuperAdmin = userData?.role?.code === 'super_admin'
      setIsSuperAdmin(isSuperAdmin)

      if (isSuperAdmin) {
        // Fetch all active doctors for superadmin
        fetchAllDoctors()
      } else {
        // Fetch current doctor info for regular doctor
        fetchCurrentDoctor()
      }
    }

    checkSuperAdmin()
  }, [user])

  // Fetch current doctor info (for regular doctor users)
  const fetchCurrentDoctor = async () => {
    if (!user?.id) return

    const { data, error } = await supabase
      .from('clinic_doctors')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!error && data) {
      setCurrentDoctor(data)
      setSelectedDoctorId(data.id)
    }
  }

  // Fetch all active doctors (for superadmin)
  const fetchAllDoctors = async () => {
    const { data, error } = await supabase
      .from('clinic_doctors')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    if (!error && data) {
      setAllDoctors(data)
      // Set first doctor as default if available
      if (data.length > 0) {
        setSelectedDoctorId(data[0].id)
      }
    }
  }

  // Fetch today's visits
  useEffect(() => {
    fetchTodayVisits()
  }, [])

  // Fetch diseases
  useEffect(() => {
    fetchDiseases()
  }, [])

  // Calculate BMI automatically
  useEffect(() => {
    if (formData.weight && formData.height) {
      const heightInMeters = formData.height / 100
      const bmi = formData.weight / (heightInMeters * heightInMeters)
      setFormData(prev => ({ ...prev, bmi: Math.round(bmi * 100) / 100 }))
    }
  }, [formData.weight, formData.height])

  const fetchTodayVisits = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('visit_date', today)
        .in('status', ['waiting', 'in_progress'])
        .order('queue_number', { ascending: true })

      if (error) throw error
      setTodayVisits(data || [])
    } catch (err: any) {
      toast.error('Gagal memuat data kunjungan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDiseases = async () => {
    try {
      // Fetch all active diseases
      const { data: allDiseases, error: allError } = await supabase
        .from('clinic_diseases')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (allError) throw allError
      setDiseases(allDiseases || [])

      // Group diseases by category
      const grouped = (allDiseases || []).reduce((acc, disease) => {
        const category = disease.category || 'Lainnya'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(disease)
        return acc
      }, {} as Record<string, Disease[]>)
      setDiseasesByCategory(grouped)

      // Fetch common diseases
      const { data: commonData, error: commonError } = await supabase
        .from('clinic_diseases')
        .select('*')
        .eq('is_active', true)
        .eq('is_common', true)
        .order('name')

      if (commonError) throw commonError
      setCommonDiseases(commonData || [])
    } catch (err: any) {
      toast.error('Gagal memuat data penyakit: ' + err.message)
    }
  }

  const handleSelectVisit = async (visit: Visit) => {
    setSelectedVisit(visit)
    setError('')
    setSuccess(false)

    // Check if medical record already exists for this visit
    const { data: existingRecord } = await supabase
      .from('clinic_medical_records')
      .select('*')
      .eq('visit_id', visit.id)
      .single()

    if (existingRecord) {
      // Load existing data
      setFormData({
        blood_pressure_systolic: existingRecord.blood_pressure_systolic,
        blood_pressure_diastolic: existingRecord.blood_pressure_diastolic,
        heart_rate: existingRecord.heart_rate,
        temperature: existingRecord.temperature,
        respiratory_rate: existingRecord.respiratory_rate,
        weight: existingRecord.weight,
        height: existingRecord.height,
        bmi: existingRecord.bmi,
        anamnesis: existingRecord.anamnesis || '',
        physical_examination: existingRecord.physical_examination || '',
        diagnosis_primary: existingRecord.diagnosis_primary || '',
        diagnosis_secondary: existingRecord.diagnosis_secondary || '',
        diagnosis_notes: existingRecord.diagnosis_notes || '',
        treatment_plan: existingRecord.treatment_plan || '',
        follow_up_date: existingRecord.follow_up_date || '',
      })
      toast.info('Data pemeriksaan sebelumnya berhasil dimuat')
    } else {
      // Reset form for new examination
      setFormData({
        blood_pressure_systolic: null,
        blood_pressure_diastolic: null,
        heart_rate: null,
        temperature: null,
        respiratory_rate: null,
        weight: null,
        height: null,
        bmi: null,
        anamnesis: '',
        physical_examination: '',
        diagnosis_primary: '',
        diagnosis_secondary: '',
        diagnosis_notes: '',
        treatment_plan: '',
        follow_up_date: '',
      })
    }
  }

  const handleInputChange = (field: keyof MedicalRecordFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectDisease = (diseaseId: string) => {
    if (selectingPrimaryDiagnosis) {
      setFormData(prev => ({ ...prev, diagnosis_primary: diseaseId }))
    } else {
      setFormData(prev => ({ ...prev, diagnosis_secondary: diseaseId }))
    }
    setShowDiseaseDialog(false)
  }

  const handleOpenDiseaseDialog = (isPrimary: boolean) => {
    setSelectingPrimaryDiagnosis(isPrimary)
    setShowDiseaseDialog(true)
  }

  const validateForm = (): boolean => {
    if (!selectedVisit) {
      setError('Pilih kunjungan pasien terlebih dahulu')
      return false
    }

    if (!selectedDoctorId) {
      setError('Pilih dokter yang melakukan pemeriksaan')
      return false
    }

    if (!formData.diagnosis_primary) {
      setError('Diagnosa utama harus diisi')
      return false
    }

    if (formData.blood_pressure_systolic && formData.blood_pressure_diastolic) {
      if (formData.blood_pressure_systolic <= formData.blood_pressure_diastolic) {
        setError('Tekanan darah sistolik harus lebih besar dari diastolik')
        return false
      }
    }

    if (formData.temperature && (formData.temperature < 30 || formData.temperature > 45)) {
      setError('Suhu tubuh tidak valid (30-45°C)')
      return false
    }

    return true
  }

  const handleSaveMedicalRecord = async () => {
    setError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('clinic_medical_records')
        .select('id')
        .eq('visit_id', selectedVisit!.id)
        .single()

      const recordData = {
        visit_id: selectedVisit!.id,
        patient_id: selectedVisit!.patient.id,
        doctor_id: selectedDoctorId,
        blood_pressure_systolic: formData.blood_pressure_systolic,
        blood_pressure_diastolic: formData.blood_pressure_diastolic,
        heart_rate: formData.heart_rate,
        temperature: formData.temperature,
        respiratory_rate: formData.respiratory_rate,
        weight: formData.weight,
        height: formData.height,
        bmi: formData.bmi,
        anamnesis: formData.anamnesis,
        physical_examination: formData.physical_examination,
        diagnosis_primary: formData.diagnosis_primary,
        diagnosis_secondary: formData.diagnosis_secondary || null,
        diagnosis_notes: formData.diagnosis_notes,
        treatment_plan: formData.treatment_plan,
        follow_up_date: formData.follow_up_date || null,
        status: 'completed',
      }

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('clinic_medical_records')
          .update(recordData)
          .eq('id', existingRecord.id)

        if (updateError) throw updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('clinic_medical_records')
          .insert(recordData)

        if (insertError) throw insertError
      }

      // Update visit status to completed
      await supabase
        .from('clinic_visits')
        .update({ status: 'completed' })
        .eq('id', selectedVisit!.id)

      setSuccess(true)
      toast.success('Rekam medis berhasil disimpan')

      // Refresh visits list
      await fetchTodayVisits()

      // Clear selection after a delay
      setTimeout(() => {
        setSelectedVisit(null)
        setSuccess(false)
      }, 2000)

    } catch (err: any) {
      setError('Gagal menyimpan rekam medis: ' + err.message)
      toast.error('Gagal menyimpan rekam medis')
    } finally {
      setLoading(false)
    }
  }

  const getDiseaseName = (diseaseId: string) => {
    const disease = diseases.find(d => d.id === diseaseId)
    return disease ? `${disease.icd10_code} - ${disease.name}` : '-'
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

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Pemeriksaan & Diagnosa</h1>
              <p className="text-sm text-gray-500">Rekam medis pemeriksaan dokter</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Badge variant="secondary" className="gap-2">
                <User className="w-4 h-4" />
                Super Admin
              </Badge>
            )}
            {!isSuperAdmin && currentDoctor && (
              <Badge variant="outline" className="gap-2">
                <User className="w-4 h-4" />
                Dr. {currentDoctor.full_name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {!isSuperAdmin && !currentDoctor && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Anda tidak terdaftar sebagai dokter di sistem. Hubungi administrator untuk mendaftarkan akun Anda.
              </AlertDescription>
            </Alert>
          )}

          {isSuperAdmin && allDoctors.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tidak ada dokter aktif dalam sistem. Tambahkan data dokter terlebih dahulu.
              </AlertDescription>
            </Alert>
          )}

          {(isSuperAdmin || currentDoctor) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Visit List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Antrian Hari Ini
                    </CardTitle>
                    <CardDescription>
                      {todayVisits.length} pasien menunggu
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {loading ? (
                        <p className="text-sm text-gray-500 text-center py-4">Memuat...</p>
                      ) : todayVisits.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Tidak ada antrian
                        </p>
                      ) : (
                        todayVisits.map(visit => (
                          <button
                            key={visit.id}
                            onClick={() => handleSelectVisit(visit)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedVisit?.id === visit.id
                                ? 'bg-emerald-50 border-emerald-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={visit.status === 'in_progress' ? 'default' : 'secondary'}>
                                  #{visit.queue_number}
                                </Badge>
                                <span className="font-medium text-sm">
                                  {visit.patient.full_name}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {visit.chief_complaint}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {visit.visit_time.substring(0, 5)}
                            </p>
                          </button>
                        ))
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={fetchTodayVisits}
                    >
                      Refresh
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Examination Form */}
              <div className="lg:col-span-2">
                {!selectedVisit ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Pilih pasien dari antrian untuk memulai pemeriksaan
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Doctor Selection for SuperAdmin */}
                    {isSuperAdmin && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Pilih Dokter Pemeriksa
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Select
                            value={selectedDoctorId}
                            onValueChange={setSelectedDoctorId}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Pilih dokter yang melakukan pemeriksaan" />
                            </SelectTrigger>
                            <SelectContent>
                              {allDoctors.map(doctor => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  Dr. {doctor.full_name} - {doctor.specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-blue-700 mt-2">
                            Sebagai Super Admin, Anda dapat memilih dokter yang akan tercatat melakukan pemeriksaan
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Patient Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informasi Pasien</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Nama Pasien</Label>
                            <p className="font-medium">{selectedVisit.patient.full_name}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Usia / Gender</Label>
                            <p className="font-medium">
                              {calculateAge(selectedVisit.patient.birth_date)} tahun / {selectedVisit.patient.gender === 'male' ? 'L' : 'P'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Golongan Darah</Label>
                            <p className="font-medium">{selectedVisit.patient.blood_type || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">No. Antrian</Label>
                            <p className="font-medium">#{selectedVisit.queue_number}</p>
                          </div>
                          {selectedVisit.patient.allergies && (
                            <div className="col-span-2">
                              <Label className="text-xs text-gray-500">Alergi</Label>
                              <p className="font-medium text-red-600">{selectedVisit.patient.allergies}</p>
                            </div>
                          )}
                          {selectedVisit.patient.chronic_diseases && (
                            <div className="col-span-2">
                              <Label className="text-xs text-gray-500">Penyakit Kronis</Label>
                              <p className="font-medium text-orange-600">{selectedVisit.patient.chronic_diseases}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <Label className="text-xs text-gray-500">Keluhan Utama</Label>
                          <p className="font-medium text-blue-900">{selectedVisit.chief_complaint}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Examination Form */}
                    <Tabs defaultValue="vital-signs" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="vital-signs">Vital Signs</TabsTrigger>
                        <TabsTrigger value="examination">Pemeriksaan</TabsTrigger>
                        <TabsTrigger value="diagnosis">Diagnosa</TabsTrigger>
                      </TabsList>

                      {/* Vital Signs Tab */}
                      <TabsContent value="vital-signs">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Heart className="w-5 h-5" />
                              Tanda-tanda Vital
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Tekanan Darah Sistolik (mmHg)</Label>
                                <Input
                                  type="number"
                                  placeholder="120"
                                  value={formData.blood_pressure_systolic || ''}
                                  onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                              <div>
                                <Label>Tekanan Darah Diastolik (mmHg)</Label>
                                <Input
                                  type="number"
                                  placeholder="80"
                                  value={formData.blood_pressure_diastolic || ''}
                                  onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                              <div>
                                <Label className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  Denyut Nadi (bpm)
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="80"
                                  value={formData.heart_rate || ''}
                                  onChange={(e) => handleInputChange('heart_rate', e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                              <div>
                                <Label className="flex items-center gap-1">
                                  <Thermometer className="w-4 h-4" />
                                  Suhu Tubuh (°C)
                                </Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="36.5"
                                  value={formData.temperature || ''}
                                  onChange={(e) => handleInputChange('temperature', e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                              <div>
                                <Label>Pernapasan (/menit)</Label>
                                <Input
                                  type="number"
                                  placeholder="20"
                                  value={formData.respiratory_rate || ''}
                                  onChange={(e) => handleInputChange('respiratory_rate', e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                              <div>
                                <Label className="flex items-center gap-1">
                                  <Weight className="w-4 h-4" />
                                  Berat Badan (kg)
                                </Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="70"
                                  value={formData.weight || ''}
                                  onChange={(e) => handleInputChange('weight', e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                              <div>
                                <Label className="flex items-center gap-1">
                                  <Ruler className="w-4 h-4" />
                                  Tinggi Badan (cm)
                                </Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="170"
                                  value={formData.height || ''}
                                  onChange={(e) => handleInputChange('height', e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                              <div>
                                <Label>BMI (Body Mass Index)</Label>
                                <Input
                                  type="text"
                                  value={formData.bmi || ''}
                                  readOnly
                                  className="bg-gray-50"
                                  placeholder="Otomatis"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Examination Tab */}
                      <TabsContent value="examination">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <ClipboardList className="w-5 h-5" />
                              Pemeriksaan Medis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Anamnesis (Subjective)</Label>
                              <Textarea
                                placeholder="Riwayat keluhan, gejala yang dialami pasien..."
                                rows={4}
                                value={formData.anamnesis}
                                onChange={(e) => handleInputChange('anamnesis', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Pemeriksaan Fisik (Objective)</Label>
                              <Textarea
                                placeholder="Hasil pemeriksaan fisik, observasi dokter..."
                                rows={4}
                                value={formData.physical_examination}
                                onChange={(e) => handleInputChange('physical_examination', e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Diagnosis Tab */}
                      <TabsContent value="diagnosis">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileCheck className="w-5 h-5" />
                              Diagnosa & Rencana Perawatan
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-red-600">Diagnosa Utama *</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={formData.diagnosis_primary ? getDiseaseName(formData.diagnosis_primary) : ''}
                                  readOnly
                                  placeholder="Pilih diagnosa utama (ICD-10)"
                                  className="flex-1 cursor-pointer"
                                  onClick={() => handleOpenDiseaseDialog(true)}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleOpenDiseaseDialog(true)}
                                >
                                  <Search className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <Label>Diagnosa Sekunder (Opsional)</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={formData.diagnosis_secondary ? getDiseaseName(formData.diagnosis_secondary) : ''}
                                  readOnly
                                  placeholder="Pilih diagnosa sekunder (ICD-10)"
                                  className="flex-1 cursor-pointer"
                                  onClick={() => handleOpenDiseaseDialog(false)}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleOpenDiseaseDialog(false)}
                                >
                                  <Search className="w-4 h-4" />
                                </Button>
                                {formData.diagnosis_secondary && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleInputChange('diagnosis_secondary', '')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label>Catatan Diagnosa</Label>
                              <Textarea
                                placeholder="Catatan tambahan mengenai diagnosa..."
                                rows={3}
                                value={formData.diagnosis_notes}
                                onChange={(e) => handleInputChange('diagnosis_notes', e.target.value)}
                              />
                            </div>

                            <div>
                              <Label>Rencana Perawatan</Label>
                              <Textarea
                                placeholder="Rencana terapi, edukasi pasien, dll..."
                                rows={3}
                                value={formData.treatment_plan}
                                onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                              />
                            </div>

                            <div>
                              <Label>Tanggal Kontrol (Opsional)</Label>
                              <Input
                                type="date"
                                value={formData.follow_up_date}
                                onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <Card>
                      <CardContent className="pt-6">
                        {error && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {success && (
                          <Alert className="mb-4 bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              Rekam medis berhasil disimpan!
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={handleSaveMedicalRecord}
                            disabled={loading || success}
                            className="flex-1 min-w-[200px]"
                          >
                            {loading ? (
                              <>Menyimpan...</>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Rekam Medis
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setSelectedVisit(null)}
                            disabled={loading}
                          >
                            Batal
                          </Button>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-500 mb-3">Tindakan Lanjutan:</p>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" disabled>
                              <FileText className="w-4 h-4 mr-2" />
                              Buat Surat Sakit
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                              <Pill className="w-4 h-4 mr-2" />
                              Buat Resep
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                              <FileCheck className="w-4 h-4 mr-2" />
                              Buat Rujukan
                            </Button>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            * Fitur ini akan tersedia setelah rekam medis disimpan
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disease Selection Command Dialog */}
      <CommandDialog
        open={showDiseaseDialog}
        onOpenChange={setShowDiseaseDialog}
        title={`Pilih Diagnosa ${selectingPrimaryDiagnosis ? 'Utama' : 'Sekunder'}`}
        description="Cari berdasarkan kode ICD-10 atau nama penyakit"
      >
        <CommandInput placeholder="Ketik untuk mencari penyakit (ICD-10 atau nama)..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>Tidak ditemukan penyakit yang sesuai.</CommandEmpty>

          {/* Common Diseases Group */}
          {commonDiseases.length > 0 && (
            <CommandGroup heading="Penyakit Umum">
              {commonDiseases.map((disease) => (
                <CommandItem
                  key={disease.id}
                  value={`${disease.icd10_code} ${disease.name}`}
                  onSelect={() => handleSelectDisease(disease.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Badge variant="outline" className="font-mono text-xs">
                      {disease.icd10_code}
                    </Badge>
                    <span className="flex-1">{disease.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {disease.category}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* All Diseases Grouped by Category */}
          {Object.entries(diseasesByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categoryDiseases]) => (
              <CommandGroup key={category} heading={category}>
                {categoryDiseases.map((disease) => (
                  <CommandItem
                    key={disease.id}
                    value={`${disease.icd10_code} ${disease.name}`}
                    onSelect={() => handleSelectDisease(disease.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Badge variant="outline" className="font-mono text-xs">
                        {disease.icd10_code}
                      </Badge>
                      <span className="flex-1">{disease.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
