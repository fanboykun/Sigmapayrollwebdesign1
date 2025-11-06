import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import type { Database } from '../utils/supabase/types'

type Employee = Database['public']['Tables']['employees']['Row']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .order('employee_id', { ascending: true })

      if (fetchError) throw fetchError
      setEmployees(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const addEmployee = async (employee: EmployeeInsert) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single()

      if (insertError) throw insertError

      setEmployees(prev => [...prev, data])
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding employee:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateEmployee = async (id: string, updates: EmployeeUpdate) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setEmployees(prev => prev.map(e => e.id === id ? data : e))
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating employee:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setEmployees(prev => prev.filter(e => e.id !== id))
      return { error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting employee:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
