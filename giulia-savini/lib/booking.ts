import { bookingConfig } from '@/data/profile';

const ALLOWED_PREFIX = 'https://calendar.google.com/calendar/appointments/';

/** Restituisce l'URL della pagina di prenotazione Google Calendar (validato) o null. */
export function bookingUrl(): string | null {
    const raw = (process.env.GOOGLE_CALENDAR_BOOKING_URL || bookingConfig.url || '').trim();
    if (!raw.startsWith(ALLOWED_PREFIX)) return null;
    return raw;
}

/** Versione per l'incorporamento: Google richiede il parametro gv=true. */
export function bookingEmbedUrl(url: string) {
    const u = new URL(url);
    u.searchParams.set('gv', 'true');
    return u.toString();
}
