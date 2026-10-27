'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Banknote,
  Boxes,
  Clock,
  Gauge,
  Lightbulb,
  Package,
  Percent,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { PageHeader, ErrorState, StatsSkeleton } from '@/components/shared/states';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfitChart } from '@/components/charts/profit-chart';
import { SalesChart } from '@/components/charts/sales-chart';
import { QuickDealAnalyzer } from '@/components/deals/quick-deal-analyzer';
import { InventoryHealth } from '@/components/inventory/inventory-health';
import { RecentItems } from '@/components/inventory/recent-items';
import { BrandAnalytics } from '@/components/shared/brand-analytics';
import { useInventory, useProfile, useSales } from '@/hooks/use-data';
import { brandStats, computeKpis, monthlySeries } from '@/lib/domain/analytics';
import { inventoryHealth } from '@/lib/domain/stock';
import { formatDays, formatEUR, formatNumber, formatPct } from '@/lib/format';
import { generateResellingAdvice } from '@/services/ai/advice';
import { sum } from '@/lib/utils';
import { enrichSale } from '@/lib/domain/analytics';

function greeting() {
  const h = new Date().getHours();
  if (h < 13) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

export default function DashboardPage() {
  const { data: bundle } = useProfile();
  const inv = useInventory();
  const sal = useSales();
  const items = inv.data;
  const sales = sal.data;

  const view = useMemo(() => {
    if (!items || !sales) return null;
    const kpis = computeKpis(items, sales);
    const health = inventoryHealth(items);
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthProfit = sum(sales.filter((s) => s.soldAt.startsWith(key)).map((s) => enrichSale(s).profit));
    return {
      kpis,
      health,
      months: monthlySeries(items, sales, 6),
      brands: brandStats(sales).slice(0, 5),
      monthProfit,
      advice: generateResellingAdvice({
        kpis,
        health,
        niche: bundle?.profile.mainCategory,
        targetRoi: bundle?.goals.targetRoi,
      }),
    };
  }, [items, sales, bundle]);

  const name = bundle?.profile.fullName?.split(' ')[0] ?? '';
  const goal = bundle?.goals.monthlyGoal ?? null;

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
      <PageHeader
        title={
          <>
            {greeting()}, {name} 👋
          </>
        }
        description="Ecco come sta andando il tuo business di reselling."
      />

      {!view ? (
        <div className="flex flex-col gap-4">
          <StatsSkeleton />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goal ? (
            <Card>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="shrink-0">
                  <p className="text-xs text-muted-foreground">Obiettivo di questo mese</p>
                  <p className="text-lg font-bold">
                    <span className={view.monthProfit >= goal ? 'text-profit' : ''}>
                      {formatEUR(view.monthProfit)}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {' '}
                      / {formatEUR(goal, { decimals: false })}
                    </span>
                  </p>
                </div>
                <div className="flex-1">
                  <Progress value={(view.monthProfit / goal) * 100} />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {view.monthProfit >= goal
                      ? 'Obiettivo raggiunto 🎉 Valuta di alzarlo dal profilo.'
                      : `Mancano ${formatEUR(goal - view.monthProfit)}: pubblica gli articoli fermi e punta sugli Hot Deal.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Profitto totale"
              value={formatEUR(view.kpis.totalProfit)}
              icon={TrendingUp}
              tone={view.kpis.totalProfit >= 0 ? 'profit' : 'loss'}
              highlight
              info="Somma di (prezzo vendita − prezzo acquisto − costi extra) di tutte le vendite. È quanto hai guadagnato davvero."
            />
            <StatCard
              label="Valore inventario"
              value={formatEUR(view.kpis.inventoryValue, { decimals: false })}
              icon={Package}
              sub={`${view.kpis.inventoryCount} articoli · listino ${formatEUR(view.kpis.inventoryListedValue, { decimals: false })}`}
              info="Quanto hai speso per gli articoli non ancora venduti: è capitale che deve tornare indietro."
            />
            <StatCard
              label="Articoli venduti"
              value={formatNumber(view.kpis.itemsSold)}
              icon={Receipt}
              sub={`su ${view.kpis.itemsBought} acquistati`}
              info="Numero totale di vendite registrate."
            />
            <StatCard
              label="ROI medio"
              value={formatPct(view.kpis.avgRoi)}
              icon={Percent}
              tone={view.kpis.avgRoi >= (bundle?.goals.targetRoi ?? 100) ? 'profit' : 'warning'}
              sub={`Target ${bundle?.goals.targetRoi ?? 100}%`}
              info="Profitto totale / costo totale della merce venduta × 100. Indica quanto rende ogni euro investito."
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Capitale investito"
              value={formatEUR(view.kpis.capitalInvested, { decimals: false })}
              icon={Wallet}
              info="Tutto quello che hai speso: merce venduta + invenduta + costi extra."
            />
            <StatCard
              label="Fatturato"
              value={formatEUR(view.kpis.revenue, { decimals: false })}
              icon={Banknote}
              info="Somma dei prezzi di vendita."
            />
            <StatCard
              label="Margine medio"
              value={formatPct(view.kpis.avgMargin)}
              icon={PiggyBank}
              info="Profitto / fatturato. Su €100 venduti, quanti ti restano in tasca."
            />
            <StatCard
              label="Sell-through"
              value={formatPct(view.kpis.sellThroughRate)}
              icon={Gauge}
              info="Articoli venduti / articoli acquistati. Sotto il 50% stai comprando più di quanto riesci a vendere."
            />
            <StatCard
              label="Tempo medio vendita"
              value={formatDays(view.kpis.avgDaysToSell)}
              icon={Clock}
              info="Giorni medi dall’acquisto alla vendita. Più è basso, più velocemente il capitale torna disponibile."
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="flex flex-col gap-4 xl:col-span-2">
              <ProfitChart sales={sales!} />
              <SalesChart
                data={view.months}
                description="Ultimi 6 mesi: articoli venduti, ricavi o profitto."
              />
            </div>
            <div className="flex flex-col gap-4">
              <QuickDealAnalyzer />
              <InventoryHealth health={view.health} />
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Lightbulb className="h-3.5 w-3.5" /> Consiglio per te
                  </p>
                  <p className="mt-2 font-semibold">{view.advice.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{view.advice.body}</p>
                  <Link
                    href={`/guide/${view.advice.guideSlug}`}
                    className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Leggi la guida →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <BrandAnalytics
              title="Top brand"
              description="I brand che ti fanno guadagnare di più."
              rows={view.brands}
            />
            <RecentItems items={items!.slice(0, 6)} />
          </div>

          {items!.length === 0 && sales!.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                <Boxes className="h-6 w-6 text-primary" />
                <p className="font-semibold">Il tuo business inizia qui</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Aggiungi il primo articolo in inventario o carica i dati demo dalle impostazioni per vedere
                  la dashboard in azione.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
