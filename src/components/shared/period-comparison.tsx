'use client';

import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { periodComparison, type PeriodTotals } from '@/lib/domain/analytics';
import type { InventoryItem, Sale } from '@/lib/domain/types';
import { formatEUR } from '@/lib/format';
import { cn } from '@/lib/utils';

const ROWS: { key: keyof PeriodTotals; label: string; money: boolean; lowerIsBetter?: boolean }[] = [
  { key: 'profit', label: 'Profitto netto', money: true },
  { key: 'revenue', label: 'Ricavi', money: true },
  { key: 'spent', label: 'Spese', money: true, lowerIsBetter: true },
  { key: 'sold', label: 'Articoli venduti', money: false },
  { key: 'bought', label: 'Articoli acquistati', money: false },
];

function Delta({ value, lowerIsBetter }: { value: number | null; lowerIsBetter?: boolean }) {
  if (value === null) return <span className="text-[11px] text-muted-foreground">—</span>;
  const good = lowerIsBetter ? value < 0 : value > 0;
  const Icon = value === 0 ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums',
        value === 0 ? 'text-muted-foreground' : good ? 'text-profit' : 'text-loss',
      )}
    >
      <Icon className="h-3 w-3" />
      {value > 0 ? '+' : ''}
      {Math.round(value)}%
    </span>
  );
}

/** This week vs last week / this month vs last month, like-for-like (same number of days). */
export function PeriodComparisonCard({ items, sales }: { items: InventoryItem[]; sales: Sale[] }) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const c = useMemo(() => periodComparison(items, sales, period), [items, sales, period]);
  const fmt = (v: number, money: boolean) => (money ? formatEUR(v, { decimals: false }) : String(v));
  return (
    <Card data-testid="period-comparison">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Confronto periodi</CardTitle>
          <CardDescription>
            {c.currentLabel} vs {c.previousLabel.toLowerCase()}, a parità di giorni trascorsi.
          </CardDescription>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">Settimana</TabsTrigger>
            <TabsTrigger value="month">Mese</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 gap-y-2 text-sm">
          <span />
          <span className="text-right text-[11px] text-muted-foreground">
            <span className="sm:hidden">Ora</span>
            <span className="hidden sm:inline">{c.currentLabel}</span>
          </span>
          <span className="text-right text-[11px] text-muted-foreground">
            <span className="sm:hidden">Prima</span>
            <span className="hidden sm:inline">{c.previousLabel}</span>
          </span>
          <span className="text-right text-[11px] text-muted-foreground">Var.</span>
          {ROWS.map((r) => (
            <div key={r.key} className="contents">
              <span className="text-muted-foreground">{r.label}</span>
              <span
                className={cn(
                  'text-right font-semibold tabular-nums',
                  r.key === 'profit' && (c.current.profit >= 0 ? 'text-profit' : 'text-loss'),
                )}
              >
                {fmt(c.current[r.key], r.money)}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {fmt(c.previous[r.key], r.money)}
              </span>
              <span className="text-right">
                <Delta value={c.delta[r.key]} lowerIsBetter={r.lowerIsBetter} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Spese = articoli comprati nel periodo + costi extra delle vendite (imballaggio, spedizione,
          commissioni{c.current.extraCosts > 0 ? `: ${formatEUR(c.current.extraCosts)} ora` : ''}).
        </p>
      </CardContent>
    </Card>
  );
}
