import { StripePattern, toneStrokeMap, type ChartTone } from './chart-utils';

export type SplitBarTone = ChartTone | 'surface';

export type SplitBarSegment = {
  /** Label shown in the legend row above the bar. */
  label: string;
  /** Relative weight; the component normalizes all segments to sum to 100%. */
  value: number;
  /** Fill tone — same six tones as `Tag` / `MetricTile`, plus `surface` (neutral). */
  tone?: SplitBarTone;
  /** Render this segment with diagonal stripes instead of a solid fill. */
  pattern?: 'solid' | 'stripe';
};

export type SplitBarProps = {
  segments: SplitBarSegment[];
  /** Bar thickness. Default 'md' (10px). */
  height?: 'sm' | 'md' | 'lg';
  /** When true, renders "{percent}%" inside each segment if the segment is wide enough. */
  showPercentLabels?: boolean;
  /** When false, the legend row above the bar is hidden. Default true. */
  showLegend?: boolean;
  /** Accessible name forwarded to the bar's `role="img"`. */
  ariaLabel?: string;
  className?: string;
};

const heightMap: Record<NonNullable<SplitBarProps['height']>, number> = {
  sm: 6,
  md: 10,
  lg: 16,
};

const toneFillMap: Record<SplitBarTone, string> = {
  sage: 'rgb(var(--refresh-sage))',
  lavender: 'rgb(var(--refresh-lavender))',
  blue: 'rgb(var(--refresh-blue))',
  pink: 'rgb(var(--refresh-pink))',
  periwinkle: 'rgb(var(--refresh-periwinkle))',
  text: 'rgb(var(--refresh-text))',
  current: 'currentColor',
  surface: 'rgb(var(--refresh-surface-3))',
};

const toneDotMap: Record<SplitBarTone, string> = {
  sage: 'bg-refresh-sage',
  lavender: 'bg-refresh-lavender',
  blue: 'bg-refresh-blue',
  pink: 'bg-refresh-pink',
  periwinkle: 'bg-refresh-periwinkle',
  text: 'bg-refresh-text',
  current: 'bg-current',
  surface: 'bg-refresh-surface-3',
};

/**
 * Horizontal ratio bar — two or more segments laid side-by-side, normalized to 100%.
 * Each segment can be solid or striped; striped segments share the same diagonal
 * pattern helper as `BarChart` (`StripePattern` from chart-utils).
 *
 * Different from `<ProgressBar>` (single 0–100% fill, one tone) and `<StackedBar>`
 * (vertical multi-stack chart with axes). Intended for compact "this vs that"
 * compositions inside dashboard tiles, e.g. "40% Men · 60% Women".
 */
export function SplitBar({
  segments,
  height = 'md',
  showPercentLabels = false,
  showLegend = true,
  ariaLabel = 'Ratio breakdown',
  className = '',
}: SplitBarProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const safeTotal = total > 0 ? total : 1;

  const normalized = segments.map((s, i) => {
    const tone: SplitBarTone = s.tone ?? 'surface';
    const pct = (Math.max(0, s.value) / safeTotal) * 100;
    return {
      ...s,
      tone,
      pct,
      patternId: s.pattern === 'stripe' ? `splitbar-stripe-${tone}-${i}` : null,
    };
  });

  const h = heightMap[height];

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-refresh-muted">
          {normalized.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full ${toneDotMap[s.tone]}`}
              />
              <span>{s.label}</span>
              <span className="tabular-nums text-refresh-muted-2">{Math.round(s.pct)}%</span>
            </span>
          ))}
        </div>
      )}

      <div
        role="img"
        aria-label={ariaLabel}
        className="relative w-full overflow-hidden rounded-full bg-refresh-surface"
        style={{ height: h }}
      >
        <svg
          width="100%"
          height={h}
          viewBox={`0 0 100 ${h}`}
          preserveAspectRatio="none"
          className="block"
        >
          {normalized.some((s) => s.patternId) && (
            <defs>
              {normalized
                .filter((s) => s.patternId)
                .map((s) => (
                  <StripePattern
                    key={s.patternId!}
                    id={s.patternId!}
                    color={toneFillMap[s.tone]}
                    background={`rgb(var(--refresh-surface))`}
                    strokeWidth={1.5}
                    spacing={4}
                  />
                ))}
            </defs>
          )}
          {(() => {
            let x = 0;
            return normalized.map((s, i) => {
              const w = s.pct;
              const fill = s.patternId ? `url(#${s.patternId})` : toneFillMap[s.tone];
              const rect = (
                <rect key={i} x={x} y={0} width={w} height={h} fill={fill} />
              );
              x += w;
              return rect;
            });
          })()}
        </svg>
        {showPercentLabels && (
          <div className="absolute inset-0 flex">
            {normalized.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-center overflow-hidden text-[10px] font-semibold tabular-nums text-refresh-on-pastel"
                style={{ width: `${s.pct}%` }}
              >
                {s.pct >= 12 && `${Math.round(s.pct)}%`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
