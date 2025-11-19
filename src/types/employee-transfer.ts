/**
 * Employee Transfer Types
 * Types for employee transfer/mutation functionality
 */

export interface EmployeeTransfer {
  id: string;
  employee_id: string;

  // From
  from_division_id: string | null;
  from_position_id: string | null;
  from_department?: string | null;

  // To
  to_division_id: string | null;
  to_position_id: string | null;
  to_department?: string | null;

  // Transfer details
  transfer_date: string; // ISO date string
  effective_date: string; // ISO date string
  reason?: string | null;
  notes?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';

  // Approval
  requested_by?: string | null;
  approved_by?: string | null;
  approved_date?: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations (populated via join)
  employee?: {
    employee_id: string;
    full_name: string;
    email?: string;
  };
  from_division?: {
    id: string;
    nama_divisi: string;  // Indonesian column name
    kode_divisi: string;  // Indonesian column name
  };
  from_position?: {
    id: string;
    name: string;
    code: string;
  };
  to_division?: {
    id: string;
    nama_divisi: string;  // Indonesian column name
    kode_divisi: string;  // Indonesian column name
  };
  to_position?: {
    id: string;
    name: string;
    code: string;
  };
  requested_by_user?: {
    id: string;
    full_name: string;
  };
  approved_by_user?: {
    id: string;
    full_name: string;
  };
}

export interface EmployeeTransferFormData {
  employee_id: string;
  employee_name?: string;
  from_division_id: string | null;
  from_position_id: string | null;
  to_division_id: string | null;
  to_position_id: string | null;
  transfer_date: Date;
  effective_date: Date;
  reason: string;
  notes?: string;
}

export interface EmployeeTransferCreate {
  employee_id: string;
  from_division_id: string | null;
  from_position_id: string | null;
  to_division_id: string | null;
  to_position_id: string | null;
  transfer_date: string;
  effective_date: string;
  reason?: string;
  notes?: string;
  requested_by: string;
}

export interface EmployeeTransferUpdate {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: string;
  approved_date?: string;
  notes?: string;
}

export type TransferType = 'position' | 'division' | 'both';

export interface EmployeeTransferStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  positionTransfer: number;
  divisionTransfer: number;
  bothTransfer: number;
}