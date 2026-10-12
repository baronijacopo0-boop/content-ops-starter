import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'light' | 'ghost';

const base =
    'group inline-flex min-h-[3rem] items-center justify-center gap-2.5 rounded-full px-6 text-[0.95rem] font-medium tracking-[0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-gentle active:scale-[0.98] active:duration-100';

const variants: Record<Variant, string> = {
    primary: 'bg-forest text-cream hover:bg-forest-deep shadow-[0_1px_0_rgba(0,0,0,0.04)]',
    secondary: 'border border-ink/20 text-ink hover:border-forest hover:bg-forest/[0.04]',
    light: 'bg-cream text-forest-deep hover:bg-white',
    ghost: 'border border-cream/35 text-cream hover:border-cream hover:bg-cream/[0.06]'
};

type Props = {
    href: string;
    variant?: Variant;
    arrow?: boolean;
    children: ReactNode;
    className?: string;
} & Omit<ComponentProps<'a'>, 'href'>;

export function ButtonLink({ href, variant = 'primary', arrow = false, children, className, ...rest }: Props) {
    const isExternal = /^(https?:|mailto:|tel:)/.test(href);
    const content = (
        <>
            <span>{children}</span>
            {arrow && <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 ease-gentle group-hover:translate-x-1" strokeWidth={1.6} />}
        </>
    );
    if (isExternal) {
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
