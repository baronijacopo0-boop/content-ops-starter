import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import type { z } from 'zod';
import { isSupabaseConfigured } from '@/lib/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/services/ai/rate-limit';
import { firstError } from '@/lib/validation';

const MAX_BODY_BYTES = 12 * 1024 * 1024;

type GuardOk<T> = { ok: true; data: T; userId: string | null };
type GuardFail = { ok: false; response: NextResponse };

function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  );
}

/**
 * Common protection for AI endpoints:
 *  same-origin check · authentication (when Supabase is configured) · rate limit · body size · zod validation.
 */
export async function guardAiRequest<S extends z.ZodType>(
  req: NextRequest,
  schema: S,
): Promise<GuardOk<z.infer<S>> | GuardFail> {
  const fail = (status: number, error: string, headers?: Record<string, string>): GuardFail => ({
    ok: false,
    response: NextResponse.json({ error }, { status, headers }),
  });

  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== req.headers.get('host')) return fail(403, 'Origine non consentita');

  let userId: string | null = null;
  if (isSupabaseConfigured) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!.auth.getUser();
    userId = data.user?.id ?? null;
    if (!userId) return fail(401, 'Devi effettuare il login');
  }

  const limit = rateLimit(`ai:${userId ?? clientIp(req)}`);
  if (!limit.ok)
    return fail(429, 'Troppe richieste AI, riprova tra poco', {
      'Retry-After': String(limit.retryAfterSeconds),
    });

  const length = Number(req.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) return fail(413, 'Richiesta troppo grande');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, 'JSON non valido');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(400, firstError(parsed.error));
  return { ok: true, data: parsed.data, userId };
}

/** Best-effort audit log of AI usage in ai_generations (RLS: the user inserts their own row). */
export async function logGeneration(
  userId: string | null,
  kind: string,
  engine: string,
  input: unknown,
  output: unknown,
) {
  if (!userId) return;
  try {
    const supabase = await getSupabaseServerClient();
    await supabase
      ?.from('ai_generations')
      .insert({ user_id: userId, kind, engine, model: process.env.AI_MODEL ?? null, input, output });
  } catch {
    // never block the response on logging
  }
}
