import type { CSSProperties } from 'react';
import { content, profile } from '@/data/profile';
import { ButtonLink } from '@/components/ui/Button';
import { Portrait } from '@/components/ui/Portrait';

export function Hero() {
    const { hero } = content;
    return (
        <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden">
            {/* Elemento grafico astratto: cerchi che "respirano", con leggero parallax allo scroll */}
            <div
                aria-hidden
                className="parallax pointer-events-none absolute -right-40 -top-24 h-[34rem] w-[34rem] text-clay/30 sm:-right-24 lg:right-[-6rem] lg:top-[-4rem] lg:h-[46rem] lg:w-[46rem]"
            >
                <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible">
                    <g fill="none" stroke="currentColor" strokeWidth="0.75">
                        <circle cx="300" cy="300" r="290" className="breathe" />
                        <circle cx="300" cy="300" r="220" className="breathe" style={{ animationDelay: '-2.6s' }} />
                        <circle cx="300" cy="300" r="150" className="breathe" style={{ animationDelay: '-5.2s' }} />
                    </g>
                </svg>
            </div>

            <div className="container relative grid items-center gap-12 pb-20 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-16 xl:gap-16">
                <div className="lg:col-span-6 xl:col-span-6">
                    <p className="eyebrow animate-fade-up">{hero.eyebrow}</p>
                    <h1 id="hero-title" className="h-display mt-6">
                        {/* Ogni riga emerge da una maschera, in sequenza */}
                        {hero.titleLines.map((line, i) => (
                            <span key={line} className="mask-line" style={{ '--i': i } as CSSProperties}>
                                <span>{line}</span>
                            </span>
                        ))}
                        <span className="mask-line" style={{ '--i': hero.titleLines.length } as CSSProperties}>
                            <em className="font-serif italic text-forest">{hero.titleEmphasis}</em>
                        </span>
                    </h1>
                    <p className="lead mt-7 max-w-[30rem] animate-fade-up [animation-delay:420ms]">{hero.text}</p>

                    <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:520ms] sm:flex-row sm:flex-wrap sm:items-center">
                        <ButtonLink href="/#contatti" arrow>
                            {hero.primaryCta}
                        </ButtonLink>
                        <ButtonLink href="/#approccio" variant="secondary">
                            {hero.secondaryCta}
                        </ButtonLink>
                    </div>

                    <ul className="mt-12 flex animate-fade-up flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft [animation-delay:620ms]">
                        {hero.highlights.map((item) => (
                            <li key={item} className="flex items-center gap-2.5">
                                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sage" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative lg:col-span-6 xl:col-span-5 xl:col-start-8">
                    <div className="relative mx-auto max-w-[30rem] lg:max-w-none">
                        <Portrait
                            src={profile.photos.hero.src}
                            alt={profile.photos.hero.alt}
                            hint={profile.photos.hero.hint}
                            frameClassName="rounded-tl-[8rem] sm:rounded-tl-[11rem]"
                            sizes="(min-width: 1280px) 520px, (min-width: 1024px) 46vw, (min-width: 640px) 480px, 92vw"
                            priority
                            className="unveil aspect-[4/5] rounded-[1.75rem] rounded-tl-[9rem] sm:rounded-tl-[12rem]"
                        />
                        <div
                            style={{ '--delay': '1000ms' } as CSSProperties}
                            className="float-in absolute -bottom-6 left-4 max-w-[15.5rem] rounded-2xl bg-cream/95 px-5 py-4 shadow-[0_18px_40px_-24px_rgba(41,42,39,0.45)] backdrop-blur sm:-left-8 sm:bottom-10"
                        >
                            <p className="font-serif text-xl leading-snug text-ink">{profile.fullName}</p>
                            <p className="mt-1 text-[0.8rem] leading-snug text-ink-soft">Iscrizione Albo n. {profile.registrationNumber}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
