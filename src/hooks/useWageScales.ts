/**
 * useWageScales Hook
 *
 * Custom hook untuk mengelola data Master Skala Upah.
 *
 * IMPORTANT: Implementasi batch fetching untuk mengatasi Supabase 1000-row limit.
 * Dengan 47 divisi × 141 scales = 6,627 records, kita perlu pagination untuk
 * mengambil semua data.
 *
 * @see SUPABASE_PAGINATION_GUIDE.md - Complete guide untuk pagination
 * @see AttendanceMaster.tsx:278-330 - Similar implementation
 *
 * @returns {Object} - { wageScales, loading, error, fetchWageScales, addWageScale, updateWageScale, deleteWageScale }
 */
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export interface WageScale {
  id: string
  tahun: number
  divisi_id: string
  golongan: 'pegawai' | 'karyawan' | 'pkwt'
  skala: string
  upah_pokok: number
  deskripsi: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface WageScaleInsert {
  tahun: number
  divisi_id: string
  golongan: 'pegawai' | 'karyawan' | 'pkwt'
  skala: string
  upah_pokok: number
  deskripsi: string
  is_active: boolean
}

export interface WageScaleUpdate {
  tahun?: number
  divisi_id?: string
  golongan?: 'pegawai' | 'karyawan' | 'pkwt'
  skala?: string
  upah_pokok?: number
  deskripsi?: string
  is_active?: boolean
}

export function useWageScales() {
  const [wageScales, setWageScales] = useState<WageScale[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWageScales = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch data in batches due to Supabase 1000-row limit per request
      let allData: WageScale[] = []
      let currentPage = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const from = currentPage * pageSize
        const to = from + pageSize - 1

        const { data: batchData, error: batchError, count } = await supabase
          .from('master_upah')
          .select('*', { count: 'exact' })
          .order('tahun', { ascending: false })
          .order('divisi_id', { ascending: true })
          .order('golongan', { ascending: true })
          .order('skala', { ascending: true })
          .range(from, to)

        if (batchError) throw batchError

        if (batchData && batchData.length > 0) {
          allData = [...allData, ...batchData]
        }

        hasMore = batchData && batchData.length === pageSize
        currentPage++

        // Safety break - max 50 batches (50,000 records)
        if (currentPage >= 50) {
          console.warn('Reached maximum batch limit (50 batches = 50,000 records)')
          break
        }
      }

      console.log(`Fetched ${allData.length} wage scales in ${currentPage} batch(es)`)
      setWageScales(allData)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching wage scales:', err)
    } finally {
      setLoading(false)
    }
  }

  const addWageScale = async (wageScale: WageScaleInsert) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('master_upah')
        .insert(wageScale)
        .select()
        .single()

      if (insertError) throw insertError

      await fetchWageScales()
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding wage scale:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateWageScale = async (id: string, updates: WageScaleUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('master_upah')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchWageScales()
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating wage scale:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteWageScale = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('master_upah')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setWageScales(prev => prev.filter(w => w.id !== id))
      return { error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting wage scale:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWageScales()
  }, [])

  return {
    wageScales,
    loading,
    error,
    fetchWageScales,
    addWageScale,
    updateWageScale,
    deleteWageScale,
  }
}
