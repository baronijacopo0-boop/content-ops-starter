import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Calculator,
  Flame,
  Package,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { DealBadge, DealScore } from '@/components/deals/deal-score';
import { GarmentIllustration } from '@/components/shared/product-image';

const FEATURES = [
  {
    icon: Flame,
    title: 'Deal Finder',
    text: 'Una feed di occasioni con Deal Score 0-100, profitto stimato, ROI e tempo di vendita.',
  },
  {
    icon: ScanSearch,
    title: 'Analizza prima di comprare',
    text: 'Inserisci brand, condizione e prezzo: ti diciamo se comprare, quanto pagarlo al massimo e perché.',
  },
  {
    icon: Sparkles,
    title: 'Annunci AI dalle foto',
    text: 'Carica le foto e ottieni titolo SEO, descrizione pronta da copiare e tre strategie di prezzo.',
  },
  {
    icon: Package,
    title: 'Inventario intelligente',
    text: 'Stock age, inventory health e capitale bloccato: sai sempre cosa ribassare e cosa spingere.',
  },
  {
    icon: BarChart3,
    title: 'Analytics che contano',
    text: 'Profitto per mese, ROI per brand, categorie migliori e peggiori, insight automatici.',
  },
  {
    icon: Calculator,
    title: 'Profitto e ROI in un attimo',
    text: 'Calcolatore e metriche chiare, spiegate in modo semplice anche se hai appena iniziato.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Accedi</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/register">Inizia gratis</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> AI + reselling + marketplace
              intelligence
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl">
              Compra meglio.
              <br />
              <span className="text-gradient">Rivendi di più.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              FLIP AI è l’assistente personale per chi compra vestiti per rivenderli: capisce cosa conviene,
              quanto pagarlo, a quanto rivenderlo e quanto ci guadagni.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Crea il tuo account <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Ho già un account</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Nessuna automazione sui marketplace: niente
              bot, niente rischi per il tuo account.
            </p>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-sm animate-fade-up [animation-delay:120ms]">
            <div className="card-surface glow-profit overflow-hidden">
              <div className="relative aspect-[4/3]">
                <GarmentIllustration category="hoodie" seed="Nike Vintage Hoodie" />
                <div className="absolute left-3 top-3">
                  <DealBadge score={92} />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nike · Felpe · M</p>
                    <p className="mt-0.5 font-semibold">Nike Vintage Hoodie</p>
                  </div>
                  <DealScore score={92} size={56} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    ['Prezzo', '€14', ''],
                    ['Rivendita', '€35', ''],
                    ['Profitto', '+€21', 'text-profit'],
                  ].map(([k, v, c]) => (
                    <div key={k} className="rounded-xl bg-muted/50 py-2">
                      <p className="text-[10px] text-muted-foreground">{k}</p>
                      <p className={`text-sm font-bold ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>
                    ROI <b className="text-profit">150%</b>
                  </span>
                  <span>Vendita stimata 7-14 giorni</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-surface p-6 transition hover:border-primary/30">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="card-surface flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Il tuo business di reselling, in un’unica dashboard.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                <Bookmark className="mr-1 inline h-3.5 w-3.5" /> Watchlist, inventario, vendite, analytics e
                guide pratiche per crescere.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/register">Inizia ora</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} FLIP AI</span>
          <span>FLIP AI è un progetto indipendente, non affiliato a Vinted o ad altri marketplace.</span>
        </div>
      </footer>
    </div>
  );
}
