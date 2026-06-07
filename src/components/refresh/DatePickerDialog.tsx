'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export type DatePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Initial / controlled date. The dialog tracks a draft internally and commits via `onConfirm`. */
  value?: Date | null;
  /** Fires when the user clicks the confirm button with the current draft selection. */
  onConfirm: (date: Date) => void;
  /** Optional starting month when `value` is null. Defaults to today. */
  defaultMonth?: Date;
  /** Header on the left preview pane. Default "Select date". */
  title?: ReactNode;
  /** Cancel button label. */
  cancelLabel?: string;
  /** Confirm button label. */
  confirmLabel?: string;
  /** First column of the calendar grid. Default 'monday'. */
  weekStartsOn?: 'monday' | 'sunday';
  /** Locale for the preview line ("Fri, Oct 27"). Default 'en-US'. */
  locale?: string;
  /** Earliest selectable date — earlier days render disabled. */
  minDate?: Date;
  /** Latest selectable date — later days render disabled. */
  maxDate?: Date;
  className?: string;
};

/**
 * Modal date picker with a two-pane layout — left pane previews the draft
 * selection ("Fri, Oct 27"), right pane shows the calendar grid. Explicit
 * Cancel / OK actions; selecting a day in the grid only updates the draft.
 *
 * Different from the inline `<Calendar>` and the popover-anchored fields in
 * `<DateRangePicker>`: this is a "pick one date with confirmation" pattern,
 * good for filters that change a lot of downstream state and want explicit
 * commit semantics.
 *
 * @example
 *   const [open, setOpen] = useState(false);
 *   const [date, setDate] = useState<Date | null>(null);
 *
 *   <Button onClick={() => setOpen(true)}>Pick a date</Button>
 *   <DatePickerDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     value={date}
 *     onConfirm={setDate}
 *   />
 */
export function DatePickerDialog({
  open,
  onOpenChange,
  value,
  onConfirm,
  defaultMonth,
  title = 'Select date',
  cancelLabel = 'Cancel',
  confirmLabel = 'OK',
  weekStartsOn = 'monday',
  locale = 'en-US',
  minDate,
  maxDate,
  className = '',
}: DatePickerDialogProps) {
  // Draft selection — only commits to parent on confirm. Defaults to today
  // (or `defaultMonth` if provided) so the preview is always meaningful.
  const [draft, setDraft] = useState<Date | null>(
    value ?? defaultMonth ?? new Date()
  );
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    startOfMonth(value ?? defaultMonth ?? new Date())
  );

  // Re-seed the draft + visible month every time the dialog opens or the
  // controlled `value` changes externally. When the dialog opens with no
  // value, we seed the draft to today so the preview pane shows a real date
  // immediately (and the OK button is enabled).
  useEffect(() => {
    if (!open) return;
    const seed = value ?? defaultMonth ?? new Date();
    setDraft(value ?? seed);
    setViewMonth(startOfMonth(seed));
  }, [open, value, defaultMonth]);

  const handleConfirm = () => {
    if (draft) {
      onConfirm(draft);
      onOpenChange(false);
    }
  };

  const previewFmt = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const monthLabelFmt = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel={typeof title === 'string' ? title : 'Date picker'}
      size="sm"
      className={className}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr]">
        {/* Left preview pane.
         * `rounded-tl-2xl` only — the bottom-left of this aside is the
         * internal joint with the footer, not the modal's bottom-left, so
         * rounding it would create an awkward inward curve at that joint.
         * Modal's own `rounded-2xl` handles the actual bottom-left corner via
         * the footer below.
         */}
        <aside className="border-b border-refresh-line bg-refresh-surface p-3 sm:rounded-tl-2xl sm:border-b-0 sm:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
            {title}
          </p>
          <p className="mt-1.5 text-base font-bold leading-tight text-refresh-text sm:text-lg">
            {previewFmt.format(draft ?? new Date())}
          </p>
        </aside>

        {/* Right calendar pane */}
        <div className="flex flex-col p-3">
          <header className="mb-2 flex items-center justify-between gap-1">
            <p className="text-xs font-semibold text-refresh-text">
              {monthLabelFmt.format(viewMonth)}
            </p>
            <div className="flex items-center gap-0.5">
              <NavButton
                ariaLabel="Previous month"
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft />
              </NavButton>
              <NavButton
                ariaLabel="Next month"
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight />
              </NavButton>
            </div>
          </header>

          <DaysGrid
            month={viewMonth}
            selected={draft ?? undefined}
            onSelect={(d) => setDraft(d)}
            weekStartsOn={weekStartsOn}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      </div>

      <footer className="flex items-center justify-end gap-1.5 border-t border-refresh-line px-3 py-2">
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
          {cancelLabel}
        </Button>
        <Button size="sm" onClick={handleConfirm} disabled={!draft}>
          {confirmLabel}
        </Button>
      </footer>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function DaysGrid({
  month,
  selected,
  onSelect,
  weekStartsOn,
  minDate,
  maxDate,
}: {
  month: Date;
  selected?: Date;
  onSelect: (d: Date) => void;
  weekStartsOn: 'monday' | 'sunday';
  minDate?: Date;
  maxDate?: Date;
}) {
  const sundayFirst = weekStartsOn === 'sunday';
  const weekdays = sundayFirst
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const year = month.getFullYear();
  const m = month.getMonth();
  const firstOfMonth = new Date(year, m, 1);
  const dow = sundayFirst
    ? firstOfMonth.getDay()
    : (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const daysInPrev = new Date(year, m, 0).getDate();

  const cells: { day: number; inMonth: boolean; date: Date }[] = [];
  for (let i = dow - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    cells.push({ day: d, inMonth: false, date: new Date(year, m - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, date: new Date(year, m, d) });
  }
  let nx = 1;
  while (cells.length < 42) {
    cells.push({ day: nx, inMonth: false, date: new Date(year, m + 1, nx) });
    nx++;
  }

  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-y-0.5">
      {weekdays.map((d, i) => (
        <div
          key={`wd-${i}`}
          aria-hidden
          className="pb-1 text-center text-[10px] font-semibold text-refresh-muted-2"
        >
          {d}
        </div>
      ))}

      {cells.map((c, i) => {
        const isSelected = selected ? sameDay(c.date, selected) : false;
        const isToday = sameDay(c.date, today);
        const disabled = isOutOfRange(c.date, minDate, maxDate);

        let cls = '';
        if (isSelected) {
          cls = 'bg-refresh-blue text-refresh-on-pastel font-semibold shadow-sm';
        } else if (disabled) {
          cls = 'text-refresh-muted-2/50 cursor-not-allowed';
        } else if (isToday) {
          cls =
            'text-refresh-text font-semibold ring-1 ring-inset ring-refresh-blue hover:bg-refresh-surface';
        } else if (c.inMonth) {
          cls = 'text-refresh-text hover:bg-refresh-surface';
        } else {
          cls = 'text-refresh-muted-2 hover:bg-refresh-surface';
        }

        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(c.date)}
            aria-pressed={isSelected}
            aria-label={c.date.toLocaleDateString('en', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            tabIndex={c.inMonth ? 0 : -1}
            className={`flex aspect-square items-center justify-center rounded-full text-[11px] tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-surface-2 ${cls}`}
          >
            {c.day}
          </button>
        );
      })}
    </div>
  );
}

function NavButton({
  ariaLabel,
  onClick,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text"
    >
      {children}
    </button>
  );
}

function ChevronLeft() {
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
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
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
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ───────── Date helpers ───────── */

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isOutOfRange(d: Date, min?: Date, max?: Date): boolean {
  if (min) {
    const minStart = new Date(min);
    minStart.setHours(0, 0, 0, 0);
    if (d < minStart) return true;
  }
  if (max) {
    const maxEnd = new Date(max);
    maxEnd.setHours(23, 59, 59, 999);
    if (d > maxEnd) return true;
  }
  return false;
}
