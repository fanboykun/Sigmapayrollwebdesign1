import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type { Database } from '../utils/supabase/types'

type Potongan = Database['public']['Tables']['potongan']['Row']
type PotonganInsert = Database['public']['Tables']['potongan']['Insert']
type PotonganUpdate = Database['public']['Tables']['potongan']['Update']

export function usePotongan() {
  const [potongan, setPotongan] = useState<Potongan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPotongan = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('potongan')
        .select('*')
        .order('code', { ascending: true })

      if (fetchError) throw fetchError
      setPotongan(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching potongan:', err)
    } finally {
      setLoading(false)
    }
  }

  const addPotongan = async (newPotongan: PotonganInsert) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('potongan')
        .insert(newPotongan)
        .select()
        .single()

      if (insertError) throw insertError

      setPotongan(prev => [...prev, data])
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding potongan:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updatePotongan = async (id: string, updates: PotonganUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('potongan')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setPotongan(prev => prev.map(p => p.id === id ? data : p))
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating potongan:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const deletePotongan = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('potongan')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setPotongan(prev => prev.filter(p => p.id !== id))
      return { error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting potongan:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPotongan()
  }, [])

  return {
    potongan,
    loading,
    error,
    fetchPotongan,
    addPotongan,
    updatePotongan,
    deletePotongan,
  }
}
