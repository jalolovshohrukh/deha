/**
 * Component-shaped skeleton variants for the data-display components.
 *
 * Use one of these instead of hand-rolling layout when a real `<OrderCard>`,
 * `<StatCard>`, `<Table>`, etc. is loading. Each variant matches the rough
 * dimensions of its corresponding component so the layout doesn't jump when
 * the real data arrives.
 *
 * For one-off loading states, the underlying primitives (`Skeleton`,
 * `SkeletonText`, `SkeletonCircle`) are still the right call — these
 * specialized variants just save you from repeating the layout math.
 */

import { Skeleton, SkeletonCircle, SkeletonText } from './Skeleton';

/* ─────────── Card / OrderCard / ProductCard / StatCard ─────────── */

/** Generic card placeholder — title + 3 lines + a wider accent block. */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-refresh-line bg-refresh-surface-2 p-4 ${className}`}
    >
      <Skeleton width="w-2/5" height="h-5" />
      <SkeletonText lines={3} />
      <Skeleton width="w-1/3" height="h-3" />
    </div>
  );
}

/** Order summary card — header (number + status), 3 line items, footer. */
export function OrderCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-refresh-line bg-refresh-surface-2 p-4 ${className}`}
    >
      {/* Header: number/channel + status pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton width="w-16" height="h-4" />
          <Skeleton width="w-20" height="h-3" />
        </div>
        <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
      </div>
      {/* Line items */}
      <div className="flex flex-col gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <Skeleton width="w-2/3" height="h-3.5" />
            <Skeleton width="w-12" height="h-3.5" />
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-refresh-line pt-3">
        <Skeleton width="w-14" height="h-3" />
        <Skeleton width="w-16" height="h-5" />
      </div>
    </div>
  );
}

/** Menu / catalog tile — flow line + name + price + stepper row. */
export function ProductCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl bg-refresh-surface p-3.5 ${className}`}
    >
      <Skeleton width="w-1/2" height="h-3" />
      <div className="flex flex-col gap-1.5">
        <Skeleton width="w-3/4" height="h-4" />
        <Skeleton width="w-16" height="h-3" />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <SkeletonCircle size="h-7 w-7" />
        <Skeleton width="w-4" height="h-4" />
        <SkeletonCircle size="h-7 w-7" />
      </div>
    </div>
  );
}

/** Dashboard stat tile — icon + label + big number. */
export function StatCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-refresh-surface p-4 ${className}`}>
      <SkeletonCircle size="h-9 w-9" className="mb-6" />
      <Skeleton width="w-20" height="h-3" />
      <Skeleton width="w-28" height="h-7" className="mt-2" />
    </div>
  );
}

/* ─────────── Table / List / Timeline / DiscountStack ─────────── */

/** Tabular grid placeholder — N rows × M columns. */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-refresh-line ${className}`}
    >
      <div className="divide-y divide-refresh-line">
        {/* Header row */}
        <div
          className="grid gap-3 bg-refresh-surface px-3 py-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width="w-2/3" height="h-3" />
          ))}
        </div>
        {/* Body rows */}
        {Array.from({ length: rows }).map((_, ri) => (
          <div
            key={ri}
            className="grid gap-3 px-3 py-2.5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, ci) => (
              <Skeleton
                key={ci}
                width={ci === 0 ? 'w-3/4' : ci === columns - 1 ? 'w-1/3' : 'w-2/3'}
                height="h-4"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Vertical list — N rows of leading-circle + 2 text lines + trailing tag. */
export function ListSkeleton({
  rows = 4,
  className = '',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <ul className={`flex flex-col divide-y divide-refresh-line ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-3">
          <SkeletonCircle size="h-9 w-9" />
          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
            <Skeleton width="w-3/5" height="h-3.5" />
            <Skeleton width="w-2/5" height="h-3" />
          </div>
          <Skeleton width="w-12" height="h-4" />
        </li>
      ))}
    </ul>
  );
}

/** Activity feed — N rows with rail dot + title + meta. */
export function TimelineSkeleton({
  rows = 4,
  className = '',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <ol className={`relative flex flex-col ${className}`}>
      {Array.from({ length: rows }).map((_, i) => {
        const isLast = i === rows - 1;
        return (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="relative flex flex-col items-center">
              <SkeletonCircle size="h-3 w-3" />
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-1/2 top-3 -translate-x-1/2 h-[calc(100%-0.75rem)] w-px bg-refresh-line"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-1.5 pb-1">
              <Skeleton width="w-2/5" height="h-3.5" />
              <Skeleton width="w-1/4" height="h-3" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Stacked-discount placeholder — 3 rows shaped like DiscountStack. */
export function DiscountStackSkeleton({
  rows = 3,
  className = '',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-1.5 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg bg-refresh-surface px-3 py-2"
        >
          <Skeleton width="w-16" height="h-4" rounded="rounded-full" />
          <Skeleton width="w-2/5" height="h-3.5" className="flex-1" />
          <Skeleton width="w-12" height="h-3.5" />
        </li>
      ))}
    </ul>
  );
}

/** Top-N ranking — N rows of rank + label + bar + value. */
export function HorizontalBarRankingSkeleton({
  rows = 5,
  className = '',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <ol className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3">
          <Skeleton width="w-4" height="h-3" />
          <Skeleton width="w-32 sm:w-40" height="h-3.5" />
          <Skeleton
            width="w-full"
            height="h-2"
            rounded="rounded-full"
            className="flex-1"
          />
          <Skeleton width="w-12" height="h-3.5" />
        </li>
      ))}
    </ol>
  );
}

/* ─────────── Receipt / ShiftPunchCard / Calendar ─────────── */

/** Paper receipt — header + 3 items + totals. White surface, no zigzag. */
export function ReceiptSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white px-6 py-7 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Skeleton width="w-1/2" height="h-5" />
        <Skeleton width="w-2/3" height="h-3" />
      </div>
      <hr className="my-3 border-t border-[#111315]/15" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-baseline justify-between gap-3">
            <div className="flex-1">
              <Skeleton width="w-2/3" height="h-3.5" />
              <Skeleton width="w-1/3" height="h-2.5" className="mt-1" />
            </div>
            <Skeleton width="w-12" height="h-3.5" />
          </div>
        ))}
      </div>
      <hr className="my-3 border-t border-[#111315]/15" />
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Skeleton width="w-16" height="h-3" />
          <Skeleton width="w-12" height="h-3" />
        </div>
        <div className="flex justify-between">
          <Skeleton width="w-12" height="h-3" />
          <Skeleton width="w-10" height="h-3" />
        </div>
        <div className="mt-1 flex justify-between border-t-2 border-[#111315]/15 pt-2">
          <Skeleton width="w-14" height="h-4" />
          <Skeleton width="w-16" height="h-4" />
        </div>
      </div>
    </div>
  );
}

/** Shift punch card — avatar + name/role + timer + actions. */
export function ShiftPunchCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-refresh-line bg-refresh-surface-2 p-4 ${className}`}
    >
      <SkeletonCircle size="h-12 w-12" />
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <Skeleton width="w-1/2" height="h-4" />
        <Skeleton width="w-1/3" height="h-3" />
      </div>
      <Skeleton width="w-20" height="h-9" rounded="rounded-lg" />
    </div>
  );
}

/** Month calendar — header + weekday row + 6 weeks of square cells. */
export function CalendarSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-refresh-line bg-refresh-surface-2 p-3 ${className}`}
    >
      <header className="mb-2 flex items-center justify-between px-1">
        <SkeletonCircle size="h-7 w-7" />
        <Skeleton width="w-32" height="h-4" />
        <SkeletonCircle size="h-7 w-7" />
      </header>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`wd-${i}`} className="flex justify-center pb-1.5">
            <Skeleton width="w-6" height="h-2.5" />
          </div>
        ))}
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={`day-${i}`} className="aspect-square p-1">
            <Skeleton width="w-full" height="h-full" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Charts ─────────── */

/** Generic line/bar/area chart placeholder — y-axis grid + animated bars. */
export function ChartSkeleton({
  height = 240,
  className = '',
}: {
  height?: number;
  className?: string;
}) {
  // 12 randomized-looking heights driven by index so renders are stable.
  const bars = [62, 84, 73, 92, 58, 67, 81, 95, 70, 86, 78, 90];
  return (
    <div
      className={`flex flex-col gap-2 ${className}`}
      style={{ height: height + 24 }}
    >
      {/* Y-axis grid pattern */}
      <div className="relative flex-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            aria-hidden
            className="absolute left-0 right-0 border-t border-refresh-line"
            style={{ top: `${(i / 4) * 100}%` }}
          />
        ))}
        {/* Bars */}
        <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1.5 px-2">
          {bars.map((h, i) => (
            <Skeleton
              key={i}
              width="flex-1"
              height={`h-[${h}%]`}
              rounded="rounded-t-md"
              className="!w-auto"
            />
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between px-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width="w-8" height="h-2.5" />
        ))}
      </div>
    </div>
  );
}

/** Donut chart placeholder — ring shape with center label. */
export function DonutChartSkeleton({
  size = 200,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const ring = size * 0.18; // ring thickness
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className="block animate-pulse rounded-full bg-refresh-surface-3"
        style={{
          width: size,
          height: size,
          // CSS conic-gradient mask would require utility; fake the donut
          // with an inset white circle on a surface-3 outer ring.
          mask: `radial-gradient(circle, transparent ${size / 2 - ring}px, black ${size / 2 - ring + 1}px)`,
          WebkitMask: `radial-gradient(circle, transparent ${size / 2 - ring}px, black ${size / 2 - ring + 1}px)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <Skeleton width="w-12" height="h-2" />
        <Skeleton width="w-16" height="h-5" />
      </div>
    </div>
  );
}

/* ─────────── Avatar / AvatarGroup helpers ─────────── */

/** Stacked avatar group — N overlapping circles. */
export function AvatarGroupSkeleton({
  count = 4,
  size = 'h-8 w-8',
  className = '',
}: {
  count?: number;
  size?: string;
  className?: string;
}) {
  return (
    <div className={`flex -space-x-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCircle key={i} size={size} className="ring-2 ring-refresh-bg" />
      ))}
    </div>
  );
}

/* ─────────── Hero ─────────── */

/** Page intro block placeholder — eyebrow + headline + lede + CTAs. */
export function HeroSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`grid gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:py-16 ${className}`}
    >
      <div className="flex flex-col gap-4">
        <Skeleton width="w-20" height="h-3" />
        <Skeleton width="w-full" height="h-10" />
        <Skeleton width="w-3/4" height="h-10" />
        <SkeletonText lines={2} className="mt-2 max-w-xl" />
        <div className="mt-2 flex gap-3">
          <Skeleton width="w-32" height="h-10" rounded="rounded-[10px]" />
          <Skeleton width="w-32" height="h-10" rounded="rounded-[10px]" />
        </div>
      </div>
      <div className="hidden items-center justify-center md:flex">
        <Skeleton width="w-full" height="h-40" />
      </div>
    </div>
  );
}
