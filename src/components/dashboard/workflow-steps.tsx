'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Camera,
  ChevronRight,
  Flame,
  Package,
  PiggyBank,
  Receipt,
  ScanSearch,
  ShoppingBag,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { QuickSaleDialog } from '@/components/shared/quick-sale-dialog';
import { Card, CardContent } from '@/components/ui/card';
import type { InventoryItem, Sale } from '@/lib/domain/types';
import { enrichSale } from '@/lib/domain/analytics';
import { formatEUR } from '@/lib/format';
import { cn, sum } from '@/lib/utils';

interface Step {
  key: string;
  label: string;
  icon: LucideIcon;
  value: string;
  sub: string;
  href?: string;
  sale?: boolean;
  todo?: boolean;
}

/**
 * The whole RIVENDO loop in one strip: Ricerca → Acquisto → Analisi AI → Annuncio → Inventario
 * → Vendita → Profitto. Each step shows where you stand and links to the page that moves it on;
 * the first step with pending work is highlighted as "prossimo passo".
 */
export function WorkflowSteps({ items, sales }: { items: InventoryItem[]; sales: Sale[] }) {
  const [selling, setSelling] = useState(false);
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const unsold = items.filter((i) => i.status !== 'sold');
  const toPhoto = unsold.filter((i) => i.status === 'to_photograph').length;
  const toList = unsold.filter((i) => i.status === 'to_list').length;
  const online = unsold.filter((i) => i.status === 'listed' || i.status === 'reserved').length;
  const boughtThisMonth =
    unsold.filter((i) => i.purchaseDate.startsWith(month)).length +
    sales.filter((s) => s.purchasedAt.startsWith(month)).length;
  const soldThisMonth = sales.filter((s) => s.soldAt.startsWith(month));
  const monthProfit = sum(soldThisMonth.map((s) => enrichSale(s).profit));

  const steps: Step[] = [
    {
      key: 'search',
      label: 'Ricerca',
      icon: Flame,
      value: 'Deal',
      sub: 'occasioni valutate',
      href: '/deals',
    },
    {
      key: 'buy',
      label: 'Acquisto',
      icon: ShoppingBag,
      value: String(boughtThisMonth),
      sub: 'comprati questo mese',
      href: '/inventory?new=1',
    },
    {
      key: 'analyze',
      label: 'Analisi AI',
      icon: ScanSearch,
      value: 'AI',
      sub: 'conviene?',
      href: '/analyze',
    },
    {
      key: 'list',
      label: 'Annuncio',
      icon: toPhoto > 0 ? Camera : Tag,
      value: String(toPhoto + toList),
      sub: 'da pubblicare',
      href: '/inventory',
      todo: toPhoto + toList > 0,
    },
    {
      key: 'stock',
      label: 'Inventario',
      icon: Package,
      value: String(unsold.length),
      sub: `in stock · ${online} online`,
      href: '/inventory',
    },
    {
      key: 'sell',
      label: 'Vendita',
      icon: Receipt,
      value: String(soldThisMonth.length),
      sub: 'vendute questo mese',
      sale: true,
    },
    {
      key: 'profit',
      label: 'Profitto',
      icon: PiggyBank,
      value: formatEUR(monthProfit, { decimals: false }),
      sub: 'netto del mese',
      href: '/analytics',
    },
  ];
  const nextKey = unsold.length === 0 ? 'search' : (steps.find((s) => s.todo)?.key ?? 'sell');

  return (
    <Card data-testid="workflow-steps">
      <CardContent className="p-3 sm:p-4">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Il tuo flusso
        </p>
        <ol className="-mx-1 flex snap-x gap-1 overflow-x-auto px-1 pb-1">
          {steps.map((s, i) => {
            const next = s.key === nextKey;
            const body = (
              <>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <s.icon className={cn('h-3.5 w-3.5', next ? 'text-primary' : '')} />
                  {i + 1}. {s.label}
                </span>
                <span className="mt-1 text-lg font-bold tabular-nums">{s.value}</span>
                <span className="text-[11px] leading-tight text-muted-foreground">{s.sub}</span>
                {next && (
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Prossimo passo
                  </span>
                )}
              </>
            );
            const cls = cn(
              'flex h-full min-w-[118px] flex-col rounded-xl border p-2.5 text-left transition hover:bg-accent',
              next ? 'border-primary/50 bg-primary/5' : 'bg-muted/10',
            );
            return (
              <li key={s.key} className="flex shrink-0 snap-start items-center gap-1">
                {s.sale ? (
                  <button className={cls} onClick={() => setSelling(true)}>
                    {body}
                  </button>
                ) : (
                  <Link href={s.href!} className={cls}>
                    {body}
                  </Link>
                )}
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
      <QuickSaleDialog open={selling} onOpenChange={setSelling} />
    </Card>
  );
}
