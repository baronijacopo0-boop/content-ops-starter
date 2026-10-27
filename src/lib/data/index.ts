'use client';

import { isSupabaseConfigured } from '@/lib/config';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { AuthService, DataRepository } from './repository';
import { LocalAuthService, LocalRepository } from './local-repository';
import { SupabaseAuthService, SupabaseRepository } from './supabase-repository';

export type { AuthService, AuthUser, DataRepository, ProfileUpdate } from './repository';

let auth: AuthService | null = null;

/** Auth backend: Supabase when configured, otherwise the local demo auth. */
export function getAuthService(): AuthService {
  auth ??= isSupabaseConfigured
    ? new SupabaseAuthService(getSupabaseBrowserClient())
    : new LocalAuthService();
  return auth;
}

export function createRepository(userId: string): DataRepository {
  return isSupabaseConfigured
    ? new SupabaseRepository(getSupabaseBrowserClient(), userId)
    : new LocalRepository(userId);
}
