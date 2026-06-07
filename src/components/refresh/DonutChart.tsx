'use client';

import { useState } from 'react';
import {
  buildArcPath,
  defaultSeriesTones,
  formatShort,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';

export type DonutSlice = {
  id: string;
  label: string;
  value: number;
  tone?: ChartTone;
};

export type DonutChartProps = {
  slices: DonutSlice[];
  /** Pixel size of the SVG (square). Default 200. */
  size?: number;
  /** Inner radius as a fraction of outer radius. 0 = pie, 0.5 = donut, 0.7 = thin ring. Default 0.65. */
  inner?: number;
  /** Show total + label in the center. */
  centerLabel?: React.ReactNode;
  centerValue?: React.ReactNode;
  /** Custom value formatter for the auto-derived center total. Used only if `centerValue` is omitted. */
  formatTotal?: (n: number) => string;
  ariaLabel?: string;
  className?: string;
};

/**
 * Donut/pie chart. Use for breakdowns where the parts sum to a meaningful
 * whole — payment method split, category share. Slices are tone-tinted via
 * the standard palette.
 *
 * @example
 *   <DonutChart
 *     slices={[
 *       { id: 'cash', label: 'Cash',   value: 2180, tone: 'sage' },
 *       { id: 'card', label: 'Card',   value: 5820, tone: 'lavender' },
 *       { id: 'wal',  label: 'Wallet', value: 640,  tone: 'blue' },
 *     ]}
 *     centerLabel="Total"
 *   />
 */
export function DonutChart({
  slices,
  size = 200,
  inner = 0.65,
  centerLabel,
  centerValue,
  formatTotal = formatShort,
  ariaLabel,
  className = '',
}: DonutChartProps) {
  const [hover, setHover] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const innerR = outerR * inner;

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  // Build arcs.
  let angle = -Math.PI / 2; // start at 12 o'clock
  const arcs = slices.map((s, i) => {
    const tone = s.tone ?? defaultSeriesTones[i % defaultSeriesTones.length];
    const sweep = (s.value / total) * Math.PI * 2;
    const end = angle + sweep;
    const path = buildArcPath(cx, cy, outerR, innerR, angle, end);
    angle = end;
    return { ...s, tone, path };
  });

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        role="img"
        aria-label={ariaLabel ?? 'Donut chart'}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {arcs.map((a) => (
          <path
            key={a.id}
            d={a.path}
            fill={toneStrokeMap[a.tone]}
            opacity={hover && hover !== a.id ? 0.45 : 1}
            onMouseEnter={() => setHover(a.id)}
            onMouseLeave={() => setHover(null)}
            style={{ transition: 'opacity 120ms', cursor: 'pointer' }}
          >
            <title>{`${a.label}: ${formatTotal(a.value)}`}</title>
          </path>
        ))}
      </svg>
      {/* Center label / value — outside SVG so we can use real HTML/typography. */}
      {(centerLabel || centerValue || total > 0) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
              {centerLabel}
            </p>
          )}
          <p className="text-2xl font-bold text-refresh-text tabular-nums">
            {centerValue ?? formatTotal(total)}
          </p>
        </div>
      )}
    </div>
  );
}
