import type { Condition } from '@/lib/domain/types';
import { CONDITIONS } from '@/lib/domain/constants';
import { average, clamp, median, round } from '@/lib/utils';
import type { ComparableItem, MarketMetrics } from './types';

function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = (s.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

export function conditionFactor(condition: Condition) {
  return CONDITIONS.find((c) => c.value === condition)?.priceFactor ?? 1;
}

/**
 * Pure market-intelligence computation over comparables.
 * Works for any data source (mock, official API, CSV import) as long as it yields ComparableItem[].
 */
export function computeMarketMetrics(comparables: ComparableItem[], baseDemand?: number): MarketMetrics {
  const sold = comparables.filter((c) => c.soldPrice !== null);
  const prices = sold.map((c) => c.soldPrice as number);
  const days = sold.map((c) => c.daysOnMarket);
  const listingsCount = comparables.length - sold.length;
  const sellThroughRate = comparables.length ? (sold.length / comparables.length) * 100 : 0;
  const avgDays = average(days);
  // Demand blends sell-through and speed (and the brand prior when provided).
  const speedScore = avgDays ? clamp(100 - (avgDays - 3) * 2.2) : 50;
  const dataDemand = sold.length ? sellThroughRate * 0.5 + speedScore * 0.5 : 50;
  const demandScore = baseDemand !== undefined ? dataDemand * 0.5 + baseDemand * 0.5 : dataDemand;
  return {
    avgPrice: round(average(prices)),
    medianPrice: round(median(prices)),
    minPrice: round(prices.length ? Math.min(...prices) : 0),
    maxPrice: round(prices.length ? Math.max(...prices) : 0),
    p25: round(percentile(prices, 0.25)),
    p75: round(percentile(prices, 0.75)),
    avgDaysToSell: round(avgDays, 1),
    demandScore: Math.round(clamp(demandScore)),
    salesCount: sold.length,
    listingsCount,
    sellThroughRate: round(sellThroughRate, 1),
  };
}

/** Re-expresses each sold price as if it were in `target` condition so mixed-condition comps are comparable. */
export function normalizeToCondition(comparables: ComparableItem[], target: Condition): ComparableItem[] {
  const tf = conditionFactor(target);
  return comparables.map((c) =>
    c.soldPrice === null ? c : { ...c, soldPrice: round((c.soldPrice / conditionFactor(c.condition)) * tf) },
  );
}
