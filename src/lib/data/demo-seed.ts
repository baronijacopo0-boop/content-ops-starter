/**
 * Realistic demo dataset (inventory, sales over 6 months, listings, watchlists, notifications).
 * Shared by the local demo mode and the Supabase seeding (onboarding checkbox / scripts/seed-demo-user.ts).
 * Dates are relative to "now" so the dashboard always looks current.
 */
import type {
  AppNotification,
  Condition,
  InventoryItem,
  InventoryStatus,
  ItemCategory,
  Listing,
  Sale,
  Watchlist,
} from '@/lib/domain/types';
import { addDays, round, seededRandom, toISODate } from '@/lib/utils';

export interface DemoBundle {
  inventory: Omit<InventoryItem, 'userId'>[];
  listings: Omit<Listing, 'userId'>[];
  sales: Omit<Sale, 'userId'>[];
  watchlists: Omit<Watchlist, 'userId'>[];
  notifications: Omit<AppNotification, 'userId'>[];
}

type SoldSeed = [
  name: string,
  brand: string,
  category: ItemCategory,
  size: string,
  condition: Condition,
  buy: number,
  sell: number,
  extra: number,
  daysAgo: number,
  daysToSell: number,
  source: string,
];

// 30 sales spread over ~6 months with different ROI profiles per brand.
const SOLD: SoldSeed[] = [
  ['Felpa Nike Spellout vintage grigia', 'Nike', 'hoodie', 'M', 'very_good', 12, 38, 1.5, 3, 6, 'Vinted'],
  ['Felpa Nike Center Swoosh nera', 'Nike', 'hoodie', 'L', 'very_good', 15, 36, 1.5, 9, 8, 'Mercatino'],
  ['Giacca Nike windbreaker anni 90', 'Nike', 'jacket', 'L', 'good', 14, 42, 2, 21, 5, 'Svuota cantine'],
  ['T-shirt Nike vintage mini swoosh', 'Nike', 'tshirt', 'M', 'very_good', 5, 18, 1, 34, 7, 'Mercatino'],
  ['Nike Air Max 90 bianche', 'Nike', 'sneakers', '43', 'good', 35, 68, 3, 58, 9, 'Vinted'],
  ['Felpa Nike ACG pile', 'Nike', 'sweater', 'XL', 'very_good', 18, 45, 1.5, 96, 11, 'Charity shop'],
  ['Giacca Carhartt Detroit marrone', 'Carhartt', 'jacket', 'L', 'good', 45, 110, 3, 6, 10, 'Vinted'],
  ['Pantaloni Carhartt Double Knee', 'Carhartt', 'pants', '32', 'good', 20, 55, 2, 27, 13, 'Mercatino'],
  ['Felpa Carhartt WIP logo', 'Carhartt', 'hoodie', 'M', 'very_good', 16, 42, 1.5, 49, 9, 'Vinted'],
  [
    'Giacca Carhartt Active con cappuccio',
    'Carhartt',
    'jacket',
    'XL',
    'good',
    38,
    85,
    3,
    121,
    15,
    'Svuota cantine',
  ],
  [
    'Maglione Ralph Lauren cable knit',
    'Ralph Lauren',
    'sweater',
    'M',
    'very_good',
    15,
    39,
    1.5,
    12,
    26,
    'Charity shop',
  ],
  [
    'Camicia Ralph Lauren Oxford azzurra',
    'Ralph Lauren',
    'shirt',
    'L',
    'very_good',
    8,
    22,
    1,
    40,
    31,
    'Mercatino',
  ],
  ['Polo Ralph Lauren custom fit', 'Ralph Lauren', 'tshirt', 'M', 'good', 7, 16, 1, 77, 38, 'Vinted'],
  [
    'Maglione Ralph Lauren half zip',
    'Ralph Lauren',
    'sweater',
    'L',
    'very_good',
    18,
    35,
    1.5,
    140,
    34,
    'Vinted',
  ],
  [
    'Giacca tuta Adidas Firebird blu',
    'Adidas',
    'tracksuit',
    'L',
    'very_good',
    14,
    32,
    1.5,
    15,
    12,
    'Mercatino',
  ],
  ['Adidas Samba OG nere', 'Adidas', 'sneakers', '42', 'very_good', 45, 72, 3, 44, 7, 'Vinted'],
  ['Felpa Adidas trefoil vintage', 'Adidas', 'hoodie', 'M', 'good', 13, 26, 1.5, 82, 16, 'Charity shop'],
  ['Maglia calcio Adidas vintage', 'Adidas', 'tshirt', 'L', 'good', 10, 28, 1, 160, 14, 'Svuota cantine'],
  ['Piumino The North Face Nuptse', 'The North Face', 'jacket', 'M', 'good', 70, 145, 4, 18, 8, 'Vinted'],
  [
    'Pile The North Face Denali',
    'The North Face',
    'sweater',
    'L',
    'very_good',
    25,
    62,
    2,
    66,
    10,
    'Mercatino',
  ],
  ["Levi's 501 vintage W32", "Levi's", 'jeans', '32', 'good', 12, 30, 2, 24, 15, 'Mercatino'],
  ["Giacca jeans Levi's trucker", "Levi's", 'jacket', 'M', 'very_good', 18, 40, 2, 103, 19, 'Charity shop'],
  ['Polo Lacoste verde', 'Lacoste', 'tshirt', 'L', 'very_good', 8, 24, 1, 30, 11, 'Vinted'],
  ['Felpa Lacoste girocollo', 'Lacoste', 'hoodie', 'M', 'good', 16, 30, 1.5, 112, 22, 'Mercatino'],
  ['Felpa Tommy Hilfiger flag', 'Tommy Hilfiger', 'hoodie', 'XL', 'good', 16, 24, 1.5, 52, 29, 'Vinted'],
  [
    'Camicia Tommy Hilfiger a righe',
    'Tommy Hilfiger',
    'shirt',
    'L',
    'good',
    10,
    14,
    1,
    135,
    41,
    'Charity shop',
  ],
  ['Felpa Champion reverse weave', 'Champion', 'hoodie', 'M', 'good', 14, 28, 1.5, 70, 14, 'Mercatino'],
  ['Felpa Zara oversize', 'Zara', 'hoodie', 'M', 'good', 12, 10, 1.5, 88, 45, 'Vinted'],
  ['Giubbotto Zara similpelle', 'Zara', 'jacket', 'L', 'good', 15, 13, 2, 150, 52, 'Outlet'],
  ['Felpa Stone Island crewneck', 'Stone Island', 'sweater', 'L', 'very_good', 75, 140, 4, 37, 12, 'Vinted'],
];

type InvSeed = [
  name: string,
  brand: string,
  category: ItemCategory,
  size: string,
  condition: Condition,
  buy: number,
  listed: number | null,
  daysAgo: number,
  status: InventoryStatus,
  source: string,
];

// 15 unsold items with every status and every stock-age bucket.
const UNSOLD: InvSeed[] = [
  [
    'Felpa Nike vintage con cappuccio',
    'Nike',
    'hoodie',
    'L',
    'very_good',
    14,
    null,
    2,
    'to_photograph',
    'Vinted',
  ],
  [
    'Giacca Carhartt Michigan chore',
    'Carhartt',
    'jacket',
    'M',
    'good',
    40,
    null,
    4,
    'to_photograph',
    'Svuota cantine',
  ],
  [
    'Maglione Ralph Lauren con pony',
    'Ralph Lauren',
    'sweater',
    'M',
    'very_good',
    16,
    null,
    6,
    'to_list',
    'Charity shop',
  ],
  ['Pile Patagonia Synchilla', 'Patagonia', 'sweater', 'L', 'very_good', 22, null, 9, 'to_list', 'Vinted'],
  ['T-shirt Stüssy logo', 'Stüssy', 'tshirt', 'M', 'very_good', 12, 32, 11, 'listed', 'Vinted'],
  ['Adidas Gazelle blu', 'Adidas', 'sneakers', '43', 'good', 30, 58, 13, 'listed', 'Mercatino'],
  ['Giacca The North Face Mountain', 'The North Face', 'jacket', 'L', 'good', 45, 99, 19, 'listed', 'Vinted'],
  ["Levi's 550 baggy", "Levi's", 'jeans', '34', 'good', 14, 32, 23, 'reserved', 'Mercatino'],
  ['Felpa Nike Air vintage blu', 'Nike', 'hoodie', 'M', 'good', 13, 34, 27, 'listed', 'Charity shop'],
  ['Camicia Ralph Lauren flanella', 'Ralph Lauren', 'shirt', 'XL', 'good', 9, 25, 38, 'listed', 'Mercatino'],
  ['Maglione Tommy Hilfiger', 'Tommy Hilfiger', 'sweater', 'L', 'good', 15, 29, 45, 'listed', 'Vinted'],
  ['Tuta Kappa anni 90', 'Kappa', 'tracksuit', 'M', 'good', 18, 35, 52, 'listed', 'Svuota cantine'],
  ['Felpa Fila logo grande', 'Fila', 'hoodie', 'L', 'good', 15, 28, 67, 'listed', 'Mercatino'],
  ['Giubbotto Diesel denim', 'Diesel', 'jacket', 'M', 'good', 25, 45, 74, 'listed', 'Outlet'],
  ['Felpa H&M basic', 'H&M', 'hoodie', 'M', 'fair', 10, 16, 89, 'listed', 'Vinted'],
];

export function buildDemoBundle(now = new Date(), idFactory: () => string): DemoBundle {
  const rand = seededRandom(2024);
  const inventory: DemoBundle['inventory'] = [];
  const sales: DemoBundle['sales'] = [];
  const listings: DemoBundle['listings'] = [];
  const iso = (d: Date) => d.toISOString();

  for (const [
    name,
    brand,
    category,
    size,
    condition,
    buy,
    sell,
    extra,
    daysAgo,
    daysToSell,
    source,
  ] of SOLD) {
    const soldAt = addDays(now, -daysAgo);
    const purchased = addDays(soldAt, -daysToSell);
    const id = idFactory();
    const listingId = idFactory();
    inventory.push({
      id,
      name,
      brand,
      category,
      size,
      condition,
      purchasePrice: buy,
      purchaseDate: toISODate(purchased),
      source,
      listedPrice: round(sell * 1.08, 0),
      soldPrice: sell,
      extraCosts: extra,
      status: 'sold',
      photos: [],
      notes: '',
      soldAt: toISODate(soldAt),
      createdAt: iso(purchased),
      updatedAt: iso(soldAt),
    });
    listings.push({
      id: listingId,
      inventoryItemId: id,
      title: name,
      description: `${name}. Taglia ${size}. Spedizione rapida.`,
      brand,
      category,
      size,
      condition,
      colors: [],
      material: '',
      style: '',
      price: sell,
      photos: [],
      views: 40 + Math.floor(rand() * 260),
      favorites: 3 + Math.floor(rand() * 30),
      status: 'sold',
      marketplace: 'vinted',
      publishedAt: iso(addDays(purchased, 1)),
      createdAt: iso(addDays(purchased, 1)),
      updatedAt: iso(soldAt),
    });
    sales.push({
      id: idFactory(),
      inventoryItemId: id,
      listingId,
      productName: name,
      brand,
      category,
      purchasePrice: buy,
      salePrice: sell,
      extraCosts: extra,
      purchasedAt: toISODate(purchased),
      soldAt: toISODate(soldAt),
      platform: 'vinted',
      createdAt: iso(soldAt),
    });
  }

  for (const [name, brand, category, size, condition, buy, listed, daysAgo, status, source] of UNSOLD) {
    const purchased = addDays(now, -daysAgo);
    const id = idFactory();
    inventory.push({
      id,
      name,
      brand,
      category,
      size,
      condition,
      purchasePrice: buy,
      purchaseDate: toISODate(purchased),
      source,
      listedPrice: listed,
      soldPrice: null,
      extraCosts: 0,
      status,
      photos: [],
      notes: status === 'to_photograph' ? 'Lavare prima delle foto' : '',
      soldAt: null,
      createdAt: iso(purchased),
      updatedAt: iso(purchased),
    });
    if (status === 'listed' || status === 'reserved') {
      listings.push({
        id: idFactory(),
        inventoryItemId: id,
        title: name,
        description: `${name}. Taglia ${size}. Per misure o altre foto scrivetemi pure.`,
        brand,
        category,
        size,
        condition,
        colors: [],
        material: '',
        style: '',
        price: listed ?? buy * 2,
        photos: [],
        views: Math.floor(daysAgo * (2 + rand() * 6)),
        favorites: Math.floor(daysAgo * rand() * 0.6),
        status: status === 'reserved' ? 'reserved' : 'published',
        marketplace: 'vinted',
        publishedAt: iso(addDays(purchased, 2)),
        createdAt: iso(addDays(purchased, 2)),
        updatedAt: iso(addDays(purchased, 2)),
      });
    }
  }

  // Two AI drafts for items still to be listed
  for (const inv of inventory.filter((i) => i.status === 'to_list')) {
    listings.push({
      id: idFactory(),
      inventoryItemId: inv.id,
      title: inv.name,
      description: `${inv.name}. Taglia ${inv.size}. Condizioni molto buone, normali segni di utilizzo.\nPer misure o altre foto scrivetemi pure.`,
      brand: inv.brand,
      category: inv.category,
      size: inv.size,
      condition: inv.condition,
      colors: [],
      material: '',
      style: 'vintage',
      price: inv.purchasePrice * 2 + 4,
      photos: [],
      views: 0,
      favorites: 0,
      status: 'draft',
      marketplace: 'vinted',
      publishedAt: null,
      createdAt: iso(now),
      updatedAt: iso(now),
    });
  }

  const wl = (
    name: string,
    query: string,
    brand: string | null,
    category: ItemCategory | null,
    maxPrice: number,
    minRoi: number | null,
    minDealScore: number | null,
  ): DemoBundle['watchlists'][number] => ({
    id: idFactory(),
    name,
    query,
    brand,
    category,
    size: null,
    condition: null,
    maxPrice,
    minRoi,
    minDealScore,
    notify: true,
    isActive: true,
    createdAt: iso(addDays(now, -Math.floor(rand() * 30))),
  });
  const watchlists = [
    wl('Nike Vintage < €15', 'vintage', 'Nike', null, 15, 80, 70),
    wl('Ralph Lauren Sweater < €20', '', 'Ralph Lauren', 'sweater', 20, 60, 65),
    wl('Carhartt Jacket < €30', '', 'Carhartt', 'jacket', 30, 100, null),
    wl('Adidas Football Vintage < €20', 'vintage', 'Adidas', 'tracksuit', 20, null, 60),
    wl('TNF sotto €90', '', 'The North Face', 'jacket', 90, 50, 70),
  ];

  const notifications: DemoBundle['notifications'] = [
    {
      id: idFactory(),
      type: 'hot_deal',
      title: 'Nuovo Hot Deal trovato',
      body: 'Nike Vintage Hoodie Spellout a €14 – Deal Score 88.',
      data: { dealId: 'mock-vinted-1' },
      readAt: null,
      createdAt: iso(addDays(now, 0)),
    },
    {
      id: idFactory(),
      type: 'watchlist_match',
      title: 'Watchlist "Carhartt Jacket < €30"',
      body: 'Nessun nuovo match oggi: ti avviseremo appena arriva.',
      data: {},
      readAt: null,
      createdAt: iso(addDays(now, -1)),
    },
    {
      id: idFactory(),
      type: 'stock_alert',
      title: 'Old stock',
      body: '3 articoli sono in inventario da oltre 60 giorni.',
      data: {},
      readAt: iso(addDays(now, -2)),
      createdAt: iso(addDays(now, -3)),
    },
  ];

  return { inventory, sales, listings, watchlists, notifications };
}
