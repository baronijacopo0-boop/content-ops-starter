'use client';

/** Chart palette – validated for the dark surface (OKLCH lightness band, CVD separation, ≥3:1 contrast). */
export const CHART = {
  profit: '#17a865',
  revenue: '#5b8def',
  loss: '#e66767',
  grid: 'hsl(240 4% 15%)',
  axis: 'hsl(240 4% 58%)',
};

export const axisProps = {
  tick: { fill: CHART.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

type Row = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

/** Tooltip: value first (strong), series name second, short line key in the series colour. */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: readonly unknown[];
  label?: unknown;
  format?: (v: number, key?: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[140px] rounded-xl border bg-popover px-3 py-2 text-xs shadow-xl">
      {label !== undefined && label !== null && (
        <p className="mb-1.5 font-medium text-muted-foreground">{String(label)}</p>
      )}
      <ul className="flex flex-col gap-1">
        {(payload as Row[]).map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded-full" style={{ background: p.color }} />
            <span className="font-semibold tabular-nums text-foreground">
              {format ? format(Number(p.value), String(p.dataKey)) : p.value}
            </span>
            <span className="text-muted-foreground">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LegendKey({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
