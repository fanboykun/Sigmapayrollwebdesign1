/**
 * DEPRECATED: This file is deprecated.
 * Use src/lib/supabaseClient.ts instead.
 *
 * This file is kept for backward compatibility and now just re-exports
 * the singleton instance from lib/supabaseClient.ts to prevent multiple instances.
 */

import { supabase } from '../../lib/supabaseClient'

// Re-export the singleton instance
export { supabase }
