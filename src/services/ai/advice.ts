import type { BusinessKpis } from '@/lib/domain/analytics';
import type { InventoryHealth } from '@/lib/domain/stock';
import type { Niche } from '@/lib/domain/types';

export interface ResellingAdvice {
  title: string;
  body: string;
  guideSlug: string;
}

/**
 * generateResellingAdvice(): picks the most useful next lesson for the user based on their numbers.
 * Deterministic and offline; an LLM can rephrase it but the selection logic stays here.
 */
export function generateResellingAdvice(ctx: {
  kpis?: BusinessKpis;
  health?: InventoryHealth;
  niche?: Niche | null;
  targetRoi?: number;
}): ResellingAdvice {
  const { kpis, health, targetRoi = 100 } = ctx;
  if (!kpis || kpis.itemsBought === 0) {
    return {
      title: 'Parti con poco e misura tutto',
      body: 'Compra 3-5 capi di brand che conosci, con un ROI stimato sopra il 100%. Registra ogni acquisto: i dati ti diranno cosa funziona.',
      guideSlug: 'come-capire-se-un-capo-e-un-buon-affare',
    };
  }
  if (health && health.old > 0) {
    return {
      title: 'Libera il capitale fermo',
      body: `Hai ${health.old} articoli fermi da oltre 60 giorni. Un ribasso del 10-15% o un bundle spesso li vende in una settimana: meglio un profitto piccolo che capitale bloccato.`,
      guideSlug: 'come-gestire-articoli-invenduti',
    };
  }
  if (kpis.avgRoi < targetRoi) {
    return {
      title: 'Il guadagno si fa quando compri',
      body: `Il tuo ROI medio (${Math.round(kpis.avgRoi)}%) è sotto il tuo obiettivo (${targetRoi}%). Prima di comprare controlla sempre il prezzo massimo consigliato e tratta.`,
      guideSlug: 'come-aumentare-il-margine',
    };
  }
  if (kpis.avgDaysToSell > 21) {
    return {
      title: 'Accorcia i tempi di vendita',
      body: `Vendi in media in ${Math.round(kpis.avgDaysToSell)} giorni. Foto con luce naturale, titoli con brand + modello + taglia e un prezzo allineato al mercato riducono i tempi.`,
      guideSlug: 'come-fare-fotografie-che-vendono',
    };
  }
  if (kpis.sellThroughRate < 50) {
    return {
      title: 'Compra meno, scegli meglio',
      body: 'Meno della metà di quello che compri è già venduto. Concentrati sui brand e le categorie che nelle tue analytics hanno il ROI più alto.',
      guideSlug: '10-errori-dei-nuovi-reseller',
    };
  }
  return {
    title: 'Scala ciò che funziona',
    body: 'I tuoi numeri sono sani. Aumenta gradualmente il budget sui brand top e prova a testare un prezzo più alto (+10%) sui capi che vendono in meno di una settimana.',
    guideSlug: 'come-scegliere-il-prezzo',
  };
}
