import { Plus } from 'lucide-react';
import { content, faqs } from '@/data/profile';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Faq() {
    return (
        <section id="faq" aria-labelledby="faq-title" className="section bg-sand">
            <div className="container grid gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4">
                    <SectionHeading id="faq-title" eyebrow={content.faq.eyebrow} title={content.faq.title} />
                </div>
                <Reveal delay={80} className="lg:col-span-7 lg:col-start-6">
                    <div className="border-t border-ink/15">
                        {faqs.map((faq) => (
                            <details key={faq.question} className="faq-item group border-b border-ink/15">
                                <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-left font-serif text-[1.45rem] leading-snug text-ink transition-colors hover:text-forest sm:text-[1.6rem]">
                                    {faq.question}
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors group-hover:border-forest group-open:border-forest group-open:bg-forest group-open:text-cream">
                                        <Plus aria-hidden className="faq-icon h-4 w-4" strokeWidth={1.5} />
                                    </span>
                                </summary>
                                <p className="max-w-2xl pb-7 pr-12 leading-relaxed text-ink-soft">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
