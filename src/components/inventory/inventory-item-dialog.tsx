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
import { Input, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { BrandInput } from '@/components/shared/brand-input';
import { ImageUploader } from '@/components/shared/image-uploader';
import { useApp } from '@/components/providers/app-provider';
import { CATEGORIES, CONDITIONS, INVENTORY_STATUSES, PURCHASE_SOURCES, SIZES } from '@/lib/domain/constants';
import type { InventoryItem, InventoryItemInput } from '@/lib/domain/types';
import type { ProcessedImage } from '@/lib/image';
import { toISODate } from '@/lib/utils';
import { fieldErrors, inventoryItemSchema } from '@/lib/validation';

/** Create / edit an inventory item (all fields from the spec + photos). */
export function InventoryItemDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item?: InventoryItem | null;
  onSaved: () => void;
}) {
  const { repo } = useApp();
  const [form, setForm] = useState({
    name: item?.name ?? '',
    brand: item?.brand ?? '',
    category: item?.category ?? 'hoodie',
    size: item?.size ?? 'M',
    condition: item?.condition ?? 'very_good',
    purchasePrice: item ? String(item.purchasePrice) : '',
    purchaseDate: item?.purchaseDate ?? toISODate(new Date()),
    source: item?.source ?? 'Vinted',
    listedPrice:
      item?.listedPrice !== null && item?.listedPrice !== undefined ? String(item.listedPrice) : '',
    extraCosts: item ? String(item.extraCosts) : '0',
    status: item?.status ?? 'to_photograph',
    notes: item?.notes ?? '',
  });
  const [photos, setPhotos] = useState<string[]>(item?.photos ?? []);
  const [newPhotos, setNewPhotos] = useState<ProcessedImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isSold = item?.status === 'sold';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!repo) return;
    const parsed = inventoryItemSchema.safeParse({
      ...form,
      listedPrice: form.listedPrice === '' ? null : form.listedPrice,
      photos,
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    if (parsed.data.purchaseDate > toISODate(new Date()))
      return setErrors({ purchaseDate: 'La data non può essere nel futuro' });
    setErrors({});
    setSaving(true);
    try {
      const uploaded = await Promise.all(newPhotos.map((p) => repo.uploadImage(p.blob, p.name)));
      const data: InventoryItemInput = { ...parsed.data, photos: [...photos, ...uploaded].slice(0, 8) };
      if (item) await repo.updateInventoryItem(item.id, isSold ? { ...data, status: 'sold' } : data);
      else await repo.createInventoryItem(data);
      toast.success(item ? 'Articolo aggiornato' : 'Articolo aggiunto all’inventario');
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Salvataggio non riuscito');
    } finally {
      setSaving(false);
    }
  }

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Modifica articolo' : 'Aggiungi articolo'}</DialogTitle>
          <DialogDescription>
            Registra ogni acquisto: FLIP AI calcolerà profitto, ROI e da quanto tempo è in stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Nome" htmlFor="i-name" error={errors.name} className="col-span-2 sm:col-span-3">
              <Input
                id="i-name"
                value={form.name}
                maxLength={120}
                onChange={(e) => set('name')(e.target.value)}
                placeholder="Felpa Nike vintage grigia"
              />
            </Field>
            <Field label="Brand" htmlFor="i-brand" error={errors.brand}>
              <BrandInput id="i-brand" value={form.brand} onChange={set('brand')} />
            </Field>
            <Field label="Categoria" htmlFor="i-cat">
              <SimpleSelect
                id="i-cat"
                value={form.category}
                onValueChange={set('category')}
                options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
            </Field>
            <Field label="Taglia" htmlFor="i-size">
              <SimpleSelect
                id="i-size"
                value={form.size}
                onValueChange={set('size')}
                options={SIZES.map((s) => ({ value: s, label: s }))}
              />
            </Field>
            <Field label="Condizione" htmlFor="i-cond">
              <SimpleSelect
                id="i-cond"
                value={form.condition}
                onValueChange={set('condition')}
                options={CONDITIONS.map((c) => ({ value: c.value, label: c.label }))}
              />
            </Field>
            <Field label="Prezzo acquisto (€)" htmlFor="i-pp" error={errors.purchasePrice}>
              <Input
                id="i-pp"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={form.purchasePrice}
                onChange={(e) => set('purchasePrice')(e.target.value)}
              />
            </Field>
            <Field label="Data acquisto" htmlFor="i-date" error={errors.purchaseDate}>
              <Input
                id="i-date"
                type="date"
                max={toISODate(new Date())}
                value={form.purchaseDate}
                onChange={(e) => set('purchaseDate')(e.target.value)}
              />
            </Field>
            <Field label="Fonte" htmlFor="i-source">
              <SimpleSelect
                id="i-source"
                value={PURCHASE_SOURCES.includes(form.source) ? form.source : 'Altro'}
                onValueChange={set('source')}
                options={PURCHASE_SOURCES.map((s) => ({ value: s, label: s }))}
              />
            </Field>
            <Field label="Prezzo pubblicato (€)" htmlFor="i-listed" error={errors.listedPrice}>
              <Input
                id="i-listed"
                type="number"
                inputMode="decimal"
                min={0}
                value={form.listedPrice}
                onChange={(e) => set('listedPrice')(e.target.value)}
                placeholder="opzionale"
              />
            </Field>
            <Field
              label="Costi extra (€)"
              htmlFor="i-extra"
              error={errors.extraCosts}
              hint="Lavaggio, riparazioni, imballo…"
            >
              <Input
                id="i-extra"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={form.extraCosts}
                onChange={(e) => set('extraCosts')(e.target.value)}
              />
            </Field>
            <Field label="Stato" htmlFor="i-status">
              {isSold ? (
                <Input id="i-status" value="Venduto" disabled />
              ) : (
                <SimpleSelect
                  id="i-status"
                  value={form.status}
                  onValueChange={set('status')}
                  options={INVENTORY_STATUSES.filter((s) => s.value !== 'sold').map((s) => ({
                    value: s.value,
                    label: s.label,
                  }))}
                />
              )}
            </Field>
            <Field label="Note" htmlFor="i-notes" className="col-span-2 sm:col-span-3">
              <Textarea
                id="i-notes"
                rows={2}
                maxLength={1000}
                value={form.notes}
                onChange={(e) => set('notes')(e.target.value)}
              />
            </Field>
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((src, i) => (
                <div key={src} className="relative h-14 w-14 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((p) => p !== src))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/70 px-1 text-[10px]"
                    aria-label="Rimuovi foto"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <ImageUploader images={newPhotos} onChange={setNewPhotos} max={8 - photos.length} compact />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" loading={saving}>
              {item ? 'Salva modifiche' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
