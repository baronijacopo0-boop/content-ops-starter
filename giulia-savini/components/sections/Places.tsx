import { ArrowUpRight, MapPin, Video } from 'lucide-react';
import { content, profile } from '@/data/profile';
import { formatAddress, mapsUrl } from '@/lib/site';
import { PrefillLink } from '@/components/ui/PrefillLink';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Places() {
    const { places } = content;
    return (
        <section id="studio-online" aria-labelledby="places-title" className="section">
            <div className="container">
                <SectionHeading id="places-title" eyebrow={places.eyebrow} title={places.title} />

                <div className="mt-14 grid gap-5 lg:mt-16 lg:grid-cols-2">
                    {/* STUDIO */}
                    <Reveal as="article" className="flex flex-col overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white/50">
                        <MapIllustration />
                        <div className="flex flex-1 flex-col p-7 sm:p-10">
                            <p className="flex items-center gap-3 text-eyebrow font-semibold uppercase text-forest">
                                <MapPin aria-hidden className="h-4 w-4" strokeWidth={1.5} />
                                {places.studio.label}
                            </p>
                            <h3 className="mt-4 text-4xl">{profile.address.city}</h3>
                            <address className="mt-3 not-italic leading-relaxed text-ink-soft">
                                {formatAddress()}
                                {profile.address.notes && (
                                    <>
                                        <br />
                                        {profile.address.notes}
                                    </>
                                )}
                            </address>
                            <p className="mt-4 flex-1 leading-relaxed text-ink-soft">{places.studio.text}</p>
                            <a
                                href={mapsUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group mt-6 inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-forest"
                            >
                                <span className="link-underline">{places.studio.mapCta}</span>
                                <span className="sr-only"> (si apre in una nuova finestra)</span>
                                <ArrowUpRight
                                    aria-hidden
                                    className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                    strokeWidth={1.6}
                                />
                            </a>
                        </div>
                    </Reveal>

                    {/* ONLINE */}
                    <Reveal
                        as="article"
                        delay={100}
                        className="on-dark relative flex flex-col overflow-hidden rounded-[1.5rem] bg-forest p-7 text-cream sm:p-10"
                    >
                        <svg aria-hidden viewBox="0 0 300 300" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 text-cream/10">
                            <g fill="none" stroke="currentColor">
                                <circle cx="150" cy="150" r="140" />
                                <circle cx="150" cy="150" r="95" />
                                <circle cx="150" cy="150" r="50" />
                            </g>
                        </svg>
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream/10 text-cream">
                            <Video aria-hidden className="h-6 w-6" strokeWidth={1.3} />
                        </span>
                        <p className="mt-10 text-eyebrow font-semibold uppercase text-sage-light">{places.online.label}</p>
                        <h3 className="mt-4 text-4xl text-cream">{places.online.title}</h3>
                        <p className="mt-4 max-w-md flex-1 leading-relaxed text-cream/80">{places.online.text}</p>
                        <PrefillLink mode="online" variant="light" arrow className="mt-10 self-start">
                            {places.online.cta}
                        </PrefillLink>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/** Illustrazione astratta: non rappresenta una mappa reale né coordinate. */
function MapIllustration() {
    return (
        <div aria-hidden className="relative h-44 overflow-hidden bg-sand sm:h-52">
            <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
                <g fill="none" stroke="#FFFFFF" strokeLinecap="round">
                    <path d="M-20 150 C 120 120, 220 170, 340 120 S 560 60, 640 90" strokeWidth="14" />
                    <path d="M180 -20 C 200 60, 260 120, 250 240" strokeWidth="9" />
                    <path d="M420 -20 C 400 80, 460 140, 430 240" strokeWidth="7" />
                    <path d="M-20 60 C 100 70, 160 40, 260 60" strokeWidth="5" />
                    <path d="M330 200 C 420 180, 520 200, 640 170" strokeWidth="5" />
                </g>
                <g fill="#E4DCD0">
                    <rect x="40" y="170" width="90" height="40" rx="8" />
                    <rect x="470" y="110" width="110" height="46" rx="8" />
                    <rect x="300" y="20" width="80" height="36" rx="8" />
                </g>
                <circle cx="300" cy="125" r="34" fill="#788879" fillOpacity="0.16" />
                <circle cx="300" cy="125" r="9" fill="#44564B" />
                <circle cx="300" cy="125" r="3.5" fill="#F7F4EF" />
            </svg>
        </div>
    );
}
