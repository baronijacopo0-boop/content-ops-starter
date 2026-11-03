import type { ItemCategory } from '@/lib/domain/types';
import { brandOrDefault, categorySingular } from '@/lib/domain/constants';
import type { GeneratedListing, ListingAttributes } from './types';

type Gender = 'm' | 'f' | 'mpl' | 'fpl';

const CATEGORY_GENDER: Record<ItemCategory, Gender> = {
  hoodie: 'f',
  sweater: 'm',
  tshirt: 'f',
  shirt: 'f',
  jacket: 'f',
  jeans: 'mpl',
  pants: 'mpl',
  tracksuit: 'f',
  sneakers: 'fpl',
  accessories: 'm',
};

const CATEGORY_EN: Record<ItemCategory, string> = {
  hoodie: 'Hoodie',
  sweater: 'Sweater',
  tshirt: 'Tee',
  shirt: 'Shirt',
  jacket: 'Jacket',
  jeans: 'Jeans',
  pants: 'Pants',
  tracksuit: 'Track Jacket',
  sneakers: 'Sneakers',
  accessories: 'Accessory',
};

// Italian colour adjectives: [m, f, mpl, fpl]; invariable colours repeat the same form.
const COLOR_FORMS: Record<string, [string, string, string, string]> = {
  nero: ['Nero', 'Nera', 'Neri', 'Nere'],
  bianco: ['Bianco', 'Bianca', 'Bianchi', 'Bianche'],
  grigio: ['Grigio', 'Grigia', 'Grigi', 'Grigie'],
  rosso: ['Rosso', 'Rossa', 'Rossi', 'Rosse'],
  giallo: ['Giallo', 'Gialla', 'Gialli', 'Gialle'],
  azzurro: ['Azzurro', 'Azzurra', 'Azzurri', 'Azzurre'],
  verde: ['Verde', 'Verde', 'Verdi', 'Verdi'],
  marrone: ['Marrone', 'Marrone', 'Marroni', 'Marroni'],
  arancione: ['Arancione', 'Arancione', 'Arancioni', 'Arancioni'],
};

const COLOR_EN: Record<string, string> = {
  nero: 'Black',
  bianco: 'White',
  grigio: 'Grey',
  rosso: 'Red',
  giallo: 'Yellow',
  azzurro: 'Light Blue',
  verde: 'Green',
  marrone: 'Brown',
  arancione: 'Orange',
  blu: 'Blue',
  beige: 'Beige',
  rosa: 'Pink',
  viola: 'Purple',
  bordeaux: 'Burgundy',
  navy: 'Navy',
  'blu navy': 'Navy',
  crema: 'Cream',
};

export function colorAdjective(color: string, category: ItemCategory) {
  const key = color.trim().toLowerCase();
  const forms = COLOR_FORMS[key];
  if (!forms) return capitalize(color.trim());
  const idx = { m: 0, f: 1, mpl: 2, fpl: 3 }[CATEGORY_GENDER[category]];
  return forms[idx];
}

function colorEn(color: string) {
  return COLOR_EN[color.trim().toLowerCase()] ?? capitalize(color.trim());
}

function capitalize(s: string) {
  return s
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

const STYLE_OUTFITS: Record<string, string> = {
  vintage: 'vintage e anni 90',
  streetwear: 'streetwear',
  y2k: 'Y2K',
  sport: 'sportivi e casual',
  designer: 'eleganti e smart casual',
  workwear: 'workwear e streetwear',
  outdoor: 'outdoor e gorpcore',
  casual: 'casual di tutti i giorni',
};

function clean(parts: (string | null | undefined | false)[]) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * generateListing(): SEO-friendly but natural titles + a ready-to-copy description.
 * Only uses the attributes it receives: it never invents authenticity, materials, size, defects or provenance.
 * Missing information is reported in `warnings` so the user can confirm it.
 */
const CONDITION_SHORT: Record<string, string> = {
  new_with_tags: 'nuovo con cartellino, mai indossato',
  new: 'nuovo senza cartellino, mai indossato',
  very_good: 'ottime, normali segni di utilizzo',
  good: 'buone, segni di utilizzo visibili nelle foto',
  fair: 'discrete, guarda bene le foto',
};

/** Shortens a title by dropping the least important parts until it fits Vinted's search-friendly length. */
function fitTitle(parts: (string | false | null | undefined)[], droppable: string[], max = 70) {
  let current = parts.filter(Boolean) as string[];
  let title = clean(current);
  for (const d of droppable) {
    if (title.length <= max) break;
    current = current.filter((p) => p !== d);
    title = clean(current);
  }
  return title.length <= max ? title : title.slice(0, max).replace(/\s+\S*$/, '');
}

function measurementLines(m: ListingAttributes['measurements']) {
  if (!m) return [];
  const parts = [
    m.pitToPit ? `ascella-ascella ${m.pitToPit} cm` : null,
    m.length ? `lunghezza ${m.length} cm` : null,
    m.waist ? `vita ${m.waist} cm` : null,
    m.inseam ? `cavallo ${m.inseam} cm` : null,
  ].filter(Boolean);
  return parts.length ? [`📏 Misure (a capo disteso): ${parts.join(' · ')}`] : [];
}

/**
 * generateListing(): SEO-friendly but natural titles + a complete, structured description ready to copy.
 * Titles follow how people search on Vinted (garment + brand + style/model + colour + key detail + size).
 * Only the attributes received are used: it never invents authenticity, materials, size, defects or
 * provenance. Missing information is reported in `warnings` so the user can confirm it.
 */
export function generateListing(attrs: ListingAttributes): GeneratedListing {
  const singular = categorySingular(attrs.category);
  const brand = attrs.brand?.trim() || '';
  const style = attrs.style?.trim() || '';
  const styleCap = style && style !== 'casual' ? capitalize(style) : '';
  const mainColor = attrs.colors[0];
  const colorIt = mainColor ? colorAdjective(mainColor, attrs.category) : '';
  const features = (attrs.features ?? []).map((f) => f.trim()).filter(Boolean);
  const detail = attrs.graphic?.trim()
    ? capitalize(attrs.graphic.trim())
    : features[0]
      ? capitalize(features[0])
      : '';
  const model = attrs.model?.trim() ? capitalize(attrs.model.trim()) : '';
  const size = attrs.size?.trim() || '';

  // 1) Italian, natural: "Felpa Nike Vintage Grigia Logo Ricamato Taglia M"
  const titleIt = fitTitle(
    [singular, brand, styleCap, model, colorIt, detail, size && `Taglia ${size}`],
    [detail, styleCap, model],
  );
  // 2) Brand first (how many buyers search): "Nike Felpa Vintage Spellout Grigia Tg M"
  const titleBrandFirst = fitTitle(
    [brand, singular, styleCap, model, colorIt, size && `Tg ${size}`],
    [styleCap, model],
  );
  // 3) International keywords: "Nike Vintage Hoodie Grey Taglia M"
  const titleEn = fitTitle(
    [
      brand,
      styleCap,
      model,
      CATEGORY_EN[attrs.category],
      mainColor ? colorEn(mainColor) : '',
      size && `Taglia ${size}`,
    ],
    [model, styleCap],
  );
  const titleOptions = Array.from(new Set([titleIt, titleBrandFirst, titleEn].filter((t) => t.length > 3)));

  const colorText = attrs.colors.length
    ? attrs.colors.map((c) => colorAdjective(c, attrs.category).toLowerCase()).join(' e ')
    : '';
  const intro =
    clean([
      singular,
      brand,
      model,
      style && style !== 'casual' ? style.toLowerCase() : '',
      colorText,
      detail ? `con ${detail.toLowerCase()}` : '',
    ]) + '.';

  const facts: string[] = [];
  if (brand) facts.push(`✔️ Brand: ${brand}`);
  if (size) facts.push(`✔️ Taglia: ${size}${attrs.measurements ? ' (vedi misure)' : ''}`);
  if (colorText) facts.push(`✔️ Colore: ${colorText}`);
  if (attrs.material) facts.push(`✔️ Materiale: ${attrs.material.toLowerCase()} (da etichetta)`);
  if (attrs.condition) facts.push(`✔️ Condizioni: ${CONDITION_SHORT[attrs.condition]}`);
  const otherFeatures = features.filter((f) => f.toLowerCase() !== detail.toLowerCase());
  if (otherFeatures.length) facts.push(`✔️ Dettagli: ${otherFeatures.join(', ').toLowerCase()}`);
  if (attrs.defects.length)
    facts.push(`⚠️ Da segnalare: ${attrs.defects.join(', ').toLowerCase()} (vedi foto)`);

  const niche = style.toLowerCase();
  const outfit =
    STYLE_OUTFITS[niche] ??
    (brand
      ? brandOrDefault(brand)
          .niches.map((n) => STYLE_OUTFITS[n] ?? n)
          .filter((n) => n !== 'other')
          .slice(0, 2)
          .join(', ')
      : '');

  const closing = [
    outfit ? `Perfetta per outfit ${outfit}.` : null,
    '📦 Spedizione rapida e imballaggio curato.',
    '💬 Per misure o altre foto scrivetemi pure.',
  ].filter(Boolean) as string[];

  const hashtags = Array.from(
    new Set(
      [
        brand,
        singular,
        style && style !== 'casual' ? style : null,
        model,
        mainColor,
        attrs.category === 'sneakers' ? 'sneakers' : null,
      ]
        .filter(Boolean)
        .map(
          (t) =>
            `#${String(t)
              .toLowerCase()
              .replace(/[^a-z0-9àèéìòù]/g, '')}`,
        ),
    ),
  ).filter((t) => t.length > 2);

  const warnings: string[] = [];
  if (!brand) warnings.push('Brand non indicato: aggiungilo per aumentare le visualizzazioni.');
  if (!size) warnings.push('Taglia non confermata: controlla l’etichetta e inseriscila prima di pubblicare.');
  if (!attrs.condition) warnings.push('Condizione non confermata: valuta tu lo stato del capo.');
  if (!attrs.material) warnings.push('Materiale non indicato: aggiungilo solo se è scritto sull’etichetta.');
  if (!attrs.measurements)
    warnings.push('Aggiungi le misure (ascella-ascella e lunghezza): riducono domande e resi.');
  warnings.push('Non dichiarare autenticità o provenienza se non puoi dimostrarle.');

  const description = [
    intro,
    facts.join('\n'),
    measurementLines(attrs.measurements).join('\n'),
    closing.join('\n'),
    hashtags.join(' '),
  ]
    .filter(Boolean)
    .join('\n\n');

  return { title: titleOptions[0], titleOptions, description, hashtags, warnings, engine: 'mock' };
}
