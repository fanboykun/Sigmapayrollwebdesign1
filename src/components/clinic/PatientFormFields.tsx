/**
 * PatientFormFields Component
 *
 * Form fields untuk data pasien yang bisa digunakan di berbagai flow.
 * Automatically adapts based on patient type.
 *
 * Features:
 * - Conditional fields based on patient type
 * - Auto-fill from employee/family data
 * - Validation
 * - Blood type selector
 * - Gender selector
 */

import { useEffect } from 'react'
import { Calendar, User, Phone, MapPin, Activity } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import type { PatientInsert, PatientType } from '../../types/clinic-registration'

interface Props {
  formData: Partial<PatientInsert>
  onChange: (field: keyof PatientInsert, value: any) => void
  patientType: PatientType
  readOnlyFields?: (keyof PatientInsert)[]
  showVitalSigns?: boolean
}

const bloodTypes = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
]

export function PatientFormFields({
  formData,
  onChange,
  patientType,
  readOnlyFields = [],
  showVitalSigns = false,
}: Props) {
  // Helper to check if field is read-only
  const isReadOnly = (field: keyof PatientFormData) => readOnlyFields.includes(field)

  // Calculate age from birth date
  useEffect(() => {
    if (formData.birth_date) {
      const today = new Date()
      const birthDate = new Date(formData.birth_date)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age >= 0) {
        onChange('age', age)
      }
    }
  }, [formData.birth_date])

  return (
    <div className="space-y-4">
      {/* === SECTION 1: IDENTITAS === */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Data Identitas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* NIK KTP */}
          <div>
            <Label htmlFor="nik">
              NIK KTP {patientType === 'public' && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="nik"
              value={formData.nik || ''}
              onChange={(e) => onChange('nik', e.target.value)}
              placeholder="Nomor Induk Kependudukan (16 digit)"
              maxLength={16}
              disabled={isReadOnly('nik')}
            />
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="full_name">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => onChange('full_name', e.target.value)}
              placeholder="Nama lengkap pasien"
              disabled={isReadOnly('full_name')}
            />
          </div>

          {/* Birth Date */}
          <div>
            <Label htmlFor="birth_date">
              Tanggal Lahir <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => onChange('birth_date', e.target.value)}
                className="pl-10"
                disabled={isReadOnly('birth_date')}
              />
            </div>
            {formData.age !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Usia: {formData.age} tahun
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">
              Jenis Kelamin <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.gender || ''}
              onValueChange={(value) => onChange('gender', value)}
              disabled={isReadOnly('gender')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* === SECTION 2: KONTAK === */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Data Kontak
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Phone */}
          <div>
            <Label htmlFor="phone">
              Nomor Telepon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="08xxxxxxxxxx"
              disabled={isReadOnly('phone')}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="email@example.com"
              disabled={isReadOnly('email')}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address">
            Alamat <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="address"
              value={formData.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Alamat lengkap"
              className="pl-10 min-h-20"
              disabled={isReadOnly('address')}
            />
          </div>
        </div>
      </div>

      {/* === SECTION 3: DATA KESEHATAN === */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Data Kesehatan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Blood Type */}
          <div>
            <Label htmlFor="blood_type">Golongan Darah</Label>
            <Select
              value={formData.blood_type || ''}
              onValueChange={(value) => onChange('blood_type', value)}
              disabled={isReadOnly('blood_type')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih golongan darah" />
              </SelectTrigger>
              <SelectContent>
                {bloodTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Height */}
          <div>
            <Label htmlFor="height">Tinggi Badan (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height || ''}
              onChange={(e) => onChange('height', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="170"
              min="0"
              max="300"
              step="0.1"
              disabled={isReadOnly('height')}
            />
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weight">Berat Badan (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight || ''}
              onChange={(e) => onChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="65"
              min="0"
              max="500"
              step="0.1"
              disabled={isReadOnly('weight')}
            />
          </div>
        </div>

        {/* BPJS Number */}
        <div>
          <Label htmlFor="bpjs_health_number">Nomor BPJS Kesehatan</Label>
          <Input
            id="bpjs_health_number"
            value={formData.bpjs_health_number || ''}
            onChange={(e) => onChange('bpjs_health_number', e.target.value)}
            placeholder="0001234567890"
            maxLength={13}
            disabled={isReadOnly('bpjs_health_number')}
          />
        </div>

        {/* Allergies */}
        <div>
          <Label htmlFor="allergies">Alergi</Label>
          <Textarea
            id="allergies"
            value={formData.allergies || ''}
            onChange={(e) => onChange('allergies', e.target.value)}
            placeholder="Tulis jika ada alergi obat atau makanan"
            className="min-h-16"
            disabled={isReadOnly('allergies')}
          />
        </div>

        {/* Medical History */}
        <div>
          <Label htmlFor="medical_history">Riwayat Penyakit</Label>
          <Textarea
            id="medical_history"
            value={formData.medical_history || ''}
            onChange={(e) => onChange('medical_history', e.target.value)}
            placeholder="Tulis riwayat penyakit yang pernah diderita"
            className="min-h-16"
            disabled={isReadOnly('medical_history')}
          />
        </div>
      </div>

      {/* === SECTION 4: VITAL SIGNS (Optional) === */}
      {showVitalSigns && (
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tanda Vital (Opsional - bisa diisi saat pendaftaran)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Systolic Blood Pressure */}
            <div>
              <Label htmlFor="systolic_pressure">Tekanan Darah Sistolik</Label>
              <Input
                id="systolic_pressure"
                type="number"
                value={formData.vital_signs?.systolic_pressure || ''}
                onChange={(e) =>
                  onChange('vital_signs', {
                    ...formData.vital_signs,
                    systolic_pressure: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="120"
                min="0"
                max="300"
              />
            </div>

            {/* Diastolic Blood Pressure */}
            <div>
              <Label htmlFor="diastolic_pressure">Tekanan Darah Diastolik</Label>
              <Input
                id="diastolic_pressure"
                type="number"
                value={formData.vital_signs?.diastolic_pressure || ''}
                onChange={(e) =>
                  onChange('vital_signs', {
                    ...formData.vital_signs,
                    diastolic_pressure: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="80"
                min="0"
                max="200"
              />
            </div>

            {/* Heart Rate */}
            <div>
              <Label htmlFor="heart_rate">Detak Jantung (bpm)</Label>
              <Input
                id="heart_rate"
                type="number"
                value={formData.vital_signs?.heart_rate || ''}
                onChange={(e) =>
                  onChange('vital_signs', {
                    ...formData.vital_signs,
                    heart_rate: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="72"
                min="0"
                max="300"
              />
            </div>

            {/* Temperature */}
            <div>
              <Label htmlFor="temperature">Suhu Tubuh (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.vital_signs?.temperature || ''}
                onChange={(e) =>
                  onChange('vital_signs', {
                    ...formData.vital_signs,
                    temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="36.5"
                min="30"
                max="45"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
