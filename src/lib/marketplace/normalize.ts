import type { Condition, ItemCategory } from '@/lib/domain/types';
import { BRANDS } from '@/lib/domain/constants';

/**
 * Helpers that turn free-text marketplace listings (eBay, Etsy, CSV imports…) into RIVENDO's
 * normalized fields. Matching is word-based and conservative: when nothing matches we return null
 * instead of guessing.
 */

// Order matters: more specific garments first (e.g. "sweatshirt" before "shirt").
export const CATEGORY_KEYWORDS: [ItemCategory, string[]][] = [
  [
    'sneakers',
    [
      'sneaker',
      'sneakers',
      'scarpe',
      'shoes',
      'air max',
      'airmax',
      'samba',
      'gazelle',
      'dunk',
      'jordan',
      'new balance 550',
    ],
  ],
  ['tracksuit', ['tracksuit', 'track jacket', 'track top', 'tuta', 'firebird']],
  ['hoodie', ['hoodie', 'hoody', 'felpa', 'sweatshirt', 'crewneck', 'pullover hood']],
  [
    'jacket',
    [
      'jacket',
      'giacca',
      'giubbotto',
      'giubbino',
      'piumino',
      'puffer',
      'windbreaker',
      'bomber',
      'parka',
      'nuptse',
      'shell',
      'cappotto',
      'coat',
    ],
  ],
  ['sweater', ['sweater', 'maglione', 'knit', 'cardigan', 'pile', 'fleece', 'jumper', 'maglioncino']],
  ['jeans', ['jeans', 'denim', '501', '550', '505']],
  ['pants', ['pants', 'pantaloni', 'cargo', 'trousers', 'chino', 'double knee', 'carpenter']],
  ['tshirt', ['t-shirt', 'tshirt', 'tee', 'maglietta', 'polo', 'jersey', 'maglia']],
  ['shirt', ['shirt', 'camicia', 'oxford', 'flannel', 'flanella']],
  [
    'accessories',
    [
      'cappello',
      'hat',
      'cap',
      'beanie',
      'borsa',
      'bag',
      'sciarpa',
      'scarf',
      'belt',
      'cintura',
      'zaino',
      'backpack',
    ],
  ],
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (k: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${escape(k)}($|[^\\p{L}\\p{N}])`, 'iu');
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, '').toLowerCase();

export function detectCategory(text: string): ItemCategory | null {
  const t = plain(text);
  for (const [cat, kws] of CATEGORY_KEYWORDS) if (kws.some((k) => wordRe(plain(k)).test(t))) return cat;
  return null;
}

export function detectBrand(text: string, extraBrands: string[] = []): string | null {
  const t = plain(text);
  // Every spelling that maps to a canonical brand name. Very short aliases (e.g. "hm", "ck") are
  // skipped here because they create false positives in free text.
  const candidates: [string, string][] = [
    ...BRANDS.flatMap((b) => [
      [b.name, b.name] as [string, string],
      ...(b.aliases ?? []).filter((a) => a.length > 2).map((a) => [a, b.name] as [string, string]),
    ]),
    ...extraBrands.map((b) => [b, b] as [string, string]),
  ];
  // Longest spellings first so "Polo Ralph Lauren" / "The North Face" win over shorter overlaps.
  for (const [spelling, canonical] of candidates.sort((a, b) => b[0].length - a[0].length)) {
    if (wordRe(plain(spelling)).test(t)) return canonical;
  }
  if (/\btnf\b/i.test(text)) return 'The North Face';
  if (/\bpolo ralph\b/i.test(text)) return 'Ralph Lauren';
  return null;
}

export type StyleTag =
  'vintage' | 'streetwear' | 'sport' | 'designer' | 'y2k' | 'workwear' | 'outdoor' | 'casual';

const STYLE_KEYWORDS: [StyleTag, string[]][] = [
  [
    'vintage',
    [
      'vintage',
      'anni 80',
      'anni 90',
      '80s',
      '90s',
      '70s',
      'retro',
      'single stitch',
      'made in usa',
      'made in italy vintage',
      'old school',
    ],
  ],
  ['y2k', ['y2k', '2000s', 'anni 2000', 'low rise', 'vita bassa']],
  ['workwear', ['workwear', 'work jacket', 'double knee', 'carpenter', 'chore', 'detroit', 'canvas']],
  [
    'outdoor',
    ['outdoor', 'gore-tex', 'goretex', 'fleece', 'pile', 'trekking', 'gorpcore', 'puffer', 'piumino'],
  ],
  ['sport', ['sport', 'football', 'calcio', 'jersey', 'maglia', 'track', 'running', 'training', 'tuta']],
  ['streetwear', ['streetwear', 'oversize', 'oversized', 'skate', 'hype', 'box logo']],
];

/**
 * Style of a garment: explicit keywords first (vintage, Y2K, workwear…), then the brand's main niche,
 * then "casual" for everyday basics.
 */
export function detectStyle(text: string, brand?: string | null): StyleTag {
  const t = plain(text);
  for (const [style, kws] of STYLE_KEYWORDS) if (kws.some((k) => wordRe(plain(k)).test(t))) return style;
  const info = brand ? BRANDS.find((b) => b.name === brand) : undefined;
  const niche = info?.niches[0];
  if (niche === 'designer') return 'designer';
  if (niche === 'sport' || niche === 'sneakers') return 'sport';
  if (niche === 'streetwear') return 'streetwear';
  if (niche === 'vintage') return 'vintage';
  if (niche === 'y2k') return 'y2k';
  return 'casual';
}

const MATERIALS: [string, string[]][] = [
  ['cotone', ['cotton', 'cotone', 'coton', 'baumwolle', 'algodon']],
  ['lana', ['wool', 'lana', 'laine', 'wolle', 'merino', 'lambswool']],
  ['cashmere', ['cashmere', 'cachemire', 'kaschmir']],
  ['poliestere', ['polyester', 'poliestere', 'polyester']],
  ['poliammide (nylon)', ['polyamide', 'poliammide', 'nylon']],
  ['elastan', ['elastane', 'elastan', 'spandex', 'lycra']],
  ['lino', ['linen', 'lino', 'lin']],
  ['denim', ['denim']],
  ['pelle', ['leather', 'pelle', 'cuir', 'leder']],
  ['piumino d’oca', ['down', 'piuma', 'goose']],
  ['acrilico', ['acrylic', 'acrilico']],
  ['viscosa', ['viscose', 'viscosa', 'rayon']],
];

/**
 * Material from label text such as "80% COTTON 20% POLYESTER": returns e.g. "80% cotone, 20% poliestere".
 * Returns null when nothing is written – materials are never guessed.
 */
export function detectMaterial(text: string): string | null {
  const t = plain(text);
  const found: string[] = [];
  const re = /(\d{1,3})\s?%\s?([a-z]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const name = MATERIALS.find(([, kws]) => kws.includes(m![2]))?.[0];
    if (name && Number(m[1]) <= 100) found.push(`${m[1]}% ${name}`);
  }
  if (found.length) return Array.from(new Set(found)).join(', ');
  const plainHit = MATERIALS.find(([, kws]) => kws.some((k) => k.length > 3 && wordRe(k).test(t)));
  return plainHit ? plainHit[0] : null;
}

const FEATURES: [string, string[]][] = [
  ['logo ricamato', ['embroidered', 'ricamato', 'ricamo', 'embroidery']],
  ['stampa grafica', ['graphic', 'print', 'stampa', 'stampato']],
  ['cappuccio', ['hood', 'hooded', 'cappuccio']],
  ['zip intera', ['full zip', 'zip up', 'full-zip', 'zip intera']],
  ['mezza zip', ['half zip', 'quarter zip', '1/4 zip', 'mezza zip']],
  ['tasca a marsupio', ['kangaroo pocket', 'tasca a marsupio']],
  ['bottoni a pressione', ['snap', 'bottoni a pressione']],
  ['impermeabile', ['waterproof', 'gore-tex', 'goretex', 'impermeabile']],
  ['spellout', ['spellout']],
  ['logo piccolo', ['small logo', 'mini swoosh', 'logo piccolo']],
];

/** Notable features mentioned in a title/description/label (used to enrich listings). */
export function detectFeatures(text: string): string[] {
  const t = plain(text);
  return FEATURES.filter(([, kws]) => kws.some((k) => wordRe(plain(k)).test(t))).map(([f]) => f);
}

export interface LabelReading {
  brand: string | null;
  size: string | null;
  material: string | null;
  madeIn: string | null;
}

/** Parses OCR text read from a clothing label (brand, size, composition, origin). */
export function parseLabelText(text: string): LabelReading {
  const upper = text.toUpperCase();
  const size =
    upper.match(
      /\b(?:SIZE|TAGLIA|TG|TAILLE|GR(?:ÖSSE)?)\.?\s*:?\s*(XXXL|XXL|XXS|XS|XL|S|M|L|\d{2})\b/,
    )?.[1] ??
    upper.match(/(?:^|\s)(XXXL|XXL|XXS|XS|XL|S|M|L)(?:\s*\/\s*[A-Z0-9]+)?\s*$/m)?.[1] ??
    null;
  const madeIn = text.match(/made in ([a-zà-ÿ ]{3,20})/i)?.[1]?.trim() ?? null;
  return {
    brand: detectBrand(text),
    size,
    material: detectMaterial(text),
    madeIn: madeIn ? madeIn.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : null,
  };
}

const LETTER_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

/** Finds a size in titles like "Taglia M", "Size L", "Tg. XL", "W32", "EU 43". */
export function detectSize(text: string, category: ItemCategory | null): string | null {
  const t = ` ${text.toUpperCase().replace(/[()[\],/|-]/g, ' ')} `;
  const tagged = t.match(/\b(?:TAGLIA|TG\.?|SIZE|SZ)\s*:?\s*(XXXL|XXL|XXS|XS|XL|S|M|L|\d{2}(?:[.,]5)?)\b/);
  if (tagged) return tagged[1].replace(',', '.');
  if (category === 'sneakers') {
    const eu = t.match(/\b(?:EU|EUR)\s*(\d{2}(?:[.,]5)?)\b/) ?? t.match(/\b(3[5-9]|4[0-7])(?:[.,]5)?\b/);
    if (eu) return eu[1].replace(',', '.');
  }
  if (category === 'jeans' || category === 'pants') {
    const w = t.match(/\bW\s?(2[4-9]|3\d|4[0-4])\b/);
    if (w) return w[1];
  }
  for (const s of [...LETTER_SIZES].sort((a, b) => b.length - a.length)) {
    if (s.length === 1) continue; // single letters are too ambiguous in free text
    if (new RegExp(`\\s${s}\\s`).test(t)) return s;
  }
  return null;
}

/**
 * eBay condition IDs → RIVENDO condition.
 * 1000 New with tags · 1500 New without tags · 1750 New with defects · 2750 Pre-owned like new (some categories)
 * 2990 Pre-owned excellent · 3000 Used / Pre-owned good · 3010 Pre-owned fair · 7000 For parts
 */
export function mapEbayCondition(conditionId: string | undefined | null, label?: string | null): Condition {
  switch (conditionId) {
    case '1000':
      return 'new_with_tags';
    case '1500':
    case '2750':
      return 'new';
    case '1750':
    case '2990':
      return 'very_good';
    case '3000':
      return 'good';
    case '3010':
    case '7000':
      return 'fair';
  }
  const l = (label ?? '').toLowerCase();
  if (/cartellin|with tags/.test(l)) return 'new_with_tags';
  if (/nuovo|new/.test(l)) return 'new';
  if (/ottim|excellent/.test(l)) return 'very_good';
  if (/discret|fair|parts/.test(l)) return 'fair';
  return 'good';
}

/** Rough condition guess from free text (Etsy has no structured condition). Defaults to "good". */
export function conditionFromText(text: string): Condition {
  const t = text.toLowerCase();
  if (/(new with tags|nwt|con cartellino|deadstock)/.test(t)) return 'new_with_tags';
  if (/(brand new|mai indossat|never worn|\bnuov[oa]\b)/.test(t)) return 'new';
  if (/(excellent|ottime condizioni|like new|come nuov)/.test(t)) return 'very_good';
  if (/(distressed|stain|macchi|hole|buco|faded|worn out)/.test(t)) return 'fair';
  return 'good';
}

export function parseMoney(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

/** Only http(s) URLs are allowed to reach the UI (no javascript:, data:, …). */
export function safeUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}
