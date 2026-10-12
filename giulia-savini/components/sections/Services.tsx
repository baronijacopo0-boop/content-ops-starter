import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { content, services } from '@/data/profile';
import { cn } from '@/lib/cn';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

export function Services() {
    return (
        <section id="percorsi" aria-labelledby="services-title" className="section">
            <div className="container">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading id="services-title" eyebrow={content.services.eyebrow} title={content.services.title} />
                    <Reveal delay={80} className="max-w-sm lg:pb-3">
                        <p className="text-ink-soft">{content.services.text}</p>
                    </Reveal>
                </div>

                <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-6">
                    {services.map((service, i) => (
                        <Reveal as="li" key={service.slug} delay={(i % 3) * 80} className={cn('flex', i < 3 ? 'lg:col-span-2' : 'lg:col-span-3')}>
                            <article className="group relative flex w-full flex-col rounded-[1.5rem] border border-ink/10 bg-white/50 p-7 transition-[background-color,border-color,transform,box-shadow] duration-300 ease-gentle hover:-translate-y-1 hover:border-sage/50 hover:bg-white hover:shadow-[0_24px_50px_-30px_rgba(68,86,75,0.45)] sm:p-8">
                                <div className="flex items-start justify-between">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-pale text-forest transition-colors duration-300 group-hover:bg-forest group-hover:text-cream">
                                        <ServiceIcon name={service.icon} className="h-6 w-6" />
                                    </span>
                                    <span aria-hidden className="font-serif text-lg italic text-clay-dark/70">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <h3 className="mt-8 text-[1.75rem] leading-tight">{service.title}</h3>
                                <p className="mt-3 flex-1 leading-relaxed text-ink-soft">{service.short}</p>
                                <Link
                                    href={`/percorsi/${service.slug}`}
                                    className="mt-8 inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-forest after:absolute after:inset-0 after:rounded-[1.5rem] after:content-['']"
                                >
                                    <span className="link-underline">Scopri di più</span>
                                    <span className="sr-only">: {service.title}</span>
                                    <ArrowUpRight
                                        aria-hidden
                                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        strokeWidth={1.6}
                                    />
                                </Link>
                            </article>
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}
