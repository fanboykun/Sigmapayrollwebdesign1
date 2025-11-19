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
   * Fetch all employee transfers with relations
   */
  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('employee_transfers')
        .select(`
          *,
          employee:employee_id(
            employee_id,
            full_name,
            email
          ),
          from_division:from_division_id(
            id,
            nama_divisi,
            kode_divisi
          ),
          from_position:from_position_id(
            id,
            name,
            code
          ),
          to_division:to_division_id(
            id,
            nama_divisi,
            kode_divisi
          ),
          to_position:to_position_id(
            id,
            name,
            code
          ),
          requested_by_user:requested_by(
            id,
            full_name
          ),
          approved_by_user:approved_by(
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTransfers(data || []);
      return { data, error: null };
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

      const { data, error: insertError } = await supabase
        .from('employee_transfers')
        .insert({
          ...transferData,
          status: 'pending'
        })
        .select(`
          *,
          employee:employee_id(
            employee_id,
            full_name,
            email
          ),
          from_division:from_division_id(
            id,
            nama_divisi,
            kode_divisi
          ),
          from_position:from_position_id(
            id,
            name,
            code
          ),
          to_division:to_division_id(
            id,
            nama_divisi,
            kode_divisi
          ),
          to_position:to_position_id(
            id,
            name,
            code
          ),
          requested_by_user:requested_by(
            id,
            full_name
          )
        `)
        .single();

      if (insertError) throw insertError;

      setTransfers(prev => [data, ...prev]);
      return { data, error: null };
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

      const { data, error: updateError } = await supabase
        .from('employee_transfers')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          employee:employee_id(
            employee_id,
            full_name,
            email
          ),
          from_division:from_division_id(
            id,
            nama_divisi,
            kode_divisi
          ),
          from_position:from_position_id(
            id,
            name,
            code
          ),
          to_division:to_division_id(
            id,
            nama_divisi,
            kode_divisi
          ),
          to_position:to_position_id(
            id,
            name,
            code
          ),
          requested_by_user:requested_by(
            id,
            full_name
          ),
          approved_by_user:approved_by(
            id,
            full_name
          )
        `)
        .single();

      if (updateError) throw updateError;

      setTransfers(prev => prev.map(t => t.id === id ? data : t));
      return { data, error: null };
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
   * Approve employee transfer
   */
  const approveTransfer = async (id: string, approvedBy: string) => {
    try {
      setLoading(true);
      setError(null);

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
    }
  };

  /**
   * Reject employee transfer
   */
  const rejectTransfer = async (id: string, approvedBy: string, notes?: string) => {
    try {
      setLoading(true);
      setError(null);

      const updates: EmployeeTransferUpdate = {
        status: 'rejected',
        approved_by: approvedBy,
        approved_date: new Date().toISOString(),
        notes
      };

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