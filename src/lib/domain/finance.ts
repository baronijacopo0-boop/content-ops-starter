import { round } from '@/lib/utils';

/** profitto = prezzo vendita − prezzo acquisto − costi extra */
export function calcProfit(salePrice: number, purchasePrice: number, extraCosts = 0) {
  return round(salePrice - purchasePrice - extraCosts);
}

/** ROI = profitto / prezzo acquisto × 100. Returns null when the item was free (ROI undefined). */
export function calcRoi(profit: number, purchasePrice: number): number | null {
  if (purchasePrice <= 0) return null;
  return round((profit / purchasePrice) * 100, 1);
}

/** Margine = profitto / prezzo vendita × 100 */
export function calcMargin(profit: number, salePrice: number): number | null {
  if (salePrice <= 0) return null;
  return round((profit / salePrice) * 100, 1);
}

export interface ProfitBreakdown {
  profit: number;
  roi: number | null;
  margin: number | null;
}

export function profitBreakdown(purchasePrice: number, salePrice: number, extraCosts = 0): ProfitBreakdown {
  const profit = calcProfit(salePrice, purchasePrice, extraCosts);
  return { profit, roi: calcRoi(profit, purchasePrice), margin: calcMargin(profit, salePrice) };
}

/**
 * Highest price worth paying to still hit the target ROI.
 * maxBuy = (resale − extraCosts) / (1 + targetRoi/100)
 */
export function maxBuyPrice(resalePrice: number, targetRoi: number, extraCosts = 0) {
  return Math.max(0, round((resalePrice - extraCosts) / (1 + targetRoi / 100)));
}

/** Sale price needed to reach the target ROI from a purchase price. */
export function breakEvenPrice(purchasePrice: number, extraCosts = 0, targetRoi = 0) {
  return round(purchasePrice * (1 + targetRoi / 100) + extraCosts);
}

/** Itemised extra costs of a sale. Fees can be fixed (€) and/or a % of the sale price. */
export interface CostBreakdown {
  packaging: number;
  shipping: number;
  feePct: number;
  feeFixed: number;
  other: number;
}

export const EMPTY_COSTS: CostBreakdown = { packaging: 0, shipping: 0, feePct: 0, feeFixed: 0, other: 0 };

/** Platform fee for a sale price: % part + fixed part. */
export function platformFee(salePrice: number, c: Pick<CostBreakdown, 'feePct' | 'feeFixed'>) {
  return round(Math.max(0, salePrice) * (Math.max(0, c.feePct) / 100) + Math.max(0, c.feeFixed));
}

/** Total extra costs = imballaggio + spedizione a carico + commissioni + altro. */
export function totalExtraCosts(salePrice: number, c: CostBreakdown) {
  return round(
    Math.max(0, c.packaging) + Math.max(0, c.shipping) + Math.max(0, c.other) + platformFee(salePrice, c),
  );
}
