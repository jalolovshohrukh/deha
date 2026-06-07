import { Sparkline } from './Sparkline';
import type { ChartTone } from './chart-utils';

type Tone = 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';

const toneSurfaceMap: Record<Tone, string> = {
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
  surface: 'bg-refresh-surface text-refresh-text',
};

// On pastel surfaces the sparkline inherits `text-refresh-on-pastel` (dark);
// on the neutral `surface` tone it falls back to the regular blue accent.
const sparkToneFor = (tone: Tone): ChartTone => (tone === 'surface' ? 'blue' : 'current');

export type MetricTileProps = {
  label: string;
  /** Big metric value, pre-formatted (e.g. "714k", "$1.72m", "234"). */
  value: React.ReactNode;
  /** Surface tone — same six tones as `Tag` / `CategoryCard`. */
  tone?: Tone;
  /** Icon node (typically `<Icon name="…" size={20} />`) for the top-left badge. */
  icon?: React.ReactNode;
  /** Trend % delta. Sign decides arrow direction. Omit to hide the trend pill. */
  trend?: number;
  /**
   * For metrics where "down" is good (refunds, errors). Default 'normal' — `up = good`.
   */
  trendPolarity?: 'normal' | 'inverse';
  /** Sparkline data points. Omit to hide the sparkline. */
  spark?: number[];
  /** Decorative halftone dot pattern in the bottom-right corner. Default true on pastel tones, false on `surface`. */
  halftone?: boolean;
  className?: string;
};

/**
 * Pastel KPI tile — icon badge + trend + big value + sparkline on a tonal
 * surface. Drops into a 4-up dashboard hero row (`grid sm:grid-cols-2 lg:grid-cols-4`)
 * and re-tints per metric. Composes `Sparkline` for the trend chart; the
 * trend pill is rendered inline (the standalone `StatTrend` uses muted
 * neutrals that don't read well on pastel surfaces).
 */
export function MetricTile({
  label,
  value,
  tone = 'sage',
  icon,
  trend,
  trendPolarity = 'normal',
  spark,
  halftone,
  className = '',
}: MetricTileProps) {
  const showHalftone = halftone ?? tone !== 'surface';
  const isPastel = tone !== 'surface';

  const trendDir = trend === undefined ? null : trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
  const trendIsGood =
    trendDir === null || trendDir === 'flat'
      ? null
      : trendPolarity === 'inverse'
      ? trendDir === 'down'
      : trendDir === 'up';

  // On pastel surfaces neutral muted-2 disappears, so promote good/bad to
  // their on-pastel equivalents.
  const trendColorClass = isPastel
    ? trendIsGood === null
      ? 'text-refresh-on-pastel/70'
      : trendIsGood
      ? 'text-refresh-on-pastel'
      : 'text-refresh-on-pastel'
    : trendIsGood === null
    ? 'text-refresh-muted-2'
    : trendIsGood
    ? 'text-refresh-sage'
    : 'text-refresh-pink';

  const trendArrow = trendDir === 'up' ? '↗' : trendDir === 'down' ? '↘' : '→';

  return (
    <div
      className={`relative isolate flex h-[170px] flex-col justify-between overflow-hidden rounded-2xl p-5 ${toneSurfaceMap[tone]} ${className}`}
    >
      {showHalftone && (
        <span
          aria-hidden
          className="refresh-halftone absolute inset-0 opacity-25"
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        {icon ? (
          <span
            aria-hidden
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
              isPastel ? 'bg-refresh-on-pastel/10' : 'bg-refresh-surface-3'
            }`}
          >
            {icon}
          </span>
        ) : (
          <span aria-hidden />
        )}
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${trendColorClass}`}
          >
            <span aria-hidden>{trendArrow}</span>
            <span>
              {trend > 0 ? '+' : trend < 0 ? '−' : ''}
              {Math.abs(trend).toFixed(Math.abs(trend) < 10 ? 1 : 0)}%
            </span>
          </span>
        )}
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-sm font-medium ${
              isPastel ? 'text-refresh-on-pastel/70' : 'text-refresh-muted'
            }`}
          >
            {label}
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        {spark && spark.length > 1 && (
          <Sparkline
            data={spark}
            tone={sparkToneFor(tone)}
            width={88}
            height={36}
            fill={false}
            endPoint={false}
            strokeWidth={2.25}
            ariaLabel={`${label} trend`}
            className={isPastel ? 'opacity-80' : ''}
          />
        )}
      </div>
    </div>
  );
}
