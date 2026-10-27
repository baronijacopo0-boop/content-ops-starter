import type {
  Condition,
  DealScoreWeights,
  InventoryStatus,
  ItemCategory,
  ListingStatus,
  MarketplaceId,
  Niche,
  UserSettings,
} from './types';

export const CONDITIONS: {
  value: Condition;
  label: string;
  short: string;
  score: number;
  priceFactor: number;
}[] = [
  {
    value: 'new_with_tags',
    label: 'Nuovo con cartellino',
    short: 'Nuovo c/cart.',
    score: 100,
    priceFactor: 1.25,
  },
  { value: 'new', label: 'Nuovo senza cartellino', short: 'Nuovo', score: 90, priceFactor: 1.12 },
  { value: 'very_good', label: 'Ottime condizioni', short: 'Ottime', score: 80, priceFactor: 1.0 },
  { value: 'good', label: 'Buone condizioni', short: 'Buone', score: 60, priceFactor: 0.85 },
  { value: 'fair', label: 'Discrete condizioni', short: 'Discrete', score: 30, priceFactor: 0.65 },
];

export const CATEGORIES: {
  value: ItemCategory;
  label: string;
  singular: string;
  basePrice: number;
  speedDays: number;
}[] = [
  { value: 'hoodie', label: 'Felpe', singular: 'Felpa', basePrice: 30, speedDays: 12 },
  { value: 'sweater', label: 'Maglioni', singular: 'Maglione', basePrice: 28, speedDays: 16 },
  { value: 'tshirt', label: 'T-shirt', singular: 'T-shirt', basePrice: 16, speedDays: 14 },
  { value: 'shirt', label: 'Camicie', singular: 'Camicia', basePrice: 22, speedDays: 20 },
  { value: 'jacket', label: 'Giacche', singular: 'Giacca', basePrice: 55, speedDays: 18 },
  { value: 'jeans', label: 'Jeans', singular: 'Jeans', basePrice: 28, speedDays: 17 },
  { value: 'pants', label: 'Pantaloni', singular: 'Pantaloni', basePrice: 24, speedDays: 19 },
  { value: 'tracksuit', label: 'Tute', singular: 'Tuta', basePrice: 35, speedDays: 13 },
  { value: 'sneakers', label: 'Sneakers', singular: 'Sneakers', basePrice: 60, speedDays: 11 },
  { value: 'accessories', label: 'Accessori', singular: 'Accessorio', basePrice: 15, speedDays: 22 },
];

export interface BrandInfo {
  name: string;
  /** 0-100: how quickly / often the brand sells on second-hand marketplaces. */
  demand: number;
  /** Multiplier applied to the category base price. */
  priceMultiplier: number;
  tier: 'mass' | 'premium' | 'designer';
  niches: Niche[];
}

export const BRANDS: BrandInfo[] = [
  {
    name: 'Nike',
    demand: 92,
    priceMultiplier: 1.15,
    tier: 'premium',
    niches: ['streetwear', 'sport', 'vintage', 'y2k', 'sneakers'],
  },
  {
    name: 'Adidas',
    demand: 86,
    priceMultiplier: 1.05,
    tier: 'premium',
    niches: ['sport', 'vintage', 'streetwear', 'sneakers'],
  },
  { name: 'Carhartt', demand: 90, priceMultiplier: 1.35, tier: 'premium', niches: ['streetwear', 'vintage'] },
  {
    name: 'Ralph Lauren',
    demand: 84,
    priceMultiplier: 1.3,
    tier: 'premium',
    niches: ['vintage', 'designer'],
  },
  {
    name: 'The North Face',
    demand: 88,
    priceMultiplier: 1.55,
    tier: 'premium',
    niches: ['streetwear', 'vintage', 'sport'],
  },
  {
    name: 'Stone Island',
    demand: 85,
    priceMultiplier: 3.2,
    tier: 'designer',
    niches: ['designer', 'streetwear'],
  },
  { name: 'Supreme', demand: 78, priceMultiplier: 2.6, tier: 'designer', niches: ['streetwear'] },
  { name: 'Lacoste', demand: 74, priceMultiplier: 1.2, tier: 'premium', niches: ['vintage', 'sport'] },
  { name: "Levi's", demand: 80, priceMultiplier: 1.1, tier: 'premium', niches: ['vintage', 'y2k'] },
  { name: 'Tommy Hilfiger', demand: 70, priceMultiplier: 1.05, tier: 'premium', niches: ['vintage', 'y2k'] },
  { name: 'Patagonia', demand: 83, priceMultiplier: 1.6, tier: 'premium', niches: ['vintage', 'streetwear'] },
  { name: 'Stüssy', demand: 82, priceMultiplier: 1.7, tier: 'premium', niches: ['streetwear', 'y2k'] },
  { name: 'Champion', demand: 66, priceMultiplier: 0.9, tier: 'mass', niches: ['vintage', 'sport'] },
  { name: 'Fila', demand: 58, priceMultiplier: 0.85, tier: 'mass', niches: ['y2k', 'sport'] },
  { name: 'Kappa', demand: 60, priceMultiplier: 0.85, tier: 'mass', niches: ['sport', 'y2k'] },
  { name: 'Burberry', demand: 76, priceMultiplier: 3.5, tier: 'designer', niches: ['designer', 'vintage'] },
  { name: 'Moncler', demand: 80, priceMultiplier: 4.5, tier: 'designer', niches: ['designer'] },
  { name: 'Diesel', demand: 62, priceMultiplier: 1.1, tier: 'premium', niches: ['y2k'] },
  { name: 'Dickies', demand: 72, priceMultiplier: 1.0, tier: 'mass', niches: ['streetwear', 'vintage'] },
  { name: "Arc'teryx", demand: 87, priceMultiplier: 3.0, tier: 'designer', niches: ['streetwear', 'sport'] },
  { name: 'New Balance', demand: 81, priceMultiplier: 1.1, tier: 'premium', niches: ['sneakers', 'sport'] },
  { name: 'Zara', demand: 45, priceMultiplier: 0.6, tier: 'mass', niches: ['other'] },
  { name: 'H&M', demand: 35, priceMultiplier: 0.45, tier: 'mass', niches: ['other'] },
];

export const SUGGESTED_BRANDS = [
  'Nike',
  'Adidas',
  'Carhartt',
  'Ralph Lauren',
  'The North Face',
  'Stone Island',
  'Supreme',
  'Lacoste',
  "Levi's",
  'Tommy Hilfiger',
];

export const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: 'streetwear', label: 'Streetwear', emoji: '🧢' },
  { value: 'vintage', label: 'Vintage', emoji: '📼' },
  { value: 'sport', label: 'Sport', emoji: '⚽' },
  { value: 'designer', label: 'Designer', emoji: '💎' },
  { value: 'y2k', label: 'Y2K', emoji: '💿' },
  { value: 'sneakers', label: 'Sneakers', emoji: '👟' },
  { value: 'other', label: 'Altro', emoji: '✨' },
];

export const BUDGET_OPTIONS = [50, 100, 250, 500, 1000];
export const GOAL_OPTIONS = [100, 250, 500, 1000];

export const SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '28',
  '30',
  '32',
  '34',
  '36',
  '38',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  'Unica',
];

export const INVENTORY_STATUSES: { value: InventoryStatus; label: string; tone: Tone }[] = [
  { value: 'to_photograph', label: 'Da fotografare', tone: 'muted' },
  { value: 'to_list', label: 'Da pubblicare', tone: 'warning' },
  { value: 'listed', label: 'Pubblicato', tone: 'info' },
  { value: 'reserved', label: 'Riservato', tone: 'purple' },
  { value: 'sold', label: 'Venduto', tone: 'profit' },
];

export const LISTING_STATUSES: { value: ListingStatus; label: string; tone: Tone }[] = [
  { value: 'draft', label: 'Bozza', tone: 'muted' },
  { value: 'published', label: 'Pubblicato', tone: 'info' },
  { value: 'reserved', label: 'Riservato', tone: 'purple' },
  { value: 'sold', label: 'Venduto', tone: 'profit' },
];

export const MARKETPLACES: { value: MarketplaceId; label: string; available: boolean }[] = [
  { value: 'vinted', label: 'Vinted', available: true },
  { value: 'depop', label: 'Depop', available: false },
  { value: 'ebay', label: 'eBay', available: false },
  { value: 'grailed', label: 'Grailed', available: false },
  { value: 'vestiaire', label: 'Vestiaire Collective', available: false },
  { value: 'wallapop', label: 'Wallapop', available: false },
  { value: 'manual', label: 'Altro / manuale', available: true },
];

export const PURCHASE_SOURCES = [
  'Vinted',
  'Mercatino',
  'Svuota cantine',
  'Charity shop',
  'Depop',
  'eBay',
  'Outlet',
  'Altro',
];

export type Tone = 'profit' | 'loss' | 'warning' | 'info' | 'muted' | 'purple';

export const DEFAULT_WEIGHTS: DealScoreWeights = {
  priceVsMarket: 30,
  brandDemand: 20,
  roi: 20,
  sellSpeed: 15,
  condition: 10,
  size: 5,
};

export const DEFAULT_SETTINGS: UserSettings = {
  dealScoreWeights: DEFAULT_WEIGHTS,
  defaultExtraCosts: 1.5,
  notifyHotDeals: true,
  notifyWatchlist: true,
  preferredMarketplace: 'vinted',
};

export const DEFAULT_TARGET_ROI = 100;

export function conditionLabel(c: Condition | null | undefined) {
  return CONDITIONS.find((x) => x.value === c)?.label ?? '—';
}
export function categoryLabel(c: ItemCategory | null | undefined) {
  return CATEGORIES.find((x) => x.value === c)?.label ?? '—';
}
export function categorySingular(c: ItemCategory | null | undefined) {
  return CATEGORIES.find((x) => x.value === c)?.singular ?? 'Capo';
}
export function nicheLabel(n: Niche | null | undefined) {
  return NICHES.find((x) => x.value === n)?.label ?? '—';
}
export function marketplaceLabel(m: MarketplaceId) {
  return MARKETPLACES.find((x) => x.value === m)?.label ?? m;
}
export function findBrand(name: string | null | undefined): BrandInfo | undefined {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return BRANDS.find((b) => b.name.toLowerCase() === n);
}
/** Brands not in the reference list get a neutral profile so pricing still works. */
export function brandOrDefault(name: string): BrandInfo {
  return findBrand(name) ?? { name, demand: 55, priceMultiplier: 0.9, tier: 'mass', niches: ['other'] };
}
