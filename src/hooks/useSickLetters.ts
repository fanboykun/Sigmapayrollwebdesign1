/**
 * Custom hook for managing sick letters (Surat Sakit)
 *
 * This hook provides CRUD operations for sick letters and handles
 * the automatic creation of attendance records.
 *
 * Features:
 * - Fetch sick letters with filters and relations
 * - Create new sick letter (auto-generates attendance records)
 * - Update sick letter (diagnosis, treatment, etc.)
 * - Cancel sick letter (marks attendance as cancelled)
 * - Real-time statistics
 *
 * @module hooks/useSickLetters
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import type {
  SickLetter,
  SickLetterWithRelations,
  SickLetterFormData,
  SickLetterFilters,
  SickLetterStats,
  SickLetterInsert,
  SickLetterUpdate,
} from '../types/sick-letter';
import { calculateTotalDays } from '../types/sick-letter';

interface UseSickLettersOptions {
  autoFetch?: boolean;
  filters?: SickLetterFilters;
}

export function useSickLetters(options: UseSickLettersOptions = {}) {
  const { autoFetch = true, filters: initialFilters } = options;

  const [sickLetters, setSickLetters] = useState<SickLetterWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SickLetterFilters>(initialFilters || {});
  const [stats, setStats] = useState<SickLetterStats>({
    total_letters: 0,
    active_letters: 0,
    cancelled_letters: 0,
    total_sick_days: 0,
    affected_employees: 0,
  });

  /**
   * Fetch sick letters with relations
   */
  const fetchSickLetters = useCallback(async (filterOverride?: SickLetterFilters) => {
    try {
      setLoading(true);
      setError(null);

      const activeFilters = filterOverride || filters;

      // Build query with relations
      // Note: Query from clinic_sick_letters (not sick_letters view) to get proper foreign key relationships
      let query = supabase
        .from('clinic_sick_letters')
        .select(`
          *,
          patient:patients (
            patient_number,
            full_name,
            employee_id
          ),
          employee:employees (
            employee_id,
            full_name,
            division_id,
            position_id
          ),
          doctor:clinic_doctors (
            id,
            full_name,
            specialization
          ),
          medical_record:clinic_medical_records (
            id,
            examination_date
          )
        `);

      // Apply filters
      if (activeFilters.status) {
        query = query.eq('status', activeFilters.status);
      }

      if (activeFilters.employee_id) {
        query = query.eq('employee_id', activeFilters.employee_id);
      }

      if (activeFilters.doctor_id) {
        query = query.eq('doctor_id', activeFilters.doctor_id);
      }

      if (activeFilters.start_date) {
        query = query.gte('start_date', activeFilters.start_date);
      }

      if (activeFilters.end_date) {
        query = query.lte('end_date', activeFilters.end_date);
      }

      // Search filter (letter_number or diagnosis)
      if (activeFilters.search) {
        query = query.or(
          `letter_number.ilike.%${activeFilters.search}%,diagnosis.ilike.%${activeFilters.search}%`
        );
      }

      // Order by latest first
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setSickLetters((data as SickLetterWithRelations[]) || []);
      return data as SickLetterWithRelations[];
    } catch (err: any) {
      console.error('Error fetching sick letters:', err);
      const errorMsg = err.message || 'Gagal memuat data surat sakit';
      setError(errorMsg);
      toast.error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      // Get counts by status
      const { count: totalCount } = await supabase
        .from('clinic_sick_letters')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('clinic_sick_letters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: cancelledCount } = await supabase
        .from('clinic_sick_letters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      // Get total sick days and affected employees
      const { data: aggregateData } = await supabase
        .from('clinic_sick_letters')
        .select('total_days, employee_id')
        .eq('status', 'active');

      const totalSickDays = aggregateData?.reduce((sum, item) => sum + item.total_days, 0) || 0;
      const uniqueEmployees = new Set(aggregateData?.map((item) => item.employee_id) || []).size;

      setStats({
        total_letters: totalCount || 0,
        active_letters: activeCount || 0,
        cancelled_letters: cancelledCount || 0,
        total_sick_days: totalSickDays,
        affected_employees: uniqueEmployees,
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  /**
   * Create new sick letter
   * This will create attendance records via application code (not trigger)
   */
  const createSickLetter = useCallback(async (formData: SickLetterFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Calculate total days
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const totalDays = calculateTotalDays(startDate, endDate);

      // Validate dates
      if (endDate < startDate) {
        throw new Error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
      }

      // Use RPC function to create sick letter and attendance in one transaction
      // This bypasses all triggers and prevents recursion issues
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'create_sick_letter_with_attendance',
        {
          p_medical_record_id: formData.medical_record_id,
          p_patient_id: formData.patient_id,
          p_employee_id: formData.employee_id,
          p_doctor_id: formData.doctor_id,
          p_start_date: startDate.toISOString().split('T')[0],
          p_end_date: endDate.toISOString().split('T')[0],
          p_total_days: totalDays,
          p_diagnosis: formData.diagnosis,
          p_rest_recommendation: formData.rest_recommendation,
          // Optional parameters (have defaults in SQL function)
          p_diagnosis_code: formData.diagnosis_code || null,
          p_treatment_summary: formData.treatment_summary || null,
          p_notes: formData.notes || null,
        }
      );

      if (rpcError) throw rpcError;

      const result = rpcData[0];
      console.log(`Sick letter created: ${result.letter_number}`);
      console.log(`Attendance: ${result.attendance_created} created, ${result.attendance_updated} updated`);

      // Fetch the created sick letter with relations for return
      const { data, error: fetchError } = await supabase
        .from('clinic_sick_letters')
        .select(`
          *,
          patient:patients (
            patient_number,
            full_name
          ),
          employee:employees (
            employee_id,
            full_name
          ),
          doctor:clinic_doctors (
            full_name
          )
        `)
        .eq('id', result.sick_letter_id)
        .single();

      if (fetchError) throw fetchError;

      toast.success(`Surat sakit berhasil dibuat dengan nomor: ${result.letter_number}`);

      // Refresh data
      await Promise.all([fetchSickLetters(), fetchStats()]);

      return data as SickLetterWithRelations;
    } catch (err: any) {
      console.error('Error creating sick letter:', err);
      const errorMsg = err.message || 'Gagal membuat surat sakit';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSickLetters, fetchStats]);

  /**
   * Update sick letter
   * Note: Cannot update dates or employee after creation
   */
  const updateSickLetter = useCallback(async (id: string, updates: SickLetterUpdate) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('clinic_sick_letters')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Surat sakit berhasil diperbarui');

      // Refresh data
      await fetchSickLetters();

      return data as SickLetter;
    } catch (err: any) {
      console.error('Error updating sick letter:', err);
      const errorMsg = err.message || 'Gagal memperbarui surat sakit';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSickLetters]);

  /**
   * Update sick letter dates and adjust attendance
   * This will add/remove attendance records based on the new date range
   */
  const updateSickLetterDates = useCallback(async (
    id: string,
    newStartDate: Date | string,
    newEndDate: Date | string,
    diagnosis: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const startDateStr = typeof newStartDate === 'string'
        ? newStartDate
        : newStartDate.toISOString().split('T')[0];
      const endDateStr = typeof newEndDate === 'string'
        ? newEndDate
        : newEndDate.toISOString().split('T')[0];

      // Use RPC function to update dates and adjust attendance
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'update_sick_letter_dates',
        {
          p_sick_letter_id: id,
          p_new_start_date: startDateStr,
          p_new_end_date: endDateStr,
          p_diagnosis: diagnosis
        }
      );

      if (rpcError) throw rpcError;

      const result = rpcData[0];
      console.log(`Sick letter dates updated. Removed: ${result.attendance_removed}, Added: ${result.attendance_added}, Updated: ${result.attendance_updated}`);

      toast.success('Tanggal surat sakit berhasil diperbarui dan presensi disesuaikan');

      // Refresh data
      await fetchSickLetters();

      return result;
    } catch (err: any) {
      console.error('Error updating sick letter dates:', err);
      const errorMsg = err.message || 'Gagal memperbarui tanggal surat sakit';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSickLetters]);

  /**
   * Cancel sick letter
   * This will mark attendance records as cancelled via database trigger
   */
  const cancelSickLetter = useCallback(async (id: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      const updates: SickLetterUpdate = {
        status: 'cancelled',
        notes: reason,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from('clinic_sick_letters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Surat sakit berhasil dibatalkan');

      // Refresh data
      await Promise.all([fetchSickLetters(), fetchStats()]);

      return data as SickLetter;
    } catch (err: any) {
      console.error('Error cancelling sick letter:', err);
      const errorMsg = err.message || 'Gagal membatalkan surat sakit';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSickLetters, fetchStats]);

  /**
   * Delete sick letter (admin only)
   * This will restore attendance records to 'present' status via RPC function
   */
  const deleteSickLetter = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use RPC function to delete sick letter and restore attendance
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'delete_sick_letter_and_restore_attendance',
        { p_sick_letter_id: id }
      );

      if (rpcError) throw rpcError;

      const result = rpcData[0];
      console.log(`Sick letter deleted. Attendance restored: ${result.attendance_restored}`);

      toast.success(`Surat sakit berhasil dihapus. ${result.attendance_restored} presensi dikembalikan ke status Hadir (HK).`);

      // Refresh data
      await Promise.all([fetchSickLetters(), fetchStats()]);
    } catch (err: any) {
      console.error('Error deleting sick letter:', err);
      const errorMsg = err.message || 'Gagal menghapus surat sakit';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSickLetters, fetchStats]);

  /**
   * Get sick letter by ID
   */
  const getSickLetterById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clinic_sick_letters')
        .select(`
          *,
          patient:patients (
            patient_number,
            full_name,
            employee_id
          ),
          employee:employees (
            employee_id,
            full_name,
            division_id,
            position_id
          ),
          doctor:clinic_doctors (
            id,
            full_name,
            specialization
          ),
          medical_record:clinic_medical_records (
            id,
            examination_date
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data as SickLetterWithRelations;
    } catch (err: any) {
      console.error('Error fetching sick letter:', err);
      const errorMsg = err.message || 'Gagal memuat data surat sakit';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get sick letters for a specific employee
   */
  const getSickLettersByEmployee = useCallback(async (employeeId: string) => {
    return fetchSickLetters({ ...filters, employee_id: employeeId });
  }, [filters, fetchSickLetters]);

  /**
   * Get sick letters for a specific doctor
   */
  const getSickLettersByDoctor = useCallback(async (doctorId: string) => {
    return fetchSickLetters({ ...filters, doctor_id: doctorId });
  }, [filters, fetchSickLetters]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchSickLetters();
      fetchStats();
    }
  }, [autoFetch, fetchSickLetters, fetchStats]);

  return {
    // State
    sickLetters,
    loading,
    error,
    filters,
    stats,

    // Actions
    fetchSickLetters,
    fetchStats,
    createSickLetter,
    updateSickLetter,
    updateSickLetterDates,
    cancelSickLetter,
    deleteSickLetter,
    getSickLetterById,
    getSickLettersByEmployee,
    getSickLettersByDoctor,
    setFilters,

    // Helpers
    refetch: fetchSickLetters,
  };
}
