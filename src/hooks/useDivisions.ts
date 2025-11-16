import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type { Database } from '../utils/supabase/types'

type Division = Database['public']['Tables']['divisions']['Row']
type DivisionInsert = Database['public']['Tables']['divisions']['Insert']
type DivisionUpdate = Database['public']['Tables']['divisions']['Update']

export function useDivisions() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDivisions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all divisions
      const { data: divisionsData, error: fetchError } = await supabase
        .from('divisions')
        .select('*')
        .order('kode_divisi', { ascending: true })

      if (fetchError) throw fetchError

      // Fetch employee counts for all divisions
      const { data: employeeCounts, error: countError } = await supabase
        .from('employees')
        .select('division_id, status')
        .eq('status', 'active')

      if (countError) {
        console.warn('Error fetching employee counts:', countError)
      }

      // Create a map of division_id to employee count
      const employeeCountMap = new Map<string, number>()
      if (employeeCounts) {
        employeeCounts.forEach(emp => {
          const currentCount = employeeCountMap.get(emp.division_id) || 0
          employeeCountMap.set(emp.division_id, currentCount + 1)
        })
      }

      // Merge employee counts with divisions data
      const divisionsWithCounts = (divisionsData || []).map(division => ({
        ...division,
        jumlah_karyawan: employeeCountMap.get(division.id) || 0
      }))

      setDivisions(divisionsWithCounts)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching divisions:', err)
    } finally {
      setLoading(false)
    }
  }

  const addDivision = async (division: DivisionInsert) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('divisions')
        .insert(division)
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh divisions to get accurate employee counts
      await fetchDivisions()
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding division:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateDivision = async (id: string, updates: DivisionUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('divisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh divisions to get accurate employee counts
      await fetchDivisions()
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating division:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteDivision = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('divisions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setDivisions(prev => prev.filter(d => d.id !== id))
      return { error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting division:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDivisions()
  }, [])

  return {
    divisions,
    loading,
    error,
    fetchDivisions,
    addDivision,
    updateDivision,
    deleteDivision,
  }
}
