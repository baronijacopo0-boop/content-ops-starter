'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { navigation, profile } from '@/data/profile';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/ui/Button';

export function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const pathname = usePathname();
    const [active, setActive] = useState<string | null>(null);

    // Chiude il menu mobile a ogni cambio di pagina (anche con indietro/avanti del browser)
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Evidenzia la voce di menu della sezione visibile (solo in homepage)
    useEffect(() => {
        if (pathname !== '/') {
            setActive(null);
            return;
        }
        const ids = navigation.map((n) => n.href.split('#')[1]).filter(Boolean);
        const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px' }
        );
        sections.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const close = useCallback((restoreFocus = true) => {
        setOpen(false);
        if (restoreFocus) toggleRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!open) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        const panel = panelRef.current;
        panel?.querySelector<HTMLElement>('a')?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
                return;
            }
            if (e.key !== 'Tab' || !panel) return;
            const focusables = [toggleRef.current, ...Array.from(panel.querySelectorAll<HTMLElement>('a, button'))].filter(Boolean) as HTMLElement[];
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        const onResize = () => window.innerWidth >= 1280 && close(false);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', onResize);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onResize);
        };
    }, [open, close]);

    return (
        <>
            <header
                className={cn(
                    'sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300',
                    scrolled || open ? 'bg-cream/90 shadow-[0_1px_0_rgba(41,42,39,0.08)] backdrop-blur-md' : 'bg-cream/0'
                )}
            >
                <nav aria-label="Navigazione principale" className="container flex h-[var(--nav-height)] items-center justify-between gap-6">
                    <Link href="/" className="group relative z-10 flex flex-col py-1.5 leading-none" onClick={() => open && close(false)}>
                        <span className="font-serif text-[1.55rem] tracking-[-0.01em] text-ink">{profile.name}</span>
                        <span className="mt-1 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-forest">{profile.shortTitle}</span>
                    </Link>

                    <ul className="hidden items-center gap-7 xl:flex">
                        {navigation.slice(1).map((item) => {
                            const isActive = active === item.href.split('#')[1];
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={isActive ? 'location' : undefined}
                                        className={cn(
                                            'link-underline tap-target text-[0.9rem] transition-colors hover:text-ink',
                                            isActive ? 'text-forest [background-size:100%_1px]' : 'text-ink/80'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex items-center gap-3">
                        <ButtonLink href="/#contatti" className="hidden min-h-[2.75rem] px-5 text-[0.88rem] sm:inline-flex">
                            Richiedi un colloquio
                        </ButtonLink>
                        <button
                            ref={toggleRef}
                            type="button"
                            className="relative z-10 -mr-2 flex h-11 w-11 items-center justify-center rounded-full xl:hidden"
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                            aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
                            onClick={() => setOpen((v) => !v)}
                        >
                            <span aria-hidden className="relative block h-3 w-6">
                                <span
                                    className={cn(
                                        'absolute left-0 top-0 h-px w-6 bg-ink transition-transform duration-300 ease-gentle',
                                        open && 'translate-y-[6px] rotate-45'
                                    )}
                                />
                                <span
                                    className={cn(
                                        'absolute bottom-0 left-0 h-px w-6 bg-ink transition-transform duration-300 ease-gentle',
                                        open && '-translate-y-[5px] -rotate-45'
                                    )}
                                />
                            </span>
                        </button>
                    </div>
                </nav>
                {/* Barra di avanzamento della lettura (solo browser con scroll-timeline) */}
                <span aria-hidden className="scroll-progress absolute inset-x-0 bottom-0 hidden h-px bg-forest/50" />
            </header>

            {/* Fuori dall'header: il backdrop-filter dell'header altrimenti farebbe da contenitore per l'elemento fixed */}
            <div
                id="mobile-menu"
                ref={panelRef}
                hidden={!open}
                className="fixed inset-x-0 bottom-0 top-[var(--nav-height)] z-40 overflow-y-auto bg-cream xl:hidden"
            >
                <div className="container flex min-h-full flex-col justify-between pb-10 pt-6">
                    <ul className="flex flex-col">
                        {navigation.map((item, i) => (
                            <li key={item.href} className="animate-fade-up border-b border-ink/10" style={{ animationDelay: `${60 + i * 35}ms` }}>
                                <Link
                                    href={item.href}
                                    onClick={() => close(false)}
                                    className="flex items-baseline justify-between py-4 font-serif text-[1.9rem] leading-tight text-ink"
                                >
                                    {item.label}
                                    <span aria-hidden className="font-sans text-xs tracking-[0.18em] text-ink-soft">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-10 animate-fade-up" style={{ animationDelay: '320ms' }}>
                        <ButtonLink href="/#contatti" arrow className="w-full" onClick={() => close(false)}>
                            Richiedi un colloquio
                        </ButtonLink>
                        <p className="mt-5 text-center text-sm text-ink-soft">Studio a Teramo · Consulenze online</p>
                    </div>
                </div>
            </div>
        </>
    );
}
