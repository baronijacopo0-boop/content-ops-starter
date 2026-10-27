import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/config';
import { aiStatus } from '@/services/ai/server';
import { liveSourcesConfigured } from '@/lib/marketplace/live';

export const dynamic = 'force-dynamic';

/** Health check for monitoring / post-deploy test: GET /api/health */
export async function GET() {
  return NextResponse.json({
    ok: true,
    app: 'flip-ai',
    version: process.env.npm_package_version ?? '1.0.0',
    supabase: isSupabaseConfigured ? 'configured' : 'local-demo-mode',
    ai: aiStatus(),
    marketplaces: liveSourcesConfigured(),
    time: new Date().toISOString(),
  });
}
