import { Badge } from '@/components/ui/badge';
import { INVENTORY_STATUSES, LISTING_STATUSES } from '@/lib/domain/constants';
import type { InventoryStatus, ListingStatus } from '@/lib/domain/types';
import { stockAgeBadge, type StockAgeBadge as Age } from '@/lib/domain/stock';

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  const s = INVENTORY_STATUSES.find((x) => x.value === status)!;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const s = LISTING_STATUSES.find((x) => x.value === status)!;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const AGE_TONE: Record<Age, 'profit' | 'muted' | 'warning' | 'loss'> = {
  NEW: 'profit',
  NORMAL: 'muted',
  SLOW: 'warning',
  'OLD STOCK': 'loss',
};

/** 0-14 NEW · 15-30 NORMAL · 31-60 SLOW · 60+ OLD STOCK */
export function StockAgeBadge({ days }: { days: number }) {
  const badge = stockAgeBadge(days);
  return (
    <Badge tone={AGE_TONE[badge]} title={`${days} giorni in inventario`}>
      {badge} · {days}g
    </Badge>
  );
}
