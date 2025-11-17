/**
 * useRoles Hook
 *
 * Custom hook for managing roles data from Supabase
 * Provides read-only access to system roles
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all roles
   */
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      setRoles(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch roles';
      setError(errorMessage);
      console.error('Error fetching roles:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get role by code
   */
  const getRoleByCode = useCallback((code: string): Role | undefined => {
    return roles.find(role => role.code === code);
  }, [roles]);

  /**
   * Get role by ID
   */
  const getRoleById = useCallback((id: string): Role | undefined => {
    return roles.find(role => role.id === id);
  }, [roles]);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    getRoleByCode,
    getRoleById
  };
}
