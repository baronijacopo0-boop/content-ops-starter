import type { Condition, ItemCategory, Watchlist } from '@/lib/domain/types';
import type { MarketItem } from '@/lib/marketplace/types';
import type { DealEvaluation } from '@/services/ai/types';

export interface EvaluatedDeal {
  item: MarketItem;
  evaluation: DealEvaluation;
}

export interface DealFilters {
  text: string;
  brand: string | null;
  category: ItemCategory | null;
  size: string | null;
  condition: Condition | null;
  maxPrice: number | null;
  minProfit: number | null;
  minRoi: number | null;
  minScore: number | null;
  maxDays: number | null;
  favoritesOnly: boolean;
}

export type DealSort = 'score' | 'recent' | 'price' | 'profit' | 'roi' | 'speed';

export const SORT_OPTIONS: { value: DealSort; label: string }[] = [
  { value: 'score', label: 'Deal Score' },
  { value: 'recent', label: 'Più recenti' },
  { value: 'price', label: 'Prezzo più basso' },
  { value: 'profit', label: 'Profitto maggiore' },
  { value: 'roi', label: 'ROI maggiore' },
  { value: 'speed', label: 'Vendita più veloce' },
];

export const EMPTY_FILTERS: DealFilters = {
  text: '',
  brand: null,
  category: null,
  size: null,
  condition: null,
  maxPrice: null,
  minProfit: null,
  minRoi: null,
  minScore: null,
  maxDays: null,
  favoritesOnly: false,
};

export function activeFilterCount(f: DealFilters) {
  return Object.entries(f).filter(([k, v]) => (k === 'favoritesOnly' ? v === true : v !== null && v !== ''))
    .length;
}

export function filterDeals(
  deals: EvaluatedDeal[],
  f: DealFilters,
  favoriteBrands: string[] = [],
): EvaluatedDeal[] {
  const text = f.text.trim().toLowerCase();
  const favs = favoriteBrands.map((b) => b.toLowerCase());
  return deals.filter(({ item, evaluation: e }) => {
    if (text && !`${item.title} ${item.brand} ${item.model ?? ''}`.toLowerCase().includes(text)) return false;
    if (f.brand && item.brand.toLowerCase() !== f.brand.toLowerCase()) return false;
    if (f.category && item.category !== f.category) return false;
    if (f.size && item.size.toLowerCase() !== f.size.toLowerCase()) return false;
    if (f.condition && item.condition !== f.condition) return false;
    if (f.maxPrice !== null && item.price > f.maxPrice) return false;
    if (f.minProfit !== null && e.profit < f.minProfit) return false;
    if (f.minRoi !== null && (e.roi ?? Infinity) < f.minRoi) return false;
    if (f.minScore !== null && e.dealScore < f.minScore) return false;
    if (f.maxDays !== null && e.sellTime.max > f.maxDays) return false;
    if (f.favoritesOnly && !favs.includes(item.brand.toLowerCase())) return false;
    return true;
  });
}

export function sortDeals(deals: EvaluatedDeal[], sort: DealSort): EvaluatedDeal[] {
  const arr = [...deals];
  const cmp: Record<DealSort, (a: EvaluatedDeal, b: EvaluatedDeal) => number> = {
    score: (a, b) => b.evaluation.dealScore - a.evaluation.dealScore,
    recent: (a, b) => b.item.listedAt.localeCompare(a.item.listedAt),
    price: (a, b) => a.item.price - b.item.price,
    profit: (a, b) => b.evaluation.profit - a.evaluation.profit,
    roi: (a, b) => (b.evaluation.roi ?? 0) - (a.evaluation.roi ?? 0),
    speed: (a, b) => a.evaluation.sellTime.max - b.evaluation.sellTime.max,
  };
  return arr.sort(cmp[sort]);
}

/** Converts a saved watchlist into Deal Finder filters (same matching engine everywhere). */
export function watchlistToFilters(w: Watchlist): DealFilters {
  return {
    ...EMPTY_FILTERS,
    text: w.query,
    brand: w.brand,
    category: w.category,
    size: w.size,
    condition: w.condition,
    maxPrice: w.maxPrice,
    minRoi: w.minRoi,
    minScore: w.minDealScore,
  };
}

export function matchWatchlist(deals: EvaluatedDeal[], w: Watchlist) {
  return sortDeals(filterDeals(deals, watchlistToFilters(w)), 'score');
}
