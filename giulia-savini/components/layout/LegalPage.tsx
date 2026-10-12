import type { ReactNode } from 'react';
import { legal } from '@/data/profile';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
    const updated = new Date(`${legal.lastUpdated}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <article className="container pb-24 pt-10 sm:pt-14 lg:pb-32 lg:pt-20">
            <div className="mx-auto max-w-3xl">
                <h1 className="h-section">{title}</h1>
                <p className="mt-4 text-sm text-ink-soft">Ultimo aggiornamento: {updated}</p>

                {!legal.reviewed && (
                    <div role="note" className="mt-10 rounded-2xl border border-clay bg-clay-light/40 p-6 text-[0.95rem] leading-relaxed text-ink">
                        <strong className="font-semibold">Documento in bozza.</strong> Questo testo è un modello di partenza e deve essere verificato e
                        completato da un professionista (consulente privacy o legale) prima della pubblicazione definitiva. Le parti evidenziate indicano
                        informazioni da inserire.
                    </div>
                )}

                <div className="legal-prose mt-12">{children}</div>
            </div>
        </article>
    );
}

/** Evidenzia un dato mancante solo finché il documento non è stato revisionato. */
export function Todo({ children }: { children: ReactNode }) {
    if (legal.reviewed) return null;
    return <mark className="rounded bg-clay-light px-1.5 py-0.5 text-ink">[{children}]</mark>;
}
