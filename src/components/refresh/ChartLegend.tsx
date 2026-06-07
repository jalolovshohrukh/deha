import { toneStrokeMap, type ChartTone } from './chart-utils';

export type ChartLegendItem = {
  label: React.ReactNode;
  tone: ChartTone;
  /** Optional value rendered after the label (e.g. "$2,180"). */
  value?: React.ReactNode;
};

export type ChartLegendProps = {
  items: ChartLegendItem[];
  /** 'inline' = horizontal flex-wrap (default). 'stacked' = vertical list. */
  layout?: 'inline' | 'stacked';
  /** Swatch shape. Default 'dot'. */
  swatch?: 'dot' | 'square' | 'line';
  /** Density. Default 'md'. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Tone-tinted swatch + label list. Works with every Refresh chart — drop it
 * above or beside a chart, pass it the same `items` array and tone mapping
 * you used for the chart's series.
 *
 * @example
 *   <ChartLegend
 *     items={[
 *       { label: 'Cash',   tone: 'sage',     value: '$2,180' },
 *       { label: 'Card',   tone: 'lavender', value: '$5,820' },
 *       { label: 'Wallet', tone: 'blue',     value: '$640' },
 *     ]}
 *   />
 */
export function ChartLegend({
  items,
  layout = 'inline',
  swatch = 'dot',
  size = 'md',
  className = '',
}: ChartLegendProps) {
  const wrapper =
    layout === 'inline' ? 'flex flex-wrap items-center gap-x-4 gap-y-2' : 'flex flex-col gap-2';
  const text = size === 'sm' ? 'text-[11px]' : 'text-xs';

  const swatchSize = size === 'sm' ? 8 : 10;

  return (
    <ul className={`${wrapper} ${text} ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            style={{
              backgroundColor:
                swatch === 'line' ? 'transparent' : toneStrokeMap[it.tone],
              width: swatch === 'line' ? swatchSize * 1.6 : swatchSize,
              height: swatch === 'line' ? 2 : swatchSize,
              borderRadius:
                swatch === 'square' ? 2 : swatch === 'line' ? 9999 : 9999,
              outline:
                swatch === 'line'
                  ? `2px solid ${toneStrokeMap[it.tone]}`
                  : undefined,
              outlineOffset: swatch === 'line' ? '-1px' : undefined,
            }}
            className="inline-block shrink-0"
          />
          <span className="text-refresh-muted">{it.label}</span>
          {it.value != null && (
            <span className="font-semibold tabular-nums text-refresh-text">
              {it.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
