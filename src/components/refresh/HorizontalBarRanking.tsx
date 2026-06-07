import {
  defaultSeriesTones,
  formatShort,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';

export type RankingItem = {
  id: string;
  label: React.ReactNode;
  value: number;
  /** Tone for this row's bar. Defaults to cycling through the standard palette. */
  tone?: ChartTone;
  /** Override the tone used when the row is the top item. */
  highlight?: boolean;
};

export type HorizontalBarRankingProps = {
  items: RankingItem[];
  /** Limit to first N items. Default: render all. */
  topN?: number;
  /** Custom value formatter for the right-side label. Default: `formatShort`. */
  formatValue?: (n: number) => string;
  /** Maximum value used as 100%. Default: max of `items`. */
  maxValue?: number;
  /** Show numeric ranking (1, 2, 3…) before each label. Default true. */
  showRank?: boolean;
  ariaLabel?: string;
  className?: string;
};

/**
 * Top-N ranked list with proportional fill bars — top products, top
 * customers, top stores. Each row shows: rank · label · bar · value.
 *
 * @example
 *   <HorizontalBarRanking
 *     items={[
 *       { id: 'espresso',   label: 'Espresso',     value: 482 },
 *       { id: 'latte',      label: 'Latte',        value: 318 },
 *       { id: 'avo-toast',  label: 'Avocado toast', value: 204 },
 *       { id: 'croissant',  label: 'Croissant',    value: 142 },
 *     ]}
 *     topN={5}
 *   />
 */
export function HorizontalBarRanking({
  items,
  topN,
  formatValue = formatShort,
  maxValue,
  showRank = true,
  ariaLabel,
  className = '',
}: HorizontalBarRankingProps) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const visible = topN ? sorted.slice(0, topN) : sorted;
  const max = maxValue ?? visible[0]?.value ?? 1;

  return (
    <ol
      aria-label={ariaLabel ?? 'Ranking'}
      className={`flex flex-col gap-2 ${className}`}
    >
      {visible.map((it, i) => {
        const tone =
          it.tone ?? defaultSeriesTones[i % defaultSeriesTones.length];
        const pct = max > 0 ? Math.max(2, (it.value / max) * 100) : 0;
        return (
          <li
            key={it.id}
            className="flex items-center gap-3 text-sm text-refresh-text"
          >
            {showRank && (
              <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-refresh-muted-2">
                {i + 1}
              </span>
            )}
            <span className="w-32 shrink-0 truncate sm:w-40">{it.label}</span>
            <span
              className="relative h-2 flex-1 overflow-hidden rounded-full bg-refresh-surface"
              role="presentation"
            >
              <span
                className="block h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: toneStrokeMap[tone],
                }}
              />
            </span>
            <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
              {formatValue(it.value)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
