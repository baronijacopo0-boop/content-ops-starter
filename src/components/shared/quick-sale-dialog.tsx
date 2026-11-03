'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { MarkSoldDialog } from '@/components/shared/mark-sold-dialog';
import { ProductImage } from '@/components/shared/product-image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useApp } from '@/components/providers/app-provider';
import { useInventory, useProfile, useRevalidate } from '@/hooks/use-data';
import type { InventoryItem } from '@/lib/domain/types';
import { formatEUR } from '@/lib/format';

/**
 * "Registra vendita" in two taps from anywhere: pick the unsold item, confirm price.
 * The sale, the inventory status and any linked listing are updated together.
 */
export function QuickSaleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { repo } = useApp();
  const { data: items } = useInventory();
  const { data: bundle } = useProfile();
  const revalidate = useRevalidate();
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<InventoryItem | null>(null);
  const unsold = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (
      (items ?? [])
        .filter((i) => i.status !== 'sold')
        .filter((i) => !t || `${i.name} ${i.brand}`.toLowerCase().includes(t))
        // Listed items first: they are the ones most likely to have just sold.
        .sort((a, b) => Number(b.status === 'listed') - Number(a.status === 'listed'))
    );
  }, [items, q]);

  return (
    <>
      <Dialog open={open && !picked} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registra vendita</DialogTitle>
            <DialogDescription>Quale articolo hai venduto?</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cerca per nome o brand…"
              value={q}
              autoFocus
              onChange={(e) => setQ(e.target.value)}
              aria-label="Cerca articolo venduto"
            />
          </div>
          <ul className="-mx-1 max-h-80 overflow-y-auto" data-testid="quick-sale-list">
            {unsold.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                Nessun articolo da vendere.{' '}
                <Link
                  href="/inventory"
                  className="text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Aggiungine uno all’inventario
                </Link>
              </li>
            )}
            {unsold.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-accent"
                  onClick={() => setPicked(i)}
                >
                  <ProductImage
                    src={i.photos[0]}
                    alt={i.name}
                    category={i.category}
                    className="h-10 w-10 shrink-0"
                    rounded="rounded-lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{i.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {i.brand} · pagato {formatEUR(i.purchasePrice)}
                      {i.listedPrice ? ` · in vendita a ${formatEUR(i.listedPrice)}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
        </DialogContent>
      </Dialog>

      {picked && (
        <MarkSoldDialog
          key={picked.id}
          open
          onOpenChange={(o) => {
            if (!o) {
              setPicked(null);
              onOpenChange(false);
            }
          }}
          itemName={`${picked.name} · pagato ${formatEUR(picked.purchasePrice)}`}
          purchasePrice={picked.purchasePrice}
          minDate={picked.purchaseDate}
          defaultPrice={picked.listedPrice}
          defaultExtraCosts={picked.extraCosts || bundle?.settings.defaultExtraCosts}
          onConfirm={async (v) => {
            if (!repo) return;
            try {
              await repo.markItemSold(picked.id, v);
              await revalidate('inventory', 'sales', 'listings');
              toast.success('Vendita registrata 🎉');
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Errore');
              throw e;
            }
          }}
        />
      )}
    </>
  );
}
