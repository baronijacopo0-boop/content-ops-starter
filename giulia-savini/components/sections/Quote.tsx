import { content, profile } from '@/data/profile';
import { Reveal } from '@/components/ui/Reveal';

export function Quote() {
    return (
        <section aria-label="Citazione" className="py-28 sm:py-36 lg:py-48">
            <Reveal className="container">
                <figure className="mx-auto max-w-5xl text-center">
                    <span aria-hidden className="mx-auto block h-16 w-px bg-clay" />
                    <blockquote className="mt-12">
                        <p className="font-serif text-[2.05rem] italic leading-[1.2] text-ink sm:text-5xl lg:text-[4rem] lg:leading-[1.14]">
                            “{profile.quote}”
                        </p>
                    </blockquote>
                    <figcaption className="mt-10 text-eyebrow font-semibold uppercase text-forest">{content.quote.eyebrow}</figcaption>
                </figure>
            </Reveal>
        </section>
    );
}
