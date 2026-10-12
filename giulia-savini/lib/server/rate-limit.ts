import 'server-only';

/**
 * Limite indicativo di richieste per IP, valido per singola istanza del server.
 * Per una protezione più robusta affiancare un limite lato provider o uno store condiviso.
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
    const hits = new Map<string, number[]>();
    return function isLimited(ip: string) {
        const now = Date.now();
        for (const [key, times] of hits) {
            if (times.every((t) => now - t >= windowMs)) hits.delete(key);
        }
        const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
        recent.push(now);
        hits.set(ip, recent);
        return recent.length > max;
    };
}

export function clientIp(request: Request) {
    return request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

/** Legge il body JSON e verifica che sia un oggetto. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
    try {
        const body = await request.json();
        return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}
