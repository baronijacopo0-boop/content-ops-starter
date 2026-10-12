import Image from 'next/image';
import { Camera } from 'lucide-react';
import { photoPlaceholdersEnabled, publicFileExists } from '@/lib/photos';
import { cn } from '@/lib/cn';

type Props = {
    src: string;
    alt: string;
    sizes: string;
    /** Testo della cornice demo (es. "Ritratto della Dott.ssa") */
    hint?: string;
    /** Formato consigliato mostrato nella cornice demo (es. "verticale 4:5") */
    format?: string;
    priority?: boolean;
    className?: string;
    /** Arrotondamento della cornice demo, coerente con la forma della foto */
    frameClassName?: string;
    variant?: 'hero' | 'about';
};

/**
 * Mostra la fotografia se il file esiste in /public, altrimenti:
 * - con SHOW_PHOTO_PLACEHOLDERS=true una cornice demo che indica quale foto inserire;
 * - altrimenti una composizione astratta (mai una foto stock che finga di essere la Dott.ssa).
 */
export function Portrait({ src, alt, sizes, hint, format = 'verticale 4:5', priority, className, frameClassName, variant = 'hero' }: Props) {
    const hasPhoto = publicFileExists(src);

    return (
        <div className={cn('relative overflow-hidden bg-sand-deep', className)}>
            {hasPhoto ? (
                <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-[50%_25%]" />
            ) : photoPlaceholdersEnabled() ? (
                <PhotoSlot variant={variant} hint={hint ?? 'Fotografia'} file={src.split('/').pop() ?? src} format={format} frameClassName={frameClassName} />
            ) : (
                <PortraitPlaceholder variant={variant} />
            )}
        </div>
    );
}

function background(variant: 'hero' | 'about') {
    return variant === 'hero'
        ? 'radial-gradient(120% 90% at 30% 15%, #F3EDE4 0%, #E4DCD0 45%, #D4C3B0 100%)'
        : 'radial-gradient(120% 90% at 70% 20%, #E9EDE6 0%, #D5DDD2 50%, #B9C4B7 100%)';
}

/** Cornice demo: indica dove andrà la foto e con quale nome caricarla. */
function PhotoSlot({
    variant,
    hint,
    file,
    format,
    frameClassName
}: {
    variant: 'hero' | 'about';
    hint: string;
    file: string;
    format: string;
    frameClassName?: string;
}) {
    const isHero = variant === 'hero';
    return (
        <div data-photo-slot="" className="absolute inset-0" role="img" aria-label={`Spazio riservato: ${hint}`}>
            <div className="absolute inset-0" style={{ background: background(variant) }} />
            <div
                className={cn(
                    'absolute inset-3 flex flex-col items-center justify-center rounded-[1rem] border border-dashed px-6 text-center sm:inset-4',
                    frameClassName,
                    isHero ? 'border-clay-dark/40' : 'border-forest/35'
                )}
            >
                <span className={cn('flex h-14 w-14 items-center justify-center rounded-full bg-cream/70', isHero ? 'text-clay-dark' : 'text-forest')}>
                    <Camera aria-hidden className="h-6 w-6" strokeWidth={1.3} />
                </span>
                <p className="mt-5 font-serif text-2xl leading-tight text-ink sm:text-[1.7rem]">{hint}</p>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-soft">
                    Formato {format}
                    <br />
                    <span className="font-mono text-[0.75rem]">/public/images/{file}</span>
                </p>
            </div>
        </div>
    );
}

function PortraitPlaceholder({ variant }: { variant: 'hero' | 'about' }) {
    const isHero = variant === 'hero';
    return (
        // Placeholder grafico: sostituire caricando la foto in /public/images (vedi data/profile.ts)
        <div data-photo-placeholder="" aria-hidden className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: background(variant) }} />
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
