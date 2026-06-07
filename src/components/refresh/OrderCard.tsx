import type { ReactNode } from 'react';
import { OrderStatusBadge, OrderTimer, type OrderStatus } from './StatusBadges';
import { PriceDisplay } from './PriceDisplay';

export type OrderCardLine = {
  qty: number;
  name: string;
  price: number;
  modifiers?: string[];
};

export type OrderCardProps = {
  /** Order number / reference (e.g. "#042"). */
  orderNumber: string;
  /** Optional table label or pickup window (e.g. "Table 5", "Pickup", "Delivery"). */
  channel?: string;
  status: OrderStatus;
  /** When provided, renders an OrderTimer chip showing elapsed time. */
  placedAt?: Date | number;
  lines: OrderCardLine[];
  /** Total including tax/tip. */
  total: number;
  currency?: string;
  locale?: string;
  /** Footer slot — drop in Buttons (e.g. "Mark ready", "Print receipt"). */
  actions?: ReactNode;
  /** Whole-card click handler — useful in lists. */
  onClick?: () => void;
  className?: string;
};

/**
 * Compact summary card for a single order. Used in order history lists, kitchen displays,
 * delivery dashboards. Composes OrderStatusBadge + OrderTimer + PriceDisplay primitives.
 */
export function OrderCard({
  orderNumber,
  channel,
  status,
  placedAt,
  lines,
  total,
  currency = 'USD',
  locale = 'en-US',
  actions,
  onClick,
  className = '',
}: OrderCardProps) {
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  const inner = (
    <>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-refresh-text">{orderNumber}</span>
            {channel && (
              <span className="rounded-md bg-refresh-surface px-2 py-0.5 text-[11px] font-medium text-refresh-muted">
                {channel}
              </span>
            )}
          </div>
          {placedAt != null && (
            <div className="mt-1.5">
              <OrderTimer startedAt={placedAt} />
            </div>
          )}
        </div>
        <OrderStatusBadge status={status} size="sm" />
      </header>

      <ul className="mt-3 space-y-1 text-sm">
        {lines.slice(0, 3).map((l, i) => (
          <li key={i} className="flex justify-between text-refresh-muted">
            <span className="truncate">
              <span className="font-semibold text-refresh-text">{l.qty}×</span> {l.name}
            </span>
            <span className="ml-3 shrink-0 tabular-nums text-refresh-muted-2">
              {formatMoney(l.price, currency, locale)}
            </span>
          </li>
        ))}
        {lines.length > 3 && (
          <li className="text-xs text-refresh-muted-2">+ {lines.length - 3} more items</li>
        )}
      </ul>

      <footer className="mt-3 flex items-center justify-between border-t border-refresh-line pt-3">
        <span className="text-xs text-refresh-muted-2">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <PriceDisplay amount={total} currency={currency} locale={locale} size="md" orientation="inline" />
      </footer>
      {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>}
    </>
  );

  const baseCls =
    'block rounded-xl border border-refresh-line bg-refresh-surface-2 p-4 text-left transition';
  const interactive = onClick
    ? `${baseCls} hover:border-refresh-muted-2 hover:bg-refresh-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg`
    : baseCls;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full ${interactive} ${className}`}>
        {inner}
      </button>
    );
  }
  return <div className={`${interactive} ${className}`}>{inner}</div>;
}

function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
