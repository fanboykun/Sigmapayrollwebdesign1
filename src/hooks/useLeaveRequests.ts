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

export interface LeaveStatistics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  totalDaysUsed: number
}

export interface LeaveFilters {
  search?: string
  division?: string
  status?: string
  leaveType?: string
}

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithEmployee[]>([])
  const [statistics, setStatistics] = useState<LeaveStatistics>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalDaysUsed: 0,
  })
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<LeaveFilters>({})

  const fetchStatistics = async (currentFilters: LeaveFilters = {}) => {
    try {
      // Base query builder
      let totalQuery = supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })

      let pendingQuery = supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      let approvedQuery = supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      let rejectedQuery = supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')

      let daysQuery = supabase
        .from('leave_requests')
        .select('total_days')
        .eq('status', 'approved')
        .eq('leave_type', 'annual')

      // Apply search filter if exists (needs to join with employees)
      // Note: For statistics, we don't filter by search to keep overall counts accurate
      // Only filter by division, status, leaveType if provided

      if (currentFilters.status && currentFilters.status !== 'all') {
        totalQuery = totalQuery.eq('status', currentFilters.status)
      }

      if (currentFilters.leaveType && currentFilters.leaveType !== 'all') {
        totalQuery = totalQuery.eq('leave_type', currentFilters.leaveType)
        pendingQuery = pendingQuery.eq('leave_type', currentFilters.leaveType)
        approvedQuery = approvedQuery.eq('leave_type', currentFilters.leaveType)
        rejectedQuery = rejectedQuery.eq('leave_type', currentFilters.leaveType)
        daysQuery = daysQuery.eq('leave_type', currentFilters.leaveType)
      }

      // Execute queries
      const { count: total } = await totalQuery
      const { count: pending } = await pendingQuery
      const { count: approved } = await approvedQuery
      const { count: rejected } = await rejectedQuery
      const { data: daysData } = await daysQuery

      const totalDays = daysData?.reduce((sum, item) => sum + (item.total_days || 0), 0) || 0

      setStatistics({
        totalRequests: total || 0,
        pendingRequests: pending || 0,
        approvedRequests: approved || 0,
        rejectedRequests: rejected || 0,
        totalDaysUsed: totalDays,
      })
    } catch (err: any) {
      console.error('Error fetching statistics:', err)
    }
  }

  const fetchLeaveRequests = async (page: number = 1, currentFilters: LeaveFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Step 1: If search is active, first find matching employee IDs
      let employeeIdsFilter: string[] | null = null

      if (currentFilters.search && currentFilters.search.trim() !== '') {
        const searchTerm = currentFilters.search.toLowerCase()

        // Query employees table with search
        const { data: matchingEmployees } = await supabase
          .from('employees')
          .select(`
            id,
            employee_id,
            full_name,
            divisions:division_id (
              nama_divisi
            )
          `)
          .or(`full_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`)

        if (matchingEmployees && matchingEmployees.length > 0) {
          employeeIdsFilter = matchingEmployees.map(e => e.id)

          // Also add employees whose division matches the search
          const { data: divisionMatches } = await supabase
            .from('divisions')
            .select('id')
            .ilike('nama_divisi', `%${searchTerm}%`)

          if (divisionMatches && divisionMatches.length > 0) {
            const divisionIds = divisionMatches.map(d => d.id)
            const { data: empsByDivision } = await supabase
              .from('employees')
              .select('id')
              .in('division_id', divisionIds)

            if (empsByDivision) {
              employeeIdsFilter = [...new Set([...employeeIdsFilter, ...empsByDivision.map(e => e.id)])]
            }
          }
        } else {
          // No matching employees found, return empty
          setLeaveRequests([])
          setTotalCount(0)
          return
        }
      }

      // Step 2: Build main query with filters (without nested joins for positions)
      let query = supabase
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
        `, { count: 'exact' })

      // Apply employee filter from search
      if (employeeIdsFilter) {
        query = query.in('employee_id', employeeIdsFilter)
      }

      // Apply other filters BEFORE pagination
      if (currentFilters.status && currentFilters.status !== 'all') {
        query = query.eq('status', currentFilters.status)
      }

      if (currentFilters.leaveType && currentFilters.leaveType !== 'all') {
        query = query.eq('leave_type', currentFilters.leaveType)
      }

      // Apply pagination and ordering
      const { data: leaveData, error: fetchError, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Set total count for pagination
      setTotalCount(count || 0)

      // Step 3: Fetch divisions and positions separately
      const { data: divisionsData } = await supabase
        .from('divisions')
        .select('id, nama_divisi')

      const { data: positionsData } = await supabase
        .from('positions')
        .select('id, name')

      // Create maps for quick lookup
      const divisionsMap = new Map((divisionsData || []).map((d: any) => [d.id, d.nama_divisi]))
      const positionsMap = new Map((positionsData || []).map((p: any) => [p.id, p.name]))

      // Step 4: Enrich leave data with division and position names
      const enrichedLeaveData = (leaveData || []).map((leave: any) => ({
        ...leave,
        employees: leave.employees ? {
          ...leave.employees,
          divisions: leave.employees.division_id ? { nama_divisi: divisionsMap.get(leave.employees.division_id) } : null,
          positions: leave.employees.position_id ? { name: positionsMap.get(leave.employees.position_id) } : null,
        } : null
      }))

      setLeaveRequests(enrichedLeaveData)
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

      // Refresh statistics after adding
      fetchStatistics()

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

      // Refresh statistics after updating
      fetchStatistics()

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
    try {
      setLoading(true)
      setError(null)

      // Get the leave request details first
      const leaveRequest = leaveRequests.find(lr => lr.id === id)
      if (!leaveRequest) {
        throw new Error('Leave request not found')
      }

      // Update the leave request status
      const updateResult = await updateLeaveRequest(id, {
        status: 'approved',
        approved_by: approvedByUserId || null,
        approved_date: new Date().toISOString(),
      })

      if (updateResult.error) {
        throw new Error(updateResult.error)
      }

      // Generate attendance records for the approved leave
      await generateAttendanceRecords(
        leaveRequest.employee_id!,
        leaveRequest.start_date,
        leaveRequest.end_date,
        leaveRequest.leave_type || 'annual'
      )

      return updateResult
    } catch (err: any) {
      setError(err.message)
      console.error('Error approving leave request:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const generateAttendanceRecords = async (
    employeeId: string,
    startDate: string,
    endDate: string,
    leaveType: string
  ) => {
    try {
      // Generate array of dates between start and end date
      const dates: string[] = []
      const currentDate = new Date(startDate)
      const end = new Date(endDate)

      // Fetch holidays to skip them
      const { data: holidays } = await supabase
        .from('holidays')
        .select('date')

      const holidayDates = new Set(holidays?.map(h => h.date) || [])

      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay()
        const dateStr = currentDate.toISOString().split('T')[0]

        // Skip Sundays (0) and holidays
        if (dayOfWeek !== 0 && !holidayDates.has(dateStr)) {
          dates.push(dateStr)
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Create attendance records for each date
      const attendanceRecords = dates.map(date => ({
        employee_id: employeeId,
        date,
        status: 'cuti',
        notes: `Cuti ${leaveType === 'annual' ? 'Tahunan' : leaveType === 'sick' ? 'Sakit' : leaveType === 'maternity' ? 'Hamil/Melahirkan' : leaveType === 'paternity' ? 'Ayah' : leaveType === 'unpaid' ? 'Tanpa Gaji' : 'Lainnya'}`,
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
        console.error('Error creating attendance records:', insertError)
        throw insertError
      }

      console.log(`Successfully created ${attendanceRecords.length} attendance records for leave`)
    } catch (err: any) {
      console.error('Error generating attendance records:', err)
      throw err
    }
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

      // Refresh statistics after deleting
      fetchStatistics()

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
    // Fetch statistics (for cards) and first page of data
    fetchStatistics(filters)
    fetchLeaveRequests(1, filters)
  }, [])

  // Function to change page
  const goToPage = (page: number) => {
    setCurrentPage(page)
    fetchLeaveRequests(page, filters)
  }

  // Function to apply filters (called from component when filters change)
  const applyFilters = (newFilters: LeaveFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to page 1 when filters change
    fetchStatistics(newFilters)
    fetchLeaveRequests(1, newFilters)
  }

  // Function to refresh all data
  const refreshData = () => {
    fetchStatistics(filters)
    fetchLeaveRequests(currentPage, filters)
  }

  return {
    leaveRequests,
    statistics,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    filters,
    fetchLeaveRequests,
    fetchStatistics,
    goToPage,
    applyFilters,
    refreshData,
    addLeaveRequest,
    updateLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    deleteLeaveRequest,
  }
}
