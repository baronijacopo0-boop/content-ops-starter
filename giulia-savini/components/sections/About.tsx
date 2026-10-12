import { GraduationCap } from 'lucide-react';
import { content, profile } from '@/data/profile';
import { Portrait } from '@/components/ui/Portrait';
import { Reveal } from '@/components/ui/Reveal';

export function About() {
    const { about } = content;
    return (
        <section id="chi-sono" aria-labelledby="about-title" className="section bg-sand">
            <div className="container grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
                <Reveal className="relative lg:col-span-5">
                    <Portrait
                        src={profile.photos.about.src}
                        alt={profile.photos.about.alt}
                        sizes="(min-width: 1024px) 40vw, (min-width: 640px) 70vw, 92vw"
                        variant="about"
                        className="mx-auto aspect-[4/5] max-w-[26rem] rounded-[1.75rem] rounded-br-[8rem] lg:mx-0 lg:max-w-none"
                    />
                    <span aria-hidden className="absolute -right-3 -top-3 hidden h-24 w-24 rounded-full border border-clay/60 lg:block" />
                </Reveal>

                <div className="lg:col-span-6 lg:col-start-7">
                    <Reveal>
                        <p className="eyebrow">{about.eyebrow}</p>
                        <h2 id="about-title" className="h-section mt-5">
                            {about.title}
                        </h2>
                    </Reveal>

                    <Reveal delay={100} className="mt-8">
                        <p className="font-serif text-2xl text-ink">{profile.fullName}</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {profile.titles.map((t) => (
                                <li key={t} className="rounded-full border border-forest/25 px-3.5 py-1.5 text-[0.82rem] text-forest">
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={160} className="mt-8 space-y-5">
                        {about.paragraphs.map((p, i) => (
                            <p key={i} className="lead max-w-xl">
                                {p}
                            </p>
                        ))}
                    </Reveal>

                    <Reveal delay={220}>
                        <dl className="mt-10 grid gap-6 border-t border-ink/10 pt-8 sm:grid-cols-2">
                            <div>
                                <dt className="text-eyebrow font-semibold uppercase text-forest">Formazione</dt>
                                {profile.education.map((e) => (
                                    <dd key={e} className="mt-3 flex gap-3 text-[0.95rem] leading-relaxed text-ink-soft">
                                        <GraduationCap aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-sage" strokeWidth={1.3} />
                                        {e}
                                    </dd>
                                ))}
                            </div>
                            <div>
                                <dt className="text-eyebrow font-semibold uppercase text-forest">Albo professionale</dt>
                                <dd className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                                    Iscrizione all’Albo degli Psicologi
                                    <br />
                                    n. {profile.registrationNumber}
                                    {profile.registrationBody && (
                                        <>
                                            <br />
                                            {profile.registrationBody}
                                        </>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
