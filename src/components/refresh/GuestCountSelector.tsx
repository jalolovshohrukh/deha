'use client';

export type GuestCountSelectorProps = {
  value: number;
  onChange: (next: number) => void;
  /** Maximum number rendered as discrete chips before falling through to the +N stepper. Default 6. */
  maxChip?: number;
  /** Hard upper bound on guest count. Default 99. */
  max?: number;
  /** Hard lower bound. Default 1. */
  min?: number;
  size?: 'sm' | 'md';
  ariaLabel?: string;
  className?: string;
};

/**
 * Party-size / guest-count selector. Renders chips for 1..maxChip and a stepper button
 * for larger values (e.g. 7+ on a 6-chip rail).
 *
 * @example
 *   <GuestCountSelector value={partySize} onChange={setPartySize} />
 */
export function GuestCountSelector({
  value,
  onChange,
  maxChip = 6,
  max = 99,
  min = 1,
  size = 'md',
  ariaLabel = 'Guest count',
  className = '',
}: GuestCountSelectorProps) {
  const padding = size === 'sm' ? 'h-9 min-w-[36px] text-xs' : 'h-11 min-w-[44px] text-sm';
  const overflowActive = value > maxChip;

  return (
    <div role="group" aria-label={ariaLabel} className={`inline-flex items-center gap-1.5 ${className}`}>
      {Array.from({ length: maxChip }, (_, i) => {
        const n = i + min;
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(n)}
            className={`inline-flex items-center justify-center rounded-lg border px-3 font-semibold tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${padding} ${
              active
                ? 'border-refresh-text bg-refresh-text text-refresh-bg'
                : 'border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2'
            }`}
          >
            {n}
          </button>
        );
      })}
      <div
        className={`inline-flex items-stretch overflow-hidden rounded-lg border ${
          overflowActive
            ? 'border-refresh-text bg-refresh-text text-refresh-bg'
            : 'border-refresh-surface-3 bg-refresh-surface text-refresh-text'
        }`}
      >
        <button
          type="button"
          aria-label="Decrease"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={`flex items-center justify-center px-2.5 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${padding}`}
        >
          −
        </button>
        <span
          className={`flex items-center justify-center border-x border-current/20 px-2 font-semibold tabular-nums ${padding}`}
          aria-live="polite"
        >
          {overflowActive ? value : `${maxChip + 1}+`}
        </span>
        <button
          type="button"
          aria-label="Increase"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, Math.max(maxChip + 1, value + 1)))}
          className={`flex items-center justify-center px-2.5 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${padding}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
