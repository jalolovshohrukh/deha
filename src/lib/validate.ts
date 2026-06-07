const MAX_MONEY = 1e12;

/** Parse a positive money amount from a form value. Rejects NaN, Infinity,
 *  zero, negatives, and absurdly large values. Returns null if invalid. */
export function parseAmount(raw: FormDataEntryValue | null): number | null {
  const n = parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n) || n <= 0 || n > MAX_MONEY) return null;
  return n;
}

/** Parse a non-negative money amount (e.g. an opening balance). Allows 0. */
export function parseNonNegative(raw: FormDataEntryValue | null): number | null {
  const n = parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n) || n < 0 || n > MAX_MONEY) return null;
  return n;
}

/** Parse an age, clamped to a sane range. Returns null if absent/invalid. */
export function parseAge(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 0 && n <= 120 ? n : null;
}

/** Normalize a name for matching: collapse whitespace, trim, lowercase. */
export function normName(s: string | null): string | null {
  return s ? s.replace(/\s+/g, " ").trim().toLowerCase() : null;
}
