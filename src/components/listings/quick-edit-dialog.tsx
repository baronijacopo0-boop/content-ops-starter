'use client';

import { useState } from 'react';
import { toast } from 'sonner';
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
import { BrandInput } from '@/components/shared/brand-input';
import { CATEGORIES, LISTING_STATUSES } from '@/lib/domain/constants';
import type { ItemCategory, Listing, ListingInput, ListingStatus } from '@/lib/domain/types';
import { externalUrlSchema } from '@/lib/validation';
import { sanitizeText } from '@/lib/utils';

/** Edit the most-changed fields of a listing without leaving the list (title, price, brand, category, status, link). */
export function QuickEditListingDialog({
  listing,
  onOpenChange,
  onSave,
}: {
  listing: Listing;
  onOpenChange: (o: boolean) => void;
  onSave: (patch: Partial<ListingInput>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: listing.title,
    price: String(listing.price),
    brand: listing.brand,
    category: listing.category as string,
    status: listing.status as string,
    externalUrl: listing.externalUrl ?? '',
  });
  const [saving, setSaving] = useState(false);
  const statuses = LISTING_STATUSES.filter((s) => s.value !== 'sold' || listing.status === 'sold');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = sanitizeText(form.title, 120);
    const price = Number(form.price);
    if (!title) return toast.error('Il titolo non può essere vuoto');
    if (!Number.isFinite(price) || price < 0 || price > 100_000) return toast.error('Prezzo non valido');
    let externalUrl: string | null = null;
    if (form.externalUrl.trim()) {
      const parsed = externalUrlSchema.safeParse(form.externalUrl);
      if (!parsed.success) return toast.error(parsed.error.issues[0].message);
      externalUrl = parsed.data;
    }
    setSaving(true);
    try {
      const status = form.status as ListingStatus;
      await onSave({
        title,
        price,
        brand: sanitizeText(form.brand, 60),
        category: form.category as ItemCategory,
        status,
        externalUrl,
        sharedInCommunity: externalUrl ? listing.sharedInCommunity : false,
        publishedAt:
          status !== 'draft' ? (listing.publishedAt ?? new Date().toISOString()) : listing.publishedAt,
      });
      onOpenChange(false);
    } catch {
      // the caller already showed the error; keep the dialog open so nothing is lost
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica rapida</DialogTitle>
          <DialogDescription>Per foto e descrizione usa “Modifica completa”.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3" noValidate>
          <Field label="Titolo" htmlFor="qe-title" className="col-span-2">
            <Input
              id="qe-title"
              value={form.title}
              maxLength={120}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Prezzo (€)" htmlFor="qe-price">
            <Input
              id="qe-price"
              type="number"
              inputMode="decimal"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Field>
          <Field label="Stato" htmlFor="qe-status">
            <SimpleSelect
              id="qe-status"
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
              options={statuses.map((s) => ({ value: s.value, label: s.label }))}
            />
          </Field>
          <Field label="Brand" htmlFor="qe-brand">
            <BrandInput id="qe-brand" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
          </Field>
          <Field label="Categoria" htmlFor="qe-cat">
            <SimpleSelect
              id="qe-cat"
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.singular }))}
            />
          </Field>
          <Field label="Link annuncio Vinted" htmlFor="qe-url" className="col-span-2">
            <Input
              id="qe-url"
              inputMode="url"
              placeholder="https://www.vinted.it/items/…"
              value={form.externalUrl}
              onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            />
          </Field>
          <DialogFooter className="col-span-2">
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
