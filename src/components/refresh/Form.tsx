'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { Popover } from './Popover';
import { Tooltip } from './Tooltip';
import { Icon } from './Icon';

/* === Input ============================================================== */

type InputBaseProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputBaseProps>(function Input(
  { label, hint, iconLeft, iconRight, invalid, className = '', id, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  return (
    <label className="block w-full" htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-refresh-muted">{label}</span>
      )}
      <span
        className={`flex items-center gap-2 rounded-lg border bg-refresh-surface px-3 py-2.5 transition focus-within:ring-2 focus-within:ring-refresh-text/20 ${
          invalid
            ? 'border-refresh-pink focus-within:border-refresh-pink'
            : 'border-refresh-surface-3 focus-within:border-refresh-text'
        } ${className}`}
      >
        {iconLeft && <span aria-hidden className="text-refresh-muted-2">{iconLeft}</span>}
        <input
          ref={ref}
          id={inputId}
          className="flex-1 bg-transparent text-sm text-refresh-text placeholder:text-refresh-muted-2 focus:outline-none"
          {...rest}
        />
        {iconRight && <span aria-hidden className="text-refresh-muted-2">{iconRight}</span>}
      </span>
      {hint && (
        <span className={`mt-1 block text-[11px] ${invalid ? 'text-refresh-pink' : 'text-refresh-muted-2'}`}>
          {hint}
        </span>
      )}
    </label>
  );
});

/* === SearchInput ======================================================== */

export type SearchInputProps = Omit<InputBaseProps, 'iconLeft' | 'type'> & {
  shortcut?: string;
};

export function SearchInput({ shortcut, placeholder = 'Search', ...rest }: SearchInputProps) {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      iconLeft={
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="m9.5 9.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      }
      iconRight={
        shortcut ? (
          <kbd className="rounded border border-refresh-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-refresh-muted-2">
            {shortcut}
          </kbd>
        ) : undefined
      }
      {...rest}
    />
  );
}

/* === Select ============================================================= */

export type SelectOption<T extends string = string> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
};

export type SelectProps<T extends string = string> = {
  label?: string;
  options: SelectOption<T>[];
  /** Currently selected value. Pass `''` for an empty / unselected state. */
  value: T | '';
  onChange: (next: T) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  /** Optional hint text under the field. */
  hint?: string;
  /** Extra classes on the trigger button. */
  className?: string;
  size?: 'sm' | 'md';
};

/**
 * Select — Refresh-themed dropdown built on `Popover`. Trigger renders as a
 * form-field-shaped button; the panel is a `role="listbox"` of options with
 * arrow-key / Home/End / Enter/Space / type-ahead keyboard support.
 *
 * Replaces the old native `<select>` wrapper so the open dropdown panel matches
 * the rest of the design system instead of using OS chrome.
 */
export function Select<T extends string = string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  required = false,
  name,
  id,
  hint,
  className = '',
  size = 'md',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const listRef = useRef<HTMLUListElement>(null);
  const typeBufferRef = useRef<{ buf: string; t: number }>({ buf: '', t: 0 });

  const selectId = id ?? name;
  const selected = options.find((o) => o.value === value) ?? null;
  const padding = size === 'sm' ? 'py-2 text-xs' : 'py-2.5 text-sm';

  // When the panel opens, highlight the currently-selected item (or first enabled).
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0 && !options[idx].disabled) {
      setActiveIdx(idx);
    } else {
      const firstEnabled = options.findIndex((o) => !o.disabled);
      setActiveIdx(firstEnabled === -1 ? 0 : firstEnabled);
    }
  }, [open, value, options]);

  // Move DOM focus to the active option button when open / activeIdx changes.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const buttons = listRef.current.querySelectorAll<HTMLButtonElement>('button[role="option"]');
    buttons[activeIdx]?.focus();
  }, [open, activeIdx]);

  const moveTo = (predicate: (i: number) => number) => {
    const enabled = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled)
      .map(({ i }) => i);
    if (enabled.length === 0) return;
    const cur = enabled.indexOf(activeIdx);
    const nextPos = predicate(cur === -1 ? 0 : cur);
    const wrapped = ((nextPos % enabled.length) + enabled.length) % enabled.length;
    setActiveIdx(enabled[wrapped]);
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveTo((cur) => cur + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveTo((cur) => cur - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      moveTo(() => 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      moveTo(() => -1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = options[activeIdx];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        setOpen(false);
      }
    } else if (e.key === 'Tab') {
      // Let Tab close the panel naturally rather than trapping focus inside.
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // Type-ahead: collect printable chars within ~500ms, jump to first match.
      const now = Date.now();
      const ttl = 500;
      const buf =
        (now - typeBufferRef.current.t > ttl ? '' : typeBufferRef.current.buf) + e.key.toLowerCase();
      typeBufferRef.current = { buf, t: now };
      const start = activeIdx + 1;
      for (let n = 0; n < options.length; n++) {
        const idx = (start + n) % options.length;
        const opt = options[idx];
        if (opt.disabled) continue;
        const labelText = typeof opt.label === 'string' ? opt.label : String(opt.value);
        if (labelText.toLowerCase().startsWith(buf)) {
          setActiveIdx(idx);
          break;
        }
      }
    }
  };

  return (
    <div className="block w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-medium text-refresh-muted"
        >
          {label}
          {required && <span className="ml-0.5 text-refresh-pink">*</span>}
        </label>
      )}
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
        }}
        ariaLabel={label ?? 'Select option'}
        wrapperClassName="block w-full"
        panelClassName="left-0 min-w-full w-max max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto refresh-scroll p-1.5"
        placement="bottom-start"
        trigger={
          <button
            type="button"
            id={selectId}
            name={name}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-required={required || undefined}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-3 ${padding} text-refresh-text transition hover:border-refresh-muted-2 focus:outline-none focus-visible:border-refresh-text focus-visible:ring-2 focus-visible:ring-refresh-text/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-refresh-surface-3 ${className}`}
          >
            <span
              className={`truncate text-left font-medium ${
                selected ? 'text-refresh-text' : 'text-refresh-muted-2'
              }`}
            >
              {selected ? selected.label : placeholder}
            </span>
            <Icon
              name="chevron-down"
              size={14}
              className={`shrink-0 text-refresh-muted-2 transition ${open ? 'rotate-180' : ''}`}
            />
          </button>
        }
      >
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label ?? 'Options'}
          className="flex flex-col"
          onKeyDown={handleListKeyDown}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = i === activeIdx;
            return (
              <li key={String(opt.value)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  onMouseEnter={() => !opt.disabled && setActiveIdx(i)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none ${
                    opt.disabled
                      ? 'cursor-not-allowed text-refresh-muted-2 opacity-60'
                      : isActive
                      ? 'bg-refresh-surface text-refresh-text'
                      : 'text-refresh-text hover:bg-refresh-surface'
                  } ${isSelected ? 'font-semibold' : ''}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Icon name="check" size={14} className="text-refresh-text" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
      {hint && (
        <span className="mt-1 block text-[11px] text-refresh-muted-2">{hint}</span>
      )}
    </div>
  );
}

/* === Toggle ============================================================= */

export type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? 'bg-refresh-text' : 'bg-refresh-surface-3'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-refresh-bg transition ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
      {label && <span className="text-sm text-refresh-text">{label}</span>}
    </label>
  );
}

/* === Checkbox =========================================================== */

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: React.ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className = '', checked, ...rest },
  ref
) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 ${className}`}>
      <span
        className={`relative flex h-4 w-4 items-center justify-center rounded border transition ${
          checked
            ? 'border-refresh-text bg-refresh-text'
            : 'border-refresh-surface-3 bg-refresh-surface'
        }`}
      >
        <input ref={ref} type="checkbox" checked={checked} className="sr-only" {...rest} />
        {checked && (
          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
            <path
              d="M2 6.5 5 9.5 10 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-refresh-bg"
            />
          </svg>
        )}
      </span>
      {label && <span className="text-sm text-refresh-text">{label}</span>}
    </label>
  );
});

/* === PhoneInput ========================================================= */

export type PhoneCountry = {
  /** ISO 3166-1 alpha-2 country code, lowercase. e.g. 'tj', 'ru'. */
  code: string;
  name: string;
  /** International dial prefix including '+'. e.g. '+992'. */
  dialCode: string;
  /**
   * Mask pattern for the local part. `X` (or `#`) marks a digit slot;
   * any other character (space, dash, parens) is rendered as a literal
   * separator. The total `X` count is the expected digit length.
   *
   * Tajikistan example: `'XXX XXX XXX'` → user types `907123456` and sees
   * `907 123 456`. Capped at 9 digits.
   */
  format?: string;
};

/**
 * Default country list — Central Asia + Russia (the user-prioritized 5),
 * plus a few common extras. Each country includes its standard local-number
 * format mask so the input auto-spaces digits as the user types.
 */
export const DEFAULT_PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'tj', name: 'Tajikistan',     dialCode: '+992', format: 'XXX XXX XXX' },
  { code: 'ru', name: 'Russia',         dialCode: '+7',   format: '(XXX) XXX-XX-XX' },
  { code: 'uz', name: 'Uzbekistan',     dialCode: '+998', format: 'XX XXX XX XX' },
  { code: 'kg', name: 'Kyrgyzstan',     dialCode: '+996', format: 'XXX XXX XXX' },
  { code: 'kz', name: 'Kazakhstan',     dialCode: '+7',   format: '(XXX) XXX-XX-XX' },
  { code: 'us', name: 'United States',  dialCode: '+1',   format: '(XXX) XXX-XXXX' },
  { code: 'gb', name: 'United Kingdom', dialCode: '+44',  format: 'XXXX XXX XXXX' },
  { code: 'tr', name: 'Turkey',         dialCode: '+90',  format: 'XXX XXX XX XX' },
  { code: 'de', name: 'Germany',        dialCode: '+49',  format: 'XXXX XXXXXXX' },
  { code: 'fr', name: 'France',         dialCode: '+33',  format: 'X XX XX XX XX' },
  { code: 'cn', name: 'China',          dialCode: '+86',  format: 'XXX XXXX XXXX' },
];

/**
 * Apply a mask pattern to a raw digit string.
 *
 *   formatPhone('907123456', 'XXX XXX XXX')      → '907 123 456'
 *   formatPhone('912345', '(XXX) XXX-XXXX')       → '(912) 345'
 *   formatPhone('abc907xyz123', 'XXX XXX XXX')    → '907 123' (non-digits stripped)
 *
 * Stops as soon as the digits run out — partial masks render correctly
 * (e.g. typing '90' shows '90', not '90 ').
 */
export function formatPhone(raw: string, format: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return '';

  let result = '';
  let digitIdx = 0;
  for (let i = 0; i < format.length; i++) {
    if (digitIdx >= digits.length) break;
    const ch = format[i];
    if (ch === 'X' || ch === '#') {
      result += digits[digitIdx];
      digitIdx++;
    } else {
      result += ch;
    }
  }
  return result;
}

/** Derive a digit-shaped placeholder from a format mask: 'XXX XXX XXX' → '000 000 000'. */
function placeholderFor(format: string): string {
  return format.replace(/X|#/g, '0');
}

/** Number of `X` slots in a mask — used to cap typed input. */
function digitCapacity(format: string): number {
  return (format.match(/X|#/g) || []).length;
}

export type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  hint?: string;
  required?: boolean;

  /**
   * ISO 3166-1 alpha-2 country code (e.g. `'tj'`). When set together with
   * `countries`, the picker becomes a built-in dropdown using real SVG flags.
   * Defaults to the first entry in `countries`.
   */
  country?: string;
  /** Called when the user picks a country from the built-in dropdown. */
  onCountryChange?: (next: PhoneCountry) => void;
  /** Available countries in the picker. Defaults to `DEFAULT_PHONE_COUNTRIES`. */
  countries?: PhoneCountry[];

  /**
   * Legacy: emoji or ReactNode rendered in the prefix slot. When the new
   * `country` prop is set, this is ignored. Kept for backward compatibility.
   */
  countryFlag?: React.ReactNode;
  /**
   * Legacy: dial-code label rendered after the flag. When `country` + `countries`
   * are passed, the dial code is derived automatically.
   */
  countryCode?: string;
  /** Legacy parent-controlled opener — fires instead of opening the built-in dropdown. */
  onCountryClick?: () => void;
};

export function PhoneInput({
  label,
  hint,
  required,
  country,
  onCountryChange,
  countries = DEFAULT_PHONE_COUNTRIES,
  countryFlag,
  countryCode,
  onCountryClick,
  placeholder,
  className = '',
  value,
  defaultValue,
  onChange,
  ...rest
}: PhoneInputProps) {
  // Resolve the active country: explicit `country` prop wins; otherwise the
  // first entry in the list. Used only when the new dropdown is engaged.
  const active = country
    ? countries.find((c) => c.code.toLowerCase() === country.toLowerCase()) ?? countries[0]
    : countries[0];
  const useBuiltInPicker = !onCountryClick;
  const format = active.format;

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Internal mirror of the formatted text. We auto-mask as the user types
  // (digits-only → format-applied). When the parent provides a controlled
  // `value`, that wins; otherwise we manage uncontrolled text locally.
  const isControlled = value !== undefined;
  const [innerText, setInnerText] = useState<string>(() => {
    const seed = (value ?? defaultValue ?? '').toString();
    return format ? formatPhone(seed, format) : seed;
  });
  const text = isControlled
    ? format
      ? formatPhone(String(value ?? ''), format)
      : String(value ?? '')
    : innerText;

  // When the country (and therefore the format mask) changes, re-mask the
  // existing digits against the new format so the visible text stays in sync.
  useEffect(() => {
    if (!format) return;
    setInnerText((prev) => formatPhone(prev, format));
  }, [format]);

  // Click outside / ESC to close the built-in dropdown.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const triggerFlag =
    countryFlag != null ? (
      // Legacy emoji / custom node.
      <span aria-hidden className="text-base leading-none">
        {countryFlag}
      </span>
    ) : (
      <PhoneFlag code={active.code} label={active.name} />
    );
  const triggerCode = countryCode ?? active.dialCode;

  return (
    <label className={`block w-full ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-refresh-muted">
          {label}
          {required && <span className="ml-0.5 text-refresh-pink">*</span>}
        </span>
      )}
      <span className="relative flex items-stretch gap-2" ref={wrapperRef}>
        <button
          type="button"
          aria-haspopup={useBuiltInPicker ? 'menu' : undefined}
          aria-expanded={useBuiltInPicker ? open : undefined}
          aria-label={`Country: ${active.name}`}
          onClick={() => {
            if (onCountryClick) {
              onCountryClick();
              return;
            }
            setOpen((o) => !o);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-refresh-surface px-3 py-2.5 text-sm text-refresh-text transition hover:bg-refresh-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text/20"
        >
          {triggerFlag}
          {triggerCode && <span className="text-refresh-muted">{triggerCode}</span>}
          <span
            className={`text-[10px] text-refresh-muted-2 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        <span className="flex flex-1 items-center gap-2 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-3 py-2.5 transition focus-within:border-refresh-text focus-within:ring-2 focus-within:ring-refresh-text/20">
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={text}
            placeholder={
              placeholder ?? (format ? placeholderFor(format) : 'Enter phone')
            }
            // Cap total length at the formatted mask width (digits + separators).
            maxLength={format ? format.length : undefined}
            onChange={(e) => {
              const raw = e.target.value;
              // Strip non-digits, cap to the country's digit capacity, then
              // re-apply the mask. If no format mask, just pass through.
              const next = format
                ? formatPhone(
                    raw.replace(/\D/g, '').slice(0, digitCapacity(format)),
                    format
                  )
                : raw;
              if (!isControlled) setInnerText(next);
              if (onChange) {
                // Synthesize an event whose target.value is the formatted text
                // so consumers see the masked string, not the raw keystroke.
                onChange({
                  ...e,
                  target: { ...e.target, value: next } as HTMLInputElement,
                  currentTarget: { ...e.currentTarget, value: next } as HTMLInputElement,
                });
              }
            }}
            className="w-full bg-transparent text-sm text-refresh-text placeholder:text-refresh-muted-2 focus:outline-none"
            {...rest}
          />
        </span>

        {useBuiltInPicker && open && (
          <div
            role="menu"
            aria-label="Select country"
            className="absolute left-0 top-full z-30 mt-2 max-h-72 min-w-[240px] overflow-y-auto refresh-scroll rounded-xl border border-refresh-line bg-refresh-surface-2 p-1 refresh-shadow-soft"
            style={{ animation: 'navrail-flyout-in 150ms ease-out' }}
          >
            <ul className="flex flex-col">
              {countries.map((c) => {
                const isActive = c.code === active.code;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="menuitem"
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => {
                        onCountryChange?.(c);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text ${
                        isActive
                          ? 'bg-refresh-surface text-refresh-text font-semibold'
                          : 'text-refresh-text hover:bg-refresh-surface'
                      }`}
                    >
                      <PhoneFlag code={c.code} label={c.name} />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="shrink-0 text-xs tabular-nums text-refresh-muted-2">
                        {c.dialCode}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </span>
      {hint && (
        <span className="mt-1 block text-[11px] text-refresh-muted-2">{hint}</span>
      )}
    </label>
  );
}

/** Country flag served from lipis/flag-icons via jsDelivr — same approach as LanguagePicker. */
function PhoneFlag({ code, label }: { code: string; label: string }) {
  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3/${code.toLowerCase()}.svg`}
      alt=""
      aria-hidden
      title={label}
      width={20}
      height={14}
      loading="lazy"
      className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
    />
  );
}

/* === TagInput =========================================================== */

export type TagInputProps = {
  label?: string;
  values: string[];
  onRemove?: (value: string) => void;
  placeholder?: string;
  helpHint?: React.ReactNode;
};

export function TagInput({
  label,
  values,
  onRemove,
  placeholder = 'Add tag…',
  helpHint,
}: TagInputProps) {
  return (
    <label className="block w-full">
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-refresh-muted">
          {label}
          {helpHint && (
            <Tooltip content={helpHint} side="top">
              <span
                role="img"
                aria-label="More info"
                className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-refresh-surface-3 text-[9px] font-bold text-refresh-muted-2"
              >
                ?
              </span>
            </Tooltip>
          )}
        </span>
      )}
      <span className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-2 py-1.5 transition focus-within:border-refresh-text focus-within:ring-2 focus-within:ring-refresh-text/20">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-md bg-refresh-surface-3 px-2 py-1 text-xs font-medium text-refresh-text"
          >
            {v}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(v)}
                aria-label={`Remove ${v}`}
                className="text-refresh-muted-2 transition hover:text-refresh-text"
              >
                ×
              </button>
            )}
          </span>
        ))}
        <input
          type="text"
          placeholder={values.length === 0 ? placeholder : ''}
          className="min-w-[80px] flex-1 bg-transparent px-1 py-0.5 text-sm text-refresh-text placeholder:text-refresh-muted-2 focus:outline-none"
        />
      </span>
    </label>
  );
}

/* === Radio ============================================================== */

export type RadioOption = { value: string; label: string };

export type RadioGroupProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
};

export function RadioGroup({ name, value, onChange, options }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg bg-refresh-surface px-3 py-2.5 transition hover:bg-refresh-surface-3"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition ${
                checked ? 'border-refresh-text' : 'border-refresh-surface-3'
              }`}
            >
              {checked && <span className="h-2 w-2 rounded-full bg-refresh-text" />}
            </span>
            <span className="text-sm text-refresh-text">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

/* === Textarea =========================================================== */

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  invalid?: boolean;
  /** When true, the textarea grows with its content. Default false (resizable manually via the corner handle). */
  autoResize?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, invalid, autoResize = false, className = '', id, rows = 4, onChange, ...rest },
  ref
) {
  const textareaId = id ?? rest.name;

  // Auto-grow handler — bumps the height to fit content on every change.
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      const el = e.currentTarget;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
    onChange?.(e);
  };

  return (
    <label className="block w-full" htmlFor={textareaId}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-refresh-muted">{label}</span>
      )}
      <span
        className={`block rounded-lg border bg-refresh-surface px-3 py-2.5 transition focus-within:ring-2 focus-within:ring-refresh-text/20 ${
          invalid
            ? 'border-refresh-pink focus-within:border-refresh-pink'
            : 'border-refresh-surface-3 focus-within:border-refresh-text'
        } ${className}`}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          onChange={handleChange}
          className={`block w-full resize-y bg-transparent text-sm text-refresh-text placeholder:text-refresh-muted-2 focus:outline-none ${
            autoResize ? 'resize-none overflow-hidden' : ''
          }`}
          {...rest}
        />
      </span>
      {hint && (
        <span
          className={`mt-1 block text-[11px] ${invalid ? 'text-refresh-pink' : 'text-refresh-muted-2'}`}
        >
          {hint}
        </span>
      )}
    </label>
  );
});
