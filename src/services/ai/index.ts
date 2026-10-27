/**
 * FLIP AI service layer (client-safe, deterministic part).
 * LLM-backed variants live in ./server.ts and are only reachable through /api/ai/* route handlers,
 * so AI keys never reach the browser.
 */
export { analyzeDeal, evaluateWithMarket, explainDeal } from './deal';
export {
  calculateDealScore,
  dealBadge,
  quickVerdict,
  BADGE_META,
  COMPONENT_LABELS,
  normalizeWeights,
} from './deal-score';
export { estimatePrice, buildStrategies, estimateSellTime, roundPrice } from './pricing';
export { generateListing, colorAdjective } from './listing';
export { analyzeItemImagesMock as analyzeItemImages } from './images';
export { generateBusinessInsights } from './insights';
export { generateResellingAdvice } from './advice';
export type * from './types';
