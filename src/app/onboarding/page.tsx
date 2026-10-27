'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/components/providers/app-provider';
import { useProfile, useRevalidate } from '@/hooks/use-data';
import { BUDGET_OPTIONS, GOAL_OPTIONS, NICHES, SUGGESTED_BRANDS } from '@/lib/domain/constants';
import type { Niche } from '@/lib/domain/types';
import { cn, sanitizeText } from '@/lib/utils';

const STEPS = ['Budget', 'Categoria', 'Brand', 'Obiettivo'];

function Choice({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'relative flex items-center justify-center rounded-2xl border bg-card px-4 py-4 text-sm font-semibold transition-all hover:border-primary/40 active:scale-[0.98]',
        selected && 'border-primary bg-primary/10 text-foreground shadow-[0_0_0_1px_hsl(var(--primary))]',
        className,
      )}
    >
      {selected && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" />}
      {children}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { status, repo, user } = useApp();
  const { data: bundle } = useProfile();
  const revalidate = useRevalidate();
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<number | null>(null);
  const [niche, setNiche] = useState<Niche | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [customBrand, setCustomBrand] = useState('');
  const [goal, setGoal] = useState<number | null>(null);
  const [targetRoi, setTargetRoi] = useState(100);
  const [demo, setDemo] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/onboarding');
    if (bundle?.profile.onboardingCompleted && !saving) router.replace('/dashboard');
  }, [status, bundle, router, saving]);

  if (status !== 'authenticated' || !bundle) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const canNext = [budget !== null, niche !== null, brands.length > 0, goal !== null][step];

  function toggleBrand(b: string) {
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : prev.length >= 30 ? prev : [...prev, b],
    );
  }

  function addCustom() {
    const b = sanitizeText(customBrand, 60);
    if (b && !brands.includes(b)) setBrands([...brands, b]);
    setCustomBrand('');
  }

  async function finish() {
    if (!repo) return;
    setSaving(true);
    try {
      if (demo) await repo.seedDemoData();
      await repo.updateProfileBundle({
        profile: { mainCategory: niche, favoriteBrands: brands, onboardingCompleted: true },
        goals: { budget, monthlyGoal: goal, targetRoi },
      });
      await revalidate('profile', 'inventory', 'sales', 'listings', 'watchlists', 'notifications');
      toast.success('Tutto pronto! Ecco la tua dashboard.');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Salvataggio non riuscito');
      setSaving(false);
    }
  }

  const firstName = (bundle.profile.fullName || user?.email || '').split(' ')[0];

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />
      <header className="relative z-10 mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-5">
        <Logo href="/onboarding" />
        <span className="text-xs text-muted-foreground">
          Passo {step + 1} di {STEPS.length}
        </span>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-2xl px-5">
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-5 pb-32 pt-8">
        <div key={step} className="animate-fade-up">
          {step === 0 && (
            <>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ciao {firstName}! Quanto vuoi investire?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Il tuo budget per gli acquisti. Lo useremo per suggerirti affari alla tua portata.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BUDGET_OPTIONS.map((b) => (
                  <Choice
                    key={b}
                    selected={budget === b}
                    onClick={() => setBudget(b)}
                    className="py-6 text-lg"
                  >
                    €{b}
                    {b === 1000 ? '+' : ''}
                  </Choice>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Qual è la tua categoria principale?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Personalizzeremo Deal Finder e analytics sul tuo stile.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {NICHES.map((n) => (
                  <Choice
                    key={n.value}
                    selected={niche === n.value}
                    onClick={() => setNiche(n.value)}
                    className="flex-col gap-2 py-6"
                  >
                    <span className="text-2xl">{n.emoji}</span>
                    {n.label}
                  </Choice>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Quali brand preferisci?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Scegline quanti vuoi: daremo priorità a questi nelle occasioni.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {Array.from(new Set([...SUGGESTED_BRANDS, ...brands])).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBrand(b)}
                    aria-pressed={brands.includes(b)}
                    className={cn(
                      'rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/40',
                      brands.includes(b) && 'border-primary bg-primary/10 text-foreground',
                    )}
                  >
                    {brands.includes(b) && <Check className="mr-1 inline h-3.5 w-3.5 text-primary" />}
                    {b}
                  </button>
                ))}
              </div>
              <form
                className="mt-5 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addCustom();
                }}
              >
                <Input
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Aggiungi un altro brand…"
                  maxLength={60}
                />
                <Button type="submit" variant="outline" size="icon" aria-label="Aggiungi brand">
                  <Plus />
                </Button>
              </form>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Qual è il tuo obiettivo mensile?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Quanto vuoi guadagnare in più ogni mese. Ti mostreremo i progressi in dashboard.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((g) => (
                  <Choice key={g} selected={goal === g} onClick={() => setGoal(g)} className="py-6 text-lg">
                    €{g}
                    {g === 1000 ? '+' : ''} extra
                  </Choice>
                ))}
              </div>
              <div className="card-surface mt-6 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">ROI minimo desiderato</p>
                    <p className="text-xs text-muted-foreground">
                      Useremo questa soglia per dirti se un affare conviene.
                    </p>
                  </div>
                  <span className="text-xl font-bold text-primary">{targetRoi}%</span>
                </div>
                <Slider
                  className="mt-4"
                  min={20}
                  max={300}
                  step={10}
                  value={[targetRoi]}
                  onValueChange={([v]) => setTargetRoi(v)}
                  aria-label="ROI minimo"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Esempio: con ROI 100% un capo pagato €15 va rivenduto almeno a €30 (+ costi).
                </p>
              </div>
              <label className="card-surface mt-3 flex cursor-pointer items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-semibold">Carica dati demo</p>
                  <p className="text-xs text-muted-foreground">
                    Inventario, vendite e watchlist di esempio per esplorare subito l’app. Potrai cancellarli
                    dalle impostazioni.
                  </p>
                </div>
                <Switch checked={demo} onCheckedChange={setDemo} aria-label="Carica dati demo" />
              </label>
            </>
          )}
        </div>
      </main>

      <footer className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || saving}>
            <ArrowLeft /> Indietro
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Continua <ArrowRight />
            </Button>
          ) : (
            <Button onClick={finish} disabled={!canNext} loading={saving}>
              Vai alla dashboard <ArrowRight />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
