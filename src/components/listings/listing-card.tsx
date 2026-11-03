'use client';

import Link from 'next/link';
import {
  CalendarDays,
  Copy,
  ExternalLink,
  Eye,
  Heart,
  MoreVertical,
  Package,
  Pencil,
  Receipt,
  SlidersHorizontal,
  Trash2,
  Users,
} from 'lucide-react';
import { ProductImage } from '@/components/shared/product-image';
import { ListingStatusBadge } from '@/components/shared/status-badges';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categorySingular, marketplaceLabel } from '@/lib/domain/constants';
import type { Listing } from '@/lib/domain/types';
import { formatDate, formatEUR } from '@/lib/format';

export function ListingCard({
  listing,
  onEdit,
  onDuplicate,
  onSold,
  onDelete,
  onPublish,
  onQuickEdit,
  inventoryName,
}: {
  listing: Listing;
  onEdit: () => void;
  onDuplicate: () => void;
  onSold: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onQuickEdit?: () => void;
  /** Name of the linked inventory item, if any. */
  inventoryName?: string | null;
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
            <p className="text-[11px] text-muted-foreground">
              {listing.brand || '—'} · {categorySingular(listing.category)}
              {listing.size ? ` · Tg ${listing.size}` : ''}
            </p>
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
              {listing.status !== 'sold' && (
                <DropdownMenuItem onSelect={onPublish}>
                  <ExternalLink /> Pubblica su Vinted
                </DropdownMenuItem>
              )}
              {onQuickEdit && (
                <DropdownMenuItem onSelect={onQuickEdit}>
                  <SlidersHorizontal /> Modifica rapida
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil /> Modifica completa
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
          <div className="flex flex-wrap items-center gap-1">
            {listing.sharedInCommunity && (
              <Badge tone="info" title="Condiviso nella community RIVENDO">
                <Users className="h-3 w-3" /> Community
              </Badge>
            )}
            <ListingStatusBadge status={listing.status} />
          </div>
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
        {(listing.externalUrl || inventoryName) && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-xs">
            {listing.externalUrl && (
              <a
                href={listing.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Apri su {marketplaceLabel(listing.marketplace)}
              </a>
            )}
            {inventoryName && (
              <Link
                href={`/inventory?q=${encodeURIComponent(inventoryName)}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Package className="h-3 w-3" /> In inventario
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
