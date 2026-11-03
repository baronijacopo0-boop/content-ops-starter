'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CostBreakdownFields, useCostBreakdown } from '@/components/shared/cost-breakdown';
import { computeKpis } from '@/lib/domain/analytics';
import { formatPct } from '@/lib/format';
import { PageHeader } from '@/components/shared/states';
import { ProfitCard } from '@/components/shared/profit-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useInventory, useProfile, useSales } from '@/hooks/use-data';
import { breakEvenPrice, maxBuyPrice, profitBreakdown } from '@/lib/domain/finance';
import { formatEUR } from '@/lib/format';

const n = (v: string) => (v === '' || Number.isNaN(Number(v)) ? 0 : Math.max(0, Number(v)));

export default function CalculatorPage() {
  const { data: bundle } = useProfile();
  const [buy, setBuy] = useState('10');
  const [sell, setSell] = useState('30');
  const costs = useCostBreakdown({
    persist: false,
    initial: { packaging: 1, shipping: 0, feePct: 0, feeFixed: 0, other: 1 },
  });
  const [target, setTarget] = useState<number | null>(null);
  const targetRoi = target ?? bundle?.goals.targetRoi ?? 100;
  const extraTotal = costs.total(n(sell));
  const breakdown = profitBreakdown(n(buy), n(sell), extraTotal);
  // ROI targets with % fees: fixed part of the costs only (the % part depends on the sale price).
  const fixedExtra = costs.costs.packaging + costs.costs.shipping + costs.costs.other + costs.costs.feeFixed;
  const feeRate = costs.costs.feePct / 100;
  const { data: items } = useInventory();
  const { data: sales } = useSales();
  const real = useMemo(() => (items && sales ? computeKpis(items, sales) : null), [items, sales]);

  return (
    <>
      <PageHeader
        title="Calcolatore Profitto"
        description="Inserisci prezzo di acquisto, vendita e costi extra: profitto, ROI e margine si aggiornano in tempo reale."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <Field
              label="Prezzo di acquisto (€)"
              htmlFor="c-buy"
              hint="Quanto hai pagato (o pagheresti) il capo."
            >
              <Input
                id="c-buy"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={buy}
                onChange={(e) => setBuy(e.target.value)}
                className="h-12 text-lg"
              />
            </Field>
            <Field label="Prezzo di vendita (€)" htmlFor="c-sell" hint="A quanto pensi di venderlo.">
              <Input
                id="c-sell"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={sell}
                onChange={(e) => setSell(e.target.value)}
                className="h-12 text-lg"
              />
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium">Costi extra</p>
              <CostBreakdownFields state={costs} salePrice={n(sell)} idPrefix="c" collapsible={false} />
            </div>
            <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              Profitto netto = vendita − acquisto − costi extra (imballaggio + spedizione + commissioni +
              altro) · ROI = profitto ÷ acquisto × 100 · Margine = profitto ÷ vendita × 100
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <ProfitCard breakdown={breakdown} />
          <Card>
            <CardHeader>
              <CardTitle>Obiettivo ROI</CardTitle>
              <CardDescription>
                Quanto pagare al massimo e a quanto vendere per raggiungere il tuo ROI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ROI desiderato</span>
                <span className="font-bold text-primary">{targetRoi}%</span>
              </div>
              <Slider
                className="mt-2"
                min={0}
                max={300}
                step={10}
                value={[targetRoi]}
                onValueChange={([v]) => setTarget(v)}
                aria-label="ROI desiderato"
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Paga al massimo</p>
                  <p className="mt-1 text-xl font-bold">
                    {formatEUR(maxBuyPrice(n(sell), targetRoi, extraTotal))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">se vendi a {formatEUR(n(sell))}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Vendi almeno a</p>
                  <p className="mt-1 text-xl font-bold">
                    {formatEUR(
                      feeRate < 1 ? breakEvenPrice(n(buy), fixedExtra, targetRoi) / (1 - feeRate) : 0,
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">se paghi {formatEUR(n(buy))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {real && real.itemsSold > 0 && (
            <Card data-testid="real-totals">
              <CardHeader>
                <CardTitle>I tuoi numeri reali</CardTitle>
                <CardDescription>
                  Totali calcolati dalle vendite registrate (gli stessi di Statistiche).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Ricavi', formatEUR(real.revenue, { decimals: false })],
                  ['Costo merce venduta', formatEUR(real.costOfGoods, { decimals: false })],
                  ['Costi extra', formatEUR(real.extraCosts, { decimals: false })],
                  ['Profitto netto', formatEUR(real.totalProfit, { decimals: false })],
                  ['ROI complessivo', formatPct(real.avgRoi)],
                  ['Profitto medio per articolo', formatEUR(real.totalProfit / real.itemsSold)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-bold">{value}</p>
                  </div>
                ))}
                <Link
                  href="/analytics"
                  className="col-span-2 text-xs font-medium text-primary hover:underline"
                >
                  Vedi l’andamento completo →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
