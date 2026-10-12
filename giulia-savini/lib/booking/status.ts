import 'server-only';
import { bookingConfig } from '@/data/profile';
import { photoPlaceholdersEnabled } from '@/lib/photos';
import { googleCalendarConfigured } from './google';

/**
 * - live: Google Calendar collegato e orari confermati → prenotazioni reali
 * - demo: modalità demo attiva → calendario funzionante con orari d'esempio, prenotazioni simulate
 * - off:  sezione nascosta
 */
export function bookingMode(): 'live' | 'demo' | 'off' {
    if (googleCalendarConfigured() && bookingConfig.hoursConfirmed) return 'live';
    if (photoPlaceholdersEnabled()) return 'demo';
    return 'off';
}
