import { NextResponse, type NextRequest } from 'next/server';
import { guardAiRequest, logGeneration } from '@/lib/api/guard';
import { imageAnalysisInputSchema } from '@/lib/validation';
import { analyzeItemImagesServer } from '@/services/ai/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const guard = await guardAiRequest(req, imageAnalysisInputSchema);
  if (!guard.ok) return guard.response;
  const result = await analyzeItemImagesServer(guard.data);
  // Never store image bytes in the log.
  void logGeneration(
    guard.userId,
    'image_analysis',
    result.engine,
    { images: guard.data.images.length, hints: guard.data.hints ?? null },
    result,
  );
  return NextResponse.json(result);
}
