import { Badge } from '@/components/ui/badge';
import { BADGE_META, dealBadge } from '@/services/ai/deal-score';
import type { DealBadge as Badge_ } from '@/services/ai/types';
import { cn } from '@/lib/utils';

const STROKE: Record<Badge_, string> = {
  hot: 'hsl(var(--profit))',
  good: 'hsl(var(--info))',
  maybe: 'hsl(var(--warning))',
  skip: 'hsl(var(--loss))',
};

/** Circular 0-100 Deal Score gauge. */
export function DealScore({
  score,
  size = 64,
  className,
  label = true,
}: {
  score: number;
  size?: number;
  className?: string;
  label?: boolean;
}) {
  const badge = dealBadge(score);
  const r = 15.5;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-label={`Deal Score ${score} su 100`}
      role="img"
    >
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={STROKE[badge]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.max(0, Math.min(100, score))) / 100}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-bold tabular-nums" style={{ fontSize: size * 0.3 }}>
          {score}
        </span>
        {label && size >= 56 && (
          <span className="mt-0.5 text-[9px] font-medium text-muted-foreground">/100</span>
        )}
      </div>
    </div>
  );
}

export function DealBadge({
  score,
  className,
  verdict = false,
}: {
  score: number;
  className?: string;
  verdict?: boolean;
}) {
  const meta = BADGE_META[dealBadge(score)];
  return (
    <Badge tone={meta.tone} className={className}>
      <span aria-hidden>{meta.emoji}</span> {verdict ? meta.verdict : meta.label}
    </Badge>
  );
}
