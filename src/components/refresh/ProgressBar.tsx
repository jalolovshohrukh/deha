type ProgressTone = 'default' | 'success' | 'warn' | 'info' | 'lavender';
type ProgressSize = 'sm' | 'md' | 'lg';

const toneMap: Record<ProgressTone, string> = {
  default: 'bg-refresh-text',
  success: 'bg-refresh-sage',
  warn: 'bg-refresh-pink',
  info: 'bg-refresh-blue',
  lavender: 'bg-refresh-lavender',
};

const sizeMap: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export type ProgressBarProps = {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  /** Optional label rendered above the bar. */
  label?: React.ReactNode;
  /** Show "{value}%" tag on the right of the label row. Default false. */
  showValue?: boolean;
  /** Bar fill color. Default 'default' (refresh-text). */
  tone?: ProgressTone;
  /** Track (unfilled) color override. Defaults to `refresh-surface`. */
  trackClassName?: string;
  /** Bar thickness. Default 'md'. */
  size?: ProgressSize;
  /** When true, the fill animates with a subtle pulse — useful for indeterminate "processing…" states paired with `value={0}`. */
  indeterminate?: boolean;
  className?: string;
};

/**
 * Horizontal progress bar. Standard tones from the Refresh palette, three
 * sizes, optional label / value tag, and an indeterminate pulsing variant.
 */
export function ProgressBar({
  value,
  label,
  showValue = false,
  tone = 'default',
  trackClassName = 'bg-refresh-surface',
  size = 'md',
  indeterminate = false,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-xs">
          {label && <span className="text-refresh-muted">{label}</span>}
          {showValue && (
            <span className="font-semibold tabular-nums text-refresh-text">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={typeof label === 'string' ? label : undefined}
        className={`relative w-full overflow-hidden rounded-full ${trackClassName} ${sizeMap[size]}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${toneMap[tone]} ${
            indeterminate ? 'refresh-progress-indeterminate' : ''
          }`}
          style={{
            width: indeterminate ? '40%' : `${clamped}%`,
          }}
        />
      </div>
    </div>
  );
}
