import { NextResponse } from 'next/server';
import { validateContact, type ContactPayload } from '@/lib/contact';
import { profile } from '@/data/profile';

export const runtime = 'nodejs';

const MIN_FILL_TIME_MS = 2500;
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
// Limite indicativo, valido per singola istanza serverless: per una protezione più robusta
// affiancare un limite lato provider (es. Netlify/Resend) o uno store condiviso.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
    const now = Date.now();
    for (const [key, times] of hits) {
        if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key);
    }
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > RATE_LIMIT.max;
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: 'Richiesta non valida.' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json({ ok: false, error: 'Richiesta non valida.' }, { status: 400 });
    }
    const data = body as Partial<Record<keyof ContactPayload, unknown>>;

    // Anti-spam: honeypot compilato o invio troppo rapido → risposta "ok" silenziosa, nessun invio.
    // Il tempo è misurato sul dispositivo, quindi non dipende dall'orologio del client rispetto al server.
    const elapsed = Number(data.elapsed);
    const tooFast = !Number.isFinite(elapsed) || elapsed < MIN_FILL_TIME_MS;
    if (data.contact_hp || tooFast) {
        return NextResponse.json({ ok: true });
    }

    const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (rateLimited(ip)) {
        return NextResponse.json({ ok: false, error: 'Hai inviato diverse richieste in poco tempo.' }, { status: 429 });
    }

    const errors = validateContact(data);
    if (Object.keys(errors).length > 0) {
        return NextResponse.json({ ok: false, error: 'Alcuni campi non sono validi.', errors }, { status: 422 });
    }

    const entry = {
        name: String(data.name).trim(),
        email: String(data.email).trim(),
        phone: typeof data.phone === 'string' ? data.phone.trim() : '',
        mode: data.mode === 'online' ? 'Online' : 'In studio',
        message: String(data.message).trim()
    };

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL || profile.email;
    const from = process.env.CONTACT_FROM_EMAIL;

    if (!apiKey || !to || !from) {
        if (process.env.NODE_ENV !== 'production' || process.env.CONTACT_FORM_DEMO === 'true') {
            console.info('[contact] Invio email non configurato: richiesta simulata (nessun dato personale registrato).');
            return NextResponse.json({ ok: true, demo: true });
        }
        console.error('[contact] RESEND_API_KEY, CONTACT_TO_EMAIL o CONTACT_FROM_EMAIL non configurati.');
        return NextResponse.json({ ok: false, error: 'Il servizio di invio non è al momento disponibile.' }, { status: 503 });
    }

    const subject = `Nuova richiesta dal sito – ${entry.name}`;
    const text = [
        `Nome: ${entry.name}`,
        `Email: ${entry.email}`,
        `Telefono: ${entry.phone || '—'}`,
        `Modalità preferita: ${entry.mode}`,
        '',
        'Messaggio:',
        entry.message
    ].join('\n');
    const html = `<p><strong>Nome:</strong> ${escapeHtml(entry.name)}<br><strong>Email:</strong> ${escapeHtml(entry.email)}<br><strong>Telefono:</strong> ${escapeHtml(entry.phone || '—')}<br><strong>Modalità preferita:</strong> ${escapeHtml(entry.mode)}</p><p>${escapeHtml(entry.message).replace(/\n/g, '<br>')}</p>`;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: [to], reply_to: entry.email, subject, text, html })
        });
        if (!res.ok) {
            console.error('[contact] Errore provider email', res.status);
            return NextResponse.json({ ok: false, error: 'Non è stato possibile inviare la richiesta.' }, { status: 502 });
        }
    } catch {
        console.error('[contact] Provider email non raggiungibile');
        return NextResponse.json({ ok: false, error: 'Non è stato possibile inviare la richiesta.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
}
