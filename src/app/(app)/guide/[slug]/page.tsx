import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, CheckCircle2, Clock, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GuideCard } from '@/components/shared/guide-card';
import { GUIDE_CATEGORIES, GUIDES, getGuide } from '@/lib/guides/content';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  return guide ? { title: guide.title, description: guide.summary } : {};
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const cat = GUIDE_CATEGORIES.find((c) => c.id === guide.category)!;
  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/guide"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tutte le guide
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge tone="muted">
          {cat.emoji} {cat.label}
        </Badge>
        <Badge tone={guide.level === 'Base' ? 'profit' : 'info'}>{guide.level}</Badge>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {guide.readingMinutes} min
        </span>
      </div>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{guide.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{guide.summary}</p>

      <div className="mt-8 flex flex-col gap-8">
        {guide.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold tracking-tight">{s.heading}</h2>
            {s.paragraphs?.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-foreground/85">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-3 flex flex-col gap-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5 leading-relaxed text-foreground/85">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {s.tip && (
              <div className="mt-4 flex gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{s.tip}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="card-surface mt-10 p-6">
        <h2 className="font-bold">In sintesi</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {guide.takeaways.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-profit" /> {t}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mb-4 mt-12 font-bold">Continua a leggere</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((g) => (
          <GuideCard key={g.slug} guide={g} />
        ))}
      </div>
    </article>
  );
}
