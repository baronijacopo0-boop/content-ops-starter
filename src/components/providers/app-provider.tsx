'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  createRepository,
  getAuthService,
  type AuthService,
  type AuthUser,
  type DataRepository,
} from '@/lib/data';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AppContextValue {
  status: Status;
  user: AuthUser | null;
  repo: DataRepository | null;
  auth: AuthService;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const auth = useMemo(() => getAuthService(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const refreshUser = useCallback(async () => {
    try {
      const u = await auth.getUser();
      setUser(u);
      setStatus(u ? 'authenticated' : 'unauthenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [auth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session load from the auth backend
    void refreshUser();
    return auth.onAuthStateChange((u, event) => {
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;
      setUser(u);
      setStatus(u ? 'authenticated' : 'unauthenticated');
    });
  }, [auth, refreshUser]);

  const repo = useMemo(() => (user ? createRepository(user.id) : null), [user]);
  const value = useMemo(
    () => ({ status, user, repo, auth, refreshUser }),
    [status, user, repo, auth, refreshUser],
  );

  return (
    <AppContext.Provider value={value}>
      <SWRConfig value={{ revalidateOnFocus: false, shouldRetryOnError: false, keepPreviousData: true }}>
        <TooltipProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-center"
            richColors
            toastOptions={{ classNames: { toast: '!rounded-2xl !border-border !bg-card' } }}
          />
        </TooltipProvider>
      </SWRConfig>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

/** Repository for the signed-in user (only call inside the authenticated AppShell). */
export function useRepo(): DataRepository {
  const { repo } = useApp();
  if (!repo) throw new Error('Not authenticated');
  return repo;
}
