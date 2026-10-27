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
import { MARKETPLACES } from '@/lib/domain/constants';
import { profitBreakdown } from '@/lib/domain/finance';
import type { MarketplaceId } from '@/lib/domain/types';
import { formatEUR, formatPct } from '@/lib/format';
import { toISODate } from '@/lib/utils';
import { fieldErrors, markSoldSchema } from '@/lib/validation';

export interface MarkSoldValues {
  salePrice: number;
  extraCosts: number;
  soldAt: string;
  platform: MarketplaceId;
  purchasePrice?: number;
}

/** Dialog to record a sale; shows live profit & ROI before confirming. */
export function MarkSoldDialog({
  open,
  onOpenChange,
  itemName,
  purchasePrice,
  minDate,
  defaultPrice,
  defaultExtraCosts = 0,
  askPurchasePrice = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  itemName: string;
  purchasePrice?: number;
  minDate?: string;
  defaultPrice?: number | null;
  defaultExtraCosts?: number;
  askPurchasePrice?: boolean;
  onConfirm: (v: MarkSoldValues) => Promise<void>;
}) {
  const [form, setForm] = useState({
    salePrice: defaultPrice ? String(defaultPrice) : '',
    extraCosts: String(defaultExtraCosts),
    soldAt: toISODate(new Date()),
    platform: 'vinted',
    purchasePrice: purchasePrice !== undefined ? String(purchasePrice) : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const pp = askPurchasePrice ? Number(form.purchasePrice || 0) : (purchasePrice ?? 0);
  const preview = form.salePrice
    ? profitBreakdown(pp, Number(form.salePrice), Number(form.extraCosts || 0))
    : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = markSoldSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    if (minDate && parsed.data.soldAt < minDate)
      return setErrors({ soldAt: 'La data di vendita è precedente all’acquisto' });
    setErrors({});
    setLoading(true);
    try {
      await onConfirm({ ...parsed.data, purchasePrice: askPurchasePrice ? pp : undefined });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Segna come venduto</DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prezzo di vendita (€)" htmlFor="s-price" error={errors.salePrice}>
              <Input
                id="s-price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                autoFocus
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              />
            </Field>
            <Field
              label="Costi extra (€)"
              htmlFor="s-extra"
              error={errors.extraCosts}
              hint="Imballaggio, spedizione…"
            >
              <Input
                id="s-extra"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={form.extraCosts}
                onChange={(e) => setForm({ ...form, extraCosts: e.target.value })}
              />
            </Field>
            {askPurchasePrice && (
              <Field label="Prezzo di acquisto (€)" htmlFor="s-pp">
                <Input
                  id="s-pp"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={form.purchasePrice}
                  onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                />
              </Field>
            )}
            <Field label="Data vendita" htmlFor="s-date" error={errors.soldAt}>
              <Input
                id="s-date"
                type="date"
                min={minDate}
                max={toISODate(new Date())}
                value={form.soldAt}
                onChange={(e) => setForm({ ...form, soldAt: e.target.value })}
              />
            </Field>
            <Field label="Piattaforma" htmlFor="s-platform">
              <SimpleSelect
                id="s-platform"
                value={form.platform}
                onValueChange={(v) => setForm({ ...form, platform: v })}
                options={MARKETPLACES.map((m) => ({ value: m.value, label: m.label }))}
              />
            </Field>
          </div>
          {preview && (
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">Profitto</p>
                <p className={preview.profit >= 0 ? 'font-bold text-profit' : 'font-bold text-loss'}>
                  {formatEUR(preview.profit, { sign: true })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">ROI</p>
                <p className="font-bold">{formatPct(preview.roi)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Margine</p>
                <p className="font-bold">{formatPct(preview.margin)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" loading={loading}>
              Conferma vendita
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
