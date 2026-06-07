/**
 * Shared chart helpers — scale math, path builders, and the tone palette.
 *
 * All Refresh charts compose from this module so they share identical color
 * semantics, formatters, and SVG conventions. No external dependencies.
 */

export type ChartTone =
  | 'sage'
  | 'lavender'
  | 'blue'
  | 'pink'
  | 'periwinkle'
  | 'text'
  | 'current';

/** Solid fill / stroke per tone. Uses the existing Refresh CSS variables.
 * `current` resolves to CSS `currentColor` so consumers can recolor the
 * line via Tailwind `text-*` utilities — handy when the chart sits on a
 * tonal surface (e.g. inside `MetricTile`) and needs to inherit the
 * surrounding text color. */
export const toneStrokeMap: Record<ChartTone, string> = {
  sage: 'rgb(var(--refresh-sage))',
  lavender: 'rgb(var(--refresh-lavender))',
  blue: 'rgb(var(--refresh-blue))',
  pink: 'rgb(var(--refresh-pink))',
  periwinkle: 'rgb(var(--refresh-periwinkle))',
  text: 'rgb(var(--refresh-text))',
  current: 'currentColor',
};

/** Translucent fill (for area/bar fills under a stroke). */
export const toneFillMap: Record<ChartTone, string> = {
  sage: 'rgb(var(--refresh-sage) / 0.25)',
  lavender: 'rgb(var(--refresh-lavender) / 0.25)',
  blue: 'rgb(var(--refresh-blue) / 0.25)',
  pink: 'rgb(var(--refresh-pink) / 0.25)',
  periwinkle: 'rgb(var(--refresh-periwinkle) / 0.25)',
  text: 'rgb(var(--refresh-text) / 0.18)',
  current: 'currentColor',
};

/** Default series order — picks tones in this order when tones aren't passed. */
export const defaultSeriesTones: ChartTone[] = [
  'blue',
  'sage',
  'lavender',
  'pink',
  'periwinkle',
];

/* ──────────────────── SVG patterns ──────────────────── */

export type StripePatternProps = {
  /** Pattern id — must be unique inside the SVG. Reference via `fill="url(#<id>)"`. */
  id: string;
  /** Stroke color of the diagonal stripes. Pass `currentColor` to inherit. */
  color: string;
  /** Background color behind the stripes. Default `transparent`. */
  background?: string;
  /** Stroke width in user units. Default 4. */
  strokeWidth?: number;
  /** Distance between stripe centers in user units. Default 10. */
  spacing?: number;
  /** Rotation of the stripes in degrees. Default 45. */
  angle?: number;
  /** Stripe opacity 0–1. Default 1. */
  opacity?: number;
};

/**
 * Diagonal-stripe `<pattern>` block, drop into any chart's `<defs>`. The id
 * lets a `<rect fill="url(#id)">` reference it. Used by `BarChart`'s comparison
 * overlay and `SplitBar` for tonal differentiation.
 *
 * @example
 *   <svg>
 *     <defs>
 *       <StripePattern id="stripe-blue" color="rgb(var(--refresh-blue))" />
 *     </defs>
 *     <rect width={120} height={40} fill="url(#stripe-blue)" />
 *   </svg>
 */
export function StripePattern({
  id,
  color,
  background = 'transparent',
  strokeWidth = 4,
  spacing = 10,
  angle = 45,
  opacity = 1,
}: StripePatternProps) {
  // The pattern is a square tile of size `spacing × spacing`. We draw one
  // stripe across it; SVG repeats the tile to fill the shape.
  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={spacing}
      height={spacing}
      patternTransform={`rotate(${angle})`}
    >
      <rect width={spacing} height={spacing} fill={background} />
      <line
        x1={0}
        y1={spacing / 2}
        x2={spacing}
        y2={spacing / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </pattern>
  );
}

/** Linear scale: maps `value` from input range [iMin, iMax] to output [oMin, oMax]. */
export function scaleLinear(
  value: number,
  iMin: number,
  iMax: number,
  oMin: number,
  oMax: number
): number {
  if (iMax === iMin) return (oMin + oMax) / 2;
  return oMin + ((value - iMin) / (iMax - iMin)) * (oMax - oMin);
}

/** "Nice" max — round up so the y-axis lands on a clean number (e.g. 1240 → 1500). */
export function niceMax(raw: number): number {
  if (raw <= 0) return 1;
  const exp = Math.floor(Math.log10(raw));
  const pow = Math.pow(10, exp);
  const norm = raw / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * pow;
}

/** Build an SVG path "M x,y L x,y …" from a list of points. */
export function buildLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');
}

/** Build a smooth curve path through points using Catmull-Rom → Bezier conversion. */
export function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length < 3) return buildLinePath(points);

  const cmds: string[] = [`M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    cmds.push(
      `C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
    );
  }
  return cmds.join(' ');
}

/** Build a closed area path (line on top + closing line back along the bottom). */
export function buildAreaPath(
  points: { x: number; y: number }[],
  baselineY: number,
  smooth = false
): string {
  if (points.length === 0) return '';
  const top = smooth ? buildSmoothPath(points) : buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L${last.x.toFixed(2)},${baselineY} L${first.x.toFixed(2)},${baselineY} Z`;
}

/** Donut/pie arc — returns an SVG path d-attribute for one slice. */
export function buildArcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;

  const x1 = cx + outerR * Math.cos(startAngle);
  const y1 = cy + outerR * Math.sin(startAngle);
  const x2 = cx + outerR * Math.cos(endAngle);
  const y2 = cy + outerR * Math.sin(endAngle);

  if (innerR <= 0) {
    // Full pie wedge.
    return `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${outerR},${outerR} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
  }

  const x3 = cx + innerR * Math.cos(endAngle);
  const y3 = cy + innerR * Math.sin(endAngle);
  const x4 = cx + innerR * Math.cos(startAngle);
  const y4 = cy + innerR * Math.sin(startAngle);

  return [
    `M${x1.toFixed(2)},${y1.toFixed(2)}`,
    `A${outerR},${outerR} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`,
    `L${x3.toFixed(2)},${y3.toFixed(2)}`,
    `A${innerR},${innerR} 0 ${largeArc} 0 ${x4.toFixed(2)},${y4.toFixed(2)}`,
    'Z',
  ].join(' ');
}

/** Format a number short — 12,840 → "12.8k", 1.24M → "1.24M". */
export function formatShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}k`;
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(1);
}
