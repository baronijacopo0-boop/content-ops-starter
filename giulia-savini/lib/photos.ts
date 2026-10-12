import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Restituisce true se il file esiste in /public.
 * Permette di sostituire il placeholder semplicemente caricando la foto
 * con il nome indicato in data/profile.ts, senza modificare il codice.
 */
export function publicFileExists(src: string) {
    try {
        return fs.existsSync(path.join(process.cwd(), 'public', src.replace(/^\//, '')));
    } catch {
        return false;
    }
}

/**
 * Modalità demo: mostra cornici e anteprime al posto dei contenuti mancanti (foto, calendario).
 * Si attiva con SHOW_DEMO_PLACEHOLDERS=true (accettato anche il vecchio SHOW_PHOTO_PLACEHOLDERS).
 */
export function photoPlaceholdersEnabled() {
    return process.env.SHOW_DEMO_PLACEHOLDERS === 'true' || process.env.SHOW_PHOTO_PLACEHOLDERS === 'true';
}
