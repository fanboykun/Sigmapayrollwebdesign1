/**
 * ==========================================================================
 * ROLE PERMISSION SERVICE - SUPABASE INTEGRATION
 * ==========================================================================
 *
 * Service layer untuk mengelola role permissions dengan Supabase.
 * Menyediakan CRUD operations untuk role permissions.
 *
 * #RolePermissions #Supabase #ServiceLayer #Authorization
 *
 * @author Sigma Payroll Team
 * @version 1.0.0
 * @since 2025-11-09
 * ==========================================================================
 */

import { supabase } from "../utils/supabase/client";

/**
 * Interface untuk data role dari database
 */
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface untuk permission dari database
 */
export interface RolePermission {
  id: string;
  role_id: string;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface untuk role dengan permissions
 */
export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

/**
 * Interface untuk update permission
 */
export interface PermissionUpdate {
  role_id: string;
  module_name: string;
  can_view?: boolean;
  can_create?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
}

/**
 * ==========================================================================
 * FETCH ALL ROLES
 * ==========================================================================
 * Mengambil semua role dari database
 */
export async function fetchRoles(): Promise<{ data: Role[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("code", { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * ==========================================================================
 * FETCH ROLE PERMISSIONS
 * ==========================================================================
 * Mengambil semua permissions untuk role tertentu
 */
export async function fetchRolePermissions(
  roleId: string
): Promise<{ data: RolePermission[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_id", roleId)
      .order("module_name", { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * ==========================================================================
 * FETCH ALL ROLES WITH PERMISSIONS
 * ==========================================================================
 * Mengambil semua role beserta permissions-nya
 */
export async function fetchRolesWithPermissions(): Promise<{
  data: RoleWithPermissions[] | null;
  error: Error | null;
}> {
  try {
    // Fetch roles
    const { data: roles, error: rolesError } = await fetchRoles();
    if (rolesError || !roles) {
      throw rolesError || new Error("No roles found");
    }

    // Fetch permissions for each role
    const rolesWithPermissions: RoleWithPermissions[] = await Promise.all(
      roles.map(async (role) => {
        const { data: permissions, error: permError } = await fetchRolePermissions(role.id);
        return {
          ...role,
          permissions: permissions || [],
        };
      })
    );

    return { data: rolesWithPermissions, error: null };
  } catch (error) {
    console.error("Error fetching roles with permissions:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * ==========================================================================
 * FETCH PERMISSIONS BY ROLE CODE
 * ==========================================================================
 * Mengambil permissions berdasarkan role code (super_admin, admin, etc)
 * Berguna untuk AuthContext
 */
export async function fetchPermissionsByRoleCode(
  roleCode: string
): Promise<{ data: RolePermission[] | null; error: Error | null }> {
  try {
    // First get the role
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("code", roleCode)
      .single();

    if (roleError) throw roleError;
    if (!role) throw new Error(`Role with code ${roleCode} not found`);

    // Then get permissions
    const { data: permissions, error: permError } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_id", role.id);

    if (permError) throw permError;

    return { data: permissions, error: null };
  } catch (error) {
    console.error("Error fetching permissions by role code:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * ==========================================================================
 * UPDATE PERMISSION
 * ==========================================================================
 * Update single permission untuk role dan module tertentu
 */
export async function updatePermission(
  update: PermissionUpdate
): Promise<{ data: RolePermission | null; error: Error | null }> {
  try {
    const { role_id, module_name, ...permissions } = update;

    // Check if permission exists
    const { data: existing, error: fetchError } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_id", role_id)
      .eq("module_name", module_name)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      throw fetchError;
    }

    let result;

    if (existing) {
      // Update existing permission
      const { data, error } = await supabase
        .from("role_permissions")
        .update({
          ...permissions,
          updated_at: new Date().toISOString(),
        })
        .eq("role_id", role_id)
        .eq("module_name", module_name)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new permission
      const { data, error } = await supabase
        .from("role_permissions")
        .insert({
          role_id,
          module_name,
          can_view: permissions.can_view ?? false,
          can_create: permissions.can_create ?? false,
          can_edit: permissions.can_edit ?? false,
          can_delete: permissions.can_delete ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Error updating permission:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * ==========================================================================
 * BATCH UPDATE PERMISSIONS
 * ==========================================================================
 * Update multiple permissions sekaligus (lebih efisien)
 */
export async function batchUpdatePermissions(
  updates: PermissionUpdate[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Process updates one by one
    // Note: Supabase doesn't support true batch upsert easily,
    // so we do it sequentially
    for (const update of updates) {
      const { error } = await updatePermission(update);
      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error batch updating permissions:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * ==========================================================================
 * DELETE PERMISSION
 * ==========================================================================
 * Hapus permission untuk role dan module tertentu
 */
export async function deletePermission(
  roleId: string,
  moduleName: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("module_name", moduleName);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting permission:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * ==========================================================================
 * SYNC PERMISSIONS WITH DEFAULT
 * ==========================================================================
 * Sync permissions dengan default config
 * Berguna untuk initial setup atau reset
 */
export async function syncPermissionsWithDefault(
  roleId: string,
  permissions: Array<{
    module_name: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }>
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Delete all existing permissions for this role
    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) throw deleteError;

    // Insert new permissions
    const permissionsToInsert = permissions.map((perm) => ({
      role_id: roleId,
      ...perm,
    }));

    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(permissionsToInsert);

    if (insertError) throw insertError;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error syncing permissions:", error);
    return { success: false, error: error as Error };
  }
}
