import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from './Reveal';

type Props = {
    eyebrow: string;
    title: ReactNode;
    id?: string;
    children?: ReactNode;
    align?: 'left' | 'center';
    tone?: 'dark' | 'light';
    className?: string;
};

export function SectionHeading({ eyebrow, title, id, children, align = 'left', tone = 'dark', className }: Props) {
    return (
        <Reveal className={cn(align === 'center' && 'mx-auto text-center', 'max-w-3xl', className)}>
            <p className={cn('eyebrow', tone === 'light' && 'text-sage-light')}>{eyebrow}</p>
            <h2 id={id} className={cn('h-section mt-5', tone === 'light' && 'text-cream')}>
                {title}
            </h2>
            {children && <div className={cn('lead mt-6', align === 'center' && 'mx-auto', 'max-w-prose', tone === 'light' && 'text-cream/80')}>{children}</div>}
        </Reveal>
    );
}
