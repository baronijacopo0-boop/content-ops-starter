import type { Condition, DealScoreWeights, ItemCategory, MarketplaceId } from '@/lib/domain/types';
import type { Tone } from '@/lib/domain/constants';
import type { EstimatedMarketValue } from '@/lib/marketplace/types';

export type AiEngine = 'mock' | 'anthropic';

export interface DealInput {
  name?: string;
  brand: string;
  category: ItemCategory;
  condition: Condition;
  size: string;
  price: number;
  extraCosts?: number;
  targetRoi?: number;
  weights?: DealScoreWeights;
  marketplace?: MarketplaceId;
}

export type DealBadge = 'hot' | 'good' | 'maybe' | 'skip';
export type QuickVerdict = 'BUY' | 'MAYBE' | 'SKIP';

export interface ScoreComponent {
  key: keyof DealScoreWeights;
  label: string;
  score: number;
  weight: number;
  hint: string;
}

export interface PriceStrategy {
  key: 'quick' | 'recommended' | 'max';
  label: string;
  price: number;
  profit: number;
  roi: number | null;
  days: { min: number; max: number };
  description: string;
}

export interface PriceEstimate {
  market: EstimatedMarketValue;
  strategies: PriceStrategy[];
  recommended: number;
}

export interface DealEvaluation {
  input: DealInput & { extraCosts: number; targetRoi: number };
  market: EstimatedMarketValue;
  strategies: PriceStrategy[];
  recommendedPrice: number;
  profit: number;
  roi: number | null;
  margin: number | null;
  dealScore: number;
  components: ScoreComponent[];
  badge: DealBadge;
  quickVerdict: QuickVerdict;
  sellTime: { min: number; max: number };
  maxBuyPrice: number;
  meetsTargetRoi: boolean;
  explanation: string;
  engine: AiEngine;
}

export type Confidence = 'high' | 'medium' | 'low';

export interface DetectedField<T = string> {
  value: T | null;
  confidence: Confidence;
  /** True when the user must verify the value before publishing. */
  needsConfirmation: boolean;
}

export interface ImageAnalysis {
  garmentType: DetectedField<ItemCategory>;
  brand: DetectedField;
  colors: DetectedField<string[]>;
  style: DetectedField;
  material: DetectedField;
  condition: DetectedField<Condition>;
  graphic: DetectedField;
  size: DetectedField;
  defects: string[];
  notes: string[];
  engine: AiEngine;
}

export interface ImageAnalysisInput {
  images: { name: string; dataUrl?: string; dominantColors: string[] }[];
  hints?: { brand?: string; category?: ItemCategory; size?: string };
}

export interface ListingAttributes {
  category: ItemCategory;
  brand: string;
  colors: string[];
  size: string | null;
  condition: Condition | null;
  material: string | null;
  style: string | null;
  graphic: string | null;
  model?: string | null;
  defects: string[];
}

export interface GeneratedListing {
  title: string;
  titleOptions: string[];
  description: string;
  hashtags: string[];
  warnings: string[];
  engine: AiEngine;
}

export interface BusinessInsight {
  id: string;
  tone: Tone;
  title: string;
  message: string;
  action: string;
}
