import type { CSSProperties } from 'react';
import { content } from '@/data/profile';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Areas() {
    const { areas } = content;
    return (
        <section aria-labelledby="areas-title" className="section bg-sand">
            <div className="container">
                <SectionHeading id="areas-title" eyebrow={areas.eyebrow} title={areas.title} />

                <Reveal delay={80}>
                    {/* Mobile: chip */}
                    <ul className="mt-10 flex flex-wrap gap-2.5 sm:hidden">
                        {areas.items.map((item, i) => (
                            <li
                                key={item}
                                style={{ '--i': i } as CSSProperties}
                                className="stagger rounded-full border border-ink/15 bg-cream/60 px-4 py-2 font-serif text-[1.3rem] leading-tight text-ink"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                    {/* Da tablet in su: elenco tipografico */}
                    <ul className="mt-16 hidden flex-wrap items-baseline gap-x-2 gap-y-1 font-serif text-[2.4rem] leading-[1.35] text-ink sm:flex lg:text-[3rem] lg:leading-[1.3]">
                        {areas.items.map((item, i) => (
                            <li key={item} style={{ '--i': i, '--stagger-step': '60ms' } as CSSProperties} className="stagger inline-flex items-baseline gap-2">
                                <span className="transition-colors duration-300 hover:text-forest">{item}</span>
                                {i < areas.items.length - 1 && (
                                    <span aria-hidden className="mx-2 inline-block h-1.5 w-1.5 -translate-y-[0.35em] rounded-full bg-clay" />
                                )}
                            </li>
                        ))}
                    </ul>
                </Reveal>

                <Reveal delay={120}>
                    <div className="mt-16 flex flex-col gap-6 rounded-[1.5rem] bg-cream p-7 sm:p-10 lg:mt-20 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl">
                            <p className="font-serif text-[1.75rem] leading-tight text-ink sm:text-3xl">{areas.notFoundTitle}</p>
                            <p className="mt-3 text-ink-soft">{areas.notFoundText}</p>
                        </div>
                        <ButtonLink href="/#contatti" arrow className="shrink-0 self-start lg:self-auto">
                            {areas.cta}
                        </ButtonLink>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
