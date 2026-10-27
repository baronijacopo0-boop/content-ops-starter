import { describe, expect, it } from 'vitest';
import { generateListing, colorAdjective } from '@/services/ai/listing';
import { analyzeItemImagesMock } from '@/services/ai/images';
import { MockVintedProvider } from '@/lib/marketplace/providers/mock-vinted';
import { computeMarketMetrics } from '@/lib/marketplace/metrics';
import { filterDeals, EMPTY_FILTERS, sortDeals } from '@/lib/deals/filter';
import { evaluateWithMarket } from '@/services/ai/deal';
import { dealInputSchema, listingAttributesSchema, passwordSchema } from '@/lib/validation';
import { sanitizeText } from '@/lib/utils';

describe('listing generator', () => {
  it('builds natural Italian titles with correct adjective agreement', () => {
    expect(colorAdjective('grigio', 'hoodie')).toBe('Grigia');
    expect(colorAdjective('grigio', 'sweater')).toBe('Grigio');
    const l = generateListing({
      category: 'hoodie',
      brand: 'Nike',
      colors: ['grigio'],
      size: 'M',
      condition: 'very_good',
      material: null,
      style: 'vintage',
      graphic: 'logo ricamato',
      defects: [],
    });
    expect(l.title).toBe('Felpa Nike Vintage Grigia Logo Ricamato Taglia M');
    expect(l.titleOptions.length).toBeGreaterThan(1);
    expect(l.description).toContain('Taglia M.');
    expect(l.description).toContain('Per misure o altre foto scrivetemi pure.');
  });
  it('never invents missing size or material and warns instead', () => {
    const l = generateListing({
      category: 'jacket',
      brand: 'Carhartt',
      colors: [],
      size: null,
      condition: null,
      material: null,
      style: null,
      graphic: null,
      defects: [],
    });
    expect(l.description).not.toMatch(/Taglia/);
    expect(l.description).not.toMatch(/Materiale/);
    expect(l.warnings.join(' ')).toMatch(/Taglia non confermata/);
    expect(l.warnings.join(' ')).toMatch(/autenticità/);
  });
  it('mock image analysis flags uncertain fields', () => {
    const a = analyzeItemImagesMock({
      images: [{ name: 'felpa-nike-grigia.jpg', dominantColors: ['grigio'] }],
    });
    expect(a.brand.value).toBe('Nike');
    expect(a.garmentType.value).toBe('hoodie');
    expect(a.size.value).toBeNull();
    expect(a.condition.needsConfirmation).toBe(true);
    expect(a.colors.value).toEqual(['grigio']);
  });
});

describe('marketplace provider', () => {
  const p = new MockVintedProvider(new Date('2026-10-01'));
  it('returns 20 demo deals and supports filters', async () => {
    expect((await p.searchItems({})).total).toBe(20);
    const nike = await p.searchItems({ brands: ['nike'] });
    expect(nike.items.every((i) => i.brand === 'Nike')).toBe(true);
    expect((await p.searchItems({ maxPrice: 15 })).items.every((i) => i.price <= 15)).toBe(true);
  });
  it('estimates market value with a coherent range', async () => {
    const v = await p.getEstimatedMarketValue({ brand: 'Nike', category: 'hoodie', condition: 'very_good' });
    expect(v.low).toBeLessThanOrEqual(v.mid);
    expect(v.mid).toBeLessThanOrEqual(v.high);
    expect(v.demandScore).toBeGreaterThan(50);
  });
  it('falls back to the price model for unknown brands', async () => {
    const v = await p.getEstimatedMarketValue({
      brand: 'Marca Sconosciuta',
      category: 'hoodie',
      condition: 'good',
    });
    expect(v.source).toBe('model');
    expect(v.mid).toBeGreaterThan(0);
  });
  it('market metrics compute median, sell-through and counts', () => {
    const m = computeMarketMetrics([
      {
        id: '1',
        marketplace: 'vinted',
        brand: 'X',
        category: 'hoodie',
        model: null,
        size: 'M',
        condition: 'good',
        price: 20,
        soldPrice: 10,
        daysOnMarket: 5,
        listedAt: '',
        soldAt: '',
      },
      {
        id: '2',
        marketplace: 'vinted',
        brand: 'X',
        category: 'hoodie',
        model: null,
        size: 'M',
        condition: 'good',
        price: 20,
        soldPrice: 30,
        daysOnMarket: 15,
        listedAt: '',
        soldAt: '',
      },
      {
        id: '3',
        marketplace: 'vinted',
        brand: 'X',
        category: 'hoodie',
        model: null,
        size: 'M',
        condition: 'good',
        price: 20,
        soldPrice: null,
        daysOnMarket: 9,
        listedAt: '',
        soldAt: null,
      },
    ]);
    expect(m.medianPrice).toBe(20);
    expect(m.salesCount).toBe(2);
    expect(m.listingsCount).toBe(1);
    expect(m.sellThroughRate).toBeCloseTo(66.7, 1);
    expect(m.avgDaysToSell).toBe(10);
  });
  it('deal filters and sorting', async () => {
    const { items } = await p.searchItems({});
    const deals = await Promise.all(
      items.map(async (item) => ({
        item,
        evaluation: evaluateWithMarket(
          {
            brand: item.brand,
            category: item.category,
            condition: item.condition,
            size: item.size,
            price: item.price,
            extraCosts: 1.5,
            targetRoi: 100,
          },
          await p.getEstimatedMarketValue(item),
        ),
      })),
    );
    const hot = filterDeals(deals, { ...EMPTY_FILTERS, minScore: 80 });
    expect(hot.every((d) => d.evaluation.dealScore >= 80)).toBe(true);
    const cheap = sortDeals(deals, 'price');
    expect(cheap[0].item.price).toBeLessThanOrEqual(cheap[1].item.price);
    const fav = filterDeals(deals, { ...EMPTY_FILTERS, favoritesOnly: true }, ['Carhartt']);
    expect(fav.every((d) => d.item.brand === 'Carhartt')).toBe(true);
  });
});

describe('validation & sanitization', () => {
  it('rejects invalid deal input', () => {
    expect(
      dealInputSchema.safeParse({ brand: '', category: 'hoodie', condition: 'good', price: 10 }).success,
    ).toBe(false);
    expect(
      dealInputSchema.safeParse({ brand: 'Nike', category: 'nope', condition: 'good', price: 10 }).success,
    ).toBe(false);
    expect(
      dealInputSchema.safeParse({ brand: 'Nike', category: 'hoodie', condition: 'good', price: -1 }).success,
    ).toBe(false);
  });
  it('sanitizes text input', () => {
    expect(sanitizeText('  Nike\u0000 Vintage\u200B < €15 ')).toBe('Nike Vintage < €15');
    expect(sanitizeText('x'.repeat(50), 10)).toHaveLength(10);
    const parsed = listingAttributesSchema.parse({
      category: 'hoodie',
      brand: ' Nike\u0007 ',
      colors: [],
      size: null,
      condition: null,
      material: null,
      style: null,
      graphic: null,
      defects: [],
    });
    expect(parsed.brand).toBe('Nike');
  });
  it('enforces password strength', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false);
    expect(passwordSchema.safeParse('onlyletters').success).toBe(false);
    expect(passwordSchema.safeParse('Valid1234').success).toBe(true);
  });
});
