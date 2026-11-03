'use client';

import useSWR from 'swr';
import { getMarketplaceProvider } from '@/lib/marketplace';
import type { LiveSearchResult, MarketItem, MarketplaceProvider } from '@/lib/marketplace/types';
import { useProfile } from '@/hooks/use-data';
import type { EvaluatedDeal } from '@/lib/deals/filter';
import type { CommunityListing, UserProfileBundle } from '@/lib/domain/types';
import { useApp } from '@/components/providers/app-provider';
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
        title: item.title,
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

function communityToMarketItem(c: CommunityListing): MarketItem {
  return {
    id: `community-${c.id}`,
    marketplace: 'vinted',
    externalId: c.id,
    title: c.title,
    description: '',
    brand: c.brand || 'Senza brand',
    category: c.category,
    model: null,
    size: c.size || '—',
    condition: c.condition,
    color: '',
    price: c.price,
    shippingCost: null,
    currency: 'EUR',
    imageUrl: c.photo,
    listedAt: c.publishedAt ?? new Date().toISOString(),
    favorites: 0,
    views: 0,
    sellerName: c.seller,
    sellerRating: null,
    url: c.externalUrl,
    isDemo: false,
    community: true,
  };
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

  // Listings other RIVENDO users chose to share (Supabase only; empty in local demo mode).
  const { repo, user } = useApp();
  const community = useSWR<EvaluatedDeal[]>(
    scoring && repo && user ? ['community-feed', user.id, ...scoring] : null,
    async () => {
      const rows = await repo!.listCommunityListings(60);
      return evaluate(rows.map(communityToMarketItem), getMarketplaceProvider('vinted'), bundle!);
    },
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    data: demo.data ? [...(community.data ?? []), ...(live.data?.deals ?? []), ...demo.data] : undefined,
    communityCount: community.data?.length ?? 0,
    communityAvailable: repo?.mode === 'supabase',
    error: demo.error,
    isLoading: demo.isLoading,
    mutate: () => Promise.all([demo.mutate(), live.mutate()]),
    sources: live.data?.sources ?? null,
    liveLoading: live.isLoading,
    liveError: live.error as Error | undefined,
  };
}
