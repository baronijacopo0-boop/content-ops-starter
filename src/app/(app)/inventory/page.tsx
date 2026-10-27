'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, ErrorState, PageHeader } from '@/components/shared/states';
import { InventoryHealth } from '@/components/inventory/inventory-health';
import { InventoryItemDialog } from '@/components/inventory/inventory-item-dialog';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { MarkSoldDialog } from '@/components/shared/mark-sold-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { MiniStat } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SimpleSelect } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/components/providers/app-provider';
import { useInventory, useProfile, useRevalidate } from '@/hooks/use-data';
import { INVENTORY_STATUSES } from '@/lib/domain/constants';
import { inventoryHealth, stockAgeBadge, stockAgeDays } from '@/lib/domain/stock';
import type { InventoryItem, InventoryStatus } from '@/lib/domain/types';
import { formatEUR } from '@/lib/format';

type AgeFilter = 'all' | 'new' | 'normal' | 'slow' | 'old';
const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
  { value: 'all', label: 'Qualsiasi età' },
  { value: 'new', label: 'NEW (0-14g)' },
  { value: 'normal', label: 'NORMAL (15-30g)' },
  { value: 'slow', label: 'SLOW (31-60g)' },
  { value: 'old', label: 'OLD STOCK (60g+)' },
];
const AGE_MAP = { NEW: 'new', NORMAL: 'normal', SLOW: 'slow', 'OLD STOCK': 'old' } as const;

function InventoryView() {
  const router = useRouter();
  const params = useSearchParams();
  const { repo } = useApp();
  const { data: items, error, isLoading, mutate } = useInventory();
  const { data: bundle } = useProfile();
  const revalidate = useRevalidate();
  const [status, setStatus] = useState<InventoryStatus | 'all'>('all');
  const [age, setAge] = useState<AgeFilter>(
    (AGE_OPTIONS.find((a) => a.value === params.get('age'))?.value ?? 'all') as AgeFilter,
  );
  const [text, setText] = useState('');
  const [editing, setEditing] = useState<InventoryItem | null | undefined>(undefined);
  const [selling, setSelling] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);

  const health = useMemo(() => inventoryHealth(items ?? []), [items]);
  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    return (items ?? []).filter((i) => {
      if (status !== 'all' && i.status !== status) return false;
      if (q && !`${i.name} ${i.brand}`.toLowerCase().includes(q)) return false;
      if (age !== 'all' && (i.status === 'sold' || AGE_MAP[stockAgeBadge(stockAgeDays(i))] !== age))
        return false;
      return true;
    });
  }, [items, status, text, age]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        INVENTORY_STATUSES.map((s) => [s.value, (items ?? []).filter((i) => i.status === s.value).length]),
      ),
    [items],
  );

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Tutto quello che hai comprato, con stato, stock age, profitto e ROI calcolati in automatico."
        actions={
          <Button onClick={() => setEditing(null)}>
            <Plus /> Aggiungi articolo
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !items ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <Card>
              <CardContent className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
                <MiniStat label="Articoli in stock" value={health.total} />
                <MiniStat
                  label="Capitale in stock"
                  value={formatEUR(health.totalValue, { decimals: false })}
                  info="Quanto hai pagato per gli articoli non ancora venduti (inclusi costi extra)."
                />
                <MiniStat
                  label="Valore a listino"
                  value={formatEUR(health.listedValue, { decimals: false })}
                  tone="profit"
                  info="Quanto incasseresti vendendo tutto ai prezzi pubblicati."
                />
                <MiniStat
                  label="Da pubblicare"
                  value={(counts.to_photograph ?? 0) + (counts.to_list ?? 0)}
                  tone="warning"
                  info="Articoli non ancora online: non possono vendere finché non li pubblichi."
                />
              </CardContent>
            </Card>
            <div className="lg:row-span-2">
              <InventoryHealth health={health} />
            </div>
            <div className="flex flex-col gap-3">
              <Tabs value={status} onValueChange={(v) => setStatus(v as InventoryStatus | 'all')}>
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all">Tutti {items.length}</TabsTrigger>
                  {INVENTORY_STATUSES.map((s) => (
                    <TabsTrigger key={s.value} value={s.value}>
                      {s.label} {counts[s.value] ?? 0}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Cerca per nome o brand…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    aria-label="Cerca nell’inventario"
                  />
                </div>
                <SimpleSelect
                  className="w-44"
                  value={age}
                  onValueChange={(v) => setAge(v as AgeFilter)}
                  options={AGE_OPTIONS}
                  ariaLabel="Filtra per età"
                />
              </div>
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={Package}
              title={items.length === 0 ? 'Il tuo inventario è vuoto' : 'Nessun articolo con questi filtri'}
              description={
                items.length === 0
                  ? 'Aggiungi il primo acquisto o salvalo direttamente dal Deal Finder.'
                  : 'Prova a cambiare stato, età o ricerca.'
              }
              action={
                items.length === 0 ? (
                  <Button onClick={() => setEditing(null)}>
                    <Plus /> Aggiungi articolo
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <InventoryTable
              items={visible}
              actions={{
                onEdit: (i) => setEditing(i),
                onSell: (i) => setSelling(i),
                onList: (i) => router.push(`/listings/new?item=${i.id}`),
                onDelete: (i) => setDeleting(i),
              }}
            />
          )}
        </div>
      )}

      {editing !== undefined && (
        <InventoryItemDialog
          key={editing?.id ?? 'new'}
          open
          onOpenChange={(o) => !o && setEditing(undefined)}
          item={editing}
          onSaved={() => revalidate('inventory', 'listings')}
        />
      )}

      {selling && (
        <MarkSoldDialog
          key={selling.id}
          open
          onOpenChange={(o) => !o && setSelling(null)}
          itemName={`${selling.name} · pagato ${formatEUR(selling.purchasePrice)}`}
          purchasePrice={selling.purchasePrice}
          minDate={selling.purchaseDate}
          defaultPrice={selling.listedPrice}
          defaultExtraCosts={selling.extraCosts || bundle?.settings.defaultExtraCosts}
          onConfirm={async (v) => {
            if (!repo) return;
            try {
              await repo.markItemSold(selling.id, v);
              await revalidate('inventory', 'sales', 'listings');
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
        title="Eliminare l’articolo?"
        description={`“${deleting?.name}” verrà rimosso dall’inventario. Eventuali vendite registrate restano nello storico.`}
        onConfirm={async () => {
          if (!repo || !deleting) return;
          const id = deleting.id;
          try {
            await mutate(
              async (current) => {
                await repo.deleteInventoryItem(id);
                return (current ?? []).filter((i) => i.id !== id);
              },
              {
                optimisticData: (current) => (current ?? []).filter((i) => i.id !== id),
                rollbackOnError: true,
                revalidate: false,
              },
            );
            void revalidate('listings', 'sales');
            toast.success('Articolo eliminato');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Errore');
          }
        }}
      />
    </>
  );
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryView />
    </Suspense>
  );
}
