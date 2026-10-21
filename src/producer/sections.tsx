import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { beats, contactLinks, formatPrice, formatTime, licenses, producer, services, type Beat } from './data';
import { usePlayer } from './player';
import {
    CartIcon,
    CloseIcon,
    EqBars,
    ExitArrow,
    InstagramIcon,
    MailIcon,
    NextIcon,
    PauseIcon,
    PlayIcon,
    PrevIcon,
    SpotifyIcon,
    VolumeIcon,
    Waveform,
    WhatsappIcon,
    YoutubeIcon
} from './ui';

const navLinks = [
    { href: '#beat', label: 'Beat' },
    { href: '#licenze', label: 'Licenze' },
    { href: '#servizi', label: 'Servizi' },
    { href: '#chi-sono', label: 'Chi sono' },
    { href: '#contatti', label: 'Contatti' }
];

export function Nav() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return (
        <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled || open ? 'bg-ink/90 backdrop-blur border-b border-cream/10' : ''}`}>
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="#top" className="flex items-center gap-3" aria-label={`${producer.name} – home`}>
                    <img src="/images/jsf/monogram.png" alt="" className="h-8 w-auto" />
                    <span className="hidden font-display text-sm font-bold uppercase tracking-[0.2em] text-cream sm:block">{producer.name}</span>
                </a>
                <div className="hidden items-center gap-8 md:flex">
                    {navLinks.map((l) => (
                        <a key={l.href} href={l.href} className="nav-link">
                            {l.label}
                        </a>
                    ))}
                    <a href="#contatti" className="btn-neon !py-2 !px-4 text-xs">
                        Beat su misura
                    </a>
                </div>
                <button className="p-2 text-cream md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
                    {open ? <CloseIcon className="h-6 w-6" /> : <span className="block h-0.5 w-6 bg-cream shadow-[0_7px_0_#fbf5e0,0_-7px_0_#fbf5e0]" />}
                </button>
            </nav>
            {open && (
                <div className="flex flex-col gap-1 border-t border-cream/10 px-4 pb-6 pt-2 md:hidden">
                    {navLinks.map((l) => (
                        <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 font-display text-2xl font-bold uppercase text-cream">
                            {l.label}
                        </a>
                    ))}
                </div>
            )}
        </header>
    );
}

export function Hero() {
    const { toggle, current, playing } = usePlayer();
    const featured = beats.find((b) => b.featured) ?? beats[0];
    const isOn = current?.slug === featured.slug && playing;
    return (
        <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
            <div className="hero-grid" aria-hidden="true" />
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-bars" aria-hidden="true">
                {Array.from({ length: 48 }, (_, i) => (
                    <i key={i} style={{ animationDelay: `${(i * 137) % 1000}ms`, height: `${20 + ((i * 53) % 70)}%` }} />
                ))}
            </div>
            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr]">
                <div className="order-2 md:order-1">
                    <p className="eyebrow mb-6">
                        <ExitArrow className="h-4 w-4 text-neon" /> Producer · {producer.city}
                    </p>
                    <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] text-cream sm:text-6xl lg:text-7xl">
                        Premi play.
                        <br />
                        <span className="text-neon text-glow">Sei fuori.</span>
                    </h1>
                    <p className="mt-6 max-w-md text-lg text-cream/70">
                        Beat trap & drill pronti da registrare, licenze chiare e beat su misura per il tuo prossimo pezzo.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-4">
                        <button onClick={() => toggle(featured)} className="btn-neon">
                            {isOn ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                            {isOn ? 'In pausa' : `Ascolta “${featured.title}”`}
                        </button>
                        <a href="#beat" className="btn-ghost">
                            Tutti i beat
                        </a>
                    </div>
                    <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-cream/10 pt-6">
                        <div>
                            <dt className="stat-label">Beat</dt>
                            <dd className="stat-value">{beats.length}</dd>
                        </div>
                        <div>
                            <dt className="stat-label">BPM</dt>
                            <dd className="stat-value">
                                {Math.min(...beats.map((b) => b.bpm))}–{Math.max(...beats.map((b) => b.bpm))}
                            </dd>
                        </div>
                        <div>
                            <dt className="stat-label">Licenze da</dt>
                            <dd className="stat-value">{formatPrice(Math.min(...licenses.filter((l) => l.price).map((l) => l.price as number)))}</dd>
                        </div>
                    </dl>
                </div>
                <div className="order-1 flex justify-center md:order-2">
                    <img src="/images/jsf/logo.png" alt={`Logo ${producer.name}`} className="logo-float w-56 sm:w-72 md:w-full md:max-w-sm" />
                </div>
            </div>
            <a href="#beat" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-cream/40 hover:text-neon md:block">
                Scroll ↓
            </a>
        </section>
    );
}

function SectionTitle({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
    return (
        <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-4">
                <span className="h-px w-8 bg-neon" /> {kicker}
            </p>
            <h2 className="font-display text-4xl font-bold uppercase leading-none text-cream sm:text-5xl">{title}</h2>
            {children && <p className="mt-4 text-cream/60">{children}</p>}
        </div>
    );
}

const allTags = ['Tutti', ...Array.from(new Set(beats.flatMap((b) => b.tags)))];

export function BeatStore({ onBuy }: { onBuy: (b: Beat) => void }) {
    const { current, playing, toggle, time, duration, seek } = usePlayer();
    const [tag, setTag] = useState('Tutti');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'default' | 'bpm-asc' | 'bpm-desc'>('default');

    const list = useMemo(() => {
        const q = query.trim().toLowerCase();
        const out = beats.filter(
            (b) =>
                (tag === 'Tutti' || b.tags.includes(tag)) &&
                (!q || [b.title, b.key, b.mood, String(b.bpm), ...b.tags].join(' ').toLowerCase().includes(q))
        );
        if (sort === 'bpm-asc') out.sort((a, b) => a.bpm - b.bpm);
        if (sort === 'bpm-desc') out.sort((a, b) => b.bpm - a.bpm);
        return out;
    }, [tag, query, sort]);

    return (
        <section id="beat" className="section">
            <SectionTitle kicker="Beat store" title="Ultimi beat">
                Ascolta, scegli la licenza e scrivimi: ti mando i file appena confermato il pagamento.
            </SectionTitle>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {allTags.map((t) => (
                        <button key={t} onClick={() => setTag(t)} className={`chip ${tag === t ? 'chip--on' : ''}`}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cerca titolo, BPM, key…"
                        className="input w-full lg:w-64"
                        aria-label="Cerca beat"
                    />
                    <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input" aria-label="Ordina">
                        <option value="default">Più recenti</option>
                        <option value="bpm-asc">BPM ↑</option>
                        <option value="bpm-desc">BPM ↓</option>
                    </select>
                </div>
            </div>

            <ul className="flex flex-col gap-3">
                {list.map((b, i) => {
                    const isCurrent = current?.slug === b.slug;
                    const isOn = isCurrent && playing;
                    const progress = isCurrent ? time / (duration || b.duration) : 0;
                    return (
                        <li key={b.slug} className={`beat-row ${isCurrent ? 'beat-row--on' : ''}`}>
                            <span className="hidden w-6 text-right font-display text-sm text-cream/30 sm:block">{String(i + 1).padStart(2, '0')}</span>
                            <button
                                onClick={() => toggle(b)}
                                className="play-btn"
                                aria-label={isOn ? `Pausa ${b.title}` : `Riproduci ${b.title}`}
                            >
                                {isOn ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
                            </button>
                            <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate font-display text-lg font-bold uppercase text-cream">{b.title}</h3>
                                    {isCurrent && <EqBars playing={playing} />}
                                </div>
                                <p className="text-xs uppercase tracking-wider text-cream/50">
                                    {b.bpm} BPM · {b.key} · {formatTime(b.duration)}
                                </p>
                            </div>
                            <div className="hidden flex-1 md:block">
                                <Waveform peaks={b.peaks} progress={progress} onSeek={isCurrent ? seek : () => toggle(b)} className="h-10" active={isCurrent} />
                            </div>
                            <div className="hidden w-48 justify-end gap-1.5 lg:flex">
                                {b.tags.map((t) => (
                                    <span key={t} className="tag">
                                        #{t.toLowerCase()}
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => onBuy(b)} className="btn-buy" aria-label={`Acquista ${b.title}`}>
                                <CartIcon />
                                <span>{formatPrice(b.priceFrom)}</span>
                            </button>
                        </li>
                    );
                })}
                {list.length === 0 && <li className="py-12 text-center text-cream/50">Nessun beat trovato. Prova un altro filtro.</li>}
            </ul>
        </section>
    );
}

export function Licenses() {
    return (
        <section id="licenze" className="section">
            <SectionTitle kicker="Licenze" title="Scegli come usarlo">
                Prezzi per singolo beat. Nessun limite di stream: scegli solo la qualità dei file. Su ogni licenza resta il tag del producer e il credit “prod. JSF” è obbligatorio.
            </SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {licenses.map((l) => (
                    <div key={l.id} className={`license ${l.highlight ? 'license--hot' : ''}`}>
                        {l.highlight && <span className="absolute -top-3 left-6 bg-neon px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink">Più scelta</span>}
                        <h3 className="font-display text-xl font-bold uppercase text-cream">{l.name}</h3>
                        <p className="mt-1 text-sm text-cream/50">{l.files}</p>
                        <p className={`my-6 font-display text-4xl font-bold ${l.price === null ? 'text-2xl' : ''} text-neon`}>{formatPrice(l.price)}</p>
                        <ul className="mb-8 flex flex-col gap-2 text-sm text-cream/80">
                            {l.perks.map((p) => (
                                <li key={p} className="flex gap-2">
                                    <span className="text-neon">▸</span> {p}
                                </li>
                            ))}
                        </ul>
                        <a href="#beat" className={`mt-auto ${l.highlight ? 'btn-neon' : 'btn-ghost'} justify-center`}>
                            Scegli un beat
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function Services() {
    return (
        <section id="servizi" className="section">
            <SectionTitle kicker="Servizi" title="Oltre i beat" />
            <div className="grid gap-px overflow-hidden border border-cream/10 bg-cream/10 md:grid-cols-3">
                {services.map((s, i) => (
                    <div key={s.title} className="group bg-ink p-8 transition-colors hover:bg-[#0d1408]">
                        <span className="font-display text-sm text-neon">0{i + 1}</span>
                        <h3 className="mt-4 font-display text-2xl font-bold uppercase text-cream">{s.title}</h3>
                        <p className="mt-3 text-cream/60">{s.text}</p>
                        <a href="#contatti" className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cream/70 group-hover:text-neon">
                            Richiedi <ExitArrow className="h-4 w-4" />
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function About() {
    return (
        <section id="chi-sono" className="section">
            <div className="grid items-center gap-12 md:grid-cols-2">
                <div className="relative mx-auto aspect-square w-full max-w-md">
                    <div className="absolute inset-0 border border-neon/40" />
                    <div className="absolute inset-3 flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(142,249,38,0.18),transparent_65%)]">
                        <img src="/images/jsf/monogram.png" alt="" className="w-2/3" />
                    </div>
                    <span className="absolute -bottom-3 -right-3 bg-neon px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-ink">{producer.tag}</span>
                </div>
                <div>
                    <SectionTitle kicker="Chi sono" title={producer.name} />
                    {/* TODO: sostituisci con la tua bio reale (città, anni di produzione, artisti, placement) */}
                    <div className="-mt-6 flex flex-col gap-4 text-lg text-cream/70">
                        <p>
                            Sono Jacopo, in arte <strong className="text-cream">{producer.name}</strong>. Produco beat trap e drill con un obiettivo semplice: farti
                            uscire di testa al primo ascolto.
                        </p>
                        <p>
                            808 che spingono, melodie scure e bounce che resta in testa. Lavoro con artisti emergenti e non: dal beat in licenza al pezzo
                            costruito da zero insieme.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href="#contatti" className="btn-neon">
                            Lavoriamo insieme
                        </a>
                        <Socials />
                    </div>
                </div>
            </div>
        </section>
    );
}

function Socials() {
    const { instagram, youtube, spotify } = producer.contacts;
    const items = [
        instagram && { href: `https://instagram.com/${instagram}`, label: 'Instagram', icon: <InstagramIcon /> },
        youtube && { href: youtube, label: 'YouTube', icon: <YoutubeIcon /> },
        spotify && { href: spotify, label: 'Spotify', icon: <SpotifyIcon /> }
    ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];
    return (
        <div className="flex gap-2">
            {items.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="social">
                    {s.icon}
                </a>
            ))}
        </div>
    );
}

const requestTypes = ['Licenza beat', 'Beat su misura', 'Mix & Master', 'Collab', 'Altro'];

export function Contact() {
    const [form, setForm] = useState({ name: '', artist: '', type: requestTypes[0], message: '' });
    const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
    const message = `Ciao Jacopo! Sono ${form.name || '…'}${form.artist ? ` (${form.artist})` : ''}.\nRichiesta: ${form.type}\n\n${form.message}`;
    const links = contactLinks(message, `${form.type} – ${form.name || 'nuovo contatto'}`);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        window.open(links.whatsapp, '_blank', 'noopener');
    };
    return (
        <section id="contatti" className="section">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
                <div>
                    <SectionTitle kicker="Contatti" title="Facciamo uscire il prossimo pezzo">
                        Scrivimi per licenze, esclusive, beat su misura o collab. Rispondo personalmente.
                    </SectionTitle>
                    <div className="flex flex-col gap-3">
                        <a href={`mailto:${producer.contacts.email}`} className="contact-line">
                            <MailIcon /> {producer.contacts.email}
                        </a>
                        <a href={`https://instagram.com/${producer.contacts.instagram}`} target="_blank" rel="noreferrer" className="contact-line">
                            <InstagramIcon /> @{producer.contacts.instagram}
                        </a>
                        <a href={`https://wa.me/${producer.contacts.whatsapp}`} target="_blank" rel="noreferrer" className="contact-line">
                            <WhatsappIcon /> WhatsApp
                        </a>
                    </div>
                </div>
                <form onSubmit={submit} className="flex flex-col gap-4 border border-cream/10 bg-[#070707] p-6 sm:p-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="field">
                            <span>Nome</span>
                            <input required value={form.name} onChange={set('name')} className="input" autoComplete="name" />
                        </label>
                        <label className="field">
                            <span>Nome d'arte</span>
                            <input value={form.artist} onChange={set('artist')} className="input" />
                        </label>
                    </div>
                    <label className="field">
                        <span>Cosa ti serve</span>
                        <select value={form.type} onChange={set('type')} className="input">
                            {requestTypes.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </label>
                    <label className="field">
                        <span>Messaggio</span>
                        <textarea
                            required
                            rows={5}
                            value={form.message}
                            onChange={set('message')}
                            className="input resize-none"
                            placeholder="Raccontami il progetto, le reference, le tempistiche…"
                        />
                    </label>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <button type="submit" className="btn-neon">
                            <WhatsappIcon className="h-4 w-4" /> Invia su WhatsApp
                        </button>
                        <a
                            href={links.email}
                            className="btn-ghost"
                            onClick={(e) => {
                                if (!form.name || !form.message) {
                                    e.preventDefault();
                                    (e.currentTarget.closest('form') as HTMLFormElement).reportValidity();
                                }
                            }}
                        >
                            <MailIcon className="h-4 w-4" /> Invia via email
                        </a>
                    </div>
                </form>
            </div>
        </section>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-cream/10 px-4 pb-32 pt-12 sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-4">
                    <img src="/images/jsf/monogram.png" alt="" className="h-10 w-auto" />
                    <p className="text-sm text-cream/50">
                        © {new Date().getFullYear()} {producer.name}. Tutti i diritti riservati.
                    </p>
                </div>
                <Socials />
            </div>
        </footer>
    );
}

export function PlayerBar({ onBuy }: { onBuy: (b: Beat) => void }) {
    const { current, playing, time, duration, toggle, seek, next, prev, volume, setVolume } = usePlayer();
    if (!current) return null;
    const d = duration || current.duration;
    return (
        <div className="player-bar">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
                <div className="flex items-center gap-1">
                    <button onClick={prev} className="p-2 text-cream/70 hover:text-cream" aria-label="Precedente">
                        <PrevIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggle()} className="play-btn !h-11 !w-11" aria-label={playing ? 'Pausa' : 'Play'}>
                        {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
                    </button>
                    <button onClick={next} className="p-2 text-cream/70 hover:text-cream" aria-label="Successivo">
                        <NextIcon className="h-4 w-4" />
                    </button>
                </div>
                <div className="min-w-0 sm:w-40">
                    <p className="truncate font-display text-sm font-bold uppercase text-cream">{current.title}</p>
                    <p className="text-[11px] uppercase tracking-wider text-cream/50">
                        {current.bpm} BPM · {current.key}
                    </p>
                </div>
                <span className="hidden w-10 text-right text-xs tabular-nums text-cream/50 sm:block">{formatTime(time)}</span>
                <div className="hidden flex-1 sm:block">
                    <Waveform peaks={current.peaks} progress={time / d} onSeek={seek} className="h-9" bars={120} />
                </div>
                <span className="hidden w-10 text-xs tabular-nums text-cream/50 sm:block">{formatTime(d)}</span>
                <label className="hidden items-center gap-2 text-cream/60 lg:flex">
                    <VolumeIcon className="h-4 w-4" />
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="range w-20"
                        aria-label="Volume"
                    />
                </label>
                <button onClick={() => onBuy(current)} className="btn-buy ml-auto sm:ml-0">
                    <CartIcon />
                    <span>{formatPrice(current.priceFrom)}</span>
                </button>
            </div>
            {/* barra di avanzamento su mobile */}
            <div
                className="absolute inset-x-0 top-0 h-1 cursor-pointer bg-cream/10 sm:hidden"
                onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    seek((e.clientX - r.left) / r.width);
                }}
            >
                <div className="h-full bg-neon" style={{ width: `${(time / d) * 100}%` }} />
            </div>
        </div>
    );
}

export function LicenseModal({ beat, onClose }: { beat: Beat | null; onClose: () => void }) {
    const [licenseId, setLicenseId] = useState('wav');
    useEffect(() => {
        if (!beat) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [beat, onClose]);
    if (!beat) return null;
    const license = licenses.find((l) => l.id === licenseId) ?? licenses[0];
    const message = `Ciao Jacopo! Vorrei la licenza ${license.name} (${formatPrice(license.price)}) per il beat "${beat.title}" (${beat.bpm} BPM, ${beat.key}).`;
    const links = contactLinks(message, `Licenza ${license.name} – ${beat.title}`);
    const copyAndOpenIg = async () => {
        try {
            await navigator.clipboard.writeText(message);
        } catch {
            /* clipboard non disponibile: il DM si apre comunque */
        }
        window.open(links.instagram, '_blank', 'noopener');
    };
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="license-title"
                className="modal-in relative max-h-[92svh] w-full max-w-2xl overflow-y-auto border border-cream/15 bg-ink p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute right-4 top-4 p-2 text-cream/60 hover:text-cream" aria-label="Chiudi">
                    <CloseIcon />
                </button>
                <p className="eyebrow mb-2">Acquista licenza</p>
                <h2 id="license-title" className="font-display text-3xl font-bold uppercase text-cream">
                    {beat.title}
                </h2>
                <p className="text-sm uppercase tracking-wider text-cream/50">
                    {beat.bpm} BPM · {beat.key} · {beat.tags.join(' / ')}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {licenses.map((l) => (
                        <button key={l.id} onClick={() => setLicenseId(l.id)} className={`license-opt ${l.id === licenseId ? 'license-opt--on' : ''}`}>
                            <span className="flex items-baseline justify-between gap-2">
                                <span className="font-display font-bold uppercase text-cream">{l.name}</span>
                                <span className="font-display font-bold text-neon">{formatPrice(l.price)}</span>
                            </span>
                            <span className="mt-1 block text-left text-xs text-cream/50">{l.files}</span>
                        </button>
                    ))}
                </div>
                <ul className="mt-5 grid gap-1.5 text-sm text-cream/70 sm:grid-cols-2">
                    {license.perks.map((p) => (
                        <li key={p}>
                            <span className="text-neon">▸</span> {p}
                        </li>
                    ))}
                </ul>
                <div className="mt-8 border-t border-cream/10 pt-6">
                    <p className="mb-4 text-sm text-cream/60">Scrivimi dove preferisci: il messaggio è già pronto.</p>
                    <div className="flex flex-wrap gap-3">
                        <a href={links.whatsapp} target="_blank" rel="noreferrer" className="btn-neon">
                            <WhatsappIcon className="h-4 w-4" /> WhatsApp
                        </a>
                        <button onClick={copyAndOpenIg} className="btn-ghost" title="Copia il messaggio e apre i DM">
                            <InstagramIcon className="h-4 w-4" /> DM Instagram
                        </button>
                        <a href={links.email} className="btn-ghost">
                            <MailIcon className="h-4 w-4" /> Email
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
