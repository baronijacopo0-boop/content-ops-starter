'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Receipt, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/inventory', label: 'Inventario', icon: Package },
  { href: '/listings', label: 'Annunci', icon: Tag },
  { href: '/sales', label: 'Vendite', icon: Receipt },
];

/** One-tap switch between the three "management" views: stock → listings → sales. */
export function WorkflowNav({
  counts,
}: {
  counts?: Partial<Record<'/inventory' | '/listings' | '/sales', number>>;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Gestione" className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border bg-card p-1">
      {ITEMS.map((i) => {
        const active = pathname === i.href;
        const count = counts?.[i.href as keyof typeof counts];
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold text-muted-foreground transition sm:text-sm',
              active ? 'bg-primary/10 text-foreground' : 'hover:bg-accent hover:text-foreground',
            )}
          >
            <i.icon className={cn('h-4 w-4', active && 'text-primary')} />
            {i.label}
            {count !== undefined && <span className="text-[10px] text-muted-foreground">{count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
