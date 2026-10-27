import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTip } from '@/components/ui/tooltip';
import type { InventoryHealth as Health } from '@/lib/domain/stock';
import { formatEUR } from '@/lib/format';

/** Inventory Health: healthy vs slow-moving vs old stock + capital locked in slow items. */
export function InventoryHealth({ health }: { health: Health }) {
  const segments = [
    { label: 'Sani (0-30g)', value: health.healthy, cls: 'bg-profit' },
    { label: 'Slow (31-60g)', value: health.slow, cls: 'bg-warning' },
    { label: 'Old stock (60g+)', value: health.old, cls: 'bg-loss' },
  ];
  const total = Math.max(1, health.total);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" /> Inventory Health
          </CardTitle>
          <CardDescription>{health.total} articoli invenduti</CardDescription>
        </div>
        <InfoTip>
          Più un capo resta invenduto, più capitale tieni bloccato. Oltre i 60 giorni conviene ribassare o
          fare bundle.
        </InfoTip>
      </CardHeader>
      <CardContent>
        <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
          {segments.map((s) =>
            s.value ? (
              <div key={s.label} className={s.cls} style={{ width: `${(s.value / total) * 100}%` }} />
            ) : null,
          )}
        </div>
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {segments.map((s) => (
            <li key={s.label} className="rounded-xl bg-muted/40 p-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${s.cls}`} />
                {s.label}
              </span>
              <span className="mt-1 block text-lg font-bold tabular-nums">{s.value}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-warning/20 bg-warning/5 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Valore bloccato (slow + old)</span>
          <span className="font-bold text-warning">{formatEUR(health.lockedValue)}</span>
        </div>
        {health.old > 0 && (
          <Link
            href="/inventory?age=old"
            className="mt-3 block text-xs font-medium text-primary hover:underline"
          >
            Vedi gli articoli old stock →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
