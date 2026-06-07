export type SkeletonProps = {
  /** Tailwind width utility (e.g. "w-32", "w-full") or arbitrary "w-[120px]". */
  width?: string;
  /** Tailwind height utility (e.g. "h-4", "h-12") or arbitrary "h-[24px]". */
  height?: string;
  /** Border radius utility. Default: "rounded-md". */
  rounded?: string;
  className?: string;
};

/** Generic shimmer placeholder. Compose into more specific variants (text, circle, card). */
export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
  className = '',
}: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse bg-refresh-surface-3 ${width} ${height} ${rounded} ${className}`}
    />
  );
}

export type SkeletonTextProps = {
  /** Number of lines to render. Default: 3. */
  lines?: number;
  /** Width of the last line — typically narrower for a natural look. Default: "w-3/4". */
  lastLineWidth?: string;
  /** Per-line height. Default: "h-3.5". */
  lineHeight?: string;
  className?: string;
};

/** Multi-line text skeleton. Last line is narrower by default. */
export function SkeletonText({
  lines = 3,
  lastLineWidth = 'w-3/4',
  lineHeight = 'h-3.5',
  className = '',
}: SkeletonTextProps) {
  return (
    <span aria-hidden className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? lastLineWidth : 'w-full'}
        />
      ))}
    </span>
  );
}

export type SkeletonCircleProps = {
  /** Tailwind size class — applied to both width and height. Default: "h-10 w-10". */
  size?: string;
  className?: string;
};

/** Circular skeleton — for avatar placeholders. */
export function SkeletonCircle({ size = 'h-10 w-10', className = '' }: SkeletonCircleProps) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-full bg-refresh-surface-3 ${size} ${className}`}
    />
  );
}
