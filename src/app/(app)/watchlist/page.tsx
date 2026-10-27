'use client';

import { useMemo, useState } from 'react';
import { BellRing, Bookmark, Plus, Radar } from 'lucide-react';
import { toast } from 'sonner';
import { CardGridSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/shared/states';
import { WatchlistCard } from '@/components/shared/watchlist-card';
import { WatchlistDialog } from '@/components/shared/watchlist-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/components/providers/app-provider';
import { useRevalidate, useWatchlists } from '@/hooks/use-data';
import { useDealFeed } from '@/hooks/use-deal-feed';
import { matchWatchlist } from '@/lib/deals/filter';
import type { Watchlist } from '@/lib/domain/types';
import { buildMatchNotification, checkWatchlists } from '@/lib/notifications';

export default function WatchlistPage() {
  const { repo } = useApp();
  const { data: watchlists, error, isLoading, mutate } = useWatchlists();
  const { data: deals } = useDealFeed();
  const revalidate = useRevalidate();
  const [editing, setEditing] = useState<Watchlist | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Watchlist | null>(null);
  const [checking, setChecking] = useState(false);

  const matches = useMemo(
    () => Object.fromEntries((watchlists ?? []).map((w) => [w.id, deals ? matchWatchlist(deals, w) : []])),
    [watchlists, deals],
  );

  async function toggle(w: Watchlist, patch: Partial<Watchlist>) {
    if (!repo) return;
    try {
      await mutate(
        async (current) => {
          const updated = await repo.updateWatchlist(w.id, patch);
          return (current ?? []).map((x) => (x.id === w.id ? updated : x));
        },
        {
          optimisticData: (current) => (current ?? []).map((x) => (x.id === w.id ? { ...x, ...patch } : x)),
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore');
    }
  }

  async function runCheck() {
    if (!repo || !deals || !watchlists) return;
    setChecking(true);
    try {
      const events = checkWatchlists(
        deals,
        watchlists.filter((w) => w.notify),
      );
      for (const e of events) await repo.createNotification(buildMatchNotification(e));
      await revalidate('notifications');
      toast.success(
        events.length
          ? `${events.length} watchlist con nuovi match: controlla le notifiche 🔔`
          : 'Nessun nuovo match per ora.',
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore');
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Watchlist"
        description="Ricerche salvate che FLIP AI tiene d’occhio per te."
        actions={
          <>
            <Button variant="outline" onClick={runCheck} loading={checking} disabled={!watchlists?.length}>
              <Radar /> Controlla ora
            </Button>
            <Button onClick={() => setEditing(null)}>
              <Plus /> Nuova watchlist
            </Button>
          </>
        }
      />

      <Card className="mb-4 border-info/20 bg-info/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p className="text-muted-foreground">
            <b className="text-foreground">Notifiche automatiche in arrivo.</b> Oggi le watchlist confrontano
            le occasioni demo e generano notifiche in-app con “Controlla ora”. Il sistema è predisposto per
            controlli programmati ed email/push quando sarà collegata una fonte dati autorizzata.
          </p>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !watchlists ? (
        <CardGridSkeleton count={3} />
      ) : watchlists.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nessuna watchlist"
          description="Esempi: “Nike Vintage < €15”, “Carhartt Jacket < €30”. Ti mostreremo subito le occasioni che corrispondono."
          action={
            <Button onClick={() => setEditing(null)}>
              <Plus /> Crea la prima watchlist
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {watchlists.map((w) => (
            <WatchlistCard
              key={w.id}
              watchlist={w}
              matches={matches[w.id] ?? []}
              onEdit={() => setEditing(w)}
              onDelete={() => setDeleting(w)}
              onToggle={(p) => toggle(w, p)}
            />
          ))}
        </div>
      )}

      {editing !== undefined && (
        <WatchlistDialog
          key={editing?.id ?? 'new'}
          open
          onOpenChange={(o) => !o && setEditing(undefined)}
          watchlist={editing}
          onSave={async (input) => {
            if (!repo) return;
            try {
              if (editing) await repo.updateWatchlist(editing.id, input);
              else await repo.createWatchlist(input);
              await revalidate('watchlists');
              toast.success(editing ? 'Watchlist aggiornata' : 'Watchlist creata');
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Errore');
              throw e;
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Eliminare la watchlist?"
        description={`“${deleting?.name}” non verrà più monitorata.`}
        onConfirm={async () => {
          if (!repo || !deleting) return;
          try {
            await repo.deleteWatchlist(deleting.id);
            await revalidate('watchlists');
            toast.success('Watchlist eliminata');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Errore');
          }
        }}
      />
    </>
  );
}
