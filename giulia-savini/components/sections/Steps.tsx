import { content } from '@/data/profile';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Steps() {
    const { steps } = content;
    return (
        <section aria-labelledby="steps-title" className="section bg-sand">
            <div className="container">
                <SectionHeading id="steps-title" eyebrow={steps.eyebrow} title={steps.title} />

                <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] bg-ink/10 lg:mt-12 lg:grid-cols-3">
                    {steps.items.map((step, i) => (
                        <Reveal as="li" key={step.title} delay={i * 100} className="flex flex-col bg-sand p-8 sm:p-10 lg:min-h-[19rem]">
                            <span aria-hidden className="font-serif text-6xl italic leading-none text-clay sm:text-7xl">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="mt-auto pt-10 text-3xl">
                                <span className="sr-only">Passo {i + 1}: </span>
                                {step.title}
                            </h3>
                            <p className="mt-3 max-w-xs leading-relaxed text-ink-soft">{step.text}</p>
                        </Reveal>
                    ))}
                </ol>

                <Reveal delay={100} className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-ink-soft">Il primo passo può essere anche solo una domanda.</p>
                    <ButtonLink href="/#contatti" arrow>
                        {steps.cta}
                    </ButtonLink>
                </Reveal>
            </div>
        </section>
    );
}
