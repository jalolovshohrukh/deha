'use client';

import type { ReactNode } from 'react';
import { OrderStatusBadge, type OrderStatus } from './StatusBadges';
import { PriceDisplay } from './PriceDisplay';

export type CartLine = {
  id: string;
  name: string;
  qty: number;
  /** Per-unit price. Subtotal = qty × unitPrice + sum(modifiers.priceDelta). */
  unitPrice: number;
  /** Sub-line modifiers (e.g. "Extra cheese +$1.50"). Each shows under the main name. */
  modifiers?: Array<{ id: string; label: string; priceDelta?: number }>;
  /** Optional per-line discount note (e.g. "−10% loyalty"). */
  discountLabel?: string;
  /** Optional product photo URL — when set, a thumbnail tile renders next to the qty stepper. */
  photoSrc?: string;
  /** Optional SKU shown below the line name (retail / inventory contexts). */
  sku?: string;
  /** Optional barcode shown alongside the SKU. */
  barcode?: string;
  /** Optional unit label for the qty (e.g. "pcs", "kg", "L"). When set, shows next to the qty number. */
  unit?: string;
  /** Optional seller / cashier attribution (retail per-line attribution). */
  seller?: string;
};

export type CartTotalsRow = {
  id: string;
  label: string;
  /** Negative numbers display in pink (discounts/refunds). */
  amount: number;
  /** Optional secondary label (e.g. "(15%)" for tip). */
  hint?: string;
  /** When true, this row is bold and uses larger type — typically the final total. */
  emphasis?: boolean;
};

export type CartProps = {
  /** Order reference shown in the header (e.g. "#042"). */
  orderNumber?: string;
  /** Optional channel / table / pickup label (e.g. "Table 5", "Pickup"). */
  channel?: string;
  /** Optional status badge in the top-right of the header. */
  status?: OrderStatus;
  /** Order line items. */
  lines: CartLine[];
  /** Click on a line — opens line editor / modifier sheet. */
  onLineClick?: (line: CartLine) => void;
  /** Quantity change handler (qty stepper on each line). When omitted, qty is read-only. */
  onQtyChange?: (id: string, qty: number) => void;
  /** Remove handler — when omitted, no remove button is shown. */
  onRemove?: (id: string) => void;
  /** Edit-price handler — when set, the line price becomes a clickable button (retail price overrides). */
  onPriceEdit?: (id: string) => void;
  /** Totals rows below the line items (subtotal, tax, tip, discount, total). */
  totals: CartTotalsRow[];
  /** Footer slot — typically the primary "Pay" button. */
  footer?: ReactNode;
  /** Empty-state content shown when lines.length === 0. */
  emptyState?: ReactNode;
  /**
   * Replace the entire header with a custom node. When set, the default header
   * (eyebrow + order # + channel + status) is not rendered. Useful for retail flows
   * with their own header shape.
   */
  header?: ReactNode;
  /**
   * Hide the totals stack — useful when the consumer renders totals outside the Cart
   * (e.g. in a separate summary panel).
   */
  hideTotals?: boolean;
  /**
   * Hide the footer wrapper — useful when the primary CTA lives outside the Cart
   * (e.g. in a separate summary panel).
   */
  hideFooter?: boolean;
  /**
   * Strip the outer card chrome (border, rounded corners, background tint).
   * Use when Cart is rendered inside another container that already provides framing.
   */
  bare?: boolean;
  currency?: string;
  locale?: string;
  className?: string;
};

/**
 * Composed order panel — the full cart sidebar of a POS app. Combines header,
 * line items (with optional qty stepper + modifier sub-lines + remove), totals
 * stack, and a footer slot for the primary CTA.
 *
 * Composes: OrderStatusBadge, PriceDisplay. Lines remain interactive via
 * onLineClick / onQtyChange / onRemove.
 *
 * @example
 *   <Cart
 *     orderNumber="#042"
 *     channel="Table 5"
 *     status="in-kitchen"
 *     lines={cartLines}
 *     onQtyChange={updateQty}
 *     onRemove={removeLine}
 *     totals={[
 *       { id: 'subtotal', label: 'Subtotal', amount: 42.50 },
 *       { id: 'tax', label: 'Tax', amount: 3.40 },
 *       { id: 'tip', label: 'Tip', amount: 7.65, hint: '(18%)' },
 *       { id: 'total', label: 'Total', amount: 53.55, emphasis: true },
 *     ]}
 *     footer={<Button fullWidth size="lg">Pay $53.55</Button>}
 *   />
 */
export function Cart({
  orderNumber,
  channel,
  status,
  lines,
  onLineClick,
  onQtyChange,
  onRemove,
  onPriceEdit,
  totals,
  footer,
  emptyState,
  header,
  hideTotals = false,
  hideFooter = false,
  bare = false,
  currency = 'USD',
  locale = 'en-US',
  className = '',
}: CartProps) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <aside
      aria-label="Cart"
      className={`flex h-full flex-col overflow-hidden ${
        bare
          ? ''
          : 'rounded-2xl border border-refresh-line bg-refresh-surface-2'
      } ${className}`}
    >
      {/* Header — overridable via the `header` prop */}
      {header ? (
        header
      ) : (
      <header className="flex items-start justify-between gap-3 border-b border-refresh-line px-5 py-4">
        <div className="min-w-0">
          <p className="refresh-eyebrow">Cart</p>
          <div className="mt-1 flex items-center gap-2">
            {orderNumber && (
              <span className="text-lg font-bold text-refresh-text">{orderNumber}</span>
            )}
            {channel && (
              <span className="rounded-md bg-refresh-surface px-2 py-0.5 text-[11px] font-medium text-refresh-muted">
                {channel}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-refresh-muted-2">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        {status && <OrderStatusBadge status={status} size="sm" />}
      </header>
      )}

      {/* Line items */}
      <div className="refresh-scroll flex-1 overflow-y-auto px-2 py-2">
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 py-12">
            {emptyState ?? (
              <p className="text-center text-sm text-refresh-muted">
                Cart is empty. Add items from the menu to start an order.
              </p>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {lines.map((line) => (
              <li key={line.id}>
                <CartLineRow
                  line={line}
                  formatter={formatter}
                  onClick={onLineClick}
                  onQtyChange={onQtyChange}
                  onRemove={onRemove}
                  onPriceEdit={onPriceEdit}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals */}
      {!hideTotals && totals.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-refresh-line px-5 py-4">
          {totals.map((row) => {
            const isNeg = row.amount < 0;
            const display = formatter.format(Math.abs(row.amount));
            return (
              <div
                key={row.id}
                className={`flex items-baseline justify-between ${
                  row.emphasis ? 'mt-1 border-t border-refresh-line pt-3' : ''
                }`}
              >
                <span
                  className={`flex items-baseline gap-1.5 ${
                    row.emphasis
                      ? 'text-base font-bold text-refresh-text'
                      : 'text-xs text-refresh-muted'
                  }`}
                >
                  {row.label}
                  {row.hint && (
                    <span className="text-[10px] tabular-nums text-refresh-muted-2">
                      {row.hint}
                    </span>
                  )}
                </span>
                {row.emphasis ? (
                  <PriceDisplay
                    amount={row.amount}
                    currency={currency}
                    locale={locale}
                    size="lg"
                  />
                ) : (
                  <span
                    className={`tabular-nums ${
                      isNeg ? 'font-semibold text-refresh-pink' : 'text-refresh-text'
                    }`}
                  >
                    {isNeg ? '−' : ''}
                    {display}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!hideFooter && footer && (
        <div className="border-t border-refresh-line px-5 py-4">{footer}</div>
      )}
    </aside>
  );
}

// ─────────── Internal: line row ───────────

function CartLineRow({
  line,
  formatter,
  onClick,
  onQtyChange,
  onRemove,
  onPriceEdit,
}: {
  line: CartLine;
  formatter: Intl.NumberFormat;
  onClick?: (line: CartLine) => void;
  onQtyChange?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
  onPriceEdit?: (id: string) => void;
}) {
  const modifierTotal =
    line.modifiers?.reduce((sum, m) => sum + (m.priceDelta ?? 0), 0) ?? 0;
  const lineTotal = (line.unitPrice + modifierTotal) * line.qty;

  const interactive = !!onClick;

  const inner = (
    <div className="flex items-start gap-3 px-3 py-2.5">
      {onQtyChange ? (
        <div
          className="inline-flex shrink-0 items-stretch overflow-hidden rounded-md border border-refresh-surface-3 bg-refresh-surface"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Decrease ${line.name}`}
            disabled={line.qty <= 0}
            onClick={() => onQtyChange(line.id, Math.max(0, line.qty - 1))}
            className="h-7 w-7 text-refresh-text transition hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="flex h-7 min-w-[40px] items-center justify-center gap-1 border-x border-refresh-line text-xs font-bold tabular-nums text-refresh-text"
          >
            {line.qty}
            {line.unit && <span className="text-[10px] font-medium text-refresh-muted-2">{line.unit}</span>}
          </span>
          <button
            type="button"
            aria-label={`Increase ${line.name}`}
            onClick={() => onQtyChange(line.id, line.qty + 1)}
            className="h-7 w-7 text-refresh-text transition hover:bg-refresh-surface-3"
          >
            +
          </button>
        </div>
      ) : (
        <span
          aria-hidden
          className="flex h-6 min-w-[28px] shrink-0 items-center justify-center gap-1 rounded-md bg-refresh-surface px-1 text-xs font-bold tabular-nums text-refresh-text"
        >
          {line.qty}
          {line.unit && <span className="text-[10px] font-medium text-refresh-muted-2">{line.unit}</span>}
        </span>
      )}

      {/* Optional product photo (retail) */}
      {line.photoSrc !== undefined && (
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-refresh-surface-3"
        >
          {line.photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={line.photoSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-refresh-muted-2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          )}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-refresh-text">{line.name}</p>
        {(line.sku || line.barcode) && (
          <p className="mt-0.5 truncate text-[11px] tabular-nums text-refresh-muted-2">
            {[line.sku, line.barcode].filter(Boolean).join(' / ')}
          </p>
        )}
        {line.modifiers && line.modifiers.length > 0 && (
          <ul className="mt-0.5 flex flex-col gap-0.5">
            {line.modifiers.map((m) => (
              <li
                key={m.id}
                className="flex items-baseline justify-between gap-2 text-[11px] text-refresh-muted-2"
              >
                <span className="truncate">+ {m.label}</span>
                {m.priceDelta != null && m.priceDelta !== 0 && (
                  <span className="shrink-0 tabular-nums">
                    {m.priceDelta > 0 ? '+' : ''}
                    {formatter.format(m.priceDelta)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {line.discountLabel && (
          <p className="mt-0.5 text-[11px] font-semibold text-refresh-pink">
            {line.discountLabel}
          </p>
        )}
      </div>

      <div
        className="flex shrink-0 flex-col items-end gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {onPriceEdit ? (
          <button
            type="button"
            aria-label={`Edit price for ${line.name}`}
            onClick={() => onPriceEdit(line.id)}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-bold tabular-nums text-refresh-blue transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text"
          >
            {formatter.format(lineTotal)}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        ) : (
          <span className="text-sm font-bold tabular-nums text-refresh-text">
            {formatter.format(lineTotal)}
          </span>
        )}
        {line.seller && (
          <span className="text-[11px] text-refresh-muted-2">{line.seller}</span>
        )}
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove ${line.name}`}
            onClick={() => onRemove(line.id)}
            className="rounded-md p-1 text-refresh-muted-2 transition hover:bg-refresh-pink/10 hover:text-refresh-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-pink"
          >
            <span aria-hidden className="text-xs leading-none">
              ✕
            </span>
          </button>
        )}
      </div>
    </div>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onClick(line)}
        className="block w-full rounded-lg text-left transition hover:bg-refresh-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
      >
        {inner}
      </button>
    );
  }
  return <div className="rounded-lg">{inner}</div>;
}
