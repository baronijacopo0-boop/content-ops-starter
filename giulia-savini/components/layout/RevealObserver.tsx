'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Attiva le animazioni fade-up degli elementi [data-reveal] quando entrano nel viewport. */
export function RevealObserver() {
    const pathname = usePathname();

    useEffect(() => {
        (window as unknown as { __revealReady?: boolean }).__revealReady = true;
        const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)'));

        if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            elements.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [pathname]);

    return null;
}
