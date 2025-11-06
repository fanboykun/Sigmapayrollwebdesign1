/**
 * usePartnerPlantations Hook
 *
 * Custom hook untuk CRUD operations pada Partner Plantations (Kebun Sepupu)
 *
 * Features:
 * - Fetch all partner plantations
 * - Fetch active plantations only
 * - Add new plantation
 * - Update plantation
 * - Delete/Deactivate plantation
 * - Search by name/code
 *
 * @module usePartnerPlantations
 */

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type {
  PartnerPlantation,
  PartnerPlantationInsert,
  PartnerPlantationUpdate,
} from '../types/clinic-registration'

export function usePartnerPlantations() {
  const [plantations, setPlantations] = useState<PartnerPlantation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all partner plantations
   */
  const fetchPlantations = async (activeOnly = false) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('partner_plantations')
        .select('*')
        .order('code', { ascending: true })

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setPlantations(data || [])
      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch partner plantations'
      setError(errorMessage)
      console.error('Error fetching partner plantations:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch active plantations only
   */
  const fetchActivePlantations = async () => {
    return fetchPlantations(true)
  }

  /**
   * Get plantation by ID
   */
  const getPlantationById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('partner_plantations')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch plantation'
      setError(errorMessage)
      console.error('Error fetching plantation:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Search plantations by name or code
   */
  const searchPlantations = async (query: string, activeOnly = true) => {
    try {
      setLoading(true)
      setError(null)

      let supabaseQuery = supabase
        .from('partner_plantations')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,short_name.ilike.%${query}%`)
        .order('code', { ascending: true })

      if (activeOnly) {
        supabaseQuery = supabaseQuery.eq('is_active', true)
      }

      const { data, error: searchError } = await supabaseQuery

      if (searchError) throw searchError

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search plantations'
      setError(errorMessage)
      console.error('Error searching plantations:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add new partner plantation
   */
  const addPlantation = async (plantation: PartnerPlantationInsert) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('partner_plantations')
        .insert(plantation)
        .select()
        .single()

      if (insertError) throw insertError

      // Update local state
      setPlantations((prev) => [...prev, data])

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add plantation'
      setError(errorMessage)
      console.error('Error adding plantation:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update partner plantation
   */
  const updatePlantation = async (id: string, updates: PartnerPlantationUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('partner_plantations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setPlantations((prev) =>
        prev.map((plantation) => (plantation.id === id ? data : plantation))
      )

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update plantation'
      setError(errorMessage)
      console.error('Error updating plantation:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Deactivate partner plantation (soft delete)
   */
  const deactivatePlantation = async (id: string) => {
    return updatePlantation(id, { is_active: false })
  }

  /**
   * Activate partner plantation
   */
  const activatePlantation = async (id: string) => {
    return updatePlantation(id, { is_active: true })
  }

  /**
   * Delete partner plantation (hard delete)
   * WARNING: Use with caution!
   */
  const deletePlantation = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('partner_plantations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Update local state
      setPlantations((prev) => prev.filter((plantation) => plantation.id !== id))

      return { error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete plantation'
      setError(errorMessage)
      console.error('Error deleting plantation:', err)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if plantation code is unique
   */
  const isCodeUnique = async (code: string, excludeId?: string) => {
    try {
      let query = supabase
        .from('partner_plantations')
        .select('id')
        .eq('code', code)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error: checkError } = await query

      if (checkError) throw checkError

      return { isUnique: !data || data.length === 0, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to check code uniqueness'
      console.error('Error checking code:', err)
      return { isUnique: false, error: errorMessage }
    }
  }

  /**
   * Get plantations count
   */
  const getPlantationsCount = async (activeOnly = false) => {
    try {
      let query = supabase
        .from('partner_plantations')
        .select('id', { count: 'exact', head: true })

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { count, error: countError } = await query

      if (countError) throw countError

      return { count: count || 0, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get count'
      console.error('Error getting count:', err)
      return { count: 0, error: errorMessage }
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchPlantations()
  }, [])

  return {
    plantations,
    loading,
    error,
    fetchPlantations,
    fetchActivePlantations,
    getPlantationById,
    searchPlantations,
    addPlantation,
    updatePlantation,
    deactivatePlantation,
    activatePlantation,
    deletePlantation,
    isCodeUnique,
    getPlantationsCount,
  }
}
