/**
 * Type definitions for Sick Letters (Surat Sakit)
 *
 * Sick letters are issued by doctors to provide medical certification
 * for employee sick leave. They automatically generate attendance records
 * with 'sick' status that cannot be manually edited or deleted.
 *
 * @module types/sick-letter
 */

/**
 * Status of sick letter
 */
export type SickLetterStatus = 'active' | 'cancelled';

/**
 * Main SickLetter interface
 * Represents a doctor's sick note/certificate
 */
export interface SickLetter {
  id: string;
  letter_number: string; // Auto-generated: SKL-YYYY-MM-NNNN
  medical_record_id: string;
  patient_id: string;
  employee_id: string;
  doctor_id: string;

  // Sick leave period
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  total_days: number;

  // Medical information
  diagnosis: string;
  diagnosis_code?: string; // ICD-10 code (optional)
  treatment_summary?: string;
  rest_recommendation: string;

  // Status
  status: SickLetterStatus;
  is_attendance_created: boolean;

  // Metadata
  issued_date: string; // ISO datetime string
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * SickLetter with related data (for display)
 */
export interface SickLetterWithRelations extends SickLetter {
  patient?: {
    patient_number: string;
    full_name: string;
    employee_id?: string;
  };
  employee?: {
    employee_id: string;
    full_name: string;
    division_id?: string;
    position_id?: string;
  };
  doctor?: {
    id: string;
    full_name: string;
    specialization?: string;
  };
  medical_record?: {
    id: string;
    examination_date: string;
    diagnosis_primary: string;
  };
}

/**
 * Form data for creating/editing sick letter
 */
export interface SickLetterFormData {
  medical_record_id: string;
  patient_id: string;
  employee_id: string;
  doctor_id: string;
  start_date: Date | string;
  end_date: Date | string;
  total_days: number;
  diagnosis: string;
  diagnosis_code?: string;
  treatment_summary?: string;
  rest_recommendation: string;
  notes?: string;
}

/**
 * Filters for querying sick letters
 */
export interface SickLetterFilters {
  status?: SickLetterStatus;
  employee_id?: string;
  doctor_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string; // Search by letter_number, diagnosis, or patient name
}

/**
 * Summary statistics for sick letters
 */
export interface SickLetterStats {
  total_letters: number;
  active_letters: number;
  cancelled_letters: number;
  total_sick_days: number;
  affected_employees: number;
}

/**
 * Database insert payload (for Supabase)
 */
export interface SickLetterInsert {
  letter_number?: string; // Auto-generated, optional on insert
  medical_record_id: string;
  patient_id: string;
  employee_id: string;
  doctor_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  diagnosis: string;
  diagnosis_code?: string;
  treatment_summary?: string;
  rest_recommendation: string;
  status?: SickLetterStatus;
  notes?: string;
  created_by?: string;
}

/**
 * Database update payload (for Supabase)
 */
export interface SickLetterUpdate {
  diagnosis?: string;
  diagnosis_code?: string;
  treatment_summary?: string;
  rest_recommendation?: string;
  status?: SickLetterStatus;
  notes?: string;
  updated_at?: string;
}

/**
 * Validation result for sick letter form
 */
export interface SickLetterValidation {
  isValid: boolean;
  errors: {
    medical_record_id?: string;
    patient_id?: string;
    employee_id?: string;
    doctor_id?: string;
    start_date?: string;
    end_date?: string;
    total_days?: string;
    diagnosis?: string;
    rest_recommendation?: string;
  };
}

/**
 * Helper type for date range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Type guard to check if a sick letter is active
 */
export function isActiveSickLetter(letter: SickLetter): boolean {
  return letter.status === 'active';
}

/**
 * Type guard to check if a sick letter is cancelled
 */
export function isCancelledSickLetter(letter: SickLetter): boolean {
  return letter.status === 'cancelled';
}

/**
 * Calculate total days between two dates (inclusive)
 */
export function calculateTotalDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 because we include both start and end date
}

/**
 * Validate date range for sick letter
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return endDate >= startDate;
}

/**
 * Format letter number for display
 */
export function formatLetterNumber(letterNumber: string): string {
  return letterNumber; // Already in format: SKL-YYYY-MM-NNNN
}

/**
 * Parse letter number to extract year and month
 */
export function parseLetterNumber(letterNumber: string): { year: number; month: number; sequence: number } | null {
  const match = letterNumber.match(/^SKL-(\d{4})-(\d{2})-(\d{4})$/);
  if (!match) return null;

  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10),
  };
}
