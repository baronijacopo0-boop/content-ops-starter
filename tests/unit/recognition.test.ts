import { describe, expect, it } from 'vitest';
import { BRANDS, findBrand, modelPremium } from '@/lib/domain/constants';
import {
  detectBrand,
  detectFeatures,
  detectMaterial,
  detectStyle,
  parseLabelText,
} from '@/lib/marketplace/normalize';
import { analyzeItemImagesMock } from '@/services/ai/images';
import { generateListing } from '@/services/ai/listing';
import { MockVintedProvider } from '@/lib/marketplace/providers/mock-vinted';
import { buildStrategies } from '@/services/ai/pricing';

describe('brand recognition', () => {
  it('knows many brands with their aliases', () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(70);
    expect(findBrand('polo ralph lauren')?.name).toBe('Ralph Lauren');
    expect(findBrand('CP Company')?.name).toBe('C.P. Company');
    expect(detectBrand('Giacca Carhartt WIP Detroit')).toBe('Carhartt');
    expect(detectBrand('Felpa A Bathing Ape camo')).toBe('BAPE');
    expect(detectBrand('Polo Ralph Lauren maglione')).toBe('Ralph Lauren');
    expect(detectBrand('Maglia Arcteryx Atom')).toBe("Arc'teryx");
    // very short aliases are not used in free text
    expect(detectBrand('felpa hm grigia')).toBeNull();
  });
});

describe('style, material and features', () => {
  it('classifies styles from keywords first, then brand niche', () => {
    expect(detectStyle('Felpa vintage anni 90 single stitch', 'Zara')).toBe('vintage');
    expect(detectStyle('Pantaloni double knee', 'Dickies')).toBe('workwear');
    expect(detectStyle('Felpa logo', 'Stone Island')).toBe('designer');
    expect(detectStyle('Felpa logo', 'Supreme')).toBe('streetwear');
    expect(detectStyle('Felpa basic', 'Zara')).toBe('casual');
  });
  it('reads compositions and never guesses materials', () => {
    expect(detectMaterial('80% COTTON 20% POLYESTER')).toBe('80% cotone, 20% poliestere');
    expect(detectMaterial('100% lana merino')).toBe('100% lana');
    expect(detectMaterial('felpa grigia bella')).toBeNull();
  });
  it('extracts notable features', () => {
    expect(detectFeatures('Hoodie with embroidered logo, full zip')).toEqual(['logo ricamato', 'zip intera']);
  });
  it('parses OCR text from a label', () => {
    const r = parseLabelText('THE NORTH FACE\nSIZE: L\nSHELL: 100% NYLON\nMADE IN VIETNAM');
    expect(r).toEqual({
      brand: 'The North Face',
      size: 'L',
      material: '100% poliammide (nylon)',
      madeIn: 'Vietnam',
    });
  });
});

describe('analysis and listing with label text', () => {
  it('uses the label reading in the mock image analysis', () => {
    const a = analyzeItemImagesMock({
      images: [{ name: 'IMG_1234.jpg', dominantColors: ['grigio'] }],
      hints: { labelText: 'Carhartt WIP\nTaglia M\n100% cotton' },
    });
    expect(a.brand.value).toBe('Carhartt');
    expect(a.size.value).toBe('M');
    expect(a.material.value).toBe('100% cotone');
    expect(a.style.value).toBe('streetwear');
  });
  it('writes a complete, structured description with measurements and features', () => {
    const l = generateListing({
      category: 'hoodie',
      brand: 'Carhartt',
      colors: ['nero'],
      size: 'L',
      condition: 'good',
      material: '100% cotone',
      style: 'workwear',
      graphic: null,
      model: null,
      features: ['cappuccio', 'tasca a marsupio'],
      measurements: { pitToPit: 60, length: 72 },
      defects: [],
    });
    expect(l.title).toBe('Felpa Carhartt Workwear Nera Cappuccio Taglia L');
    expect(l.description).toContain('✔️ Materiale: 100% cotone (da etichetta)');
    expect(l.description).toContain('✔️ Dettagli: tasca a marsupio');
    expect(l.description).toContain('📏 Misure (a capo disteso): ascella-ascella 60 cm · lunghezza 72 cm');
    expect(l.warnings.join(' ')).not.toMatch(/misure/i);
  });
});

describe('realistic pricing', () => {
  const p = new MockVintedProvider(new Date('2026-10-01'));
  it('keeps everyday items cheap and iconic models higher', async () => {
    const hm = await p.getEstimatedMarketValue({ brand: 'H&M', category: 'tshirt', condition: 'good' });
    expect(hm.mid).toBeLessThanOrEqual(6);
    const plain = await p.getEstimatedMarketValue({
      brand: 'The North Face',
      category: 'jacket',
      condition: 'good',
    });
    const nuptse = await p.getEstimatedMarketValue({
      brand: 'The North Face',
      category: 'jacket',
      condition: 'good',
      title: 'TNF Nuptse 700',
    });
    expect(nuptse.mid).toBeGreaterThan(plain.mid);
    expect(nuptse.modelLabel).toBe('Nuptse');
    expect(modelPremium('felpa qualunque').multiplier).toBe(1);
  });
  it('never suggests a max-profit price above the market range', async () => {
    const v = await p.getEstimatedMarketValue({ brand: 'Nike', category: 'hoodie', condition: 'very_good' });
    const [quick, rec, max] = buildStrategies(v, 10, 1.5);
    expect(quick.price).toBeLessThan(rec.price);
    expect(max.price).toBeGreaterThan(rec.price);
    expect(max.price).toBeLessThanOrEqual(Math.max(v.high, rec.price + 1));
  });
});
