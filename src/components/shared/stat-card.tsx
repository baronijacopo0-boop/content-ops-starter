import type { LucideIcon } from 'lucide-react';
import { InfoTip } from '@/components/ui/tooltip';
import type { Tone } from '@/lib/domain/constants';
import { cn } from '@/lib/utils';

const toneText: Record<Tone, string> = {
  profit: 'text-profit',
  loss: 'text-loss',
  warning: 'text-warning',
  info: 'text-info',
  muted: 'text-foreground',
  purple: 'text-violet-300',
};

/** KPI tile. `info` explains what the number means and why it matters (shown in a tooltip). */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'muted',
  info,
  className,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  info?: string;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'card-surface animate-fade-up p-4 sm:p-5',
        highlight && 'glow-profit border-profit/30',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {label}
          {info && <InfoTip>{info}</InfoTip>}
        </span>
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
            <Icon
              className={cn(
                'h-3.5 w-3.5',
                toneText[tone] === 'text-foreground' ? 'text-muted-foreground' : toneText[tone],
              )}
            />
          </span>
        )}
      </div>
      <div
        className={cn('mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-[1.7rem]', toneText[tone])}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function MiniStat({
  label,
  value,
  tone = 'muted',
  info,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  info?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2.5">
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {label}
        {info && <InfoTip>{info}</InfoTip>}
      </div>
      <div className={cn('mt-0.5 text-sm font-semibold tabular-nums', toneText[tone])}>{value}</div>
    </div>
  );
}
