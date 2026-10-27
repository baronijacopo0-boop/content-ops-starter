'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/config';

let browserClient: SupabaseClient | null = null;

/** Browser Supabase client (anon key only – all access is enforced by RLS). */
export function getSupabaseBrowserClient() {
  browserClient ??= createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  return browserClient;
}
