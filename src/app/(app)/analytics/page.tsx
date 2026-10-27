'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import {
  AlertTriangle,
  Banknote,
  Boxes,
  Clock,
  Gauge,
  Info,
  Package,
  Percent,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { ErrorState, PageHeader, StatsSkeleton } from '@/components/shared/states';
import { StatCard } from '@/components/shared/stat-card';
import { BrandAnalytics } from '@/components/shared/brand-analytics';
import { SalesChart } from '@/components/charts/sales-chart';
import { BarListChart } from '@/components/charts/bar-list-chart';
import { BuySellChart } from '@/components/charts/buy-sell-chart';
import { CHART } from '@/components/charts/chart-kit';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApp } from '@/components/providers/app-provider';
import { useInventory, useProfile, useSales } from '@/hooks/use-data';
import { brandStats, categoryStats, computeKpis, monthlySeries, worstBrands } from '@/lib/domain/analytics';
import { formatDays, formatEUR, formatNumber, formatPct } from '@/lib/format';
import { aiClient } from '@/services/ai/client';
import type { BusinessInsight } from '@/services/ai/types';
import { cn } from '@/lib/utils';

const INSIGHT_ICON = {
  profit: TrendingUp,
  loss: TrendingDown,
  warning: AlertTriangle,
  info: Info,
  muted: Info,
  purple: Sparkles,
};
const INSIGHT_TONE = {
  profit: 'text-profit',
  loss: 'text-loss',
  warning: 'text-warning',
  info: 'text-info',
  muted: 'text-muted-foreground',
  purple: 'text-violet-300',
};

function Insights({
  insights,
  engine,
  loading,
}: {
  insights?: BusinessInsight[];
  engine?: string;
  loading: boolean;
}) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Insights
          </CardTitle>
          <CardDescription>Cosa ti dicono i tuoi numeri e cosa fare adesso.</CardDescription>
        </div>
        {engine && (
          <Badge tone={engine === 'mock' ? 'muted' : 'profit'}>
            {engine === 'mock' ? 'motore locale' : 'AI'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading || !insights ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2" data-testid="insights">
            {insights.map((i) => {
              const Icon = INSIGHT_ICON[i.tone];
              return (
                <li key={i.id} className="rounded-2xl border bg-muted/20 p-4">
                  <p className={cn('flex items-center gap-2 text-sm font-semibold', INSIGHT_TONE[i.tone])}>
                    <Icon className="h-4 w-4" /> {i.title}
                  </p>
                  <p className="mt-1.5 text-sm text-foreground/90">{i.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">→ {i.action}</p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { user } = useApp();
  const inv = useInventory();
  const sal = useSales();
  const { data: bundle } = useProfile();
  const items = inv.data;
  const sales = sal.data;

  const view = useMemo(() => {
    if (!items || !sales) return null;
    const now = new Date();
    const months = monthlySeries(items, sales, 12);
    const brands = brandStats(sales);
    return {
      kpis: computeKpis(items, sales),
      months,
      thisMonth: months[months.length - 1],
      brands,
      categories: categoryStats(sales),
      worst: worstBrands(sales),
      key: `${now.getFullYear()}-${now.getMonth()}`,
    };
  }, [items, sales]);

  const insightsKey =
    view && user
      ? [
          'insights',
          user.id,
          items!.length,
          sales!.length,
          bundle?.goals.targetRoi,
          bundle?.goals.monthlyGoal,
        ]
      : null;
  const insights = useSWR(insightsKey, () => aiClient.insights(items!, sales!, bundle?.goals));

  if (inv.error || sal.error)
    return (
      <ErrorState
        message={(inv.error || sal.error)?.message}
        onRetry={() => {
          void inv.mutate();
          void sal.mutate();
        }}
      />
    );

  return (
    <>
      <PageHeader title="Analytics" description="Capisci dove guadagni, dove perdi e su cosa concentrarti." />
      {!view ? (
        <div className="flex flex-col gap-4">
          <StatsSkeleton count={5} />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Profitto del mese"
              value={formatEUR(view.thisMonth.profit)}
              icon={TrendingUp}
              tone={view.thisMonth.profit >= 0 ? 'profit' : 'loss'}
              highlight
              info="Profitto netto delle vendite del mese in corso."
            />
            <StatCard
              label="ROI medio"
              value={formatPct(view.kpis.avgRoi)}
              icon={Percent}
              info="Profitto totale / costo totale della merce venduta."
            />
            <StatCard
              label="Prezzo medio acquisto"
              value={formatEUR(view.kpis.avgBuyPrice)}
              icon={ShoppingBag}
              info="Quanto paghi in media un capo. Abbassarlo è la leva più forte sul margine."
            />
            <StatCard
              label="Prezzo medio vendita"
              value={formatEUR(view.kpis.avgSellPrice)}
              icon={Banknote}
              info="Quanto incassi in media per vendita."
            />
            <StatCard
              label="Tempo medio vendita"
              value={formatDays(view.kpis.avgDaysToSell)}
              icon={Clock}
              info="Giorni medi dall’acquisto alla vendita."
            />
            <StatCard label="Articoli acquistati" value={formatNumber(view.kpis.itemsBought)} icon={Boxes} />
            <StatCard label="Articoli venduti" value={formatNumber(view.kpis.itemsSold)} icon={Package} />
            <StatCard
              label="Sell-through rate"
              value={formatPct(view.kpis.sellThroughRate)}
              icon={Gauge}
              info="Venduti / acquistati. Sopra il 60% è un ottimo segnale."
            />
            <StatCard
              label="Valore inventario"
              value={formatEUR(view.kpis.inventoryValue, { decimals: false })}
              icon={Package}
              info="Costo degli articoli ancora da vendere."
            />
            <StatCard
              label="Capitale investito"
              value={formatEUR(view.kpis.capitalInvested, { decimals: false })}
              icon={Wallet}
              info="Tutto ciò che hai speso finora (merce + costi extra)."
            />
          </div>

          <Insights
            insights={insights.data?.insights}
            engine={insights.data?.engine}
            loading={insights.isLoading}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <SalesChart
              data={view.months}
              title="Profitto per mese"
              description="Ultimi 12 mesi. Le barre rosse indicano mesi in perdita."
              metrics={['profit']}
            />
            <SalesChart
              data={view.months}
              title="Vendite per mese"
              description="Numero di articoli venduti o ricavi negli ultimi 12 mesi."
              metrics={['sold', 'revenue']}
            />
            <BarListChart
              title="ROI per brand"
              description="Quanto rende ogni euro investito, per brand."
              data={view.brands
                .map((b) => ({ label: b.label, value: b.roi }))
                .sort((a, b) => b.value - a.value)}
              format={(v) => `${Math.round(v)}%`}
              seriesName="ROI"
            />
            <BarListChart
              title="Profitto per categoria"
              description="Dove arriva il tuo guadagno."
              data={view.categories.map((c) => ({ label: c.label, value: c.profit }))}
              format={(v) => formatEUR(v, { decimals: false })}
              seriesName="Profitto"
            />
            <BarListChart
              title="Tempo medio vendita per brand"
              description="Barre più corte = capitale che torna prima."
              data={view.brands
                .map((b) => ({ label: b.label, value: b.avgDaysToSell }))
                .sort((a, b) => a.value - b.value)}
              format={(v) => `${Math.round(v)}g`}
              color={CHART.revenue}
              seriesName="Giorni medi"
            />
            <BuySellChart data={view.categories} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <BrandAnalytics
              title="🏆 Top 5 brand più profittevoli"
              description="Dove stai guadagnando di più."
              rows={view.brands.slice(0, 5)}
            />
            <BrandAnalytics
              title="⚠️ 5 brand peggiori"
              description="ROI più basso: qui stai lasciando soldi sul tavolo (o perdendoli)."
              rows={view.worst}
            />
          </div>
        </div>
      )}
    </>
  );
}
