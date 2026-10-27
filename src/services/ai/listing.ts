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

function conditionSentence(attrs: ListingAttributes) {
  switch (attrs.condition) {
    case 'new_with_tags':
      return 'Nuovo con cartellino, mai indossato.';
    case 'new':
      return 'Nuovo senza cartellino, mai indossato.';
    case 'very_good':
      return 'Condizioni molto buone, normali segni di utilizzo.';
    case 'good':
      return 'Buone condizioni, segni di utilizzo visibili nelle foto.';
    case 'fair':
      return 'Condizioni discrete: guarda bene le foto per i dettagli.';
    default:
      return null;
  }
}

function clean(parts: (string | null | undefined | false)[]) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * generateListing(): SEO-friendly but natural titles + a ready-to-copy description.
 * Only uses the attributes it receives: it never invents authenticity, materials, size, defects or provenance.
 * Missing information is reported in `warnings` so the user can confirm it.
 */
export function generateListing(attrs: ListingAttributes): GeneratedListing {
  const singular = categorySingular(attrs.category);
  const brand = attrs.brand?.trim() || '';
  const style = attrs.style?.trim() || '';
  const styleCap = style ? capitalize(style) : '';
  const mainColor = attrs.colors[0];
  const colorIt = mainColor ? colorAdjective(mainColor, attrs.category) : '';
  const graphic = attrs.graphic?.trim() ? capitalize(attrs.graphic.trim()) : '';
  const sizePart = attrs.size ? `Taglia ${attrs.size}` : '';
  const model = attrs.model?.trim() ? capitalize(attrs.model.trim()) : '';

  const titleIt = clean([singular, brand, styleCap, model, colorIt, graphic, sizePart]);
  const titleEn = clean([
    brand,
    styleCap,
    model,
    CATEGORY_EN[attrs.category],
    mainColor ? colorEn(mainColor) : '',
    sizePart,
  ]);
  const titleShort = clean([brand, singular, styleCap, sizePart]);
  const titleOptions = Array.from(new Set([titleIt, titleEn, titleShort])).map((t) => t.slice(0, 90));

  const lines: string[] = [];
  const colorText = attrs.colors.length
    ? attrs.colors.map((c) => colorAdjective(c, attrs.category).toLowerCase()).join(' e ')
    : '';
  lines.push(
    clean([
      singular,
      brand,
      style ? style.toLowerCase() : '',
      colorText,
      attrs.graphic ? `con ${attrs.graphic.toLowerCase()}` : '',
    ]) + '.',
  );
  if (attrs.size) lines.push(`Taglia ${attrs.size}.`);
  const cond = conditionSentence(attrs);
  if (cond) lines.push(cond);
  if (attrs.defects.length)
    lines.push(`Da segnalare: ${attrs.defects.join(', ').toLowerCase()} (vedi foto).`);
  if (attrs.material) lines.push(`Materiale: ${attrs.material.toLowerCase()} (come da etichetta).`);
  const niche = style.toLowerCase();
  const outfit =
    STYLE_OUTFITS[niche] ??
    (brand
      ? brandOrDefault(brand)
          .niches.map((n) => STYLE_OUTFITS[n] ?? n)
          .slice(0, 2)
          .join(', ')
      : '');
  if (outfit && outfit !== 'other') lines.push(`Perfetta per outfit ${outfit}.`);
  lines.push('Per misure o altre foto scrivetemi pure.');
  lines.push('Spedizione rapida e imballaggio curato.');

  const hashtags = Array.from(
    new Set(
      [brand, singular, style, mainColor, attrs.category === 'sneakers' ? 'sneakers' : null]
        .filter(Boolean)
        .map(
          (t) =>
            `#${String(t)
              .toLowerCase()
              .replace(/[^a-z0-9àèéìòù]/g, '')}`,
        ),
    ),
  ).filter((t) => t.length > 1);

  const warnings: string[] = [];
  if (!brand) warnings.push('Brand non indicato: aggiungilo per aumentare le visualizzazioni.');
  if (!attrs.size)
    warnings.push('Taglia non confermata: controlla l’etichetta e inseriscila prima di pubblicare.');
  if (!attrs.condition) warnings.push('Condizione non confermata: valuta tu lo stato del capo.');
  if (!attrs.material) warnings.push('Materiale non indicato: aggiungilo solo se è scritto sull’etichetta.');
  warnings.push('Non dichiarare autenticità o provenienza se non puoi dimostrarle.');

  return {
    title: titleOptions[0],
    titleOptions,
    description: [lines.join('\n'), hashtags.join(' ')].filter(Boolean).join('\n\n'),
    hashtags,
    warnings,
    engine: 'mock',
  };
}
