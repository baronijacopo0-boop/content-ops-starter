import 'server-only';
import type { MarketplaceId } from '@/lib/domain/types';
import type { LiveSearchResult, MarketItem, MarketSourceStatus } from './types';
import { EbayProvider } from './providers/ebay';
import { EtsyProvider } from './providers/etsy';
import { MarketSourceError, type LiveListingsProvider } from './providers/live-base';

/**
 * Live marketplaces with an official API, configured through server-side environment variables.
 * Sources without a public API (Depop, Grailed, Vestiaire Collective, Wallapop) are listed as
 * disabled until an authorized integration exists.
 */
interface SourceDef {
  id: MarketplaceId;
  name: string;
  create: () => LiveListingsProvider | null;
  missing: string;
}

const env = (k: string) => process.env[k]?.trim() || undefined;

const SOURCES: SourceDef[] = [
  {
    id: 'ebay',
    name: 'eBay',
    missing: 'Aggiungi EBAY_CLIENT_ID e EBAY_CLIENT_SECRET per vedere annunci reali.',
    create: () =>
      env('EBAY_CLIENT_ID') && env('EBAY_CLIENT_SECRET')
        ? new EbayProvider({
            clientId: env('EBAY_CLIENT_ID')!,
            clientSecret: env('EBAY_CLIENT_SECRET')!,
            marketplaceId: env('EBAY_MARKETPLACE_ID'),
            apiBase: env('EBAY_API_BASE'),
            categoryIds: env('EBAY_CATEGORY_IDS'),
            affiliateCampaignId: env('EBAY_AFFILIATE_CAMPAIGN_ID'),
          })
        : null,
  },
  {
    id: 'etsy',
    name: 'Etsy',
    missing: 'Aggiungi ETSY_API_KEY (keystring:shared_secret) per vedere annunci reali.',
    create: () =>
      env('ETSY_API_KEY')
        ? new EtsyProvider({ apiKey: env('ETSY_API_KEY')!, apiBase: env('ETSY_API_BASE') })
        : null,
  },
];

const NO_PUBLIC_API: { id: MarketplaceId; name: string }[] = [
  { id: 'depop', name: 'Depop' },
  { id: 'grailed', name: 'Grailed' },
  { id: 'vestiaire', name: 'Vestiaire Collective' },
  { id: 'wallapop', name: 'Wallapop' },
];

const providers = new Map<MarketplaceId, LiveListingsProvider | null>();
function provider(def: SourceDef) {
  if (!providers.has(def.id)) providers.set(def.id, def.create());
  return providers.get(def.id) ?? null;
}

const cache = new Map<string, { at: number; value: LiveSearchResult }>();
const TTL = Number(env('MARKET_CACHE_SECONDS') ?? 600) * 1000;

export interface LiveQuery {
  /** Each query runs once per source; `brandHint` helps classify titles that omit the brand. */
  queries: { text: string; brandHint?: string }[];
  maxPrice?: number;
  perQuery?: number;
}

export function liveSourcesConfigured() {
  return SOURCES.map((s) => ({ id: s.id, name: s.name, configured: provider(s) !== null }));
}

export async function searchLiveMarkets(q: LiveQuery): Promise<LiveSearchResult> {
  const key = JSON.stringify(q);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;

  const sources: MarketSourceStatus[] = [];
  const items = new Map<string, MarketItem>();

  await Promise.all(
    SOURCES.map(async (def) => {
      const p = provider(def);
      if (!p) {
        sources.push({ id: def.id, name: def.name, status: 'disabled', count: 0, message: def.missing });
        return;
      }
      const results = await Promise.allSettled(
        q.queries.map((query) =>
          p.searchItems({
            text: query.text,
            brandHint: query.brandHint,
            maxPrice: q.maxPrice,
            limit: q.perQuery ?? 25,
          }),
        ),
      );
      let count = 0;
      let error: string | null = null;
      for (const r of results) {
        if (r.status === 'fulfilled') {
          for (const item of r.value.items) {
            if (!items.has(item.id)) count++;
            items.set(item.id, item);
          }
        } else {
          error =
            r.reason instanceof MarketSourceError ? r.reason.message : `${def.name}: errore imprevisto.`;
          if (!(r.reason instanceof MarketSourceError)) console.error(`[market:${def.id}]`, r.reason);
        }
      }
      sources.push({
        id: def.id,
        name: def.name,
        status: count === 0 && error ? 'error' : 'ok',
        count,
        message: error,
      });
    }),
  );
  for (const s of NO_PUBLIC_API)
    sources.push({
      ...s,
      status: 'disabled',
      count: 0,
      message: 'Nessuna API pubblica: disponibile solo con un’integrazione autorizzata.',
    });

  const value: LiveSearchResult = { items: [...items.values()], sources };
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 100) cache.delete(cache.keys().next().value!);
  return value;
}

export function clearLiveMarketCache() {
  cache.clear();
  providers.clear();
}
