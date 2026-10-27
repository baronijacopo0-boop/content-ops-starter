'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { History, ScanSearch } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/states';
import { AIAnalysis } from '@/components/deals/ai-analysis';
import { DealBadge } from '@/components/deals/deal-score';
import { BrandInput } from '@/components/shared/brand-input';
import { ImageUploader } from '@/components/shared/image-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { useApp } from '@/components/providers/app-provider';
import { useDealAnalyses, useProfile, useRevalidate } from '@/hooks/use-data';
import { CATEGORIES, CONDITIONS, SIZES } from '@/lib/domain/constants';
import type { Condition, ItemCategory } from '@/lib/domain/types';
import type { ProcessedImage } from '@/lib/image';
import { formatDate, formatEUR } from '@/lib/format';
import { dealInputSchema, fieldErrors } from '@/lib/validation';
import { aiClient } from '@/services/ai/client';
import { BADGE_META } from '@/services/ai/deal-score';
import type { DealEvaluation } from '@/services/ai/types';

const isCategory = (v: string | null): v is ItemCategory => !!v && CATEGORIES.some((c) => c.value === v);
const isCondition = (v: string | null): v is Condition => !!v && CONDITIONS.some((c) => c.value === v);

function AnalyzeForm() {
  const params = useSearchParams();
  const { repo } = useApp();
  const { data: bundle } = useProfile();
  const { data: history } = useDealAnalyses();
  const revalidate = useRevalidate();
  const [form, setForm] = useState({
    name: '',
    brand: params.get('brand') ?? '',
    category: (isCategory(params.get('category')) ? params.get('category') : 'hoodie') as ItemCategory,
    condition: (isCondition(params.get('condition')) ? params.get('condition') : 'very_good') as Condition,
    size: 'M',
    price: params.get('price') ?? '',
  });
  const [photos, setPhotos] = useState<ProcessedImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DealEvaluation | null>(null);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    const parsed = dealInputSchema.safeParse({
      ...form,
      targetRoi: bundle?.goals.targetRoi,
      extraCosts: bundle?.settings.defaultExtraCosts,
      weights: bundle?.settings.dealScoreWeights,
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    try {
      const evaluation = await aiClient.analyzeDeal(parsed.data);
      setResult(evaluation);
      requestAnimationFrame(() =>
        document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
      await repo?.saveDealAnalysis({
        productName:
          parsed.data.name ||
          `${parsed.data.brand} ${CATEGORIES.find((c) => c.value === parsed.data.category)?.singular}`,
        brand: parsed.data.brand,
        category: parsed.data.category,
        askingPrice: parsed.data.price,
        dealScore: evaluation.dealScore,
        verdict: BADGE_META[evaluation.badge].verdict,
        result: {
          recommendedPrice: evaluation.recommendedPrice,
          profit: evaluation.profit,
          roi: evaluation.roi,
          maxBuyPrice: evaluation.maxBuyPrice,
        },
      });
      void revalidate('analyses');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analisi non riuscita');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Vale la pena comprarlo?"
        description="Inserisci i dati del capo che vuoi comprare: ti diciamo quanto vale, quanto puoi guadagnarci e il prezzo massimo da pagare."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <form onSubmit={analyze} className="flex flex-col gap-4" noValidate>
                <Field
                  label="Nome prodotto"
                  htmlFor="a-name"
                  hint="Facoltativo, es. “Felpa Nike vintage grigia”"
                >
                  <Input
                    id="a-name"
                    value={form.name}
                    maxLength={120}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Felpa Nike vintage"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Brand" htmlFor="a-brand" error={errors.brand}>
                    <BrandInput
                      id="a-brand"
                      value={form.brand}
                      onChange={(v) => setForm({ ...form, brand: v })}
                    />
                  </Field>
                  <Field label="Categoria" htmlFor="a-cat">
                    <SimpleSelect
                      id="a-cat"
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v as ItemCategory })}
                      options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                    />
                  </Field>
                  <Field label="Condizione" htmlFor="a-cond">
                    <SimpleSelect
                      id="a-cond"
                      value={form.condition}
                      onValueChange={(v) => setForm({ ...form, condition: v as Condition })}
                      options={CONDITIONS.map((c) => ({ value: c.value, label: c.label }))}
                    />
                  </Field>
                  <Field label="Taglia" htmlFor="a-size">
                    <SimpleSelect
                      id="a-size"
                      value={form.size}
                      onValueChange={(v) => setForm({ ...form, size: v })}
                      options={SIZES.map((s) => ({ value: s, label: s }))}
                    />
                  </Field>
                </div>
                <Field label="Prezzo richiesto (€)" htmlFor="a-price" error={errors.price}>
                  <Input
                    id="a-price"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.5"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="18"
                  />
                </Field>
                <Field
                  label="Foto (opzionale)"
                  hint="Ti aiuta a ricordare il capo. Per creare l’annuncio dalle foto usa “Crea annuncio AI”."
                >
                  <ImageUploader images={photos} onChange={setPhotos} max={1} compact />
                </Field>
                <Button type="submit" size="lg" loading={loading}>
                  <ScanSearch /> ANALIZZA AFFARE
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  ROI target {bundle?.goals.targetRoi ?? 100}% · costi extra{' '}
                  {formatEUR(bundle?.settings.defaultExtraCosts ?? 1.5)} (modificabili in Impostazioni)
                </p>
              </form>
            </CardContent>
          </Card>

          {history && history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="h-4 w-4 text-muted-foreground" /> Analisi recenti
                </CardTitle>
                <CardDescription>Le tue ultime valutazioni.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {history.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-muted/30 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{h.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatEUR(h.askingPrice)} · {formatDate(h.createdAt)}
                        </p>
                      </div>
                      <DealBadge score={h.dealScore} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div id="analysis-result" className="scroll-mt-20">
          {result ? (
            <>
              {photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photos[0].dataUrl}
                  alt="Foto del capo"
                  className="mb-4 h-40 w-full rounded-2xl object-cover"
                />
              )}
              <AIAnalysis evaluation={result} />
            </>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
              <ScanSearch className="h-8 w-8 text-primary" />
              <p className="mt-3 font-semibold">Il risultato apparirà qui</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Vedrai valore di mercato, prezzo consigliato, profitto, ROI, Deal Score, tempo di vendita e il
                prezzo massimo che dovresti pagare.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeForm />
    </Suspense>
  );
}
