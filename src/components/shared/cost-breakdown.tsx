'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { EMPTY_COSTS, platformFee, totalExtraCosts, type CostBreakdown } from '@/lib/domain/finance';
import { formatEUR } from '@/lib/format';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'rivendo:cost-breakdown';
const FIELDS: { key: keyof CostBreakdown; label: string; hint?: string; step: string }[] = [
  { key: 'packaging', label: 'Imballaggio (€)', step: '0.1' },
  {
    key: 'shipping',
    label: 'Spedizione (€)',
    hint: 'Solo se a tuo carico (su Vinted di solito paga chi compra)',
    step: '0.5',
  },
  { key: 'feePct', label: 'Commissione (%)', hint: 'es. eBay ~13%, Vinted 0% per chi vende', step: '0.5' },
  { key: 'feeFixed', label: 'Commissione fissa (€)', step: '0.05' },
  { key: 'other', label: 'Altro (€)', hint: 'Lavaggio, riparazioni…', step: '0.5' },
];

type Raw = Record<keyof CostBreakdown, string>;
const toRaw = (c: CostBreakdown): Raw =>
  Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v ? String(v) : ''])) as Raw;
const num = (v: string) => (v === '' || Number.isNaN(Number(v)) ? 0 : Math.max(0, Number(v)));

function load(): { detailed: boolean; costs: CostBreakdown } {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const saved = JSON.parse(raw) as Partial<CostBreakdown>;
      return { detailed: true, costs: { ...EMPTY_COSTS, ...saved } };
    }
  } catch {
    /* storage unavailable: start empty */
  }
  return { detailed: false, costs: EMPTY_COSTS };
}

/** State for an itemised extra-costs editor; the last breakdown used is remembered on this device. */
export function useCostBreakdown(opts: { persist?: boolean; initial?: CostBreakdown } = {}) {
  const persist = opts.persist ?? true;
  const [initial] = useState(() =>
    persist ? load() : { detailed: true, costs: opts.initial ?? EMPTY_COSTS },
  );
  const [detailed, setDetailed] = useState(initial.detailed);
  const [raw, setRaw] = useState<Raw>(toRaw(initial.costs));
  const costs: CostBreakdown = {
    packaging: num(raw.packaging),
    shipping: num(raw.shipping),
    feePct: Math.min(100, num(raw.feePct)),
    feeFixed: num(raw.feeFixed),
    other: num(raw.other),
  };
  return {
    detailed,
    setDetailed,
    raw,
    setField: (k: keyof CostBreakdown, v: string) => setRaw((r) => ({ ...r, [k]: v })),
    costs,
    total: (salePrice: number) => totalExtraCosts(salePrice, costs),
    remember: () => {
      if (!persist) return;
      try {
        if (detailed) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(costs));
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
  };
}

export type CostBreakdownState = ReturnType<typeof useCostBreakdown>;

export function CostBreakdownFields({
  state,
  salePrice,
  idPrefix,
  collapsible = true,
}: {
  state: CostBreakdownState;
  salePrice: number;
  idPrefix: string;
  collapsible?: boolean;
}) {
  const fee = platformFee(salePrice, state.costs);
  if (!collapsible) return <Fields state={state} salePrice={salePrice} idPrefix={idPrefix} fee={fee} />;
  return (
    <div className="rounded-xl border">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
        aria-expanded={state.detailed}
        onClick={() => state.setDetailed(!state.detailed)}
      >
        Dettaglia costi extra
        <ChevronDown className={cn('h-4 w-4 transition', state.detailed && 'rotate-180')} />
      </button>
      {state.detailed && (
        <div className="border-t p-3">
          <Fields state={state} salePrice={salePrice} idPrefix={idPrefix} fee={fee} />
        </div>
      )}
    </div>
  );
}

function Fields({
  state,
  salePrice,
  idPrefix,
  fee,
}: {
  state: CostBreakdownState;
  salePrice: number;
  idPrefix: string;
  fee: number;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`${idPrefix}-${f.key}`} hint={f.hint}>
            <Input
              id={`${idPrefix}-${f.key}`}
              type="number"
              inputMode="decimal"
              min={0}
              step={f.step}
              value={state.raw[f.key]}
              onChange={(e) => state.setField(f.key, e.target.value)}
            />
          </Field>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Commissioni: {formatEUR(fee)} · Totale costi extra:{' '}
        <span className="font-semibold text-foreground">{formatEUR(state.total(salePrice))}</span>
      </p>
    </div>
  );
}
