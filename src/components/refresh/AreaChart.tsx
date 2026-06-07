'use client';

import { useState } from 'react';
import {
  buildAreaPath,
  buildLinePath,
  buildSmoothPath,
  defaultSeriesTones,
  formatShort,
  niceMax,
  scaleLinear,
  toneFillMap,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';
import { ChartTooltip, type ChartTooltipRow } from './ChartTooltip';

export type AreaSeries = {
  id: string;
  label: string;
  data: number[];
  tone?: ChartTone;
};

export type AreaChartProps = {
  labels: string[];
  series: AreaSeries[];
  height?: number;
  yTicks?: number;
  formatY?: (n: number) => string;
  formatValue?: (n: number) => string;
  smooth?: boolean;
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
 * Filled-line chart — same data shape as `LineChart` but each series renders
 * as a tone-tinted area below the line. Best for cumulative metrics or
 * single-series "shape" emphasis.
 */
export function AreaChart({
  labels,
  series,
  height = 240,
  yTicks = 4,
  formatY = formatShort,
  formatValue = formatShort,
  smooth = true,
  hideAxis = false,
  ariaLabel,
  className = '',
}: AreaChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const W = CHART_W;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;

  const allValues = series.flatMap((s) => s.data);
  const dataMax = Math.max(...allValues, 0);
  const yMax = niceMax(dataMax || 1);

  const N = labels.length;
  const xAt = (i: number) =>
    PAD_LEFT + scaleLinear(i, 0, Math.max(1, N - 1), 0, innerW);
  const yAt = (v: number) => PAD_TOP + innerH - (v / yMax) * innerH;
  const baselineY = PAD_TOP + innerH;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (yMax * i) / yTicks);

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
      ? series.map((s, si) => ({
          label: s.label,
          value: formatValue(s.data[hover] ?? 0),
          tone: s.tone ?? defaultSeriesTones[si % defaultSeriesTones.length],
        }))
      : null;

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? 'Area chart'}
      viewBox={`0 0 ${W} ${height}`}
      className={`w-full ${className}`}
      preserveAspectRatio="none"
      onMouseMove={handleMove}
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
          x={xAt(i)}
          y={height - 8}
          textAnchor="middle"
          fontSize="10"
          fill="rgb(var(--refresh-muted-2))"
        >
          {l}
        </text>
      ))}

      {hover != null && (
        <line
          x1={xAt(hover)}
          x2={xAt(hover)}
          y1={PAD_TOP}
          y2={baselineY}
          stroke="rgb(var(--refresh-muted-2) / 0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}

      {/* Areas — paint front-to-back so later series stack on top visually. */}
      {series.map((s, si) => {
        const tone = s.tone ?? defaultSeriesTones[si % defaultSeriesTones.length];
        const points = s.data.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
        const lineD = smooth ? buildSmoothPath(points) : buildLinePath(points);
        const areaD = buildAreaPath(points, baselineY, smooth);
        return (
          <g key={s.id}>
            <path d={areaD} fill={toneFillMap[tone]} />
            <path
              d={lineD}
              fill="none"
              stroke={toneStrokeMap[tone]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
