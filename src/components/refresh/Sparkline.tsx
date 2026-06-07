import {
  buildAreaPath,
  buildLinePath,
  buildSmoothPath,
  scaleLinear,
  toneFillMap,
  toneStrokeMap,
  type ChartTone,
} from './chart-utils';

export type SparklineProps = {
  /** Y values in chronological order. */
  data: number[];
  /** Stroke / fill color. Default 'blue'. */
  tone?: ChartTone;
  /** Pixel width of the rendered SVG. Default 96. */
  width?: number;
  /** Pixel height of the rendered SVG. Default 28. */
  height?: number;
  /** Stroke thickness. Default 2. */
  strokeWidth?: number;
  /** Render as a smooth curve through points. Default true. */
  smooth?: boolean;
  /** Fill the area under the line with a translucent tone. Default true. */
  fill?: boolean;
  /** Pin the last point with a small dot in the same tone. Default true. */
  endPoint?: boolean;
  /** Force the y-axis baseline to 0 instead of the data min — useful when the metric is "cumulative count". */
  baseline?: 'data' | 'zero';
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  className?: string;
};

/**
 * Tiny inline trend line — built for `StatCard`s and table rows. No axes, no
 * tooltip, no legend. Just a 2pt line through your data points with an
 * optional translucent fill and an end-point dot.
 *
 * @example
 *   <Sparkline data={[12, 14, 13, 18, 22, 19, 26]} tone="sage" />
 */
export function Sparkline({
  data,
  tone = 'blue',
  width = 96,
  height = 28,
  strokeWidth = 2,
  smooth = true,
  fill = true,
  endPoint = true,
  baseline = 'data',
  ariaLabel,
  className = '',
}: SparklineProps) {
  if (data.length === 0) return null;

  const pad = strokeWidth + 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const yMin = baseline === 'zero' ? Math.min(0, ...data) : Math.min(...data);
  const yMax = Math.max(...data);
  const range = yMax - yMin || 1;

  const points = data.map((v, i) => ({
    x: pad + scaleLinear(i, 0, Math.max(1, data.length - 1), 0, innerW),
    y: pad + innerH - ((v - yMin) / range) * innerH,
  }));

  const linePath = smooth ? buildSmoothPath(points) : buildLinePath(points);
  const last = points[points.length - 1];

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? 'Trend sparkline'}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block align-middle ${className}`}
    >
      {fill && (
        <path
          d={buildAreaPath(points, height - pad / 2, smooth)}
          fill={toneFillMap[tone]}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={toneStrokeMap[tone]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {endPoint && last && (
        <circle
          cx={last.x}
          cy={last.y}
          r={Math.max(2, strokeWidth)}
          fill={toneStrokeMap[tone]}
          stroke="rgb(var(--refresh-bg))"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}
