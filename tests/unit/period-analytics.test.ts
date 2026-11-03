import { describe, expect, it } from 'vitest';
import { periodComparison, startOfWeek, weeklySeries } from '@/lib/domain/analytics';
import { platformFee, totalExtraCosts } from '@/lib/domain/finance';
import type { Sale } from '@/lib/domain/types';

const sale = (soldAt: string, salePrice: number, purchasePrice: number, extraCosts = 0): Sale =>
  ({
    id: soldAt + salePrice,
    userId: 'u',
    inventoryItemId: null,
    productName: 'x',
    brand: 'Nike',
    category: 'hoodie',
    purchasePrice,
    salePrice,
    extraCosts,
    purchasedAt: soldAt,
    soldAt,
    platform: 'vinted',
    createdAt: soldAt,
  }) as Sale;

// Wednesday 2026-11-04
const NOW = new Date(2026, 10, 4, 15, 0, 0);

describe('period analytics', () => {
  it('weeks start on Monday', () => {
    expect(startOfWeek(NOW).getDate()).toBe(2);
    expect(startOfWeek(new Date(2026, 10, 8)).getDate()).toBe(2); // Sunday
  });

  it('compares this week to the same days of last week', () => {
    const sales = [
      sale('2026-11-02', 30, 10, 2), // this week
      sale('2026-11-04', 20, 5), // this week (today)
      sale('2026-10-27', 25, 10), // last week, Tue → inside Mon–Wed window
      sale('2026-10-30', 100, 10), // last week Fri → outside the like-for-like window
    ];
    const c = periodComparison([], sales, 'week', NOW);
    expect(c.current.sold).toBe(2);
    expect(c.current.revenue).toBe(50);
    expect(c.current.profit).toBe(33);
    expect(c.current.extraCosts).toBe(2);
    expect(c.previous.sold).toBe(1);
    expect(c.previous.profit).toBe(15);
    expect(c.delta.profit).toBe(120);
  });

  it('compares this month to the first days of last month; null delta when previous is 0', () => {
    const c = periodComparison([], [sale('2026-11-01', 40, 10), sale('2026-10-20', 40, 10)], 'month', NOW);
    expect(c.current.sold).toBe(1);
    expect(c.previous.sold).toBe(0);
    expect(c.delta.sold).toBeNull();
  });

  it('builds weekly buckets', () => {
    const w = weeklySeries([], [sale('2026-11-03', 30, 10), sale('2026-10-26', 20, 10)], 4, NOW);
    expect(w).toHaveLength(4);
    expect(w[3].key).toBe('2026-11-02');
    expect(w[3].profit).toBe(20);
    expect(w[2].sold).toBe(1);
    expect(w[0].sold + w[1].sold).toBe(0);
  });
});

describe('cost breakdown', () => {
  it('adds % and fixed fees to packaging, shipping and other', () => {
    expect(platformFee(50, { feePct: 10, feeFixed: 0.5 })).toBe(5.5);
    expect(totalExtraCosts(50, { packaging: 1, shipping: 3, feePct: 10, feeFixed: 0.5, other: 0 })).toBe(9.5);
    expect(totalExtraCosts(50, { packaging: -1, shipping: 0, feePct: 0, feeFixed: 0, other: 0 })).toBe(0);
  });
});
