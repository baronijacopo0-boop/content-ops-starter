import Image from 'next/image';
import { publicFileExists } from '@/lib/photos';
import { cn } from '@/lib/cn';

type Props = {
    src: string;
    alt: string;
    sizes: string;
    priority?: boolean;
    className?: string;
    variant?: 'hero' | 'about';
};

/**
 * Mostra la fotografia se il file esiste in /public, altrimenti una
 * composizione astratta (mai una foto stock che finga di essere la Dott.ssa).
 */
export function Portrait({ src, alt, sizes, priority, className, variant = 'hero' }: Props) {
    const hasPhoto = publicFileExists(src);

    return (
        <div className={cn('relative overflow-hidden bg-sand-deep', className)}>
            {hasPhoto ? (
                <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-[50%_25%]" />
            ) : (
                <PortraitPlaceholder variant={variant} />
            )}
        </div>
    );
}

function PortraitPlaceholder({ variant }: { variant: 'hero' | 'about' }) {
    const isHero = variant === 'hero';
    return (
        // Placeholder grafico: sostituire caricando la foto in /public/images (vedi data/profile.ts)
        <div data-photo-placeholder="" aria-hidden className="absolute inset-0">
            <div
                className="absolute inset-0"
                style={{
                    background: isHero
                        ? 'radial-gradient(120% 90% at 30% 15%, #F3EDE4 0%, #E4DCD0 45%, #D4C3B0 100%)'
                        : 'radial-gradient(120% 90% at 70% 20%, #E9EDE6 0%, #D5DDD2 50%, #B9C4B7 100%)'
                }}
            />
            <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
                <g fill="none" stroke={isHero ? '#B89D83' : '#788879'} strokeWidth="0.8" opacity="0.55">
                    <path d="M110 500 V250 a90 90 0 0 1 180 0 V500" />
                    <path d="M80 500 V240 a120 120 0 0 1 240 0 V500" opacity="0.6" />
                    <circle cx={isHero ? 300 : 110} cy="120" r="56" opacity="0.7" />
                </g>
                <text
                    x="200"
                    y="330"
                    textAnchor="middle"
                    fontFamily="var(--font-serif), Georgia, serif"
                    fontStyle="italic"
                    fontSize="64"
                    fill={isHero ? '#7D6049' : '#44564B'}
                    opacity="0.55"
                >
                    G·S
                </text>
            </svg>
        </div>
    );
}
