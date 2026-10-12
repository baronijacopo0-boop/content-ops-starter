import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
    title: 'Pagina non trovata',
    robots: { index: false, follow: true },
    alternates: { canonical: null }
};

export default function NotFound() {
    return (
        <section className="container flex min-h-[60vh] flex-col items-start justify-center py-24">
            <p className="eyebrow">Errore 404</p>
            <h1 className="h-section mt-5">Questa pagina non esiste.</h1>
            <p className="lead mt-6 max-w-md">Forse il link non è più valido. Puoi tornare alla pagina principale.</p>
            <ButtonLink href="/" arrow className="mt-10">
                Torna alla home
            </ButtonLink>
        </section>
    );
}
