'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { EmailOtpType } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/config';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { safeNext } from '@/components/shared/auth-card';
import { useApp } from '@/components/providers/app-provider';

/**
 * Landing page for Supabase email links (signup confirmation, password recovery).
 * Implemented client-side so it also works in the static-export deployment.
 * Supports both the PKCE `?code=` flow and the `?token_hash=&type=` email template flow.
 */
function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useApp();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = safeNext(params.get('next'), '/dashboard');
    if (!isSupabaseConfigured) {
      router.replace(next);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    (async () => {
      const errDesc = params.get('error_description');
      if (errDesc) throw new Error(errDesc);
      const tokenHash = params.get('token_hash');
      const type = params.get('type') as EmailOtpType | null;
      const code = params.get('code');
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) throw error;
      } else if (code) {
        const { data } = await supabase.auth.getSession(); // the browser client may already have exchanged the code
        if (!data.session) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
      }
      await refreshUser();
      router.replace(type === 'recovery' ? '/reset-password' : next);
    })().catch((e: Error) => setError(e.message || 'Link non valido o scaduto.'));
  }, [params, router, refreshUser]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-semibold">Link non valido o scaduto</p>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        <Link href="/login" className="text-sm font-semibold text-primary">
          Torna al login
        </Link>
      </div>
    );
  }
  return (
    <div className="flex min-h-dvh items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" /> Verifica in corso…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <Callback />
    </Suspense>
  );
}
