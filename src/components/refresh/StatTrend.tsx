type Direction = 'up' | 'down' | 'flat';

export type StatTrendProps = {
  /** Delta value — interpreted as percent unless `format="amount"`. Sign decides arrow direction. */
  value: number;
  /** Render as percent (default) or pre-formatted amount string. */
  format?: 'percent' | 'amount';
  /** When `format="amount"`, this string is rendered as-is (e.g. "+$214" or "−12 orders"). */
  amountLabel?: string;
  /**
   * Override the auto-derived direction. Default: positive → 'up', negative → 'down', 0 → 'flat'.
   * Useful when "down" is good (e.g. refunds dropped 12% — pass `polarity="inverse"`).
   */
  polarity?: 'normal' | 'inverse';
  /** Optional caption rendered after the delta — e.g. "vs last week". */
  caption?: React.ReactNode;
  /** Compact mode — no caption, smaller text. Useful inline in a StatCard. */
  size?: 'sm' | 'md';
  className?: string;
};

const arrows: Record<Direction, string> = {
  up: '▲',
  down: '▼',
  flat: '–',
};

/**
 * Number + arrow + delta% — the "△ 8.2% vs last week" line you see under a
 * big metric in dashboards. Pairs with `Sparkline` and `StatCard`.
 *
 * @example
 *   <StatTrend value={8.2} caption="vs last week" />
 *   <StatTrend value={-12} polarity="inverse" caption="refunds, week-over-week" />
 *   <StatTrend value={0} format="amount" amountLabel="−$214" />
 */
export function StatTrend({
  value,
  format = 'percent',
  amountLabel,
  polarity = 'normal',
  caption,
  size = 'md',
  className = '',
}: StatTrendProps) {
  const dir: Direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

  // Polarity: inverse flips good/bad — going down is good (e.g. refunds).
  const isGood =
    dir === 'flat'
      ? null
      : polarity === 'inverse'
      ? dir === 'down'
      : dir === 'up';

  const colorClass =
    isGood === null
      ? 'text-refresh-muted-2'
      : isGood
      ? 'text-refresh-sage'
      : 'text-refresh-pink';

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const label =
    format === 'amount'
      ? amountLabel ?? value.toString()
      : `${Math.abs(value).toFixed(Math.abs(value) < 10 ? 1 : 0)}%`;

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSize} ${className}`}>
      <span className={`inline-flex items-center gap-1 font-semibold ${colorClass}`}>
        <span aria-hidden className="text-[10px]">
          {arrows[dir]}
        </span>
        <span className="tabular-nums">{label}</span>
      </span>
      {caption && (
        <span className="text-refresh-muted-2">{caption}</span>
      )}
    </span>
  );
}
