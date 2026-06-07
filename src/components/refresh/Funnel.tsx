import {
  defaultSeriesTones,
  formatShort,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';

export type FunnelStep = {
  id: string;
  label: React.ReactNode;
  /** Count at this step. Should generally decrease as the user goes down. */
  value: number;
  tone?: ChartTone;
};

export type FunnelProps = {
  steps: FunnelStep[];
  /** Custom value formatter. Default: `formatShort`. */
  formatValue?: (n: number) => string;
  /** Show drop-off (% lost from previous step) per row. Default true. */
  showDropOff?: boolean;
  /** Show conversion rate (% of step 1) per row. Default true. */
  showConversion?: boolean;
  ariaLabel?: string;
  className?: string;
};

/**
 * Conversion funnel — visited → cart → checkout → paid. Each row's bar width
 * is scaled to its value as a fraction of the first step. Renders drop-off
 * vs the previous step and overall conversion vs step 1.
 *
 * @example
 *   <Funnel
 *     steps={[
 *       { id: 'v', label: 'Visited',  value: 4820 },
 *       { id: 'c', label: 'Cart',     value: 1820 },
 *       { id: 'k', label: 'Checkout', value: 940 },
 *       { id: 'p', label: 'Paid',     value: 612, tone: 'sage' },
 *     ]}
 *   />
 */
export function Funnel({
  steps,
  formatValue = formatShort,
  showDropOff = true,
  showConversion = true,
  ariaLabel,
  className = '',
}: FunnelProps) {
  if (steps.length === 0) return null;
  const top = steps[0].value || 1;

  return (
    <ol
      aria-label={ariaLabel ?? 'Funnel chart'}
      className={`flex flex-col gap-1.5 ${className}`}
    >
      {steps.map((s, i) => {
        const tone = s.tone ?? defaultSeriesTones[i % defaultSeriesTones.length];
        const widthPct = (s.value / top) * 100;
        const dropOff =
          i === 0
            ? null
            : ((steps[i - 1].value - s.value) / Math.max(1, steps[i - 1].value)) *
              100;
        const conversion = (s.value / top) * 100;

        return (
          <li key={s.id} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-refresh-text">{s.label}</span>
              <span className="flex items-baseline gap-2 tabular-nums">
                <span className="font-semibold text-refresh-text">
                  {formatValue(s.value)}
                </span>
                {showConversion && i > 0 && (
                  <span className="text-[11px] text-refresh-muted-2">
                    {conversion.toFixed(1)}%
                  </span>
                )}
                {showDropOff && dropOff != null && dropOff > 0 && (
                  <span className="text-[11px] text-refresh-pink">
                    −{dropOff.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div
              className="relative h-9 w-full overflow-hidden rounded-lg bg-refresh-surface"
              role="presentation"
            >
              <span
                className="absolute inset-y-0 left-0 rounded-lg transition-[width] duration-300 ease-out"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: toneStrokeMap[tone],
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
