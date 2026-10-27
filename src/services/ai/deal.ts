import { getMarketplaceProvider } from '@/lib/marketplace';
import type { MarketplaceProvider } from '@/lib/marketplace/types';
import { brandOrDefault, categoryLabel, DEFAULT_SETTINGS, DEFAULT_TARGET_ROI } from '@/lib/domain/constants';
import { calcMargin, maxBuyPrice, profitBreakdown } from '@/lib/domain/finance';
import { formatEUR } from '@/lib/format';
import { calculateDealScore, dealBadge, quickVerdict } from './deal-score';
import { buildStrategies } from './pricing';
import type { DealEvaluation, DealInput } from './types';

function demandWord(score: number) {
  if (score >= 80) return 'alta';
  if (score >= 65) return 'buona';
  if (score >= 50) return 'media';
  return 'bassa';
}

function speedWord(days: number) {
  if (days <= 10) return 'molto rapidamente';
  if (days <= 18) return 'rapidamente';
  if (days <= 28) return 'in tempi nella media';
  return 'lentamente';
}

/** Deterministic, data-grounded explanation (used as-is in mock mode and as a fallback for the LLM). */
export function explainDeal(e: Omit<DealEvaluation, 'explanation' | 'engine'>): string {
  const { input, market } = e;
  const parts: string[] = [];
  const diff = market.mid > 0 ? Math.round((1 - input.price / market.mid) * 100) : 0;
  if (diff >= 5)
    parts.push(
      `Il prezzo richiesto è circa il ${diff}% inferiore al valore medio stimato (${formatEUR(market.mid, { decimals: false })}).`,
    );
  else if (diff <= -5)
    parts.push(
      `Il prezzo richiesto è circa il ${Math.abs(diff)}% superiore al valore medio stimato (${formatEUR(market.mid, { decimals: false })}): c'è poco margine.`,
    );
  else
    parts.push(
      `Il prezzo richiesto è in linea con il valore di mercato (${formatEUR(market.mid, { decimals: false })}), quindi il margine è limitato.`,
    );

  parts.push(
    `${input.brand} ha una domanda ${demandWord(market.demandScore)} e la categoria ${categoryLabel(input.category).toLowerCase()} tende a vendere ${speedWord(market.avgDaysToSell)} (circa ${Math.round(market.avgDaysToSell)} giorni).`,
  );

  if (e.roi !== null) {
    parts.push(
      e.meetsTargetRoi
        ? `Rivendendo a ${formatEUR(e.recommendedPrice, { decimals: false })} il ROI stimato è del ${Math.round(e.roi)}%, sopra il tuo obiettivo del ${input.targetRoi}%.`
        : `Rivendendo a ${formatEUR(e.recommendedPrice, { decimals: false })} il ROI stimato è del ${Math.round(e.roi)}%, sotto il tuo obiettivo del ${input.targetRoi}%.`,
    );
  }
  if (input.price > e.maxBuyPrice)
    parts.push(
      `Per rispettare il tuo ROI target prova a trattare: non pagare più di ${formatEUR(e.maxBuyPrice)}.`,
    );
  else parts.push(`Puoi pagarlo fino a ${formatEUR(e.maxBuyPrice)} restando nel tuo ROI target.`);
  if (market.source === 'model' || market.confidence < 0.4)
    parts.push('Ci sono pochi capi comparabili: verifica gli annunci venduti simili prima di comprare.');
  if (input.condition === 'fair')
    parts.push(
      'Le condizioni discrete riducono prezzo e velocità di vendita: controlla bene difetti e foto.',
    );
  return parts.join(' ');
}

/**
 * analyzeDeal(): full buy/skip evaluation of a potential purchase.
 * Pure + deterministic given the provider data – the LLM (if configured) only rewrites the explanation.
 */
export async function analyzeDeal(
  input: DealInput,
  provider: MarketplaceProvider = getMarketplaceProvider(input.marketplace),
): Promise<DealEvaluation> {
  const extraCosts = input.extraCosts ?? DEFAULT_SETTINGS.defaultExtraCosts;
  const targetRoi = input.targetRoi ?? DEFAULT_TARGET_ROI;
  const market = await provider.getEstimatedMarketValue({
    brand: input.brand,
    category: input.category,
    condition: input.condition,
    size: input.size,
  });
  return evaluateWithMarket({ ...input, extraCosts, targetRoi }, market);
}

export function evaluateWithMarket(
  input: DealInput & { extraCosts: number; targetRoi: number },
  market: DealEvaluation['market'],
): DealEvaluation {
  const strategies = buildStrategies(market, input.price, input.extraCosts);
  const recommended = strategies[1];
  const { profit, roi } = profitBreakdown(input.price, recommended.price, input.extraCosts);
  const demand = market.demandScore || brandOrDefault(input.brand).demand;
  const { score, components } = calculateDealScore(
    {
      price: input.price,
      marketValue: market.mid,
      demandScore: demand,
      roi,
      avgDaysToSell: market.avgDaysToSell,
      condition: input.condition,
      size: input.size,
      category: input.category,
    },
    input.weights,
  );
  const meetsTargetRoi = roi === null || roi >= input.targetRoi;
  const base: Omit<DealEvaluation, 'explanation' | 'engine'> = {
    input,
    market,
    strategies,
    recommendedPrice: recommended.price,
    profit,
    roi,
    margin: calcMargin(profit, recommended.price),
    dealScore: score,
    components,
    badge: dealBadge(score),
    quickVerdict: quickVerdict(score, profit, meetsTargetRoi),
    sellTime: recommended.days,
    maxBuyPrice: maxBuyPrice(recommended.price, input.targetRoi, input.extraCosts),
    meetsTargetRoi,
  };
  return { ...base, explanation: explainDeal(base), engine: 'mock' };
}
