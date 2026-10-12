/**
 * Utilità per date e orari in un fuso orario specifico (es. Europe/Rome),
 * senza dipendenze esterne. Gestiscono correttamente il cambio dell'ora legale.
 */

/** Data 'AAAA-MM-GG' nel fuso indicato. */
export function dateInZone(instant: Date, timeZone: string) {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
}

/** Scostamento in minuti del fuso rispetto a UTC in un dato istante (es. +120 per Roma in estate). */
function offsetMinutes(instant: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).formatToParts(instant);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return Math.round((asUtc - instant.getTime()) / 60000);
}

/** Converte data + ora locali del fuso ('AAAA-MM-GG', 'HH:MM') nell'istante UTC corrispondente. */
export function zonedToUtc(date: string, time: string, timeZone: string) {
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    let utc = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
    // Secondo passaggio: corregge i casi a ridosso del cambio d'ora
    utc = guess - offsetMinutes(new Date(utc), timeZone) * 60000;
    return new Date(utc);
}

/** Aggiunge giorni a una data 'AAAA-MM-GG'. */
export function addDays(date: string, days: number) {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Giorno della settimana di una data 'AAAA-MM-GG' (0 = domenica … 6 = sabato). */
export function weekday(date: string) {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function toMinutes(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

export function fromMinutes(total: number) {
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
