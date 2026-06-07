import type { OrderStatus } from './StatusBadges';

export type OrderStatusStep = {
  status: OrderStatus;
  /** Display label (defaults to a humanized status name). */
  label?: string;
  /** When set, the step is marked done with this timestamp. */
  at?: Date | number | string;
};

export type OrderStatusTimelineProps = {
  /** Steps in chronological order. The first un-`at` step becomes "current". */
  steps: OrderStatusStep[];
  /** When true, lays the steps out horizontally (good for a wide kitchen display). Default false (vertical). */
  horizontal?: boolean;
  /** Locale used for `at` timestamp formatting. */
  locale?: string;
  className?: string;
};

const defaultLabels: Record<OrderStatus, string> = {
  pending: 'Placed',
  'in-kitchen': 'Preparing',
  ready: 'Ready',
  'out-for-delivery': 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatTime(at: Date | number | string, locale: string): string {
  const d = at instanceof Date ? at : new Date(at);
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

/**
 * Visual timeline of an order's progression through statuses. Combines
 * `OrderStatusBadge` semantics with a Timeline-style rail. Done steps show
 * their timestamp; the current step pulses; future steps are muted.
 */
export function OrderStatusTimeline({
  steps,
  horizontal = false,
  locale = 'en-US',
  className = '',
}: OrderStatusTimelineProps) {
  if (steps.length === 0) return null;

  // First step without `at` is the current one; everything after is future.
  const currentIndex = steps.findIndex((s) => s.at == null);

  if (horizontal) {
    return (
      <ol className={`flex items-start gap-2 ${className}`}>
        {steps.map((step, i) => {
          const state =
            currentIndex === -1 || i < currentIndex
              ? 'done'
              : i === currentIndex
              ? 'current'
              : 'future';
          return (
            <li
              key={step.status + i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-full ${dotClass(state)}`}
              />
              <span className={`text-xs font-medium ${labelClass(state)}`}>
                {step.label ?? defaultLabels[step.status]}
              </span>
              {step.at && (
                <span className="text-[10px] text-refresh-muted-2 tabular-nums">
                  {formatTime(step.at, locale)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  // Vertical rail layout.
  return (
    <ol className={`relative flex flex-col ${className}`}>
      {steps.map((step, i) => {
        const state =
          currentIndex === -1 || i < currentIndex
            ? 'done'
            : i === currentIndex
            ? 'current'
            : 'future';
        const isLast = i === steps.length - 1;
        return (
          <li key={step.status + i} className="relative flex gap-3 pb-4 last:pb-0">
            <div className="relative flex flex-col items-center">
              <span
                aria-hidden
                className={`relative z-10 h-2.5 w-2.5 rounded-full ring-2 ring-refresh-bg ${dotClass(state)}`}
              />
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-1/2 top-2.5 -translate-x-1/2 h-[calc(100%-0.625rem)] w-px bg-refresh-line"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1 -mt-0.5">
              <p className={`text-sm ${labelClass(state)}`}>
                {step.label ?? defaultLabels[step.status]}
              </p>
              {step.at && (
                <p className="text-[11px] text-refresh-muted-2 tabular-nums">
                  {formatTime(step.at, locale)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function dotClass(state: 'done' | 'current' | 'future'): string {
  if (state === 'done') return 'bg-refresh-sage';
  if (state === 'current') return 'bg-refresh-blue refresh-pulse';
  return 'bg-refresh-surface-3';
}

function labelClass(state: 'done' | 'current' | 'future'): string {
  if (state === 'done') return 'font-medium text-refresh-text';
  if (state === 'current') return 'font-semibold text-refresh-text';
  return 'text-refresh-muted-2';
}
