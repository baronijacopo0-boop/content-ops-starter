import { useId, type MouseEvent } from 'react';

type IconProps = { className?: string };

export const PlayIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M7 4.5v15l13-7.5z" />
    </svg>
);

export const PauseIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
);

export const NextIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M5 5v14l10-7zM16 5h3v14h-3z" />
    </svg>
);

export const PrevIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M19 5v14L9 12zM5 5h3v14H5z" />
    </svg>
);

export const VolumeIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
    </svg>
);

export const CartIcon = ({ className = 'w-4 h-4' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden="true">
        <path d="M3 4h2.5l2.2 11h10.6L20.5 7H7" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" />
        <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
    </svg>
);

export const CloseIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
);

export const ExitArrow = ({ className = 'w-4 h-4' }: IconProps) => (
    // Richiama la porta con freccia del logo
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3 3l7 3v15l-7-3zM12 10h5V6l7 6-7 6v-4h-5z" />
    </svg>
);

export const InstagramIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
);

export const WhatsappIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
    </svg>
);

export const MailIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
    </svg>
);

export const YoutubeIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
    </svg>
);

export const SpotifyIcon = ({ className = 'w-5 h-5' }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.3-1.8-8.8-1a.6.6 0 1 1-.3-1.2c3.8-.9 7.1-.5 9.8 1.1.3.2.4.6.2.9zm1.2-2.7a.8.8 0 0 1-1 .3c-2.7-1.7-6.9-2.2-10.1-1.2a.8.8 0 1 1-.5-1.5c3.7-1.1 8.3-.6 11.4 1.4.4.2.5.7.2 1zm.1-2.8C14.7 9 9.4 8.8 6.3 9.7a.9.9 0 1 1-.6-1.8c3.6-1.1 9.4-.9 13.1 1.3a.9.9 0 1 1-.9 1.7z" />
    </svg>
);

// Waveform a barre: le barre già ascoltate diventano verdi, click per spostarsi.
export function Waveform({
    peaks,
    progress,
    onSeek,
    className = 'h-12',
    bars = 80,
    active = true
}: {
    peaks: number[];
    progress: number;
    onSeek?: (fraction: number) => void;
    className?: string;
    bars?: number;
    active?: boolean;
}) {
    const clipId = useId().replace(/:/g, '');
    const step = peaks.length / bars;
    const values = Array.from({ length: bars }, (_, i) => {
        const slice = peaks.slice(Math.floor(i * step), Math.floor((i + 1) * step) || Math.floor(i * step) + 1);
        return Math.max(0.08, Math.max(...slice));
    });
    const w = 100 / bars;
    const handle = (e: MouseEvent<SVGSVGElement>) => {
        if (!onSeek) return;
        const r = e.currentTarget.getBoundingClientRect();
        onSeek((e.clientX - r.left) / r.width);
    };
    const shapes = values.map((v, i) => <rect key={i} x={i * w + w * 0.18} width={w * 0.64} y={50 - v * 48} height={v * 96} rx={w * 0.3} />);
    return (
        <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={`${className} w-full ${onSeek ? 'cursor-pointer' : ''}`}
            onClick={handle}
            role={onSeek ? 'slider' : 'img'}
            aria-label="Waveform"
            aria-valuenow={Math.round(progress * 100)}
        >
            <defs>
                <clipPath id={clipId}>
                    <rect x="0" y="0" width={progress * 100} height="100" />
                </clipPath>
            </defs>
            <g className={active ? 'fill-cream/25' : 'fill-cream/15'}>{shapes}</g>
            <g className="fill-neon" clipPath={`url(#${clipId})`}>
                {shapes}
            </g>
        </svg>
    );
}

// Piccolo equalizzatore animato per il beat in riproduzione
export const EqBars = ({ playing }: { playing: boolean }) => (
    <span className={`eq ${playing ? 'eq--on' : ''}`} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
    </span>
);
