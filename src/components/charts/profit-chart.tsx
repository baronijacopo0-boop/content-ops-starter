'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profitSeries, RANGE_OPTIONS, type RangeKey } from '@/lib/domain/analytics';
import type { Sale } from '@/lib/domain/types';
import { formatEUR } from '@/lib/format';
import { sum } from '@/lib/utils';
import { axisProps, CHART, ChartTooltip } from './chart-kit';

/** Cumulative profit over the selected range (filters above the chart, crosshair tooltip). */
export function ProfitChart({ sales }: { sales: Sale[] }) {
  const [range, setRange] = useState<RangeKey>('30d');
  const data = useMemo(() => profitSeries(sales, range), [sales, range]);
  const total = sum(data.map((d) => d.profit));
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Profitto nel tempo</CardTitle>
          <CardDescription>
            <span className={total >= 0 ? 'font-semibold text-profit' : 'font-semibold text-loss'}>
              {formatEUR(total, { sign: true })}
            </span>{' '}
            nel periodo · somma cumulativa dei profitti netti
          </CardDescription>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <TabsList>
            {RANGE_OPTIONS.map((r) => (
              <TabsTrigger key={r.value} value={r.value}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div
          className="h-64"
          role="img"
          aria-label={`Profitto cumulativo ${formatEUR(total)} nel periodo selezionato`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.profit} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART.profit} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={24} />
              <YAxis {...axisProps} width={52} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                cursor={{ stroke: CHART.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
                content={(p) => (
                  <ChartTooltip
                    active={p.active}
                    payload={p.payload}
                    label={p.label}
                    format={(v) => formatEUR(v)}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Profitto cumulativo"
                stroke={CHART.profit}
                strokeWidth={2}
                fill="url(#profitFill)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(240 5% 8%)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
