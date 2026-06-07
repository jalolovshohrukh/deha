type DiscountKind = 'percent' | 'amount' | 'loyalty' | 'promo';

const kindLabel: Record<DiscountKind, string> = {
  percent: 'Discount',
  amount: 'Discount',
  loyalty: 'Loyalty',
  promo: 'Promo',
};

const kindToneClass: Record<DiscountKind, string> = {
  percent: 'bg-refresh-pink text-refresh-on-pastel',
  amount: 'bg-refresh-pink text-refresh-on-pastel',
  loyalty: 'bg-refresh-lavender text-refresh-on-pastel',
  promo: 'bg-refresh-blue text-refresh-on-pastel',
};

export type DiscountEntry = {
  id: string;
  kind: DiscountKind;
  /** Human-readable label rendered next to the kind chip (e.g. promo code, "VIP customer"). */
  label?: React.ReactNode;
  /** Percent off when kind === 'percent'. 10 = 10% off. */
  percent?: number;
  /** Absolute amount off in major currency units when kind !== 'percent'. */
  amount?: number;
  /** When set, the entry is rendered struck-through (e.g. discount no longer valid). */
  invalid?: boolean;
};

export type DiscountStackProps = {
  /** Pre-discount subtotal — used to compute percent-off amounts. */
  subtotal: number;
  /** All applied discounts in stacking order (top = first applied). */
  discounts: DiscountEntry[];
  /** Per-entry remove handler — when set, an × button shows on each row. */
  onRemove?: (id: string) => void;
  currency?: string;
  locale?: string;
  /** When true, show the running total after each discount in the right column. Default false. */
  showRunningTotal?: boolean;
  className?: string;
};

/**
 * Stacked breakdown of every discount applied to an order — kind chip,
 * label, computed amount off, and an optional × to remove. Pair with
 * `PriceDisplay` to show the final total below.
 *
 * @example
 *   <DiscountStack
 *     subtotal={42.50}
 *     discounts={[
 *       { id: 'l',  kind: 'loyalty', label: 'Gold tier', percent: 5 },
 *       { id: 'p',  kind: 'promo',   label: 'WELCOME10', percent: 10 },
 *       { id: 'm',  kind: 'amount',  label: 'Manager',   amount: 2 },
 *     ]}
 *     onRemove={(id) => removeDiscount(id)}
 *     showRunningTotal
 *   />
 */
export function DiscountStack({
  subtotal,
  discounts,
  onRemove,
  currency = 'USD',
  locale = 'en-US',
  showRunningTotal = false,
  className = '',
}: DiscountStackProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);

  if (discounts.length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-refresh-surface-3 bg-refresh-surface-2/40 px-4 py-3 text-center text-xs text-refresh-muted-2 ${className}`}
      >
        No discounts applied.
      </div>
    );
  }

  // Walk the stack to compute running totals.
  let running = subtotal;
  return (
    <ul className={`flex flex-col gap-1.5 ${className}`}>
      {discounts.map((d) => {
        const off =
          d.percent != null ? running * (d.percent / 100) : d.amount ?? 0;
        if (!d.invalid) running -= off;

        return (
          <li
            key={d.id}
            className={`flex items-center gap-3 rounded-lg bg-refresh-surface px-3 py-2 ${
              d.invalid ? 'opacity-50' : ''
            }`}
          >
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${kindToneClass[d.kind]}`}
            >
              {kindLabel[d.kind]}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-sm text-refresh-text ${
                d.invalid ? 'line-through' : ''
              }`}
            >
              {d.label ??
                (d.percent != null ? `${d.percent}% off` : `${fmt(d.amount ?? 0)} off`)}
            </span>
            <span
              className={`shrink-0 text-sm font-semibold tabular-nums ${
                d.invalid ? 'text-refresh-muted-2 line-through' : 'text-refresh-pink'
              }`}
            >
              −{fmt(off)}
            </span>
            {showRunningTotal && (
              <span className="hidden shrink-0 text-xs text-refresh-muted-2 tabular-nums sm:inline">
                → {fmt(running)}
              </span>
            )}
            {onRemove && (
              <button
                type="button"
                aria-label={`Remove ${typeof d.label === 'string' ? d.label : d.kind} discount`}
                onClick={() => onRemove(d.id)}
                className="shrink-0 rounded-md p-1 text-refresh-muted-2 transition hover:bg-refresh-surface-3 hover:text-refresh-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
              >
                <span aria-hidden className="text-sm leading-none">
                  ✕
                </span>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
