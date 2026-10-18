import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'light';

const base =
    'group inline-flex min-h-[3rem] items-center justify-center gap-2.5 rounded-full px-6 text-[0.95rem] font-medium tracking-[0.01em] transition-[background-color,color,border-color,transform] duration-300 ease-gentle active:scale-[0.98]';

const variants: Record<Variant, string> = {
    primary: 'bg-accent text-paper hover:bg-accent-deep',
    secondary: 'border border-ink/20 text-ink hover:border-accent hover:bg-accent/[0.05]',
    light: 'bg-paper text-accent-deep hover:bg-white'
};

type ButtonProps = {
    href: string;
    variant?: Variant;
    arrow?: boolean;
    children: ReactNode;
    className?: string;
} & Omit<ComponentProps<'a'>, 'href'>;

export function ButtonLink({ href, variant = 'primary', arrow = false, children, className, ...rest }: ButtonProps) {
    const content = (
        <>
            <span>{children}</span>
            {arrow && <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 ease-gentle group-hover:translate-x-1" strokeWidth={1.6} />}
        </>
    );
    if (/^(https?:|mailto:|tel:|#)/.test(href)) {
        return (
            <a href={href} className={cn(base, variants[variant], className)} {...rest}>
                {content}
            </a>
        );
    }
    return (
        <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
            {content}
        </Link>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    id,
    children,
    tone = 'dark'
}: {
    eyebrow: string;
    title: ReactNode;
    id: string;
    children?: ReactNode;
    tone?: 'dark' | 'light';
}) {
    return (
        <div className="max-w-3xl">
            <p className={cn('eyebrow', tone === 'light' && 'text-accent-pale')}>{eyebrow}</p>
            <h2 id={id} className={cn('h-section mt-5', tone === 'light' && 'text-paper')}>
                {title}
            </h2>
            {children && <div className={cn('lead mt-6 max-w-[36rem]', tone === 'light' && 'text-paper/80')}>{children}</div>}
        </div>
    );
}

/** Composizione grafica al posto della foto: mai foto stock spacciate per il professionista. */
export function Monogram({ text, className }: { text: string; className?: string }) {
    return (
        <div aria-hidden className={cn('relative overflow-hidden bg-sand', className)}>
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_15%,rgb(var(--paper))_0%,rgb(var(--sand))_45%,rgb(var(--warm)/0.55)_100%)]" />
            <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
                <g fill="none" stroke="rgb(var(--warm))" strokeWidth="0.8" opacity="0.7">
                    <path d="M110 500 V250 a90 90 0 0 1 180 0 V500" />
                    <path d="M80 500 V240 a120 120 0 0 1 240 0 V500" opacity="0.6" />
                    <circle cx="300" cy="120" r="56" opacity="0.7" />
                </g>
                <text
                    x="200"
                    y="330"
                    textAnchor="middle"
                    fontFamily="var(--font-serif), Georgia, serif"
                    fontStyle="italic"
                    fontSize="64"
                    fill="rgb(var(--accent))"
                    opacity="0.6"
                >
                    {text}
                </text>
            </svg>
        </div>
    );
}
