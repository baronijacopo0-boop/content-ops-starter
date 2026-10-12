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

/** Cornici demo visibili al posto delle foto mancanti (variabile d'ambiente SHOW_PHOTO_PLACEHOLDERS=true). */
export function photoPlaceholdersEnabled() {
    return process.env.SHOW_PHOTO_PLACEHOLDERS === 'true';
}
