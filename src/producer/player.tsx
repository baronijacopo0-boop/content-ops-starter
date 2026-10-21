import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { beats, type Beat } from './data';

type PlayerState = {
    current: Beat | null;
    playing: boolean;
    time: number;
    duration: number;
    volume: number;
    play: (beat: Beat) => void;
    toggle: (beat?: Beat) => void;
    seek: (fraction: number) => void;
    next: () => void;
    prev: () => void;
    setVolume: (v: number) => void;
    // Spettro audio in tempo reale (0-255 per banda), null finché non parte la musica
    getSpectrum: () => Uint8Array | null;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [current, setCurrent] = useState<Beat | null>(null);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.9);
    const currentRef = useRef<Beat | null>(null);
    currentRef.current = current;
    const analyserRef = useRef<AnalyserNode | null>(null);
    const spectrumRef = useRef<Uint8Array | null>(null);

    // Il grafo Web Audio va creato dopo un gesto dell'utente (policy autoplay dei browser)
    const ensureAnalyser = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || analyserRef.current) return;
        try {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx: AudioContext = new Ctx();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.8;
            ctx.createMediaElementSource(audio).connect(analyser);
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
            spectrumRef.current = new Uint8Array(analyser.frequencyBinCount);
            audio.addEventListener('play', () => ctx.state === 'suspended' && ctx.resume());
        } catch {
            /* Web Audio non disponibile: le animazioni restano quelle di default */
        }
    }, []);

    const getSpectrum = useCallback(() => {
        const analyser = analyserRef.current;
        const data = spectrumRef.current;
        if (!analyser || !data || audioRef.current?.paused) return null;
        analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
        return data;
    }, []);

    const play = useCallback((beat: Beat) => {
        const audio = audioRef.current;
        if (!audio) return;
        ensureAnalyser();
        if (currentRef.current?.slug !== beat.slug) {
            audio.src = beat.src;
            setCurrent(beat);
            setTime(0);
            setDuration(beat.duration);
        }
        audio.play().catch(() => setPlaying(false));
    }, [ensureAnalyser]);

    const step = useCallback(
        (dir: 1 | -1) => {
            const idx = beats.findIndex((b) => b.slug === currentRef.current?.slug);
            play(beats[(idx + dir + beats.length) % beats.length]);
        },
        [play]
    );

    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.volume = 0.9;
        audioRef.current = audio;
        const onTime = () => setTime(audio.currentTime);
        const onMeta = () => setDuration(audio.duration);
        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onEnded = () => step(1);
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
        };
    }, [step]);

    const toggle = useCallback(
        (beat?: Beat) => {
            const audio = audioRef.current;
            if (!audio) return;
            const target = beat ?? currentRef.current ?? beats[0];
            if (currentRef.current?.slug === target.slug && !audio.paused) audio.pause();
            else play(target);
        },
        [play]
    );

    const seek = useCallback((fraction: number) => {
        const audio = audioRef.current;
        if (!audio || !currentRef.current) return;
        const d = audio.duration || currentRef.current.duration;
        audio.currentTime = Math.max(0, Math.min(1, fraction)) * d;
        setTime(audio.currentTime);
    }, []);

    const setVolume = useCallback((v: number) => {
        if (audioRef.current) audioRef.current.volume = v;
        setVolumeState(v);
    }, []);

    // Barra spaziatrice = play/pausa (fuori dai campi di testo)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            if (e.code !== 'Space' || !currentRef.current || /INPUT|TEXTAREA|SELECT|BUTTON/.test(el.tagName)) return;
            e.preventDefault();
            toggle();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [toggle]);

    return (
        <PlayerContext.Provider
            value={{ current, playing, time, duration, volume, play, toggle, seek, next: () => step(1), prev: () => step(-1), setVolume, getSpectrum }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
    return ctx;
}
