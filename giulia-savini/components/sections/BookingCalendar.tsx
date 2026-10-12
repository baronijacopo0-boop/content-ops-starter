'use client';

import Link from 'next/link';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, MapPin, RotateCcw, Video } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { validateBooking, type BookingErrors, type BookingPayload } from '@/lib/booking/validate';

type Availability = Record<string, string[]>;
type Data = { mode: 'live' | 'demo'; first: string; last: string; slotMinutes: number; availability: Availability };
type Form = Pick<BookingPayload, 'mode' | 'name' | 'email' | 'phone' | 'note' | 'privacy' | 'booking_hp'>;

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const emptyForm: Form = { mode: 'studio', name: '', email: '', phone: '', note: '', privacy: false, booking_hp: '' };

const fmt = (date: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('it-IT', { ...opts, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const longDate = (date: string) => capitalize(fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }));
const monthKey = (date: string) => date.slice(0, 7);
function shiftMonth(key: string, delta: number) {
    const [y, m] = key.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return d.toISOString().slice(0, 7);
}
function monthCells(key: string) {
    const [y, m] = key.split('-').map(Number);
    const firstDow = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // lunedì = 0
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells: (string | null)[] = Array.from({ length: firstDow }, () => null);
    for (let d = 1; d <= days; d++) cells.push(`${key}-${String(d).padStart(2, '0')}`);
    return cells;
}

export function BookingCalendar({ alternative, alternativeCta, note }: { alternative: string; alternativeCta: string; note: string }) {
    const [data, setData] = useState<Data | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [month, setMonth] = useState<string | null>(null);
    const [date, setDate] = useState<string | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [form, setForm] = useState<Form>(emptyForm);
    const [errors, setErrors] = useState<BookingErrors>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [result, setResult] = useState<{ demo: boolean; emailSent: boolean } | null>(null);
    const startedAt = useRef(0);
    const panelRef = useRef<HTMLDivElement>(null);
    const uid = useId();

    const load = useCallback(async (keepSelection = false) => {
        setLoadError(false);
        try {
            const res = await fetch('/api/booking/availability', { cache: 'no-store' });
            const json = (await res.json()) as Data & { ok: boolean };
            if (!res.ok || !json.ok) throw new Error();
            setData(json);
            const firstAvailable = Object.keys(json.availability).sort()[0] ?? null;
            if (!keepSelection) {
                setDate(firstAvailable);
                setMonth(monthKey(firstAvailable ?? json.first));
            }
        } catch {
            setLoadError(true);
        }
    }, []);

    useEffect(() => {
        startedAt.current = performance.now();
        load();
    }, [load]);

    const focusPanel = () => requestAnimationFrame(() => panelRef.current?.focus());
    const slots = (date && data?.availability[date]) || [];
    const cells = useMemo(() => (month ? monthCells(month) : []), [month]);
    const canPrev = !!(data && month && month > monthKey(data.first));
    const canNext = !!(data && month && month < monthKey(data.last));

    function pickDate(d: string) {
        setDate(d);
        setTime(null);
        setStatus('idle');
        setMessage('');
    }

    function pickTime(t: string) {
        setTime(t);
        setStatus('idle');
        setMessage('');
        focusPanel();
    }

    const update = <K extends keyof Form>(key: K, value: Form[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        if (errors[key as keyof BookingErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status === 'loading' || !date || !time) return;
        const payload: BookingPayload = { ...form, date, time, elapsed: Math.round(performance.now() - startedAt.current) };
        const found = validateBooking(payload);
        setErrors(found);
        const firstInvalid = Object.keys(found)[0];
        if (firstInvalid) {
            (e.currentTarget.querySelector(`[name="${firstInvalid}"]`) as HTMLElement | null)?.focus();
            return;
        }
        setStatus('loading');
        setMessage('');
        try {
            const res = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = (await res.json().catch(() => ({}))) as {
                ok?: boolean;
                error?: string;
                code?: string;
                errors?: BookingErrors;
                demo?: boolean;
                emailSent?: boolean;
            };
            if (json.errors) setErrors(json.errors);
            if (json.code === 'slot_taken') {
                setTime(null);
                await load(true);
            }
            if (!res.ok || !json.ok) throw new Error(json.error || 'Prenotazione non riuscita.');
            setResult({ demo: !!json.demo, emailSent: !!json.emailSent });
            setStatus('success');
            focusPanel();
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Prenotazione non riuscita.');
        }
    }

    function restart() {
        setForm((f) => ({ ...emptyForm, mode: f.mode }));
        setTime(null);
        setResult(null);
        setStatus('idle');
        startedAt.current = performance.now();
        load();
    }

    /* ---------- stati di caricamento ---------- */
    if (loadError) {
        return (
            <Shell>
                <div className="flex min-h-[24rem] flex-col items-center justify-center p-8 text-center" role="alert">
                    <CircleAlert aria-hidden className="h-8 w-8 text-danger" strokeWidth={1.4} />
                    <p className="mt-4 font-serif text-2xl text-ink">Non è stato possibile caricare le disponibilità.</p>
                    <p className="mt-2 text-ink-soft">
                        Riprova tra poco oppure{' '}
                        <a href="#contatti" className="link-underline link-underline-static text-forest">
                            scrivimi dal modulo di contatto
                        </a>
                        .
                    </p>
                    <button
                        type="button"
                        onClick={() => load()}
                        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-5 font-medium hover:border-forest"
                    >
                        <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={1.6} /> Riprova
                    </button>
                </div>
            </Shell>
        );
    }

    if (!data || !month) {
        return (
            <Shell>
                <div className="grid gap-px lg:grid-cols-[1.1fr_1fr]" aria-busy="true" aria-label="Caricamento delle disponibilità">
                    <div className="p-6 sm:p-8">
                        <div className="h-7 w-40 animate-pulse rounded bg-sand-deep" />
                        <div className="mt-8 grid grid-cols-7 gap-2">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="aspect-square animate-pulse rounded-xl bg-sand/80" />
                            ))}
                        </div>
                    </div>
                    <div className="hidden p-8 lg:block">
                        <div className="h-7 w-48 animate-pulse rounded bg-sand-deep" />
                    </div>
                </div>
            </Shell>
        );
    }

    const hasAny = Object.keys(data.availability).length > 0;

    return (
        <Shell demo={data.mode === 'demo'}>
            <div className="grid lg:grid-cols-[1.1fr_1fr]">
                {/* -------- CALENDARIO -------- */}
                <div className="border-b border-ink/10 p-5 sm:p-8 lg:border-b-0 lg:border-r">
                    <div className="flex items-center justify-between">
                        <h3 className="font-serif text-[1.75rem] leading-none text-ink" aria-live="polite">
                            {capitalize(fmt(`${month}-01`, { month: 'long', year: 'numeric' }))}
                        </h3>
                        <div className="flex gap-1">
                            <NavButton label="Mese precedente" disabled={!canPrev} onClick={() => setMonth(shiftMonth(month, -1))}>
                                <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                            </NavButton>
                            <NavButton label="Mese successivo" disabled={!canNext} onClick={() => setMonth(shiftMonth(month, 1))}>
                                <ChevronRight aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                            </NavButton>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-7 gap-x-1 gap-y-1.5 sm:gap-1.5" role="presentation">
                        {WEEKDAYS.map((d) => (
                            <span key={d} aria-hidden className="pb-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                                {d}
                            </span>
                        ))}
                        {cells.map((cell, i) => {
                            if (!cell) return <span key={`e${i}`} aria-hidden />;
                            const count = data.availability[cell]?.length ?? 0;
                            const inRange = cell >= data.first && cell <= data.last;
                            const selected = cell === date;
                            const isToday = cell === data.first;
                            const label = `${longDate(cell)}: ${count ? `${count} ${count === 1 ? 'orario disponibile' : 'orari disponibili'}` : 'nessuna disponibilità'}`;
                            return (
                                <button
                                    key={cell}
                                    type="button"
                                    disabled={!count}
                                    aria-pressed={selected}
                                    aria-label={label}
                                    onClick={() => pickDate(cell)}
                                    className={cn(
                                        'relative flex h-11 flex-col items-center justify-center rounded-lg text-[0.95rem] transition-colors duration-200 sm:aspect-square sm:h-auto sm:rounded-xl',
                                        selected
                                            ? 'bg-forest font-semibold text-cream'
                                            : count
                                              ? 'bg-sage-pale/70 font-medium text-forest-deep hover:bg-sage-light'
                                              : inRange
                                                ? 'cursor-default text-ink/35'
                                                : 'cursor-default text-ink/20',
                                        isToday && !selected && 'ring-1 ring-inset ring-clay'
                                    )}
                                >
                                    {Number(cell.slice(8))}
                                    {count > 0 && (
                                        <span aria-hidden className={cn('absolute bottom-1.5 h-1 w-1 rounded-full', selected ? 'bg-cream' : 'bg-forest/60')} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem] text-ink-soft">
                        <li className="flex items-center gap-2">
                            <span aria-hidden className="h-3 w-3 rounded bg-sage-pale" /> Disponibile
                        </li>
                        <li className="flex items-center gap-2">
                            <span aria-hidden className="h-3 w-3 rounded bg-forest" /> Selezionato
                        </li>
                        <li className="flex items-center gap-2">
                            <span aria-hidden className="h-3 w-3 rounded ring-1 ring-inset ring-clay" /> Oggi
                        </li>
                    </ul>
                </div>

                {/* -------- PANNELLO ORARI / DATI -------- */}
                <div ref={panelRef} tabIndex={-1} className="p-5 outline-none sm:p-8" aria-live="polite">
                    {/* Ogni cambio di pannello entra con una transizione morbida */}
                    <div key={status === 'success' ? 'success' : `${date}-${time ?? ''}`} className="panel-in">
                        {status === 'success' && result ? (
                            <Success date={date!} time={time!} mode={form.mode} result={result} slotMinutes={data.slotMinutes} onRestart={restart} />
                        ) : !hasAny ? (
                            <EmptyState alternative={alternative} alternativeCta={alternativeCta} />
                        ) : !date ? (
                            <p className="text-ink-soft">Scegli un giorno dal calendario.</p>
                        ) : !time ? (
                            <>
                                <p className="text-eyebrow font-semibold uppercase text-forest">Orari disponibili</p>
                                <h3 className="mt-2 font-serif text-[1.75rem] leading-tight text-ink">{longDate(date)}</h3>
                                {message && <Alert>{message}</Alert>}
                                <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                                    {slots.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => pickTime(t)}
                                            aria-label={`${longDate(date)} alle ${t}`}
                                            className="min-h-12 rounded-xl border border-forest/25 bg-white/70 text-[0.98rem] font-medium tabular-nums text-forest-deep transition-colors duration-200 hover:border-forest hover:bg-forest hover:text-cream active:scale-[0.98]"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                                    Durata dell’incontro: circa {data.slotMinutes} minuti. Orari riferiti all’ora italiana.
                                </p>
                            </>
                        ) : (
                            <form noValidate onSubmit={submit} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setTime(null)}
                                    className="group -ml-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-forest"
                                >
                                    <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.6} />
                                    <span className="link-underline">Cambia orario</span>
                                </button>
                                <div className="mt-2 rounded-2xl bg-sage-pale/60 px-4 py-3">
                                    <p className="font-serif text-xl leading-snug text-ink">
                                        {longDate(date)} · {time}
                                    </p>
                                    <p className="text-sm text-ink-soft">Primo colloquio · circa {data.slotMinutes} minuti</p>
                                </div>

                                <fieldset className="mt-5">
                                    <legend className="text-[0.9rem] font-medium text-ink">Modalità</legend>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {(['studio', 'online'] as const).map((m) => (
                                            <label
                                                key={m}
                                                className={cn(
                                                    'flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-[0.92rem] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest',
                                                    form.mode === m ? 'border-forest bg-forest/[0.06]' : 'border-ink/15 hover:border-ink/35'
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="mode"
                                                    value={m}
                                                    checked={form.mode === m}
                                                    onChange={() => update('mode', m)}
                                                    className="h-4 w-4 accent-forest"
                                                />
                                                {m === 'studio' ? (
                                                    <MapPin aria-hidden className="h-4 w-4 text-sage" strokeWidth={1.5} />
                                                ) : (
                                                    <Video aria-hidden className="h-4 w-4 text-sage" strokeWidth={1.5} />
                                                )}
                                                {m === 'studio' ? 'In studio' : 'Online'}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <Field id={`${uid}-name`} label="Nome" required error={errors.name}>
                                        <input
                                            id={`${uid}-name`}
                                            name="name"
                                            autoComplete="name"
                                            required
                                            maxLength={100}
                                            value={form.name}
                                            onChange={(e) => update('name', e.target.value)}
                                            aria-invalid={!!errors.name}
                                            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
                                            className={inputClass(!!errors.name)}
                                        />
                                    </Field>
                                    <Field id={`${uid}-email`} label="Email" required error={errors.email}>
                                        <input
                                            id={`${uid}-email`}
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            inputMode="email"
                                            required
                                            maxLength={160}
                                            value={form.email}
                                            onChange={(e) => update('email', e.target.value)}
                                            aria-invalid={!!errors.email}
                                            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                                            className={inputClass(!!errors.email)}
                                        />
                                    </Field>
                                </div>
                                <Field id={`${uid}-phone`} label="Telefono" hint="facoltativo" error={errors.phone} className="mt-4">
                                    <input
                                        id={`${uid}-phone`}
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        inputMode="tel"
                                        maxLength={30}
                                        value={form.phone}
                                        onChange={(e) => update('phone', e.target.value)}
                                        aria-invalid={!!errors.phone}
                                        aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
                                        className={inputClass(!!errors.phone)}
                                    />
                                </Field>
                                <Field
                                    id={`${uid}-note`}
                                    label="Una nota"
                                    hint="facoltativa"
                                    error={errors.note}
                                    className="mt-4"
                                    description="Non è necessario condividere dettagli personali o clinici."
                                >
                                    <textarea
                                        id={`${uid}-note`}
                                        name="note"
                                        rows={2}
                                        maxLength={500}
                                        value={form.note}
                                        onChange={(e) => update('note', e.target.value)}
                                        aria-invalid={!!errors.note}
                                        aria-describedby={[`${uid}-note-desc`, errors.note && `${uid}-note-error`].filter(Boolean).join(' ')}
                                        className={cn(inputClass(!!errors.note), 'resize-y py-2.5')}
                                    />
                                </Field>

                                {/* Honeypot anti-spam */}
                                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                                    <label htmlFor={`${uid}-hp`}>Non compilare questo campo</label>
                                    <input
                                        id={`${uid}-hp`}
                                        name="booking_hp"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={form.booking_hp}
                                        onChange={(e) => update('booking_hp', e.target.value)}
                                    />
                                </div>

                                <div className="mt-5 flex items-start gap-3">
                                    <input
                                        id={`${uid}-privacy`}
                                        name="privacy"
                                        type="checkbox"
                                        required
                                        checked={form.privacy}
                                        onChange={(e) => update('privacy', e.target.checked)}
                                        aria-invalid={!!errors.privacy}
                                        aria-describedby={errors.privacy ? `${uid}-privacy-error` : undefined}
                                        className="mt-1 h-5 w-5 shrink-0 accent-forest"
                                    />
                                    <label htmlFor={`${uid}-privacy`} className="text-[0.88rem] leading-relaxed text-ink-soft">
                                        Ho letto l’
                                        <Link href="/privacy" target="_blank" className="link-underline link-underline-static text-forest">
                                            informativa privacy
                                            <span className="sr-only"> (si apre in una nuova finestra)</span>
                                        </Link>{' '}
                                        e acconsento al trattamento dei dati per la gestione dell’appuntamento. <span aria-hidden>*</span>
                                    </label>
                                </div>
                                {errors.privacy && <ErrorText id={`${uid}-privacy-error`}>{errors.privacy}</ErrorText>}

                                {status === 'error' && message && <Alert>{message}</Alert>}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="mt-6 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full bg-forest px-6 font-medium text-cream transition-colors hover:bg-forest-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> Prenotazione in corso…
                                        </>
                                    ) : (
                                        'Conferma prenotazione'
                                    )}
                                </button>
                                <p className="mt-3 text-center text-[0.8rem] leading-relaxed text-ink-soft">{note}</p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Shell>
    );
}

/* ---------------------------------------------------------------------------
 * Componenti di supporto
 * ------------------------------------------------------------------------- */

function Shell({ children, demo }: { children: ReactNode; demo?: boolean }) {
    return (
        <div className="overflow-hidden rounded-[1.25rem] bg-white/75">
            {demo && (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed border-clay/60 bg-clay-light/30 px-5 py-2.5 text-[0.8rem] text-clay-dark sm:px-8">
                    <span className="font-semibold uppercase tracking-[0.14em]">Anteprima demo</span>
                    <span>Orari di esempio · le prenotazioni non vengono registrate</span>
                </p>
            )}
            {children}
        </div>
    );
}

function NavButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-ink/15 disabled:hover:text-ink"
        >
            {children}
        </button>
    );
}

function Success({
    date,
    time,
    mode,
    result,
    slotMinutes,
    onRestart
}: {
    date: string;
    time: string;
    mode: 'studio' | 'online';
    result: { demo: boolean; emailSent: boolean };
    slotMinutes: number;
    onRestart: () => void;
}) {
    return (
        <div role="status" className="flex h-full flex-col justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream">
                <Check aria-hidden className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <h3 className="mt-6 font-serif text-[2rem] leading-tight text-ink">{result.demo ? 'Prenotazione simulata' : 'Prenotazione confermata'}</h3>
            <div className="mt-5 rounded-2xl bg-sage-pale/60 px-4 py-3">
                <p className="font-serif text-xl text-ink">
                    {longDate(date)} · {time}
                </p>
                <p className="text-sm text-ink-soft">
                    {mode === 'online' ? 'Online, in videochiamata' : 'In studio a Teramo'} · circa {slotMinutes} minuti
                </p>
            </div>
            <p className="mt-5 leading-relaxed text-ink-soft">
                {result.demo
                    ? 'Questa è un’anteprima: in modalità demo nessun appuntamento viene registrato.'
                    : result.emailSent
                      ? 'Ti ho inviato una email di conferma con i dettagli dell’appuntamento.'
                      : 'L’appuntamento è stato registrato. Ti ricontatterò per confermare i dettagli.'}
            </p>
            <button type="button" onClick={onRestart} className="link-underline link-underline-static tap-target mt-4 self-start font-medium text-forest">
                Prenota un altro appuntamento
            </button>
        </div>
    );
}

function EmptyState({ alternative, alternativeCta }: { alternative: string; alternativeCta: string }) {
    return (
        <div className="flex h-full flex-col justify-center">
            <p className="font-serif text-2xl text-ink">Al momento non ci sono orari disponibili online.</p>
            <p className="mt-3 text-ink-soft">
                {alternative}{' '}
                <a href="#contatti" className="link-underline link-underline-static text-forest">
                    {alternativeCta}
                </a>
                .
            </p>
        </div>
    );
}

function Alert({ children }: { children: ReactNode }) {
    return (
        <p role="alert" className="mt-4 flex gap-2.5 rounded-xl bg-danger-soft p-3.5 text-[0.92rem] leading-relaxed text-danger-deep">
            <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
            <span>{children}</span>
        </p>
    );
}

function inputClass(invalid: boolean) {
    return cn(
        'mt-1.5 block min-h-12 w-full rounded-xl border bg-cream/60 px-3.5 text-[1rem] text-ink transition-colors focus:bg-white focus:outline-none focus-visible:border-forest focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-forest/40',
        invalid ? 'border-danger' : 'border-ink/15 hover:border-ink/35'
    );
}

function Field({
    id,
    label,
    required,
    hint,
    error,
    description,
    className,
    children
}: {
    id: string;
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    description?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={className}>
            <label htmlFor={id} className="text-[0.88rem] font-medium text-ink">
                {label}
                {required && <span aria-hidden> *</span>}
                {hint && <span className="font-normal text-ink-soft"> ({hint})</span>}
            </label>
            {description && (
                <p id={`${id}-desc`} className="text-[0.8rem] text-ink-soft">
                    {description}
                </p>
            )}
            {children}
            {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
        </div>
    );
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
    return (
        <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
            <CircleAlert aria-hidden className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            {children}
        </p>
    );
}
