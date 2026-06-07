'use client';

import { useState } from 'react';
import {
  defaultSeriesTones,
  formatShort,
  niceMax,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';
import { ChartTooltip, type ChartTooltipRow } from './ChartTooltip';

export type StackedSeries = {
  id: string;
  label: string;
  data: number[];
  tone?: ChartTone;
};

export type StackedBarProps = {
  labels: string[];
  series: StackedSeries[];
  height?: number;
  yTicks?: number;
  formatY?: (n: number) => string;
  formatValue?: (n: number) => string;
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
 * Stacked vertical bars — series accumulate per category. Use for breakdown
 * over time (sales by category per day, refunds-vs-sales side-by-side).
 */
export function StackedBar({
  labels,
  series,
  height = 240,
  yTicks = 4,
  formatY = formatShort,
  formatValue = formatShort,
  hideAxis = false,
  ariaLabel,
  className = '',
}: StackedBarProps) {
  const [hover, setHover] = useState<number | null>(null);

  const W = CHART_W;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;

  // Per-category total = stack height.
  const N = labels.length;
  const totals = labels.map((_, ci) =>
    series.reduce((sum, s) => sum + (s.data[ci] ?? 0), 0)
  );
  const yMax = niceMax(Math.max(...totals, 1));

  const groupW = innerW / N;
  const barPad = groupW * 0.22;
  const barW = groupW - barPad * 2;

  const yAt = (v: number) => PAD_TOP + innerH - (v / yMax) * innerH;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (yMax * i) / yTicks);

  const tooltipRows: ChartTooltipRow[] | null =
    hover != null
      ? series.map((s, si) => ({
          label: s.label,
          value: formatValue(s.data[hover] ?? 0),
          tone: s.tone ?? defaultSeriesTones[si % defaultSeriesTones.length],
        }))
      : null;

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? 'Stacked bar chart'}
      viewBox={`0 0 ${W} ${height}`}
      className={`w-full ${className}`}
      preserveAspectRatio="none"
      onMouseLeave={() => setHover(null)}
      style={{ height }}
    >
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

      {/* Stacks */}
      {labels.map((_, ci) => {
        let runningY = PAD_TOP + innerH;
        return (
          <g
            key={ci}
            transform={`translate(${PAD_LEFT + groupW * ci + barPad}, 0)`}
            onMouseEnter={() => setHover(ci)}
          >
            {series.map((s, si) => {
              const tone =
                s.tone ?? defaultSeriesTones[si % defaultSeriesTones.length];
              const v = s.data[ci] ?? 0;
              const segH = (v / yMax) * innerH;
              const y = runningY - segH;
              runningY = y;
              return (
                <rect
                  key={s.id}
                  x={0}
                  y={y}
                  width={barW}
                  height={Math.max(0, segH)}
                  rx={si === series.length - 1 ? 2 : 0}
                  fill={toneStrokeMap[tone]}
                  opacity={hover != null && hover !== ci ? 0.55 : 1}
                  style={{ transition: 'opacity 120ms' }}
                />
              );
            })}
          </g>
        );
      })}

      {hover != null && tooltipRows && (
        <ChartTooltip
          x={PAD_LEFT + groupW * hover + groupW / 2}
          y={yAt(totals[hover])}
          title={labels[hover]}
          rows={tooltipRows}
          containerWidth={W}
        />
      )}
    </svg>
  );
}
