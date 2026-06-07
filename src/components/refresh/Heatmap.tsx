import { toneStrokeMap, type ChartTone } from './chart-utils';

export type HeatmapCell = {
  /** Row index (0-based). */
  row: number;
  /** Column index (0-based). */
  col: number;
  /** Intensity 0–1. Cells outside the range are clamped. */
  value: number;
  /** Optional label for the tooltip / aria. */
  label?: React.ReactNode;
};

export type HeatmapProps = {
  /** Row labels (rendered on the left). */
  rows: string[];
  /** Column labels (rendered on top). */
  cols: string[];
  /** Cell intensities. Missing (row, col) pairs render as empty. */
  cells: HeatmapCell[];
  /** Tone used as the "hot" end of the gradient. Default 'blue'. The "cold" end is `surface`. */
  tone?: ChartTone;
  /** Pixel size of each cell. Default 28. */
  cellSize?: number;
  /** Gap between cells. Default 3. */
  gap?: number;
  /** Show a row of intensity legend boxes below the grid. Default true. */
  showLegend?: boolean;
  ariaLabel?: string;
  className?: string;
};

/**
 * Time-of-day / day-of-week intensity grid. Use for "busiest hours of the
 * week" patterns, repeat-customer cadence, kitchen station load over a
 * shift, etc.
 *
 * @example
 *   <Heatmap
 *     rows={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']}
 *     cols={['9am','10am','11am','12pm','1pm','2pm','3pm']}
 *     cells={[
 *       { row: 0, col: 0, value: 0.2 },
 *       { row: 0, col: 3, value: 0.9 },
 *       { row: 6, col: 5, value: 0.55 },
 *     ]}
 *   />
 */
export function Heatmap({
  rows,
  cols,
  cells,
  tone = 'blue',
  cellSize = 28,
  gap = 3,
  showLegend = true,
  ariaLabel,
  className = '',
}: HeatmapProps) {
  const lookup = new Map<string, HeatmapCell>();
  for (const c of cells) {
    lookup.set(`${c.row}-${c.col}`, c);
  }

  const cellStyle = (intensity: number): React.CSSProperties => {
    const clamped = Math.max(0, Math.min(1, intensity));
    return {
      width: cellSize,
      height: cellSize,
      borderRadius: 4,
      // Mix the tone with the surface color via opacity — at 0% we show
      // a subtle surface tint (so empty cells still feel like "cells"),
      // at 100% we show the full tone.
      backgroundColor: 'rgb(var(--refresh-surface))',
      backgroundImage: `linear-gradient(${toneStrokeMap[tone]}, ${toneStrokeMap[tone]})`,
      backgroundSize: '100% 100%',
      backgroundBlendMode: 'normal',
      opacity: 0.2 + clamped * 0.8,
    };
  };

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? 'Heatmap'}
      className={`inline-block ${className}`}
    >
      {/* Column header */}
      <div
        className="flex items-end pl-[3.25rem]"
        style={{ gap }}
      >
        {cols.map((c, i) => (
          <span
            key={i}
            className="text-center text-[10px] text-refresh-muted-2"
            style={{ width: cellSize }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-1 flex flex-col" style={{ gap }}>
        {rows.map((r, ri) => (
          <div key={ri} className="flex items-center" style={{ gap }}>
            <span className="w-12 shrink-0 pr-2 text-right text-[10px] text-refresh-muted-2">
              {r}
            </span>
            {cols.map((_, ci) => {
              const cell = lookup.get(`${ri}-${ci}`);
              const intensity = cell?.value ?? 0;
              return (
                <span
                  key={ci}
                  style={cellStyle(intensity)}
                  className="block"
                  title={
                    cell?.label != null
                      ? String(cell.label)
                      : `${r} · ${cols[ci]} — ${(intensity * 100).toFixed(0)}%`
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="ml-[3.25rem] mt-3 flex items-center gap-2 text-[10px] text-refresh-muted-2">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <span
              key={i}
              style={{
                ...cellStyle(v),
                width: cellSize * 0.6,
                height: cellSize * 0.6,
              }}
            />
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  );
}
