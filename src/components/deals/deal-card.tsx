import { Clock, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/shared/product-image';
import type { MarketItem } from '@/lib/marketplace/types';
import type { DealEvaluation } from '@/services/ai/types';
import { categoryLabel, CONDITIONS } from '@/lib/domain/constants';
import { formatEUR, formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DealBadge, DealScore } from './deal-score';

function timeAgo(iso: string) {
  const h = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  return h < 24 ? `${h}h fa` : `${Math.round(h / 24)}g fa`;
}

export function DealCard({
  item,
  evaluation: e,
  onAnalyze,
  onAddToInventory,
}: {
  item: MarketItem;
  evaluation: DealEvaluation;
  onAnalyze?: () => void;
  onAddToInventory?: () => void;
}) {
  const cond = CONDITIONS.find((c) => c.value === item.condition)?.short;
  return (
    <article
      className={cn(
        'card-surface group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/30',
        e.badge === 'hot' && 'border-profit/25',
      )}
      data-testid="deal-card"
    >
      <div className="relative aspect-[4/3]">
        <ProductImage
          src={item.imageUrl}
          alt={item.title}
          category={item.category}
          rounded="rounded-none"
          className="h-full w-full"
        />
        <div className="absolute left-3 top-3">
          <DealBadge score={e.dealScore} />
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-background/80 p-0.5 backdrop-blur">
          <DealScore score={e.dealScore} size={46} label={false} />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] text-white/80">
          <span className="rounded-full bg-black/50 px-2 py-0.5 backdrop-blur">{timeAgo(item.listedAt)}</span>
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur">
            <Heart className="h-3 w-3" /> {item.favorites}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] text-muted-foreground">
          {item.brand} · {categoryLabel(item.category)} · Tg {item.size} · {cond}
        </p>
        <h3 className="mt-0.5 line-clamp-1 font-semibold">{item.title}</h3>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-lg bg-muted/50 py-1.5">
            <p className="text-[10px] text-muted-foreground">Prezzo</p>
            <p className="text-sm font-bold">{formatEUR(item.price, { decimals: false })}</p>
          </div>
          <div className="rounded-lg bg-muted/50 py-1.5">
            <p className="text-[10px] text-muted-foreground">Rivendita</p>
            <p className="text-sm font-bold">{formatEUR(e.recommendedPrice, { decimals: false })}</p>
          </div>
          <div className="rounded-lg bg-muted/50 py-1.5">
            <p className="text-[10px] text-muted-foreground">Profitto</p>
            <p className={cn('text-sm font-bold', e.profit >= 0 ? 'text-profit' : 'text-loss')}>
              {formatEUR(e.profit, { sign: true, decimals: false })}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Mercato {formatEUR(e.market.mid, { decimals: false })} · ROI{' '}
            <b className={e.roi !== null && e.roi >= 0 ? 'text-profit' : 'text-loss'}>{formatPct(e.roi)}</b>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {e.sellTime.min}-{e.sellTime.max}g
          </span>
        </div>
        <div className="mt-4 flex gap-2 pt-1">
          {onAnalyze && (
            <Button variant="secondary" size="sm" className="flex-1" onClick={onAnalyze}>
              Dettagli
            </Button>
          )}
          {onAddToInventory && (
            <Button size="sm" className="flex-1" onClick={onAddToInventory}>
              <Plus /> L’ho comprato
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
