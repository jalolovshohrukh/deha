import { toneStrokeMap, type ChartTone } from './chart-utils';

export type ChartTooltipRow = {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: ChartTone;
};

export type ChartTooltipProps = {
  /** Anchor x in the chart's SVG coordinate space. */
  x: number;
  /** Anchor y in the chart's SVG coordinate space. */
  y: number;
  /** Heading rendered above the rows (e.g. "Mon · Mar 4"). */
  title?: React.ReactNode;
  rows: ChartTooltipRow[];
  /** Width of the surrounding chart in SVG units — used so the tooltip flips to the left if it would overflow on the right. */
  containerWidth: number;
  /** Vertical offset above the anchor point. Default 12. */
  offset?: number;
  /** Tooltip width in SVG units. Default 160. */
  width?: number;
};

/**
 * Floating tooltip rendered inside an SVG chart. Positions itself above the
 * anchor point and flips horizontally if it would overflow the chart edge.
 *
 * Render conditionally inside a chart's `<svg>` based on hover state:
 *
 * @example
 *   {hover && (
 *     <ChartTooltip
 *       x={hover.x}
 *       y={hover.y}
 *       title={labels[hover.i]}
 *       rows={[{ label: 'Sales', value: '$2,180', tone: 'sage' }]}
 *       containerWidth={CHART_W}
 *     />
 *   )}
 */
export function ChartTooltip({
  x,
  y,
  title,
  rows,
  containerWidth,
  offset = 12,
  width = 160,
}: ChartTooltipProps) {
  // Position so the tooltip flips horizontally to stay inside the chart.
  const flip = x + width / 2 + 4 > containerWidth;
  const anchor = flip ? x - width - 8 : x - width / 2;
  const left = Math.max(4, Math.min(anchor, containerWidth - width - 4));
  const rowHeight = 16;
  const titleHeight = title ? 18 : 0;
  const padTop = 8;
  const padBottom = 8;
  const height = padTop + titleHeight + rows.length * rowHeight + padBottom;
  const top = y - offset - height;

  return (
    <foreignObject
      x={left}
      y={top < 4 ? y + offset + 4 : top}
      width={width}
      height={height}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <div
        className="rounded-lg border border-refresh-line bg-refresh-surface-2 px-2.5 py-2 refresh-shadow-soft"
        style={{ width }}
      >
        {title && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
            {title}
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {rows.map((r, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[11px] text-refresh-text"
            >
              {r.tone && (
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: toneStrokeMap[r.tone] }}
                />
              )}
              <span className="flex-1 truncate text-refresh-muted">{r.label}</span>
              <span className="font-semibold tabular-nums">{r.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </foreignObject>
  );
}
