type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
type SpinnerTone = 'default' | 'muted' | 'on-pastel' | 'inherit';

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-7 w-7 border-[2.5px]',
};

const toneMap: Record<SpinnerTone, string> = {
  default: 'border-refresh-text/20 border-t-refresh-text',
  muted: 'border-refresh-muted/30 border-t-refresh-muted',
  'on-pastel': 'border-refresh-on-pastel/20 border-t-refresh-on-pastel',
  inherit: 'border-current/20 border-t-current',
};

export type SpinnerProps = {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  ariaLabel?: string;
  className?: string;
};

/** Inline circular spinner. Use for buttons, fields, or anywhere small loading is needed. */
export function Spinner({
  size = 'md',
  tone = 'default',
  ariaLabel = 'Loading',
  className = '',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block animate-spin rounded-full ${sizeMap[size]} ${toneMap[tone]} ${className}`}
    />
  );
}

export type ProgressRingProps = {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Color of the progress arc. Pass any Tailwind text-* utility (e.g. "text-refresh-blue"). */
  trackClassName?: string;
  arcClassName?: string;
  ariaLabel?: string;
  showLabel?: boolean;
  className?: string;
};

/** Circular progress indicator — for prep timers, sync progress, etc. */
export function ProgressRing({
  value,
  size = 40,
  strokeWidth = 4,
  trackClassName = 'text-refresh-surface-3',
  arcClassName = 'text-refresh-text',
  ariaLabel,
  showLabel = false,
  className = '',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <span
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${clamped}% complete`}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${arcClassName} transition-[stroke-dashoffset] duration-500 ease-out`}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[10px] font-semibold tabular-nums text-refresh-text">
          {Math.round(clamped)}
        </span>
      )}
    </span>
  );
}
