import { t } from "./i18n";

// Shared date-range filter. Used by the dashboard + donations + expenses pages
// to scope their time-based metrics. Safe to import from both server and client
// code (no prisma / server-only deps here).

export type RangeKey = "all" | "today" | "yesterday" | "7d" | "30d" | "ytd" | "custom";

export type ResolvedRange = {
  key: RangeKey;
  /** Inclusive start (UTC). null = unbounded (open start). */
  from: Date | null;
  /** Inclusive end (UTC, 23:59:59.999). null = unbounded (open end). */
  to: Date | null;
  label: string;
};

/** Quick-pick chips shown in the bar (Custom is rendered separately). */
export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "all", label: t.rangeAll },
  { key: "today", label: t.rangeToday },
  { key: "yesterday", label: t.rangeYesterday },
  { key: "7d", label: t.range7d },
  { key: "30d", label: t.range30d },
  { key: "ytd", label: t.rangeYtd },
];

// Donations/expenses are stored at UTC midnight (see money.ts), so all bounds
// are computed in UTC to keep the filter aligned with the stored day.
function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
function endOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}
function addUtcDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000);
}

/** Parse a `YYYY-MM-DD` string (from a date input) into a UTC Date, or null. */
function parseIsoDay(s: string | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

const ALL: ResolvedRange = { key: "all", from: null, to: null, label: t.rangeAll };

/** Resolve URL search params into a concrete range. Defaults to all-time. */
export function resolveRange(params: { range?: string; from?: string; to?: string }): ResolvedRange {
  const key = (params.range ?? "all") as RangeKey;
  const now = new Date();

  switch (key) {
    case "today":
      return { key, from: startOfUtcDay(now), to: endOfUtcDay(now), label: t.rangeToday };
    case "yesterday": {
      const y = addUtcDays(now, -1);
      return { key, from: startOfUtcDay(y), to: endOfUtcDay(y), label: t.rangeYesterday };
    }
    case "7d":
      return { key, from: startOfUtcDay(addUtcDays(now, -6)), to: endOfUtcDay(now), label: t.range7d };
    case "30d":
      return { key, from: startOfUtcDay(addUtcDays(now, -29)), to: endOfUtcDay(now), label: t.range30d };
    case "ytd":
      return {
        key,
        from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
        to: endOfUtcDay(now),
        label: t.rangeYtd,
      };
    case "custom": {
      const fromDay = parseIsoDay(params.from);
      const toDay = parseIsoDay(params.to);
      const from = fromDay ? startOfUtcDay(fromDay) : null;
      const to = toDay ? endOfUtcDay(toDay) : null;
      if (!from && !to) return ALL; // empty custom = no filter
      // Tolerate reversed input (from > to) by swapping.
      if (from && to && from > to) {
        return { key, from: startOfUtcDay(toDay!), to: endOfUtcDay(fromDay!), label: t.rangeCustom };
      }
      return { key, from, to, label: t.rangeCustom };
    }
    default:
      return ALL;
  }
}

/** Prisma `date` filter for the range, or undefined when unbounded (all-time). */
export function dateFilter(r: ResolvedRange): { gte?: Date; lte?: Date } | undefined {
  if (!r.from && !r.to) return undefined;
  const f: { gte?: Date; lte?: Date } = {};
  if (r.from) f.gte = r.from;
  if (r.to) f.lte = r.to;
  return f;
}

/** A `where` fragment ({} or { date: {...} }) ready to spread into a Prisma query. */
export function dateWhere(r: ResolvedRange): { date?: { gte?: Date; lte?: Date } } {
  const f = dateFilter(r);
  return f ? { date: f } : {};
}
