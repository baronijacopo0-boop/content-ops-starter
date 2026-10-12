export type ContactPayload = {
    name: string;
    email: string;
    phone: string;
    mode: 'studio' | 'online';
    message: string;
    privacy: boolean;
    /** honeypot: deve restare vuoto */
    contact_hp: string;
    /** millisecondi trascorsi tra apertura del form e invio, misurati sul dispositivo (anti-bot) */
    elapsed: number;
};

export type ContactErrors = Partial<Record<'name' | 'email' | 'phone' | 'message' | 'privacy', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,}$/;

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export function validateContact(data: Partial<Record<keyof ContactPayload, unknown>>): ContactErrors {
    const errors: ContactErrors = {};
    const name = str(data.name);
    const email = str(data.email);
    const phone = str(data.phone);
    const message = str(data.message);

    if (name.length < 2) errors.name = 'Inserisci il tuo nome.';
    else if (name.length > 100) errors.name = 'Il nome è troppo lungo.';

    if (!email) errors.email = 'Inserisci il tuo indirizzo email.';
    else if (!EMAIL_RE.test(email) || email.length > 160) errors.email = 'Controlla l’indirizzo email: sembra non essere valido.';

    if (phone && (!PHONE_RE.test(phone) || phone.length > 30)) errors.phone = 'Controlla il numero di telefono.';

    if (message.length < 10) errors.message = 'Scrivi qualche parola in più (almeno 10 caratteri).';
    else if (message.length > 2000) errors.message = 'Il messaggio è troppo lungo (massimo 2000 caratteri).';

    if (data.privacy !== true) errors.privacy = 'Per inviare la richiesta è necessario accettare l’informativa privacy.';

    return errors;
}
