"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { t } from "@/lib/i18n";

/**
 * Refresh-themed date-range calendar — preset sidebar + a single month grid
 * with a connected range band + "from → to" footer + Cancel/Apply.
 *
 * Everything is computed in UTC so it matches the server (Vercel = UTC) and the
 * UTC-midnight storage contract (see money.ts): the day you see/click and the
 * `YYYY-MM-DD` Apply emits are the same UTC day the server filters on. The whole
 * app already treats dates as UTC (fmtDate), so this stays consistent.
 */

const MONTHS_TG = [
  "Январ", "Феврал", "Март", "Апрел", "Май", "Июн",
  "Июл", "Август", "Сентябр", "Октябр", "Ноябр", "Декабр",
];
const MONTHS_TG_SHORT = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];
// Monday-first weekday abbreviations (Душанбе … Якшанбе).
const WEEKDAYS_TG = ["Дш", "Сш", "Чш", "Пш", "Ҷм", "Шб", "Яш"];
const DAY_MS = 86_400_000;

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function fromKey(s?: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
/** Normalise any instant to its UTC-midnight day. */
function utcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function todayUtc() {
  return utcDay(new Date());
}
function startOfMonthUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * DAY_MS);
}
function minDay(a: Date, b: Date) {
  return a.getTime() <= b.getTime() ? a : b;
}
function fmtShort(d: Date) {
  return `${d.getUTCDate()} ${MONTHS_TG_SHORT[d.getUTCMonth()]}`;
}

type PresetId = "today" | "yesterday" | "week" | "month" | "year";

/** Preset ranges, computed in UTC and clamped so `end` never runs past today. */
function presetRange(id: PresetId, now: Date): { start: Date; end: Date } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  switch (id) {
    case "today":
      return { start: now, end: now };
    case "yesterday": {
      const d = addDays(now, -1);
      return { start: d, end: d };
    }
    case "week": {
      const dow = (now.getUTCDay() + 6) % 7; // 0 = Monday
      const start = addDays(now, -dow);
      return { start, end: minDay(addDays(start, 6), now) };
    }
    case "month":
      return { start: new Date(Date.UTC(y, m, 1)), end: minDay(new Date(Date.UTC(y, m + 1, 0)), now) };
    case "year":
      return { start: new Date(Date.UTC(y, 0, 1)), end: minDay(new Date(Date.UTC(y, 11, 31)), now) };
  }
}

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "today", label: t.rangeToday },
  { id: "yesterday", label: t.rangeYesterday },
  { id: "week", label: t.thisWeek },
  { id: "month", label: t.thisMonth },
  { id: "year", label: t.thisYear },
];

export function DateRangeCalendar({
  initialFrom,
  initialTo,
  onApply,
  onCancel,
}: {
  initialFrom?: string;
  initialTo?: string;
  onApply: (from: string, to: string) => void;
  onCancel: () => void;
}) {
  const seedStart = fromKey(initialFrom);
  const seedEnd = fromKey(initialTo);
  // Stable "today" for the session so presets/highlight don't drift mid-use.
  const [nowDay] = useState(todayUtc);
  const [start, setStart] = useState<Date | null>(seedStart);
  const [end, setEnd] = useState<Date | null>(seedEnd);
  const [view, setView] = useState<Date>(() => startOfMonthUtc(seedStart ?? nowDay));
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpYear, setJumpYear] = useState<number>(() => (seedStart ?? nowDay).getUTCFullYear());
  const jumpRef = useRef<HTMLDivElement>(null);

  // Dismiss the inner month/year jump panel on outside-click / Escape, without
  // closing the whole popover (Escape is captured before the bar's handler).
  useEffect(() => {
    if (!jumpOpen) return;
    const onDown = (e: MouseEvent) => {
      if (jumpRef.current && !jumpRef.current.contains(e.target as Node)) setJumpOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setJumpOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true); // capture: run before the popover's Escape
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [jumpOpen]);

  function pickDay(d: Date) {
    setJumpOpen(false);
    if (!start || end) {
      setStart(d);
      setEnd(null);
    } else if (d < start) {
      setEnd(start);
      setStart(d);
    } else {
      setEnd(d);
    }
  }

  function choosePreset(id: PresetId) {
    const { start: s, end: e } = presetRange(id, nowDay);
    setStart(s);
    setEnd(e);
    setView(startOfMonthUtc(s));
    setJumpYear(s.getUTCFullYear());
    setJumpOpen(false);
  }

  const activePreset = PRESETS.find((p) => {
    if (!start || !end) return false;
    const r = presetRange(p.id, nowDay);
    return sameDay(r.start, start) && sameDay(r.end, end);
  })?.id;

  // Build the 6×7 grid for the visible month (Monday-first), all in UTC.
  const year = view.getUTCFullYear();
  const month = view.getUTCMonth();
  const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const daysInPrev = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: { d: number; inMonth: boolean; date: Date }[] = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ d: daysInPrev - i, inMonth: false, date: new Date(Date.UTC(year, month - 1, daysInPrev - i)) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, inMonth: true, date: new Date(Date.UTC(year, month, d)) });
  }
  for (let d = 1; cells.length < 42; d++) {
    cells.push({ d, inMonth: false, date: new Date(Date.UTC(year, month + 1, d)) });
  }

  const hasSelection = !!start;
  const summary = start
    ? end && !sameDay(start, end)
      ? `${fmtShort(start)} → ${fmtShort(end)}`
      : fmtShort(start)
    : t.period;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Preset sidebar */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto sm:w-36 sm:flex-col sm:overflow-visible">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => choosePreset(p.id)}
            aria-pressed={activePreset === p.id}
            className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-semibold transition sm:w-full ${
              activePreset === p.id
                ? "bg-refresh-surface-3 text-refresh-text"
                : "bg-refresh-surface-2 text-refresh-muted hover:bg-refresh-surface-3 hover:text-refresh-text sm:bg-transparent"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label={t.previousMonth}
            onClick={() => {
              setJumpOpen(false);
              setView(new Date(Date.UTC(year, month - 1, 1)));
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-refresh-muted-2 transition hover:bg-refresh-surface-3 hover:text-refresh-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={jumpRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setJumpYear(year);
                setJumpOpen((v) => !v);
              }}
              aria-haspopup="dialog"
              aria-expanded={jumpOpen}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-base font-semibold text-refresh-text transition hover:bg-refresh-surface-3"
            >
              {MONTHS_TG[month]} {year}
              <ChevronDown className="h-4 w-4 text-refresh-muted-2" />
            </button>

            {jumpOpen && (
              <div className="absolute left-1/2 top-[calc(100%+0.25rem)] z-10 w-60 -translate-x-1/2 rounded-xl border border-refresh-line bg-refresh-surface-2 p-3 shadow-2xl">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label={t.previousYear}
                    onClick={() => setJumpYear((y) => y - 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-refresh-muted-2 hover:bg-refresh-surface-3 hover:text-refresh-text"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-refresh-text">{jumpYear}</span>
                  <button
                    type="button"
                    aria-label={t.nextYear}
                    onClick={() => setJumpYear((y) => y + 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-refresh-muted-2 hover:bg-refresh-surface-3 hover:text-refresh-text"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {MONTHS_TG_SHORT.map((mn, i) => {
                    const sel = i === month && jumpYear === year;
                    return (
                      <button
                        key={mn}
                        type="button"
                        onClick={() => {
                          setView(new Date(Date.UTC(jumpYear, i, 1)));
                          setJumpOpen(false);
                        }}
                        className={`rounded-lg px-2 py-1.5 text-sm font-medium transition ${
                          sel
                            ? "bg-refresh-blue text-refresh-on-pastel"
                            : "text-refresh-text hover:bg-refresh-surface-3"
                        }`}
                      >
                        {mn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={t.nextMonth}
            onClick={() => {
              setJumpOpen(false);
              setView(new Date(Date.UTC(year, month + 1, 1)));
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-refresh-muted-2 transition hover:bg-refresh-surface-3 hover:text-refresh-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* gap-y only — cells touch horizontally so the range paints as one band */}
        <div className="grid grid-cols-7 gap-y-1">
          {WEEKDAYS_TG.map((w) => (
            <div
              key={w}
              aria-hidden
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2"
            >
              {w}
            </div>
          ))}

          {cells.map((c, i) => {
            const cd = c.date;
            const isStart = start ? sameDay(cd, start) : false;
            const isEnd = end ? sameDay(cd, end) : false;
            const hasRange = !!(start && end && !sameDay(start, end));
            const inBand = hasRange && cd.getTime() > start!.getTime() && cd.getTime() < end!.getTime();
            const isEndpoint = isStart || isEnd;
            const single = isEndpoint && !hasRange;
            const isToday = sameDay(cd, nowDay);
            const col = i % 7;

            let cls: string;
            if (single) {
              cls = "rounded-lg bg-refresh-blue font-semibold text-refresh-on-pastel";
            } else if (isEndpoint) {
              cls = "bg-refresh-blue font-semibold text-refresh-on-pastel";
              if (isStart || col === 0) cls += " rounded-l-lg";
              if (isEnd || col === 6) cls += " rounded-r-lg";
            } else if (inBand) {
              cls = "bg-refresh-surface-3 text-refresh-text";
              if (col === 0) cls += " rounded-l-lg";
              if (col === 6) cls += " rounded-r-lg";
            } else if (c.inMonth) {
              cls = "rounded-lg text-refresh-text hover:bg-refresh-surface-3";
              if (isToday) cls += " ring-1 ring-inset ring-refresh-blue/40";
            } else {
              cls = "rounded-lg text-refresh-muted-2 hover:bg-refresh-surface-3";
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => pickDay(cd)}
                aria-label={`${cd.getUTCDate()} ${MONTHS_TG[cd.getUTCMonth()]} ${cd.getUTCFullYear()}`}
                aria-pressed={isEndpoint || inBand}
                aria-current={isToday ? "date" : undefined}
                className={`flex h-9 items-center justify-center text-sm tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-refresh-text ${cls}`}
              >
                {c.d}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${hasSelection ? "text-refresh-text" : "text-refresh-muted-2"}`}
          >
            {summary}
          </span>
          <div className="flex shrink-0 gap-2">
            <button type="button" className="btn-ghost" onClick={onCancel}>
              {t.cancel}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!start}
              onClick={() => start && onApply(toKey(start), toKey(end ?? start))}
            >
              {t.apply}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
