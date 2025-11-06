/**
 * TypeScript Types for Clinic Registration Module
 *
 * Generated from Supabase database schema
 * Date: 2025-11-06
 */

// ============================================================================
// ENUMS
// ============================================================================

export type PatientType =
  | 'employee'          // Karyawan PT. Socfindo
  | 'employee_family'   // Keluarga karyawan PT. Socfindo
  | 'partner'           // Karyawan kebun sepupu
  | 'partner_family'    // Keluarga karyawan kebun sepupu
  | 'public';           // Pasien umum

export type FamilyRelation =
  | 'self'     // Diri sendiri (karyawan)
  | 'spouse'   // Istri/Suami
  | 'child'    // Anak
  | 'parent'   // Orang tua
  | 'sibling'; // Saudara kandung

export type PaymentMethod =
  | 'company'    // Ditanggung perusahaan
  | 'bpjs'       // BPJS Kesehatan
  | 'cash'       // Tunai/Pribadi
  | 'insurance'; // Asuransi lain

export type VisitType =
  | 'new'        // Kunjungan baru
  | 'follow_up'  // Kunjungan kontrol
  | 'emergency'; // Kunjungan darurat

export type RegistrationStatus =
  | 'registered'  // Baru daftar, belum dipanggil
  | 'waiting'     // Menunggu giliran
  | 'in_progress' // Sedang dilayani
  | 'completed'   // Selesai dilayani
  | 'cancelled'   // Dibatalkan
  | 'no_show';    // Tidak datang

export type Gender = 'male' | 'female';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

// ============================================================================
// PARTNER PLANTATIONS
// ============================================================================

export interface PartnerPlantation {
  id: string;
  code: string; // KS-001, KS-002, etc.
  name: string;
  short_name?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  cooperation_start_date: string; // ISO date
  cooperation_end_date?: string; // ISO date
  cooperation_type: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PartnerPlantationInsert {
  code: string;
  name: string;
  short_name?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  cooperation_start_date: string;
  cooperation_end_date?: string;
  cooperation_type?: string;
  is_active?: boolean;
  notes?: string;
}

export interface PartnerPlantationUpdate extends Partial<PartnerPlantationInsert> {
  updated_by?: string;
}

// ============================================================================
// FAMILY DATA (JSONB in employees table)
// ============================================================================

export interface SpouseData {
  nik?: string;
  fullName: string;
  birthDate: string; // ISO date
  gender: Gender;
  bloodType?: BloodType;
  bpjsHealthNumber?: string;
  phone?: string;
}

export interface ChildData {
  nik?: string;
  fullName: string;
  birthDate: string; // ISO date
  gender: Gender;
  bloodType?: BloodType;
  bpjsHealthNumber?: string;
}

export interface FamilyData {
  spouse?: SpouseData;
  children?: ChildData[];
}

export interface FamilyMember {
  relation: FamilyRelation;
  nik?: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: Gender;
  bloodType?: BloodType;
  bpjsHealthNumber?: string;
  phone?: string;
}

// ============================================================================
// PATIENTS
// ============================================================================

export interface Patient {
  id: string;
  patient_number: string; // PAT-2025-00001
  patient_type: PatientType;

  // Identity
  nik?: string;
  full_name: string;
  birth_date: string; // ISO date
  age?: number;
  gender: Gender;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  email?: string;

  // Employee relation
  employee_id?: string;
  family_relation?: FamilyRelation;

  // Partner plantation relation
  partner_plantation_id?: string;
  partner_employee_nik?: string;
  partner_employee_name?: string;

  // Health data
  blood_type?: BloodType;
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  bpjs_health_number?: string;
  allergies?: string[];

  // Occupation (for public patients)
  occupation?: string;

  // Payment
  default_payment_method: PaymentMethod;

  // Status
  is_active: boolean;
  notes?: string;

  // Metadata
  registered_by?: string;
  registered_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PatientInsert {
  patient_type: PatientType;
  nik?: string;
  full_name: string;
  birth_date: string;
  gender: Gender;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  employee_id?: string;
  family_relation?: FamilyRelation;
  partner_plantation_id?: string;
  partner_employee_nik?: string;
  partner_employee_name?: string;
  blood_type?: BloodType;
  height?: number;
  weight?: number;
  bpjs_health_number?: string;
  allergies?: string[];
  occupation?: string;
  default_payment_method?: PaymentMethod;
  notes?: string;
  registered_by?: string;
}

export interface PatientUpdate extends Partial<PatientInsert> {
  updated_by?: string;
}

// ============================================================================
// VITAL SIGNS
// ============================================================================

export interface VitalSigns {
  bloodPressure?: string; // "120/80"
  temperature?: number; // Celsius
  heartRate?: number; // bpm
  respiratoryRate?: number; // per minute
  oxygenSaturation?: number; // %
  height?: number; // cm
  weight?: number; // kg
}

// ============================================================================
// CLINIC REGISTRATIONS
// ============================================================================

export interface ClinicRegistration {
  id: string;
  registration_number: string; // REG-20251106-0001
  registration_date: string; // ISO date
  registration_time: string; // ISO datetime

  // Patient
  patient_id: string;

  // Visit info
  visit_type: VisitType;
  chief_complaint: string;
  vital_signs?: VitalSigns;

  // Queue
  queue_number: number;
  queue_display?: string; // UMUM-023
  estimated_wait_time?: number; // minutes

  // Service
  service_type: string;
  doctor_id?: string;
  room_id?: string;

  // Status
  status: RegistrationStatus;
  called_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;

  // Payment
  payment_method: PaymentMethod;
  is_paid: boolean;
  payment_amount: number;
  payment_date?: string;

  // Notes
  registration_notes?: string;
  internal_notes?: string;

  // Metadata
  registered_by: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface ClinicRegistrationInsert {
  patient_id: string;
  visit_type: VisitType;
  chief_complaint: string;
  vital_signs?: VitalSigns;
  service_type?: string;
  doctor_id?: string;
  payment_method: PaymentMethod;
  registration_notes?: string;
  internal_notes?: string;
  registered_by: string;
}

export interface ClinicRegistrationUpdate extends Partial<ClinicRegistrationInsert> {
  status?: RegistrationStatus;
  cancellation_reason?: string;
  is_paid?: boolean;
  payment_amount?: number;
  payment_date?: string;
  updated_by?: string;
}

// ============================================================================
// VIEW TYPES
// ============================================================================

export interface TodayQueueItem {
  id: string;
  registration_number: string;
  queue_number: number;
  queue_display: string;
  registration_time: string;
  service_type: string;
  status: RegistrationStatus;
  estimated_wait_time?: number;

  // Patient info
  patient_number: string;
  patient_name: string;
  patient_type: PatientType;
  age?: number;
  gender: Gender;

  // Doctor info
  doctor_name?: string;

  // Registered by
  registered_by_name: string;

  // Timestamps
  called_at?: string;
  started_at?: string;
  completed_at?: string;
}

export interface EmployeeFamilyOverview {
  employee_id: string;
  nik: string;
  employee_name: string;
  division?: string;
  position?: string;
  marital_status?: MaritalStatus;
  employee_blood_type?: BloodType;
  employee_bpjs?: string;

  // Spouse
  spouse_name?: string;
  spouse_birth_date?: string;
  spouse_age?: number;
  spouse_blood_type?: BloodType;
  spouse_bpjs?: string;

  // Children
  children_count: number;
  total_family_members: number;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface PatientSearchParams {
  query?: string; // Search by name or NIK
  patient_type?: PatientType;
  employee_id?: string;
  partner_plantation_id?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface RegistrationSearchParams {
  registration_date?: string;
  patient_id?: string;
  status?: RegistrationStatus;
  service_type?: string;
  doctor_id?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface PatientFormData {
  // Step 1: Patient Category
  category: 'employee' | 'partner' | 'public';

  // Step 2: Employee Search (for employee/employee_family)
  employeeId?: string;
  familyMemberId?: string; // 'self', 'spouse', or child index

  // Step 3: Partner Plantation (for partner/partner_family)
  partnerPlantationId?: string;
  partnerEmployeeNik?: string;
  partnerEmployeeName?: string;
  isPartnerFamily?: boolean;

  // Step 4: Patient Data
  patientData: PatientInsert;

  // Step 5: Visit Data
  visitData: Omit<ClinicRegistrationInsert, 'patient_id' | 'registered_by'>;
}

export interface RegistrationFormData {
  service_type?: string;
  payment_method?: string;
  visit_type?: string;
  complaint?: string;
  notes?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
