/**
 * Demo marketplace data for MockVintedProvider.
 * Everything is generated locally and deterministically: no request is made to Vinted or any other platform.
 */
import type { Condition, ItemCategory } from '@/lib/domain/types';
import { BRANDS, CATEGORIES, CONDITIONS } from '@/lib/domain/constants';
import { round, seededRandom } from '@/lib/utils';
import type { ComparableItem, MarketItem } from '../types';

interface SeedDeal {
  title: string;
  brand: string;
  category: ItemCategory;
  model: string | null;
  size: string;
  condition: Condition;
  color: string;
  price: number;
  hoursAgo: number;
  description: string;
}

const DEALS: SeedDeal[] = [
  {
    title: 'Nike Vintage Hoodie Spellout',
    brand: 'Nike',
    category: 'hoodie',
    model: 'Spellout',
    size: 'M',
    condition: 'very_good',
    color: 'Grigio',
    price: 14,
    hoursAgo: 1,
    description: 'Felpa Nike anni 90 con logo spellout ricamato. Qualche segno di usura ai polsini.',
  },
  {
    title: 'Carhartt Detroit Jacket',
    brand: 'Carhartt',
    category: 'jacket',
    model: 'Detroit',
    size: 'L',
    condition: 'good',
    color: 'Marrone',
    price: 38,
    hoursAgo: 3,
    description: 'Giacca Carhartt Detroit in canvas, colletto in velluto. Usata ma solida.',
  },
  {
    title: 'Ralph Lauren Cable Knit Sweater',
    brand: 'Ralph Lauren',
    category: 'sweater',
    model: 'Cable Knit',
    size: 'M',
    condition: 'very_good',
    color: 'Blu navy',
    price: 16,
    hoursAgo: 2,
    description: 'Maglione a trecce Ralph Lauren, logo pony ricamato.',
  },
  {
    title: 'The North Face Nuptse 700',
    brand: 'The North Face',
    category: 'jacket',
    model: 'Nuptse 700',
    size: 'S',
    condition: 'good',
    color: 'Nero',
    price: 85,
    hoursAgo: 6,
    description: 'Piumino TNF Nuptse 700, piccolo segno sulla manica sinistra.',
  },
  {
    title: 'Adidas Originals Track Jacket Vintage',
    brand: 'Adidas',
    category: 'tracksuit',
    model: 'Firebird',
    size: 'L',
    condition: 'very_good',
    color: 'Blu',
    price: 12,
    hoursAgo: 4,
    description: 'Giacca tuta Adidas vintage, tre strisce bianche.',
  },
  {
    title: "Levi's 501 Vintage W32",
    brand: "Levi's",
    category: 'jeans',
    model: '501',
    size: '32',
    condition: 'good',
    color: 'Denim chiaro',
    price: 15,
    hoursAgo: 8,
    description: "Levi's 501 lavaggio chiaro, made in USA.",
  },
  {
    title: 'Stone Island Crewneck Badge',
    brand: 'Stone Island',
    category: 'sweater',
    model: 'Crewneck',
    size: 'L',
    condition: 'very_good',
    color: 'Verde oliva',
    price: 95,
    hoursAgo: 5,
    description: 'Felpa girocollo Stone Island con badge originale.',
  },
  {
    title: 'Supreme Box Logo Tee',
    brand: 'Supreme',
    category: 'tshirt',
    model: 'Box Logo',
    size: 'M',
    condition: 'new',
    color: 'Bianco',
    price: 60,
    hoursAgo: 12,
    description: 'T-shirt Supreme box logo, mai indossata.',
  },
  {
    title: 'Lacoste Polo Vintage Croc',
    brand: 'Lacoste',
    category: 'tshirt',
    model: 'Polo L1212',
    size: 'L',
    condition: 'very_good',
    color: 'Verde',
    price: 9,
    hoursAgo: 7,
    description: 'Polo Lacoste classica, coccodrillo ricamato.',
  },
  {
    title: 'Tommy Hilfiger Flag Sweatshirt',
    brand: 'Tommy Hilfiger',
    category: 'hoodie',
    model: 'Flag',
    size: 'XL',
    condition: 'good',
    color: 'Rosso',
    price: 18,
    hoursAgo: 20,
    description: 'Felpa Tommy anni 90 con bandiera ricamata.',
  },
  {
    title: 'Nike Air Max 90',
    brand: 'Nike',
    category: 'sneakers',
    model: 'Air Max 90',
    size: '43',
    condition: 'good',
    color: 'Bianco/Rosso',
    price: 45,
    hoursAgo: 9,
    description: 'Air Max 90 usate, suola in buono stato.',
  },
  {
    title: 'Patagonia Synchilla Fleece',
    brand: 'Patagonia',
    category: 'sweater',
    model: 'Synchilla',
    size: 'M',
    condition: 'very_good',
    color: 'Beige',
    price: 22,
    hoursAgo: 11,
    description: 'Pile Patagonia Synchilla snap-T, colori vintage.',
  },
  {
    title: 'Stüssy Logo Hoodie',
    brand: 'Stüssy',
    category: 'hoodie',
    model: null,
    size: 'L',
    condition: 'very_good',
    color: 'Nero',
    price: 30,
    hoursAgo: 14,
    description: 'Felpa Stüssy con logo stock sul petto.',
  },
  {
    title: 'Champion Reverse Weave',
    brand: 'Champion',
    category: 'hoodie',
    model: 'Reverse Weave',
    size: 'M',
    condition: 'good',
    color: 'Grigio',
    price: 17,
    hoursAgo: 15,
    description: 'Felpa Champion reverse weave, leggermente scolorita.',
  },
  {
    title: 'Adidas Samba OG',
    brand: 'Adidas',
    category: 'sneakers',
    model: 'Samba',
    size: '42',
    condition: 'very_good',
    color: 'Nero',
    price: 48,
    hoursAgo: 10,
    description: 'Samba OG indossate poche volte.',
  },
  {
    title: 'Carhartt Double Knee Pants',
    brand: 'Carhartt',
    category: 'pants',
    model: 'Double Knee',
    size: '32',
    condition: 'good',
    color: 'Beige',
    price: 24,
    hoursAgo: 26,
    description: 'Pantaloni da lavoro Carhartt double knee.',
  },
  {
    title: 'Zara Basic Hoodie',
    brand: 'Zara',
    category: 'hoodie',
    model: null,
    size: 'M',
    condition: 'good',
    color: 'Nero',
    price: 12,
    hoursAgo: 30,
    description: 'Felpa Zara basic, buone condizioni.',
  },
  {
    title: 'Ralph Lauren Oxford Shirt',
    brand: 'Ralph Lauren',
    category: 'shirt',
    model: 'Oxford',
    size: 'L',
    condition: 'very_good',
    color: 'Azzurro',
    price: 11,
    hoursAgo: 18,
    description: 'Camicia Oxford Ralph Lauren custom fit.',
  },
  {
    title: "Arc'teryx Beta Shell",
    brand: "Arc'teryx",
    category: 'jacket',
    model: 'Beta',
    size: 'M',
    condition: 'very_good',
    color: 'Verde',
    price: 120,
    hoursAgo: 22,
    description: "Giacca Arc'teryx Beta Gore-Tex, nessun difetto.",
  },
  {
    title: 'H&M Felpa Oversize',
    brand: 'H&M',
    category: 'hoodie',
    model: null,
    size: 'L',
    condition: 'fair',
    color: 'Grigio',
    price: 10,
    hoursAgo: 40,
    description: 'Felpa H&M usata, qualche pallino.',
  },
];

const SELLERS = [
  'giulia.vintage',
  'marco_thrift',
  'streetstore_mi',
  'retro.roma',
  'closet.anna',
  'y2k_lover',
  'fede.archive',
  'secondhand.to',
];

export function buildDealFeed(now = new Date()): MarketItem[] {
  const rand = seededRandom(42);
  return DEALS.map((d, i) => ({
    id: `mock-vinted-${i + 1}`,
    marketplace: 'vinted' as const,
    externalId: `demo-${100000 + i}`,
    title: d.title,
    description: d.description,
    brand: d.brand,
    category: d.category,
    model: d.model,
    size: d.size,
    condition: d.condition,
    color: d.color,
    price: d.price,
    imageUrl: null,
    listedAt: new Date(now.getTime() - d.hoursAgo * 3_600_000).toISOString(),
    favorites: Math.floor(rand() * 25),
    views: 20 + Math.floor(rand() * 300),
    sellerName: SELLERS[i % SELLERS.length],
    sellerRating: round(4 + rand(), 1),
    url: null,
  }));
}

const MODELS: Partial<Record<ItemCategory, string[]>> = {
  hoodie: ['Spellout', 'Logo', 'Vintage', 'Zip'],
  jacket: ['Detroit', 'Nuptse', 'Windbreaker', 'Bomber'],
  sneakers: ['Air Max 90', 'Samba', 'Dunk Low', '550'],
  jeans: ['501', '550', 'Baggy'],
  sweater: ['Crewneck', 'Cable Knit', 'Fleece'],
};

/**
 * Generates a reproducible set of comparables (sold + active) for every brand × category pair.
 * Prices follow the brand multiplier and condition factor with realistic noise, so the market metrics
 * computed from them behave like real data.
 */
export function buildComparables(now = new Date()): ComparableItem[] {
  const rand = seededRandom(1337);
  const out: ComparableItem[] = [];
  let n = 0;
  for (const brand of BRANDS) {
    for (const cat of CATEGORIES) {
      if (cat.value === 'sneakers' && !brand.niches.includes('sneakers') && brand.tier === 'mass') continue;
      const count = 4 + Math.floor(rand() * 10 * (brand.demand / 100));
      for (let i = 0; i < count; i++) {
        const cond = CONDITIONS[Math.min(4, Math.floor(rand() * rand() * 5 + rand() * 2))];
        const noise = 0.75 + rand() * 0.55;
        const price = round(cat.basePrice * brand.priceMultiplier * cond.priceFactor * noise, 0);
        const sold = rand() < 0.35 + brand.demand / 200;
        const speed = cat.speedDays * Math.pow(100 / brand.demand, 1.1) * (0.5 + rand());
        const daysOnMarket = Math.max(1, Math.round(speed));
        const listedDaysAgo = daysOnMarket + Math.floor(rand() * 150);
        const listedAt = new Date(now.getTime() - listedDaysAgo * 86_400_000);
        const soldAt = sold ? new Date(listedAt.getTime() + daysOnMarket * 86_400_000) : null;
        const models = MODELS[cat.value];
        out.push({
          id: `comp-${++n}`,
          marketplace: 'vinted',
          brand: brand.name,
          category: cat.value,
          model: models ? models[Math.floor(rand() * models.length)] : null,
          size: ['S', 'M', 'L', 'XL'][Math.floor(rand() * 4)],
          condition: cond.value,
          price: round(price * (1.05 + rand() * 0.15), 0),
          soldPrice: sold ? price : null,
          daysOnMarket: sold ? daysOnMarket : Math.floor(rand() * 60) + 1,
          listedAt: listedAt.toISOString(),
          soldAt: soldAt ? soldAt.toISOString() : null,
        });
      }
    }
  }
  return out;
}
