import { describe, expect, it } from 'vitest';
import { vintedSearchUrl, vintedSellUrl } from '@/lib/marketplace/links';

describe('Vinted links', () => {
  it('points to the sell page', () => {
    expect(vintedSellUrl()).toBe('https://www.vinted.it/items/new');
  });
  it('builds an encoded catalog search', () => {
    const url = new URL(vintedSearchUrl("Levi's Jeans & co", { maxPrice: 20.4 }));
    expect(url.origin).toBe('https://www.vinted.it');
    expect(url.pathname).toBe('/catalog');
    expect(url.searchParams.get('search_text')).toBe("Levi's Jeans & co");
    expect(url.searchParams.get('price_to')).toBe('20');
  });
});
