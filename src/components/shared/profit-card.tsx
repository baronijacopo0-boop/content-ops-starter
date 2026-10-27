import { InfoTip } from '@/components/ui/tooltip';
import type { ProfitBreakdown } from '@/lib/domain/finance';
import { formatEUR, formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Big profit / ROI / margin readout used by the Profit Calculator. */
export function ProfitCard({ breakdown }: { breakdown: ProfitBreakdown }) {
  const positive = breakdown.profit >= 0;
  return (
    <div
      className={cn('card-surface p-6', positive ? 'glow-profit border-profit/30' : 'border-loss/40')}
      data-testid="profit-card"
    >
      <p className="text-xs font-medium text-muted-foreground">Profitto netto</p>
      <p
        className={cn(
          'mt-1 text-5xl font-black tracking-tight tabular-nums',
          positive ? 'text-profit' : 'text-loss',
        )}
        data-testid="profit-value"
      >
        {formatEUR(breakdown.profit, { sign: true })}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            ROI <InfoTip>Profitto ÷ prezzo di acquisto × 100: quanto rende ogni euro investito.</InfoTip>
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" data-testid="roi-value">
            {formatPct(breakdown.roi)}
          </p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Margine{' '}
            <InfoTip>Profitto ÷ prezzo di vendita × 100: quanto dell’incasso ti resta in tasca.</InfoTip>
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" data-testid="margin-value">
            {formatPct(breakdown.margin)}
          </p>
        </div>
      </div>
    </div>
  );
}
