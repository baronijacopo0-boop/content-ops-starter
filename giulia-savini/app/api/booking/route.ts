import { NextResponse } from 'next/server';
import { bookingConfig, profile } from '@/data/profile';
import { createEvent, fetchBusy } from '@/lib/booking/google';
import { computeAvailability } from '@/lib/booking/slots';
import { bookingMode } from '@/lib/booking/status';
import { addDays, zonedToUtc } from '@/lib/booking/time';
import { validateBooking } from '@/lib/booking/validate';
import { formatAddress } from '@/lib/site';
import { emailConfigured, formatFields, ownerEmail, sendEmail } from '@/lib/server/email';
import { clientIp, createRateLimiter, readJsonObject } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_FILL_TIME_MS = 3000;
const isLimited = createRateLimiter({ windowMs: 30 * 60 * 1000, max: 4 });

function formatWhen(date: string, time: string) {
    const label = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${date}T12:00:00Z`)
    );
    return `${label} alle ${time}`;
}

export async function POST(request: Request) {
    const mode = bookingMode();
    if (mode === 'off') return NextResponse.json({ ok: false, error: 'Prenotazione online non attiva.' }, { status: 404 });

    const data = await readJsonObject(request);
    if (!data) return NextResponse.json({ ok: false, error: 'Richiesta non valida.' }, { status: 400 });

    // Anti-spam silenzioso
    const elapsed = Number(data.elapsed);
    if (data.booking_hp || !Number.isFinite(elapsed) || elapsed < MIN_FILL_TIME_MS) return NextResponse.json({ ok: true, demo: mode === 'demo' });

    if (isLimited(clientIp(request))) {
        return NextResponse.json({ ok: false, error: 'Hai effettuato diverse prenotazioni in poco tempo.' }, { status: 429 });
    }

    const errors = validateBooking(data);
    if (Object.keys(errors).length > 0) {
        return NextResponse.json({ ok: false, error: 'Alcuni campi non sono validi.', errors }, { status: 422 });
    }

    const entry = {
        date: String(data.date),
        time: String(data.time),
        mode: data.mode === 'online' ? ('online' as const) : ('studio' as const),
        name: String(data.name).trim(),
        email: String(data.email).trim(),
        phone: typeof data.phone === 'string' ? data.phone.trim() : '',
        note: typeof data.note === 'string' ? data.note.trim() : ''
    };
    const { timeZone, slotMinutes } = bookingConfig;
    const start = zonedToUtc(entry.date, entry.time, timeZone);
    const end = new Date(start.getTime() + slotMinutes * 60_000);

    // Ricontrolla che l'orario sia ancora libero (evita doppie prenotazioni)
    try {
        const busy =
            mode === 'live' ? await fetchBusy(zonedToUtc(entry.date, '00:00', timeZone), zonedToUtc(addDays(entry.date, 1), '00:00', timeZone), timeZone) : [];
        const free = computeAvailability(busy)[entry.date] ?? [];
        if (!free.includes(entry.time)) {
            return NextResponse.json({ ok: false, code: 'slot_taken', error: 'Questo orario non è più disponibile. Scegline un altro.' }, { status: 409 });
        }
    } catch (err) {
        console.error('[booking] Verifica disponibilità non riuscita:', err instanceof Error ? err.message : err);
        return NextResponse.json({ ok: false, error: 'Non è stato possibile verificare la disponibilità.' }, { status: 502 });
    }

    if (mode === 'demo') {
        console.info('[booking] Modalità demo: prenotazione simulata (nessun dato registrato).');
        return NextResponse.json({ ok: true, demo: true });
    }

    const modeLabel = entry.mode === 'online' ? 'Online (videochiamata)' : `In studio – ${formatAddress()}`;
    const fields = formatFields([
        ['Quando', formatWhen(entry.date, entry.time)],
        ['Modalità', modeLabel],
        ['Nome', entry.name],
        ['Email', entry.email],
        ['Telefono', entry.phone || '—'],
        ['Nota', entry.note || '—']
    ]);

    try {
        await createEvent({
            summary: `${bookingConfig.eventTitle} – ${entry.name}${entry.mode === 'online' ? ' (online)' : ''}`,
            description: `Prenotazione dal sito\n\n${fields.text}`,
            start,
            end,
            timeZone
        });
    } catch (err) {
        console.error('[booking] Creazione evento non riuscita:', err instanceof Error ? err.message : err);
        return NextResponse.json({ ok: false, error: 'Non è stato possibile registrare la prenotazione.' }, { status: 502 });
    }

    // Notifiche email (se configurate): alla Dott.ssa e conferma alla persona
    if (emailConfigured()) {
        await sendEmail({
            to: ownerEmail() as string,
            subject: `Nuova prenotazione – ${formatWhen(entry.date, entry.time)}`,
            text: fields.text,
            html: fields.html,
            replyTo: entry.email
        });
        const confirm = formatFields([
            ['Quando', formatWhen(entry.date, entry.time)],
            ['Modalità', modeLabel]
        ]);
        await sendEmail({
            to: entry.email,
            subject: `Conferma prenotazione – ${profile.fullName}`,
            text: `Buongiorno ${entry.name},\n\nla tua prenotazione è stata registrata.\n\n${confirm.text}\n\n${
                entry.mode === 'online' ? 'Riceverai il link per la videochiamata prima dell’incontro.\n\n' : ''
            }Per spostare o annullare l’appuntamento puoi rispondere a questa email.\n\n${profile.fullName}`,
            html: `<p>Buongiorno ${entry.name.replace(/[<>&]/g, '')},</p><p>la tua prenotazione è stata registrata.</p>${confirm.html}${
                entry.mode === 'online' ? '<p>Riceverai il link per la videochiamata prima dell’incontro.</p>' : ''
            }<p>Per spostare o annullare l’appuntamento puoi rispondere a questa email.</p><p>${profile.fullName}</p>`,
            replyTo: ownerEmail() ?? undefined
        });
    }

    return NextResponse.json({ ok: true, emailSent: emailConfigured() });
}
