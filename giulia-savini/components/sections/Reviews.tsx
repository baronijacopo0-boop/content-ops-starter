import { ArrowUpRight, Star } from 'lucide-react';
import { content, profile } from '@/data/profile';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * Mostra il riepilogo della valutazione pubblica con link alla fonte e,
 * se presenti in data/profile.ts, le recensioni verificate.
 * Se non c'è né la valutazione né alcuna recensione, la sezione non viene renderizzata.
 */
export function Reviews() {
    const { rating, reviews, externalProfile } = profile;
    if (!rating.show && reviews.length === 0) return null;
    const filledStars = Math.round(Number(rating.value.replace(',', '.')) || 0);

    return (
        <section aria-labelledby="reviews-title" className="section border-t border-ink/10">
            <div className="container grid gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-5">
                    <SectionHeading id="reviews-title" eyebrow={content.reviews.eyebrow} title={content.reviews.title} />
                </div>

                <div className="lg:col-span-6 lg:col-start-7">
                    {rating.show && (
                        <Reveal delay={80} className="rounded-[1.5rem] bg-sand p-7 sm:p-10">
                            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                                <p className="font-serif text-7xl leading-none text-ink sm:text-8xl">
                                    {rating.value}
                                    <span className="text-3xl text-ink-soft sm:text-4xl">/{rating.scale}</span>
                                </p>
                                <div className="pb-2">
                                    <div className="flex gap-1 text-clay-dark" aria-hidden>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={i < filledStars ? 'h-4 w-4' : 'h-4 w-4 text-clay-dark/30'}
                                                fill="currentColor"
                                                strokeWidth={0}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-ink-soft">
                                        Valutazione media su {rating.count} opinioni pubblicate su {rating.source}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-8 border-t border-ink/10 pt-6 text-[0.95rem] leading-relaxed text-ink-soft">
                                Le opinioni sono raccolte e pubblicate da una piattaforma indipendente. Per rispetto della riservatezza di chi le ha scritte,
                                puoi leggerle direttamente sulla fonte.
                            </p>
                            <a
                                href={externalProfile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group mt-4 inline-flex min-h-11 items-center gap-1.5 font-medium text-forest"
                            >
                                <span className="link-underline">Leggi le opinioni su {externalProfile.label}</span>
                                <span className="sr-only"> (si apre in una nuova finestra)</span>
                                <ArrowUpRight
                                    aria-hidden
                                    className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                    strokeWidth={1.6}
                                />
                            </a>
                        </Reveal>
                    )}

                    {reviews.length > 0 && (
                        <ul className="mt-6 space-y-5">
                            {reviews.map((review, i) => (
                                <Reveal as="li" key={i} delay={120 + i * 60}>
                                    <figure className="rounded-[1.5rem] border border-ink/10 p-7 sm:p-8">
                                        <blockquote>
                                            <p className="font-serif text-xl italic leading-relaxed text-ink">“{review.text}”</p>
                                        </blockquote>
                                        <figcaption className="mt-5 text-sm text-ink-soft">
                                            <span className="font-medium text-ink">{review.author}</span>
                                            {review.date && <> · {review.date}</>}
                                            <span className="mt-1 block">
                                                Recensione verificata su{' '}
                                                {review.sourceUrl ? (
                                                    <a
                                                        href={review.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="link-underline link-underline-static text-forest"
                                                    >
                                                        {review.source}
                                                    </a>
                                                ) : (
                                                    review.source
                                                )}
                                            </span>
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
}
