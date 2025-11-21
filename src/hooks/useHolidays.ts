import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type { Database } from '../utils/supabase/types'

type Holiday = Database['public']['Tables']['holidays']['Row']
type HolidayInsert = Database['public']['Tables']['holidays']['Insert']
type HolidayUpdate = Database['public']['Tables']['holidays']['Update']

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHolidays = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('holidays')
        .select('*')
        .order('date', { ascending: true })

      if (fetchError) throw fetchError
      setHolidays(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching holidays:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if there are existing attendance records for a specific date
   * Returns the count and details of existing records
   */
  const checkExistingAttendanceRecords = async (date: string): Promise<{
    hasExisting: boolean
    count: number
    statuses: string[]
  }> => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('date', date)
        .neq('status', 'holiday') // Only check non-holiday records

      if (error) throw error

      if (!data || data.length === 0) {
        return { hasExisting: false, count: 0, statuses: [] }
      }

      // Get unique statuses
      const statuses = [...new Set(data.map(r => r.status))]
      return { hasExisting: true, count: data.length, statuses }
    } catch (err: any) {
      console.error('Error checking existing attendance records:', err)
      return { hasExisting: false, count: 0, statuses: [] }
    }
  }

  /**
   * Generate attendance records untuk semua karyawan aktif pada tanggal libur
   * @param forceOverwrite - if true, will overwrite existing records without checking
   */
  const generateAttendanceRecordsForHoliday = async (
    date: string,
    holidayName: string,
    forceOverwrite: boolean = false
  ): Promise<{ overwrittenCount: number }> => {
    try {
      // Check for existing records first (unless force overwrite)
      if (!forceOverwrite) {
        const existing = await checkExistingAttendanceRecords(date)
        if (existing.hasExisting) {
          // Return info about existing records - let caller handle confirmation
          return { overwrittenCount: existing.count }
        }
      }

      // Fetch all active employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('status', 'active')

      if (empError) throw empError
      if (!employees || employees.length === 0) return { overwrittenCount: 0 }

      // Create attendance records for each employee
      const attendanceRecords = employees.map(emp => ({
        employee_id: emp.id,
        date: date,
        status: 'holiday',
        notes: `Libur: ${holidayName}`,
        check_in: null,
        check_out: null,
        work_hours: null,
        overtime_hours: 0
      }))

      // Insert attendance records using upsert to handle duplicates
      const { error: insertError } = await supabase
        .from('attendance_records')
        .upsert(attendanceRecords, {
          onConflict: 'employee_id,date',
          ignoreDuplicates: false
        })

      if (insertError) {
        console.error('Error creating attendance records for holiday:', insertError)
        throw insertError
      }

      console.log(`Successfully created ${attendanceRecords.length} attendance records for holiday: ${holidayName}`)
      return { overwrittenCount: 0 }
    } catch (err: any) {
      console.error('Error generating attendance records for holiday:', err)
      throw err
    }
  }

  /**
   * Delete attendance records dengan status holiday untuk tanggal tertentu
   */
  const deleteAttendanceRecordsForHoliday = async (date: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('date', date)
        .eq('status', 'holiday')

      if (deleteError) {
        console.error('Error deleting attendance records for holiday:', deleteError)
        throw deleteError
      }

      console.log(`Successfully deleted attendance records for holiday date: ${date}`)
    } catch (err: any) {
      console.error('Error deleting attendance records for holiday:', err)
      throw err
    }
  }

  const addHoliday = async (holiday: HolidayInsert, forceOverwrite: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      // Check for existing attendance records first
      if (holiday.date && !forceOverwrite) {
        const existing = await checkExistingAttendanceRecords(holiday.date)
        if (existing.hasExisting) {
          setLoading(false)
          return {
            data: null,
            error: null,
            needsConfirmation: true,
            existingCount: existing.count,
            existingStatuses: existing.statuses,
            pendingHoliday: holiday
          }
        }
      }

      const { data, error: insertError } = await supabase
        .from('holidays')
        .insert(holiday)
        .select()
        .single()

      if (insertError) throw insertError

      // Auto-generate attendance records untuk semua karyawan aktif
      if (data?.date) {
        await generateAttendanceRecordsForHoliday(data.date, data.name, forceOverwrite)
      }

      setHolidays(prev => [...prev, data])
      return { data, error: null, needsConfirmation: false }
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding holiday:', err)
      return { data: null, error: err.message, needsConfirmation: false }
    } finally {
      setLoading(false)
    }
  }

  const updateHoliday = async (id: string, updates: HolidayUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('holidays')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setHolidays(prev => prev.map(h => h.id === id ? data : h))
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating holiday:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteHoliday = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // Get holiday data before deleting
      const holidayToDelete = holidays.find(h => h.id === id)

      const { error: deleteError } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Auto-delete attendance records untuk tanggal libur ini
      if (holidayToDelete?.date) {
        await deleteAttendanceRecordsForHoliday(holidayToDelete.date)
      }

      setHolidays(prev => prev.filter(h => h.id !== id))
      return { error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting holiday:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  return {
    holidays,
    loading,
    error,
    fetchHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
  }
}
