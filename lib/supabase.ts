import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && (supabaseAnonKey || supabaseServiceKey)
);

// Client-side Supabase instance (uses Publishable / Anon Key)
export const supabaseClient: SupabaseClient | null =
  isSupabaseConfigured && supabaseUrl && (supabaseAnonKey || supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey!)
    : null;

// Server-side Admin Supabase instance (uses Secret / Service Role Key)
export const supabaseAdmin: SupabaseClient | null =
  isSupabaseConfigured && supabaseUrl && (supabaseServiceKey || supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!)
    : null;
