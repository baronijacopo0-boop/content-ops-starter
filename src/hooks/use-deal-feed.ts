'use client';

import useSWR from 'swr';
import { getMarketplaceProvider } from '@/lib/marketplace';
import { useProfile } from '@/hooks/use-data';
import type { EvaluatedDeal } from '@/lib/deals/filter';
import { evaluateWithMarket } from '@/services/ai/deal';

/**
 * Loads the marketplace feed through the MarketplaceProvider and scores every item with the
 * user's Deal Score weights, target ROI and default extra costs.
 */
export function useDealFeed() {
  const { data: bundle } = useProfile();
  const key = bundle
    ? [
        'deal-feed',
        JSON.stringify(bundle.settings.dealScoreWeights),
        bundle.goals.targetRoi,
        bundle.settings.defaultExtraCosts,
      ]
    : null;
  return useSWR<EvaluatedDeal[]>(key, async () => {
    const provider = getMarketplaceProvider(bundle!.settings.preferredMarketplace);
    const { items } = await provider.searchItems({ limit: 100 });
    return Promise.all(
      items.map(async (item) => {
        const market = await provider.getEstimatedMarketValue({
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
            price: item.price,
            extraCosts: bundle!.settings.defaultExtraCosts,
            targetRoi: bundle!.goals.targetRoi,
            weights: bundle!.settings.dealScoreWeights,
          },
          market,
        );
        return { item, evaluation };
      }),
    );
  });
}
