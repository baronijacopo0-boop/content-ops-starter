import type {
  ComparableItem,
  ComparableQuery,
  EstimatedMarketValue,
  MarketData,
  MarketDataQuery,
  MarketItem,
  MarketplaceProfile,
  MarketplaceProvider,
  MarketValueQuery,
  ProviderCapabilities,
  SearchQuery,
  SearchResult,
} from '../types';
import type { MarketplaceId } from '@/lib/domain/types';
import { MockVintedProvider } from './mock-vinted';

/** Error with a message that is safe to show to the user (no secrets, no raw payloads). */
export class MarketSourceError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Base for providers backed by an official listings API (eBay, Etsy…).
 * They supply real live listings; market valuation (sold comparables) is delegated to the
 * valuation provider until an authorized sold-data source is connected.
 */
export abstract class LiveListingsProvider implements MarketplaceProvider {
  abstract readonly id: MarketplaceId;
  abstract readonly name: string;
  readonly capabilities: ProviderCapabilities = {
    search: true,
    soldData: false,
    userItems: false,
    profiles: false,
    isMock: false,
  };
  protected seen = new Map<string, MarketItem>();

  constructor(
    protected valuation: MarketplaceProvider = new MockVintedProvider(),
    protected fetchImpl: FetchLike = (input, init) => fetch(input, init),
  ) {}

  abstract searchItems(query: SearchQuery): Promise<SearchResult>;

  protected remember(items: MarketItem[]) {
    for (const i of items) this.seen.set(i.id, i);
    if (this.seen.size > 2000) this.seen = new Map([...this.seen].slice(-1000));
    return items;
  }

  protected async request<T>(url: string, init: RequestInit, label: string): Promise<T> {
    let res: Response;
    try {
      res = await this.fetchImpl(url, { ...init, signal: AbortSignal.timeout(12_000) });
    } catch {
      throw new MarketSourceError(`${label} non raggiungibile, riprova più tardi.`);
    }
    if (res.status === 401 || res.status === 403)
      throw new MarketSourceError(`Credenziali ${label} non valide o senza permessi.`, res.status);
    if (res.status === 429)
      throw new MarketSourceError(`Limite di richieste ${label} raggiunto, riprova più tardi.`, 429);
    if (!res.ok) throw new MarketSourceError(`${label} ha risposto con errore ${res.status}.`, res.status);
    return (await res.json()) as T;
  }

  async getItem(id: string) {
    return this.seen.get(id) ?? null;
  }
  async getUserItems(): Promise<MarketItem[]> {
    return [];
  }
  async getSoldItems(): Promise<ComparableItem[]> {
    return [];
  }
  async getProfile(): Promise<MarketplaceProfile | null> {
    return null;
  }
  getMarketData(query: MarketDataQuery): Promise<MarketData> {
    return this.valuation.getMarketData(query);
  }
  getComparableItems(query: ComparableQuery): Promise<ComparableItem[]> {
    return this.valuation.getComparableItems(query);
  }
  getEstimatedMarketValue(query: MarketValueQuery): Promise<EstimatedMarketValue> {
    return this.valuation.getEstimatedMarketValue(query);
  }
}
