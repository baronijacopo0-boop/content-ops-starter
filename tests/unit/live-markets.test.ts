import { describe, expect, it, vi } from 'vitest';
import { EbayProvider } from '@/lib/marketplace/providers/ebay';
import { EtsyProvider } from '@/lib/marketplace/providers/etsy';
import { MarketSourceError } from '@/lib/marketplace/providers/live-base';
import {
  detectBrand,
  detectCategory,
  detectSize,
  mapEbayCondition,
  safeUrl,
} from '@/lib/marketplace/normalize';
import { EBAY_SEARCH, ETSY_BATCH, ETSY_SEARCH } from '../fixtures/market-fixtures.mjs';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('title normalization', () => {
  it('detects garment category with word boundaries', () => {
    expect(detectCategory('Felpa Nike vintage')).toBe('hoodie');
    expect(detectCategory('Vintage sweatshirt crewneck')).toBe('hoodie');
    expect(detectCategory('T-shirt Stüssy')).toBe('tshirt');
    expect(detectCategory("Levi's 501 W32")).toBe('jeans');
    expect(detectCategory('Adidas Samba OG 42')).toBe('sneakers');
    expect(detectCategory('Steelbook film')).toBeNull();
  });
  it('detects brands, including aliases', () => {
    expect(detectBrand('Giacca TNF Nuptse 700')).toBe('The North Face');
    expect(detectBrand('stussy hoodie')).toBe('Stüssy');
    expect(detectBrand('maglione generico')).toBeNull();
    expect(detectBrand('maglione Marca X', ['Marca X'])).toBe('Marca X');
  });
  it('detects sizes conservatively', () => {
    expect(detectSize('Felpa taglia L', 'hoodie')).toBe('L');
    expect(detectSize('Hoodie Size: XL', 'hoodie')).toBe('XL');
    expect(detectSize("Levi's 501 W32 L34", 'jeans')).toBe('32');
    expect(detectSize('Samba EU 42.5', 'sneakers')).toBe('42.5');
    expect(detectSize('Felpa Nike grigia', 'hoodie')).toBeNull();
  });
  it('maps eBay conditions and rejects unsafe URLs', () => {
    expect(mapEbayCondition('1000')).toBe('new_with_tags');
    expect(mapEbayCondition('2990')).toBe('very_good');
    expect(mapEbayCondition('3000')).toBe('good');
    expect(mapEbayCondition(undefined, 'Nuovo')).toBe('new');
    expect(safeUrl('javascript:alert(1)')).toBeNull();
    expect(safeUrl('https://www.ebay.it/itm/1')).toBe('https://www.ebay.it/itm/1');
  });
});

describe('EbayProvider (Browse API)', () => {
  it('gets an app token, searches EBAY_IT in EUR and normalizes listings', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes('/identity/v1/oauth2/token')
        ? json({ access_token: 'tok', expires_in: 7200 })
        : json(EBAY_SEARCH),
    );
    const p = new EbayProvider({ clientId: 'id', clientSecret: 'secret' }, undefined, fetchMock);
    const { items } = await p.searchItems({ text: 'Carhartt vintage', brandHint: 'Carhartt', maxPrice: 50 });

    const [tokenCall, searchCall] = fetchMock.mock.calls as unknown as [string, RequestInit][];
    expect(tokenCall[1].headers).toMatchObject({
      Authorization: `Basic ${Buffer.from('id:secret').toString('base64')}`,
    });
    expect(String(tokenCall[1].body)).toContain('scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope');
    const searchUrl = new URL(searchCall[0]);
    expect(searchUrl.pathname).toBe('/buy/browse/v1/item_summary/search');
    expect(searchUrl.searchParams.get('filter')).toContain('priceCurrency:EUR');
    expect(searchUrl.searchParams.get('filter')).toContain('price:[..50]');
    expect(searchUrl.searchParams.get('category_ids')).toBe('11450');
    expect((searchCall[1].headers as Record<string, string>)['X-EBAY-C-MARKETPLACE-ID']).toBe('EBAY_IT');

    // books (no category) and USD listings are dropped
    expect(items).toHaveLength(2);
    const carhartt = items[0];
    expect(carhartt).toMatchObject({
      id: 'ebay-v1|1111|0',
      marketplace: 'ebay',
      brand: 'Carhartt',
      category: 'hoodie',
      size: 'L',
      condition: 'good',
      price: 18,
      shippingCost: 5.5,
      isDemo: false,
    });
    expect(carhartt.url).toBe('https://www.ebay.it/itm/1111');
    expect(items[1]).toMatchObject({
      brand: 'Patagonia',
      category: 'sweater',
      size: 'M',
      condition: 'very_good',
    });

    // token is cached
    await p.searchItems({ text: 'x' });
    expect(fetchMock.mock.calls.filter(([u]) => String(u).includes('oauth2')).length).toBe(1);
  });

  it('turns auth errors into a user-safe message', async () => {
    const p = new EbayProvider({ clientId: 'id', clientSecret: 'bad' }, undefined, async () =>
      json({ error: 'invalid_client' }, 401),
    );
    await expect(p.searchItems({ text: 'x' })).rejects.toThrow(MarketSourceError);
    await expect(p.searchItems({ text: 'x' })).rejects.toThrow(/Credenziali eBay/);
  });
});

describe('EtsyProvider (Open API v3)', () => {
  it('searches active listings, keeps EUR prices and attaches images', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes('/listings/batch') ? json(ETSY_BATCH) : json(ETSY_SEARCH),
    );
    const p = new EtsyProvider({ apiKey: 'key:secret' }, undefined, fetchMock);
    const { items } = await p.searchItems({ text: "Levi's vintage", brandHint: "Levi's" });
    const [searchCall] = fetchMock.mock.calls as unknown as [string, RequestInit][];
    expect(searchCall[0]).toContain('/v3/application/listings/active?');
    expect((searchCall[1].headers as Record<string, string>)['x-api-key']).toBe('key:secret');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: 'etsy-9001',
      marketplace: 'etsy',
      brand: "Levi's",
      category: 'jeans',
      size: '32',
      price: 35,
      favorites: 12,
    });
    expect(items[0].imageUrl).toContain('etsystatic.com');
  });
});
