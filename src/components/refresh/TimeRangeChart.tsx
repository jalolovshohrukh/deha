'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  buildSmoothPath,
  formatShort,
  niceMax,
  scaleLinear,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';
import { ChartTooltip } from './ChartTooltip';
import { RangeSlider } from './RangeSlider';

export type TimePoint = {
  label: string;
  value: number;
};

export type TimeRangeChartProps = {
  /** Optional title rendered in the top-left of the header. */
  title?: ReactNode;
  /** Full series — chart slices it via `range`. */
  data: TimePoint[];
  /** Selected range as `[startIdx, endIdx]` into `data` (inclusive on both ends). */
  range: [number, number];
  /** Called when the user drags the slider thumbs. */
  onRangeChange: (next: [number, number]) => void;

  /**
   * When provided, renders an OS-native styled "Detailing: <label> ▾" pill in
   * the top-right. Use the `actions` slot instead for custom controls.
   */
  detailing?: {
    label?: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (next: string) => void;
  };
  /** Right-side slot — replaces the auto detailing pill if both are passed. */
  actions?: ReactNode;

  /** Single-tone stroke. When set, suppresses the gradient. */
  tone?: ChartTone;
  /** Override the default lavender→blue gradient. Ignored if `tone` is set. */
  gradient?: { from: ChartTone; to: ChartTone };

  /** Chart-area height in pixels. Default 240. */
  height?: number;
  /** Hide the bottom range slider. Default false. */
  showSlider?: boolean;
  /** Y-axis label formatter. Default uses `formatShort`. */
  formatY?: (n: number) => string;
  /** Tooltip value formatter. Default uses `formatShort`. */
  formatValue?: (n: number) => string;
  className?: string;
};

const CHART_VW = 600;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;

/**
 * Single-series line chart with a built-in dual-thumb range slider for time-
 * range zoom. Optionally renders a "Detailing: by month ▾" dropdown pill in
 * the header for switching aggregation level.
 *
 * The chart redraws to show only the data slice between `range[0]..range[1]`;
 * the y-axis re-scales to the visible window. Stroke defaults to a lavender→
 * blue SVG gradient (matches the dashboard look in the user-shared screenshot);
 * pass `tone` for a single-tone solid stroke instead.
 *
 * @example
 *   const [range, setRange] = useState<[number, number]>([0, data.length - 1]);
 *   const [detailing, setDetailing] = useState('month');
 *
 *   <TimeRangeChart
 *     title="Sales"
 *     data={data}
 *     range={range}
 *     onRangeChange={setRange}
 *     detailing={{
 *       value: detailing,
 *       options: [
 *         { value: 'day',   label: 'by day' },
 *         { value: 'week',  label: 'by week' },
 *         { value: 'month', label: 'by month' },
 *       ],
 *       onChange: setDetailing,
 *     }}
 *   />
 */
export function TimeRangeChart({
  title,
  data,
  range,
  onRangeChange,
  detailing,
  actions,
  tone,
  gradient = { from: 'lavender', to: 'blue' },
  height = 240,
  showSlider = true,
  formatY = formatShort,
  formatValue = formatShort,
  className = '',
}: TimeRangeChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();

  // Clamp the range to data bounds so a stale `range` from a prior dataset
  // doesn't blow up the slice.
  const [r0, r1] = [
    Math.max(0, Math.min(data.length - 1, range[0])),
    Math.max(0, Math.min(data.length - 1, range[1])),
  ];
  const startIdx = Math.min(r0, r1);
  const endIdx = Math.max(r0, r1);

  const visible = data.slice(startIdx, endIdx + 1);
  const W = CHART_VW;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;

  // Y range across the VISIBLE slice only (so zooming into a flat region rescales).
  const values = visible.map((p) => p.value);
  const dataMax = values.length ? Math.max(...values) : 1;
  const dataMin = values.length ? Math.min(...values) : 0;
  // Anchor at zero when the slice contains positive values that don't dip too far below;
  // otherwise use data min so a small flat region still visualizes nicely.
  const yMin = dataMin >= 0 ? 0 : dataMin;
  const yMax = niceMax(Math.max(dataMax, yMin + 1));
  const range01 = yMax - yMin || 1;

  const N = visible.length;
  const xAt = (i: number) =>
    PAD_LEFT + scaleLinear(i, 0, Math.max(1, N - 1), 0, innerW);
  const yAt = (v: number) => PAD_TOP + innerH - ((v - yMin) / range01) * innerH;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (range01 * i) / yTicks);

  const points = visible.map((p, i) => ({ x: xAt(i), y: yAt(p.value) }));
  const linePath = buildSmoothPath(points);

  const strokeRef = tone ? toneStrokeMap[tone] : `url(#${gradId})`;

  // Pointer → nearest data index for hover.
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (N === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const xPx = xRatio * W;
    const dataX = ((xPx - PAD_LEFT) / innerW) * Math.max(1, N - 1);
    const idx = Math.max(0, Math.min(N - 1, Math.round(dataX)));
    setHover(idx);
  };

  // First / last x labels — keep things sparse so they don't collide on small ranges.
  const firstLabel = visible[0]?.label;
  const lastLabel = visible[visible.length - 1]?.label;

  const headerActions =
    actions ?? (detailing ? <DetailingPill {...detailing} /> : null);

  return (
    <div
      className={`rounded-2xl border border-refresh-line bg-refresh-surface-2 p-5 sm:p-6 ${className}`}
    >
      {(title || headerActions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          {title && (
            <h3 className="text-2xl font-bold text-refresh-text">{title}</h3>
          )}
          {headerActions && <div className="shrink-0">{headerActions}</div>}
        </header>
      )}

      <svg
        role="img"
        aria-label={typeof title === 'string' ? `${title} chart` : 'Chart'}
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        style={{ height, width: '100%', display: 'block' }}
      >
        {!tone && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={toneStrokeMap[gradient.from]} />
              <stop offset="100%" stopColor={toneStrokeMap[gradient.to]} />
            </linearGradient>
          </defs>
        )}

        {/* Y grid + labels */}
        {ticks.map((t, i) => {
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

        {/* X labels — first + last only (matches screenshot) */}
        {firstLabel && (
          <text
            x={PAD_LEFT}
            y={height - 8}
            textAnchor="start"
            fontSize="10"
            fill="rgb(var(--refresh-muted-2))"
          >
            {firstLabel}
          </text>
        )}
        {lastLabel && lastLabel !== firstLabel && (
          <text
            x={W - PAD_RIGHT}
            y={height - 8}
            textAnchor="end"
            fontSize="10"
            fill="rgb(var(--refresh-muted-2))"
          >
            {lastLabel}
          </text>
        )}

        {/* Hover guideline */}
        {hover != null && points[hover] && (
          <line
            x1={points[hover].x}
            x2={points[hover].x}
            y1={PAD_TOP}
            y2={height - PAD_BOTTOM}
            stroke="rgb(var(--refresh-muted-2) / 0.4)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {/* Line */}
        {N > 0 && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeRef}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Hover dot */}
        {hover != null && points[hover] && (
          <circle
            cx={points[hover].x}
            cy={points[hover].y}
            r="4.5"
            fill={tone ? toneStrokeMap[tone] : toneStrokeMap[gradient.to]}
            stroke="rgb(var(--refresh-bg))"
            strokeWidth="2"
          />
        )}

        {/* Tooltip */}
        {hover != null && points[hover] && (
          <ChartTooltip
            x={points[hover].x}
            y={points[hover].y}
            title={visible[hover].label}
            rows={[
              {
                label: typeof title === 'string' ? title : 'Value',
                value: formatValue(visible[hover].value),
                tone: tone ?? gradient.to,
              },
            ]}
            containerWidth={W}
          />
        )}
      </svg>

      {showSlider && data.length > 1 && (
        <div className="mt-4">
          <RangeSlider
            value={[startIdx, endIdx]}
            onChange={onRangeChange}
            min={0}
            max={data.length - 1}
            step={1}
            ariaLabel="Time range"
            formatValue={(i) => data[i]?.label ?? `${i}`}
          />
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */

function DetailingPill({
  label = 'Detailing',
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  // Click outside to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full bg-refresh-surface px-3 py-1.5 text-sm text-refresh-text transition hover:bg-refresh-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
      >
        <span className="text-refresh-muted">{label}:</span>
        <span className="font-semibold">{current?.label ?? value}</span>
        <ChevronIcon
          className={`text-refresh-muted-2 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 top-full z-30 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-refresh-line bg-refresh-surface-2 p-1 refresh-shadow-soft"
          style={{ animation: 'navrail-flyout-in 150ms ease-out' }}
        >
          <ul className="flex flex-col">
            {options.map((o) => {
              const active = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="menuitem"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text ${
                      active
                        ? 'bg-refresh-surface text-refresh-text font-semibold'
                        : 'text-refresh-text hover:bg-refresh-surface'
                    }`}
                  >
                    <span>{o.label}</span>
                    {active && <CheckIcon className="text-refresh-blue" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
