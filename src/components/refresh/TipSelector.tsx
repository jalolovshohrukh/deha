'use client';

import { useState } from 'react';
import { CurrencyInput } from './CurrencyInput';

export type TipMode = 'percent' | 'amount' | 'none';

export type TipSelection = {
  mode: TipMode;
  /** Percentage as a whole number (15 = 15%). Ignored when mode !== 'percent'. */
  percent?: number;
  /** Absolute amount (currency). Ignored when mode !== 'amount'. */
  amount?: number;
};

export type TipSelectorProps = {
  /** Subtotal that percentages are calculated against. */
  subtotal: number;
  value: TipSelection;
  onChange: (next: TipSelection) => void;
  /** Preset percentages shown as chips. Default [10, 15, 18, 20]. */
  presets?: number[];
  currency?: string;
  locale?: string;
  /** Show the calculated tip amount summary line. Default true. */
  showSummary?: boolean;
  className?: string;
};

/**
 * Tip picker with preset percentage chips + a custom amount input.
 *
 * @example
 *   <TipSelector subtotal={42.50} value={tip} onChange={setTip} presets={[15, 18, 20, 25]} />
 */
export function TipSelector({
  subtotal,
  value,
  onChange,
  presets = [10, 15, 18, 20],
  currency = 'USD',
  locale = 'en-US',
  showSummary = true,
  className = '',
}: TipSelectorProps) {
  const [customMode, setCustomMode] = useState<'percent' | 'amount'>(
    value.mode === 'amount' ? 'amount' : 'percent'
  );

  const tipAmount = computeTip(subtotal, value);

  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  return (
    <div role="group" aria-label="Tip" className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const active = value.mode === 'percent' && value.percent === p;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ mode: 'percent', percent: p })}
              className={`flex flex-col items-center rounded-lg border px-3 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
                active
                  ? 'border-refresh-text bg-refresh-text text-refresh-bg'
                  : 'border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2'
              }`}
            >
              <span className="text-base font-bold tabular-nums">{p}%</span>
              <span className="text-[11px] tabular-nums opacity-75">
                {formatter.format(subtotal * (p / 100))}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={value.mode === 'none'}
          onClick={() => onChange({ mode: 'none' })}
          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
            value.mode === 'none'
              ? 'border-refresh-text bg-refresh-text text-refresh-bg'
              : 'border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2'
          }`}
        >
          No tip
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1 rounded-lg bg-refresh-surface p-1">
          <button
            type="button"
            onClick={() => setCustomMode('percent')}
            className={`flex-1 rounded-md px-3 py-1 text-xs font-semibold transition ${
              customMode === 'percent'
                ? 'bg-refresh-surface-3 text-refresh-text'
                : 'text-refresh-muted hover:text-refresh-text'
            }`}
          >
            Custom %
          </button>
          <button
            type="button"
            onClick={() => setCustomMode('amount')}
            className={`flex-1 rounded-md px-3 py-1 text-xs font-semibold transition ${
              customMode === 'amount'
                ? 'bg-refresh-surface-3 text-refresh-text'
                : 'text-refresh-muted hover:text-refresh-text'
            }`}
          >
            Custom amount
          </button>
        </div>
        {customMode === 'percent' ? (
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="Custom %"
            value={value.mode === 'percent' && !presets.includes(value.percent ?? -1) ? value.percent ?? '' : ''}
            onChange={(e) => {
              const n = e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value)));
              onChange({ mode: 'percent', percent: n });
            }}
            className="h-11 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-3 text-base tabular-nums text-refresh-text transition hover:border-refresh-muted-2 focus:outline-none focus-visible:border-refresh-text focus-visible:ring-2 focus-visible:ring-refresh-text/20"
          />
        ) : (
          <CurrencyInput
            value={value.mode === 'amount' ? value.amount ?? null : null}
            onChange={(amount) => onChange({ mode: 'amount', amount: amount ?? undefined })}
            currency={currency}
            locale={locale}
            ariaLabel="Custom tip amount"
          />
        )}
      </div>

      {showSummary && (
        <div className="flex items-center justify-between rounded-lg bg-refresh-surface px-3 py-2">
          <span className="text-xs text-refresh-muted">Tip</span>
          <span className="font-bold tabular-nums text-refresh-text">
            {formatter.format(tipAmount)}
          </span>
        </div>
      )}
    </div>
  );
}

function computeTip(subtotal: number, sel: TipSelection): number {
  if (sel.mode === 'percent') return ((sel.percent ?? 0) / 100) * subtotal;
  if (sel.mode === 'amount') return sel.amount ?? 0;
  return 0;
}
