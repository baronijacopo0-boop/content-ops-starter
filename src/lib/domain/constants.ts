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
  { value: 'hoodie', label: 'Felpe', singular: 'Felpa', basePrice: 22, speedDays: 12 },
  { value: 'sweater', label: 'Maglioni', singular: 'Maglione', basePrice: 20, speedDays: 16 },
  { value: 'tshirt', label: 'T-shirt', singular: 'T-shirt', basePrice: 11, speedDays: 14 },
  { value: 'shirt', label: 'Camicie', singular: 'Camicia', basePrice: 15, speedDays: 20 },
  { value: 'jacket', label: 'Giacche', singular: 'Giacca', basePrice: 38, speedDays: 18 },
  { value: 'jeans', label: 'Jeans', singular: 'Jeans', basePrice: 20, speedDays: 17 },
  { value: 'pants', label: 'Pantaloni', singular: 'Pantaloni', basePrice: 17, speedDays: 19 },
  { value: 'tracksuit', label: 'Tute', singular: 'Tuta', basePrice: 24, speedDays: 13 },
  { value: 'sneakers', label: 'Sneakers', singular: 'Sneakers', basePrice: 42, speedDays: 11 },
  { value: 'accessories', label: 'Accessori', singular: 'Accessorio', basePrice: 10, speedDays: 22 },
];

export interface BrandInfo {
  name: string;
  /** 0-100: how quickly / often the brand sells on second-hand marketplaces. */
  demand: number;
  /** Multiplier applied to the category base price. */
  priceMultiplier: number;
  tier: 'mass' | 'premium' | 'designer';
  niches: Niche[];
  /** Other spellings / abbreviations found in listing titles and labels. */
  aliases?: string[];
}

export const BRANDS: BrandInfo[] = [
  {
    name: 'Nike',
    demand: 92,
    priceMultiplier: 1.2,
    tier: 'premium',
    niches: ['streetwear', 'sport', 'vintage', 'y2k', 'sneakers'],
    aliases: ['nike acg', 'nikelab'],
  },
  {
    name: 'Adidas',
    demand: 86,
    priceMultiplier: 1.1,
    tier: 'premium',
    niches: ['sport', 'vintage', 'streetwear', 'sneakers'],
    aliases: ['adidas originals'],
  },
  {
    name: 'Carhartt',
    demand: 90,
    priceMultiplier: 1.6,
    tier: 'premium',
    niches: ['streetwear', 'vintage'],
    aliases: ['carhartt wip'],
  },
  {
    name: 'Ralph Lauren',
    demand: 84,
    priceMultiplier: 1.4,
    tier: 'premium',
    niches: ['vintage', 'designer'],
    aliases: ['polo ralph lauren', 'polo by ralph lauren', 'rrl', 'lauren ralph lauren'],
  },
  {
    name: 'The North Face',
    demand: 88,
    priceMultiplier: 1.9,
    tier: 'premium',
    niches: ['streetwear', 'vintage', 'sport'],
    aliases: ['tnf', 'north face'],
  },
  {
    name: 'Stone Island',
    demand: 85,
    priceMultiplier: 3.5,
    tier: 'designer',
    niches: ['designer', 'streetwear'],
  },
  {
    name: 'C.P. Company',
    demand: 80,
    priceMultiplier: 3.0,
    tier: 'designer',
    niches: ['designer', 'streetwear'],
    aliases: ['cp company', 'c.p.company'],
  },
  { name: 'Supreme', demand: 78, priceMultiplier: 2.5, tier: 'designer', niches: ['streetwear'] },
  { name: 'Palace', demand: 72, priceMultiplier: 2.2, tier: 'designer', niches: ['streetwear'] },
  {
    name: 'Stüssy',
    demand: 82,
    priceMultiplier: 1.8,
    tier: 'premium',
    niches: ['streetwear', 'y2k'],
    aliases: ['stussy'],
  },
  { name: 'Lacoste', demand: 74, priceMultiplier: 1.25, tier: 'premium', niches: ['vintage', 'sport'] },
  {
    name: "Levi's",
    demand: 80,
    priceMultiplier: 1.15,
    tier: 'premium',
    niches: ['vintage', 'y2k'],
    aliases: ['levis', 'levi strauss'],
  },
  {
    name: 'Tommy Hilfiger',
    demand: 70,
    priceMultiplier: 1.05,
    tier: 'premium',
    niches: ['vintage', 'y2k'],
    aliases: ['tommy jeans', 'hilfiger'],
  },
  { name: 'Patagonia', demand: 83, priceMultiplier: 1.8, tier: 'premium', niches: ['vintage', 'streetwear'] },
  {
    name: "Arc'teryx",
    demand: 87,
    priceMultiplier: 3.5,
    tier: 'designer',
    niches: ['streetwear', 'sport'],
    aliases: ['arcteryx', 'arc teryx'],
  },
  { name: 'Champion', demand: 66, priceMultiplier: 0.9, tier: 'mass', niches: ['vintage', 'sport'] },
  { name: 'Fila', demand: 58, priceMultiplier: 0.8, tier: 'mass', niches: ['y2k', 'sport'] },
  { name: 'Kappa', demand: 60, priceMultiplier: 0.8, tier: 'mass', niches: ['sport', 'y2k'] },
  { name: 'Umbro', demand: 62, priceMultiplier: 0.85, tier: 'mass', niches: ['sport', 'vintage'] },
  { name: 'Puma', demand: 64, priceMultiplier: 0.85, tier: 'mass', niches: ['sport', 'sneakers'] },
  {
    name: 'Reebok',
    demand: 60,
    priceMultiplier: 0.85,
    tier: 'mass',
    niches: ['sport', 'vintage', 'sneakers'],
  },
  {
    name: 'New Balance',
    demand: 81,
    priceMultiplier: 1.15,
    tier: 'premium',
    niches: ['sneakers', 'sport'],
    aliases: ['nb'],
  },
  { name: 'Asics', demand: 72, priceMultiplier: 1.05, tier: 'premium', niches: ['sneakers', 'sport'] },
  { name: 'Converse', demand: 66, priceMultiplier: 0.85, tier: 'mass', niches: ['sneakers'] },
  { name: 'Vans', demand: 64, priceMultiplier: 0.8, tier: 'mass', niches: ['sneakers', 'streetwear'] },
  {
    name: 'Dr. Martens',
    demand: 76,
    priceMultiplier: 1.6,
    tier: 'premium',
    niches: ['vintage', 'other'],
    aliases: ['dr martens', 'doc martens'],
  },
  {
    name: 'Timberland',
    demand: 70,
    priceMultiplier: 1.3,
    tier: 'premium',
    niches: ['vintage', 'streetwear'],
  },
  { name: 'Salomon', demand: 80, priceMultiplier: 1.7, tier: 'premium', niches: ['sneakers', 'sport'] },
  { name: 'Dickies', demand: 72, priceMultiplier: 1.0, tier: 'mass', niches: ['streetwear', 'vintage'] },
  { name: 'Diesel', demand: 64, priceMultiplier: 1.1, tier: 'premium', niches: ['y2k'] },
  { name: 'Guess', demand: 58, priceMultiplier: 0.9, tier: 'mass', niches: ['y2k'] },
  { name: 'Von Dutch', demand: 60, priceMultiplier: 1.1, tier: 'mass', niches: ['y2k'] },
  { name: 'Ed Hardy', demand: 55, priceMultiplier: 1.0, tier: 'mass', niches: ['y2k'] },
  { name: 'Napapijri', demand: 68, priceMultiplier: 1.3, tier: 'premium', niches: ['streetwear', 'sport'] },
  { name: 'Woolrich', demand: 66, priceMultiplier: 1.8, tier: 'premium', niches: ['vintage'] },
  { name: 'Barbour', demand: 74, priceMultiplier: 2.3, tier: 'premium', niches: ['vintage'] },
  { name: 'Columbia', demand: 62, priceMultiplier: 1.1, tier: 'mass', niches: ['vintage', 'sport'] },
  { name: 'Helly Hansen', demand: 64, priceMultiplier: 1.2, tier: 'premium', niches: ['vintage', 'sport'] },
  { name: 'Fred Perry', demand: 68, priceMultiplier: 1.2, tier: 'premium', niches: ['vintage'] },
  { name: 'Gant', demand: 58, priceMultiplier: 1.1, tier: 'premium', niches: ['vintage'] },
  {
    name: 'Hugo Boss',
    demand: 62,
    priceMultiplier: 1.3,
    tier: 'premium',
    niches: ['designer'],
    aliases: ['boss'],
  },
  {
    name: 'Calvin Klein',
    demand: 64,
    priceMultiplier: 1.0,
    tier: 'premium',
    niches: ['y2k', 'vintage'],
    aliases: ['ck'],
  },
  { name: 'Moncler', demand: 80, priceMultiplier: 6.0, tier: 'designer', niches: ['designer'] },
  { name: 'Burberry', demand: 76, priceMultiplier: 3.5, tier: 'designer', niches: ['designer', 'vintage'] },
  { name: 'Gucci', demand: 78, priceMultiplier: 8.0, tier: 'designer', niches: ['designer'] },
  { name: 'Prada', demand: 76, priceMultiplier: 6.5, tier: 'designer', niches: ['designer', 'y2k'] },
  { name: 'Moschino', demand: 64, priceMultiplier: 3.0, tier: 'designer', niches: ['designer', 'y2k'] },
  { name: 'Versace', demand: 66, priceMultiplier: 4.0, tier: 'designer', niches: ['designer', 'vintage'] },
  {
    name: 'Armani',
    demand: 58,
    priceMultiplier: 1.8,
    tier: 'designer',
    niches: ['designer'],
    aliases: ['emporio armani', 'armani exchange'],
  },
  {
    name: 'Dsquared2',
    demand: 62,
    priceMultiplier: 2.5,
    tier: 'designer',
    niches: ['designer'],
    aliases: ['dsquared'],
  },
  {
    name: 'Off-White',
    demand: 68,
    priceMultiplier: 4.0,
    tier: 'designer',
    niches: ['streetwear', 'designer'],
    aliases: ['off white'],
  },
  { name: 'Represent', demand: 66, priceMultiplier: 2.0, tier: 'premium', niches: ['streetwear'] },
  {
    name: 'Corteiz',
    demand: 80,
    priceMultiplier: 2.4,
    tier: 'premium',
    niches: ['streetwear'],
    aliases: ['crtz'],
  },
  { name: 'Trapstar', demand: 72, priceMultiplier: 2.0, tier: 'premium', niches: ['streetwear'] },
  {
    name: 'Essentials',
    demand: 74,
    priceMultiplier: 1.8,
    tier: 'premium',
    niches: ['streetwear'],
    aliases: ['fear of god essentials', 'fog essentials'],
  },
  {
    name: 'BAPE',
    demand: 72,
    priceMultiplier: 3.0,
    tier: 'designer',
    niches: ['streetwear'],
    aliases: ['a bathing ape'],
  },
  {
    name: 'Jordan',
    demand: 86,
    priceMultiplier: 1.4,
    tier: 'premium',
    niches: ['sneakers', 'streetwear', 'sport'],
    aliases: ['air jordan'],
  },
  { name: 'Oakley', demand: 64, priceMultiplier: 1.3, tier: 'premium', niches: ['y2k', 'sport'] },
  {
    name: 'Harley-Davidson',
    demand: 62,
    priceMultiplier: 1.4,
    tier: 'premium',
    niches: ['vintage'],
    aliases: ['harley davidson'],
  },
  { name: 'Wrangler', demand: 58, priceMultiplier: 0.9, tier: 'mass', niches: ['vintage'] },
  { name: 'Lee', demand: 56, priceMultiplier: 0.85, tier: 'mass', niches: ['vintage'] },
  { name: 'Pepe Jeans', demand: 50, priceMultiplier: 0.75, tier: 'mass', niches: ['other'] },
  {
    name: 'Benetton',
    demand: 52,
    priceMultiplier: 0.75,
    tier: 'mass',
    niches: ['vintage'],
    aliases: ['united colors of benetton'],
  },
  { name: 'Sergio Tacchini', demand: 60, priceMultiplier: 1.0, tier: 'mass', niches: ['sport', 'vintage'] },
  { name: 'Ellesse', demand: 58, priceMultiplier: 0.85, tier: 'mass', niches: ['sport', 'y2k'] },
  { name: 'Hollister', demand: 48, priceMultiplier: 0.7, tier: 'mass', niches: ['other'] },
  {
    name: 'Abercrombie & Fitch',
    demand: 54,
    priceMultiplier: 0.85,
    tier: 'mass',
    niches: ['y2k'],
    aliases: ['abercrombie'],
  },
  { name: 'Uniqlo', demand: 50, priceMultiplier: 0.6, tier: 'mass', niches: ['other'] },
  { name: 'Massimo Dutti', demand: 52, priceMultiplier: 0.8, tier: 'mass', niches: ['other'] },
  { name: 'Bershka', demand: 38, priceMultiplier: 0.4, tier: 'mass', niches: ['other'] },
  {
    name: 'Pull&Bear',
    demand: 38,
    priceMultiplier: 0.4,
    tier: 'mass',
    niches: ['other'],
    aliases: ['pull and bear', 'pull & bear'],
  },
  { name: 'Zara', demand: 45, priceMultiplier: 0.45, tier: 'mass', niches: ['other'] },
  {
    name: 'H&M',
    demand: 35,
    priceMultiplier: 0.35,
    tier: 'mass',
    niches: ['other'],
    aliases: ['h & m', 'hm'],
  },
  { name: 'Shein', demand: 20, priceMultiplier: 0.25, tier: 'mass', niches: ['other'] },
  { name: 'Primark', demand: 22, priceMultiplier: 0.25, tier: 'mass', niches: ['other'] },
  {
    name: 'Decathlon',
    demand: 30,
    priceMultiplier: 0.35,
    tier: 'mass',
    niches: ['sport'],
    aliases: ['quechua'],
  },
];

/** Iconic models that sell well above the brand average (multiplier on the estimated value). */
export const MODEL_PREMIUMS: { keywords: string[]; multiplier: number; label: string }[] = [
  { keywords: ['nuptse', '1996 retro', 'himalayan'], multiplier: 1.6, label: 'Nuptse' },
  { keywords: ['detroit', 'active jacket', 'santa fe'], multiplier: 1.45, label: 'Detroit / Active' },
  { keywords: ['double knee', 'carpenter'], multiplier: 1.25, label: 'Double Knee' },
  { keywords: ['box logo', 'bogo'], multiplier: 1.8, label: 'Box Logo' },
  { keywords: ['spellout', 'center swoosh', 'centre swoosh'], multiplier: 1.25, label: 'Spellout' },
  { keywords: ['acg'], multiplier: 1.3, label: 'ACG' },
  { keywords: ['samba', 'gazelle', 'spezial'], multiplier: 1.3, label: 'Samba / Gazelle' },
  { keywords: ['firebird', 'beckenbauer'], multiplier: 1.2, label: 'Firebird' },
  { keywords: ['synchilla', 'retro x', 'retro-x'], multiplier: 1.35, label: 'Synchilla / Retro-X' },
  { keywords: ['beta', 'alpha sv', 'atom'], multiplier: 1.3, label: 'Beta / Atom' },
  { keywords: ['cable knit', 'trecce'], multiplier: 1.15, label: 'Cable knit' },
  { keywords: ['polo bear'], multiplier: 1.8, label: 'Polo Bear' },
  { keywords: ['501', 'made in usa'], multiplier: 1.2, label: '501 / Made in USA' },
  { keywords: ['dunk', 'jordan 1', 'air jordan 1'], multiplier: 1.5, label: 'Dunk / Jordan 1' },
  { keywords: ['550', '2002r', '9060', '990'], multiplier: 1.4, label: 'New Balance iconiche' },
  { keywords: ['badge', 'ghost piece', 'shadow project'], multiplier: 1.15, label: 'Badge originale' },
  { keywords: ['goggle'], multiplier: 1.3, label: 'Goggle' },
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
  { value: 'ebay', label: 'eBay', available: true },
  { value: 'etsy', label: 'Etsy', available: true },
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
  const norm = (x: string) =>
    x
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.'’]/g, '')
      .trim()
      .toLowerCase();
  const n = norm(name);
  return BRANDS.find((b) => norm(b.name) === n || b.aliases?.some((a) => norm(a) === n));
}

/** Premium multiplier for iconic models mentioned in a title/name (1 when none). */
export function modelPremium(text: string | null | undefined): { multiplier: number; label: string | null } {
  const t = (text ?? '').toLowerCase();
  for (const m of MODEL_PREMIUMS)
    if (m.keywords.some((k) => t.includes(k))) return { multiplier: m.multiplier, label: m.label };
  return { multiplier: 1, label: null };
}
/** Brands not in the reference list get a neutral profile so pricing still works. */
export function brandOrDefault(name: string): BrandInfo {
  return findBrand(name) ?? { name, demand: 55, priceMultiplier: 0.9, tier: 'mass', niches: ['other'] };
}
