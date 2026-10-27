'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { CardGridSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/shared/states';
import { ListingCard } from '@/components/listings/listing-card';
import { MarkSoldDialog } from '@/components/shared/mark-sold-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/components/providers/app-provider';
import { useInventory, useListings, useProfile, useRevalidate } from '@/hooks/use-data';
import type { Listing, ListingInput } from '@/lib/domain/types';
import { uid } from '@/lib/utils';

type Filter = 'all' | 'active' | 'sold' | 'draft';
const FILTERS: { value: Filter; label: string; match: (l: Listing) => boolean }[] = [
  { value: 'all', label: 'Tutti', match: () => true },
  { value: 'active', label: 'Attivi', match: (l) => l.status === 'published' || l.status === 'reserved' },
  { value: 'sold', label: 'Venduti', match: (l) => l.status === 'sold' },
  { value: 'draft', label: 'Bozze', match: (l) => l.status === 'draft' },
];

export default function ListingsPage() {
  const router = useRouter();
  const { repo } = useApp();
  const { data: listings, error, isLoading, mutate } = useListings();
  const { data: inventory } = useInventory();
  const { data: bundle } = useProfile();
  const revalidate = useRevalidate();
  const [filter, setFilter] = useState<Filter>('all');
  const [selling, setSelling] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState<Listing | null>(null);

  const visible = useMemo(
    () => (listings ?? []).filter(FILTERS.find((f) => f.value === filter)!.match),
    [listings, filter],
  );
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.value, (listings ?? []).filter(f.match).length])),
    [listings],
  );
  const linkedItem = selling?.inventoryItemId
    ? inventory?.find((i) => i.id === selling.inventoryItemId && i.status !== 'sold')
    : undefined;

  async function duplicate(l: Listing) {
    if (!repo) return;
    // Optimistic UI: show the copy immediately, then sync.
    const input: ListingInput = {
      inventoryItemId: null,
      title: `${l.title} (copia)`.slice(0, 120),
      description: l.description,
      brand: l.brand,
      category: l.category,
      size: l.size,
      condition: l.condition,
      colors: l.colors,
      material: l.material,
      style: l.style,
      price: l.price,
      photos: l.photos,
      views: 0,
      favorites: 0,
      status: 'draft',
      marketplace: l.marketplace,
      publishedAt: null,
    };
    const temp: Listing = {
      ...input,
      id: `temp-${uid()}`,
      userId: l.userId,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    };
    try {
      await mutate(async (current) => [await repo.createListing(input), ...(current ?? [])], {
        optimisticData: (current) => [temp, ...(current ?? [])],
        rollbackOnError: true,
        revalidate: false,
      });
      toast.success('Annuncio duplicato come bozza');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore');
    }
  }

  return (
    <>
      <PageHeader
        title="I miei annunci"
        description="Tutti i tuoi annunci, dalle bozze ai venduti."
        actions={
          <Button asChild>
            <Link href="/listings/new">
              <Sparkles /> Crea annuncio AI
            </Link>
          </Button>
        }
      />
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-4">
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label} <span className="text-muted-foreground">{counts[f.value] ?? 0}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !listings ? (
        <CardGridSkeleton count={8} className="xl:grid-cols-4" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={filter === 'all' ? 'Nessun annuncio ancora' : 'Nessun annuncio in questa sezione'}
          description="Crea il tuo primo annuncio: carica le foto e l’AI scrive titolo e descrizione."
          action={
            <Button asChild>
              <Link href="/listings/new">Crea annuncio AI</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onEdit={() => router.push(`/listings/new?id=${l.id}`)}
              onDuplicate={() => duplicate(l)}
              onSold={() => setSelling(l)}
              onDelete={() => setDeleting(l)}
            />
          ))}
        </div>
      )}

      {selling && (
        <MarkSoldDialog
          key={selling.id}
          open
          onOpenChange={(o) => !o && setSelling(null)}
          itemName={selling.title}
          defaultPrice={selling.price}
          defaultExtraCosts={bundle?.settings.defaultExtraCosts}
          purchasePrice={linkedItem?.purchasePrice}
          minDate={linkedItem?.purchaseDate}
          askPurchasePrice={!linkedItem}
          onConfirm={async (v) => {
            if (!repo) return;
            try {
              if (linkedItem) {
                await repo.markItemSold(linkedItem.id, v);
              } else {
                await repo.updateListing(selling.id, { status: 'sold' });
                await repo.createSale({
                  inventoryItemId: null,
                  listingId: selling.id,
                  productName: selling.title,
                  brand: selling.brand,
                  category: selling.category,
                  purchasePrice: v.purchasePrice ?? 0,
                  salePrice: v.salePrice,
                  extraCosts: v.extraCosts,
                  purchasedAt: v.soldAt,
                  soldAt: v.soldAt,
                  platform: v.platform,
                });
              }
              await revalidate('listings', 'inventory', 'sales');
              toast.success('Vendita registrata 🎉');
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Errore');
              throw e;
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Eliminare l’annuncio?"
        description={`“${deleting?.title}” verrà eliminato. L’articolo in inventario e le vendite registrate restano.`}
        onConfirm={async () => {
          if (!repo || !deleting) return;
          const id = deleting.id;
          try {
            await mutate(
              async (current) => {
                await repo.deleteListing(id);
                return (current ?? []).filter((l) => l.id !== id);
              },
              {
                optimisticData: (current) => (current ?? []).filter((l) => l.id !== id),
                rollbackOnError: true,
                revalidate: false,
              },
            );
            toast.success('Annuncio eliminato');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Errore');
          }
        }}
      />
    </>
  );
}
