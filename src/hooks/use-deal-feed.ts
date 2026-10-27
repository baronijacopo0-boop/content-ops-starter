'use client';

import useSWR from 'swr';
import { getMarketplaceProvider } from '@/lib/marketplace';
import type { LiveSearchResult, MarketItem, MarketplaceProvider } from '@/lib/marketplace/types';
import { useProfile } from '@/hooks/use-data';
import type { EvaluatedDeal } from '@/lib/deals/filter';
import type { UserProfileBundle } from '@/lib/domain/types';
import { publicEnv } from '@/lib/config';
import { evaluateWithMarket } from '@/services/ai/deal';

async function evaluate(
  items: MarketItem[],
  valuation: MarketplaceProvider,
  bundle: UserProfileBundle,
): Promise<EvaluatedDeal[]> {
  return Promise.all(
    items.map(async (item) => {
      const market = await valuation.getEstimatedMarketValue({
        brand: item.brand,
        category: item.category,
        condition: item.condition,
        size: item.size,
      });
      const evaluation = evaluateWithMarket(
        {
          name: item.title,
          brand: item.brand,
          category: item.category,
          condition: item.condition,
          size: item.size,
          // What you actually pay: item price + shipping to you (when the marketplace reports it).
          price: Math.round((item.price + (item.shippingCost ?? 0)) * 100) / 100,
          extraCosts: bundle.settings.defaultExtraCosts,
          targetRoi: bundle.goals.targetRoi,
          weights: bundle.settings.dealScoreWeights,
        },
        market,
      );
      return { item, evaluation };
    }),
  );
}

async function fetchLive(brands: string[]): Promise<LiveSearchResult | null> {
  if (publicEnv.isStaticExport) return null;
  const res = await fetch('/api/market/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brands: brands.slice(0, 6) }),
  });
  if (res.status === 404) return null; // API not deployed (e.g. static hosting)
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? 'Impossibile caricare gli annunci reali');
  }
  return (await res.json()) as LiveSearchResult;
}

/**
 * Deal Finder feed = demo listings (MockVintedProvider) + real listings from official marketplace
 * APIs (eBay, Etsy) fetched through /api/market/search. Every item is scored with the user's
 * Deal Score weights, target ROI and default extra costs. Market value comes from the comparables
 * of the valuation provider.
 */
export function useDealFeed() {
  const { data: bundle } = useProfile();
  const scoring = bundle
    ? [
        JSON.stringify(bundle.settings.dealScoreWeights),
        bundle.goals.targetRoi,
        bundle.settings.defaultExtraCosts,
      ]
    : null;
  const brands = bundle?.profile.favoriteBrands ?? [];

  const demo = useSWR<EvaluatedDeal[]>(scoring ? ['deal-feed', ...scoring] : null, async () => {
    const provider = getMarketplaceProvider('vinted');
    const { items } = await provider.searchItems({ limit: 100 });
    return evaluate(items, provider, bundle!);
  });

  const live = useSWR<{ deals: EvaluatedDeal[]; sources: LiveSearchResult['sources'] } | null>(
    scoring ? ['live-feed', brands.join('|'), ...scoring] : null,
    async () => {
      const result = await fetchLive(brands);
      if (!result) return null;
      return {
        deals: await evaluate(result.items, getMarketplaceProvider('vinted'), bundle!),
        sources: result.sources,
      };
    },
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    data: demo.data ? [...(live.data?.deals ?? []), ...demo.data] : undefined,
    error: demo.error,
    isLoading: demo.isLoading,
    mutate: () => Promise.all([demo.mutate(), live.mutate()]),
    sources: live.data?.sources ?? null,
    liveLoading: live.isLoading,
    liveError: live.error as Error | undefined,
  };
}
