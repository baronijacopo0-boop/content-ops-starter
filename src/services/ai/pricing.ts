import { getMarketplaceProvider } from '@/lib/marketplace';
import type { EstimatedMarketValue, MarketplaceProvider } from '@/lib/marketplace/types';
import { profitBreakdown } from '@/lib/domain/finance';
import type { Condition, ItemCategory } from '@/lib/domain/types';
import type { PriceEstimate, PriceStrategy } from './types';

/** Marketplace-friendly price: whole euros, never below 1. */
export function roundPrice(value: number) {
  return Math.max(1, Math.round(value));
}

export function buildStrategies(
  market: EstimatedMarketValue,
  purchasePrice: number | null,
  extraCosts: number,
): PriceStrategy[] {
  const recommended = roundPrice(market.mid);
  const quick = roundPrice(Math.max(market.low * 0.95, recommended * 0.83));
  const max = roundPrice(Math.max(market.high, recommended * 1.18));
  const d = market.avgDaysToSell;
  const mk = (
    key: PriceStrategy['key'],
    label: string,
    price: number,
    f: [number, number],
    description: string,
  ): PriceStrategy => {
    const b =
      purchasePrice !== null ? profitBreakdown(purchasePrice, price, extraCosts) : { profit: 0, roi: null };
    return {
      key,
      label,
      price,
      profit: b.profit,
      roi: b.roi,
      days: { min: Math.max(1, Math.round(d * f[0])), max: Math.max(2, Math.round(d * f[1])) },
      description,
    };
  };
  return [
    mk(
      'quick',
      'Vendita veloce',
      quick,
      [0.3, 0.7],
      'Sotto la media di mercato: attira subito offerte e libera capitale in pochi giorni.',
    ),
    mk(
      'recommended',
      'Prezzo consigliato',
      recommended,
      [0.6, 1.4],
      'In linea con i capi simili venduti: il miglior equilibrio tra tempo e guadagno.',
    ),
    mk(
      'max',
      'Massimo profitto',
      max,
      [1.3, 2.4],
      'Fascia alta del mercato: guadagni di più ma servono foto ottime e pazienza.',
    ),
  ];
}

/** estimatePrice(): market value + three pricing strategies for a garment. */
export async function estimatePrice(
  input: {
    brand: string;
    category: ItemCategory;
    condition: Condition;
    size?: string;
    purchasePrice?: number | null;
    extraCosts?: number;
  },
  provider: MarketplaceProvider = getMarketplaceProvider(),
): Promise<PriceEstimate> {
  const market = await provider.getEstimatedMarketValue({
    brand: input.brand,
    category: input.category,
    condition: input.condition,
    size: input.size,
  });
  const strategies = buildStrategies(market, input.purchasePrice ?? null, input.extraCosts ?? 0);
  return { market, strategies, recommended: strategies[1].price };
}

export function estimateSellTime(avgDays: number, price: number, marketValue: number) {
  // Pricing below market speeds things up, above market slows down.
  const ratio = marketValue > 0 ? price / marketValue : 1;
  const factor = Math.min(1.8, Math.max(0.5, ratio));
  const base = avgDays * factor;
  return { min: Math.max(1, Math.round(base * 0.6)), max: Math.max(3, Math.round(base * 1.5)) };
}
