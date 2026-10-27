import { Rocket, Target, TrendingUp } from 'lucide-react';
import type { PriceStrategy } from '@/services/ai/types';
import { formatEUR, formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

const ICONS = { quick: Rocket, recommended: Target, max: TrendingUp };

/** Price Advisor: quick sale / recommended / max profit. */
export function PriceSuggestion({
  strategies,
  selected,
  onSelect,
  showProfit = true,
}: {
  strategies: PriceStrategy[];
  selected?: PriceStrategy['key'];
  onSelect?: (s: PriceStrategy) => void;
  showProfit?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {strategies.map((s) => {
        const Icon = ICONS[s.key];
        const isSel = selected === s.key;
        const Comp = onSelect ? 'button' : 'div';
        return (
          <Comp
            key={s.key}
            type={onSelect ? 'button' : undefined}
            onClick={onSelect ? () => onSelect(s) : undefined}
            className={cn(
              'flex flex-col rounded-2xl border bg-muted/20 p-4 text-left transition',
              s.key === 'recommended' && 'border-primary/40 bg-primary/5',
              onSelect && 'hover:border-primary/50',
              isSel && 'ring-2 ring-primary',
            )}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon className={cn('h-3.5 w-3.5', s.key === 'recommended' && 'text-primary')} /> {s.label}
            </span>
            <span className="mt-2 text-2xl font-bold tabular-nums">
              {formatEUR(s.price, { decimals: false })}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {s.days.min}-{s.days.max} giorni
              {showProfit && s.roi !== null && (
                <>
                  {' · '}
                  <span className={s.profit >= 0 ? 'text-profit' : 'text-loss'}>
                    {formatEUR(s.profit, { sign: true })} ({formatPct(s.roi)})
                  </span>
                </>
              )}
            </span>
            <span className="mt-2 text-xs leading-relaxed text-muted-foreground/90">{s.description}</span>
          </Comp>
        );
      })}
    </div>
  );
}
