'use client';

import { useState } from 'react';
import { CurrencyInput } from './CurrencyInput';

export type DiscountMode = 'percent' | 'amount';
export type DiscountScope = 'item' | 'order';

export type DiscountValue = {
  mode: DiscountMode;
  /** Percent as a whole number (10 = 10%). */
  percent?: number;
  /** Absolute amount in currency units. */
  amount?: number;
  /** What does this apply to. */
  scope: DiscountScope;
  /** Reason text shown on the receipt and in reports. */
  reason?: string;
};

export type DiscountReason = {
  id: string;
  label: string;
};

export type DiscountPickerProps = {
  value: DiscountValue;
  onChange: (next: DiscountValue) => void;
  /** Subtotal — used to render the calculated savings preview. */
  subtotal?: number;
  /** Predefined reason chips. Default: ['Manager comp', 'Promo', 'Loyalty', 'Damaged']. */
  reasonOptions?: DiscountReason[];
  /**
   * Quick-pick percentage chips rendered below the value input. When omitted (or empty),
   * no preset chips are shown. Selecting one sets `mode: 'percent'` and `percent: <preset>`.
   */
  presets?: number[];
  currency?: string;
  locale?: string;
  /** Allow toggling between item-level and order-level scope. Default true. */
  showScope?: boolean;
  className?: string;
};

const DEFAULT_REASONS: DiscountReason[] = [
  { id: 'manager-comp', label: 'Manager comp' },
  { id: 'promo', label: 'Promo' },
  { id: 'loyalty', label: 'Loyalty' },
  { id: 'damaged', label: 'Damaged' },
];

/**
 * Discount picker — % vs $ toggle, value entry, optional scope toggle, reason chips.
 *
 * @example
 *   <DiscountPicker value={discount} onChange={setDiscount} subtotal={42.50} />
 */
export function DiscountPicker({
  value,
  onChange,
  subtotal,
  reasonOptions = DEFAULT_REASONS,
  presets,
  currency = 'USD',
  locale = 'en-US',
  showScope = true,
  className = '',
}: DiscountPickerProps) {
  const [customReason, setCustomReason] = useState(
    value.reason && !reasonOptions.find((r) => r.label === value.reason) ? value.reason : ''
  );
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  const calculated =
    value.mode === 'percent'
      ? ((value.percent ?? 0) / 100) * (subtotal ?? 0)
      : value.amount ?? 0;

  return (
    <div role="group" aria-label="Discount" className={`flex flex-col gap-4 ${className}`}>
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-refresh-surface p-1">
        <button
          type="button"
          aria-pressed={value.mode === 'percent'}
          onClick={() => onChange({ ...value, mode: 'percent', amount: undefined })}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            value.mode === 'percent'
              ? 'bg-refresh-surface-3 text-refresh-text'
              : 'text-refresh-muted hover:text-refresh-text'
          }`}
        >
          Percent
        </button>
        <button
          type="button"
          aria-pressed={value.mode === 'amount'}
          onClick={() => onChange({ ...value, mode: 'amount', percent: undefined })}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            value.mode === 'amount'
              ? 'bg-refresh-surface-3 text-refresh-text'
              : 'text-refresh-muted hover:text-refresh-text'
          }`}
        >
          Amount
        </button>
      </div>

      {/* Value input */}
      {value.mode === 'percent' ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-refresh-muted">Discount %</span>
          <span className="inline-flex items-center rounded-lg border border-refresh-surface-3 bg-refresh-surface focus-within:border-refresh-text focus-within:ring-2 focus-within:ring-refresh-text/20">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={value.percent ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  percent: e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value))),
                })
              }
              placeholder="0"
              className="h-11 flex-1 bg-transparent px-3 text-base font-semibold tabular-nums text-refresh-text outline-none"
            />
            <span className="pr-3 font-semibold text-refresh-muted">%</span>
          </span>
        </label>
      ) : (
        <CurrencyInput
          label="Discount amount"
          value={value.amount ?? null}
          onChange={(amount) => onChange({ ...value, amount: amount ?? undefined })}
          currency={currency}
          locale={locale}
        />
      )}

      {/* Preset percentage chips */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick-pick percentages">
          {presets.map((p) => {
            const active = value.mode === 'percent' && value.percent === p;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({ ...value, mode: 'percent', percent: p, amount: undefined })
                }
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
                  active
                    ? 'bg-refresh-text text-refresh-bg'
                    : 'bg-refresh-surface text-refresh-muted hover:bg-refresh-surface-3 hover:text-refresh-text'
                }`}
              >
                {p}%
              </button>
            );
          })}
        </div>
      )}

      {/* Scope toggle */}
      {showScope && (
        <div role="group" aria-label="Apply to" className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-refresh-muted">Apply to</span>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-refresh-surface p-1">
            <button
              type="button"
              aria-pressed={value.scope === 'item'}
              onClick={() => onChange({ ...value, scope: 'item' })}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                value.scope === 'item'
                  ? 'bg-refresh-surface-3 text-refresh-text'
                  : 'text-refresh-muted hover:text-refresh-text'
              }`}
            >
              Selected item
            </button>
            <button
              type="button"
              aria-pressed={value.scope === 'order'}
              onClick={() => onChange({ ...value, scope: 'order' })}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                value.scope === 'order'
                  ? 'bg-refresh-surface-3 text-refresh-text'
                  : 'text-refresh-muted hover:text-refresh-text'
              }`}
            >
              Whole order
            </button>
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-refresh-muted">Reason</span>
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

      {subtotal != null && calculated > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-refresh-surface px-3 py-2">
          <span className="text-xs text-refresh-muted">Discount</span>
          <span className="font-bold tabular-nums text-refresh-pink">
            −{formatter.format(calculated)}
          </span>
        </div>
      )}
    </div>
  );
}
