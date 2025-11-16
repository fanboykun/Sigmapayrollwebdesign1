/**
 * ClinicRegistration Component
 *
 * Main component untuk pendaftaran pasien klinik dengan multi-step wizard.
 *
 * Steps:
 * 1. Pilih Tipe Pasien (Employee / Partner / Public)
 * 2. Search & Select Patient/Employee
 * 3. Isi/Review Data Pasien
 * 4. Isi Data Pendaftaran (keluhan, layanan, pembayaran)
 * 5. Konfirmasi & Submit
 * 6. Cetak Slip Antrian
 *
 * Features:
 * - Multi-step wizard with progress indicator
 * - Conditional steps based on patient type
 * - Auto-fill from employee/family data
 * - Duplicate patient detection
 * - Queue number generation
 * - Print slip integration
 */

import { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  ClipboardList,
  FileText,
  CheckCircle,
  Printer,
  ChevronRight,
  ChevronLeft,
  Building2,
  User as UserIcon,
  List,
  Plus,
  Edit,
  Clock,
  Calendar,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Alert, AlertDescription } from '../ui/alert'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { toast } from 'sonner'
import { EmployeeSearchSelector } from './EmployeeSearchSelector'
import { FamilyMemberSelector } from './FamilyMemberSelector'
import { PatientFormFields } from './PatientFormFields'
import { QueueSlip } from './QueueSlip'
import { useEmployees, usePartnerPlantations, usePatients, useClinicRegistrations } from '../../hooks'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import type {
  PatientType,
  PatientInsert,
  RegistrationFormData,
  FamilyMember,
  ClinicRegistration,
  Patient,
} from '../../types/clinic-registration'

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface StepConfig {
  number: Step
  title: string
  icon: any
  description: string
}

const steps: StepConfig[] = [
  { number: 1, title: 'Tipe Pasien', icon: Users, description: 'Pilih kategori pasien' },
  { number: 2, title: 'Cari Pasien', icon: UserCheck, description: 'Cari atau pilih pasien' },
  { number: 3, title: 'Data Pasien', icon: ClipboardList, description: 'Lengkapi data pasien' },
  { number: 4, title: 'Pendaftaran', icon: FileText, description: 'Detail kunjungan' },
  { number: 5, title: 'Konfirmasi', icon: CheckCircle, description: 'Review dan submit' },
  { number: 6, title: 'Selesai', icon: Printer, description: 'Cetak slip antrian' },
]

interface Visit {
  id: string
  visit_number: string
  visit_date: string
  visit_time: string
  queue_number: number
  chief_complaint: string
  visit_type: string
  status: string
  patients: {
    patient_number: string
    full_name: string
    gender: string
    phone: string
  }
}

export function ClinicRegistration() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [patientType, setPatientType] = useState<PatientType>()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>()
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>()
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember>()
  const [selectedPartnerPlantationId, setSelectedPartnerPlantationId] = useState<string>()

  const [patientFormData, setPatientFormData] = useState<Partial<PatientInsert>>({})
  const [registrationFormData, setRegistrationFormData] = useState<RegistrationFormData>({
    service_type: 'consultation',
    payment_method: 'company',
    visit_type: 'new',
  })

  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [createdRegistration, setCreatedRegistration] = useState<ClinicRegistration>()
  const [createdPatient, setCreatedPatient] = useState<Patient>()

  // States for queue list view
  const [viewMode, setViewMode] = useState<'new' | 'list'>('new')
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [editFormData, setEditFormData] = useState<{
    chief_complaint: string
    visit_type: string
    status: string
  }>({
    chief_complaint: '',
    visit_type: '',
    status: '',
  })

  const { findOrCreateFromEmployee, addPatient } = usePatients()
  const { addRegistration } = useClinicRegistrations()
  const { plantations, fetchPlantations } = usePartnerPlantations()

  useEffect(() => {
    fetchPlantations()
  }, [])

  // Fetch visits for queue list view
  const fetchVisits = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          patients(patient_number, full_name, gender, phone)
        `)
        .eq('visit_date', selectedDate)
        .order('queue_number', { ascending: true })

      if (error) throw error
      setVisits(data || [])
    } catch (err: any) {
      toast.error('Gagal memuat data kunjungan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch visits when date changes or view mode changes to list
  useEffect(() => {
    if (viewMode === 'list') {
      fetchVisits()
    }
  }, [viewMode, selectedDate])

  // Pre-fill edit form when visit is selected
  useEffect(() => {
    if (selectedVisit) {
      setEditFormData({
        chief_complaint: selectedVisit.chief_complaint,
        visit_type: selectedVisit.visit_type,
        status: selectedVisit.status,
      })
    }
  }, [selectedVisit])

  // Handle visit update
  const handleUpdateVisit = async () => {
    if (!selectedVisit) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('clinic_visits')
        .update({
          chief_complaint: editFormData.chief_complaint,
          visit_type: editFormData.visit_type,
          status: editFormData.status,
        })
        .eq('id', selectedVisit.id)

      if (error) throw error

      toast.success('Data kunjungan berhasil diperbarui')
      setSelectedVisit(null)
      fetchVisits() // Refresh the list
    } catch (err: any) {
      toast.error('Gagal memperbarui data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    setSelectedVisit(null)
    setEditFormData({
      chief_complaint: '',
      visit_type: '',
      status: '',
    })
  }

  // Reset form
  const resetForm = () => {
    setCurrentStep(1)
    setPatientType(undefined)
    setSelectedEmployeeId(undefined)
    setSelectedEmployeeName(undefined)
    setSelectedFamilyMember(undefined)
    setSelectedPartnerPlantationId(undefined)
    setPatientFormData({})
    setRegistrationFormData({
      service_type: 'consultation',
      payment_method: 'company',
      visit_type: 'new',
    })
    setError(undefined)
    setCreatedRegistration(undefined)
    setCreatedPatient(undefined)
  }

  // Handle patient type selection
  const handlePatientTypeSelect = (type: PatientType) => {
    setPatientType(type)
    setError(undefined)

    // Clear previous patient data when switching types
    setPatientFormData({})
    setSelectedFamilyMember(undefined)
    setSelectedEmployeeId(undefined)
    setSelectedEmployeeName(undefined)
    setSelectedPartnerPlantationId(undefined)

    // Set default payment method based on type
    if (type === 'employee' || type === 'employee_family') {
      setRegistrationFormData((prev) => ({ ...prev, payment_method: 'company' }))
    } else if (type === 'public') {
      setRegistrationFormData((prev) => ({ ...prev, payment_method: 'cash' }))
    }

    // Skip step 2 for public patients
    if (type === 'public') {
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
    }
  }

  // Handle employee/family selection
  const handleEmployeeSelect = (result: any) => {
    setSelectedEmployeeId(result.employeeId)
    setSelectedEmployeeName(result.employeeName)
    setError(undefined)

    if (result.type === 'employee') {
      // Employee selected - create FamilyMember object for 'self'
      const selfMember: FamilyMember = {
        relation: 'self',
        fullName: result.memberName,
        nik: result.employeeNik, // Employee ID (e.g., EMP-AP-0001)
        nationalId: result.memberNik, // NIK KTP (National ID)
        birthDate: result.memberBirthDate || '',
        age: result.memberAge || 0,
        gender: result.memberGender || 'male',
        phone: result.memberPhone,
        bpjsHealthNumber: result.memberBpjsHealthNumber,
        bloodType: result.memberBloodType,
      }
      setSelectedFamilyMember(selfMember)

      // Auto-fill form data for employee with complete information
      setPatientFormData({
        full_name: result.memberName,
        nik: result.memberNik, // NIK KTP (National ID)
        employee_id: selectedEmployeeId, // Employee UUID for database reference
        birth_date: result.memberBirthDate,
        gender: result.memberGender,
        phone: result.memberPhone,
        email: result.memberEmail,
        address: result.memberAddress,
        bpjs_health_number: result.memberBpjsHealthNumber,
        blood_type: result.memberBloodType,
        height: result.memberHeight,
        weight: result.memberWeight,
      })
    } else {
      // Family member selected directly (spouse/child)
      setSelectedFamilyMember({
        relation: result.memberRelation,
        fullName: result.memberName,
        nik: result.memberNik, // NIK for family members (could be NIK KTP or other identifier)
        nationalId: result.memberNik, // NIK KTP (National ID) - same as nik for family members
        birthDate: result.memberBirthDate || '',
        age: result.memberAge,
        gender: result.memberGender,
        phone: result.memberPhone,
        bpjsHealthNumber: result.memberBpjsHealthNumber,
        bloodType: result.memberBloodType,
      })
      // Auto-fill form data for family member with complete information
      setPatientFormData({
        full_name: result.memberName,
        nik: result.memberNik,
        birth_date: result.memberBirthDate,
        gender: result.memberGender,
        phone: result.memberPhone,
        bpjs_health_number: result.memberBpjsHealthNumber,
        blood_type: result.memberBloodType,
      })
    }
  }

  // Handle family member selection
  const handleFamilyMemberSelect = (member: FamilyMember) => {
    setSelectedFamilyMember(member)
    setError(undefined)
    // Auto-fill form data with all available fields
    setPatientFormData({
      full_name: member.fullName,
      nik: member.nationalId || member.nik, // Prioritize national_id (NIK KTP) over nik (employee_id)
      birth_date: member.birthDate,
      gender: member.gender,
      phone: member.phone,
      email: member.email,
      address: member.address,
      blood_type: member.bloodType,
      bpjs_health_number: member.bpjsHealthNumber,
      height: member.height,
      weight: member.weight,
    })
  }

  // Update patient form field
  const handlePatientFieldChange = (field: keyof PatientInsert, value: any) => {
    setPatientFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Update registration form field
  const handleRegistrationFieldChange = (field: keyof RegistrationFormData, value: any) => {
    setRegistrationFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Validate step
  const validateStep = (step: Step): boolean => {
    setError(undefined)

    switch (step) {
      case 1:
        if (!patientType) {
          setError('Pilih tipe pasien terlebih dahulu')
          return false
        }
        return true

      case 2:
        if (patientType === 'public') return true // Skip for public
        if (patientType === 'employee' || patientType === 'employee_family') {
          if (!selectedEmployeeId) {
            setError('Pilih karyawan terlebih dahulu')
            return false
          }
          if (!selectedFamilyMember) {
            setError('Pilih anggota keluarga terlebih dahulu')
            return false
          }
        } else if (patientType === 'partner' || patientType === 'partner_family') {
          if (!selectedPartnerPlantationId) {
            setError('Pilih kebun mitra terlebih dahulu')
            return false
          }
        }
        return true

      case 3:
        if (!patientFormData.full_name) {
          setError('Nama lengkap wajib diisi')
          return false
        }
        if (!patientFormData.birth_date) {
          setError('Tanggal lahir wajib diisi')
          return false
        }
        if (!patientFormData.gender) {
          setError('Jenis kelamin wajib diisi')
          return false
        }
        if (!patientFormData.phone) {
          setError('Nomor telepon wajib diisi')
          return false
        }
        if (!patientFormData.address) {
          setError('Alamat wajib diisi')
          return false
        }
        return true

      case 4:
        if (!registrationFormData.complaint) {
          setError('Keluhan pasien wajib diisi')
          return false
        }
        return true

      default:
        return true
    }
  }

  // Navigate to next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6) as Step)
    }
  }

  // Navigate to previous step
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step)
    setError(undefined)
  }

  // Submit registration
  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    setError(undefined)

    try {
      let patientId: string
      let patient: Patient

      // Step 1: Create or find patient
      if (patientType === 'employee' || patientType === 'employee_family') {
        // Use findOrCreateFromEmployee
        if (!selectedEmployeeId || !selectedFamilyMember) {
          throw new Error('Data karyawan tidak lengkap')
        }

        const { data, error: patientError } = await findOrCreateFromEmployee(
          selectedEmployeeId,
          selectedFamilyMember,
          patientFormData
        )

        if (patientError || !data) {
          throw new Error(patientError || 'Gagal membuat data pasien')
        }

        patientId = data.id
        patient = data
      } else {
        // Create new patient for partner/public
        const newPatient = {
          ...patientFormData,
          patient_type: patientType!,
          employee_id: undefined, // Partner/public patients don't have employee_id
          partner_plantation_id: patientType === 'partner' || patientType === 'partner_family' ? selectedPartnerPlantationId : undefined,
          family_relation: selectedFamilyMember?.relation,
        }

        const { data, error: patientError } = await addPatient(newPatient as any)

        if (patientError || !data) {
          throw new Error(patientError || 'Gagal membuat data pasien')
        }

        patientId = data.id
        patient = data
      }

      // Step 2: Create registration
      // Map form fields to database fields
      const registration = {
        patient_id: patientId,
        visit_type: registrationFormData.visit_type || 'new',
        chief_complaint: registrationFormData.complaint!, // complaint -> chief_complaint
        service_type: registrationFormData.service_type,
        payment_method: registrationFormData.payment_method,
        registration_notes: registrationFormData.notes, // notes -> registration_notes
        registered_by: user?.id, // ID user yang sedang login
      }

      const { data: regData, error: regError } = await addRegistration(registration as any)

      if (regError || !regData) {
        throw new Error(regError || 'Gagal membuat pendaftaran')
      }

      // Step 3: Create clinic_visits record for Medical Examination
      console.log('🔄 Creating visit record for registration:', regData.registration_number)

      try {
        // Generate visit number
        const today = new Date()
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

        // Get last visit number for today
        const { data: lastVisit, error: lastVisitError } = await supabase
          .from('clinic_visits')
          .select('visit_number')
          .like('visit_number', `VISIT-${dateStr}%`)
          .order('visit_number', { ascending: false })
          .limit(1)
          .single()

        // Ignore error if no visits found (PGRST116)
        if (lastVisitError && lastVisitError.code !== 'PGRST116') {
          console.error('Error fetching last visit:', lastVisitError)
        }

        let sequence = 1
        if (lastVisit) {
          const lastSeq = parseInt(lastVisit.visit_number.split('-')[2])
          sequence = lastSeq + 1
        }

        const visitNumber = `VISIT-${dateStr}-${sequence.toString().padStart(4, '0')}`
        console.log('📝 Generated visit number:', visitNumber)

        // Map visit_type: new → general, follow_up → follow_up, emergency → emergency
        let mappedVisitType = 'general'
        if (registrationFormData.visit_type === 'follow_up') {
          mappedVisitType = 'follow_up'
        } else if (registrationFormData.service_type === 'emergency') {
          mappedVisitType = 'emergency'
        } else if (registrationFormData.service_type === 'medical_checkup') {
          mappedVisitType = 'mcu'
        }

        const visit = {
          visit_number: visitNumber,
          patient_id: regData.patient_id, // Use patient_id from registration (already confirmed in DB)
          visit_date: today.toISOString().split('T')[0],
          visit_time: today.toTimeString().split(' ')[0],
          queue_number: regData.queue_number,
          chief_complaint: registrationFormData.complaint!,
          visit_type: mappedVisitType,
          status: 'waiting',
          registered_by: user?.id,
          notes: registrationFormData.notes || null,
        }

        console.log('💾 Inserting visit data:', visit)

        const { data: visitData, error: visitError } = await supabase
          .from('clinic_visits')
          .insert(visit)
          .select()
          .single()

        if (visitError) {
          console.error('❌ Error creating visit:', visitError)
          throw new Error(`Gagal membuat data kunjungan: ${visitError.message}`)
        }

        console.log('✅ Visit created successfully:', visitData)
      } catch (visitErr: any) {
        console.error('❌ Visit creation failed:', visitErr)
        // Show error to user but don't fail the whole registration
        setError(`Pendaftaran berhasil tapi gagal membuat antrian pemeriksaan: ${visitErr.message}`)
      }

      setCreatedRegistration(regData)
      setCreatedPatient(patient)
      setCurrentStep(6)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base">Pilih Kategori Pasien</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Pilih kategori yang sesuai dengan pasien yang akan didaftarkan
              </p>
            </div>

            <RadioGroup value={patientType} onValueChange={(v) => handlePatientTypeSelect(v as PatientType)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Employee/Family */}
                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    patientType === 'employee' || patientType === 'employee_family'
                      ? 'border-primary border-2 bg-primary/5'
                      : ''
                  }`}
                  onClick={() => handlePatientTypeSelect('employee')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="employee" id="employee" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="employee" className="cursor-pointer font-semibold">
                        Karyawan PT. Socfindo
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Karyawan dan keluarga (istri/suami, anak)
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>

                {/* Partner */}
                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    patientType === 'partner' || patientType === 'partner_family'
                      ? 'border-primary border-2 bg-primary/5'
                      : ''
                  }`}
                  onClick={() => handlePatientTypeSelect('partner')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="partner" id="partner" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="partner" className="cursor-pointer font-semibold">
                        Kebun Mitra
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Karyawan kebun mitra (sepupu) dan keluarga
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>

                {/* Public */}
                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    patientType === 'public' ? 'border-primary border-2 bg-primary/5' : ''
                  }`}
                  onClick={() => handlePatientTypeSelect('public')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="public" id="public" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="public" className="cursor-pointer font-semibold">
                        Pasien Umum
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Masyarakat umum di sekitar perkebunan
                      </p>
                    </div>
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
              </div>
            </RadioGroup>
          </div>
        )

      case 2:
        if (patientType === 'employee' || patientType === 'employee_family') {
          if (!selectedEmployeeId) {
            return (
              <EmployeeSearchSelector
                onSelect={handleEmployeeSelect}
                label="Cari Karyawan atau Anggota Keluarga"
                placeholder="Ketik nama atau NIK karyawan/keluarga..."
              />
            )
          } else {
            return (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setSelectedEmployeeId(undefined)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Ganti Karyawan
                </Button>
                <FamilyMemberSelector
                  employeeId={selectedEmployeeId}
                  employeeName={selectedEmployeeName || ''}
                  onSelect={handleFamilyMemberSelect}
                  selectedMemberId={
                    selectedFamilyMember?.nik ||
                    `${selectedEmployeeId}-${selectedFamilyMember?.relation}`
                  }
                />
              </div>
            )
          }
        } else if (patientType === 'partner' || patientType === 'partner_family') {
          return (
            <div className="space-y-4">
              <div>
                <Label>Pilih Kebun Mitra</Label>
                <Select
                  value={selectedPartnerPlantationId}
                  onValueChange={setSelectedPartnerPlantationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kebun mitra" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantations
                      .filter((p) => p.is_active)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )
        }
        return null

      case 3:
        return (
          <PatientFormFields
            formData={patientFormData}
            onChange={handlePatientFieldChange}
            patientType={patientType!}
            selectedMember={selectedFamilyMember}
            readOnlyFields={
              // Only set fields as read-only for employees and their families
              selectedFamilyMember && (patientType === 'employee' || patientType === 'employee_family')
                ? ['full_name', 'nik', 'birth_date', 'gender', 'blood_type', 'bpjs_health_number', 'phone', 'email', 'address', 'height', 'weight']
                : [] // For partner and public patients, allow manual data entry
            }
            showVitalSigns={false}
          />
        )

      case 4:
        return (
          <div className="space-y-4">
            {/* Service Type */}
            <div>
              <Label htmlFor="service_type">
                Jenis Layanan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={registrationFormData.service_type}
                onValueChange={(v) => handleRegistrationFieldChange('service_type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Konsultasi</SelectItem>
                  <SelectItem value="medical_checkup">Medical Check-up</SelectItem>
                  <SelectItem value="emergency">Darurat</SelectItem>
                  <SelectItem value="follow_up">Kontrol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="payment_method">
                Metode Pembayaran <span className="text-destructive">*</span>
              </Label>
              <Select
                value={registrationFormData.payment_method}
                onValueChange={(v) => handleRegistrationFieldChange('payment_method', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Ditanggung Perusahaan</SelectItem>
                  <SelectItem value="bpjs">BPJS Kesehatan</SelectItem>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="insurance">Asuransi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Complaint */}
            <div>
              <Label htmlFor="complaint">
                Keluhan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="complaint"
                value={registrationFormData.complaint || ''}
                onChange={(e) => handleRegistrationFieldChange('complaint', e.target.value)}
                placeholder="Tuliskan keluhan pasien..."
                className="min-h-24"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                value={registrationFormData.notes || ''}
                onChange={(e) => handleRegistrationFieldChange('notes', e.target.value)}
                placeholder="Catatan tambahan (opsional)"
                className="min-h-16"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Pastikan semua data sudah benar sebelum melanjutkan
              </AlertDescription>
            </Alert>

            {/* Patient Summary */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Data Pasien</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Nama:</div>
                <div className="font-medium">{patientFormData.full_name}</div>
                <div className="text-muted-foreground">Tanggal Lahir:</div>
                <div className="font-medium">{patientFormData.birth_date}</div>
                <div className="text-muted-foreground">Jenis Kelamin:</div>
                <div className="font-medium">
                  {patientFormData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                </div>
                <div className="text-muted-foreground">Telepon:</div>
                <div className="font-medium">{patientFormData.phone}</div>
              </div>
            </Card>

            {/* Registration Summary */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Data Kunjungan</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Layanan:</div>
                <div className="font-medium">{registrationFormData.service_type}</div>
                <div className="text-muted-foreground">Pembayaran:</div>
                <div className="font-medium">{registrationFormData.payment_method}</div>
                <div className="text-muted-foreground">Keluhan:</div>
                <div className="font-medium">{registrationFormData.complaint}</div>
              </div>
            </Card>
          </div>
        )

      case 6:
        if (createdRegistration && createdPatient) {
          return (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Pendaftaran berhasil! Nomor antrian telah dibuat.
                </AlertDescription>
              </Alert>

              <QueueSlip
                registration={createdRegistration}
                patient={createdPatient}
                onClose={resetForm}
              />
            </div>
          )
        }
        return null

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Card className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Pendaftaran Pasien Klinik</h1>
              <p className="text-muted-foreground">
                Formulir pendaftaran pasien untuk kunjungan klinik
              </p>
            </div>
          </div>

          {/* Tabs untuk switch antara Daftar Baru dan Lihat Antrian */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'new' | 'list')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Daftar Baru
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Lihat Antrian
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Wizard Mode - Daftar Baru */}
        {viewMode === 'new' && (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              const isAccessible = currentStep >= step.number

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center mt-2 min-h-[40px] flex flex-col justify-start">
                      <div className="text-xs font-medium whitespace-nowrap">{step.title}</div>
                      <div className="text-xs text-muted-foreground hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1 || currentStep === 6}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          {currentStep < 5 && (
            <Button onClick={handleNext}>
              Lanjut
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {currentStep === 5 && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Submit Pendaftaran'}
            </Button>
          )}

          {currentStep === 6 && (
            <Button onClick={resetForm} variant="default">
              Pendaftaran Baru
            </Button>
          )}
        </div>
          </>
        )}

        {/* List View Mode - Lihat Antrian */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Filter Tanggal */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <Label>Tanggal:</Label>
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Button onClick={fetchVisits} variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <div className="ml-auto">
                <p className="text-sm text-muted-foreground">
                  {visits.length} kunjungan ditemukan
                </p>
              </div>
            </div>

            {/* Daftar Kunjungan */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Memuat...</p>
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Tidak ada kunjungan pada tanggal ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((visit) => (
                  <Card
                    key={visit.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedVisit(visit)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-sm">
                            #{visit.queue_number}
                          </Badge>
                          <h3 className="font-semibold">{visit.patients.full_name}</h3>
                          <Badge
                            variant={
                              visit.status === 'completed'
                                ? 'default'
                                : visit.status === 'in_progress'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {visit.status === 'completed'
                              ? 'Selesai'
                              : visit.status === 'in_progress'
                              ? 'Sedang Diperiksa'
                              : 'Menunggu'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">No. Kunjungan:</span> {visit.visit_number}
                          </div>
                          <div>
                            <span className="font-medium">Waktu:</span> {visit.visit_time.substring(0, 5)}
                          </div>
                          <div>
                            <span className="font-medium">Tipe:</span>{' '}
                            {visit.visit_type === 'general' ? 'Umum' : visit.visit_type === 'emergency' ? 'Darurat' : 'MCU'}
                          </div>
                          <div>
                            <span className="font-medium">No. Pasien:</span> {visit.patients.patient_number}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Keluhan:</span> {visit.chief_complaint}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Visit Dialog */}
        <Dialog open={!!selectedVisit} onOpenChange={(open) => !open && handleCloseEditDialog()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Data Kunjungan</DialogTitle>
              <DialogDescription>
                Ubah informasi kunjungan pasien - {selectedVisit?.patients.full_name}
              </DialogDescription>
            </DialogHeader>

            {selectedVisit && (
              <div className="space-y-4 py-4">
                {/* Visit Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">No. Kunjungan</Label>
                    <p className="font-medium">{selectedVisit.visit_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">No. Antrian</Label>
                    <p className="font-medium">#{selectedVisit.queue_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tanggal</Label>
                    <p className="font-medium">{selectedVisit.visit_date}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Waktu</Label>
                    <p className="font-medium">{selectedVisit.visit_time.substring(0, 5)}</p>
                  </div>
                </div>

                {/* Editable Fields */}
                <div>
                  <Label htmlFor="edit_complaint">
                    Keluhan <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="edit_complaint"
                    value={editFormData.chief_complaint}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, chief_complaint: e.target.value })
                    }
                    placeholder="Keluhan pasien..."
                    className="min-h-24 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_visit_type">
                    Tipe Kunjungan <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editFormData.visit_type}
                    onValueChange={(v) => setEditFormData({ ...editFormData, visit_type: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Umum</SelectItem>
                      <SelectItem value="emergency">Darurat</SelectItem>
                      <SelectItem value="follow_up">Kontrol</SelectItem>
                      <SelectItem value="mcu">Medical Check-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit_status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waiting">Menunggu</SelectItem>
                      <SelectItem value="in_progress">Sedang Diperiksa</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditDialog} disabled={loading}>
                Batal
              </Button>
              <Button onClick={handleUpdateVisit} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
