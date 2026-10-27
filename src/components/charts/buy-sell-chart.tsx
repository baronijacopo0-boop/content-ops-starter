'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupStats } from '@/lib/domain/analytics';
import { formatEUR } from '@/lib/format';
import { axisProps, CHART, ChartTooltip, LegendKey } from './chart-kit';

/** Average purchase vs sale price per category (two series, same € scale, legend always shown). */
export function BuySellChart({ data }: { data: GroupStats[] }) {
  const rows = data.map((d) => ({ label: d.label, buy: d.avgBuyPrice, sell: d.avgSellPrice }));
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Prezzo medio acquisto vs vendita</CardTitle>
          <CardDescription>
            Più è ampio lo spazio tra le due barre, più margine fai su quella categoria.
          </CardDescription>
        </div>
        <LegendKey
          items={[
            { label: 'Acquisto', color: CHART.revenue },
            { label: 'Vendita', color: CHART.profit },
          ]}
        />
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Ancora nessuna vendita registrata.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  {...axisProps}
                  interval={0}
                  tick={{ fill: CHART.axis, fontSize: 10 }}
                />
                <YAxis {...axisProps} width={48} tickFormatter={(v) => `€${v}`} />
                <Tooltip
                  cursor={{ fill: 'hsl(240 4% 15% / 0.5)' }}
                  content={(p) => (
                    <ChartTooltip
                      active={p.active}
                      payload={p.payload}
                      label={p.label}
                      format={(v) => formatEUR(v)}
                    />
                  )}
                />
                <Bar
                  dataKey="buy"
                  name="Acquisto medio"
                  fill={CHART.revenue}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="sell"
                  name="Vendita media"
                  fill={CHART.profit}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
