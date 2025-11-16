import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type { Database } from '../utils/supabase/types'

type EstateSubdivision = Database['public']['Tables']['estate_subdivisions']['Row']
type EstateSubdivisionInsert = Database['public']['Tables']['estate_subdivisions']['Insert']
type EstateSubdivisionUpdate = Database['public']['Tables']['estate_subdivisions']['Update']

export function useEstateSubdivisions(estateId?: string) {
  const [subdivisions, setSubdivisions] = useState<EstateSubdivision[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubdivisions = async (filterEstateId?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('estate_subdivisions')
        .select('*')

      // Filter by estate_id if provided
      if (filterEstateId || estateId) {
        query = query.eq('estate_id', filterEstateId || estateId)
      }

      const { data, error: fetchError } = await query.order('kode_subdivisi', { ascending: true })

      if (fetchError) throw fetchError
      setSubdivisions(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching estate subdivisions:', err)
    } finally {
      setLoading(false)
    }
  }

  const addSubdivision = async (subdivision: EstateSubdivisionInsert) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('estate_subdivisions')
        .insert(subdivision)
        .select()
        .single()

      if (insertError) throw insertError

      setSubdivisions(prev => [...prev, data])
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding estate subdivision:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateSubdivision = async (id: string, updates: EstateSubdivisionUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('estate_subdivisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setSubdivisions(prev => prev.map(s => s.id === id ? data : s))
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating estate subdivision:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteSubdivision = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('estate_subdivisions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setSubdivisions(prev => prev.filter(s => s.id !== id))
      return { error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting estate subdivision:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (estateId) {
      fetchSubdivisions(estateId)
    }
  }, [estateId])

  return {
    subdivisions,
    loading,
    error,
    fetchSubdivisions,
    addSubdivision,
    updateSubdivision,
    deleteSubdivision,
  }
}
