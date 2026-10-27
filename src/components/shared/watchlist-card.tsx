'use client';

import Link from 'next/link';
import { Bell, BellOff, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DealBadge } from '@/components/deals/deal-score';
import { categoryLabel, conditionLabel } from '@/lib/domain/constants';
import type { Watchlist } from '@/lib/domain/types';
import type { EvaluatedDeal } from '@/lib/deals/filter';
import { formatEUR } from '@/lib/format';
import { cn } from '@/lib/utils';

export function WatchlistCard({
  watchlist: w,
  matches,
  onEdit,
  onDelete,
  onToggle,
}: {
  watchlist: Watchlist;
  matches: EvaluatedDeal[];
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (patch: Partial<Watchlist>) => void;
}) {
  const chips = [
    w.query && `“${w.query}”`,
    w.brand,
    w.category && categoryLabel(w.category),
    w.size && `Tg ${w.size}`,
    w.condition && conditionLabel(w.condition),
    w.maxPrice !== null && `≤ ${formatEUR(w.maxPrice, { decimals: false })}`,
    w.minRoi !== null && `ROI ≥ ${w.minRoi}%`,
    w.minDealScore !== null && `Score ≥ ${w.minDealScore}`,
  ].filter(Boolean) as string[];
  return (
    <article
      className={cn('card-surface flex flex-col p-5 transition', !w.isActive && 'opacity-60')}
      data-testid="watchlist-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold">{w.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.length ? (
              chips.map((c) => (
                <Badge key={c} tone="muted">
                  {c}
                </Badge>
              ))
            ) : (
              <Badge tone="muted">Qualsiasi articolo</Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              aria-label="Azioni watchlist"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Modifica
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={onDelete}>
              <Trash2 /> Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 rounded-xl bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          <b className={cn('text-base', matches.length ? 'text-profit' : 'text-foreground')}>
            {matches.length}
          </b>{' '}
          occasioni attuali
        </p>
        {matches.slice(0, 2).map((m) => (
          <div key={m.item.id} className="mt-2 flex items-center justify-between gap-2 text-xs">
            <span className="truncate">
              {m.item.title} · {formatEUR(m.item.price, { decimals: false })}
            </span>
            <DealBadge score={m.evaluation.dealScore} />
          </div>
        ))}
        {matches.length > 0 && (
          <Link href="/deals" className="mt-2 block text-xs font-medium text-primary hover:underline">
            Vedi nel Deal Finder →
          </Link>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <label className="flex items-center gap-2">
          <Switch
            checked={w.isActive}
            onCheckedChange={(v) => onToggle({ isActive: v })}
            aria-label="Attiva watchlist"
          />{' '}
          Attiva
        </label>
        <button
          onClick={() => onToggle({ notify: !w.notify })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          {w.notify ? <Bell className="h-3.5 w-3.5 text-primary" /> : <BellOff className="h-3.5 w-3.5" />}
          {w.notify ? 'Notifiche on' : 'Notifiche off'}
        </button>
      </div>
    </article>
  );
}
