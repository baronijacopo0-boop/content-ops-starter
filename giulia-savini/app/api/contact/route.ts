import { NextResponse } from 'next/server';
import { validateContact } from '@/lib/contact';
import { emailConfigured, formatFields, ownerEmail, sendEmail } from '@/lib/server/email';
import { clientIp, createRateLimiter, readJsonObject } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

const MIN_FILL_TIME_MS = 2500;
const isLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

export async function POST(request: Request) {
    const data = await readJsonObject(request);
    if (!data) return NextResponse.json({ ok: false, error: 'Richiesta non valida.' }, { status: 400 });

    // Anti-spam: honeypot compilato o invio troppo rapido → risposta "ok" silenziosa, nessun invio.
    // Il tempo è misurato sul dispositivo, quindi non dipende dall'orologio del client rispetto al server.
    const elapsed = Number(data.elapsed);
    if (data.contact_hp || !Number.isFinite(elapsed) || elapsed < MIN_FILL_TIME_MS) {
        return NextResponse.json({ ok: true });
    }

    if (isLimited(clientIp(request))) {
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

    if (!emailConfigured()) {
        if (process.env.NODE_ENV !== 'production' || process.env.CONTACT_FORM_DEMO === 'true') {
            console.info('[contact] Invio email non configurato: richiesta simulata (nessun dato personale registrato).');
            return NextResponse.json({ ok: true, demo: true });
        }
        console.error('[contact] RESEND_API_KEY, CONTACT_TO_EMAIL o CONTACT_FROM_EMAIL non configurati.');
        return NextResponse.json({ ok: false, error: 'Il servizio di invio non è al momento disponibile.' }, { status: 503 });
    }

    const body = formatFields([
        ['Nome', entry.name],
        ['Email', entry.email],
        ['Telefono', entry.phone || '—'],
        ['Modalità preferita', entry.mode],
        ['Messaggio', entry.message]
    ]);
    const sent = await sendEmail({
        to: ownerEmail() as string,
        subject: `Nuova richiesta dal sito – ${entry.name}`,
        text: body.text,
        html: body.html,
        replyTo: entry.email
    });
    if (!sent) return NextResponse.json({ ok: false, error: 'Non è stato possibile inviare la richiesta.' }, { status: 502 });

    return NextResponse.json({ ok: true });
}
