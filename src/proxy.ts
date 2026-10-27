import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy-session';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets and API routes (API routes authenticate on their own).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
