import type { CSSProperties } from 'react';
import { content } from '@/data/profile';
import { Reveal } from '@/components/ui/Reveal';

export function Approach() {
    const { approach } = content;
    return (
        <section id="approccio" aria-labelledby="approach-title" className="on-dark section relative overflow-hidden bg-forest text-cream">
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
                            {approach.contexts.map((c, i) => (
                                <li
                                    key={c}
                                    style={{ '--i': i } as CSSProperties}
                                    className="stagger flex items-center gap-3 border-b border-cream/15 py-4 text-[0.95rem] text-cream/90"
                                >
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
                {/* Contesto: anello tratteggiato che ruota lentissimo, con i suoi punti */}
                <g className="spin-slow">
                    <circle
                        cx="260"
                        cy="260"
                        r="245"
                        fill="none"
                        stroke="#F7F4EF"
                        strokeOpacity="0.22"
                        strokeDasharray="2 7"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                    />
                    <g fill="#C5CEC3" fillOpacity="0.8">
                        {[
                            [23, 197],
                            [497, 323],
                            [382, 473],
                            [138, 47]
                        ].map(([cx, cy], i) => (
                            <circle key={i} cx={cx} cy={cy} r="4" className="pop" style={{ '--draw-delay': `${1300 + i * 120}ms` } as CSSProperties} />
                        ))}
                    </g>
                </g>

                {/* Relazioni: l'anello si disegna */}
                <circle
                    cx="260"
                    cy="260"
                    r="165"
                    fill="none"
                    stroke="#F7F4EF"
                    strokeOpacity="0.35"
                    pathLength={1}
                    className="draw"
                    style={{ '--draw-delay': '250ms' } as CSSProperties}
                />

                {/* Persona: si disegna e poi "respira" */}
                <g className="breathe-soft">
                    <circle cx="260" cy="260" r="84" fill="#F7F4EF" fillOpacity="0.08" stroke="#B89D83" strokeOpacity="0.8" pathLength={1} className="draw" />
                </g>

                {/* connessioni sottili */}
                <g stroke="#F7F4EF" strokeOpacity="0.18">
                    {[
                        [333, 218, 403, 178],
                        [187, 302, 117, 342],
                        [260, 344, 260, 425]
                    ].map(([x1, y1, x2, y2], i) => (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            pathLength={1}
                            className="draw"
                            style={{ '--draw-delay': `${900 + i * 150}ms` } as CSSProperties}
                        />
                    ))}
                </g>

                {/* nodi sulle orbite */}
                <g fill="#B89D83">
                    {[
                        [403, 178],
                        [117, 342],
                        [260, 425]
                    ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="5" className="pop" style={{ '--draw-delay': `${1150 + i * 150}ms` } as CSSProperties} />
                    ))}
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
