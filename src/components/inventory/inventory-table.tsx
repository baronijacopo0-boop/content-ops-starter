'use client';

import { MoreVertical, Pencil, Receipt, Sparkles, Trash2 } from 'lucide-react';
import { ProductImage } from '@/components/shared/product-image';
import { InventoryStatusBadge, StockAgeBadge } from '@/components/shared/status-badges';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categoryLabel, CONDITIONS } from '@/lib/domain/constants';
import { calcProfit, calcRoi } from '@/lib/domain/finance';
import { stockAgeDays } from '@/lib/domain/stock';
import type { InventoryItem } from '@/lib/domain/types';
import { formatDate, formatEUR, formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface InventoryActions {
  onEdit: (i: InventoryItem) => void;
  onSell: (i: InventoryItem) => void;
  onList: (i: InventoryItem) => void;
  onDelete: (i: InventoryItem) => void;
}

function rowNumbers(i: InventoryItem) {
  const sale = i.soldPrice;
  const profit = sale !== null ? calcProfit(sale, i.purchasePrice, i.extraCosts) : null;
  return { profit, roi: profit !== null ? calcRoi(profit, i.purchasePrice) : null, age: stockAgeDays(i) };
}

function Actions({ item, a }: { item: InventoryItem; a: InventoryActions }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Azioni per ${item.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => a.onEdit(item)}>
          <Pencil /> Modifica
        </DropdownMenuItem>
        {item.status !== 'sold' && (
          <>
            <DropdownMenuItem onSelect={() => a.onList(item)}>
              <Sparkles /> Crea annuncio AI
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => a.onSell(item)}>
              <Receipt /> Segna come venduto
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => a.onDelete(item)}>
          <Trash2 /> Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Desktop: full table · Mobile: compact cards. */
export function InventoryTable({ items, actions }: { items: InventoryItem[]; actions: InventoryActions }) {
  return (
    <>
      <div className="card-surface hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px] text-sm" data-testid="inventory-table">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Articolo</th>
              <th className="px-2 py-3 font-medium">Categoria</th>
              <th className="px-2 py-3 font-medium">Tg</th>
              <th className="px-2 py-3 font-medium">Condizione</th>
              <th className="px-2 py-3 text-right font-medium">Acquisto</th>
              <th className="px-2 py-3 font-medium">Data · Fonte</th>
              <th className="px-2 py-3 text-right font-medium">Pubblicato</th>
              <th className="px-2 py-3 text-right font-medium">Venduto</th>
              <th className="px-2 py-3 text-right font-medium">Profitto</th>
              <th className="px-2 py-3 text-right font-medium">ROI</th>
              <th className="px-2 py-3 font-medium">Stock</th>
              <th className="px-2 py-3 font-medium">Stato</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const n = rowNumbers(i);
              return (
                <tr key={i.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={i.photos[0]}
                        alt={i.name}
                        category={i.category}
                        className="h-10 w-10 shrink-0"
                        rounded="rounded-lg"
                      />
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate font-medium">{i.name}</p>
                        <p className="text-xs text-muted-foreground">{i.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-muted-foreground">{categoryLabel(i.category)}</td>
                  <td className="px-2 py-2.5">{i.size}</td>
                  <td className="px-2 py-2.5 text-muted-foreground">
                    {CONDITIONS.find((c) => c.value === i.condition)?.short}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatEUR(i.purchasePrice)}</td>
                  <td className="px-2 py-2.5 text-xs text-muted-foreground">
                    {formatDate(i.purchaseDate, { day: '2-digit', month: 'short' })} · {i.source || '—'}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatEUR(i.listedPrice)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatEUR(i.soldPrice)}</td>
                  <td
                    className={cn(
                      'px-2 py-2.5 text-right font-semibold tabular-nums',
                      n.profit === null
                        ? 'text-muted-foreground'
                        : n.profit >= 0
                          ? 'text-profit'
                          : 'text-loss',
                    )}
                  >
                    {n.profit === null ? '—' : formatEUR(n.profit, { sign: true })}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatPct(n.roi)}</td>
                  <td className="px-2 py-2.5">
                    {i.status === 'sold' ? (
                      <span className="text-xs text-muted-foreground">{n.age}g per vendere</span>
                    ) : (
                      <StockAgeBadge days={n.age} />
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    <InventoryStatusBadge status={i.status} />
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <Actions item={i} a={actions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-2 lg:hidden">
        {items.map((i) => {
          const n = rowNumbers(i);
          return (
            <li key={i.id} className="card-surface flex gap-3 p-3" data-testid="inventory-row">
              <ProductImage
                src={i.photos[0]}
                alt={i.name}
                category={i.category}
                className="h-16 w-16 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.brand} · Tg {i.size} · {formatEUR(i.purchasePrice)}
                      {i.soldPrice !== null
                        ? ` → ${formatEUR(i.soldPrice)}`
                        : i.listedPrice !== null
                          ? ` · listino ${formatEUR(i.listedPrice)}`
                          : ''}
                    </p>
                  </div>
                  <Actions item={i} a={actions} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <InventoryStatusBadge status={i.status} />
                  {i.status !== 'sold' && <StockAgeBadge days={n.age} />}
                  {n.profit !== null && (
                    <span
                      className={cn('ml-auto text-sm font-bold', n.profit >= 0 ? 'text-profit' : 'text-loss')}
                    >
                      {formatEUR(n.profit, { sign: true })} · {formatPct(n.roi)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
