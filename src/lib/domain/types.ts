/**
 * FLIP AI domain model. These types are marketplace-agnostic: nothing here depends on Vinted.
 * Database rows (snake_case) are mapped to these types in src/lib/data/supabase-repository.ts.
 */

export type Condition = 'new_with_tags' | 'new' | 'very_good' | 'good' | 'fair';

export type ItemCategory =
  | 'hoodie'
  | 'sweater'
  | 'tshirt'
  | 'shirt'
  | 'jacket'
  | 'jeans'
  | 'pants'
  | 'tracksuit'
  | 'sneakers'
  | 'accessories';

/** Reseller niche chosen during onboarding (style focus). */
export type Niche = 'streetwear' | 'vintage' | 'sport' | 'designer' | 'y2k' | 'sneakers' | 'other';

export type InventoryStatus = 'to_photograph' | 'to_list' | 'listed' | 'reserved' | 'sold';
export type ListingStatus = 'draft' | 'published' | 'reserved' | 'sold';

export type MarketplaceId = 'vinted' | 'depop' | 'ebay' | 'grailed' | 'vestiaire' | 'wallapop' | 'manual';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  mainCategory: Niche | null;
  favoriteBrands: string[];
  favoriteCategories: ItemCategory[];
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface UserGoals {
  budget: number | null;
  monthlyGoal: number | null;
  /** Minimum ROI (%) the user wants on every deal – used by Deal Finder and analysis. */
  targetRoi: number;
}

export interface DealScoreWeights {
  priceVsMarket: number;
  brandDemand: number;
  roi: number;
  sellSpeed: number;
  condition: number;
  size: number;
}

export interface UserSettings {
  dealScoreWeights: DealScoreWeights;
  defaultExtraCosts: number;
  notifyHotDeals: boolean;
  notifyWatchlist: boolean;
  preferredMarketplace: MarketplaceId;
}

export interface UserProfileBundle {
  profile: Profile;
  goals: UserGoals;
  settings: UserSettings;
}

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: ItemCategory;
  size: string;
  condition: Condition;
  purchasePrice: number;
  purchaseDate: string; // YYYY-MM-DD
  source: string;
  listedPrice: number | null;
  soldPrice: number | null;
  extraCosts: number;
  status: InventoryStatus;
  photos: string[];
  notes: string;
  soldAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InventoryItemInput = Omit<
  InventoryItem,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'soldAt' | 'soldPrice'
> & {
  soldPrice?: number | null;
};

export interface Listing {
  id: string;
  userId: string;
  inventoryItemId: string | null;
  title: string;
  description: string;
  brand: string;
  category: ItemCategory;
  size: string;
  condition: Condition;
  colors: string[];
  material: string;
  style: string;
  price: number;
  photos: string[];
  views: number;
  favorites: number;
  status: ListingStatus;
  marketplace: MarketplaceId;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ListingInput = Omit<Listing, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export interface Sale {
  id: string;
  userId: string;
  inventoryItemId: string | null;
  listingId: string | null;
  productName: string;
  brand: string;
  category: ItemCategory;
  purchasePrice: number;
  salePrice: number;
  extraCosts: number;
  purchasedAt: string; // YYYY-MM-DD
  soldAt: string; // YYYY-MM-DD
  platform: MarketplaceId;
  createdAt: string;
}

export type SaleInput = Omit<Sale, 'id' | 'userId' | 'createdAt'>;

export interface MarkSoldInput {
  salePrice: number;
  extraCosts: number;
  soldAt: string;
  platform: MarketplaceId;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  query: string;
  brand: string | null;
  category: ItemCategory | null;
  size: string | null;
  condition: Condition | null;
  maxPrice: number | null;
  minRoi: number | null;
  minDealScore: number | null;
  notify: boolean;
  isActive: boolean;
  createdAt: string;
}

export type WatchlistInput = Omit<Watchlist, 'id' | 'userId' | 'createdAt'>;

export interface DealAnalysisRecord {
  id: string;
  userId: string;
  productName: string;
  brand: string;
  category: ItemCategory;
  askingPrice: number;
  dealScore: number;
  verdict: string;
  result: unknown;
  createdAt: string;
}

export type NotificationType = 'hot_deal' | 'watchlist_match' | 'stock_alert' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
