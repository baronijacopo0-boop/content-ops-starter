import type { Condition, ItemCategory } from '@/lib/domain/types';
import { BRANDS } from '@/lib/domain/constants';

/**
 * Helpers that turn free-text marketplace listings (eBay, Etsy, CSV imports…) into FLIP AI's
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
  const candidates = [...BRANDS.map((b) => b.name), ...extraBrands];
  // Longest names first so "The North Face" wins over shorter overlaps.
  for (const name of candidates.sort((a, b) => b.length - a.length)) {
    if (wordRe(plain(name)).test(t)) return BRANDS.find((b) => plain(b.name) === plain(name))?.name ?? name;
  }
  if (/\btnf\b/i.test(text)) return 'The North Face';
  if (/\brl\b|\bpolo ralph\b/i.test(text)) return 'Ralph Lauren';
  return null;
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
 * eBay condition IDs → FLIP AI condition.
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
