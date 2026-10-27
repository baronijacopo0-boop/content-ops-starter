import { NextResponse, type NextRequest } from 'next/server';
import { guardAiRequest, logGeneration } from '@/lib/api/guard';
import { dealInputSchema } from '@/lib/validation';
import { analyzeDealServer } from '@/services/ai/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = await guardAiRequest(req, dealInputSchema);
  if (!guard.ok) return guard.response;
  const result = await analyzeDealServer(guard.data);
  void logGeneration(guard.userId, 'deal_analysis', result.engine, guard.data, {
    dealScore: result.dealScore,
    verdict: result.badge,
  });
  return NextResponse.json(result);
}
