import { useEffect, useRef } from 'react';
import { usePlayer } from './player';

const BAR_COUNT = 48;

// Barre dell'hero: animazione "idle" in CSS, poi seguono lo spettro reale del beat in riproduzione.
// Scrive anche --bass sull'elemento padre per far pulsare logo e glow a tempo.
export function HeroVisualizer() {
    const { getSpectrum, playing } = usePlayer();
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        const host = wrap?.parentElement;
        if (!wrap || !host || !playing) return;
        const bars = Array.from(wrap.children) as HTMLElement[];
        let raf = 0;
        let live = false;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const data = getSpectrum();
            if (!data) return;
            if (!live) {
                wrap.classList.add('hero-bars--live');
                live = true;
            }
            // Le frequenze utili stanno nei primi ~2/3 dei bin: le specchiamo dal centro verso i lati
            // Scala quasi logaritmica + guadagno sugli acuti, che sono naturalmente più deboli
            const usable = Math.floor(data.length * 0.75);
            const half = BAR_COUNT / 2;
            for (let i = 0; i < half; i++) {
                const t = i / half;
                const v = Math.min(1, (data[Math.floor(Math.pow(t, 1.7) * usable)] / 255) * (0.8 + t * 1.2));
                const h = `${Math.max(6, Math.pow(v, 2) * 100)}%`;
                bars[half - 1 - i].style.height = h;
                bars[half + i].style.height = h;
            }
            const bass = (data[0] + data[1] + data[2]) / (3 * 255);
            host.style.setProperty('--bass', (bass * bass).toFixed(3));
        };
        tick();
        return () => {
            cancelAnimationFrame(raf);
            wrap.classList.remove('hero-bars--live');
            bars.forEach((b) => (b.style.height = ''));
            host.style.setProperty('--bass', '0');
        };
    }, [playing, getSpectrum]);

    return (
        <div ref={wrapRef} className="hero-bars" aria-hidden="true">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
                <i key={i} style={{ animationDelay: `${(i * 137) % 1000}ms`, ['--idle' as string]: `${20 + ((i * 53) % 70)}%` }} />
            ))}
        </div>
    );
}

// Luce che segue il mouse nell'hero
export function useSpotlight<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || !window.matchMedia('(pointer: fine)').matches) return;
        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', `${e.clientX - r.left}px`);
            el.style.setProperty('--my', `${e.clientY - r.top}px`);
        };
        el.addEventListener('pointermove', onMove);
        return () => el.removeEventListener('pointermove', onMove);
    }, []);
    return ref;
}

// Fa entrare gli elementi .reveal quando arrivano nello schermo
// (anche quelli aggiunti dopo, es. le righe dei beat quando cambi filtro).
export function useReveal() {
    useEffect(() => {
        if (!('IntersectionObserver' in window) || !('MutationObserver' in window)) return;
        document.documentElement.classList.add('reveal-on');
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-in');
                        io.unobserve(e.target);
                    }
                }),
            { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
        );
        const scan = () => document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)').forEach((el) => io.observe(el));
        scan();
        const mo = new MutationObserver(scan);
        mo.observe(document.body, { childList: true, subtree: true });
        return () => {
            io.disconnect();
            mo.disconnect();
            document.documentElement.classList.remove('reveal-on');
        };
    }, []);
}

// Striscia che scorre tra le sezioni
export function Marquee({ items }: { items: string[] }) {
    const row = (
        <span className="marquee__row">
            {items.map((t, i) => (
                <span key={i} className="marquee__item">
                    {t}
                    <span className="marquee__dot" />
                </span>
            ))}
        </span>
    );
    return (
        <div className="marquee" aria-hidden="true">
            <div className="marquee__track">
                {row}
                {row}
            </div>
        </div>
    );
}
