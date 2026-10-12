import { DATE_RE, TIME_RE } from './time';

export type BookingPayload = {
    date: string;
    time: string;
    mode: 'studio' | 'online';
    name: string;
    email: string;
    phone: string;
    note: string;
    privacy: boolean;
    /** honeypot: deve restare vuoto */
    booking_hp: string;
    /** ms tra apertura del calendario e conferma, misurati sul dispositivo */
    elapsed: number;
};

export type BookingErrors = Partial<Record<'date' | 'time' | 'name' | 'email' | 'phone' | 'note' | 'privacy', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,}$/;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export function validateBooking(data: Partial<Record<keyof BookingPayload, unknown>>): BookingErrors {
    const errors: BookingErrors = {};
    if (!DATE_RE.test(str(data.date))) errors.date = 'Scegli un giorno dal calendario.';
    if (!TIME_RE.test(str(data.time))) errors.time = 'Scegli un orario.';
    const name = str(data.name);
    const email = str(data.email);
    const phone = str(data.phone);
    const note = str(data.note);
    if (name.length < 2) errors.name = 'Inserisci il tuo nome.';
    else if (name.length > 100) errors.name = 'Il nome è troppo lungo.';
    if (!email) errors.email = 'Inserisci il tuo indirizzo email.';
    else if (!EMAIL_RE.test(email) || email.length > 160) errors.email = 'Controlla l’indirizzo email: sembra non essere valido.';
    if (phone && (!PHONE_RE.test(phone) || phone.length > 30)) errors.phone = 'Controlla il numero di telefono.';
    if (note.length > 500) errors.note = 'La nota è troppo lunga (massimo 500 caratteri).';
    if (data.privacy !== true) errors.privacy = 'Per prenotare è necessario accettare l’informativa privacy.';
    return errors;
}
