/**
 * useUsers Hook
 *
 * Custom hook for managing user operations with Supabase
 * Handles CRUD operations for users table with role relationships
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export interface UserData {
  id: string;
  employee_id?: string;
  email: string;
  full_name: string;
  role_id: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  updated_at: string;
  role?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  employee_id?: string;
}

export interface UpdateUserInput {
  full_name?: string;
  role_id?: string;
  employee_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  password?: string; // Optional password update
}

export function useUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all users with their role information
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(
            id,
            name,
            code,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new user with Supabase Auth and users table
   */
  const createUser = useCallback(async (userData: CreateUserInput): Promise<UserData | null> => {
    try {
      setError(null);

      // Step 1: Create auth user using admin API (requires service role key)
      // Note: This should ideally be done via a server-side function/API
      // For now, we'll create the user record directly after auth signup

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create auth user');

      // Step 2: Create user profile in users table
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role_id: userData.role_id,
          employee_id: userData.employee_id || null,
          status: 'active'
        })
        .select(`
          *,
          role:roles(
            id,
            name,
            code,
            description
          )
        `)
        .single();

      if (userError) throw userError;

      // Update local state
      setUsers(prev => [newUser, ...prev]);

      toast.success('User berhasil ditambahkan');
      return newUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create user';
      setError(errorMessage);
      console.error('Error creating user:', err);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  /**
   * Update user information
   */
  const updateUser = useCallback(async (
    userId: string,
    updates: UpdateUserInput
  ): Promise<UserData | null> => {
    try {
      setError(null);

      // Update password if provided
      if (updates.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: updates.password }
        );

        if (passwordError) {
          console.error('Error updating password:', passwordError);
          // Don't throw, continue with other updates
        }
      }

      // Prepare update data (exclude password from users table)
      const { password, ...userUpdates } = updates;

      // Update users table
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          ...userUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select(`
          *,
          role:roles(
            id,
            name,
            code,
            description
          )
        `)
        .single();

      if (updateError) throw updateError;

      // Update local state
      setUsers(prev =>
        prev.map(user => (user.id === userId ? updatedUser : user))
      );

      toast.success('User berhasil diupdate');
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update user';
      setError(errorMessage);
      console.error('Error updating user:', err);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  /**
   * Delete user (soft delete by setting status to inactive)
   */
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setError(null);

      // Soft delete: set status to inactive
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status: 'inactive' as const } : user
        )
      );

      toast.success('User berhasil dihapus');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete user';
      setError(errorMessage);
      console.error('Error deleting user:', err);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  /**
   * Toggle user status (active/inactive)
   */
  const toggleUserStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setError(null);

      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      const newStatus = user.status === 'active' ? 'inactive' : 'active';

      const { error: updateError } = await supabase
        .from('users')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );

      toast.success(`User berhasil ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle user status';
      setError(errorMessage);
      console.error('Error toggling user status:', err);
      toast.error(errorMessage);
      return false;
    }
  }, [users]);

  /**
   * Get user statistics
   */
  const getStats = useCallback(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      byRole: users.reduce((acc, user) => {
        const roleCode = user.role?.code || 'unknown';
        acc[roleCode] = (acc[roleCode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [users]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getStats
  };
}
