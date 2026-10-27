'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { BrandInput } from '@/components/shared/brand-input';
import { useProfile } from '@/hooks/use-data';
import { CATEGORIES, CONDITIONS } from '@/lib/domain/constants';
import type { Condition, ItemCategory } from '@/lib/domain/types';
import { formatEUR, formatPct } from '@/lib/format';
import { dealInputSchema, firstError } from '@/lib/validation';
import { aiClient } from '@/services/ai/client';
import type { DealEvaluation } from '@/services/ai/types';
import { cn } from '@/lib/utils';
import { DealScore } from './deal-score';

const VERDICT = {
  BUY: { cls: 'bg-profit text-primary-foreground', text: 'Conviene: compralo' },
  MAYBE: { cls: 'bg-warning text-black', text: 'Valuta: tratta sul prezzo' },
  SKIP: { cls: 'bg-loss text-white', text: 'Lascia stare' },
};

/** Dashboard widget "Sto per comprare…" → BUY / MAYBE / SKIP in one tap. */
export function QuickDealAnalyzer() {
  const { data: bundle } = useProfile();
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ItemCategory>('hoodie');
  const [condition, setCondition] = useState<Condition>('very_good');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DealEvaluation | null>(null);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    const parsed = dealInputSchema.safeParse({
      brand,
      category,
      condition,
      size: 'M',
      price,
      targetRoi: bundle?.goals.targetRoi,
      extraCosts: bundle?.settings.defaultExtraCosts,
      weights: bundle?.settings.dealScoreWeights,
    });
    if (!parsed.success) return toast.error(firstError(parsed.error));
    setLoading(true);
    try {
      setResult(await aiClient.analyzeDeal(parsed.data));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analisi non riuscita');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Sto per comprare…
        </CardTitle>
        <CardDescription>Analisi lampo prima di pagare: conviene davvero?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={analyze} className="grid grid-cols-2 gap-3" noValidate>
          <Field label="Brand" htmlFor="q-brand">
            <BrandInput id="q-brand" value={brand} onChange={setBrand} />
          </Field>
          <Field label="Categoria" htmlFor="q-cat">
            <SimpleSelect
              id="q-cat"
              value={category}
              onValueChange={(v) => setCategory(v as ItemCategory)}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
          </Field>
          <Field label="Prezzo (€)" htmlFor="q-price">
            <Input
              id="q-price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              placeholder="15"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <Field label="Condizione" htmlFor="q-cond">
            <SimpleSelect
              id="q-cond"
              value={condition}
              onValueChange={(v) => setCondition(v as Condition)}
              options={CONDITIONS.map((c) => ({ value: c.value, label: c.short }))}
            />
          </Field>
          <Button type="submit" className="col-span-2" loading={loading}>
            ANALIZZA
          </Button>
        </form>

        {result && (
          <div className="mt-4 animate-fade-up rounded-2xl border bg-muted/20 p-4" data-testid="quick-result">
            <div className="flex items-center gap-4">
              <DealScore score={result.dealScore} size={60} />
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    'inline-block rounded-lg px-2.5 py-1 text-sm font-black tracking-wider',
                    VERDICT[result.quickVerdict].cls,
                  )}
                >
                  {result.quickVerdict}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{VERDICT[result.quickVerdict].text}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background/50 py-2">
                <dt className="text-[10px] text-muted-foreground">Rivendi a</dt>
                <dd className="font-bold">{formatEUR(result.recommendedPrice, { decimals: false })}</dd>
              </div>
              <div className="rounded-lg bg-background/50 py-2">
                <dt className="text-[10px] text-muted-foreground">Profitto</dt>
                <dd className={cn('font-bold', result.profit >= 0 ? 'text-profit' : 'text-loss')}>
                  {formatEUR(result.profit, { sign: true })}
                </dd>
              </div>
              <div className="rounded-lg bg-background/50 py-2">
                <dt className="text-[10px] text-muted-foreground">ROI</dt>
                <dd className="font-bold">{formatPct(result.roi)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Paga al massimo <b className="text-foreground">{formatEUR(result.maxBuyPrice)}</b> per il tuo
              ROI target.{' '}
              <Link
                href={`/analyze?brand=${encodeURIComponent(result.input.brand)}&category=${result.input.category}&condition=${result.input.condition}&price=${result.input.price}`}
                className="text-primary hover:underline"
              >
                Analisi completa →
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
