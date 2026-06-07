'use client';

export type CalendarProps = {
  monthDate: Date;
  selected?: Date;
  /** Hide the "today" highlight ring. Default false. */
  hideToday?: boolean;
  weekDayLabels?: [string, string, string, string, string, string, string];
  monthLabel?: string;
  onSelect?: (d: Date) => void;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
};

const DEFAULT_WEEKDAYS: [string, string, string, string, string, string, string] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({
  monthDate,
  selected,
  hideToday = false,
  weekDayLabels = DEFAULT_WEEKDAYS,
  monthLabel,
  onSelect,
  onPrev,
  onNext,
  className = '',
}: CalendarProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // 0=Sun..6=Sat -> shift so Mon=0
  const dayOfWeek = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean; date: Date }[] = [];
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({ day: d, inMonth: false, date: new Date(year, month - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
  }
  let next = 1;
  while (cells.length < 42) {
    cells.push({ day: next, inMonth: false, date: new Date(year, month + 1, next) });
    next++;
  }

  const label =
    monthLabel ?? firstOfMonth.toLocaleString('en', { month: 'long', year: 'numeric' });

  const today = new Date();

  return (
    <div
      className={`rounded-2xl border border-refresh-line bg-refresh-surface-2 p-3 ${className}`}
    >
      <header className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={onPrev}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-surface-2"
        >
          <ChevronLeft />
        </button>
        <p className="text-base font-semibold text-refresh-text">{label}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={onNext}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-surface-2"
        >
          <ChevronRight />
        </button>
      </header>

      {/*
       * Weekday row + day cells share a single 7-column grid so they line up
       * exactly. No chip background on the weekdays — they're just labels.
       */}
      <div className="grid grid-cols-7 gap-y-1">
        {weekDayLabels.map((d) => (
          <div
            key={d}
            aria-hidden
            className="pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2"
          >
            {d}
          </div>
        ))}

        {cells.map((c, i) => {
          const isSelected = selected ? sameDay(c.date, selected) : false;
          const isToday = !hideToday && sameDay(c.date, today);

          let cellCls = '';
          if (isSelected) {
            // Round filled circle in the brand-blue tone — matches DatePickerDialog.
            cellCls =
              'bg-refresh-blue text-refresh-on-pastel font-semibold shadow-sm';
          } else if (isToday) {
            cellCls =
              'text-refresh-text font-semibold ring-1 ring-inset ring-refresh-blue hover:bg-refresh-surface';
          } else if (c.inMonth) {
            cellCls = 'text-refresh-text hover:bg-refresh-surface';
          } else {
            cellCls = 'text-refresh-muted-2 hover:bg-refresh-surface';
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(c.date)}
              aria-pressed={isSelected}
              aria-label={c.date.toLocaleDateString('en', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              tabIndex={c.inMonth ? 0 : -1}
              className={`flex aspect-square items-center justify-center rounded-full text-sm tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-surface-2 ${cellCls}`}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Icons ───────── */

function ChevronLeft() {
  return (
    <svg
      width="18"
      height="18"
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
      width="18"
      height="18"
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
