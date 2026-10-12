'use client';

import { ArrowUpRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
    embedUrl: string;
    externalUrl: string;
    loadCta: string;
    consent: string;
    externalCta: string;
};

/**
 * Calendario Google caricato solo su richiesta del visitatore:
 * prima del clic non avviene alcuna connessione a Google (nessun cookie di terze parti).
 */
export function BookingEmbed({ embedUrl, externalUrl, loadCta, consent, externalCta }: Props) {
    const [loaded, setLoaded] = useState(false);

    if (loaded) {
        return (
            <iframe
                src={embedUrl}
                title="Calendario delle disponibilità – prenotazione online"
                className="block h-[720px] w-full rounded-[1.25rem] border-0 bg-white sm:h-[640px]"
                loading="lazy"
            />
        );
    }

    return (
        <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-[1.25rem] bg-white/70 px-6 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-pale text-forest">
                <CalendarDays aria-hidden className="h-7 w-7" strokeWidth={1.3} />
            </span>
            <button
                type="button"
                onClick={() => setLoaded(true)}
                className="mt-8 inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-forest px-8 font-medium text-cream transition-colors duration-300 hover:bg-forest-deep active:scale-[0.98]"
            >
                {loadCta}
            </button>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
                {consent}{' '}
                <Link href="/cookie-policy" className="link-underline link-underline-static text-forest">
                    Cookie Policy
                </Link>
            </p>
            <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 inline-flex min-h-11 items-center gap-1.5 text-[0.95rem] font-medium text-forest"
            >
                <span className="link-underline">{externalCta}</span>
                <span className="sr-only"> (si apre in una nuova finestra)</span>
                <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.6} />
            </a>
        </div>
    );
}
