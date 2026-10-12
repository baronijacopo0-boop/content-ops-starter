import type { CSSProperties, ElementType, ReactNode } from 'react';

type Props = {
    as?: ElementType;
    delay?: number;
    className?: string;
    children: ReactNode;
    id?: string;
};

/** Contenitore che compare con un leggero fade-up quando entra nel viewport. */
export function Reveal({ as: Tag = 'div', delay = 0, className, children, id }: Props) {
    return (
        <Tag data-reveal="" id={id} className={className} style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}>
            {children}
        </Tag>
    );
}
