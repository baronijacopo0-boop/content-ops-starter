'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, RotateCcw, Search, SlidersHorizontal, Star } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { DealCard } from '@/components/deals/deal-card';
import { AIAnalysis } from '@/components/deals/ai-analysis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { useApp } from '@/components/providers/app-provider';
import { useProfile, useRevalidate } from '@/hooks/use-data';
import { useDealFeed } from '@/hooks/use-deal-feed';
import { CATEGORIES, CONDITIONS, SIZES } from '@/lib/domain/constants';
import type { Condition, ItemCategory } from '@/lib/domain/types';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  filterDeals,
  SORT_OPTIONS,
  sortDeals,
  type DealFilters,
  type DealSort,
  type EvaluatedDeal,
} from '@/lib/deals/filter';
import { getMarketplaceProvider } from '@/lib/marketplace';
import { toISODate } from '@/lib/utils';

const ALL = '__all';
const numOrNull = (v: string) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v));

function FiltersForm({
  filters,
  set,
  brands,
}: {
  filters: DealFilters;
  set: (f: DealFilters) => void;
  brands: string[];
}) {
  const sel = (v: string | null) => v ?? ALL;
  const val = (v: string) => (v === ALL ? null : v);
  const num = (key: keyof DealFilters, label: string, placeholder: string, hint?: string) => (
    <Field label={label} htmlFor={`f-${key}`} hint={hint}>
      <Input
        id={`f-${key}`}
        type="number"
        inputMode="decimal"
        min={0}
        placeholder={placeholder}
        value={(filters[key] as number | null) ?? ''}
        onChange={(e) => set({ ...filters, [key]: numOrNull(e.target.value) })}
      />
    </Field>
  );
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <Field label="Brand" htmlFor="f-brand">
        <SimpleSelect
          id="f-brand"
          value={sel(filters.brand)}
          onValueChange={(v) => set({ ...filters, brand: val(v) })}
          options={[{ value: ALL, label: 'Tutti i brand' }, ...brands.map((b) => ({ value: b, label: b }))]}
        />
      </Field>
      <Field label="Categoria" htmlFor="f-cat">
        <SimpleSelect
          id="f-cat"
          value={sel(filters.category)}
          onValueChange={(v) => set({ ...filters, category: val(v) as ItemCategory | null })}
          options={[
            { value: ALL, label: 'Tutte' },
            ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          ]}
        />
      </Field>
      <Field label="Taglia" htmlFor="f-size">
        <SimpleSelect
          id="f-size"
          value={sel(filters.size)}
          onValueChange={(v) => set({ ...filters, size: val(v) })}
          options={[{ value: ALL, label: 'Tutte' }, ...SIZES.map((s) => ({ value: s, label: s }))]}
        />
      </Field>
      <Field label="Condizione" htmlFor="f-cond">
        <SimpleSelect
          id="f-cond"
          value={sel(filters.condition)}
          onValueChange={(v) => set({ ...filters, condition: val(v) as Condition | null })}
          options={[
            { value: ALL, label: 'Tutte' },
            ...CONDITIONS.map((c) => ({ value: c.value, label: c.label })),
          ]}
        />
      </Field>
      {num('maxPrice', 'Prezzo massimo (€)', 'es. 30')}
      {num('minProfit', 'Profitto minimo (€)', 'es. 10')}
      {num('minRoi', 'ROI minimo (%)', 'es. 100')}
      {num('minScore', 'Deal Score minimo', 'es. 70')}
      {num('maxDays', 'Max giorni vendita', 'es. 20')}
    </div>
  );
}

export default function DealsPage() {
  const router = useRouter();
  const { data: deals, error, isLoading, mutate } = useDealFeed();
  const { data: bundle } = useProfile();
  const { repo } = useApp();
  const revalidate = useRevalidate();
  const [filters, setFilters] = useState<DealFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<DealSort>('score');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [selected, setSelected] = useState<EvaluatedDeal | null>(null);

  const favorites = useMemo(() => bundle?.profile.favoriteBrands ?? [], [bundle]);
  const brands = useMemo(() => Array.from(new Set((deals ?? []).map((d) => d.item.brand))).sort(), [deals]);
  const visible = useMemo(
    () => (deals ? sortDeals(filterDeals(deals, filters, favorites), sort) : []),
    [deals, filters, sort, favorites],
  );
  const count = activeFilterCount(filters);
  const hot = deals?.filter((d) => d.evaluation.badge === 'hot').length ?? 0;
  const isMock = getMarketplaceProvider().capabilities.isMock;

  async function addToInventory(d: EvaluatedDeal) {
    if (!repo) return;
    try {
      await repo.createInventoryItem({
        name: d.item.title,
        brand: d.item.brand,
        category: d.item.category,
        size: d.item.size,
        condition: d.item.condition,
        purchasePrice: d.item.price,
        purchaseDate: toISODate(new Date()),
        source: 'Vinted',
        listedPrice: d.evaluation.recommendedPrice,
        extraCosts: 0,
        status: 'to_photograph',
        photos: [],
        notes: `Deal Score ${d.evaluation.dealScore} · prezzo consigliato €${d.evaluation.recommendedPrice}`,
      });
      await revalidate('inventory');
      toast.success('Aggiunto all’inventario', {
        action: { label: 'Apri', onClick: () => router.push('/inventory') },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore');
    }
  }

  return (
    <>
      <PageHeader
        title="Trova il prossimo affare"
        description="Occasioni valutate con il Deal Score: prezzo vs mercato, domanda del brand, ROI, velocità di vendita, condizione e taglia."
        actions={
          <Badge tone={isMock ? 'warning' : 'profit'} className="py-1">
            {isMock ? 'Dati demo · MockVintedProvider' : 'Dati marketplace'}
          </Badge>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cerca per titolo, brand o modello…"
              value={filters.text}
              onChange={(e) => setFilters({ ...filters, text: e.target.value })}
              aria-label="Cerca"
            />
          </div>
          <SimpleSelect
            className="hidden w-48 sm:flex"
            value={sort}
            onValueChange={(v) => setSort(v as DealSort)}
            options={SORT_OPTIONS}
            ariaLabel="Ordina per"
          />
          <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters(true)}>
            <SlidersHorizontal /> Filtri {count > 0 && <Badge tone="profit">{count}</Badge>}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SimpleSelect
            className="w-full sm:hidden"
            value={sort}
            onValueChange={(v) => setSort(v as DealSort)}
            options={SORT_OPTIONS}
            ariaLabel="Ordina per"
          />
          {favorites.length > 0 && (
            <Button
              variant={filters.favoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })}
            >
              <Star /> Solo i miei brand
            </Button>
          )}
          <Button
            variant={filters.minScore === 80 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, minScore: filters.minScore === 80 ? null : 80 })}
          >
            <Flame /> Solo Hot Deal ({hot})
          </Button>
          {count > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              <RotateCcw /> Azzera filtri
            </Button>
          )}
        </div>
        <div className="card-surface hidden p-4 lg:block">
          <FiltersForm filters={filters} set={setFilters} brands={brands} />
        </div>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !deals ? (
        <CardGridSkeleton count={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nessun affare con questi filtri"
          description="Prova ad allargare i filtri o salva la ricerca in Watchlist per tenerla d’occhio."
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                Azzera filtri
              </Button>
              <Button asChild>
                <Link href="/watchlist">Crea watchlist</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            {visible.length} occasioni · ordinate per{' '}
            {SORT_OPTIONS.find((s) => s.value === sort)?.label.toLowerCase()}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((d) => (
              <DealCard
                key={d.item.id}
                item={d.item}
                evaluation={d.evaluation}
                onAnalyze={() => setSelected(d)}
                onAddToInventory={() => addToInventory(d)}
              />
            ))}
          </div>
        </>
      )}

      <Dialog open={mobileFilters} onOpenChange={setMobileFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtri</DialogTitle>
            <DialogDescription>Restringi le occasioni a quelle adatte a te.</DialogDescription>
          </DialogHeader>
          <FiltersForm filters={filters} set={setFilters} brands={brands} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setFilters(EMPTY_FILTERS)}>
              Azzera
            </Button>
            <Button className="flex-1" onClick={() => setMobileFilters(false)}>
              Mostra risultati
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.item.title}</DialogTitle>
                <DialogDescription>
                  {selected.item.brand} · Tg {selected.item.size} · venduto da {selected.item.sellerName}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selected.item.description}</p>
              <AIAnalysis evaluation={selected.evaluation} />
              <Button
                onClick={() => {
                  void addToInventory(selected);
                  setSelected(null);
                }}
              >
                L’ho comprato: aggiungi all’inventario
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
