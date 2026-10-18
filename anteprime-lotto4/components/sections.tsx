import type { ReactNode } from 'react';
import { Mail, MapPin, Monitor, Phone, Plus } from 'lucide-react';
import type { Psicologo } from '@/data/types';
import { defaultApproach, defaultTagline, fullName, initials, mapsUrl, standardFaq, steps, telHref } from '@/data/standard';
import { ButtonLink, Monogram, SectionHeading } from './ui';

export function PreviewBanner() {
    return (
        <div className="bg-ink px-4 py-2 text-center text-[0.8rem] text-paper/85">
            Anteprima riservata · Lotto 4 · contenuti da confermare con il professionista
        </div>
    );
}

const nav = [
    { href: '#chi-sono', label: 'Chi sono' },
    { href: '#aree', label: 'Aree di intervento' },
    { href: '#come-lavoro', label: 'Come lavoro' },
    { href: '#contatti', label: 'Contatti' }
];

export function Navbar({ p }: { p: Psicologo }) {
    return (
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
            <div className="container flex h-[4.5rem] items-center justify-between gap-6">
                <a href="#top" className="min-w-0">
                    <span className="block truncate font-serif text-xl leading-tight text-ink">{fullName(p)}</span>
                    <span className="block truncate text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">{p.title}</span>
                </a>
                <nav aria-label="Principale" className="hidden lg:block">
                    <ul className="flex items-center gap-8 text-[0.92rem] text-ink-soft">
                        {nav.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className="transition-colors hover:text-accent">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <ButtonLink href="#contatti" className="shrink-0 px-5 text-[0.88rem]">
                    Contattami
                </ButtonLink>
            </div>
        </header>
    );
}

export function Hero({ p }: { p: Psicologo }) {
    const highlights = [
        p.inPerson && `Studio a ${p.city}`,
        p.online && 'Colloqui online',
        p.registration && `Iscrizione Albo n. ${p.registration.number}`
    ].filter(Boolean) as string[];
    return (
        <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute -right-40 -top-24 h-[34rem] w-[34rem] text-warm/40 lg:-right-24 lg:h-[44rem] lg:w-[44rem]">
                <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible">
                    <g fill="none" stroke="currentColor" strokeWidth="0.75">
                        <circle cx="300" cy="300" r="290" className="breathe" />
                        <circle cx="300" cy="300" r="220" className="breathe" style={{ animationDelay: '-3s' }} />
                        <circle cx="300" cy="300" r="150" className="breathe" style={{ animationDelay: '-6s' }} />
                    </g>
                </svg>
            </div>
            <div className="container relative grid items-center gap-12 pb-20 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-16">
                <div className="lg:col-span-7">
                    <p className="eyebrow animate-fade-up">
                        {p.title} · {p.city}
                    </p>
                    <h1 id="hero-title" className="h-display mt-6 animate-fade-up [animation-delay:120ms]">
                        {p.honorific} {p.firstName}
                        <br />
                        <em className="italic text-accent">{p.lastName}</em>
                    </h1>
                    <p className="lead mt-7 max-w-[32rem] animate-fade-up [animation-delay:240ms]">{p.tagline ?? defaultTagline(p)}</p>
                    <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:340ms] sm:flex-row sm:flex-wrap">
                        <ButtonLink href="#contatti" arrow>
                            Prenota un primo colloquio
                        </ButtonLink>
                        <ButtonLink href="#come-lavoro" variant="secondary">
                            Come lavoro
                        </ButtonLink>
                    </div>
                    {highlights.length > 0 && (
                        <ul className="mt-12 flex animate-fade-up flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft [animation-delay:440ms]">
                            {highlights.map((item) => (
                                <li key={item} className="flex items-center gap-2.5">
                                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="lg:col-span-5">
                    <Monogram text={initials(p)} className="mx-auto aspect-[4/5] max-w-[26rem] rounded-[1.75rem] rounded-tl-[9rem] sm:rounded-tl-[11rem]" />
                </div>
            </div>
        </section>
    );
}

export function About({ p }: { p: Psicologo }) {
    if (p.bio.length === 0 && p.education.length === 0) return null;
    return (
        <section aria-labelledby="chi-sono-title" id="chi-sono" className="section bg-sand">
            <div className="container grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <SectionHeading eyebrow="Chi sono" title={fullName(p)} id="chi-sono-title" />
                    {p.orientation && <p className="mt-5 text-ink-soft">{p.orientation}</p>}
                </div>
                <div className="space-y-5 text-[1.0625rem] leading-relaxed text-ink-soft lg:col-span-6 lg:col-start-7">
                    {p.bio.map((para) => (
                        <p key={para}>{para}</p>
                    ))}
                    {p.education.length > 0 && (
                        <div className="border-t border-ink/10 pt-6">
                            <h3 className="font-sans text-eyebrow font-semibold uppercase text-accent">Formazione</h3>
                            <ul className="mt-4 space-y-2.5 text-base">
                                {p.education.map((item) => (
                                    <li key={item} className="flex gap-3">
                                        <span aria-hidden className="mt-2.5 h-1 w-3 shrink-0 bg-warm" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {p.registration && (
                        <p className="text-sm">
                            Iscrizione all’Albo n. {p.registration.number}
                            {p.registration.body && ` · ${p.registration.body}`}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

export function Areas({ p }: { p: Psicologo }) {
    if (p.areas.length === 0) return null;
    return (
        <section aria-labelledby="aree-title" id="aree" className="section">
            <div className="container">
                <SectionHeading eyebrow="Aree di intervento" title="Di cosa mi occupo" id="aree-title">
                    Alcune delle situazioni per cui puoi rivolgerti a me. Se non ritrovi la tua, scrivimi: ne parliamo insieme.
                </SectionHeading>
                <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {p.areas.map((area, i) => (
                        <li key={area.title} className="rounded-3xl border border-ink/10 bg-white/40 p-7 sm:p-8">
                            <span className="font-serif text-lg italic text-warm">{String(i + 1).padStart(2, '0')}</span>
                            <h3 className="mt-3 text-[1.7rem] leading-tight">{area.title}</h3>
                            <p className="mt-3 leading-relaxed text-ink-soft">{area.text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export function Approach({ p }: { p: Psicologo }) {
    const paragraphs = p.approach.length > 0 ? p.approach : defaultApproach;
    return (
        <section aria-labelledby="come-lavoro-title" id="come-lavoro" className="on-dark section bg-accent-deep text-paper">
            <div className="container grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <SectionHeading eyebrow="Come lavoro" title="Un percorso costruito insieme" id="come-lavoro-title" tone="light" />
                    <div className="mt-8 flex flex-wrap gap-3 text-sm">
                        {p.inPerson && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-4 py-2">
                                <MapPin aria-hidden className="h-4 w-4" strokeWidth={1.5} /> In studio a {p.city}
                            </span>
                        )}
                        {p.online && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-4 py-2">
                                <Monitor aria-hidden className="h-4 w-4" strokeWidth={1.5} /> Online in videochiamata
                            </span>
                        )}
                    </div>
                </div>
                <div className="space-y-5 text-[1.0625rem] leading-relaxed text-paper/85 lg:col-span-6 lg:col-start-7">
                    {paragraphs.map((para) => (
                        <p key={para}>{para}</p>
                    ))}
                </div>
            </div>
            <div className="container mt-16">
                <ol className="grid gap-8 border-t border-paper/20 pt-10 sm:grid-cols-3">
                    {steps.map((step, i) => (
                        <li key={step.title}>
                            <span className="font-serif text-4xl italic text-warm">{i + 1}</span>
                            <h3 className="mt-3 text-2xl text-paper">{step.title}</h3>
                            <p className="mt-2 leading-relaxed text-paper/75">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

export function FaqSection({ p }: { p: Psicologo }) {
    const items = [...standardFaq(p), ...p.faq];
    return (
        <section aria-labelledby="faq-title" className="section">
            <div className="container grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <SectionHeading eyebrow="Domande frequenti" title="Prima di iniziare" id="faq-title" />
                </div>
                <div className="divide-y divide-ink/10 border-y border-ink/10 lg:col-span-7 lg:col-start-6">
                    {items.map((item) => (
                        <details key={item.question} className="faq-item group">
                            <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-left font-serif text-[1.45rem] leading-snug text-ink">
                                {item.question}
                                <Plus aria-hidden className="faq-icon h-5 w-5 shrink-0 text-accent" strokeWidth={1.4} />
                            </summary>
                            <p className="pb-6 pr-10 leading-relaxed text-ink-soft">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ContactRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
    return (
        <li className="flex gap-4 border-b border-ink/10 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-pale text-accent">{icon}</span>
            <div>
                <p className="text-eyebrow font-semibold uppercase text-ink-soft">{label}</p>
                <div className="mt-1 text-[1.05rem] text-ink">{children}</div>
            </div>
        </li>
    );
}

export function Contact({ p }: { p: Psicologo }) {
    const maps = mapsUrl(p);
    const primary = p.phone ? telHref(p.phone) : p.email ? `mailto:${p.email}` : null;
    return (
        <section aria-labelledby="contatti-title" id="contatti" className="section bg-sand">
            <div className="container grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <SectionHeading eyebrow="Contatti" title="Facciamo il primo passo" id="contatti-title">
                        Scrivimi o chiamami per fissare un primo colloquio conoscitivo{p.online ? ', in studio oppure online' : ''}.
                    </SectionHeading>
                    {primary && (
                        <ButtonLink href={primary} arrow className="mt-9">
                            {p.phone ? 'Chiama ora' : 'Scrivi una email'}
                        </ButtonLink>
                    )}
                </div>
                <ul className="border-t border-ink/10 lg:col-span-6 lg:col-start-7">
                    {p.phone && (
                        <ContactRow icon={<Phone aria-hidden className="h-4 w-4" strokeWidth={1.6} />} label="Telefono">
                            <a href={telHref(p.phone)} className="hover:text-accent">
                                {p.phone}
                            </a>
                        </ContactRow>
                    )}
                    {p.email && (
                        <ContactRow icon={<Mail aria-hidden className="h-4 w-4" strokeWidth={1.6} />} label="Email">
                            <a href={`mailto:${p.email}`} className="break-all hover:text-accent">
                                {p.email}
                            </a>
                        </ContactRow>
                    )}
                    {p.inPerson && (
                        <ContactRow icon={<MapPin aria-hidden className="h-4 w-4" strokeWidth={1.6} />} label="Studio">
                            {p.address ? (
                                <>
                                    {p.address.street}, {[p.address.postalCode, p.city].filter(Boolean).join(' ')}
                                    {p.province && ` (${p.province})`}
                                    {maps && (
                                        <a
                                            href={maps}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 block text-sm text-accent underline-offset-4 hover:underline"
                                        >
                                            Apri in Google Maps
                                        </a>
                                    )}
                                </>
                            ) : (
                                <>
                                    {p.city}
                                    {p.province && ` (${p.province})`}
                                </>
                            )}
                        </ContactRow>
                    )}
                    {p.online && (
                        <ContactRow icon={<Monitor aria-hidden className="h-4 w-4" strokeWidth={1.6} />} label="Online">
                            Colloqui in videochiamata
                        </ContactRow>
                    )}
                </ul>
            </div>
        </section>
    );
}

export function Footer({ p }: { p: Psicologo }) {
    const legal = [
        p.registration && `Albo n. ${p.registration.number}${p.registration.body ? ` · ${p.registration.body}` : ''}`,
        p.vatNumber && `P.IVA ${p.vatNumber}`
    ].filter(Boolean);
    return (
        <footer className="border-t border-ink/10 py-10 text-sm text-ink-soft">
            <div className="container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>
                    <span className="font-serif text-lg text-ink">{fullName(p)}</span> · {p.title}
                </p>
                {legal.length > 0 && <p>{legal.join(' · ')}</p>}
            </div>
        </footer>
    );
}
