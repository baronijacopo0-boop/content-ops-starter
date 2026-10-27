import type { MarketItem, MarketplaceProvider, SearchQuery, SearchResult } from '../types';
import { conditionFromText, detectBrand, detectCategory, detectSize, safeUrl } from '../normalize';
import { LiveListingsProvider, type FetchLike } from './live-base';

export interface EtsyConfig {
  /** "keystring:shared_secret" exactly as shown in Etsy → Your Apps. */
  apiKey: string;
  apiBase?: string;
}

interface EtsyListing {
  listing_id?: number;
  title?: string;
  description?: string;
  price?: { amount?: number; divisor?: number; currency_code?: string };
  url?: string;
  creation_timestamp?: number;
  created_timestamp?: number;
  num_favorers?: number;
  views?: number;
  images?: { url_570xN?: string; url_fullxfull?: string }[];
}

/**
 * Etsy Open API v3 (official): `GET /v3/application/listings/active` (search) and
 * `GET /v3/application/listings/batch?includes=Images` (photos). Read-only. Only listings priced
 * in EUR are kept, so prices are comparable without currency conversion.
 */
export class EtsyProvider extends LiveListingsProvider {
  readonly id = 'etsy' as const;
  readonly name = 'Etsy';
  private base: string;

  constructor(
    private cfg: EtsyConfig,
    valuation?: MarketplaceProvider,
    fetchImpl?: FetchLike,
  ) {
    super(valuation, fetchImpl);
    this.base = (cfg.apiBase || 'https://openapi.etsy.com').replace(/\/$/, '');
  }

  private headers() {
    return { 'x-api-key': this.cfg.apiKey, Accept: 'application/json' };
  }

  async searchItems(query: SearchQuery): Promise<SearchResult> {
    const params = new URLSearchParams({
      keywords: (query.text ?? query.brands?.join(' ') ?? 'vintage').slice(0, 100),
      limit: String(Math.min(query.limit ?? 50, 100)),
      sort_on: 'created',
      sort_order: 'desc',
    });
    if (query.maxPrice !== undefined) params.set('max_price', String(query.maxPrice));
    const search = await this.request<{ count?: number; results?: EtsyListing[] }>(
      `${this.base}/v3/application/listings/active?${params}`,
      { headers: this.headers() },
      'Etsy',
    );
    let listings = (search.results ?? []).filter((l) => l.price?.currency_code === 'EUR');

    // Photos come from the batch endpoint; listings still work without them if it fails.
    const ids = listings
      .map((l) => l.listing_id)
      .filter(Boolean)
      .slice(0, 100);
    if (ids.length) {
      try {
        const batch = await this.request<{ results?: EtsyListing[] }>(
          `${this.base}/v3/application/listings/batch?listing_ids=${ids.join(',')}&includes=Images`,
          { headers: this.headers() },
          'Etsy',
        );
        const byId = new Map((batch.results ?? []).map((l) => [l.listing_id, l]));
        listings = listings.map((l) => ({ ...l, images: byId.get(l.listing_id)?.images ?? l.images }));
      } catch {
        // keep listings without images
      }
    }

    const items = listings
      .map((l) => this.toMarketItem(l, query.brandHint))
      .filter((i): i is MarketItem => i !== null);
    return { items: this.remember(items), total: search.count ?? items.length };
  }

  private toMarketItem(l: EtsyListing, brandHint?: string): MarketItem | null {
    const title = l.title?.trim();
    const amount = l.price?.amount;
    const divisor = l.price?.divisor || 100;
    if (!l.listing_id || !title || typeof amount !== 'number') return null;
    const price = Math.round((amount / divisor) * 100) / 100;
    const category = detectCategory(title);
    if (!category) return null;
    const brand = detectBrand(title, brandHint ? [brandHint] : []) ?? brandHint ?? null;
    if (!brand) return null;
    const ts = l.created_timestamp ?? l.creation_timestamp;
    return {
      id: `etsy-${l.listing_id}`,
      marketplace: 'etsy',
      externalId: String(l.listing_id),
      title: title.slice(0, 120),
      description: (l.description ?? '').slice(0, 500),
      brand,
      category,
      model: null,
      size: detectSize(title, category) ?? '—',
      condition: conditionFromText(`${title} ${l.description ?? ''}`),
      color: '',
      price,
      shippingCost: null,
      currency: 'EUR',
      imageUrl: safeUrl(l.images?.[0]?.url_570xN ?? l.images?.[0]?.url_fullxfull),
      listedAt: ts ? new Date(ts * 1000).toISOString() : new Date().toISOString(),
      favorites: l.num_favorers ?? 0,
      views: l.views ?? 0,
      sellerName: 'negozio Etsy',
      sellerRating: null,
      url: safeUrl(l.url),
      isDemo: false,
    };
  }
}
