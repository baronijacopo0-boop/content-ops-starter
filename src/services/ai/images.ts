import type { Condition, ItemCategory } from '@/lib/domain/types';
import { BRANDS, findBrand } from '@/lib/domain/constants';
import type { DetectedField, ImageAnalysis, ImageAnalysisInput } from './types';

const CATEGORY_KEYWORDS: [ItemCategory, string[]][] = [
  ['hoodie', ['hoodie', 'felpa', 'sweatshirt', 'crewneck']],
  ['sweater', ['sweater', 'maglione', 'knit', 'cardigan', 'pile', 'fleece']],
  ['tshirt', ['tshirt', 't-shirt', 'tee', 'maglietta', 'polo']],
  ['shirt', ['shirt', 'camicia', 'oxford']],
  ['jacket', ['jacket', 'giacca', 'giubbotto', 'piumino', 'puffer', 'windbreaker', 'bomber']],
  ['jeans', ['jeans', 'denim', '501']],
  ['pants', ['pants', 'pantaloni', 'cargo', 'trousers']],
  ['tracksuit', ['track', 'tuta', 'tracksuit']],
  ['sneakers', ['sneaker', 'scarpe', 'shoes', 'airmax', 'air-max', 'samba', 'dunk', 'jordan']],
  ['accessories', ['cappello', 'hat', 'cap', 'borsa', 'bag', 'sciarpa', 'belt', 'cintura']],
];

function field<T>(
  value: T | null,
  confidence: DetectedField['confidence'],
  needsConfirmation = confidence !== 'high',
): DetectedField<T> {
  return { value, confidence, needsConfirmation };
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[_.]/g, ' ');
}

/**
 * Mock image analysis used when no AI provider is configured.
 * It is intentionally conservative: it only reports what it can actually infer
 * (dominant colours measured from the pixels, keywords in the file names, user hints)
 * and flags everything else as "da confermare". It never guesses size, material or defects.
 */
export function analyzeItemImagesMock(input: ImageAnalysisInput): ImageAnalysis {
  const names = input.images.map((i) => normalize(i.name)).join(' ');
  const hints = input.hints ?? {};

  // Brand: user hint > keyword in file name
  let brand: DetectedField = field<string>(null, 'low');
  if (hints.brand) brand = field(findBrand(hints.brand)?.name ?? hints.brand, 'medium', true);
  else {
    const hit = BRANDS.find(
      (b) => names.includes(b.name.toLowerCase().replace(/'/g, '')) || names.includes(b.name.toLowerCase()),
    );
    if (hit) brand = field(hit.name, 'medium', true);
  }

  // Garment type
  let garmentType: DetectedField<ItemCategory> = field<ItemCategory>(null, 'low');
  if (hints.category) garmentType = field(hints.category, 'high', false);
  else {
    const hit = CATEGORY_KEYWORDS.find(([, kws]) => kws.some((k) => names.includes(k)));
    if (hit) garmentType = field(hit[0], 'medium', true);
  }

  // Colours: measured client-side from the image pixels, most frequent first
  const counts = new Map<string, number>();
  input.images.forEach((img) =>
    img.dominantColors.forEach((c, i) => counts.set(c, (counts.get(c) ?? 0) + (3 - Math.min(i, 2)))),
  );
  const colors = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c)
    .slice(0, 2);
  const colorField = field(colors.length ? colors : null, colors.length ? 'medium' : 'low', true);

  const brandInfo = brand.value ? findBrand(brand.value) : undefined;
  const style = brandInfo
    ? field(brandInfo.niches[0] === 'other' ? 'casual' : brandInfo.niches[0], 'low', true)
    : field<string>(null, 'low');

  const notes = [
    'Analisi in modalità demo: colori misurati dalle foto, brand e tipo di capo dedotti da nome file e suggerimenti.',
    'Configura AI_API_KEY sul server per il riconoscimento visivo completo.',
    'Controlla sempre taglia, materiale e difetti direttamente sul capo.',
  ];

  return {
    garmentType,
    brand,
    colors: colorField,
    style,
    material: field<string>(null, 'low'),
    condition: field<Condition>(null, 'low'),
    graphic: field<string>(null, 'low'),
    size: hints.size ? field<string>(hints.size, 'medium', true) : field<string>(null, 'low'),
    defects: [],
    notes,
    engine: 'mock',
  };
}
