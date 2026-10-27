'use client';

import { CalendarDays, Copy, Eye, Heart, MoreVertical, Pencil, Receipt, Trash2 } from 'lucide-react';
import { ProductImage } from '@/components/shared/product-image';
import { ListingStatusBadge } from '@/components/shared/status-badges';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Listing } from '@/lib/domain/types';
import { formatDate, formatEUR } from '@/lib/format';

export function ListingCard({
  listing,
  onEdit,
  onDuplicate,
  onSold,
  onDelete,
}: {
  listing: Listing;
  onEdit: () => void;
  onDuplicate: () => void;
  onSold: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className="card-surface flex gap-3 p-3 transition hover:border-primary/25 sm:flex-col sm:p-0"
      data-testid="listing-card"
    >
      <ProductImage
        src={listing.photos[0]}
        alt={listing.title}
        category={listing.category}
        className="h-24 w-24 shrink-0 sm:aspect-[4/3] sm:h-auto sm:w-full"
        rounded="rounded-xl sm:rounded-b-none sm:rounded-t-2xl"
      />
      <div className="flex min-w-0 flex-1 flex-col sm:p-4 sm:pt-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{listing.brand || '—'}</p>
            <h3 className="line-clamp-2 text-sm font-semibold">{listing.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="-mr-1 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Azioni annuncio"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil /> Modifica
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDuplicate}>
                <Copy /> Duplica
              </DropdownMenuItem>
              {listing.status !== 'sold' && (
                <DropdownMenuItem onSelect={onSold}>
                  <Receipt /> Segna come venduto
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={onDelete}>
                <Trash2 /> Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-lg font-bold">{formatEUR(listing.price, { decimals: false })}</span>
          <ListingStatusBadge status={listing.status} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1" title="Visualizzazioni">
            <Eye className="h-3 w-3" /> {listing.views}
          </span>
          <span className="flex items-center gap-1" title="Preferiti">
            <Heart className="h-3 w-3" /> {listing.favorites}
          </span>
          <span className="flex items-center gap-1" title="Data pubblicazione">
            <CalendarDays className="h-3 w-3" />{' '}
            {listing.publishedAt
              ? formatDate(listing.publishedAt, { day: '2-digit', month: 'short' })
              : 'non pubblicato'}
          </span>
        </div>
      </div>
    </article>
  );
}
