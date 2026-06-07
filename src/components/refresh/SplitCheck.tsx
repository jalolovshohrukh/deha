'use client';

import { useState } from 'react';

export type SplitMode = 'even' | 'custom';

export type SplitCheckResult = {
  mode: SplitMode;
  ways: number;
  /** Per-payer amounts, length === ways. Always returned even in even-split mode. */
  amounts: number[];
};

export type SplitCheckProps = {
  /** Total to be split. */
  total: number;
  value: SplitCheckResult;
  onChange: (next: SplitCheckResult) => void;
  /** Min number of payers. Default 2. */
  min?: number;
  /** Max number of payers. Default 12. */
  max?: number;
  currency?: string;
  locale?: string;
  className?: string;
};

/**
 * Split a check between N payers — even split or custom amounts.
 * Reports a SplitCheckResult; consumers handle the actual payment routing.
 *
 * @example
 *   <SplitCheck total={84.50} value={split} onChange={setSplit} />
 */
export function SplitCheck({
  total,
  value,
  onChange,
  min = 2,
  max = 12,
  currency = 'USD',
  locale = 'en-US',
  className = '',
}: SplitCheckProps) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const [overrides, setOverrides] = useState<Record<number, string>>({});

  const setMode = (mode: SplitMode) => {
    if (mode === 'even') {
      onChange(buildEvenSplit(total, value.ways));
      setOverrides({});
    } else {
      onChange({ mode: 'custom', ways: value.ways, amounts: [...value.amounts] });
    }
  };

  const setWays = (ways: number) => {
    const next = Math.max(min, Math.min(max, ways));
    if (value.mode === 'even') {
      onChange(buildEvenSplit(total, next));
    } else {
      // Preserve existing amounts; pad / trim.
      const prev = value.amounts;
      const amounts =
        next > prev.length
          ? [...prev, ...new Array(next - prev.length).fill(0)]
          : prev.slice(0, next);
      onChange({ mode: 'custom', ways: next, amounts });
    }
    setOverrides({});
  };

  const setCustomAmount = (idx: number, raw: string) => {
    setOverrides({ ...overrides, [idx]: raw });
    const cleaned = raw.replace(/[^\d.-]/g, '');
    const n = cleaned === '' ? 0 : Number(cleaned);
    const next = [...value.amounts];
    next[idx] = Number.isFinite(n) ? n : 0;
    onChange({ mode: 'custom', ways: value.ways, amounts: next });
  };

  const sum = value.amounts.reduce((a, b) => a + b, 0);
  const remaining = total - sum;
  const balanced = Math.abs(remaining) < 0.01;

  return (
    <div role="group" aria-label="Split check" className={`flex flex-col gap-4 ${className}`}>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-refresh-surface p-1">
        <button
          type="button"
          aria-pressed={value.mode === 'even'}
          onClick={() => setMode('even')}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            value.mode === 'even'
              ? 'bg-refresh-surface-3 text-refresh-text'
              : 'text-refresh-muted hover:text-refresh-text'
          }`}
        >
          Split evenly
        </button>
        <button
          type="button"
          aria-pressed={value.mode === 'custom'}
          onClick={() => setMode('custom')}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            value.mode === 'custom'
              ? 'bg-refresh-surface-3 text-refresh-text'
              : 'text-refresh-muted hover:text-refresh-text'
          }`}
        >
          Custom amounts
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-refresh-surface px-3 py-2">
        <span className="text-xs font-semibold text-refresh-muted">Number of payers</span>
        <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-refresh-surface-3 bg-refresh-surface-2">
          <button
            type="button"
            aria-label="Fewer payers"
            disabled={value.ways <= min}
            onClick={() => setWays(value.ways - 1)}
            className="flex h-9 w-9 items-center justify-center text-refresh-text transition hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="flex h-9 w-12 items-center justify-center border-x border-refresh-line text-sm font-bold tabular-nums text-refresh-text"
          >
            {value.ways}
          </span>
          <button
            type="button"
            aria-label="More payers"
            disabled={value.ways >= max}
            onClick={() => setWays(value.ways + 1)}
            className="flex h-9 w-9 items-center justify-center text-refresh-text transition hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {value.amounts.map((amount, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 rounded-lg border border-refresh-line bg-refresh-surface-2 px-3 py-2.5"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold text-refresh-text">
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full bg-refresh-surface-3 text-xs font-bold tabular-nums"
              >
                {i + 1}
              </span>
              Payer {i + 1}
            </span>
            {value.mode === 'even' ? (
              <span className="font-bold tabular-nums text-refresh-text">
                {formatter.format(amount)}
              </span>
            ) : (
              <input
                type="text"
                inputMode="decimal"
                aria-label={`Amount for payer ${i + 1}`}
                value={overrides[i] ?? amount.toFixed(2)}
                onChange={(e) => setCustomAmount(i, e.target.value)}
                onBlur={() => {
                  // Re-sync display value to the canonical numeric.
                  setOverrides((curr) => {
                    const { [i]: _, ...rest } = curr;
                    return rest;
                  });
                }}
                className="h-9 w-28 rounded-md border border-refresh-surface-3 bg-refresh-surface px-2 text-right text-sm font-bold tabular-nums text-refresh-text outline-none focus:border-refresh-text focus:ring-2 focus:ring-refresh-text/20"
              />
            )}
          </li>
        ))}
      </ul>

      <div
        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
          balanced ? 'bg-refresh-sage/15' : 'bg-refresh-pink/10'
        }`}
      >
        <span className="text-xs font-semibold text-refresh-muted">
          {balanced ? 'Balanced' : 'Remaining'}
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${
            balanced ? 'text-refresh-sage' : 'text-refresh-pink'
          }`}
        >
          {balanced ? formatter.format(total) : formatter.format(remaining)}
        </span>
      </div>
    </div>
  );
}

function buildEvenSplit(total: number, ways: number): SplitCheckResult {
  const each = Math.floor((total / ways) * 100) / 100;
  const amounts = new Array(ways).fill(each);
  // Distribute rounding remainder across the first N payers in cents.
  const remainderCents = Math.round((total - each * ways) * 100);
  for (let i = 0; i < remainderCents; i++) amounts[i] += 0.01;
  return { mode: 'even', ways, amounts: amounts.map((a) => Math.round(a * 100) / 100) };
}
