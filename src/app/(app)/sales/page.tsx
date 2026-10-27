'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Clock,
  Download,
  Package,
  Percent,
  PiggyBank,
  Receipt,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, ErrorState, PageHeader, StatsSkeleton } from '@/components/shared/states';
import { StatCard } from '@/components/shared/stat-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/select';
import { useApp } from '@/components/providers/app-provider';
import { useInventory, useSales, useRevalidate } from '@/hooks/use-data';
import { computeKpis, enrichSale, type SaleMetrics } from '@/lib/domain/analytics';
import { marketplaceLabel } from '@/lib/domain/constants';
import { formatDate, formatDays, formatEUR, formatPct } from '@/lib/format';
import { cn, daysBetween } from '@/lib/utils';

type Period = 'all' | '30' | '90' | '365';
const PERIODS: { value: Period; label: string }[] = [
  { value: 'all', label: 'Sempre' },
  { value: '30', label: 'Ultimi 30 giorni' },
  { value: '90', label: 'Ultimi 3 mesi' },
  { value: '365', label: 'Ultimo anno' },
];

function toCsv(rows: SaleMetrics[]) {
  const head = [
    'Prodotto',
    'Brand',
    'Acquisto',
    'Vendita',
    'Costi extra',
    'Profitto',
    'ROI %',
    'Data acquisto',
    'Data vendita',
    'Giorni',
    'Piattaforma',
  ];
  const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    head,
    ...rows.map((s) => [
      s.productName,
      s.brand,
      s.purchasePrice,
      s.salePrice,
      s.extraCosts,
      s.profit,
      s.roi,
      s.purchasedAt,
      s.soldAt,
      s.daysToSell,
      s.platform,
    ]),
  ]
    .map((r) => r.map(esc).join(';'))
    .join('\n');
}

export default function SalesPage() {
  const { repo } = useApp();
  const { data: sales, error, isLoading, mutate } = useSales();
  const { data: items } = useInventory();
  const revalidate = useRevalidate();
  const [period, setPeriod] = useState<Period>('all');
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState<SaleMetrics | null>(null);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    return (sales ?? []).filter(
      (s) =>
        (period === 'all' || daysBetween(s.soldAt) <= Number(period)) &&
        (!q || `${s.productName} ${s.brand}`.toLowerCase().includes(q)),
    );
  }, [sales, period, text]);
  const rows = useMemo(() => filtered.map(enrichSale), [filtered]);
  const kpis = useMemo(() => computeKpis(items ?? [], filtered), [items, filtered]);

  function exportCsv() {
    const blob = new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flip-ai-vendite-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Vendite"
        description="Lo storico completo delle tue vendite con profitto, ROI e giorni impiegati a vendere."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
            <Download /> Esporta CSV
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !sales ? (
        <StatsSkeleton count={6} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Ricavi totali"
              value={formatEUR(kpis.revenue, { decimals: false })}
              icon={Banknote}
              info="Somma dei prezzi di vendita nel periodo."
            />
            <StatCard
              label="Costo merce"
              value={formatEUR(kpis.costOfGoods, { decimals: false })}
              icon={Package}
              info="Quanto avevi pagato gli articoli venduti."
            />
            <StatCard
              label="Profitto netto"
              value={formatEUR(kpis.totalProfit)}
              icon={TrendingUp}
              tone={kpis.totalProfit >= 0 ? 'profit' : 'loss'}
              info="Ricavi − costo merce − costi extra."
            />
            <StatCard
              label="Margine medio"
              value={formatPct(kpis.avgMargin)}
              icon={PiggyBank}
              info="Profitto / ricavi."
            />
            <StatCard
              label="ROI medio"
              value={formatPct(kpis.avgRoi)}
              icon={Percent}
              info="Profitto / costo merce × 100."
            />
            <StatCard
              label="Tempo medio"
              value={formatDays(kpis.avgDaysToSell)}
              icon={Clock}
              info="Giorni medi tra acquisto e vendita."
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Cerca prodotto o brand…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Cerca vendite"
              />
            </div>
            <SimpleSelect
              className="sm:w-48"
              value={period}
              onValueChange={(v) => setPeriod(v as Period)}
              options={PERIODS}
              ariaLabel="Periodo"
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nessuna vendita nel periodo"
              description="Quando vendi un articolo, segnalo come venduto dall’inventario: comparirà qui con profitto e ROI."
              action={
                <Button asChild>
                  <Link href="/inventory">Vai all’inventario</Link>
                </Button>
              }
            />
          ) : (
            <div className="card-surface overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm" data-testid="sales-table">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Prodotto</th>
                    <th className="px-2 py-3 text-right font-medium">Acquisto</th>
                    <th className="px-2 py-3 text-right font-medium">Vendita</th>
                    <th className="px-2 py-3 text-right font-medium">Costi extra</th>
                    <th className="px-2 py-3 text-right font-medium">Profitto</th>
                    <th className="px-2 py-3 text-right font-medium">ROI</th>
                    <th className="px-2 py-3 font-medium">Data vendita</th>
                    <th className="px-2 py-3 text-right font-medium">Giorni</th>
                    <th className="px-2 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <p className="max-w-[260px] truncate font-medium">{s.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.brand} · {marketplaceLabel(s.platform)}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{formatEUR(s.purchasePrice)}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{formatEUR(s.salePrice)}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatEUR(s.extraCosts)}
                      </td>
                      <td
                        className={cn(
                          'px-2 py-2.5 text-right font-semibold tabular-nums',
                          s.profit >= 0 ? 'text-profit' : 'text-loss',
                        )}
                      >
                        {formatEUR(s.profit, { sign: true })}
                      </td>
                      <td
                        className={cn('px-2 py-2.5 text-right tabular-nums', (s.roi ?? 0) < 0 && 'text-loss')}
                      >
                        {formatPct(s.roi)}
                      </td>
                      <td className="px-2 py-2.5 text-muted-foreground">{formatDate(s.soldAt)}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.daysToSell}</td>
                      <td className="px-2 py-2.5 text-right">
                        <button
                          onClick={() => setDeleting(s)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-loss/10 hover:text-loss"
                          aria-label={`Elimina vendita ${s.productName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Eliminare la vendita?"
        description="La vendita verrà rimossa dallo storico e dalle statistiche. L’articolo in inventario non viene modificato."
        onConfirm={async () => {
          if (!repo || !deleting) return;
          try {
            await repo.deleteSale(deleting.id);
            await revalidate('sales');
            toast.success('Vendita eliminata');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Errore');
          }
        }}
      />
    </>
  );
}
