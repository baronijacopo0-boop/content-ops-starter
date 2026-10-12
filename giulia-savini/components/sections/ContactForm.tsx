'use client';

import Link from 'next/link';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { PREFILL_EVENT, type ContactMode } from '@/components/ui/PrefillLink';
import { cn } from '@/lib/cn';
import { validateContact, type ContactErrors, type ContactPayload } from '@/lib/contact';

type Status = 'idle' | 'loading' | 'success' | 'error';

type FormState = Omit<ContactPayload, 'elapsed'>;

const emptyForm: FormState = { name: '', email: '', phone: '', mode: 'studio', message: '', privacy: false, contact_hp: '' };

export function ContactForm({ reassurance, fallbackEmail }: { reassurance: string; fallbackEmail?: string | null }) {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<ContactErrors>({});
    const [status, setStatus] = useState<Status>('idle');
    const [serverMessage, setServerMessage] = useState('');
    const statusRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const uid = useId();
    const startedAt = useRef(0);

    useEffect(() => {
        startedAt.current = performance.now();
        const fromQuery = new URLSearchParams(window.location.search).get('modalita');
        if (fromQuery === 'online' || fromQuery === 'studio') setForm((f) => ({ ...f, mode: fromQuery }));
        const onPrefill = (e: Event) => {
            const mode = (e as CustomEvent<ContactMode>).detail;
            if (mode === 'online' || mode === 'studio') setForm((f) => ({ ...f, mode }));
        };
        window.addEventListener(PREFILL_EVENT, onPrefill);
        return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
    }, []);

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        if (errors[key as keyof ContactErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

    /** Validazione al blur: mostra l'errore del singolo campo solo se l'utente lo ha già compilato o ha tentato l'invio. */
    const [submitted, setSubmitted] = useState(false);
    const onBlurField = (key: keyof ContactErrors) => {
        const value = form[key];
        if (!submitted && (value === '' || value === false)) return;
        const fieldError = validateContact(form)[key];
        setErrors((e) => ({ ...e, [key]: fieldError }));
    };

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status === 'loading') return;
        setSubmitted(true);
        const found = validateContact(form);
        setErrors(found);
        const firstInvalid = Object.keys(found)[0];
        if (firstInvalid) {
            formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
            return;
        }

        setStatus('loading');
        setServerMessage('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, elapsed: Math.round(performance.now() - startedAt.current) } satisfies ContactPayload)
            });
            const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: ContactErrors };
            if (data.errors) setErrors(data.errors);
            if (!res.ok || !data.ok) throw new Error(data.error || 'Invio non riuscito.');
            setStatus('success');
            // Mantiene la modalità scelta per un eventuale nuovo invio
            setForm((f) => ({ ...emptyForm, mode: f.mode }));
            startedAt.current = performance.now();
            setSubmitted(false);
        } catch (err) {
            setStatus('error');
            setServerMessage(err instanceof Error ? err.message : 'Invio non riuscito.');
        } finally {
            requestAnimationFrame(() => statusRef.current?.focus());
        }
    }

    const fieldId = (name: string) => `${uid}-${name}`;
    const errorId = (name: keyof ContactErrors) => (errors[name] ? `${fieldId(name)}-error` : undefined);

    if (status === 'success') {
        return (
            <div ref={statusRef} tabIndex={-1} role="status" className="rounded-[1.5rem] bg-white/70 p-8 outline-none sm:p-12">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream">
                    <Check aria-hidden className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-8 text-4xl">Grazie, ho ricevuto la tua richiesta.</h3>
                <p className="mt-4 max-w-md leading-relaxed text-ink-soft">{reassurance}</p>
                <button type="button" onClick={() => setStatus('idle')} className="link-underline link-underline-static mt-8 font-medium text-forest">
                    Invia un’altra richiesta
                </button>
            </div>
        );
    }

    return (
        <form ref={formRef} noValidate onSubmit={onSubmit} aria-describedby={`${uid}-required`} className="relative rounded-[1.5rem] bg-white/70 p-6 sm:p-10">
            <p id={`${uid}-required`} className="text-sm text-ink-soft">
                I campi contrassegnati con <span aria-hidden>*</span>
                <span className="sr-only">asterisco</span> sono obbligatori.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Field label="Nome" required id={fieldId('name')} error={errors.name}>
                    <input
                        id={fieldId('name')}
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        maxLength={100}
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        onBlur={() => onBlurField('name')}
                        aria-invalid={!!errors.name}
                        aria-describedby={errorId('name')}
                        className={inputClass(!!errors.name)}
                    />
                </Field>
                <Field label="Email" required id={fieldId('email')} error={errors.email}>
                    <input
                        id={fieldId('email')}
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        maxLength={160}
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        onBlur={() => onBlurField('email')}
                        aria-invalid={!!errors.email}
                        aria-describedby={errorId('email')}
                        className={inputClass(!!errors.email)}
                    />
                </Field>
                <Field label="Telefono" hint="facoltativo" id={fieldId('phone')} error={errors.phone} className="sm:col-span-2">
                    <input
                        id={fieldId('phone')}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={30}
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        onBlur={() => onBlurField('phone')}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errorId('phone')}
                        className={inputClass(!!errors.phone)}
                    />
                </Field>
            </div>

            <fieldset className="mt-7">
                <legend className="text-[0.9rem] font-medium text-ink">Preferisci incontrarci…</legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                    {(['studio', 'online'] as const).map((mode) => (
                        <label
                            key={mode}
                            className={cn(
                                'flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-xl border px-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest',
                                form.mode === mode ? 'border-forest bg-forest/[0.06]' : 'border-ink/15 hover:border-ink/35'
                            )}
                        >
                            <input
                                type="radio"
                                name="mode"
                                value={mode}
                                checked={form.mode === mode}
                                onChange={() => update('mode', mode)}
                                className="h-4 w-4 accent-forest"
                            />
                            <span className="text-[0.95rem]">
                                {mode === 'studio' ? (
                                    <>
                                        In studio<span className="hidden sm:inline"> a Teramo</span>
                                    </>
                                ) : (
                                    'Online'
                                )}
                            </span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <Field
                label="Messaggio"
                required
                id={fieldId('message')}
                error={errors.message}
                className="mt-7"
                description="Bastano poche righe: non è necessario condividere dettagli personali o clinici in questa fase."
                descriptionId={`${fieldId('message')}-desc`}
            >
                <textarea
                    id={fieldId('message')}
                    name="message"
                    required
                    rows={5}
                    maxLength={2000}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    onBlur={() => onBlurField('message')}
                    aria-invalid={!!errors.message}
                    aria-describedby={[`${fieldId('message')}-desc`, errorId('message')].filter(Boolean).join(' ')}
                    className={cn(inputClass(!!errors.message), 'resize-y py-3 leading-relaxed')}
                />
            </Field>

            {/* Honeypot anti-spam: invisibile alle persone, compilato dai bot */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor={fieldId('hp')}>Non compilare questo campo</label>
                <input
                    id={fieldId('hp')}
                    type="text"
                    name="contact_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.contact_hp}
                    onChange={(e) => update('contact_hp', e.target.value)}
                />
            </div>

            <div className="mt-7">
                <div className="flex items-start gap-3">
                    <input
                        id={fieldId('privacy')}
                        name="privacy"
                        type="checkbox"
                        required
                        checked={form.privacy}
                        onChange={(e) => update('privacy', e.target.checked)}
                        aria-invalid={!!errors.privacy}
                        aria-describedby={errorId('privacy')}
                        className="mt-1 h-5 w-5 shrink-0 rounded accent-forest"
                    />
                    <label htmlFor={fieldId('privacy')} className="text-[0.92rem] leading-relaxed text-ink-soft">
                        Ho letto l’
                        <Link href="/privacy" className="link-underline link-underline-static text-forest" target="_blank">
                            informativa privacy
                            <span className="sr-only"> (si apre in una nuova finestra)</span>
                        </Link>{' '}
                        e acconsento al trattamento dei dati per essere ricontattato/a. <span aria-hidden>*</span>
                    </label>
                </div>
                {errors.privacy && <ErrorText id={`${fieldId('privacy')}-error`}>{errors.privacy}</ErrorText>}
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 rounded-full bg-forest px-8 font-medium text-cream transition-colors duration-300 hover:bg-forest-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                    {status === 'loading' ? (
                        <>
                            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
                            Invio in corso…
                        </>
                    ) : (
                        'Invia richiesta'
                    )}
                </button>
                <p className="text-sm text-ink-soft">{reassurance}</p>
            </div>

            <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
                {status === 'error' && (
                    <p role="alert" className="mt-6 flex gap-3 rounded-xl bg-[#F6E7E1] p-4 text-[0.95rem] leading-relaxed text-[#7A2E1E]">
                        <CircleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
                        <span>
                            {serverMessage} Riprova tra qualche istante{fallbackEmail ? ` oppure scrivi a ${fallbackEmail}` : ''}.
                        </span>
                    </p>
                )}
            </div>
        </form>
    );
}

function inputClass(invalid: boolean) {
    return cn(
        'mt-2 block w-full rounded-xl border bg-cream/60 px-4 text-[1rem] text-ink transition-colors placeholder:text-ink/40 focus:bg-white focus:outline-none focus-visible:border-forest focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-forest/40',
        'min-h-[3.25rem]',
        invalid ? 'border-[#A3412B]' : 'border-ink/15 hover:border-ink/35'
    );
}

function Field({
    label,
    id,
    required,
    hint,
    error,
    description,
    descriptionId,
    className,
    children
}: {
    label: string;
    id: string;
    required?: boolean;
    hint?: string;
    error?: string;
    description?: string;
    descriptionId?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label htmlFor={id} className="text-[0.9rem] font-medium text-ink">
                {label}
                {required && <span aria-hidden> *</span>}
                {hint && <span className="font-normal text-ink-soft"> ({hint})</span>}
            </label>
            {description && (
                <p id={descriptionId} className="mt-1 text-sm text-ink-soft">
                    {description}
                </p>
            )}
            {children}
            {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
        </div>
    );
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <p id={id} className="mt-2 flex items-center gap-1.5 text-sm text-[#A3412B]">
            <CircleAlert aria-hidden className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            {children}
        </p>
    );
}
