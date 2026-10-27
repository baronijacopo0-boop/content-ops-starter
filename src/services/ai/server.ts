import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { CATEGORIES, CONDITIONS } from '@/lib/domain/constants';
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

/**
 * Server-side AI orchestration. Each function:
 *  1. computes the deterministic/mock result (always available);
 *  2. if an AI provider is configured (AI_API_KEY), asks the LLM to improve it;
 *  3. on any error/refusal returns the deterministic result, so the app never breaks.
 */

const DEFAULT_MODEL = 'claude-opus-5-5';
// Models that accept server-side refusal fallbacks (`fallbacks: "default"`).
const FALLBACK_MODELS = new Set([
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-fable-5-1',
  'claude-sonnet-5-5',
]);

export function aiStatus() {
  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
  const enabled = Boolean(process.env.AI_API_KEY) && provider === 'anthropic';
  return {
    enabled,
    provider: enabled ? provider : 'mock',
    model: enabled ? process.env.AI_MODEL || DEFAULT_MODEL : null,
  };
}

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ apiKey: process.env.AI_API_KEY, timeout: 60_000, maxRetries: 1 });
  return client;
}

async function structured<T extends z.ZodType>(
  schema: T,
  system: string,
  content: Anthropic.Beta.BetaContentBlockParam[],
): Promise<z.infer<T> | null> {
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const useFallbacks = FALLBACK_MODELS.has(model);
  const response = await getClient().beta.messages.parse({
    model,
    max_tokens: 4000,
    system,
    messages: [{ role: 'user', content }],
    output_config: { effort: 'low', format: betaZodOutputFormat(schema) },
    ...(useFallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
  });
  if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') return null;
  return (response.parsed_output as z.infer<T> | null) ?? null;
}

function logError(scope: string, error: unknown) {
  if (error instanceof Anthropic.RateLimitError) console.warn(`[ai:${scope}] rate limited by provider`);
  else if (error instanceof Anthropic.AuthenticationError) console.error(`[ai:${scope}] invalid AI_API_KEY`);
  else if (error instanceof Anthropic.APIError)
    console.error(`[ai:${scope}] API error ${error.status}: ${error.message}`);
  else console.error(`[ai:${scope}]`, error);
}

const RULES_IT =
  'Rispondi in italiano. Sei l’assistente di FLIP AI per reseller di abbigliamento usato. ' +
  'Non inventare mai autenticità, materiali, condizioni, difetti, taglia o provenienza: se un dato non è chiaramente visibile, lascialo null e segnalalo come da confermare.';

// ---------------------------------------------------------------- images
const fieldSchema = <T extends z.ZodType>(value: T) =>
  z.object({
    value: value.nullable(),
    confidence: z.enum(['high', 'medium', 'low']),
    needsConfirmation: z.boolean(),
  });

const imageSchema = z.object({
  garmentType: fieldSchema(z.enum(CATEGORIES.map((c) => c.value) as [string, ...string[]])),
  brand: fieldSchema(z.string()),
  colors: fieldSchema(z.array(z.string())),
  style: fieldSchema(z.string()),
  material: fieldSchema(z.string()),
  condition: fieldSchema(z.enum(CONDITIONS.map((c) => c.value) as [string, ...string[]])),
  graphic: fieldSchema(z.string()),
  size: fieldSchema(z.string()),
  defects: z.array(z.string()),
  notes: z.array(z.string()),
});

export async function analyzeItemImagesServer(input: ImageAnalysisInput): Promise<ImageAnalysis> {
  const mock = analyzeItemImagesMock(input);
  if (!aiStatus().enabled) return mock;
  const images = input.images.filter((i) => i.dataUrl?.startsWith('data:image/')).slice(0, 4);
  if (!images.length) return mock;
  try {
    const content: Anthropic.Beta.BetaContentBlockParam[] = images.map((img) => {
      const [meta, data] = img.dataUrl!.split(',');
      const mediaType = meta.slice(5, meta.indexOf(';')) as 'image/jpeg' | 'image/png' | 'image/webp';
      return { type: 'image', source: { type: 'base64', media_type: mediaType, data } };
    });
    content.push({
      type: 'text',
      text:
        `Analizza le foto di questo capo da rivendere. Categorie ammesse: ${CATEGORIES.map((c) => `${c.value} (${c.singular})`).join(', ')}. ` +
        `Condizioni ammesse: ${CONDITIONS.map((c) => `${c.value} (${c.label})`).join(', ')}. ` +
        'Colori in italiano (es. grigio, nero, blu navy). Stile tra: vintage, streetwear, y2k, sport, designer, workwear, outdoor, casual. ' +
        'Brand e taglia solo se leggibili su logo/etichetta. Elenca solo difetti chiaramente visibili. ' +
        (input.hints?.brand ? `L’utente indica il brand: ${input.hints.brand}. ` : '') +
        (input.hints?.size ? `L’utente indica la taglia: ${input.hints.size}. ` : ''),
    });
    const out = await structured(imageSchema, RULES_IT, content);
    if (!out) return mock;
    // Condition and size always need human confirmation, whatever the model says.
    return {
      ...(out as unknown as ImageAnalysis),
      condition: { ...(out.condition as ImageAnalysis['condition']), needsConfirmation: true },
      size: { ...out.size, needsConfirmation: true },
      colors: out.colors.value?.length ? out.colors : mock.colors,
      engine: 'anthropic',
    };
  } catch (error) {
    logError('images', error);
    return mock;
  }
}

// ---------------------------------------------------------------- listing
const listingSchema = z.object({
  titleOptions: z.array(z.string()),
  description: z.string(),
  hashtags: z.array(z.string()),
});

export async function generateListingServer(attrs: ListingAttributes): Promise<GeneratedListing> {
  const base = generateListing(attrs);
  if (!aiStatus().enabled) return base;
  try {
    const out = await structured(listingSchema, RULES_IT, [
      {
        type: 'text',
        text:
          'Scrivi un annuncio per un marketplace di second hand (es. Vinted) usando SOLO questi dati confermati: ' +
          JSON.stringify(attrs) +
          '. Genera 3 titoli SEO-friendly ma naturali (max 80 caratteri, includi brand, tipo di capo, colore e taglia se presenti), ' +
          'una descrizione breve pronta da copiare (frasi corte, una per riga, tono amichevole, chiudi con "Per misure o altre foto scrivetemi pure.") e 3-6 hashtag. ' +
          'Bozza di riferimento: ' +
          JSON.stringify({ title: base.title, description: base.description }),
      },
    ]);
    if (!out || !out.titleOptions.length) return base;
    return {
      ...base,
      title: out.titleOptions[0].slice(0, 90),
      titleOptions: out.titleOptions.map((t) => t.slice(0, 90)).slice(0, 3),
      description: out.description.slice(0, 2000),
      hashtags: out.hashtags.slice(0, 8),
      engine: 'anthropic',
    };
  } catch (error) {
    logError('listing', error);
    return base;
  }
}

// ---------------------------------------------------------------- deal
export async function analyzeDealServer(input: DealInput): Promise<DealEvaluation> {
  const evaluation = await analyzeDeal(input);
  if (!aiStatus().enabled) return evaluation;
  try {
    const out = await structured(z.object({ explanation: z.string() }), RULES_IT, [
      {
        type: 'text',
        text:
          'Spiega in 2-3 frasi semplici a un reseller principiante se conviene comprare questo capo, usando solo questi numeri (non inventarne altri): ' +
          JSON.stringify({
            capo: input.name,
            brand: input.brand,
            prezzoRichiesto: input.price,
            valoreMercato: evaluation.market,
            prezzoConsigliato: evaluation.recommendedPrice,
            profitto: evaluation.profit,
            roi: evaluation.roi,
            roiTarget: evaluation.input.targetRoi,
            dealScore: evaluation.dealScore,
            prezzoMassimoConsigliato: evaluation.maxBuyPrice,
          }),
      },
    ]);
    return out?.explanation
      ? { ...evaluation, explanation: out.explanation.slice(0, 800), engine: 'anthropic' }
      : evaluation;
  } catch (error) {
    logError('deal', error);
    return evaluation;
  }
}

// ---------------------------------------------------------------- insights
const insightsSchema = z.object({
  insights: z.array(z.object({ title: z.string(), message: z.string(), action: z.string() })),
});

export async function generateBusinessInsightsServer(
  items: InventoryItem[],
  sales: Sale[],
  goals?: Partial<UserGoals>,
): Promise<{ insights: BusinessInsight[]; engine: 'mock' | 'anthropic' }> {
  const insights = generateBusinessInsights(items, sales, goals);
  if (!aiStatus().enabled || insights.length < 2) return { insights, engine: 'mock' };
  try {
    const out = await structured(insightsSchema, RULES_IT, [
      {
        type: 'text',
        text:
          'Riformula questi insight di business in modo più chiaro e motivante, mantenendo ESATTAMENTE gli stessi numeri e lo stesso ordine. ' +
          JSON.stringify(insights.map(({ title, message, action }) => ({ title, message, action }))),
      },
    ]);
    if (!out || out.insights.length !== insights.length) return { insights, engine: 'mock' };
    return { insights: insights.map((i, idx) => ({ ...i, ...out.insights[idx] })), engine: 'anthropic' };
  } catch (error) {
    logError('insights', error);
    return { insights, engine: 'mock' };
  }
}
