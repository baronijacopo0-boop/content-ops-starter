import { bookingConfig } from '@/data/profile';
import { addDays, dateInZone, fromMinutes, toMinutes, weekday, zonedToUtc } from './time';

export type BusyInterval = { start: Date; end: Date };
/** Disponibilità: per ogni data 'AAAA-MM-GG' gli orari di inizio liberi ('HH:MM'). */
export type Availability = Record<string, string[]>;

type Config = typeof bookingConfig;

/** Primo e ultimo giorno prenotabili (nel fuso della professionista). */
export function bookingRange(now = new Date(), config: Config = bookingConfig) {
    const first = dateInZone(now, config.timeZone);
    return { first, last: addDays(first, config.daysAhead) };
}

/**
 * Calcola gli orari liberi: orari di lavoro − impegni già presenti − preavviso minimo.
 * Gli impegni vengono "allargati" della pausa, così tra due incontri resta sempre lo stacco previsto.
 */
export function computeAvailability(busy: BusyInterval[], now = new Date(), config: Config = bookingConfig): Availability {
    const { first } = bookingRange(now, config);
    const earliest = now.getTime() + config.minNoticeHours * 3600_000;
    const step = config.slotMinutes + config.bufferMinutes;
    const bufferMs = config.bufferMinutes * 60_000;
    const result: Availability = {};

    for (let i = 0; i <= config.daysAhead; i++) {
        const date = addDays(first, i);
        if (config.closedDates.includes(date)) continue;
        const ranges = config.weeklyHours[weekday(date)] ?? [];
        const slots: string[] = [];

        for (const [from, to] of ranges) {
            for (let m = toMinutes(from); m + config.slotMinutes <= toMinutes(to); m += step) {
                const time = fromMinutes(m);
                const start = zonedToUtc(date, time, config.timeZone).getTime();
                const end = start + config.slotMinutes * 60_000;
                if (start < earliest) continue;
                const overlaps = busy.some((b) => start < b.end.getTime() + bufferMs && end > b.start.getTime() - bufferMs);
                if (!overlaps) slots.push(time);
            }
        }
        if (slots.length) result[date] = slots;
    }
    return result;
}
