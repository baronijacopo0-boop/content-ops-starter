import type { Condition, DealScoreWeights, ItemCategory } from '@/lib/domain/types';
import { CONDITIONS, DEFAULT_WEIGHTS } from '@/lib/domain/constants';
import { clamp, round } from '@/lib/utils';
import type { DealBadge, QuickVerdict, ScoreComponent } from './types';

/**
 * Deal Score (0-100) = weighted average of six component scores (each 0-100).
 * Default weights: 30% price vs market · 20% brand demand · 20% ROI · 15% sell speed · 10% condition · 5% size.
 * Weights are user-editable (Settings → Deal Score) and are normalised, so they don't need to sum to 100.
 */
export interface DealScoreFactors {
  price: number;
  marketValue: number;
  demandScore: number;
  roi: number | null;
  avgDaysToSell: number;
  condition: Condition;
  size: string;
  category: ItemCategory;
}

export const COMPONENT_LABELS: Record<keyof DealScoreWeights, { label: string; hint: string }> = {
  priceVsMarket: {
    label: 'Prezzo vs mercato',
    hint: 'Quanto costa rispetto al valore medio dei capi simili venduti.',
  },
  brandDemand: { label: 'Domanda brand', hint: 'Quanto velocemente e spesso vende questo brand.' },
  roi: { label: 'ROI', hint: 'Ritorno sul prezzo pagato al prezzo di rivendita consigliato.' },
  sellSpeed: { label: 'Velocità vendita', hint: 'Giorni medi per vendere capi simili.' },
  condition: { label: 'Condizione', hint: 'Capi in migliori condizioni vendono prima e a prezzi più alti.' },
  size: { label: 'Taglia', hint: 'Le taglie più richieste (M/L, 42-44) vendono più facilmente.' },
};

export function priceVsMarketScore(price: number, marketValue: number) {
  if (marketValue <= 0) return 0;
  const discount = 1 - price / marketValue;
  // 60%+ below market → 100; at market → 20; 15%+ above → 0
  return clamp(((discount + 0.15) / 0.75) * 100);
}

export function roiScore(roi: number | null) {
  if (roi === null) return 100; // free item
  return clamp((roi / 150) * 100);
}

export function sellSpeedScore(avgDays: number) {
  // ≤5 days → 100; 45+ days → 0
  return clamp(100 - (avgDays - 5) * 2.5);
}

export function conditionScore(condition: Condition) {
  return CONDITIONS.find((c) => c.value === condition)?.score ?? 50;
}

export function sizeScore(size: string, category: ItemCategory) {
  const s = size.trim().toUpperCase();
  if (category === 'sneakers') {
    const n = parseFloat(s);
    if (Number.isNaN(n)) return 60;
    if (n >= 41 && n <= 44) return 100;
    if (n >= 39 && n <= 46) return 75;
    return 50;
  }
  if (category === 'jeans' || category === 'pants') {
    const n = parseInt(s, 10);
    if (!Number.isNaN(n)) return n >= 30 && n <= 34 ? 100 : n >= 28 && n <= 36 ? 75 : 55;
  }
  if (s === 'M' || s === 'L') return 100;
  if (s === 'S' || s === 'XL') return 80;
  if (s === 'XS' || s === 'XXL') return 55;
  if (s === 'UNICA') return 85;
  return 60;
}

export function normalizeWeights(weights: DealScoreWeights = DEFAULT_WEIGHTS): DealScoreWeights {
  const total = Object.values(weights).reduce((a, b) => a + Math.max(0, b), 0);
  if (total <= 0) return DEFAULT_WEIGHTS;
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, (Math.max(0, v) / total) * 100]),
  ) as unknown as DealScoreWeights;
}

export function calculateDealScore(factors: DealScoreFactors, weights: DealScoreWeights = DEFAULT_WEIGHTS) {
  const w = normalizeWeights(weights);
  const raw: Record<keyof DealScoreWeights, number> = {
    priceVsMarket: priceVsMarketScore(factors.price, factors.marketValue),
    brandDemand: clamp(factors.demandScore),
    roi: roiScore(factors.roi),
    sellSpeed: sellSpeedScore(factors.avgDaysToSell),
    condition: conditionScore(factors.condition),
    size: sizeScore(factors.size, factors.category),
  };
  const components: ScoreComponent[] = (Object.keys(raw) as (keyof DealScoreWeights)[]).map((key) => ({
    key,
    label: COMPONENT_LABELS[key].label,
    hint: COMPONENT_LABELS[key].hint,
    score: Math.round(raw[key]),
    weight: round(w[key], 1),
  }));
  const score = Math.round(components.reduce((acc, c) => acc + (c.score * c.weight) / 100, 0));
  return { score: clamp(score), components };
}

/** 80-100 HOT · 65-79 GOOD · 45-64 MAYBE · 0-44 SKIP */
export function dealBadge(score: number): DealBadge {
  if (score >= 80) return 'hot';
  if (score >= 65) return 'good';
  if (score >= 45) return 'maybe';
  return 'skip';
}

export const BADGE_META: Record<
  DealBadge,
  { label: string; emoji: string; verdict: string; tone: 'profit' | 'info' | 'warning' | 'loss' }
> = {
  hot: { label: 'HOT DEAL', emoji: '🔥', verdict: 'OTTIMO AFFARE', tone: 'profit' },
  good: { label: 'GOOD DEAL', emoji: '✅', verdict: 'BUON AFFARE', tone: 'info' },
  maybe: { label: 'MAYBE', emoji: '⚠️', verdict: 'RISCHIO MEDIO', tone: 'warning' },
  skip: { label: 'SKIP', emoji: '❌', verdict: 'NON CONVIENE', tone: 'loss' },
};

export function quickVerdict(score: number, profit: number, meetsTargetRoi: boolean): QuickVerdict {
  if (profit <= 0 || score < 45) return 'SKIP';
  if (score >= 65 && meetsTargetRoi) return 'BUY';
  return 'MAYBE';
}
