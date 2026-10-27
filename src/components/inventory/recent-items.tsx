import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductImage } from '@/components/shared/product-image';
import { InventoryStatusBadge } from '@/components/shared/status-badges';
import type { InventoryItem } from '@/lib/domain/types';
import { calcProfit } from '@/lib/domain/finance';
import { formatEUR } from '@/lib/format';
import { cn } from '@/lib/utils';

/** "Ultimi articoli": photo, name, brand, buy price, sale price, profit, status. */
export function RecentItems({ items }: { items: InventoryItem[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Ultimi articoli</CardTitle>
        <Link href="/inventory" className="text-xs font-medium text-primary hover:underline">
          Vedi tutti
        </Link>
      </CardHeader>
      <CardContent className="px-0 sm:px-0">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nessun articolo: aggiungine uno dall’inventario.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((i) => {
              const sale = i.soldPrice ?? i.listedPrice;
              const profit = sale !== null ? calcProfit(sale, i.purchasePrice, i.extraCosts) : null;
              return (
                <li key={i.id} className="flex items-center gap-3 px-5 py-3">
                  <ProductImage
                    src={i.photos[0]}
                    alt={i.name}
                    category={i.category}
                    className="h-11 w-11 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.brand} · {formatEUR(i.purchasePrice)} → {sale !== null ? formatEUR(sale) : '—'}
                      {i.status !== 'sold' && sale !== null && (
                        <span className="text-muted-foreground/60"> (listino)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        profit === null ? 'text-muted-foreground' : profit >= 0 ? 'text-profit' : 'text-loss',
                      )}
                    >
                      {profit === null ? '—' : formatEUR(profit, { sign: true })}
                    </span>
                    <InventoryStatusBadge status={i.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
