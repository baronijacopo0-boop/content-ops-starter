import type { InventoryItem } from './types';
import { daysBetween, sum } from '@/lib/utils';

export type StockAgeBadge = 'NEW' | 'NORMAL' | 'SLOW' | 'OLD STOCK';

export function stockAgeDays(
  item: Pick<InventoryItem, 'purchaseDate' | 'soldAt' | 'status'>,
  now = new Date(),
) {
  const end = item.status === 'sold' && item.soldAt ? item.soldAt : now;
  return daysBetween(item.purchaseDate, end);
}

/** 0-14 NEW · 15-30 NORMAL · 31-60 SLOW · 60+ OLD STOCK */
export function stockAgeBadge(days: number): StockAgeBadge {
  if (days <= 14) return 'NEW';
  if (days <= 30) return 'NORMAL';
  if (days <= 60) return 'SLOW';
  return 'OLD STOCK';
}

export interface InventoryHealth {
  total: number;
  healthy: number;
  slow: number;
  old: number;
  /** Capital tied in slow + old items (purchase cost). */
  lockedValue: number;
  /** Capital tied in all unsold items (purchase cost). */
  totalValue: number;
  /** Estimated value at listed price (falls back to cost when no price set). */
  listedValue: number;
  oldValue: number;
}

export function inventoryHealth(items: InventoryItem[], now = new Date()): InventoryHealth {
  const unsold = items.filter((i) => i.status !== 'sold');
  let healthy = 0;
  let slow = 0;
  let old = 0;
  let lockedValue = 0;
  let oldValue = 0;
  for (const item of unsold) {
    const badge = stockAgeBadge(stockAgeDays(item, now));
    if (badge === 'SLOW') {
      slow++;
      lockedValue += item.purchasePrice + item.extraCosts;
    } else if (badge === 'OLD STOCK') {
      old++;
      lockedValue += item.purchasePrice + item.extraCosts;
      oldValue += item.purchasePrice + item.extraCosts;
    } else healthy++;
  }
  return {
    total: unsold.length,
    healthy,
    slow,
    old,
    lockedValue,
    oldValue,
    totalValue: sum(unsold.map((i) => i.purchasePrice + i.extraCosts)),
    listedValue: sum(unsold.map((i) => i.listedPrice ?? i.purchasePrice)),
  };
}
