'use client';

import { useEffect, useRef, useState } from 'react';
import { DatePickerDialog } from './DatePickerDialog';

export type DateRange = { from: Date | null; to: Date | null };

export type DateRangePreset = {
  id: string;
  label: string;
  /** Returns the range when this preset is selected. */
  getRange: () => DateRange;
};

export type DateRangePickerProps = {
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** Preset shortcuts shown above the inputs. Default: today/yesterday/week/month/year. */
  presets?: DateRangePreset[];
  /** Locale string for the displayed date format. Default 'en-US'. */
  locale?: string;
  ariaLabel?: string;
  className?: string;
};

const DEFAULT_PRESETS: DateRangePreset[] = [
  {
    id: 'today',
    label: 'Today',
    getRange: () => {
      const d = startOfDay(new Date());
      return { from: d, to: endOfDay(d) };
    },
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getRange: () => {
      const d = startOfDay(addDays(new Date(), -1));
      return { from: d, to: endOfDay(d) };
    },
  },
  {
    id: 'week',
    label: 'Last 7 days',
    getRange: () => ({ from: startOfDay(addDays(new Date(), -6)), to: endOfDay(new Date()) }),
  },
  {
    id: 'month',
    label: 'Last 30 days',
    getRange: () => ({ from: startOfDay(addDays(new Date(), -29)), to: endOfDay(new Date()) }),
  },
  {
    id: 'year',
    label: 'Year to date',
    getRange: () => {
      const now = new Date();
      const jan1 = new Date(now.getFullYear(), 0, 1);
      return { from: startOfDay(jan1), to: endOfDay(now) };
    },
  },
];

/**
 * Two-input date range picker with preset shortcuts. Each From / To field is
 * a button that opens a Refresh-themed `<Calendar>` popover (no OS-native
 * date picker — the dropdown matches the rest of the system).
 */
export function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  locale = 'en-US',
  ariaLabel = 'Date range',
  className = '',
}: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  const setFrom = (d: Date | null) => {
    setActivePreset(null);
    onChange({ ...value, from: d ? startOfDay(d) : null });
  };
  const setTo = (d: Date | null) => {
    setActivePreset(null);
    onChange({ ...value, to: d ? endOfDay(d) : null });
  };

  const applyPreset = (preset: DateRangePreset) => {
    setActivePreset(preset.id);
    onChange(preset.getRange());
  };

  return (
    <div role="group" aria-label={ariaLabel} className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const active = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              aria-pressed={active}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
                active
                  ? 'bg-refresh-text text-refresh-bg'
                  : 'bg-refresh-surface text-refresh-muted hover:bg-refresh-surface-3 hover:text-refresh-text'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <DateField
          label="From"
          value={value.from}
          onChange={setFrom}
          locale={locale}
        />
        <span aria-hidden className="self-end pb-2.5 text-refresh-muted-2">
          →
        </span>
        <DateField
          label="To"
          value={value.to}
          onChange={setTo}
          locale={locale}
        />
      </div>
      {value.from && value.to && (
        <p className="text-xs text-refresh-muted-2">
          {formatter.format(value.from)} → {formatter.format(value.to)}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * DateField — a button-styled trigger that opens a <Calendar> popover.
 * Click outside / ESC dismiss; Calendar's chevrons drive month navigation.
 * ────────────────────────────────────────────────────────────────────────── */

function DateField({
  label,
  value,
  onChange,
  locale,
}: {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => (value ? toDisplayDate(value) : ''));
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync the input text with the controlled value when it changes
  // externally (e.g. from a preset bump or the dialog confirming).
  useEffect(() => {
    if (value) {
      setText(toDisplayDate(value));
    } else {
      setText('');
    }
    setInvalid(false);
  }, [value]);

  // Commit the typed text on blur / Enter.
  const commitText = () => {
    const trimmed = text.trim();
    if (trimmed === '') {
      onChange(null);
      setInvalid(false);
      return;
    }
    const parsed = parseDateInput(trimmed);
    if (parsed) {
      onChange(parsed);
      setInvalid(false);
    } else {
      setInvalid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitText();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setText(value ? toDisplayDate(value) : '');
      setInvalid(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-1">
      <label
        id={`${label.toLowerCase()}-date-label`}
        className="text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2"
      >
        {label}
      </label>
      <div
        className={`flex h-10 items-center gap-1 rounded-lg border bg-refresh-surface pl-3 pr-1 transition focus-within:ring-2 focus-within:ring-refresh-text/20 ${
          invalid
            ? 'border-refresh-pink'
            : open
            ? 'border-refresh-text'
            : 'border-refresh-surface-3 hover:border-refresh-muted-2 focus-within:border-refresh-text'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => {
            // Auto-mask: digits-only → DD/MM/YYYY with slashes auto-inserted.
            setText(autoFormatDdMmYyyy(e.target.value));
            if (invalid) setInvalid(false);
          }}
          onBlur={commitText}
          onKeyDown={handleKeyDown}
          aria-labelledby={`${label.toLowerCase()}-date-label`}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${label.toLowerCase()}-date-err` : undefined}
          placeholder="DD/MM/YYYY"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          className="h-full flex-1 bg-transparent text-sm text-refresh-text placeholder:text-refresh-muted-2 focus:outline-none"
        />
        <button
          type="button"
          aria-label={`Open ${label.toLowerCase()} calendar`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            // If the user has typed something, commit it first so the dialog
            // opens with that date pre-selected instead of falling back to today.
            const trimmed = text.trim();
            if (trimmed) {
              const parsed = parseDateInput(trimmed);
              if (parsed) {
                onChange(parsed);
                setInvalid(false);
              }
            }
            setOpen(true);
          }}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-refresh-muted-2 transition hover:bg-refresh-surface-3 hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text"
        >
          <CalendarIcon />
        </button>
      </div>
      {invalid && (
        <span
          id={`${label.toLowerCase()}-date-err`}
          className="text-[11px] text-refresh-pink"
        >
          Use DD/MM/YYYY (e.g. 22/04/2026).
        </span>
      )}

      {/*
       * Two-pane Material-style modal — opens when the user clicks the
       * calendar icon (or presses ↓ in the input). User picks a date and
       * presses OK to commit; Cancel/ESC/backdrop discards.
       */}
      <DatePickerDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onConfirm={(d) => onChange(d)}
        title={`Select ${label.toLowerCase()} date`}
        locale={locale}
      />
    </div>
  );
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function endOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** DD/MM/YYYY for the input field. Always pads single-digit day/month. */
function toDisplayDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Auto-mask raw input as the user types: strip everything but digits, cap at
 * 8 (DDMMYYYY), and re-insert "/" at the DD and MM boundaries.
 *
 *   "1"          → "1"
 *   "12"         → "12"
 *   "120"        → "12/0"          ← slash auto-inserted
 *   "1204"       → "12/04"
 *   "12042"      → "12/04/2"       ← second slash
 *   "12042026"   → "12/04/2026"
 *   "12/04/2026" → "12/04/2026"    (idempotent)
 *   "abc12def04" → "12/04"         (non-digits ignored)
 */
function autoFormatDdMmYyyy(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Parse user-typed date text. DD/MM/YYYY is canonical; we also accept a few
 * common separators / short years for paste-tolerance:
 *   - DD/MM/YYYY      → 22/04/2026
 *   - DD-MM-YYYY      → 22-04-2026
 *   - DD.MM.YYYY      → 22.04.2026
 *   - DDMMYYYY        → 22042026
 *   - DD/MM/YY        → 22/04/26   (assumes 20YY)
 * Returns null when the text doesn't match OR when the values resolve to an
 * invalid date (e.g. 31/02/2026 → null, doesn't silently roll over).
 */
function parseDateInput(text: string): Date | null {
  if (!text) return null;

  // DD/MM/YYYY (separators: /  -  .).
  const full = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(text);
  if (full) return buildValidDate(+full[3], +full[2], +full[1]);

  // DDMMYYYY (no separators).
  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(text);
  if (compact) return buildValidDate(+compact[3], +compact[2], +compact[1]);

  // Short year: DD/MM/YY → assume 20YY.
  const short = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2})$/.exec(text);
  if (short) return buildValidDate(2000 + +short[3], +short[2], +short[1]);

  return null;
}

/** Construct a Date from y/m/d and verify it didn't roll over (e.g. Feb 30 → Mar 2). */
function buildValidDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}
