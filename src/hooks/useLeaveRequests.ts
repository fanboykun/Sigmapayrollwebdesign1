import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type { Database } from '../utils/supabase/types'

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']
type LeaveRequestInsert = Database['public']['Tables']['leave_requests']['Insert']
type LeaveRequestUpdate = Database['public']['Tables']['leave_requests']['Update']

export interface LeaveRequestWithEmployee extends LeaveRequest {
  employees?: {
    id: string
    employee_id: string
    full_name: string
    division_id: string | null
    position_id: string | null
    divisions?: {
      nama_divisi: string
    } | null
    positions?: {
      name: string
    } | null
  }
}

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch leave requests with employees only (no nested relations)
      const { data: leaveData, error: fetchError } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employees:employee_id (
            id,
            employee_id,
            full_name,
            division_id,
            position_id
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Manually fetch divisions and positions
      const employeeIds = leaveData?.map(lr => lr.employees?.id).filter(Boolean) || []

      if (employeeIds.length > 0) {
        // Get unique division_ids and position_ids
        const divisionIds = [...new Set(leaveData?.map(lr => lr.employees?.division_id).filter(Boolean))] as string[]
        const positionIds = [...new Set(leaveData?.map(lr => lr.employees?.position_id).filter(Boolean))] as string[]

        // Fetch divisions
        let divisionsMap: Record<string, string> = {}
        if (divisionIds.length > 0) {
          const { data: divisions } = await supabase
            .from('divisions')
            .select('id, nama_divisi')
            .in('id', divisionIds)

          divisionsMap = Object.fromEntries(divisions?.map(d => [d.id, d.nama_divisi]) || [])
        }

        // Fetch positions
        let positionsMap: Record<string, string> = {}
        if (positionIds.length > 0) {
          const { data: positions } = await supabase
            .from('positions')
            .select('id, name')
            .in('id', positionIds)

          positionsMap = Object.fromEntries(positions?.map(p => [p.id, p.name]) || [])
        }

        // Merge the data
        const enrichedData = leaveData?.map(lr => ({
          ...lr,
          employees: lr.employees ? {
            ...lr.employees,
            divisions: lr.employees.division_id ? { nama_divisi: divisionsMap[lr.employees.division_id] } : null,
            positions: lr.employees.position_id ? { name: positionsMap[lr.employees.position_id] } : null,
          } : undefined
        }))

        setLeaveRequests(enrichedData || [])
      } else {
        setLeaveRequests(leaveData || [])
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching leave requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const addLeaveRequest = async (request: LeaveRequestInsert) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('leave_requests')
        .insert(request)
        .select(`
          *,
          employees:employee_id (
            id,
            employee_id,
            full_name,
            division_id,
            position_id
          )
        `)
        .single()

      if (insertError) throw insertError

      // Fetch division and position names
      let enrichedData = data
      if (data?.employees) {
        const [divisionData, positionData] = await Promise.all([
          data.employees.division_id
            ? supabase.from('divisions').select('nama_divisi').eq('id', data.employees.division_id).single()
            : Promise.resolve({ data: null }),
          data.employees.position_id
            ? supabase.from('positions').select('name').eq('id', data.employees.position_id).single()
            : Promise.resolve({ data: null })
        ])

        enrichedData = {
          ...data,
          employees: {
            ...data.employees,
            divisions: divisionData.data ? { nama_divisi: divisionData.data.nama_divisi } : null,
            positions: positionData.data ? { name: positionData.data.name } : null,
          }
        }
      }

      setLeaveRequests(prev => [enrichedData, ...prev])
      return { data: enrichedData, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding leave request:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateLeaveRequest = async (id: string, updates: LeaveRequestUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          employees:employee_id (
            id,
            employee_id,
            full_name,
            division_id,
            position_id
          )
        `)
        .single()

      if (updateError) throw updateError

      // Fetch division and position names
      let enrichedData = data
      if (data?.employees) {
        const [divisionData, positionData] = await Promise.all([
          data.employees.division_id
            ? supabase.from('divisions').select('nama_divisi').eq('id', data.employees.division_id).single()
            : Promise.resolve({ data: null }),
          data.employees.position_id
            ? supabase.from('positions').select('name').eq('id', data.employees.position_id).single()
            : Promise.resolve({ data: null })
        ])

        enrichedData = {
          ...data,
          employees: {
            ...data.employees,
            divisions: divisionData.data ? { nama_divisi: divisionData.data.nama_divisi } : null,
            positions: positionData.data ? { name: positionData.data.name } : null,
          }
        }
      }

      setLeaveRequests(prev => prev.map(l => l.id === id ? enrichedData : l))
      return { data: enrichedData, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating leave request:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const approveLeaveRequest = async (id: string, approvedByUserId?: string) => {
    return updateLeaveRequest(id, {
      status: 'approved',
      approved_by: approvedByUserId || null,
      approved_date: new Date().toISOString(),
    })
  }

  const rejectLeaveRequest = async (id: string, reason: string, approvedByUserId?: string) => {
    return updateLeaveRequest(id, {
      status: 'rejected',
      approved_by: approvedByUserId || null,
      approved_date: new Date().toISOString(),
      rejection_reason: reason,
    })
  }

  const deleteLeaveRequest = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setLeaveRequests(prev => prev.filter(l => l.id !== id))
      return { error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting leave request:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  return {
    leaveRequests,
    loading,
    error,
    fetchLeaveRequests,
    addLeaveRequest,
    updateLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    deleteLeaveRequest,
  }
}
