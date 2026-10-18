import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { psicologi } from '@/data/psicologi';
import { fullName } from '@/data/standard';
import { themes } from '@/data/themes';

/** Indice interno delle anteprime del lotto. */
export default function IndicePage() {
    return (
        <main className="container py-16 sm:py-20">
            <p className="eyebrow">Lotto 4</p>
            <h1 className="h-section mt-5">Anteprime dei siti</h1>
            <p className="lead mt-5 max-w-[36rem]">
                {psicologi.length} {psicologi.length === 1 ? 'anteprima' : 'anteprime'}. Ogni pagina è un sito di una sola pagina, pronto da mostrare al
                professionista.
            </p>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {psicologi.map((p) => (
                    <li key={p.slug}>
                        <Link
                            href={`/${p.slug}/`}
                            className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-white/50 p-6 transition-colors hover:border-accent"
                        >
                            <span aria-hidden className="h-2 w-10 rounded-full" style={{ backgroundColor: `rgb(${themes[p.theme].accent})` }} />
                            <span className="mt-5 font-serif text-2xl leading-tight text-ink">{fullName(p)}</span>
                            <span className="mt-1 text-sm text-ink-soft">
                                {p.title} · {p.city}
                            </span>
                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent">
                                Apri l’anteprima
                                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.6} />
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
