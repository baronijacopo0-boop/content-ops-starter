import type { Metadata } from 'next';
import { profile } from '@/data/profile';

function normalizeUrl(url: string) {
    const withProtocol = url.startsWith('http') ? url : `https://${url}`;
    return withProtocol.replace(/\/+$/, '');
}

/**
 * URL pubblico del sito. Ordine di priorità:
 * NEXT_PUBLIC_SITE_URL → URL (Netlify) → VERCEL_PROJECT_PRODUCTION_URL → localhost
 */
export const siteUrl = normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'http://localhost:3000'
);

export const seo = {
    title: 'Dott.ssa Giulia Savini | Psicologa e Sessuologa a Teramo',
    description:
        'Dott.ssa Giulia Savini, psicologa e sessuologa clinica a Teramo. Consulenza psicologica individuale e di coppia, consulenza sessuologica e incontri online.',
    locale: 'it_IT'
};

export function formatStreet() {
    const { street, streetNumber } = profile.address;
    return streetNumber ? `${street}, ${streetNumber}` : street;
}

export function formatCityLine() {
    return `${profile.address.postalCode} ${profile.address.city} (${profile.address.province})`;
}

export function formatAddress() {
    return `${formatStreet()}, ${formatCityLine()}`;
}

/** Metadati completi per una pagina interna (canonical, OpenGraph e Twitter coerenti). */
export function pageMetadata({ title, description, path, index = true }: { title: string; description: string; path: string; index?: boolean }): Metadata {
    const fullTitle = `${title} | ${profile.fullName}`;
    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: { type: 'website', locale: seo.locale, siteName: profile.fullName, url: path, title: fullTitle, description },
        twitter: { card: 'summary_large_image', title: fullTitle, description },
        robots: { index, follow: true }
    };
}

/** Ricerca su Google Maps basata sull'indirizzo (nessuna coordinata inventata). */
export function mapsUrl() {
    const query = `${formatStreet()}, ${profile.address.postalCode} ${profile.address.city}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Restituisce il numero WhatsApp (solo cifre) o null se non configurato. */
export function whatsappNumber() {
    const digits = (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    return digits.length >= 8 ? digits : null;
}

export function whatsappUrl(number: string) {
    return `https://wa.me/${number}?text=${encodeURIComponent(profile.whatsappMessage)}`;
}

export function telHref(phone: string) {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
