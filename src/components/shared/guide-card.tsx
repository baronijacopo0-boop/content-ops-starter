import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GUIDE_CATEGORIES, type Guide } from '@/lib/guides/content';

export function GuideCard({ guide }: { guide: Guide }) {
  const cat = GUIDE_CATEGORIES.find((c) => c.id === guide.category)!;
  return (
    <Link
      href={`/guide/${guide.slug}`}
      className="card-surface group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-primary/30"
      data-testid="guide-card"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden>
          {cat.emoji}
        </span>
        <Badge tone={guide.level === 'Base' ? 'profit' : guide.level === 'Intermedio' ? 'info' : 'purple'}>
          {guide.level}
        </Badge>
      </div>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {cat.label}
      </p>
      <h3 className="mt-1 font-semibold leading-snug group-hover:text-primary">{guide.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{guide.summary}</p>
      <span className="mt-auto flex items-center gap-1 pt-4 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" /> {guide.readingMinutes} min di lettura
      </span>
    </Link>
  );
}
