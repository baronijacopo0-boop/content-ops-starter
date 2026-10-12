import { content } from '@/data/profile';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export function FinalCta() {
    const { finalCta } = content;
    return (
        <section aria-labelledby="final-cta-title" className="px-3 py-3 sm:px-5 sm:py-5">
            <div className="relative overflow-hidden rounded-[2rem] bg-clay-light/70">
                <svg
                    aria-hidden
                    viewBox="0 0 800 800"
                    className="pointer-events-none absolute -bottom-1/2 left-1/2 h-[52rem] w-[52rem] -translate-x-1/2 text-clay/40"
                >
                    <g fill="none" stroke="currentColor" strokeWidth="0.8">
                        <circle cx="400" cy="400" r="390" />
                        <circle cx="400" cy="400" r="300" />
                        <circle cx="400" cy="400" r="210" />
                    </g>
                </svg>
                <Reveal className="container relative py-24 text-center sm:py-32 lg:py-40">
                    <h2 id="final-cta-title" className="mx-auto max-w-4xl font-serif text-[2.8rem] leading-[1.02] sm:text-7xl lg:text-[5.6rem]">
                        {finalCta.title}
                    </h2>
                    <p className="lead mx-auto mt-7 max-w-xl text-ink">{finalCta.text}</p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <ButtonLink href="/#contatti" arrow>
                            {finalCta.primary}
                        </ButtonLink>
                        <ButtonLink href="/#contatti" variant="secondary" className="border-ink/25">
                            {finalCta.secondary}
                        </ButtonLink>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
