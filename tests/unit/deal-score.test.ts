import { describe, expect, it } from 'vitest';
import {
  calculateDealScore,
  dealBadge,
  normalizeWeights,
  priceVsMarketScore,
  quickVerdict,
  sizeScore,
} from '@/services/ai/deal-score';
import { analyzeDeal } from '@/services/ai/deal';
import { DEFAULT_WEIGHTS } from '@/lib/domain/constants';

describe('Deal Score', () => {
  it('badges follow the spec thresholds', () => {
    expect(dealBadge(100)).toBe('hot');
    expect(dealBadge(80)).toBe('hot');
    expect(dealBadge(79)).toBe('good');
    expect(dealBadge(65)).toBe('good');
    expect(dealBadge(64)).toBe('maybe');
    expect(dealBadge(45)).toBe('maybe');
    expect(dealBadge(44)).toBe('skip');
    expect(dealBadge(0)).toBe('skip');
  });

  it('default weights are 30/20/20/15/10/5', () => {
    expect(DEFAULT_WEIGHTS).toEqual({
      priceVsMarket: 30,
      brandDemand: 20,
      roi: 20,
      sellSpeed: 15,
      condition: 10,
      size: 5,
    });
    const total = Object.values(normalizeWeights({ ...DEFAULT_WEIGHTS, size: 0 })).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(100);
  });

  it('cheaper than market scores higher', () => {
    expect(priceVsMarketScore(14, 35)).toBeGreaterThan(priceVsMarketScore(30, 35));
    expect(priceVsMarketScore(50, 35)).toBe(0);
  });

  it('common sizes score better', () => {
    expect(sizeScore('M', 'hoodie')).toBe(100);
    expect(sizeScore('XXL', 'hoodie')).toBeLessThan(80);
    expect(sizeScore('43', 'sneakers')).toBe(100);
  });

  it('weights change the score', () => {
    const f = {
      price: 10,
      marketValue: 30,
      demandScore: 40,
      roi: 150,
      avgDaysToSell: 30,
      condition: 'good' as const,
      size: 'M',
      category: 'hoodie' as const,
    };
    const base = calculateDealScore(f).score;
    const priceHeavy = calculateDealScore(f, {
      ...DEFAULT_WEIGHTS,
      priceVsMarket: 100,
      brandDemand: 0,
    }).score;
    expect(priceHeavy).toBeGreaterThan(base);
  });

  it('quick verdict needs positive profit and target ROI for BUY', () => {
    expect(quickVerdict(90, 20, true)).toBe('BUY');
    expect(quickVerdict(90, 20, false)).toBe('MAYBE');
    expect(quickVerdict(90, -1, true)).toBe('SKIP');
    expect(quickVerdict(30, 10, true)).toBe('SKIP');
  });

  it('a cheap Nike hoodie is a good deal, an overpriced H&M one is not', async () => {
    const good = await analyzeDeal({
      brand: 'Nike',
      category: 'hoodie',
      condition: 'very_good',
      size: 'M',
      price: 12,
    });
    const bad = await analyzeDeal({
      brand: 'H&M',
      category: 'hoodie',
      condition: 'fair',
      size: 'L',
      price: 15,
    });
    expect(good.dealScore).toBeGreaterThanOrEqual(65);
    expect(['hot', 'good']).toContain(good.badge);
    expect(bad.badge).toBe('skip');
    expect(good.explanation.length).toBeGreaterThan(40);
    expect(good.strategies.map((s) => s.key)).toEqual(['quick', 'recommended', 'max']);
    expect(good.strategies[0].price).toBeLessThanOrEqual(good.strategies[1].price);
    expect(good.strategies[1].price).toBeLessThanOrEqual(good.strategies[2].price);
  });
});
