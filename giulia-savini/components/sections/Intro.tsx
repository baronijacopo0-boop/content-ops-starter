import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { content } from '@/data/profile';
import { Reveal } from '@/components/ui/Reveal';

export function Intro() {
    const { intro } = content;
    return (
        <section aria-labelledby="intro-title" className="section border-t border-ink/10">
            <div className="container grid gap-10 lg:grid-cols-12 lg:gap-16">
                <Reveal className="lg:col-span-6">
                    <p className="eyebrow">{intro.eyebrow}</p>
                    <h2 id="intro-title" className="h-section mt-5">
                        {intro.titleLines.map((line) => (
                            <span key={line} className="block">
                                {line}
                            </span>
                        ))}
                        <em className="block italic text-forest">{intro.titleEmphasis}</em>
                    </h2>
                </Reveal>
                <Reveal delay={120} className="lg:col-span-5 lg:col-start-8 lg:pt-14">
                    {intro.paragraphs.map((p, i) => (
                        <p key={i} className={i === 0 ? 'font-serif text-[1.6rem] leading-snug text-ink' : 'lead mt-6'}>
                            {p}
                        </p>
                    ))}
                    <Link href="/#approccio" className="group mt-9 inline-flex items-center gap-2 font-medium text-forest">
                        <span className="link-underline">{intro.cta}</span>
                        <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.6} />
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}
