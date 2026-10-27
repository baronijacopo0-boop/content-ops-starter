'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/states';
import { ProfitCard } from '@/components/shared/profit-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useProfile } from '@/hooks/use-data';
import { breakEvenPrice, maxBuyPrice, profitBreakdown } from '@/lib/domain/finance';
import { formatEUR } from '@/lib/format';

const n = (v: string) => (v === '' || Number.isNaN(Number(v)) ? 0 : Math.max(0, Number(v)));

export default function CalculatorPage() {
  const { data: bundle } = useProfile();
  const [buy, setBuy] = useState('10');
  const [sell, setSell] = useState('30');
  const [extra, setExtra] = useState('2');
  const [target, setTarget] = useState<number | null>(null);
  const targetRoi = target ?? bundle?.goals.targetRoi ?? 100;
  const breakdown = profitBreakdown(n(buy), n(sell), n(extra));

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
            <Field
              label="Costi extra (€)"
              htmlFor="c-extra"
              hint="Imballaggio, lavaggio, riparazioni, spedizione a tuo carico."
            >
              <Input
                id="c-extra"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                className="h-12 text-lg"
              />
            </Field>
            <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              Profitto = vendita − acquisto − costi extra · ROI = profitto ÷ acquisto × 100 · Margine =
              profitto ÷ vendita × 100
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
                    {formatEUR(maxBuyPrice(n(sell), targetRoi, n(extra)))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">se vendi a {formatEUR(n(sell))}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Vendi almeno a</p>
                  <p className="mt-1 text-xl font-bold">
                    {formatEUR(breakEvenPrice(n(buy), n(extra), targetRoi))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">se paghi {formatEUR(n(buy))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
