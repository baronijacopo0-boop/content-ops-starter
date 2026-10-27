'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  Bookmark,
  Calculator,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Receipt,
  ScanSearch,
  Settings,
  Sparkles,
  Tag,
  User,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApp } from '@/components/providers/app-provider';
import { useNotifications, useProfile, useRevalidate } from '@/hooks/use-data';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Business',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/deals', label: 'Deal Finder', icon: Flame },
      { href: '/analyze', label: 'Analizza prodotto', icon: ScanSearch },
      { href: '/listings/new', label: 'Crea annuncio AI', icon: Sparkles },
    ],
  },
  {
    title: 'Gestione',
    items: [
      { href: '/listings', label: 'I miei annunci', icon: Tag },
      { href: '/inventory', label: 'Inventario', icon: Package },
      { href: '/sales', label: 'Vendite', icon: Receipt },
      { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Strumenti',
    items: [
      { href: '/guide', label: 'Guida Reselling', icon: GraduationCap },
      { href: '/calculator', label: 'Calcolatore Profitto', icon: Calculator },
      { href: '/profile', label: 'Profilo', icon: User },
      { href: '/settings', label: 'Impostazioni', icon: Settings },
    ],
  },
];

const MOBILE_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/deals', label: 'Deals', icon: Flame },
  { href: '/analyze', label: 'Analizza', icon: ScanSearch },
  { href: '/inventory', label: 'Inventario', icon: Package },
];

function isActive(pathname: string, href: string) {
  if (href === '/listings') return pathname === '/listings';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground',
                      active && 'bg-primary/10 text-foreground',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        active ? 'text-primary' : 'group-hover:text-foreground',
                      )}
                    />
                    {item.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NotificationsBell() {
  const { data: notifications } = useNotifications();
  const { repo } = useApp();
  const revalidate = useRevalidate();
  const unread = notifications?.filter((n) => !n.readAt) ?? [];
  return (
    <DropdownMenu
      onOpenChange={async (open) => {
        if (!open && unread.length && repo) {
          await repo.markNotificationsRead(unread.map((n) => n.id));
          void revalidate('notifications');
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border bg-card transition hover:bg-accent"
          aria-label="Notifiche"
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <p className="px-2 pb-2 pt-1 text-xs font-semibold text-muted-foreground">Notifiche</p>
        {!notifications?.length ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">Nessuna notifica per ora.</p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {notifications.slice(0, 10).map((n) => (
              <li key={n.id} className={cn('rounded-lg px-2 py-2 text-sm', !n.readAt && 'bg-primary/5')}>
                <div className="flex items-center gap-2 font-medium">
                  {!n.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  {n.title}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/60">{formatDate(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DemoBanner() {
  const { auth } = useApp();
  if (auth.mode !== 'local') return null;
  return (
    <div className="border-b border-warning/20 bg-warning/10 px-4 py-1.5 text-center text-[11px] text-warning lg:pl-64">
      Modalità demo locale: i dati restano nel browser. Configura Supabase (.env) per salvarli online.
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, auth, user } = useApp();
  const { data: bundle, error: profileError } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);

  // Client-side route protection (server-side protection is done by src/proxy.ts with Supabase).
  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  useEffect(() => {
    if (bundle && !bundle.profile.onboardingCompleted) router.replace('/onboarding');
  }, [bundle, router]);

  async function logout() {
    await auth.signOut();
    toast.success('Alla prossima!');
    router.replace('/login');
  }

  if (
    status !== 'authenticated' ||
    (!bundle && !profileError) ||
    (bundle && !bundle.profile.onboardingCompleted)
  )
    return <FullScreenLoader />;

  const name = bundle?.profile.fullName || user?.email || '';
  const initials = name
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-dvh">
      <DemoBanner />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card/40 backdrop-blur lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo href="/dashboard" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
          <NavLinks pathname={pathname} />
        </div>
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/80 to-emerald-700 text-xs font-bold text-primary-foreground">
              {bundle?.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bundle.profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{bundle?.profile.fullName ?? 'Reseller'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-loss/10 hover:text-loss"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg lg:hidden">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-2">
          <NotificationsBell />
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-card"
            aria-label="Apri menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Desktop top bar */}
      <div className="hidden lg:block lg:pl-64">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-end gap-3 px-8">
          <Link
            href="/listings/new"
            className="inline-flex h-9 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-medium transition hover:bg-accent"
          >
            <Sparkles className="h-4 w-4 text-primary" /> Nuovo annuncio
          </Link>
          <NotificationsBell />
        </div>
      </div>

      <main className="lg:pl-64">
        <div
          key={pathname}
          className="mx-auto max-w-7xl animate-fade-up px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-0"
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-lg lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex w-full flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
              Menu
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent side="left" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <div className="flex h-14 items-center px-5">
            <Logo href="/dashboard" />
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <button
              onClick={logout}
              className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-loss transition hover:bg-loss/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
