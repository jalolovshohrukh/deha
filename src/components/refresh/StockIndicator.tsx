import { ProgressBar } from './ProgressBar';

export type StockState = 'in' | 'low' | 'out';

export type StockIndicatorProps = {
  /** Current stock count. */
  value: number;
  /** Total / target capacity. Used to compute the bar fill ratio and to detect "in stock". */
  total: number;
  /**
   * Threshold below which stock is considered "low". Either a fraction (≤ 1, default 0.15)
   * or an absolute count (> 1).
   */
  lowThreshold?: number;
  /** Force a specific state, bypassing the value/total/threshold logic. */
  state?: StockState;
  /** Bar thickness — passed through to `<ProgressBar>`. Default 'sm'. */
  size?: 'sm' | 'md' | 'lg';
  /** Override the caption text. Default uses the state-derived label. */
  caption?: React.ReactNode;
  /** Hide the caption entirely (just the bar). */
  hideCaption?: boolean;
  className?: string;
};

function deriveState(value: number, total: number, lowThreshold: number): StockState {
  if (value <= 0 || total <= 0) return 'out';
  const limit = lowThreshold > 1 ? lowThreshold : Math.max(1, Math.round(total * lowThreshold));
  if (value <= limit) return 'low';
  return 'in';
}

const toneByState: Record<StockState, 'success' | 'lavender' | 'warn'> = {
  in: 'success',
  low: 'lavender',
  out: 'warn',
};

const trackByState: Record<StockState, string> = {
  in: 'bg-refresh-sage/25',
  low: 'bg-refresh-lavender/25',
  out: 'bg-refresh-pink/25',
};

/**
 * Inventory cell: a horizontal stock bar with a tonal color and a caption
 * underneath ("72 in stock", "10 low stock", "out of stock"). Wraps
 * `<ProgressBar>` so the bar + a11y semantics stay consistent.
 *
 * - `in`  → sage     (`tone="success"`)
 * - `low` → lavender
 * - `out` → pink     (`tone="warn"`), zero fill so only the tinted track shows
 */
export function StockIndicator({
  value,
  total,
  lowThreshold = 0.15,
  state,
  size = 'sm',
  caption,
  hideCaption = false,
  className = '',
}: StockIndicatorProps) {
  const safeTotal = Math.max(0, total);
  const safeValue = Math.max(0, value);
  const resolvedState: StockState = state ?? deriveState(safeValue, safeTotal, lowThreshold);
  const pct =
    resolvedState === 'out'
      ? 0
      : safeTotal > 0
      ? Math.min(100, (safeValue / safeTotal) * 100)
      : 0;

  const captionText =
    caption ??
    (resolvedState === 'out'
      ? 'out of stock'
      : resolvedState === 'low'
      ? `${safeValue} low stock`
      : `${safeValue} in stock`);

  const ariaLabel = typeof captionText === 'string' ? captionText : undefined;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex w-full max-w-[160px] flex-col gap-1.5 ${className}`}
    >
      <ProgressBar
        value={pct}
        tone={toneByState[resolvedState]}
        trackClassName={trackByState[resolvedState]}
        size={size}
      />
      {!hideCaption && (
        <span className="text-xs text-refresh-muted">{captionText}</span>
      )}
    </div>
  );
}
