import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { guardAiRequest } from '@/lib/api/guard';
import { searchLiveMarkets } from '@/lib/marketplace/live';
import { text } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const schema = z.object({
  brands: z.array(text(60)).max(6).default([]),
  text: text(100).optional(),
  maxPrice: z.number().positive().max(10_000).optional(),
});

const DEFAULT_BRANDS = ['Nike', 'Carhartt', 'Ralph Lauren', 'The North Face'];

/**
 * Live listings from official marketplace APIs (eBay Browse API, Etsy Open API).
 * Results are cached server-side for a few minutes; API keys never leave the server.
 */
export async function POST(req: NextRequest) {
  const guard = await guardAiRequest(req, schema, {
    bucket: 'market',
    limit: Number(process.env.MARKET_RATE_LIMIT_PER_MINUTE ?? 10),
  });
  if (!guard.ok) return guard.response;
  const { brands, text: q, maxPrice } = guard.data;
  const queries = q
    ? [{ text: q }]
    : (brands.filter(Boolean).length ? brands.filter(Boolean) : DEFAULT_BRANDS)
        .slice(0, 4)
        .map((b) => ({ text: `${b} vintage`, brandHint: b }));
  const result = await searchLiveMarkets({ queries, maxPrice, perQuery: 25 });
  return NextResponse.json(result, { headers: { 'Cache-Control': 'private, max-age=60' } });
}
