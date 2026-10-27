import { describe, expect, it } from 'vitest';
import {
  breakEvenPrice,
  calcMargin,
  calcProfit,
  calcRoi,
  maxBuyPrice,
  profitBreakdown,
} from '@/lib/domain/finance';

describe('finance', () => {
  it('computes profit = sale − purchase − extra costs (spec example)', () => {
    expect(calcProfit(30, 10, 2)).toBe(18);
  });
  it('computes ROI = profit / purchase × 100 (spec example)', () => {
    expect(calcRoi(18, 10)).toBe(180);
    expect(calcRoi(5, 0)).toBeNull();
  });
  it('computes margin on sale price', () => {
    expect(calcMargin(18, 30)).toBe(60);
  });
  it('profitBreakdown handles losses', () => {
    expect(profitBreakdown(20, 15, 1)).toEqual({ profit: -6, roi: -30, margin: -40 });
  });
  it('max buy price for a target ROI', () => {
    // resale 40, target 100%, costs 2 → (40-2)/2 = 19
    expect(maxBuyPrice(40, 100, 2)).toBe(19);
    expect(maxBuyPrice(1, 100, 5)).toBe(0);
  });
  it('break-even price is consistent with maxBuyPrice', () => {
    const sale = breakEvenPrice(19, 2, 100);
    expect(sale).toBe(40);
  });
});
