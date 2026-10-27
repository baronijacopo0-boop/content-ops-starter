'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BrandInput } from '@/components/shared/brand-input';
import { CATEGORIES, CONDITIONS, SIZES } from '@/lib/domain/constants';
import type { Watchlist, WatchlistInput } from '@/lib/domain/types';
import { fieldErrors, watchlistSchema } from '@/lib/validation';

const ANY = '__any';
const str = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v));
const nul = (v: string) => (v.trim() === '' ? null : v);

export function WatchlistDialog({
  open,
  onOpenChange,
  watchlist,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  watchlist?: Watchlist | null;
  onSave: (input: WatchlistInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: watchlist?.name ?? '',
    query: watchlist?.query ?? '',
    brand: watchlist?.brand ?? '',
    category: watchlist?.category ?? ANY,
    size: watchlist?.size ?? ANY,
    condition: watchlist?.condition ?? ANY,
    maxPrice: str(watchlist?.maxPrice),
    minRoi: str(watchlist?.minRoi),
    minDealScore: str(watchlist?.minDealScore),
    notify: watchlist?.notify ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = watchlistSchema.safeParse({
      name: form.name,
      query: form.query,
      brand: nul(form.brand),
      category: form.category === ANY ? null : form.category,
      size: form.size === ANY ? null : form.size,
      condition: form.condition === ANY ? null : form.condition,
      maxPrice: nul(form.maxPrice),
      minRoi: nul(form.minRoi),
      minDealScore: nul(form.minDealScore),
      notify: form.notify,
      isActive: watchlist?.isActive ?? true,
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSaving(true);
    try {
      await onSave(parsed.data);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{watchlist ? 'Modifica watchlist' : 'Nuova watchlist'}</DialogTitle>
          <DialogDescription>
            Salva una ricerca: ti mostreremo le occasioni che la rispettano.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome" htmlFor="w-name" error={errors.name} className="col-span-2">
              <Input
                id="w-name"
                value={form.name}
                maxLength={80}
                onChange={(e) => set('name')(e.target.value)}
                placeholder="Nike Vintage < €15"
              />
            </Field>
            <Field label="Parole chiave" htmlFor="w-query">
              <Input
                id="w-query"
                value={form.query}
                maxLength={120}
                onChange={(e) => set('query')(e.target.value)}
                placeholder="vintage"
              />
            </Field>
            <Field label="Brand" htmlFor="w-brand">
              <BrandInput id="w-brand" value={form.brand} onChange={set('brand')} />
            </Field>
            <Field label="Categoria" htmlFor="w-cat">
              <SimpleSelect
                id="w-cat"
                value={form.category}
                onValueChange={set('category')}
                options={[
                  { value: ANY, label: 'Qualsiasi' },
                  ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
                ]}
              />
            </Field>
            <Field label="Taglia" htmlFor="w-size">
              <SimpleSelect
                id="w-size"
                value={form.size}
                onValueChange={set('size')}
                options={[{ value: ANY, label: 'Qualsiasi' }, ...SIZES.map((s) => ({ value: s, label: s }))]}
              />
            </Field>
            <Field label="Condizione" htmlFor="w-cond">
              <SimpleSelect
                id="w-cond"
                value={form.condition}
                onValueChange={set('condition')}
                options={[
                  { value: ANY, label: 'Qualsiasi' },
                  ...CONDITIONS.map((c) => ({ value: c.value, label: c.label })),
                ]}
              />
            </Field>
            <Field label="Prezzo massimo (€)" htmlFor="w-max" error={errors.maxPrice}>
              <Input
                id="w-max"
                type="number"
                min={0}
                inputMode="decimal"
                value={form.maxPrice}
                onChange={(e) => set('maxPrice')(e.target.value)}
                placeholder="15"
              />
            </Field>
            <Field label="ROI minimo (%)" htmlFor="w-roi" error={errors.minRoi}>
              <Input
                id="w-roi"
                type="number"
                min={0}
                value={form.minRoi}
                onChange={(e) => set('minRoi')(e.target.value)}
                placeholder="100"
              />
            </Field>
            <Field label="Deal Score minimo" htmlFor="w-score" error={errors.minDealScore}>
              <Input
                id="w-score"
                type="number"
                min={0}
                max={100}
                value={form.minDealScore}
                onChange={(e) => set('minDealScore')(e.target.value)}
                placeholder="70"
              />
            </Field>
          </div>
          <label className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2.5 text-sm">
            Avvisami quando arriva un match
            <Switch checked={form.notify} onCheckedChange={(v) => setForm((f) => ({ ...f, notify: v }))} />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" loading={saving}>
              Salva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
