import type { AppNotification, Watchlist } from '@/lib/domain/types';
import { matchWatchlist, type EvaluatedDeal } from '@/lib/deals/filter';

/**
 * Notification pipeline (prepared for future channels).
 * Today: in-app notifications stored in the `notifications` table.
 * Future: implement NotificationChannel for email (Supabase SMTP / Resend), Web Push or Telegram and
 * run `checkWatchlists` on a schedule (Supabase Cron + Edge Function, or a Hostinger cron job) with
 * real marketplace data from an authorized provider.
 */
export interface NotificationChannel {
  id: 'in_app' | 'email' | 'push' | 'telegram';
  send(
    userId: string,
    notification: Pick<AppNotification, 'type' | 'title' | 'body' | 'data'>,
  ): Promise<void>;
}

export interface WatchlistMatchEvent {
  watchlist: Watchlist;
  matches: EvaluatedDeal[];
}

export function checkWatchlists(deals: EvaluatedDeal[], watchlists: Watchlist[]): WatchlistMatchEvent[] {
  return watchlists
    .filter((w) => w.isActive)
    .map((w) => ({ watchlist: w, matches: matchWatchlist(deals, w) }))
    .filter((e) => e.matches.length > 0);
}

export function buildMatchNotification(
  e: WatchlistMatchEvent,
): Pick<AppNotification, 'type' | 'title' | 'body' | 'data'> {
  const best = e.matches[0];
  const hot = best.evaluation.badge === 'hot';
  return {
    type: hot ? 'hot_deal' : 'watchlist_match',
    title: hot ? 'Nuovo Hot Deal trovato' : `Nuovi match per “${e.watchlist.name}”`,
    body: `${best.item.title} a €${best.item.price} – Deal Score ${best.evaluation.dealScore}${e.matches.length > 1 ? ` (+${e.matches.length - 1} altri)` : ''}.`,
    data: { watchlistId: e.watchlist.id, dealId: best.item.id },
  };
}
