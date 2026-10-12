import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { profile, services } from '@/data/profile';
import { buildServiceJsonLd } from '@/lib/schema';
import { pageMetadata } from '@/lib/site';
import { ButtonLink } from '@/components/ui/Button';
import { JsonLd } from '@/components/JsonLd';
import { PrefillLink } from '@/components/ui/PrefillLink';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
    return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    const service = services.find((s) => s.slug === slug);
    if (!service) return {};
    const title = slug === 'consulenza-online' ? service.title : `${service.title} a ${profile.address.city}`;
    return pageMetadata({ title, description: service.seoDescription, path: `/percorsi/${service.slug}` });
}

export default async function ServicePage({ params }: { params: Params }) {
    const { slug } = await params;
    const service = services.find((s) => s.slug === slug);
    if (!service) notFound();
    const others = services.filter((s) => s.slug !== service.slug);

    return (
        <>
            <JsonLd data={buildServiceJsonLd(service)} />
            <article>
                <header className="container pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-20">
                    <nav aria-label="Percorso di navigazione" className="text-sm text-ink-soft">
                        <ol className="flex flex-wrap items-center gap-2">
                            <li>
                                <Link href="/" className="link-underline tap-target hover:text-ink">
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden>/</li>
                            <li>
                                <Link href="/#percorsi" className="link-underline tap-target hover:text-ink">
                                    Percorsi
                                </Link>
                            </li>
                            <li aria-hidden>/</li>
                            <li aria-current="page" className="text-ink">
                                {service.title}
                            </li>
                        </ol>
                    </nav>

                    <div className="mt-12 grid gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <span className="flex h-16 w-16 animate-fade-up items-center justify-center rounded-full bg-sage-pale text-forest">
                                <ServiceIcon name={service.icon} className="h-7 w-7" />
                            </span>
                            <h1 className="h-display mt-8 animate-fade-up [animation-delay:80ms]">{service.title}</h1>
                            <p className="mt-8 max-w-2xl animate-fade-up font-serif text-[1.6rem] leading-snug text-ink [animation-delay:160ms] sm:text-[1.85rem]">
                                {service.intro}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="bg-sand">
                    <div className="container grid gap-14 py-20 lg:grid-cols-12 lg:gap-10 lg:py-28">
                        <Reveal className="lg:col-span-6">
                            <h2 className="text-4xl">A chi si rivolge</h2>
                            <ul className="mt-8 border-t border-ink/10">
                                {service.forWhom.map((item) => (
                                    <li key={item} className="flex gap-4 border-b border-ink/10 py-5 leading-relaxed text-ink-soft">
                                        <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                        <Reveal delay={100} className="lg:col-span-5 lg:col-start-8">
                            <h2 className="text-4xl">Come si svolge</h2>
                            <p className="lead mt-8">{service.howItWorks}</p>
                            <p className="mt-6 text-ink-soft">Gli incontri possono svolgersi nello studio di {profile.address.city} oppure online.</p>
                            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <ButtonLink href="/#contatti" arrow>
                                    Richiedi un primo colloquio
                                </ButtonLink>
                                {service.slug === 'consulenza-online' && (
                                    <PrefillLink mode="online" variant="secondary">
                                        Richiedi una consulenza online
                                    </PrefillLink>
                                )}
                            </div>
                        </Reveal>
                    </div>
                </div>

                <section aria-labelledby="other-services" className="container py-20 lg:py-28">
                    <h2 id="other-services" className="text-4xl">
                        Altri percorsi
                    </h2>
                    <ul className="mt-10 border-t border-ink/10">
                        {others.map((s) => (
                            <li key={s.slug} className="border-b border-ink/10">
                                <Link href={`/percorsi/${s.slug}`} className="group flex items-center justify-between gap-6 py-6">
                                    <span className="font-serif text-2xl text-ink transition-colors group-hover:text-forest sm:text-3xl">{s.title}</span>
                                    <ArrowUpRight
                                        aria-hidden
                                        className="h-5 w-5 shrink-0 text-forest transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        strokeWidth={1.4}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link href="/#percorsi" className="group mt-8 inline-flex min-h-11 items-center gap-2 font-medium text-forest">
                        <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.6} />
                        <span className="link-underline">Torna alla home</span>
                    </Link>
                </section>
            </article>
        </>
    );
}
