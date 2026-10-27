import type { MarketItem, SearchQuery, SearchResult } from '../types';
import { detectBrand, detectCategory, detectSize, mapEbayCondition, parseMoney, safeUrl } from '../normalize';
import { LiveListingsProvider, MarketSourceError, type FetchLike } from './live-base';
import type { MarketplaceProvider } from '../types';

export interface EbayConfig {
  clientId: string;
  clientSecret: string;
  /** e.g. EBAY_IT, EBAY_DE, EBAY_FR, EBAY_GB */
  marketplaceId?: string;
  /** https://api.ebay.com (production) or https://api.sandbox.ebay.com */
  apiBase?: string;
  /** Comma separated category IDs. 11450 = Clothing, Shoes & Accessories. */
  categoryIds?: string;
  /** eBay Partner Network campaign id: listing links become affiliate links. */
  affiliateCampaignId?: string;
}

interface EbayItemSummary {
  itemId?: string;
  title?: string;
  shortDescription?: string;
  price?: { value?: string; currency?: string };
  image?: { imageUrl?: string };
  thumbnailImages?: { imageUrl?: string }[];
  condition?: string;
  conditionId?: string;
  itemWebUrl?: string;
  itemAffiliateWebUrl?: string;
  itemCreationDate?: string;
  seller?: { username?: string; feedbackPercentage?: string };
  shippingOptions?: { shippingCostType?: string; shippingCost?: { value?: string; currency?: string } }[];
}

interface EbaySearchResponse {
  total?: number;
  itemSummaries?: EbayItemSummary[];
}

/**
 * eBay Browse API (official). Uses an application token (OAuth client credentials) and
 * `GET /buy/browse/v1/item_summary/search`. Read-only: no buying, bidding or messaging.
 */
export class EbayProvider extends LiveListingsProvider {
  readonly id = 'ebay' as const;
  readonly name = 'eBay';
  private token: { value: string; expiresAt: number } | null = null;
  private cfg: Required<Omit<EbayConfig, 'affiliateCampaignId'>> & { affiliateCampaignId?: string };

  constructor(cfg: EbayConfig, valuation?: MarketplaceProvider, fetchImpl?: FetchLike) {
    super(valuation, fetchImpl);
    this.cfg = {
      marketplaceId: 'EBAY_IT',
      apiBase: 'https://api.ebay.com',
      categoryIds: '11450',
      ...Object.fromEntries(Object.entries(cfg).filter(([, v]) => v)),
    } as typeof this.cfg;
  }

  private async getToken() {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) return this.token.value;
    const basic = Buffer.from(`${this.cfg.clientId}:${this.cfg.clientSecret}`).toString('base64');
    const json = await this.request<{ access_token?: string; expires_in?: number }>(
      `${this.cfg.apiBase}/identity/v1/oauth2/token`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'https://api.ebay.com/oauth/api_scope',
        }).toString(),
      },
      'eBay',
    );
    if (!json.access_token) throw new MarketSourceError('eBay non ha restituito un token valido.');
    this.token = { value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 7200) * 1000 };
    return this.token.value;
  }

  async searchItems(query: SearchQuery): Promise<SearchResult> {
    const token = await this.getToken();
    const filters = ['buyingOptions:{FIXED_PRICE}', 'priceCurrency:EUR'];
    if (query.maxPrice !== undefined) filters.push(`price:[..${query.maxPrice}]`);
    const params = new URLSearchParams({
      q: (query.text ?? query.brands?.join(' ') ?? 'vintage').slice(0, 100),
      limit: String(Math.min(query.limit ?? 50, 200)),
      sort: 'newlyListed',
      filter: filters.join(','),
    });
    if (this.cfg.categoryIds) params.set('category_ids', this.cfg.categoryIds);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': this.cfg.marketplaceId,
      'Accept-Language': 'it-IT',
    };
    if (this.cfg.affiliateCampaignId)
      headers['X-EBAY-C-ENDUSERCTX'] = `affiliateCampaignId=${this.cfg.affiliateCampaignId}`;

    const json = await this.request<EbaySearchResponse>(
      `${this.cfg.apiBase}/buy/browse/v1/item_summary/search?${params}`,
      { headers },
      'eBay',
    );
    const items = (json.itemSummaries ?? [])
      .map((s) => this.toMarketItem(s, query.brandHint))
      .filter((i): i is MarketItem => i !== null);
    return { items: this.remember(items), total: json.total ?? items.length };
  }

  private toMarketItem(s: EbayItemSummary, brandHint?: string): MarketItem | null {
    const title = s.title?.trim();
    const price = parseMoney(s.price?.value);
    if (!s.itemId || !title || price === null || s.price?.currency !== 'EUR') return null;
    const category = detectCategory(title);
    if (!category) return null; // cannot value an item we cannot classify
    const brand = detectBrand(title, brandHint ? [brandHint] : []) ?? brandHint ?? null;
    if (!brand) return null;
    const ship = s.shippingOptions?.find((o) => o.shippingCost?.currency === 'EUR')?.shippingCost?.value;
    const rating = s.seller?.feedbackPercentage ? Number(s.seller.feedbackPercentage) / 20 : null;
    return {
      id: `ebay-${s.itemId}`,
      marketplace: 'ebay',
      externalId: s.itemId,
      title: title.slice(0, 120),
      description: s.shortDescription?.slice(0, 500) ?? '',
      brand,
      category,
      model: null,
      size: detectSize(title, category) ?? '—',
      condition: mapEbayCondition(s.conditionId, s.condition),
      color: '',
      price,
      shippingCost: ship !== undefined ? parseMoney(ship) : null,
      currency: 'EUR',
      imageUrl: safeUrl(s.image?.imageUrl ?? s.thumbnailImages?.[0]?.imageUrl),
      listedAt:
        s.itemCreationDate && !Number.isNaN(Date.parse(s.itemCreationDate))
          ? s.itemCreationDate
          : new Date().toISOString(),
      favorites: 0,
      views: 0,
      sellerName: s.seller?.username ?? 'venditore eBay',
      sellerRating: rating !== null && Number.isFinite(rating) ? Math.round(rating * 10) / 10 : null,
      url: safeUrl(s.itemAffiliateWebUrl ?? s.itemWebUrl),
      isDemo: false,
    };
  }
}
