'use client';

import { useState } from 'react';
import {
  StripePattern,
  defaultSeriesTones,
  formatShort,
  niceMax,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';
import { ChartTooltip } from './ChartTooltip';

export type BarPattern = 'solid' | 'stripe';

export type BarSeries = {
  id: string;
  label: string;
  data: number[];
  tone?: ChartTone;
  /** Bar fill style. Default 'solid'. 'stripe' uses a diagonal hatch pattern. */
  pattern?: BarPattern;
};

export type BarChartProps = {
  labels: string[];
  series: BarSeries[];
  /**
   * Optional "ghost" series rendered above each solid bar at half-opacity —
   * useful for "vs last period" or "vs target" comparisons. The screenshot's
   * striped tops are an instance of this.
   *
   * Each comparison series should match a real series by `id` so the bars
   * align — the comparison value is rendered as a slim ghost bar starting
   * at the top of the matching solid bar.
   */
  comparisonSeries?: BarSeries[];
  height?: number;
  yTicks?: number;
  formatY?: (n: number) => string;
  formatValue?: (n: number) => string;
  /** When multiple series are passed, lay them out side-by-side per category (default true). Stacked layout: see `<StackedBar>`. */
  grouped?: boolean;
  hideAxis?: boolean;
  ariaLabel?: string;
  className?: string;
};

const CHART_W = 600;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;

/**
 * Vertical bar chart. Single-series renders one bar per category; multi-series
 * with `grouped` (default) renders side-by-side bars per category. For
 * stacked-by-category layouts use `<StackedBar>` instead.
 */
export function BarChart({
  labels,
  series,
  comparisonSeries,
  height = 240,
  yTicks = 4,
  formatY = formatShort,
  formatValue = formatShort,
  grouped = true,
  hideAxis = false,
  ariaLabel,
  className = '',
}: BarChartProps) {
  const [hover, setHover] = useState<{ category: number; series: number } | null>(null);

  const W = CHART_W;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;

  // Comparison values feed into the y-axis max so the ghost bars don't clip.
  const allValues = [
    ...series.flatMap((s) => s.data),
    ...(comparisonSeries?.flatMap((s) => s.data) ?? []),
  ];
  const dataMax = Math.max(...allValues, 0);
  const yMax = niceMax(dataMax || 1);

  // Match comparison series to their solid counterparts by id (so ghost bars
  // sit above the right solid bar). Falls back to index alignment when no id match.
  const compareById = new Map(comparisonSeries?.map((c) => [c.id, c]) ?? []);

  // Unique pattern ids for any series flagged `pattern: 'stripe'` plus all
  // comparison series (which always render with a stripe).
  const patterns: { id: string; tone: ChartTone }[] = [];
  series.forEach((s, i) => {
    if (s.pattern === 'stripe') {
      const tone = s.tone ?? defaultSeriesTones[i % defaultSeriesTones.length];
      patterns.push({ id: `bar-stripe-${s.id}`, tone });
    }
  });
  comparisonSeries?.forEach((s, i) => {
    const tone = s.tone ?? defaultSeriesTones[i % defaultSeriesTones.length];
    patterns.push({ id: `bar-compare-${s.id}`, tone });
  });

  const N = labels.length;
  const groupW = innerW / N;
  const groupPad = groupW * 0.18;
  const innerGroupW = groupW - groupPad * 2;
  const seriesCount = grouped ? series.length : 1;
  const barW = innerGroupW / seriesCount;

  const yAt = (v: number) => PAD_TOP + innerH - (v / yMax) * innerH;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (yMax * i) / yTicks);

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? 'Bar chart'}
      viewBox={`0 0 ${W} ${height}`}
      className={`w-full ${className}`}
      preserveAspectRatio="none"
      onMouseLeave={() => setHover(null)}
      style={{ height }}
    >
      {/* Pattern defs — diagonal stripes for any series flagged `pattern: 'stripe'`
          and all comparison-series ghost bars. */}
      {patterns.length > 0 && (
        <defs>
          {patterns.map((p) => (
            <StripePattern
              key={p.id}
              id={p.id}
              color={toneStrokeMap[p.tone]}
              strokeWidth={2}
              spacing={6}
            />
          ))}
        </defs>
      )}

      {/* Y grid + labels */}
      {!hideAxis &&
        ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line
                x1={PAD_LEFT}
                x2={W - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="rgb(var(--refresh-line))"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill="rgb(var(--refresh-muted-2))"
              >
                {formatY(t)}
              </text>
            </g>
          );
        })}

      {/* X labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={PAD_LEFT + groupW * i + groupW / 2}
          y={height - 8}
          textAnchor="middle"
          fontSize="10"
          fill="rgb(var(--refresh-muted-2))"
        >
          {l}
        </text>
      ))}

      {/* Bars */}
      {labels.map((_, ci) => (
        <g key={ci} transform={`translate(${PAD_LEFT + groupW * ci + groupPad}, 0)`}>
          {series.map((s, si) => {
            const tone = s.tone ?? defaultSeriesTones[si % defaultSeriesTones.length];
            const v = s.data[ci] ?? 0;
            const y = yAt(v);
            const h = innerH - (y - PAD_TOP);
            const x = grouped ? barW * si : 0;
            const isHover =
              hover?.category === ci && hover.series === si;
            const fill =
              s.pattern === 'stripe'
                ? `url(#bar-stripe-${s.id})`
                : toneStrokeMap[tone];

            // Ghost (comparison) bar — sits on top of the solid bar at half-opacity.
            const compare = compareById.get(s.id);
            const compareV = compare?.data[ci] ?? 0;
            const compareY = compareV > 0 ? yAt(compareV) : 0;
            const compareH = compareV > 0 ? Math.max(0, y - compareY) : 0;

            return (
              <g key={s.id}>
                {compare && compareH > 0 && (
                  <rect
                    x={x + 1}
                    y={compareY}
                    width={Math.max(0, barW - 2)}
                    height={compareH}
                    rx={2}
                    fill={`url(#bar-compare-${compare.id})`}
                    opacity={0.6}
                  />
                )}
                <rect
                  x={x + 1}
                  y={y}
                  width={Math.max(0, barW - 2)}
                  height={Math.max(0, h)}
                  rx={2}
                  fill={fill}
                  opacity={hover && !isHover ? 0.55 : 1}
                  onMouseEnter={() => setHover({ category: ci, series: si })}
                  style={{ transition: 'opacity 120ms' }}
                />
              </g>
            );
          })}
        </g>
      ))}

      {/* Tooltip */}
      {hover &&
        (() => {
          const s = series[hover.series];
          const tone = s.tone ?? defaultSeriesTones[hover.series % defaultSeriesTones.length];
          const v = s.data[hover.category] ?? 0;
          const x = PAD_LEFT + groupW * hover.category + groupW / 2;
          return (
            <ChartTooltip
              x={x}
              y={yAt(v)}
              title={labels[hover.category]}
              rows={[{ label: s.label, value: formatValue(v), tone }]}
              containerWidth={W}
            />
          );
        })()}
    </svg>
  );
}
