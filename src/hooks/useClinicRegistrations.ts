/**
 * useClinicRegistrations Hook
 *
 * Custom hook untuk CRUD operations pada Clinic Registrations
 *
 * Features:
 * - Fetch registrations with filters
 * - Get today's queue
 * - Add new registration
 * - Update registration status
 * - Cancel registration
 * - Queue management (call next, update status)
 * - Statistics and analytics
 *
 * @module useClinicRegistrations
 */

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type {
  ClinicRegistration,
  ClinicRegistrationInsert,
  ClinicRegistrationUpdate,
  RegistrationSearchParams,
  TodayQueueItem,
} from '../types/clinic-registration'

export function useClinicRegistrations() {
  const [registrations, setRegistrations] = useState<ClinicRegistration[]>([])
  const [todayQueue, setTodayQueue] = useState<TodayQueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch registrations with filters
   */
  const fetchRegistrations = async (params?: RegistrationSearchParams) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('clinic_registrations')
        .select('*')
        .order('registration_time', { ascending: false })

      // Apply filters
      if (params?.registration_date) {
        query = query.eq('registration_date', params.registration_date)
      }

      if (params?.patient_id) {
        query = query.eq('patient_id', params.patient_id)
      }

      if (params?.status) {
        query = query.eq('status', params.status)
      }

      if (params?.service_type) {
        query = query.eq('service_type', params.service_type)
      }

      if (params?.doctor_id) {
        query = query.eq('doctor_id', params.doctor_id)
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

      setRegistrations(data || [])
      return { data, error: null, count }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch registrations'
      setError(errorMessage)
      console.error('Error fetching registrations:', err)
      return { data: null, error: errorMessage, count: 0 }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch today's queue using view
   */
  const fetchTodayQueue = async (serviceType?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('v_today_queue')
        .select('*')
        .order('queue_number', { ascending: true })

      if (serviceType) {
        query = query.eq('service_type', serviceType)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setTodayQueue(data || [])
      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch today queue'
      setError(errorMessage)
      console.error('Error fetching today queue:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get registration by ID
   */
  const getRegistrationById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('clinic_registrations')
        .select(`
          *,
          patient:patients(*),
          doctor:clinic_doctors(*),
          registered_by_user:users(full_name)
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch registration'
      setError(errorMessage)
      console.error('Error fetching registration:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get registration by number
   */
  const getRegistrationByNumber = async (registrationNumber: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('clinic_registrations')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('registration_number', registrationNumber)
        .single()

      if (fetchError) throw fetchError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch registration'
      setError(errorMessage)
      console.error('Error fetching registration:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add new registration
   */
  const addRegistration = async (registration: ClinicRegistrationInsert) => {
    try {
      setLoading(true)
      setError(null)

      // Check if patient already registered today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingReg } = await supabase
        .from('clinic_registrations')
        .select('*')
        .eq('patient_id', registration.patient_id)
        .eq('registration_date', today)
        .neq('status', 'cancelled')
        .single()

      if (existingReg) {
        return {
          data: null,
          error: 'Pasien sudah terdaftar hari ini',
          existingRegistration: existingReg,
        }
      }

      // Insert new registration
      const { data, error: insertError } = await supabase
        .from('clinic_registrations')
        .insert(registration)
        .select(`
          *,
          patient:patients(*)
        `)
        .single()

      if (insertError) throw insertError

      // Update local state
      setRegistrations((prev) => [data, ...prev])

      // Refresh today's queue
      await fetchTodayQueue()

      return { data, error: null, existingRegistration: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add registration'
      setError(errorMessage)
      console.error('Error adding registration:', err)
      return { data: null, error: errorMessage, existingRegistration: null }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update registration
   */
  const updateRegistration = async (id: string, updates: ClinicRegistrationUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('clinic_registrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? data : reg))
      )

      // Refresh today's queue if status changed
      if (updates.status) {
        await fetchTodayQueue()
      }

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update registration'
      setError(errorMessage)
      console.error('Error updating registration:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update registration status
   */
  const updateStatus = async (id: string, status: string, reason?: string) => {
    const updates: ClinicRegistrationUpdate = { status: status as any }

    if (status === 'cancelled' && reason) {
      updates.cancellation_reason = reason
    }

    return updateRegistration(id, updates)
  }

  /**
   * Cancel registration
   */
  const cancelRegistration = async (id: string, reason: string) => {
    return updateStatus(id, 'cancelled', reason)
  }

  /**
   * Call next patient in queue
   */
  const callNextPatient = async (serviceType: string = 'general') => {
    try {
      setLoading(true)
      setError(null)

      // Get next waiting patient
      const { data: nextPatient, error: fetchError } = await supabase
        .from('clinic_registrations')
        .select('*')
        .eq('registration_date', new Date().toISOString().split('T')[0])
        .eq('service_type', serviceType)
        .eq('status', 'registered')
        .order('queue_number', { ascending: true })
        .limit(1)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No more patients
          return { data: null, error: 'Tidak ada pasien dalam antrian' }
        }
        throw fetchError
      }

      // Update status to waiting
      const { data, error: updateError } = await updateStatus(nextPatient.id, 'waiting')

      if (updateError) throw new Error(updateError)

      // Refresh queue
      await fetchTodayQueue()

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to call next patient'
      setError(errorMessage)
      console.error('Error calling next patient:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Start service for a patient
   */
  const startService = async (id: string) => {
    return updateStatus(id, 'in_progress')
  }

  /**
   * Complete service for a patient
   */
  const completeService = async (id: string) => {
    return updateStatus(id, 'completed')
  }

  /**
   * Get queue statistics for today
   */
  const getTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error: statsError } = await supabase
        .from('clinic_registrations')
        .select('status, service_type', { count: 'exact' })
        .eq('registration_date', today)

      if (statsError) throw statsError

      // Count by status
      const stats = {
        total: 0,
        registered: 0,
        waiting: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        by_service: {} as Record<string, number>,
      }

      if (data) {
        for (const status of ['registered', 'waiting', 'in_progress', 'completed', 'cancelled']) {
          const { count } = await supabase
            .from('clinic_registrations')
            .select('id', { count: 'exact', head: true })
            .eq('registration_date', today)
            .eq('status', status)

          stats[status as keyof typeof stats] = count || 0
          stats.total += count || 0
        }

        // Count by service type
        const serviceTypes = Array.from(new Set(data.map(d => d.service_type)))
        for (const serviceType of serviceTypes) {
          const { count } = await supabase
            .from('clinic_registrations')
            .select('id', { count: 'exact', head: true })
            .eq('registration_date', today)
            .eq('service_type', serviceType)

          stats.by_service[serviceType] = count || 0
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
   * Get average wait time
   */
  const getAverageWaitTime = async (serviceType?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('clinic_registrations')
        .select('called_at, started_at')
        .eq('registration_date', today)
        .not('called_at', 'is', null)
        .not('started_at', 'is', null)

      if (serviceType) {
        query = query.eq('service_type', serviceType)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (!data || data.length === 0) {
        return { averageMinutes: 0, error: null }
      }

      // Calculate average time between called_at and started_at
      const totalMinutes = data.reduce((sum, reg) => {
        const called = new Date(reg.called_at!)
        const started = new Date(reg.started_at!)
        const diff = (started.getTime() - called.getTime()) / 1000 / 60 // minutes
        return sum + diff
      }, 0)

      const averageMinutes = Math.round(totalMinutes / data.length)

      return { averageMinutes, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to calculate average wait time'
      console.error('Error calculating wait time:', err)
      return { averageMinutes: 0, error: errorMessage }
    }
  }

  /**
   * Subscribe to real-time queue updates
   */
  const subscribeToQueueUpdates = (callback: (payload: any) => void) => {
    const today = new Date().toISOString().split('T')[0]

    const subscription = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_registrations',
          filter: `registration_date=eq.${today}`,
        },
        (payload) => {
          console.log('Queue update:', payload)
          callback(payload)
          // Refresh queue
          fetchTodayQueue()
        }
      )
      .subscribe()

    return subscription
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchTodayQueue()
  }, [])

  return {
    registrations,
    todayQueue,
    loading,
    error,
    fetchRegistrations,
    fetchTodayQueue,
    getRegistrationById,
    getRegistrationByNumber,
    addRegistration,
    updateRegistration,
    updateStatus,
    cancelRegistration,
    callNextPatient,
    startService,
    completeService,
    getTodayStats,
    getAverageWaitTime,
    subscribeToQueueUpdates,
  }
}
