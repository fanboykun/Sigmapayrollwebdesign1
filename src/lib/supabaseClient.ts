/**
 * Supabase Client Configuration
 *
 * Centralized Supabase client untuk digunakan di seluruh aplikasi.
 * Menggunakan environment variables untuk konfigurasi.
 * Menggunakan singleton pattern untuk menghindari multiple instances.
 *
 * @module SupabaseClient
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * Singleton pattern untuk Supabase client
 * Mencegah multiple instances saat hot reload
 */
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

/**
 * Supabase client instance
 * Digunakan untuk semua operasi database
 */
export const supabase = getSupabaseClient();

/**
 * Helper function untuk handle Supabase errors
 */
export function handleSupabaseError(error: any, context: string) {
  console.error(`Supabase Error [${context}]:`, error);

  if (error.code === 'PGRST116') {
    return 'Data tidak ditemukan';
  }

  if (error.code === '23505') {
    return 'Data duplikat. NIK atau email sudah terdaftar.';
  }

  if (error.code === '23503') {
    return 'Referensi data tidak valid';
  }

  return error.message || 'Terjadi kesalahan pada sistem';
}
