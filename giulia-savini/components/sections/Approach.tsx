import { content } from '@/data/profile';
import { Reveal } from '@/components/ui/Reveal';

export function Approach() {
    const { approach } = content;
    return (
        <section id="approccio" aria-labelledby="approach-title" className="section relative overflow-hidden bg-forest text-cream">
            <div className="container grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-6">
                    <Reveal>
                        <p className="eyebrow text-sage-light before:bg-clay">{approach.eyebrow}</p>
                        <h2 id="approach-title" className="mt-5 font-serif text-[3rem] leading-[1] text-cream sm:text-7xl lg:text-[5.5rem]">
                            {approach.title}
                        </h2>
                    </Reveal>
                    <Reveal delay={100} className="mt-8 max-w-xl space-y-5">
                        {approach.paragraphs.map((p, i) => (
                            <p key={i} className={i === 0 ? 'font-serif text-[1.55rem] leading-snug text-cream' : 'leading-relaxed text-cream/80 sm:text-lg'}>
                                {p}
                            </p>
                        ))}
                    </Reveal>
                    <Reveal delay={160}>
                        <ul
                            aria-label="Contesti di vita considerati nel percorso"
                            className="mt-10 grid grid-cols-2 gap-x-6 border-t border-cream/15 sm:grid-cols-3"
                        >
                            {approach.contexts.map((c) => (
                                <li key={c} className="flex items-center gap-3 border-b border-cream/15 py-4 text-[0.95rem] text-cream/90">
                                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </div>

                <Reveal delay={120} className="lg:col-span-6">
                    <SystemDiagram {...approach.rings} />
                </Reveal>
            </div>
        </section>
    );
}

function SystemDiagram({ center, middle, outer }: { center: string; middle: string; outer: string }) {
    return (
        <figure className="mx-auto w-full max-w-[34rem]">
            <svg
                viewBox="0 0 520 520"
                role="img"
                aria-label={`${center}, all’interno delle ${middle.toLowerCase()} e del ${outer.toLowerCase()}`}
                className="h-auto w-full"
            >
                <g fill="none" stroke="#F7F4EF">
                    <circle cx="260" cy="260" r="245" strokeOpacity="0.22" strokeDasharray="2 7" strokeLinecap="round" strokeWidth="1.5" />
                    <circle cx="260" cy="260" r="165" strokeOpacity="0.35" />
                </g>
                <circle cx="260" cy="260" r="84" fill="#F7F4EF" fillOpacity="0.08" stroke="#B89D83" strokeOpacity="0.8" />

                {/* nodi sulle orbite */}
                <g fill="#B89D83">
                    <circle cx="403" cy="178" r="5" />
                    <circle cx="117" cy="342" r="5" />
                    <circle cx="260" cy="425" r="5" />
                </g>
                <g fill="#C5CEC3" fillOpacity="0.8">
                    <circle cx="23" cy="197" r="4" />
                    <circle cx="497" cy="323" r="4" />
                    <circle cx="382" cy="473" r="4" />
                    <circle cx="138" cy="47" r="4" />
                </g>
                {/* connessioni sottili */}
                <g stroke="#F7F4EF" strokeOpacity="0.18">
                    <line x1="333" y1="218" x2="403" y2="178" />
                    <line x1="187" y1="302" x2="117" y2="342" />
                    <line x1="260" y1="344" x2="260" y2="425" />
                </g>

                <text x="260" y="270" textAnchor="middle" fontFamily="var(--font-serif), Georgia, serif" fontStyle="italic" fontSize="38" fill="#F7F4EF">
                    {center}
                </text>
                <g fontFamily="var(--font-sans), system-ui, sans-serif" fontSize="17" letterSpacing="3.5" fontWeight="600">
                    <rect x="180" y="80" width="160" height="32" rx="16" fill="#44564B" />
                    <text x="261" y="102" textAnchor="middle" fill="#C5CEC3">
                        {middle.toUpperCase()}
                    </text>
                    <rect x="180" y="0" width="160" height="32" rx="16" fill="#44564B" />
                    <text x="261" y="22" textAnchor="middle" fill="#E3D5C6">
                        {outer.toUpperCase()}
                    </text>
                </g>
            </svg>
        </figure>
    );
}
