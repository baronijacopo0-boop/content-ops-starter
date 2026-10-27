'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { axisProps, CHART, ChartTooltip } from './chart-kit';

/** Horizontal single-series bar chart (ROI per brand, profit per category, days to sell...). Negative values turn red. */
export function BarListChart({
  title,
  description,
  data,
  format,
  color = CHART.profit,
  seriesName,
}: {
  title: string;
  description?: string;
  data: { label: string; value: number }[];
  format: (v: number) => string;
  color?: string;
  seriesName: string;
}) {
  const height = Math.max(160, data.length * 34 + 30);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Ancora nessun dato: registra qualche vendita.
          </p>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                barCategoryGap={8}
              >
                <CartesianGrid stroke={CHART.grid} horizontal={false} />
                <XAxis type="number" {...axisProps} tickFormatter={(v) => format(Number(v))} />
                <YAxis
                  type="category"
                  dataKey="label"
                  {...axisProps}
                  width={104}
                  tick={{ fill: 'hsl(0 0% 85%)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(240 4% 15% / 0.5)' }}
                  content={(p) => (
                    <ChartTooltip
                      active={p.active}
                      payload={p.payload}
                      label={p.label}
                      format={(v) => format(v)}
                    />
                  )}
                />
                <Bar dataKey="value" name={seriesName} radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {data.map((d) => (
                    <Cell key={d.label} fill={d.value < 0 ? CHART.loss : color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
