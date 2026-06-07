'use client';

import { useState } from 'react';
import {
  buildLinePath,
  buildSmoothPath,
  defaultSeriesTones,
  formatShort,
  niceMax,
  scaleLinear,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';
import { ChartTooltip, type ChartTooltipRow } from './ChartTooltip';

export type LineSeries = {
  id: string;
  label: string;
  data: number[];
  tone?: ChartTone;
};

export type LineChartProps = {
  /** Category labels along the x-axis (one per data index). */
  labels: string[];
  series: LineSeries[];
  /** SVG height in pixels. Default 240. */
  height?: number;
  /** Number of horizontal grid lines. Default 4. */
  yTicks?: number;
  /** Custom y-axis label formatter. Default uses `formatShort`. */
  formatY?: (n: number) => string;
  /** Custom value formatter for the tooltip rows. */
  formatValue?: (n: number) => string;
  /** Force the y-axis baseline to 0. Default true. */
  startAtZero?: boolean;
  /** Smooth curve through points. Default true. */
  smooth?: boolean;
  /** Hide the y-axis grid + labels. Useful for compact dashboards. Default false. */
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
 * Multi-series line chart. Pure SVG, responsive via `viewBox`. Hover shows a
 * tooltip with every series' value at that x.
 *
 * @example
 *   <LineChart
 *     labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
 *     series={[
 *       { id: 'sales',   label: 'Sales',   data: [120, 165, 142, 198, 220, 280, 240] },
 *       { id: 'refunds', label: 'Refunds', data: [4, 6, 3, 9, 8, 12, 7], tone: 'pink' },
 *     ]}
 *   />
 */
export function LineChart({
  labels,
  series,
  height = 240,
  yTicks = 4,
  formatY = formatShort,
  formatValue = formatShort,
  startAtZero = true,
  smooth = true,
  hideAxis = false,
  ariaLabel,
  className = '',
}: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const W = CHART_W;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;

  // Y range across all series.
  const allValues = series.flatMap((s) => s.data);
  const dataMin = Math.min(...allValues, startAtZero ? 0 : Infinity);
  const dataMax = Math.max(...allValues, 0);
  const yMin = startAtZero ? 0 : dataMin;
  const yMax = niceMax(dataMax || 1);
  const range = yMax - yMin || 1;

  const N = labels.length;
  const xAt = (i: number) =>
    PAD_LEFT + scaleLinear(i, 0, Math.max(1, N - 1), 0, innerW);
  const yAt = (v: number) =>
    PAD_TOP + innerH - ((v - yMin) / range) * innerH;

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (range * i) / yTicks);

  // For pointer interaction — find nearest x index from mouse position.
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const xPx = xRatio * W;
    const dataX = ((xPx - PAD_LEFT) / innerW) * Math.max(1, N - 1);
    const idx = Math.max(0, Math.min(N - 1, Math.round(dataX)));
    setHover(idx);
  };

  const tooltipRows: ChartTooltipRow[] | null =
    hover != null
      ? series.map((s) => ({
          label: s.label,
          value: formatValue(s.data[hover] ?? 0),
          tone: s.tone ?? defaultSeriesTones[series.indexOf(s) % defaultSeriesTones.length],
        }))
      : null;

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? 'Line chart'}
      viewBox={`0 0 ${W} ${height}`}
      className={`w-full ${className}`}
      preserveAspectRatio="none"
      onMouseMove={handleMove}
      onMouseLeave={() => setHover(null)}
      style={{ height }}
    >
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
          x={xAt(i)}
          y={height - 8}
          textAnchor="middle"
          fontSize="10"
          fill="rgb(var(--refresh-muted-2))"
        >
          {l}
        </text>
      ))}

      {/* Hover guideline */}
      {hover != null && (
        <line
          x1={xAt(hover)}
          x2={xAt(hover)}
          y1={PAD_TOP}
          y2={height - PAD_BOTTOM}
          stroke="rgb(var(--refresh-muted-2) / 0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}

      {/* Series */}
      {series.map((s, si) => {
        const tone = s.tone ?? defaultSeriesTones[si % defaultSeriesTones.length];
        const points = s.data.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
        const d = smooth ? buildSmoothPath(points) : buildLinePath(points);
        return (
          <g key={s.id}>
            <path
              d={d}
              fill="none"
              stroke={toneStrokeMap[tone]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition:
                  'd 450ms cubic-bezier(0.4, 0, 0.2, 1), stroke 250ms ease-out',
              }}
            />
            {hover != null && points[hover] && (
              <circle
                cx={points[hover].x}
                cy={points[hover].y}
                r="4"
                fill={toneStrokeMap[tone]}
                stroke="rgb(var(--refresh-bg))"
                strokeWidth="2"
              />
            )}
          </g>
        );
      })}

      {/* Tooltip */}
      {hover != null && tooltipRows && (
        <ChartTooltip
          x={xAt(hover)}
          y={yAt(yMax)}
          title={labels[hover]}
          rows={tooltipRows}
          containerWidth={W}
        />
      )}
    </svg>
  );
}
