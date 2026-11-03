import type { Condition, ItemCategory } from '@/lib/domain/types';
import { findBrand, modelPremium } from '@/lib/domain/constants';
import {
  detectBrand,
  detectCategory,
  detectFeatures,
  detectStyle,
  parseLabelText,
} from '@/lib/marketplace/normalize';
import type { DetectedField, ImageAnalysis, ImageAnalysisInput } from './types';

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

  const label = hints.labelText ? parseLabelText(hints.labelText) : null;

  // Brand: user hint > label text (OCR) > keyword in file name
  let brand: DetectedField = field<string>(null, 'low');
  if (hints.brand) brand = field(findBrand(hints.brand)?.name ?? hints.brand, 'medium', true);
  else if (label?.brand) brand = field(label.brand, 'high', true);
  else {
    const hit = detectBrand(names);
    if (hit) brand = field(hit, 'medium', true);
  }

  // Garment type
  let garmentType: DetectedField<ItemCategory> = field<ItemCategory>(null, 'low');
  if (hints.category) garmentType = field(hints.category, 'high', false);
  else {
    const hit = detectCategory(names);
    if (hit) garmentType = field(hit, 'medium', true);
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

  const allText = `${names} ${hints.labelText ?? ''}`;
  const style =
    brand.value || /vintage|y2k|90s|80s|workwear/i.test(allText)
      ? field<string>(detectStyle(allText, brand.value), 'low', true)
      : field<string>(null, 'low');
  const premium = modelPremium(allText);

  const notes = [
    label
      ? 'Etichetta letta: brand, taglia e materiale ricavati dal testo dell’etichetta (verifica che siano corretti).'
      : 'Suggerimento: carica una foto dell’etichetta e premi “Leggi etichetta” per brand, taglia e materiale.',
    'Analisi in modalità demo: colori misurati dalle foto, brand e tipo di capo dedotti da nome file, etichetta e suggerimenti.',
    'Configura AI_API_KEY sul server per il riconoscimento visivo completo.',
    'Controlla sempre taglia, materiale e difetti direttamente sul capo.',
  ];

  return {
    garmentType,
    brand,
    colors: colorField,
    style,
    material: label?.material ? field<string>(label.material, 'high', true) : field<string>(null, 'low'),
    condition: field<Condition>(null, 'low'),
    graphic: field<string>(null, 'low'),
    size: hints.size
      ? field<string>(hints.size, 'medium', true)
      : label?.size
        ? field<string>(label.size, 'high', true)
        : field<string>(null, 'low'),
    model: premium.label ? field<string>(premium.label, 'low', true) : field<string>(null, 'low'),
    features: detectFeatures(allText),
    defects: [],
    notes,
    engine: 'mock',
  };
}
