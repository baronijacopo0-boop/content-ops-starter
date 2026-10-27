import type { Condition, ItemCategory, MarketplaceId } from '@/lib/domain/types';

/** A live listing on a marketplace (a potential purchase for the reseller). */
export interface MarketItem {
  id: string;
  marketplace: MarketplaceId;
  externalId: string;
  title: string;
  description: string;
  brand: string;
  category: ItemCategory;
  model: string | null;
  size: string;
  condition: Condition;
  color: string;
  price: number;
  imageUrl: string | null;
  listedAt: string; // ISO
  favorites: number;
  views: number;
  sellerName: string;
  sellerRating: number | null;
  url: string | null;
}

/** A historical/sold comparable used for market intelligence. */
export interface ComparableItem {
  id: string;
  marketplace: MarketplaceId;
  brand: string;
  category: ItemCategory;
  model: string | null;
  size: string;
  condition: Condition;
  /** Asking price when listed. */
  price: number;
  /** Final sold price (null if still active). */
  soldPrice: number | null;
  daysOnMarket: number;
  listedAt: string;
  soldAt: string | null;
}

export interface MarketMetrics {
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  p25: number;
  p75: number;
  avgDaysToSell: number;
  /** 0-100 */
  demandScore: number;
  salesCount: number;
  listingsCount: number;
  /** sold / (sold + active) in % */
  sellThroughRate: number;
}

export interface MarketDataQuery {
  brand?: string;
  category?: ItemCategory;
  model?: string;
}

export interface MarketData extends MarketMetrics {
  brand: string | null;
  category: ItemCategory | null;
  sampleSize: number;
  updatedAt: string;
}

export interface ComparableQuery {
  brand: string;
  category: ItemCategory;
  size?: string;
  condition?: Condition;
  limit?: number;
}

export interface MarketValueQuery {
  brand: string;
  category: ItemCategory;
  condition: Condition;
  size?: string;
}

export interface EstimatedMarketValue {
  low: number;
  high: number;
  mid: number;
  /** 0-1: how reliable the estimate is (depends on number of comparables). */
  confidence: number;
  comparablesCount: number;
  avgDaysToSell: number;
  demandScore: number;
  sellThroughRate: number;
  source: 'comparables' | 'model';
}

export interface SearchQuery {
  text?: string;
  brands?: string[];
  categories?: ItemCategory[];
  sizes?: string[];
  conditions?: Condition[];
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  items: MarketItem[];
  total: number;
}

export interface MarketplaceProfile {
  id: string;
  username: string;
  rating: number | null;
  reviews: number;
  itemsListed: number;
  itemsSold: number;
  joinedAt: string;
}

export interface ProviderCapabilities {
  search: boolean;
  soldData: boolean;
  userItems: boolean;
  profiles: boolean;
  /** True when data is demo/mock and must be labelled as such in the UI. */
  isMock: boolean;
}

/**
 * Contract every marketplace integration must implement.
 * Implementations must only use official APIs, authorized integrations or user-imported data:
 * no aggressive scraping, anti-bot bypass or automated buying/liking/messaging.
 */
export interface MarketplaceProvider {
  readonly id: MarketplaceId;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;

  searchItems(query: SearchQuery): Promise<SearchResult>;
  getItem(id: string): Promise<MarketItem | null>;
  getUserItems(userId: string): Promise<MarketItem[]>;
  getSoldItems(query: MarketDataQuery & { limit?: number }): Promise<ComparableItem[]>;
  getProfile(userId: string): Promise<MarketplaceProfile | null>;
  getMarketData(query: MarketDataQuery): Promise<MarketData>;
  getComparableItems(query: ComparableQuery): Promise<ComparableItem[]>;
  getEstimatedMarketValue(query: MarketValueQuery): Promise<EstimatedMarketValue>;
}
