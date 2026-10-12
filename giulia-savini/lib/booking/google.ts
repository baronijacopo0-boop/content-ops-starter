import 'server-only';
import { createSign } from 'node:crypto';
import type { BusyInterval } from './slots';

/**
 * Client minimo per Google Calendar API tramite account di servizio (nessuna dipendenza esterna).
 * Variabili d'ambiente richieste:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  email dell'account di servizio
 *   GOOGLE_PRIVATE_KEY            chiave privata (anche con "\n" letterali)
 *   GOOGLE_CALENDAR_ID            ID del calendario della Dott.ssa (di solito il suo indirizzo Gmail)
 * Il calendario va condiviso con l'account di servizio con il permesso "Apportare modifiche agli eventi".
 */

const SCOPE = 'https://www.googleapis.com/auth/calendar';
const API = 'https://www.googleapis.com/calendar/v3';

export function googleCalendarConfigured() {
    return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CALENDAR_ID);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string;
    const key = (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, '\n');
    const now = Math.floor(Date.now() / 1000);
    const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
        iss: email,
        scope: SCOPE,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
    })}`;
    const signature = createSign('RSA-SHA256').update(unsigned).sign(key, 'base64url');

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` })
    });
    if (!res.ok) throw new Error(`Google token ${res.status}`);
    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return data.access_token;
}

async function call<T>(path: string, init: RequestInit) {
    const res = await fetch(`${API}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', ...init.headers },
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Google Calendar ${res.status}`);
    return (await res.json()) as T;
}

/** Intervalli occupati nel calendario della Dott.ssa (solo inizio/fine: nessun dettaglio degli impegni). */
export async function fetchBusy(timeMin: Date, timeMax: Date, timeZone: string): Promise<BusyInterval[]> {
    const calendarId = process.env.GOOGLE_CALENDAR_ID as string;
    const data = await call<{ calendars: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }> }>('/freeBusy', {
        method: 'POST',
        body: JSON.stringify({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), timeZone, items: [{ id: calendarId }] })
    });
    const entry = data.calendars[calendarId];
    if (!entry || entry.errors?.length) throw new Error('Calendario non accessibile: verificare la condivisione con l’account di servizio');
    return (entry.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/** Crea l'evento della prenotazione nel calendario della Dott.ssa. */
export async function createEvent(event: { summary: string; description: string; start: Date; end: Date; timeZone: string }) {
    const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID as string);
    return call<{ id: string; htmlLink: string }>(`/calendars/${calendarId}/events`, {
        method: 'POST',
        body: JSON.stringify({
            summary: event.summary,
            description: event.description,
            start: { dateTime: event.start.toISOString(), timeZone: event.timeZone },
            end: { dateTime: event.end.toISOString(), timeZone: event.timeZone },
            visibility: 'private',
            reminders: { useDefault: true }
        })
    });
}
