/**
 * usePatients Hook
 *
 * Custom hook untuk CRUD operations pada Patients
 *
 * Features:
 * - Fetch patients with filters
 * - Advanced search (name, NIK, employee)
 * - Get patient by ID/number
 * - Add new patient
 * - Update patient
 * - Check duplicate patients
 * - Get employee family members for selection
 * - Search family members by name
 *
 * @module usePatients
 */

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type {
  Patient,
  PatientInsert,
  PatientUpdate,
  PatientSearchParams,
  FamilyMember,
} from '../types/clinic-registration'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch patients with optional filters
   */
  const fetchPatients = async (params?: PatientSearchParams) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (params?.patient_type) {
        query = query.eq('patient_type', params.patient_type)
      }

      if (params?.employee_id) {
        query = query.eq('employee_id', params.employee_id)
      }

      if (params?.partner_plantation_id) {
        query = query.eq('partner_plantation_id', params.partner_plantation_id)
      }

      if (params?.is_active !== undefined) {
        query = query.eq('is_active', params.is_active)
      }

      // Pagination
      if (params?.limit) {
        query = query.limit(params.limit)
      }

      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
      }

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setPatients(data || [])
      return { data, error: null, count }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch patients'
      setError(errorMessage)
      console.error('Error fetching patients:', err)
      return { data: null, error: errorMessage, count: 0 }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get patient by ID
   */
  const getPatientById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch patient'
      setError(errorMessage)
      console.error('Error fetching patient:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get patient by patient number
   */
  const getPatientByNumber = async (patientNumber: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_number', patientNumber)
        .single()

      if (fetchError) throw fetchError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch patient'
      setError(errorMessage)
      console.error('Error fetching patient:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Search patients by name or NIK
   */
  const searchPatients = async (query: string, patientType?: string) => {
    try {
      setLoading(true)
      setError(null)

      let supabaseQuery = supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${query}%,nik.ilike.%${query}%,patient_number.ilike.%${query}%`)
        .eq('is_active', true)
        .order('full_name', { ascending: true })
        .limit(20)

      if (patientType) {
        supabaseQuery = supabaseQuery.eq('patient_type', patientType)
      }

      const { data, error: searchError } = await supabaseQuery

      if (searchError) throw searchError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search patients'
      setError(errorMessage)
      console.error('Error searching patients:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add new patient
   */
  const addPatient = async (patient: PatientInsert) => {
    try {
      setLoading(true)
      setError(null)

      // Sanitize data before insert
      // Convert allergies from empty string to null or proper array
      const sanitizedPatient = {
        ...patient,
        allergies: patient.allergies && typeof patient.allergies === 'string'
          ? (patient.allergies.trim() ? [patient.allergies.trim()] : null)
          : (patient.allergies || null),
      }

      const { data, error: insertError } = await supabase
        .from('patients')
        .insert(sanitizedPatient)
        .select()
        .single()

      if (insertError) throw insertError

      // Update local state
      setPatients((prev) => [data, ...prev])

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add patient'
      setError(errorMessage)
      console.error('Error adding patient:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update patient
   */
  const updatePatient = async (id: string, updates: PatientUpdate) => {
    try {
      setLoading(true)
      setError(null)

      // Sanitize data before update
      const sanitizedUpdates = {
        ...updates,
        allergies: updates.allergies !== undefined
          ? (updates.allergies && typeof updates.allergies === 'string'
            ? (updates.allergies.trim() ? [updates.allergies.trim()] : null)
            : (updates.allergies || null))
          : undefined,
      }

      const { data, error: updateError } = await supabase
        .from('patients')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setPatients((prev) =>
        prev.map((patient) => (patient.id === id ? data : patient))
      )

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update patient'
      setError(errorMessage)
      console.error('Error updating patient:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Deactivate patient (soft delete)
   */
  const deactivatePatient = async (id: string) => {
    return updatePatient(id, { is_active: false })
  }

  /**
   * Check for duplicate patient by NIK
   */
  const checkDuplicateByNik = async (nik: string, excludeId?: string) => {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('nik', nik)
        .eq('is_active', true)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error: checkError } = await query

      if (checkError) throw checkError

      return { duplicate: data && data.length > 0 ? data[0] : null, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to check duplicate'
      console.error('Error checking duplicate:', err)
      return { duplicate: null, error: errorMessage }
    }
  }

  /**
   * Get employee family members for patient selection
   * Uses database function get_employee_family_members
   */
  const getEmployeeFamilyMembers = async (employeeId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase
        .rpc('get_employee_family_members', { emp_id: employeeId })

      if (rpcError) throw rpcError

      // Map snake_case from DB to camelCase for TypeScript
      const mappedData: FamilyMember[] = (data || []).map((member: any) => ({
        relation: member.relation,
        nik: member.nik,
        nationalId: member.national_id,
        fullName: member.full_name,
        birthDate: member.birth_date,
        age: member.age,
        gender: member.gender,
        bloodType: member.blood_type,
        bpjsHealthNumber: member.bpjs_health_number,
        phone: member.phone,
        email: member.email,
        address: member.address,
        height: member.height,
        weight: member.weight,
      }))

      return { data: mappedData, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch family members'
      setError(errorMessage)
      console.error('Error fetching family members:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Search family member by name across all employees
   * Uses database function search_family_member_by_name
   */
  const searchFamilyMemberByName = async (name: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase
        .rpc('search_family_member_by_name', { search_name: name })

      if (rpcError) throw rpcError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search family member'
      setError(errorMessage)
      console.error('Error searching family member:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get patient statistics
   */
  const getPatientStats = async () => {
    try {
      const { data, error: statsError } = await supabase
        .from('patients')
        .select('patient_type', { count: 'exact' })

      if (statsError) throw statsError

      // Count by patient type
      const stats = {
        total: 0,
        employee: 0,
        employee_family: 0,
        partner: 0,
        partner_family: 0,
        public: 0,
      }

      if (data) {
        // This will need to be aggregated properly
        // For now, we'll do a simple count query for each type
        const types = ['employee', 'employee_family', 'partner', 'partner_family', 'public']

        for (const type of types) {
          const { count } = await supabase
            .from('patients')
            .select('id', { count: 'exact', head: true })
            .eq('patient_type', type)
            .eq('is_active', true)

          stats[type as keyof typeof stats] = count || 0
          stats.total += count || 0
        }
      }

      return { data: stats, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get statistics'
      console.error('Error getting stats:', err)
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Find or create patient from employee/family
   */
  const findOrCreateFromEmployee = async (
    employeeId: string,
    familyMember: FamilyMember,
    additionalData?: Partial<PatientInsert>
  ) => {
    try {
      setLoading(true)
      setError(null)

      const familyRelation = familyMember.relation

      // First, check if patient already exists by NIK
      if (familyMember.nik) {
        const { data: existingByNik } = await supabase
          .from('patients')
          .select('*')
          .eq('nik', familyMember.nik)
          .eq('employee_id', employeeId)
          .eq('family_relation', familyRelation)
          .single()

        if (existingByNik) {
          return { data: existingByNik, error: null, created: false }
        }
      }

      // Determine patient type
      const patientType = familyRelation === 'self' ? 'employee' : 'employee_family'

      // Build patient data from family member
      const patientData: PatientInsert = {
        patient_type: patientType as any,
        employee_id: employeeId,
        family_relation: familyRelation as any,
        nik: familyMember.nik || undefined,
        full_name: familyMember.fullName,
        birth_date: familyMember.birthDate || additionalData?.birth_date!,
        gender: familyMember.gender as any,
        address: additionalData?.address,
        phone: familyMember.phone || additionalData?.phone,
        email: additionalData?.email,
        blood_type: familyMember.bloodType || additionalData?.blood_type,
        bpjs_health_number: familyMember.bpjsHealthNumber || additionalData?.bpjs_health_number,
        default_payment_method: 'company' as any,
        ...additionalData,
      }

      // Create the patient
      const { data: newPatient, error: createError } = await addPatient(patientData)

      if (createError) throw new Error(createError)

      return { data: newPatient, error: null, created: true }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to find or create patient'
      setError(errorMessage)
      console.error('Error finding/creating patient:', err)
      return { data: null, error: errorMessage, created: false }
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchPatients({ is_active: true, limit: 50 })
  }, [])

  return {
    patients,
    loading,
    error,
    fetchPatients,
    getPatientById,
    getPatientByNumber,
    searchPatients,
    addPatient,
    updatePatient,
    deactivatePatient,
    checkDuplicateByNik,
    getEmployeeFamilyMembers,
    searchFamilyMemberByName,
    getPatientStats,
    findOrCreateFromEmployee,
  }
}
