'use client';

import { useMemo, useState } from 'react';

export type RefundLine = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
};

export type RefundReason = {
  id: string;
  label: string;
};

export type RefundSelection = {
  /** Map of line id → qty being refunded. */
  itemQuantities: Record<string, number>;
  reason?: string;
  /** Optional payment method to route refund to. */
  refundTo?: string;
  notes?: string;
};

export type RefundFlowProps = {
  lines: RefundLine[];
  value: RefundSelection;
  onChange: (next: RefundSelection) => void;
  /** Reason chips. Default: ['Wrong item', 'Damaged', 'Customer changed mind', 'Quality issue']. */
  reasonOptions?: RefundReason[];
  /** Refund-target payment methods. Default ['Original method', 'Cash', 'Store credit']. */
  refundTargets?: string[];
  currency?: string;
  locale?: string;
  className?: string;
};

const DEFAULT_REASONS: RefundReason[] = [
  { id: 'wrong-item', label: 'Wrong item' },
  { id: 'damaged', label: 'Damaged' },
  { id: 'changed-mind', label: 'Customer changed mind' },
  { id: 'quality', label: 'Quality issue' },
];

const DEFAULT_TARGETS = ['Original method', 'Cash', 'Store credit'];

/**
 * Refund composition flow — pick items + qty, choose reason, route to a payment method, add notes.
 * Reports a RefundSelection; consumers handle the actual payment-system call.
 */
export function RefundFlow({
  lines,
  value,
  onChange,
  reasonOptions = DEFAULT_REASONS,
  refundTargets = DEFAULT_TARGETS,
  currency = 'USD',
  locale = 'en-US',
  className = '',
}: RefundFlowProps) {
  const [customReason, setCustomReason] = useState(
    value.reason && !reasonOptions.find((r) => r.label === value.reason) ? value.reason : ''
  );
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  const setQty = (id: string, qty: number) => {
    const cleaned = Math.max(0, qty);
    onChange({
      ...value,
      itemQuantities: { ...value.itemQuantities, [id]: cleaned },
    });
  };

  const total = useMemo(() => {
    return lines.reduce((sum, l) => {
      const refundQty = value.itemQuantities[l.id] ?? 0;
      return sum + refundQty * l.unitPrice;
    }, 0);
  }, [lines, value.itemQuantities]);

  return (
    <div role="group" aria-label="Refund" className={`flex flex-col gap-5 ${className}`}>
      {/* Line items */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-refresh-muted">Items to refund</p>
        <ul className="flex flex-col gap-1.5">
          {lines.map((line) => {
            const refundQty = value.itemQuantities[line.id] ?? 0;
            const allChosen = refundQty === line.qty;
            return (
              <li
                key={line.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-refresh-line bg-refresh-surface-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-refresh-text">{line.name}</p>
                  <p className="text-xs text-refresh-muted-2">
                    Original: {line.qty} × {formatter.format(line.unitPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-stretch overflow-hidden rounded-md border border-refresh-surface-3 bg-refresh-surface">
                    <button
                      type="button"
                      aria-label={`Refund less of ${line.name}`}
                      disabled={refundQty <= 0}
                      onClick={() => setQty(line.id, refundQty - 1)}
                      className="h-8 w-8 text-refresh-text transition hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>
                    <span
                      aria-live="polite"
                      className="flex h-8 w-9 items-center justify-center border-x border-refresh-line text-xs font-bold tabular-nums text-refresh-text"
                    >
                      {refundQty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Refund more of ${line.name}`}
                      disabled={refundQty >= line.qty}
                      onClick={() => setQty(line.id, refundQty + 1)}
                      className="h-8 w-8 text-refresh-text transition hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQty(line.id, allChosen ? 0 : line.qty)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text"
                  >
                    {allChosen ? 'Clear' : 'All'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Reason */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-refresh-muted">Reason</p>
        <div className="flex flex-wrap gap-1.5">
          {reasonOptions.map((r) => {
            const active = value.reason === r.label;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onChange({ ...value, reason: r.label });
                  setCustomReason('');
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
                  active
                    ? 'bg-refresh-text text-refresh-bg'
                    : 'bg-refresh-surface text-refresh-muted hover:bg-refresh-surface-3 hover:text-refresh-text'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          placeholder="Or enter a custom reason…"
          value={customReason}
          onChange={(e) => {
            setCustomReason(e.target.value);
            onChange({ ...value, reason: e.target.value || undefined });
          }}
          className="h-9 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-3 text-sm text-refresh-text transition hover:border-refresh-muted-2 focus:outline-none focus-visible:border-refresh-text focus-visible:ring-2 focus-visible:ring-refresh-text/20"
        />
      </div>

      {/* Refund target */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-refresh-muted">Refund to</p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          {refundTargets.map((target) => {
            const active = value.refundTo === target;
            return (
              <button
                key={target}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...value, refundTo: target })}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
                  active
                    ? 'border-refresh-text bg-refresh-text text-refresh-bg'
                    : 'border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2'
                }`}
              >
                {target}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-refresh-muted">Internal notes (optional)</span>
        <textarea
          rows={3}
          value={value.notes ?? ''}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="Visible to staff only — not on the receipt."
          className="rounded-lg border border-refresh-surface-3 bg-refresh-surface px-3 py-2 text-sm text-refresh-text transition hover:border-refresh-muted-2 focus:outline-none focus-visible:border-refresh-text focus-visible:ring-2 focus-visible:ring-refresh-text/20"
        />
      </label>

      {/* Total */}
      <div className="flex items-center justify-between rounded-lg bg-refresh-pink/10 px-3 py-2.5">
        <span className="text-sm font-semibold text-refresh-muted">Refund total</span>
        <span className="text-lg font-bold tabular-nums text-refresh-pink">
          −{formatter.format(total)}
        </span>
      </div>
    </div>
  );
}
