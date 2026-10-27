'use client';

/**
 * Browser-side AI client. Calls the server routes (/api/ai/*) where the AI key lives.
 * If the routes are unavailable (static export on shared hosting, offline, 5xx) it transparently
 * falls back to the local deterministic engine, so every feature keeps working.
 */
import { publicEnv } from '@/lib/config';
import type { InventoryItem, Sale, UserGoals } from '@/lib/domain/types';
import { analyzeDeal } from './deal';
import { analyzeItemImagesMock } from './images';
import { generateBusinessInsights } from './insights';
import { generateListing } from './listing';
import type {
  BusinessInsight,
  DealEvaluation,
  DealInput,
  GeneratedListing,
  ImageAnalysis,
  ImageAnalysisInput,
  ListingAttributes,
} from './types';

export class AiRateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Hai fatto troppe richieste AI: riprova tra ${retryAfter} secondi.`);
  }
}

async function post<T>(path: string, body: unknown): Promise<T | null> {
  if (publicEnv.isStaticExport) return null;
  let res: Response;
  try {
    res = await fetch(`/api/ai/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return null; // offline / route missing → local engine
  }
  if (res.status === 429) throw new AiRateLimitError(Number(res.headers.get('Retry-After') ?? 60));
  if (res.status === 400 || res.status === 413) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? 'Dati non validi');
  }
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as T | null;
}

export const aiClient = {
  async analyzeDeal(input: DealInput): Promise<DealEvaluation> {
    return (await post<DealEvaluation>('deal', input)) ?? analyzeDeal(input);
  },
  async analyzeImages(input: ImageAnalysisInput): Promise<ImageAnalysis> {
    return (await post<ImageAnalysis>('analyze-images', input)) ?? analyzeItemImagesMock(input);
  },
  async generateListing(attrs: ListingAttributes): Promise<GeneratedListing> {
    return (await post<GeneratedListing>('listing', attrs)) ?? generateListing(attrs);
  },
  async insights(
    items: InventoryItem[],
    sales: Sale[],
    goals?: Partial<UserGoals>,
  ): Promise<{ insights: BusinessInsight[]; engine: string }> {
    const res = await post<{ insights: BusinessInsight[]; engine: string }>('insights', {
      items,
      sales,
      goals,
    });
    return res ?? { insights: generateBusinessInsights(items, sales, goals), engine: 'mock' };
  },
  async status(): Promise<{ enabled: boolean; provider: string; model: string | null }> {
    if (publicEnv.isStaticExport) return { enabled: false, provider: 'mock', model: null };
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      return json.ai;
    } catch {
      return { enabled: false, provider: 'mock', model: null };
    }
  },
};
