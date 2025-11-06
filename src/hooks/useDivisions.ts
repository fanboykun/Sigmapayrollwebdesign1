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

      const { data, error: fetchError } = await supabase
        .from('divisions')
        .select('*')
        .order('kode_divisi', { ascending: true })

      if (fetchError) throw fetchError
      setDivisions(data || [])
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

      setDivisions(prev => [...prev, data])
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

      setDivisions(prev => prev.map(d => d.id === id ? data : d))
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
