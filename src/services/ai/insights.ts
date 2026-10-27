import type { InventoryItem, Sale, UserGoals } from '@/lib/domain/types';
import { brandStats, categoryStats, computeKpis, enrichSale } from '@/lib/domain/analytics';
import { inventoryHealth, stockAgeDays } from '@/lib/domain/stock';
import { DEFAULT_TARGET_ROI } from '@/lib/domain/constants';
import { formatEUR } from '@/lib/format';
import { average, round, sum } from '@/lib/utils';
import type { BusinessInsight } from './types';

/**
 * generateBusinessInsights(): rule-based insights computed from the user's own data.
 * Every number in the messages is derived from inventory/sales – nothing is invented.
 */
export function generateBusinessInsights(
  items: InventoryItem[],
  sales: Sale[],
  goals?: Partial<UserGoals>,
  now = new Date(),
): BusinessInsight[] {
  const out: BusinessInsight[] = [];
  const targetRoi = goals?.targetRoi ?? DEFAULT_TARGET_ROI;

  if (!sales.length && !items.length) {
    return [
      {
        id: 'start',
        tone: 'info',
        title: 'Inizia a tracciare',
        message:
          'Aggiungi i tuoi primi articoli in inventario: FLIP AI calcolerà profitti, ROI e tempi di vendita per te.',
        action: 'Vai su Inventario → Aggiungi articolo',
      },
    ];
  }

  const brands = brandStats(sales).filter((b) => b.sales >= 2);
  const enriched = sales.map(enrichSale);
  const avgDays = average(enriched.map((s) => s.daysToSell));

  // 1. Brand comparison (profit per sale)
  if (brands.length >= 2) {
    const byUnit = [...brands].sort((a, b) => b.profit / b.sales - a.profit / a.sales);
    const best = byUnit[0];
    const other = byUnit[1];
    const bestUnit = best.profit / best.sales;
    const otherUnit = other.profit / other.sales;
    if (otherUnit > 0 && bestUnit > otherUnit) {
      const pct = Math.round((bestUnit / otherUnit - 1) * 100);
      out.push({
        id: 'brand-compare',
        tone: 'profit',
        title: `${best.label} è il tuo brand migliore`,
        message: `Stai guadagnando il ${pct}% in più per articolo con ${best.label} rispetto a ${other.label} (${formatEUR(bestUnit)} vs ${formatEUR(otherUnit)} a vendita).`,
        action: `Dai priorità a ${best.label} nel Deal Finder e nelle watchlist.`,
      });
    }
  }

  // 2. Slow brand
  const slow = brands
    .filter((b) => b.avgDaysToSell > Math.max(avgDays * 1.4, 20))
    .sort((a, b) => b.avgDaysToSell - a.avgDaysToSell)[0];
  if (slow) {
    out.push({
      id: 'slow-brand',
      tone: 'warning',
      title: `${slow.label} vende lentamente`,
      message: `I tuoi articoli ${slow.label} stanno impiegando troppo tempo a vendere: ${Math.round(slow.avgDaysToSell)} giorni contro una media di ${Math.round(avgDays)}.`,
      action: 'Compra solo a prezzi più bassi o migliora foto e titoli per questo brand.',
    });
  }

  // 3. Category share of profit
  const cats = categoryStats(sales);
  const totalProfit = sum(enriched.map((s) => s.profit));
  if (cats.length && totalProfit > 0) {
    const top = cats[0];
    const share = Math.round((top.profit / totalProfit) * 100);
    if (share >= 25) {
      out.push({
        id: 'category-share',
        tone: 'info',
        title: `${top.label}: la tua categoria chiave`,
        message: `Le ${top.label.toLowerCase()} rappresentano il ${share}% del tuo profitto (${formatEUR(top.profit)}).`,
        action: `Cerca più ${top.label.toLowerCase()} nel Deal Finder: è dove hai più esperienza.`,
      });
    }
  }

  // 4. Locked capital in old stock
  const health = inventoryHealth(items, now);
  if (health.old > 0) {
    out.push({
      id: 'old-stock',
      tone: 'loss',
      title: 'Capitale bloccato',
      message: `Hai ${formatEUR(health.oldValue, { decimals: false })} bloccati in ${health.old} articoli invenduti da oltre 60 giorni.`,
      action: 'Abbassa il prezzo del 10-15% o crea un bundle per liberare capitale.',
    });
  } else if (health.slow > 0) {
    out.push({
      id: 'slow-stock',
      tone: 'warning',
      title: 'Articoli che rallentano',
      message: `${health.slow} articoli sono in inventario da 31-60 giorni (${formatEUR(health.lockedValue, { decimals: false })} di capitale).`,
      action: 'Rinnova le foto e valuta un piccolo ribasso prima che diventino old stock.',
    });
  }

  // 5. Buy price lever
  const kpis = computeKpis(items, sales);
  if (enriched.length >= 3) {
    const avgSell = average(enriched.map((s) => s.salePrice));
    const avgExtra = average(enriched.map((s) => s.extraCosts));
    const avgBuy = average(enriched.map((s) => s.purchasePrice));
    const targetBuy = (avgSell - avgExtra) / (1 + targetRoi / 100);
    if (kpis.avgRoi < targetRoi && avgBuy > targetBuy) {
      out.push({
        id: 'buy-lever',
        tone: 'warning',
        title: 'Leva sul prezzo di acquisto',
        message: `Per raggiungere il tuo ROI target del ${targetRoi}% dovresti abbassare il prezzo medio di acquisto di ${formatEUR(avgBuy - targetBuy)} (da ${formatEUR(avgBuy)} a ${formatEUR(targetBuy)}).`,
        action: 'Usa il "prezzo massimo consigliato" in Analizza prodotto prima di ogni acquisto.',
      });
    } else {
      const newMargin = avgSell > 0 ? ((avgSell - (avgBuy - 3) - avgExtra) / avgSell) * 100 : 0;
      out.push({
        id: 'margin-lever',
        tone: 'info',
        title: 'Margine migliorabile',
        message: `Potresti aumentare il margine dal ${Math.round(kpis.avgMargin)}% al ${Math.round(newMargin)}% abbassando il prezzo medio di acquisto di €3.`,
        action: 'Trattare anche solo 2-3€ su ogni acquisto fa una grande differenza nel tempo.',
      });
    }
  }

  // 6. Losing brand
  const losing = brandStats(sales).find((b) => b.profit < 0);
  if (losing) {
    out.push({
      id: 'losing-brand',
      tone: 'loss',
      title: `Stai perdendo con ${losing.label}`,
      message: `Con ${losing.label} sei in perdita di ${formatEUR(Math.abs(losing.profit))} su ${losing.sales} vendite.`,
      action: `Evita ${losing.label} finché non trovi prezzi di acquisto molto più bassi.`,
    });
  }

  // 7. Monthly goal progress
  if (goals?.monthlyGoal) {
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = round(sum(enriched.filter((s) => s.soldAt.startsWith(key)).map((s) => s.profit)));
    const pct = Math.round((month / goals.monthlyGoal) * 100);
    out.push({
      id: 'goal',
      tone: pct >= 100 ? 'profit' : pct >= 50 ? 'info' : 'warning',
      title: 'Obiettivo del mese',
      message: `Questo mese hai fatto ${formatEUR(month)} di profitto: sei al ${pct}% del tuo obiettivo di ${formatEUR(goals.monthlyGoal, { decimals: false })}.`,
      action:
        pct >= 100
          ? 'Obiettivo raggiunto! Valuta di alzarlo nel profilo.'
          : 'Pubblica gli articoli "Da pubblicare" per accelerare.',
    });
  }

  // 8. Unlisted items
  const unlisted = items.filter((i) => i.status === 'to_list' || i.status === 'to_photograph');
  if (unlisted.length) {
    const oldest = Math.max(...unlisted.map((i) => stockAgeDays(i, now)));
    out.push({
      id: 'unlisted',
      tone: 'warning',
      title: 'Articoli non pubblicati',
      message: `${unlisted.length} articoli non sono ancora online (il più vecchio da ${oldest} giorni): un capo non pubblicato non può vendere.`,
      action: 'Usa "Crea annuncio AI" per pubblicarli in pochi minuti.',
    });
  }

  return out;
}
