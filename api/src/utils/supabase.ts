import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'

// Admin client bypasses RLS - use only for server-side operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
