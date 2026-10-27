import { Bot, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { InfoTip } from '@/components/ui/tooltip';
import { MiniStat } from '@/components/shared/stat-card';
import { BADGE_META } from '@/services/ai/deal-score';
import type { DealEvaluation } from '@/services/ai/types';
import { formatEUR, formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DealScore } from './deal-score';
import { PriceSuggestion } from './price-suggestion';

const VERDICT_STYLE = {
  hot: 'border-profit/40 bg-profit/10 text-profit',
  good: 'border-info/40 bg-info/10 text-info',
  maybe: 'border-warning/40 bg-warning/10 text-warning',
  skip: 'border-loss/40 bg-loss/10 text-loss',
};

/** Full deal analysis result: verdict, numbers, best buy price, AI explanation, score breakdown, price advisor. */
export function AIAnalysis({ evaluation: e }: { evaluation: DealEvaluation }) {
  const meta = BADGE_META[e.badge];
  const underMax = e.input.price <= e.maxBuyPrice;
  return (
    <div className="flex flex-col gap-4 animate-fade-up" data-testid="deal-result">
      <div className={cn('flex items-center gap-4 rounded-2xl border p-5', VERDICT_STYLE[e.badge])}>
        <DealScore score={e.dealScore} size={76} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Verdetto</p>
          <p className="text-xl font-black tracking-tight sm:text-2xl">
            {meta.emoji} {meta.verdict}
          </p>
          <p className="mt-0.5 text-xs text-foreground/70">
            Deal Score {e.dealScore}/100 · tempo vendita {e.sellTime.min}-{e.sellTime.max} giorni
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MiniStat label="Prezzo richiesto" value={formatEUR(e.input.price)} />
        <MiniStat
          label="Valore di mercato"
          value={`${formatEUR(e.market.low, { decimals: false })}-${formatEUR(e.market.high, { decimals: false })}`}
          info="Range dei prezzi a cui si vendono capi simili (stesso brand, categoria, condizione)."
        />
        <MiniStat
          label="Prezzo consigliato"
          value={formatEUR(e.recommendedPrice, { decimals: false })}
          info="Il prezzo di rivendita con il miglior equilibrio tra velocità e guadagno."
        />
        <MiniStat
          label="Profitto potenziale"
          value={formatEUR(e.profit, { sign: true })}
          tone={e.profit >= 0 ? 'profit' : 'loss'}
          info={`Prezzo consigliato − prezzo richiesto − costi extra (${formatEUR(e.input.extraCosts)}).`}
        />
        <MiniStat
          label="ROI"
          value={formatPct(e.roi)}
          tone={e.meetsTargetRoi ? 'profit' : 'warning'}
          info="Profitto / prezzo pagato × 100. Ti dice quanto rende ogni euro investito."
        />
        <MiniStat
          label="Tempo vendita"
          value={`${e.sellTime.min}-${e.sellTime.max} gg`}
          info="Stima basata su quanto ci mettono a vendersi capi simili al prezzo consigliato."
        />
      </div>

      <Card className={cn('border', underMax ? 'border-profit/30' : 'border-warning/30')}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {underMax ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-profit" />
            ) : (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            )}
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                Best buy price
                <InfoTip>
                  Il prezzo massimo da pagare per ottenere almeno il tuo ROI target ({e.input.targetRoi}%),
                  considerando i costi extra.
                </InfoTip>
              </p>
              <p className="text-xs text-muted-foreground">
                Rivendita stimata {formatEUR(e.recommendedPrice, { decimals: false })} · ROI target{' '}
                {e.input.targetRoi}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:text-right">
            <div>
              <p className="text-[11px] text-muted-foreground">Max da pagare</p>
              <p className="text-lg font-bold">{formatEUR(e.maxBuyPrice)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Prezzo attuale</p>
              <p className={cn('text-lg font-bold', underMax ? 'text-profit' : 'text-warning')}>
                {formatEUR(e.input.price)}
              </p>
            </div>
            <Badge tone={underMax ? 'profit' : 'warning'}>
              {underMax ? 'OTTIMO ACQUISTO' : 'TRATTA IL PREZZO'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="h-4 w-4 text-primary" /> Spiegazione AI
            {e.engine === 'mock' && <Badge tone="muted">motore locale</Badge>}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{e.explanation}</p>
          {e.market.source === 'model' && (
            <p className="mt-2 text-xs text-warning">
              Stima con pochi dati comparabili: verifica manualmente.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold">Come è calcolato il Deal Score</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {e.components.map((c) => (
              <li key={c.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {c.label} <span className="text-muted-foreground/60">· peso {Math.round(c.weight)}%</span>
                    <InfoTip>{c.hint}</InfoTip>
                  </span>
                  <span className="font-semibold tabular-nums">{c.score}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      c.score >= 70 ? 'bg-profit' : c.score >= 45 ? 'bg-warning' : 'bg-loss',
                    )}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-sm font-semibold">Price Advisor: a quanto rivenderlo</p>
        <PriceSuggestion strategies={e.strategies} />
      </div>
    </div>
  );
}
