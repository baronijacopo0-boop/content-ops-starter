import { describe, expect, it } from 'vitest';
import { inventoryHealth, stockAgeBadge } from '@/lib/domain/stock';
import { brandStats, computeKpis, monthlySeries, profitSeries, worstBrands } from '@/lib/domain/analytics';
import { buildDemoBundle } from '@/lib/data/demo-seed';
import type { InventoryItem, Sale } from '@/lib/domain/types';
import { generateBusinessInsights } from '@/services/ai/insights';

const now = new Date('2026-10-27T12:00:00');
let n = 0;
const bundle = buildDemoBundle(now, () => `id-${++n}`);
const items = bundle.inventory.map((i) => ({ ...i, userId: 'u' })) as InventoryItem[];
const sales = bundle.sales.map((s) => ({ ...s, userId: 'u' })) as Sale[];

describe('stock age', () => {
  it('maps days to badges per spec', () => {
    expect(stockAgeBadge(0)).toBe('NEW');
    expect(stockAgeBadge(14)).toBe('NEW');
    expect(stockAgeBadge(15)).toBe('NORMAL');
    expect(stockAgeBadge(30)).toBe('NORMAL');
    expect(stockAgeBadge(31)).toBe('SLOW');
    expect(stockAgeBadge(60)).toBe('SLOW');
    expect(stockAgeBadge(61)).toBe('OLD STOCK');
  });
  it('inventory health on demo data', () => {
    const h = inventoryHealth(items, now);
    expect(h.total).toBe(15);
    expect(h.healthy + h.slow + h.old).toBe(15);
    expect(h.old).toBeGreaterThan(0);
    expect(h.lockedValue).toBeGreaterThan(0);
  });
});

describe('demo data', () => {
  it('has the required volumes', () => {
    expect(items.filter((i) => i.status !== 'sold')).toHaveLength(15);
    expect(sales.length).toBeGreaterThanOrEqual(10);
    expect(bundle.watchlists).toHaveLength(5);
    const months = new Set(sales.map((s) => s.soldAt.slice(0, 7)));
    expect(months.size).toBeGreaterThanOrEqual(6);
  });
});

describe('analytics', () => {
  it('kpis are consistent', () => {
    const k = computeKpis(items, sales);
    expect(k.itemsSold).toBe(sales.length);
    expect(k.revenue - k.costOfGoods - k.extraCosts).toBeCloseTo(k.totalProfit, 1);
    expect(k.sellThroughRate).toBeGreaterThan(0);
    expect(k.sellThroughRate).toBeLessThanOrEqual(100);
  });
  it('series cover the requested ranges', () => {
    expect(profitSeries(sales, '7d', now)).toHaveLength(7);
    expect(profitSeries(sales, '30d', now)).toHaveLength(30);
    expect(monthlySeries(items, sales, 6, now)).toHaveLength(6);
    const total = monthlySeries(items, sales, 12, now).reduce((a, m) => a + m.sold, 0);
    expect(total).toBe(sales.length);
  });
  it('ranks brands and finds losers', () => {
    const b = brandStats(sales);
    expect(b[0].profit).toBeGreaterThanOrEqual(b[b.length - 1].profit);
    expect(worstBrands(sales)[0].label).toBe('Zara');
  });
  it('insights are generated from real numbers', () => {
    const insights = generateBusinessInsights(items, sales, { monthlyGoal: 500, targetRoi: 100 }, now);
    expect(insights.length).toBeGreaterThanOrEqual(4);
    expect(insights.some((i) => i.id === 'old-stock')).toBe(true);
    expect(insights.some((i) => i.id === 'losing-brand')).toBe(true);
  });
});
