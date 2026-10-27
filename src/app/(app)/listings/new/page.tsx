'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Check, Copy, Loader2, Save, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/states';
import { ImageUploader } from '@/components/shared/image-uploader';
import { BrandInput } from '@/components/shared/brand-input';
import { PriceSuggestion } from '@/components/deals/price-suggestion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { useApp } from '@/components/providers/app-provider';
import { useInventory, useListings, useProfile, useRevalidate } from '@/hooks/use-data';
import { CATEGORIES, CONDITIONS, SIZES } from '@/lib/domain/constants';
import type { Condition, ItemCategory, Listing, ListingStatus } from '@/lib/domain/types';
import type { ProcessedImage } from '@/lib/image';
import { toISODate, cn } from '@/lib/utils';
import { listingSchema, firstError } from '@/lib/validation';
import { aiClient } from '@/services/ai/client';
import { estimatePrice } from '@/services/ai/pricing';
import type { DetectedField, GeneratedListing, ImageAnalysis, PriceEstimate } from '@/services/ai/types';

const NONE = '__none';
const STYLES = ['vintage', 'streetwear', 'y2k', 'sport', 'designer', 'workwear', 'outdoor', 'casual'];

interface Attrs {
  category: ItemCategory;
  brand: string;
  colors: string;
  style: string;
  material: string;
  condition: Condition | null;
  graphic: string;
  size: string;
  defects: string;
}

const EMPTY_ATTRS: Attrs = {
  category: 'hoodie',
  brand: '',
  colors: '',
  style: '',
  material: '',
  condition: null,
  graphic: '',
  size: '',
  defects: '',
};

function Confirm({ field }: { field?: DetectedField<unknown> }) {
  if (!field) return null;
  if (field.value === null) return <Badge tone="muted">non rilevato</Badge>;
  return field.needsConfirmation ? (
    <Badge tone="warning">da confermare</Badge>
  ) : (
    <Badge tone="profit">rilevato</Badge>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success(`${label} copiato`);
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error('Copia non riuscita: seleziona il testo manualmente.');
        }
      }}
    >
      {done ? <Check /> : <Copy />} COPIA
    </Button>
  );
}

function CreateListing() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get('id');
  const presetItem = params.get('item');
  const { repo } = useApp();
  const { data: bundle } = useProfile();
  const { data: listings } = useListings();
  const { data: inventory } = useInventory();
  const revalidate = useRevalidate();

  const [photos, setPhotos] = useState<ProcessedImage[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [attrs, setAttrs] = useState<Attrs>(EMPTY_ATTRS);
  const [generated, setGenerated] = useState<GeneratedListing | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);
  const [price, setPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [inventoryItemId, setInventoryItemId] = useState<string>(presetItem ?? NONE);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState<ListingStatus | null>(null);
  const [loadedEdit, setLoadedEdit] = useState(false);

  const editing: Listing | undefined = useMemo(
    () => listings?.find((l) => l.id === editId),
    [listings, editId],
  );
  const linkable = useMemo(
    () => (inventory ?? []).filter((i) => i.status !== 'sold' || i.id === editing?.inventoryItemId),
    [inventory, editing],
  );

  // Prefill when editing an existing listing or starting from an inventory item.
  useEffect(() => {
    if (loadedEdit) return;
    if (editing) {
      /* eslint-disable react-hooks/set-state-in-effect -- one-time prefill from loaded data */
      setAttrs({
        category: editing.category,
        brand: editing.brand,
        colors: editing.colors.join(', '),
        style: editing.style,
        material: editing.material,
        condition: editing.condition,
        graphic: '',
        size: editing.size,
        defects: '',
      });
      setTitle(editing.title);
      setDescription(editing.description);
      setPrice(String(editing.price));
      setExistingPhotos(editing.photos);
      setInventoryItemId(editing.inventoryItemId ?? NONE);
      setLoadedEdit(true);
    } else if (!editId && presetItem && inventory) {
      const item = inventory.find((i) => i.id === presetItem);
      if (item) {
        setAttrs({
          ...EMPTY_ATTRS,
          category: item.category,
          brand: item.brand,
          condition: item.condition,
          size: item.size,
        });
        setPurchasePrice(String(item.purchasePrice));
        setExistingPhotos(item.photos);
      }
      setLoadedEdit(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [editing, editId, presetItem, inventory, loadedEdit]);

  // Price advisor follows brand / category / condition.
  useEffect(() => {
    if (!attrs.brand.trim()) {
      setEstimate(null); // eslint-disable-line react-hooks/set-state-in-effect -- derived async estimate
      return;
    }
    let alive = true;
    const pp = purchasePrice === '' ? null : Number(purchasePrice);
    estimatePrice({
      brand: attrs.brand,
      category: attrs.category,
      condition: attrs.condition ?? 'very_good',
      size: attrs.size,
      purchasePrice: pp,
      extraCosts: bundle?.settings.defaultExtraCosts ?? 0,
    }).then((e) => {
      if (!alive) return;
      setEstimate(e);
      setPrice((p) => (p === '' ? String(e.recommended) : p));
    });
    return () => {
      alive = false;
    };
  }, [attrs.brand, attrs.category, attrs.condition, attrs.size, purchasePrice, bundle]);

  async function analyzePhotos() {
    if (!photos.length) return toast.error('Carica almeno una foto.');
    setAnalyzing(true);
    try {
      const res = await aiClient.analyzeImages({
        images: photos
          .slice(0, 4)
          .map((p) => ({ name: p.name, dataUrl: p.dataUrl, dominantColors: p.dominantColors })),
        hints: { brand: attrs.brand || undefined, size: attrs.size || undefined },
      });
      setAnalysis(res);
      setAttrs((a) => ({
        category: res.garmentType.value ?? a.category,
        brand: res.brand.value ?? a.brand,
        colors: res.colors.value?.join(', ') ?? a.colors,
        style: res.style.value ?? a.style,
        material: res.material.value ?? a.material,
        condition: res.condition.value ?? a.condition,
        graphic: res.graphic.value ?? a.graphic,
        size: res.size.value ?? a.size,
        defects: res.defects.join(', ') || a.defects,
      }));
      toast.success('Foto analizzate: controlla i campi evidenziati.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Analisi non riuscita');
    } finally {
      setAnalyzing(false);
    }
  }

  async function generate() {
    if (!attrs.brand.trim()) return toast.error('Inserisci almeno il brand.');
    setGenerating(true);
    try {
      const res = await aiClient.generateListing({
        category: attrs.category,
        brand: attrs.brand.trim(),
        colors: attrs.colors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
          .slice(0, 5),
        size: attrs.size.trim() || null,
        condition: attrs.condition,
        material: attrs.material.trim() || null,
        style: attrs.style.trim() || null,
        graphic: attrs.graphic.trim() || null,
        model: null,
        defects: attrs.defects
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
          .slice(0, 10),
      });
      setGenerated(res);
      setTitle(res.title);
      setDescription(res.description);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generazione non riuscita');
    } finally {
      setGenerating(false);
    }
  }

  async function save(status: ListingStatus) {
    if (!repo) return;
    const linkedId = inventoryItemId === NONE ? null : inventoryItemId;
    const parsed = listingSchema.safeParse({
      inventoryItemId: linkedId,
      title,
      description,
      brand: attrs.brand,
      category: attrs.category,
      size: attrs.size,
      condition: attrs.condition ?? 'very_good',
      colors: attrs.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 5),
      material: attrs.material,
      style: attrs.style,
      price: price === '' ? NaN : Number(price),
      photos: [],
      views: editing?.views ?? 0,
      favorites: editing?.favorites ?? 0,
      status,
      marketplace: 'vinted',
      publishedAt: status === 'draft' ? null : (editing?.publishedAt ?? new Date().toISOString()),
    });
    if (!parsed.success) return toast.error(firstError(parsed.error));
    setSaving(status);
    try {
      const uploaded = await Promise.all(photos.map((p) => repo.uploadImage(p.blob, p.name)));
      const data = { ...parsed.data, photos: [...existingPhotos, ...uploaded].slice(0, 8) };
      const saleStatus = status === 'sold';
      const listing = editing
        ? await repo.updateListing(editing.id, { ...data, status: saleStatus ? editing.status : status })
        : await repo.createListing({ ...data, status: saleStatus ? 'published' : status });

      const linked = linkedId ? inventory?.find((i) => i.id === linkedId) : undefined;
      if (linked && linked.status !== 'sold') {
        await repo.updateInventoryItem(linked.id, {
          listedPrice: data.price,
          status:
            status === 'draft'
              ? linked.status === 'to_photograph'
                ? 'to_list'
                : linked.status
              : status === 'reserved'
                ? 'reserved'
                : 'listed',
          photos: linked.photos.length ? linked.photos : data.photos,
        });
      }
      if (saleStatus) {
        if (linked && linked.status !== 'sold') {
          await repo.markItemSold(linked.id, {
            salePrice: data.price,
            extraCosts: bundle?.settings.defaultExtraCosts ?? 0,
            soldAt: toISODate(new Date()),
            platform: 'vinted',
          });
        } else {
          await repo.updateListing(listing.id, { status: 'sold' });
          const today = toISODate(new Date());
          await repo.createSale({
            inventoryItemId: null,
            listingId: listing.id,
            productName: data.title,
            brand: data.brand,
            category: data.category,
            purchasePrice: purchasePrice === '' ? 0 : Number(purchasePrice),
            salePrice: data.price,
            extraCosts: bundle?.settings.defaultExtraCosts ?? 0,
            purchasedAt: today,
            soldAt: today,
            platform: 'vinted',
          });
        }
      }
      await revalidate('listings', 'inventory', 'sales');
      toast.success(
        status === 'draft'
          ? 'Bozza salvata'
          : status === 'sold'
            ? 'Annuncio segnato come venduto'
            : 'Annuncio salvato come pubblicato',
      );
      router.push('/listings');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Salvataggio non riuscito');
    } finally {
      setSaving(null);
    }
  }

  const set = <K extends keyof Attrs>(k: K, v: Attrs[K]) => setAttrs((a) => ({ ...a, [k]: v }));

  return (
    <>
      <PageHeader
        title={editing ? 'Modifica annuncio' : 'Crea il tuo annuncio in pochi secondi'}
        description="Carica le foto, lascia che l’AI riconosca il capo, conferma i dettagli e ottieni titolo, descrizione e prezzo pronti da copiare."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>1 · Foto</CardTitle>
              <CardDescription>Da 1 a 8 foto. La prima sarà la copertina.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {existingPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {existingPhotos.map((src, i) => (
                    <div key={src} className="relative h-16 w-16 overflow-hidden rounded-xl border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Foto salvata ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-0.5 top-0.5 rounded-full bg-black/70 px-1 text-[10px]"
                        onClick={() => setExistingPhotos(existingPhotos.filter((x) => x !== src))}
                        aria-label="Rimuovi"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ImageUploader images={photos} onChange={setPhotos} max={8 - existingPhotos.length} />
              <Button onClick={analyzePhotos} loading={analyzing} disabled={!photos.length} size="lg">
                <Wand2 /> ANALIZZA FOTO
              </Button>
              {analysis && (
                <ul className="flex flex-col gap-1 rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
                  {analysis.notes.map((n) => (
                    <li key={n}>• {n}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2 · Dettagli del capo</CardTitle>
              <CardDescription>
                Verifica i campi “da confermare”: l’AI non inventa taglia, materiale, condizioni o
                autenticità.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Field label="Tipo di capo" htmlFor="l-cat">
                <SimpleSelect
                  id="l-cat"
                  value={attrs.category}
                  onValueChange={(v) => set('category', v as ItemCategory)}
                  options={CATEGORIES.map((c) => ({ value: c.value, label: c.singular }))}
                />
                <Confirm field={analysis?.garmentType} />
              </Field>
              <Field label="Brand" htmlFor="l-brand">
                <BrandInput id="l-brand" value={attrs.brand} onChange={(v) => set('brand', v)} />
                <Confirm field={analysis?.brand} />
              </Field>
              <Field label="Colori" htmlFor="l-colors" hint="Separati da virgola">
                <Input
                  id="l-colors"
                  value={attrs.colors}
                  onChange={(e) => set('colors', e.target.value)}
                  placeholder="grigio, bianco"
                />
                <Confirm field={analysis?.colors} />
              </Field>
              <Field label="Taglia" htmlFor="l-size">
                <SimpleSelect
                  id="l-size"
                  value={attrs.size || NONE}
                  onValueChange={(v) => set('size', v === NONE ? '' : v)}
                  options={[
                    { value: NONE, label: 'Da confermare' },
                    ...SIZES.map((s) => ({ value: s, label: s })),
                  ]}
                />
                <Confirm field={analysis?.size} />
              </Field>
              <Field label="Condizione" htmlFor="l-cond">
                <SimpleSelect
                  id="l-cond"
                  value={attrs.condition ?? NONE}
                  onValueChange={(v) => set('condition', v === NONE ? null : (v as Condition))}
                  options={[
                    { value: NONE, label: 'Da confermare' },
                    ...CONDITIONS.map((c) => ({ value: c.value, label: c.label })),
                  ]}
                />
                <Confirm field={analysis?.condition} />
              </Field>
              <Field label="Stile" htmlFor="l-style">
                <SimpleSelect
                  id="l-style"
                  value={attrs.style || NONE}
                  onValueChange={(v) => set('style', v === NONE ? '' : v)}
                  options={[
                    { value: NONE, label: '—' },
                    ...STYLES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
                  ]}
                />
                <Confirm field={analysis?.style} />
              </Field>
              <Field label="Materiale" htmlFor="l-mat" hint="Solo se scritto in etichetta">
                <Input
                  id="l-mat"
                  value={attrs.material}
                  onChange={(e) => set('material', e.target.value)}
                  placeholder="es. 100% cotone"
                />
              </Field>
              <Field label="Grafica / dettagli" htmlFor="l-graphic">
                <Input
                  id="l-graphic"
                  value={attrs.graphic}
                  onChange={(e) => set('graphic', e.target.value)}
                  placeholder="es. logo ricamato"
                />
              </Field>
              <Field
                label="Difetti visibili"
                htmlFor="l-defects"
                className="col-span-2"
                hint="Separati da virgola. Dichiararli evita resi e recensioni negative."
              >
                <Input
                  id="l-defects"
                  value={attrs.defects}
                  onChange={(e) => set('defects', e.target.value)}
                  placeholder="es. piccola macchia sul polsino"
                />
              </Field>
              <Button className="col-span-2" variant="secondary" onClick={generate} loading={generating}>
                <Sparkles /> Genera titolo e descrizione
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>3 · Annuncio</CardTitle>
                <CardDescription>
                  Titolo SEO-friendly ma naturale e descrizione pronta da copiare.
                </CardDescription>
              </div>
              {generated && (
                <Badge tone={generated.engine === 'mock' ? 'muted' : 'profit'}>
                  {generated.engine === 'mock' ? 'motore locale' : 'AI'}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {generating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Sto scrivendo l’annuncio…
                </div>
              )}
              {generated && generated.titleOptions.length > 1 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Proposte di titolo</span>
                  {generated.titleOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTitle(t)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-left text-sm transition hover:border-primary/50',
                        title === t && 'border-primary bg-primary/5',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
              <Field label="Titolo" htmlFor="l-title">
                <div className="flex gap-2">
                  <Input
                    id="l-title"
                    value={title}
                    maxLength={120}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Felpa Nike Vintage Grigia Logo Ricamato Taglia M"
                  />
                  <CopyButton text={title} label="Titolo" />
                </div>
              </Field>
              <Field label="Descrizione" htmlFor="l-desc">
                <Textarea
                  id="l-desc"
                  rows={9}
                  value={description}
                  maxLength={3000}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="La descrizione generata apparirà qui."
                />
                <div className="flex justify-end">
                  <CopyButton text={description} label="Descrizione" />
                </div>
              </Field>
              {generated && generated.warnings.length > 0 && (
                <ul className="flex flex-col gap-1 rounded-xl border border-warning/20 bg-warning/5 p-3 text-xs text-warning">
                  {generated.warnings.map((w) => (
                    <li key={w} className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4 · Price Advisor</CardTitle>
              <CardDescription>
                Tre strategie basate sui capi simili venduti. Tocca una card per usarne il prezzo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {estimate ? (
                <PriceSuggestion
                  strategies={estimate.strategies}
                  showProfit={purchasePrice !== ''}
                  onSelect={(s) => setPrice(String(s.price))}
                  selected={estimate.strategies.find((s) => String(s.price) === price)?.key}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Inserisci il brand per vedere i prezzi consigliati.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prezzo di vendita (€)" htmlFor="l-price">
                  <Input
                    id="l-price"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Field>
                <Field label="Prezzo pagato (€)" htmlFor="l-pp" hint="Facoltativo: per vedere il profitto">
                  <Input
                    id="l-pp"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </Field>
                <Field
                  label="Collega all’inventario"
                  htmlFor="l-inv"
                  className="col-span-2"
                  hint="Aggiorna stato e prezzo dell’articolo quando salvi."
                >
                  <SimpleSelect
                    id="l-inv"
                    value={inventoryItemId}
                    onValueChange={setInventoryItemId}
                    options={[
                      { value: NONE, label: 'Nessun articolo' },
                      ...linkable.map((i) => ({ value: i.id, label: `${i.name} (${i.brand})` })),
                    ]}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="sticky bottom-20 z-10 lg:bottom-4">
            <CardContent className="grid grid-cols-3 gap-2 p-3">
              <Button
                variant="outline"
                onClick={() => save('draft')}
                loading={saving === 'draft'}
                disabled={!!saving}
              >
                <Save /> Bozza
              </Button>
              <Button onClick={() => save('published')} loading={saving === 'published'} disabled={!!saving}>
                Pubblicato
              </Button>
              <Button
                variant="secondary"
                onClick={() => save('sold')}
                loading={saving === 'sold'}
                disabled={!!saving}
              >
                Venduto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense>
      <CreateListing />
    </Suspense>
  );
}
