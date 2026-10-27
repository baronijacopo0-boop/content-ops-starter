import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupStats } from '@/lib/domain/analytics';
import { formatDays, formatEUR, formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Brand ranking table: sales, ROI, total profit, average days to sell. */
export function BrandAnalytics({
  title,
  description,
  rows,
  emptyText = 'Nessuna vendita ancora.',
}: {
  title: string;
  description?: string;
  rows: GroupStats[];
  emptyText?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0 sm:px-0">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2 font-medium">Brand</th>
                  <th className="px-2 py-2 text-right font-medium">Vendite</th>
                  <th className="px-2 py-2 text-right font-medium">ROI</th>
                  <th className="px-2 py-2 text-right font-medium">Profitto</th>
                  <th className="px-5 py-2 text-right font-medium">Tempo medio</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.key} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-2.5 font-medium">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground">
                        {i + 1}
                      </span>
                      {r.label}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{r.sales}</td>
                    <td
                      className={cn(
                        'px-2 py-2.5 text-right font-semibold tabular-nums',
                        r.roi >= 0 ? 'text-profit' : 'text-loss',
                      )}
                    >
                      {formatPct(r.roi)}
                    </td>
                    <td className={cn('px-2 py-2.5 text-right tabular-nums', r.profit < 0 && 'text-loss')}>
                      {formatEUR(r.profit)}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatDays(r.avgDaysToSell)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
