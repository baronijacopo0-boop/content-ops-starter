import { NextResponse, type NextRequest } from 'next/server';
import { guardAiRequest, logGeneration } from '@/lib/api/guard';
import { listingAttributesSchema } from '@/lib/validation';
import { generateListingServer } from '@/services/ai/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = await guardAiRequest(req, listingAttributesSchema);
  if (!guard.ok) return guard.response;
  const result = await generateListingServer({ ...guard.data, model: guard.data.model ?? null });
  void logGeneration(guard.userId, 'listing', result.engine, guard.data, { title: result.title });
  return NextResponse.json(result);
}
