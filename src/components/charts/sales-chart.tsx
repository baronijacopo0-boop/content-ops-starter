'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MonthPoint } from '@/lib/domain/analytics';
import { formatEUR } from '@/lib/format';
import { axisProps, CHART, ChartTooltip } from './chart-kit';

type Metric = 'sold' | 'revenue' | 'profit';
const METRICS: { value: Metric; label: string; color: string }[] = [
  { value: 'sold', label: 'Articoli venduti', color: CHART.revenue },
  { value: 'revenue', label: 'Ricavi', color: CHART.revenue },
  { value: 'profit', label: 'Profitto', color: CHART.profit },
];

/** Monthly sales – one measure at a time (no dual axis): items sold, revenue or profit. */
export function SalesChart({
  data,
  title = 'Vendite mensili',
  description = 'Scegli cosa visualizzare per ogni mese.',
  metrics = ['sold', 'revenue', 'profit'],
}: {
  data: MonthPoint[];
  title?: string;
  description?: string;
  metrics?: Metric[];
}) {
  const [metric, setMetric] = useState<Metric>(metrics[0]);
  const available = METRICS.filter((x) => metrics.includes(x.value));
  const m = METRICS.find((x) => x.value === metric)!;
  const fmt = (v: number) => (metric === 'sold' ? `${v} articoli` : formatEUR(v));
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {available.length > 1 && (
          <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <TabsList>
              {available.map((x) => (
                <TabsTrigger key={x.value} value={x.value}>
                  {x.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis
                {...axisProps}
                width={52}
                allowDecimals={false}
                tickFormatter={(v) => (metric === 'sold' ? String(v) : `€${v}`)}
              />
              <Tooltip
                cursor={{ fill: 'hsl(240 4% 15% / 0.5)' }}
                content={(p) => (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload}
                    label={p.label}
                    format={(v) => fmt(v)}
                  />
                )}
              />
              <Bar dataKey={metric} name={m.label} radius={[4, 4, 0, 0]} maxBarSize={36}>
                {data.map((d) => (
                  <Cell key={d.key} fill={metric === 'profit' && d.profit < 0 ? CHART.loss : m.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
