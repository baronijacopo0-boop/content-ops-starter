import type { MarketplaceId } from '@/lib/domain/types';
import type { MarketplaceProvider } from './types';
import { MockVintedProvider } from './providers/mock-vinted';

export type { MarketplaceProvider } from './types';
export * from './types';

/**
 * Provider registry. To add Depop / eBay / Grailed / Vestiaire / Wallapop (or an official Vinted API),
 * implement MarketplaceProvider in ./providers and register its factory here. The UI and the AI services
 * only depend on the interface, never on a concrete provider.
 */
const factories: Partial<Record<MarketplaceId, () => MarketplaceProvider>> = {
  vinted: () => new MockVintedProvider(),
};

const cache = new Map<MarketplaceId, MarketplaceProvider>();

export function getMarketplaceProvider(id: MarketplaceId = 'vinted'): MarketplaceProvider {
  const existing = cache.get(id);
  if (existing) return existing;
  const factory = factories[id] ?? factories.vinted!;
  const provider = factory();
  cache.set(id, provider);
  return provider;
}

export function availableProviders(): MarketplaceId[] {
  return Object.keys(factories) as MarketplaceId[];
}
