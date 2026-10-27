import { brandOrDefault, CATEGORIES } from '@/lib/domain/constants';
import { round } from '@/lib/utils';
import { buildComparables, buildDealFeed } from '../data/mock-catalog';
import { computeMarketMetrics, conditionFactor, normalizeToCondition } from '../metrics';
import type {
  ComparableItem,
  ComparableQuery,
  EstimatedMarketValue,
  MarketData,
  MarketDataQuery,
  MarketItem,
  MarketplaceProfile,
  MarketplaceProvider,
  MarketValueQuery,
  SearchQuery,
  SearchResult,
} from '../types';

const eq = (a?: string | null, b?: string | null) => (a ?? '').toLowerCase() === (b ?? '').toLowerCase();

/**
 * Demo implementation of MarketplaceProvider with realistic, locally generated data.
 * It never contacts Vinted. Replace it (see ./index.ts) with an official API / authorized integration
 * or a CSV-import provider without touching the rest of the app.
 */
export class MockVintedProvider implements MarketplaceProvider {
  readonly id = 'vinted' as const;
  readonly name = 'Vinted (demo)';
  readonly capabilities = { search: true, soldData: true, userItems: false, profiles: true, isMock: true };

  private feed: MarketItem[];
  private comparables: ComparableItem[];

  constructor(now = new Date()) {
    this.feed = buildDealFeed(now);
    this.comparables = buildComparables(now);
  }

  async searchItems(query: SearchQuery): Promise<SearchResult> {
    const text = query.text?.trim().toLowerCase();
    let items = this.feed.filter((i) => {
      if (text && !`${i.title} ${i.brand} ${i.model ?? ''}`.toLowerCase().includes(text)) return false;
      if (query.brands?.length && !query.brands.some((b) => eq(b, i.brand))) return false;
      if (query.categories?.length && !query.categories.includes(i.category)) return false;
      if (query.sizes?.length && !query.sizes.includes(i.size)) return false;
      if (query.conditions?.length && !query.conditions.includes(i.condition)) return false;
      if (query.maxPrice !== undefined && i.price > query.maxPrice) return false;
      return true;
    });
    const total = items.length;
    const offset = query.offset ?? 0;
    items = items.slice(offset, offset + (query.limit ?? 100));
    return { items, total };
  }

  async getItem(id: string) {
    return this.feed.find((i) => i.id === id) ?? null;
  }

  async getUserItems(): Promise<MarketItem[]> {
    // Requires an authorized account connection – not available in demo mode.
    return [];
  }

  async getSoldItems(query: MarketDataQuery & { limit?: number }) {
    return this.filterComparables(query)
      .filter((c) => c.soldPrice !== null)
      .slice(0, query.limit ?? 50);
  }

  async getProfile(userId: string): Promise<MarketplaceProfile> {
    return {
      id: userId,
      username: 'demo_reseller',
      rating: 4.9,
      reviews: 128,
      itemsListed: 24,
      itemsSold: 131,
      joinedAt: '2023-03-14',
    };
  }

  async getMarketData(query: MarketDataQuery): Promise<MarketData> {
    const comps = this.filterComparables(query);
    const brandDemand = query.brand ? brandOrDefault(query.brand).demand : undefined;
    return {
      ...computeMarketMetrics(comps, brandDemand),
      brand: query.brand ?? null,
      category: query.category ?? null,
      sampleSize: comps.length,
      updatedAt: new Date().toISOString(),
    };
  }

  async getComparableItems(query: ComparableQuery) {
    const comps = this.filterComparables(query);
    const scored = comps
      .map((c) => ({
        c,
        s:
          (query.size && c.size === query.size ? 2 : 0) +
          (query.condition && c.condition === query.condition ? 1 : 0),
      }))
      .sort((a, b) => b.s - a.s || (b.c.soldAt ?? '').localeCompare(a.c.soldAt ?? ''));
    return scored.slice(0, query.limit ?? 12).map((x) => x.c);
  }

  async getEstimatedMarketValue(query: MarketValueQuery): Promise<EstimatedMarketValue> {
    const brand = brandOrDefault(query.brand);
    const comps = normalizeToCondition(this.filterComparables(query), query.condition);
    const m = computeMarketMetrics(comps, brand.demand);
    if (m.salesCount >= 3) {
      const mid = m.medianPrice;
      return {
        low: round(Math.min(m.p25, mid * 0.9), 0),
        high: round(Math.max(m.p75, mid * 1.1), 0),
        mid: round(mid, 0),
        confidence: Math.min(1, m.salesCount / 12),
        comparablesCount: m.salesCount,
        avgDaysToSell: m.avgDaysToSell,
        demandScore: m.demandScore,
        sellThroughRate: m.sellThroughRate,
        source: 'comparables',
      };
    }
    // Not enough data → price model from brand & category priors.
    const cat = CATEGORIES.find((c) => c.value === query.category)!;
    const mid = cat.basePrice * brand.priceMultiplier * conditionFactor(query.condition);
    const days = cat.speedDays * Math.pow(100 / brand.demand, 1.1);
    return {
      low: round(mid * 0.85, 0),
      high: round(mid * 1.15, 0),
      mid: round(mid, 0),
      confidence: 0.3,
      comparablesCount: m.salesCount,
      avgDaysToSell: round(days, 1),
      demandScore: brand.demand,
      sellThroughRate: m.sellThroughRate || 50,
      source: 'model',
    };
  }

  private filterComparables(q: MarketDataQuery) {
    return this.comparables.filter(
      (c) =>
        (!q.brand || eq(c.brand, q.brand)) &&
        (!q.category || c.category === q.category) &&
        (!q.model || eq(c.model, q.model)),
    );
  }
}
