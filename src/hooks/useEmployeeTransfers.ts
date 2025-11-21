import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type {
  EmployeeTransfer,
  EmployeeTransferCreate,
  EmployeeTransferUpdate,
  EmployeeTransferStats,
  TransferType
} from '../types/employee-transfer';

export function useEmployeeTransfers() {
  const [transfers, setTransfers] = useState<EmployeeTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all employee transfers with relations (manual join approach)
   */
  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch base transfer data
      const { data: transfersData, error: fetchError } = await supabase
        .from('employee_transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!transfersData || transfersData.length === 0) {
        setTransfers([]);
        return { data: [], error: null };
      }

      // Get unique IDs for related data
      const employeeIds = [...new Set(transfersData.map(t => t.employee_id).filter(Boolean))] as string[];
      const divisionIds = [...new Set([
        ...transfersData.map(t => t.from_division_id),
        ...transfersData.map(t => t.to_division_id)
      ].filter(Boolean))] as string[];
      const positionIds = [...new Set([
        ...transfersData.map(t => t.from_position_id),
        ...transfersData.map(t => t.to_position_id)
      ].filter(Boolean))] as string[];
      const userIds = [...new Set([
        ...transfersData.map(t => t.requested_by),
        ...transfersData.map(t => t.approved_by)
      ].filter(Boolean))] as string[];

      // Fetch related data in parallel
      const [employeesRes, divisionsRes, positionsRes, usersRes] = await Promise.all([
        employeeIds.length > 0
          ? supabase.from('employees').select('id, employee_id, full_name, email').in('id', employeeIds)
          : { data: [], error: null },
        divisionIds.length > 0
          ? supabase.from('divisions').select('id, nama_divisi, kode_divisi').in('id', divisionIds)
          : { data: [], error: null },
        positionIds.length > 0
          ? supabase.from('positions').select('id, name, code').in('id', positionIds)
          : { data: [], error: null },
        userIds.length > 0
          ? supabase.from('users').select('id, full_name').in('id', userIds)
          : { data: [], error: null }
      ]);

      // Create lookup maps
      const employeesMap = new Map((employeesRes.data || []).map(e => [e.id, e]));
      const divisionsMap = new Map((divisionsRes.data || []).map(d => [d.id, d]));
      const positionsMap = new Map((positionsRes.data || []).map(p => [p.id, p]));
      const usersMap = new Map((usersRes.data || []).map(u => [u.id, u]));

      // Manually join the data
      const enrichedTransfers = transfersData.map(transfer => ({
        ...transfer,
        employee: employeesMap.get(transfer.employee_id) || null,
        from_division: divisionsMap.get(transfer.from_division_id) || null,
        from_position: positionsMap.get(transfer.from_position_id) || null,
        to_division: divisionsMap.get(transfer.to_division_id) || null,
        to_position: positionsMap.get(transfer.to_position_id) || null,
        requested_by_user: usersMap.get(transfer.requested_by) || null,
        approved_by_user: usersMap.get(transfer.approved_by) || null
      }));

      setTransfers(enrichedTransfers);
      return { data: enrichedTransfers, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch employee transfers';
      setError(errorMessage);
      console.error('Error fetching employee transfers:', err);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new employee transfer
   */
  const createTransfer = async (transferData: EmployeeTransferCreate) => {
    try {
      setLoading(true);
      setError(null);

      // Insert the transfer
      const { data: insertedData, error: insertError } = await supabase
        .from('employee_transfers')
        .insert({
          ...transferData,
          status: 'pending'
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      // Fetch related data
      const [employeeRes, fromDivRes, fromPosRes, toDivRes, toPosRes, userRes] = await Promise.all([
        insertedData.employee_id
          ? supabase.from('employees').select('id, employee_id, full_name, email').eq('id', insertedData.employee_id).single()
          : { data: null, error: null },
        insertedData.from_division_id
          ? supabase.from('divisions').select('id, nama_divisi, kode_divisi').eq('id', insertedData.from_division_id).single()
          : { data: null, error: null },
        insertedData.from_position_id
          ? supabase.from('positions').select('id, name, code').eq('id', insertedData.from_position_id).single()
          : { data: null, error: null },
        insertedData.to_division_id
          ? supabase.from('divisions').select('id, nama_divisi, kode_divisi').eq('id', insertedData.to_division_id).single()
          : { data: null, error: null },
        insertedData.to_position_id
          ? supabase.from('positions').select('id, name, code').eq('id', insertedData.to_position_id).single()
          : { data: null, error: null },
        insertedData.requested_by
          ? supabase.from('users').select('id, full_name').eq('id', insertedData.requested_by).single()
          : { data: null, error: null }
      ]);

      // Enrich the data
      const enrichedData = {
        ...insertedData,
        employee: employeeRes.data || null,
        from_division: fromDivRes.data || null,
        from_position: fromPosRes.data || null,
        to_division: toDivRes.data || null,
        to_position: toPosRes.data || null,
        requested_by_user: userRes.data || null,
        approved_by_user: null
      };

      setTransfers(prev => [enrichedData, ...prev]);
      return { data: enrichedData, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create transfer';
      setError(errorMessage);
      console.error('Error creating transfer:', err);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update employee transfer
   */
  const updateTransfer = async (id: string, updates: EmployeeTransferUpdate) => {
    try {
      setLoading(true);
      setError(null);

      // Update the transfer
      const { data: updatedData, error: updateError } = await supabase
        .from('employee_transfers')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      // Fetch related data
      const [employeeRes, fromDivRes, fromPosRes, toDivRes, toPosRes, reqUserRes, appUserRes] = await Promise.all([
        updatedData.employee_id
          ? supabase.from('employees').select('id, employee_id, full_name, email').eq('id', updatedData.employee_id).single()
          : { data: null, error: null },
        updatedData.from_division_id
          ? supabase.from('divisions').select('id, nama_divisi, kode_divisi').eq('id', updatedData.from_division_id).single()
          : { data: null, error: null },
        updatedData.from_position_id
          ? supabase.from('positions').select('id, name, code').eq('id', updatedData.from_position_id).single()
          : { data: null, error: null },
        updatedData.to_division_id
          ? supabase.from('divisions').select('id, nama_divisi, kode_divisi').eq('id', updatedData.to_division_id).single()
          : { data: null, error: null },
        updatedData.to_position_id
          ? supabase.from('positions').select('id, name, code').eq('id', updatedData.to_position_id).single()
          : { data: null, error: null },
        updatedData.requested_by
          ? supabase.from('users').select('id, full_name').eq('id', updatedData.requested_by).single()
          : { data: null, error: null },
        updatedData.approved_by
          ? supabase.from('users').select('id, full_name').eq('id', updatedData.approved_by).single()
          : { data: null, error: null }
      ]);

      // Enrich the data
      const enrichedData = {
        ...updatedData,
        employee: employeeRes.data || null,
        from_division: fromDivRes.data || null,
        from_position: fromPosRes.data || null,
        to_division: toDivRes.data || null,
        to_position: toPosRes.data || null,
        requested_by_user: reqUserRes.data || null,
        approved_by_user: appUserRes.data || null
      };

      setTransfers(prev => prev.map(t => t.id === id ? enrichedData : t));
      return { data: enrichedData, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update transfer';
      setError(errorMessage);
      console.error('Error updating transfer:', err);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve employee transfer and update employee master data
   */
  const approveTransfer = async (id: string, approvedBy: string) => {
    try {
      setLoading(true);
      setError(null);

      // First get the transfer details to know where to move the employee
      const { data: transfer, error: fetchError } = await supabase
        .from('employee_transfers')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!transfer) throw new Error('Transfer not found');

      // Update employee master data with new division and position
      const { error: updateEmployeeError } = await supabase
        .from('employees')
        .update({
          division_id: transfer.to_division_id,
          position_id: transfer.to_position_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', transfer.employee_id);

      if (updateEmployeeError) throw updateEmployeeError;

      // Update transfer status to approved
      const updates: EmployeeTransferUpdate = {
        status: 'approved',
        approved_by: approvedBy,
        approved_date: new Date().toISOString()
      };

      const result = await updateTransfer(id, updates);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to approve transfer';
      setError(errorMessage);
      console.error('Error approving transfer:', err);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reject employee transfer
   */
  const rejectTransfer = async (id: string, approvedBy: string, rejectionNotes?: string) => {
    try {
      const updates: EmployeeTransferUpdate = {
        status: 'rejected',
        approved_by: approvedBy,
        approved_date: new Date().toISOString()
      };

      // Only include notes if provided
      if (rejectionNotes && rejectionNotes.trim()) {
        updates.notes = rejectionNotes.trim();
      }

      const result = await updateTransfer(id, updates);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reject transfer';
      setError(errorMessage);
      console.error('Error rejecting transfer:', err);
      return { data: null, error: errorMessage };
    }
  };

  /**
   * Complete employee transfer (update employee master data)
   */
  const completeTransfer = async (transferId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get transfer details
      const { data: transfer, error: fetchError } = await supabase
        .from('employee_transfers')
        .select('*')
        .eq('id', transferId)
        .single();

      if (fetchError) throw fetchError;
      if (!transfer) throw new Error('Transfer not found');
      if (transfer.status !== 'approved') {
        throw new Error('Only approved transfers can be completed');
      }

      // Update employee master data
      const { error: updateEmployeeError } = await supabase
        .from('employees')
        .update({
          division_id: transfer.to_division_id,
          position_id: transfer.to_position_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', transfer.employee_id);

      if (updateEmployeeError) throw updateEmployeeError;

      // Mark transfer as completed
      const result = await updateTransfer(transferId, { status: 'completed' });

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete transfer';
      setError(errorMessage);
      console.error('Error completing transfer:', err);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-complete approved transfers based on effective date
   */
  const autoCompleteTransfers = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];

      // Get all approved transfers where effective_date <= today
      const { data: approvedTransfers, error: fetchError } = await supabase
        .from('employee_transfers')
        .select('*')
        .eq('status', 'approved')
        .lte('effective_date', today);

      if (fetchError) throw fetchError;

      if (!approvedTransfers || approvedTransfers.length === 0) {
        return { data: [], error: null };
      }

      // Complete each transfer
      const completedTransfers = [];
      for (const transfer of approvedTransfers) {
        const result = await completeTransfer(transfer.id);
        if (result.data) {
          completedTransfers.push(result.data);
        }
      }

      return { data: completedTransfers, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to auto-complete transfers';
      setError(errorMessage);
      console.error('Error auto-completing transfers:', err);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete employee transfer
   */
  const deleteTransfer = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('employee_transfers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTransfers(prev => prev.filter(t => t.id !== id));
      return { error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete transfer';
      setError(errorMessage);
      console.error('Error deleting transfer:', err);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get transfer type
   */
  const getTransferType = (transfer: EmployeeTransfer): TransferType => {
    const isDivisionChanged = transfer.from_division_id !== transfer.to_division_id;
    const isPositionChanged = transfer.from_position_id !== transfer.to_position_id;

    if (isDivisionChanged && isPositionChanged) return 'both';
    if (isDivisionChanged) return 'division';
    if (isPositionChanged) return 'position';
    return 'position'; // default
  };

  /**
   * Calculate statistics
   */
  const getStats = useCallback((): EmployeeTransferStats => {
    return {
      total: transfers.length,
      pending: transfers.filter(t => t.status === 'pending').length,
      approved: transfers.filter(t => t.status === 'approved').length,
      rejected: transfers.filter(t => t.status === 'rejected').length,
      completed: transfers.filter(t => t.status === 'completed').length,
      positionTransfer: transfers.filter(t => getTransferType(t) === 'position').length,
      divisionTransfer: transfers.filter(t => getTransferType(t) === 'division').length,
      bothTransfer: transfers.filter(t => getTransferType(t) === 'both').length
    };
  }, [transfers]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return {
    transfers,
    loading,
    error,
    fetchTransfers,
    createTransfer,
    updateTransfer,
    approveTransfer,
    rejectTransfer,
    completeTransfer,
    autoCompleteTransfers,
    deleteTransfer,
    getTransferType,
    getStats
  };
}