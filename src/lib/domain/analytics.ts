import type { InventoryItem, ItemCategory, Sale } from './types';
import { calcProfit, calcRoi } from './finance';
import { inventoryHealth } from './stock';
import { average, daysBetween, groupBy, round, sum, toISODate } from '@/lib/utils';
import { categoryLabel } from './constants';

export interface SaleMetrics extends Sale {
  profit: number;
  roi: number | null;
  daysToSell: number;
}

export function enrichSale(sale: Sale): SaleMetrics {
  const profit = calcProfit(sale.salePrice, sale.purchasePrice, sale.extraCosts);
  return {
    ...sale,
    profit,
    roi: calcRoi(profit, sale.purchasePrice),
    daysToSell: daysBetween(sale.purchasedAt, sale.soldAt),
  };
}

export interface BusinessKpis {
  totalProfit: number;
  revenue: number;
  costOfGoods: number;
  extraCosts: number;
  itemsSold: number;
  itemsBought: number;
  avgRoi: number;
  avgMargin: number;
  avgDaysToSell: number;
  sellThroughRate: number;
  capitalInvested: number;
  inventoryValue: number;
  inventoryListedValue: number;
  inventoryCount: number;
  avgBuyPrice: number;
  avgSellPrice: number;
}

export function computeKpis(items: InventoryItem[], sales: Sale[]): BusinessKpis {
  const s = sales.map(enrichSale);
  const revenue = sum(s.map((x) => x.salePrice));
  const costOfGoods = sum(s.map((x) => x.purchasePrice));
  const extraCosts = sum(s.map((x) => x.extraCosts));
  const totalProfit = round(sum(s.map((x) => x.profit)));
  const health = inventoryHealth(items);
  // Items bought = unsold inventory + every sale (sales may exist without an inventory row)
  const unsoldCount = items.filter((i) => i.status !== 'sold').length;
  const itemsBought = unsoldCount + s.length;
  const capitalInvested = round(health.totalValue + costOfGoods + extraCosts);
  // Aggregate ROI (total profit over total cost) is more robust than averaging per-item ROI.
  const avgRoi = costOfGoods > 0 ? round((totalProfit / costOfGoods) * 100, 1) : 0;
  return {
    totalProfit,
    revenue: round(revenue),
    costOfGoods: round(costOfGoods),
    extraCosts: round(extraCosts),
    itemsSold: s.length,
    itemsBought,
    avgRoi,
    avgMargin: revenue > 0 ? round((totalProfit / revenue) * 100, 1) : 0,
    avgDaysToSell: round(average(s.map((x) => x.daysToSell)), 1),
    sellThroughRate: itemsBought > 0 ? round((s.length / itemsBought) * 100, 1) : 0,
    capitalInvested,
    inventoryValue: round(health.totalValue),
    inventoryListedValue: round(health.listedValue),
    inventoryCount: unsoldCount,
    avgBuyPrice: round(
      average([
        ...s.map((x) => x.purchasePrice),
        ...items.filter((i) => i.status !== 'sold').map((i) => i.purchasePrice),
      ]),
    ),
    avgSellPrice: round(average(s.map((x) => x.salePrice))),
  };
}

export type RangeKey = '7d' | '30d' | '3m' | '6m' | '1y';
export const RANGE_OPTIONS: { value: RangeKey; label: string; days: number }[] = [
  { value: '7d', label: '7 giorni', days: 7 },
  { value: '30d', label: '30 giorni', days: 30 },
  { value: '3m', label: '3 mesi', days: 91 },
  { value: '6m', label: '6 mesi', days: 182 },
  { value: '1y', label: '1 anno', days: 365 },
];

export interface ProfitPoint {
  date: string;
  label: string;
  profit: number;
  cumulative: number;
  revenue: number;
}

/** Profit over time bucketed by day (≤30d) or by week (longer ranges), with running cumulative total. */
export function profitSeries(sales: Sale[], range: RangeKey, now = new Date()): ProfitPoint[] {
  const days = RANGE_OPTIONS.find((r) => r.value === range)!.days;
  const bucketDays = days <= 30 ? 1 : 7;
  const buckets = Math.ceil(days / bucketDays);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (buckets * bucketDays - 1));
  const points: ProfitPoint[] = [];
  for (let b = 0; b < buckets; b++) {
    const d = new Date(start);
    d.setDate(d.getDate() + b * bucketDays);
    points.push({
      date: toISODate(d),
      label: d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      profit: 0,
      cumulative: 0,
      revenue: 0,
    });
  }
  for (const sale of sales.map(enrichSale)) {
    const idx = Math.floor(daysBetween(start, sale.soldAt) / bucketDays);
    const sold = new Date(sale.soldAt);
    if (sold < start || idx >= buckets) continue;
    points[idx].profit = round(points[idx].profit + sale.profit);
    points[idx].revenue = round(points[idx].revenue + sale.salePrice);
  }
  let running = 0;
  for (const p of points) {
    running = round(running + p.profit);
    p.cumulative = running;
  }
  return points;
}

export interface MonthPoint {
  key: string;
  label: string;
  sold: number;
  bought: number;
  revenue: number;
  profit: number;
  roi: number;
}

export function monthlySeries(
  items: InventoryItem[],
  sales: Sale[],
  months = 6,
  now = new Date(),
): MonthPoint[] {
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('it-IT', { month: 'short' }).replace('.', ''),
      sold: 0,
      bought: 0,
      revenue: 0,
      profit: 0,
      roi: 0,
    });
  }
  const cost: Record<string, number> = {};
  for (const s of sales.map(enrichSale)) {
    const p = points.find((x) => s.soldAt.startsWith(x.key));
    if (!p) continue;
    p.sold++;
    p.revenue = round(p.revenue + s.salePrice);
    p.profit = round(p.profit + s.profit);
    cost[p.key] = (cost[p.key] ?? 0) + s.purchasePrice;
  }
  const purchaseDates = [
    ...items.filter((i) => i.status !== 'sold').map((i) => i.purchaseDate),
    ...sales.map((s) => s.purchasedAt),
  ];
  for (const date of purchaseDates) {
    const p = points.find((x) => date.startsWith(x.key));
    if (p) p.bought++;
  }
  for (const p of points) p.roi = cost[p.key] ? round((p.profit / cost[p.key]) * 100, 1) : 0;
  return points;
}

export interface GroupStats {
  key: string;
  label: string;
  sales: number;
  revenue: number;
  profit: number;
  cost: number;
  roi: number;
  avgDaysToSell: number;
  avgBuyPrice: number;
  avgSellPrice: number;
}

function groupStats(sales: SaleMetrics[], key: string, label: string): GroupStats {
  const cost = sum(sales.map((s) => s.purchasePrice));
  const profit = round(sum(sales.map((s) => s.profit)));
  return {
    key,
    label,
    sales: sales.length,
    revenue: round(sum(sales.map((s) => s.salePrice))),
    profit,
    cost: round(cost),
    roi: cost > 0 ? round((profit / cost) * 100, 1) : 0,
    avgDaysToSell: round(average(sales.map((s) => s.daysToSell)), 1),
    avgBuyPrice: round(average(sales.map((s) => s.purchasePrice))),
    avgSellPrice: round(average(sales.map((s) => s.salePrice))),
  };
}

export function brandStats(sales: Sale[]): GroupStats[] {
  const groups = groupBy(sales.map(enrichSale), (s) => s.brand);
  return Object.entries(groups)
    .map(([brand, list]) => groupStats(list, brand, brand))
    .sort((a, b) => b.profit - a.profit);
}

export function categoryStats(sales: Sale[]): GroupStats[] {
  const groups = groupBy(sales.map(enrichSale), (s) => s.category);
  return Object.entries(groups)
    .map(([cat, list]) => groupStats(list, cat, categoryLabel(cat as ItemCategory)))
    .sort((a, b) => b.profit - a.profit);
}

/** Worst brands: lowest ROI first (where the user is leaving money on the table or losing it). */
export function worstBrands(sales: Sale[], limit = 5) {
  return brandStats(sales)
    .sort((a, b) => a.roi - b.roi || a.profit - b.profit)
    .slice(0, limit);
}
