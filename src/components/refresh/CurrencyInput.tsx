'use client';

import { forwardRef, useEffect, useState } from 'react';

export type CurrencyInputProps = {
  value: number | null;
  onChange: (next: number | null) => void;
  /** ISO 4217 currency code. Default 'USD'. */
  currency?: string;
  /** Locale for formatting. Default 'en-US'. */
  locale?: string;
  /** Show currency symbol prefix (e.g. '$'). Default true. */
  showSymbol?: boolean;
  /** Number of decimal places. Default 2. */
  fractionDigits?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  hint?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

const sizeMap = {
  sm: 'h-9 text-sm',
  md: 'h-11 text-base',
  lg: 'h-14 text-xl',
};

/**
 * Currency-formatted number input. Stores the raw number; displays the formatted string while
 * not focused, and a clean numeric string while editing. Symbol-prefixed (e.g. "$") on the left.
 *
 * @example
 *   <CurrencyInput value={amount} onChange={setAmount} currency="USD" />
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onChange,
      currency = 'USD',
      locale = 'en-US',
      showSymbol = true,
      fractionDigits = 2,
      size = 'md',
      label,
      hint,
      invalid = false,
      required = false,
      disabled = false,
      placeholder,
      ariaLabel,
      className = '',
    },
    ref
  ) {
    const [focused, setFocused] = useState(false);
    const [editingText, setEditingText] = useState('');

    // Sync editingText whenever value changes externally (and we're not actively editing).
    useEffect(() => {
      if (!focused) {
        setEditingText(value == null ? '' : value.toFixed(fractionDigits));
      }
    }, [value, fractionDigits, focused]);

    const symbol = showSymbol
      ? new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
          .formatToParts(0)
          .find((p) => p.type === 'currency')?.value ?? ''
      : '';

    const displayValue = focused
      ? editingText
      : value == null
      ? ''
      : new Intl.NumberFormat(locale, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(value);

    const handleChange = (raw: string) => {
      // Allow only digits, one decimal point, optional leading minus.
      const cleaned = raw.replace(/[^\d.-]/g, '').replace(/(\..*)\./g, '$1');
      setEditingText(cleaned);
      if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        onChange(null);
        return;
      }
      const n = Number(cleaned);
      onChange(Number.isFinite(n) ? n : null);
    };

    const inputClass = `w-full bg-transparent pl-2 pr-3 tabular-nums text-refresh-text outline-none placeholder:text-refresh-muted-2 disabled:cursor-not-allowed disabled:opacity-40 ${sizeMap[size]}`;

    return (
      <label className={`block ${className}`}>
        {label && (
          <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-refresh-muted">
            {label}
            {required && <span className="text-refresh-pink">*</span>}
          </span>
        )}
        <span
          className={`inline-flex w-full items-center rounded-lg border bg-refresh-surface transition focus-within:ring-2 focus-within:ring-refresh-text/20 ${
            invalid
              ? 'border-refresh-pink focus-within:border-refresh-pink'
              : 'border-refresh-surface-3 focus-within:border-refresh-text'
          } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
        >
          {showSymbol && (
            <span
              aria-hidden
              className={`pl-3 font-semibold text-refresh-muted ${sizeMap[size]} flex items-center`}
            >
              {symbol}
            </span>
          )}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            value={displayValue}
            aria-label={ariaLabel ?? label}
            aria-invalid={invalid || undefined}
            onFocus={() => {
              setFocused(true);
              setEditingText(value == null ? '' : value.toFixed(fractionDigits));
            }}
            onBlur={() => setFocused(false)}
            onChange={(e) => handleChange(e.target.value)}
            className={inputClass}
          />
        </span>
        {hint && (
          <span className={`mt-1 block text-xs ${invalid ? 'text-refresh-pink' : 'text-refresh-muted-2'}`}>
            {hint}
          </span>
        )}
      </label>
    );
  }
);
