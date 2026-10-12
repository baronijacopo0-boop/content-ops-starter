import 'server-only';
import { profile } from '@/data/profile';

export function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

/** Indirizzo che riceve richieste e prenotazioni. */
export function ownerEmail() {
    return process.env.CONTACT_TO_EMAIL || profile.email || null;
}

export function emailConfigured() {
    return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL && ownerEmail());
}

type Mail = { to: string; subject: string; text: string; html: string; replyTo?: string };

/** Invia una email tramite Resend. Restituisce false se non configurato o in caso di errore. */
export async function sendEmail({ to, subject, text, html, replyTo }: Mail) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!apiKey || !from) return false;
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: [to], subject, text, html, ...(replyTo && { reply_to: replyTo }) })
        });
        if (!res.ok) console.error('[email] Errore provider email', res.status);
        return res.ok;
    } catch {
        console.error('[email] Provider email non raggiungibile');
        return false;
    }
}

/** Righe "Etichetta: valore" in testo semplice e HTML. */
export function formatFields(fields: [string, string][]) {
    return {
        text: fields.map(([k, v]) => `${k}: ${v}`).join('\n'),
        html: `<p>${fields.map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(v).replace(/\n/g, '<br>')}`).join('<br>')}</p>`
    };
}
