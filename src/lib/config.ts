/**
 * Public runtime configuration. NEXT_PUBLIC_* variables are inlined at BUILD time,
 * so on Hostinger they must be set before running `npm run build`.
 * Secrets (SUPABASE_SERVICE_ROLE_KEY, AI_API_KEY) are never read here – only in server-only modules.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, ''),
  isStaticExport: process.env.NEXT_PUBLIC_STATIC_EXPORT === '1',
};

/** When Supabase is not configured the app runs in "local demo mode" (data in the browser). */
export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

export const STORAGE_BUCKET = 'item-photos';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB per original file
export const MAX_IMAGES = 8;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function appUrl() {
  if (publicEnv.appUrl) return publicEnv.appUrl;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}
