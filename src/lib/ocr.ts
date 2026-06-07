// Best-effort parser for Tajik bank payment receipts (DC / Dushanbe City,
// Alif, etc.). Receipts are mostly Russian Cyrillic with a two-column
// "label : value" layout and NO currency word next to the amount, e.g.:
//
//   Дата операции:      06.06.2026
//   Сумма операции:     1380.00
//   Комиссия::          0.00
//   Счет отправителя:   9762***3900
//
// The amount must be read from the "Сумма" line — never from an account /
// operation-number / commission line — so we use label-aware extraction with a
// decimals-required fallback that ignores IDs, masked accounts and dates.

export type OcrResult = { amount?: string; date?: string; provider?: string };

/** Parse "1 380,00" / "1.380,00" / "1380.00" / "1,380.00" / "1.380" → number */
export function toNumber(raw: string): number {
  let v = raw.replace(/[\s ]/g, "");
  if (v.includes(".") && v.includes(",")) {
    // the right-most separator is the decimal one
    if (v.lastIndexOf(",") > v.lastIndexOf(".")) v = v.replace(/\./g, "").replace(",", ".");
    else v = v.replace(/,/g, "");
  } else if (v.includes(",")) {
    v = /,\d{1,2}$/.test(v) ? v.replace(",", ".") : v.replace(/,/g, "");
  } else if ((v.match(/\./g) || []).length > 1) {
    v = v.replace(/\./g, ""); // 1.380.000 → thousands
  } else if (/\.\d{3}$/.test(v)) {
    v = v.replace(/\./g, ""); // 1.380 → thousands (not 1.38)
  }
  return parseFloat(v);
}

// numbers that carry 2 decimals — i.e. real money amounts (1380.00, 0.00)
const MONEY_RE = /\d{1,3}(?:[ . ]\d{3})*[.,]\d{2}|\d+[.,]\d{2}/g;
// any integer/number token
const NUM_RE = /\d[\d  .,]*\d|\d/g;
// lines that never contain the donation amount
const EXCLUDE_RE =
  /(сч[её]т|карт|инн|номер|комисс|телефон|дата|сана|врем|ва[қк]т|operation|account|card|status|статус)/i;
const DATE_RE = /(\d{2})[.\/\-](\d{2})[.\/\-](\d{4})/;
const ISO_RE = /(\d{4})-(\d{2})-(\d{2})/;

export function parseOcr(text: string): OcrResult {
  const out: OcrResult = {};
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  // ---------- amount ----------
  let amount: number | null = null;

  // 1) the line explicitly labelled "Сумма" / "Маблағ" (but not "Комиссия")
  for (const line of lines) {
    const low = line.toLowerCase();
    const isAmountLabel = low.includes("сумм") || low.includes("маблағ") || low.includes("маблаг");
    if (!isAmountLabel || low.includes("комисс")) continue;
    const dec = line.match(MONEY_RE);
    if (dec) {
      const n = toNumber(dec[dec.length - 1]);
      if (isFinite(n) && n > 0) { amount = n; break; }
    }
    // label line with an integer-only amount (no decimals)
    const ints = line.match(NUM_RE);
    if (ints) {
      let bestInt = 0;
      for (const tok of ints) {
        const n = toNumber(tok);
        if (isFinite(n) && n > 0 && n < 1e8 && n > bestInt) bestInt = n;
      }
      if (bestInt > 0) { amount = bestInt; break; }
    }
  }

  // 2) fallback: largest 2-decimal number that is not on an
  //    account / id / commission / date line and not a masked value
  if (amount == null) {
    let best = 0;
    for (const line of lines) {
      if (EXCLUDE_RE.test(line) || DATE_RE.test(line) || line.includes("*")) continue;
      const m = line.match(MONEY_RE);
      if (!m) continue;
      for (const tok of m) {
        const n = toNumber(tok);
        if (isFinite(n) && n > 0 && n > best) best = n;
      }
    }
    if (best > 0) amount = best;
  }

  if (amount != null) out.amount = String(amount);

  // ---------- date ----------
  const validDM = (mo: number, da: number) => mo >= 1 && mo <= 12 && da >= 1 && da <= 31;

  const iso = text.match(ISO_RE);
  let dm: RegExpMatchArray | null = null;
  // prefer a date on a line labelled "Дата" / "Сана"
  for (const line of lines) {
    const low = line.toLowerCase();
    if (low.includes("дата") || low.includes("сана")) {
      const x = line.match(DATE_RE);
      if (x) { dm = x; break; }
    }
  }
  if (!dm) dm = text.match(DATE_RE); // else first dd.mm.yyyy anywhere

  if (iso && validDM(+iso[2], +iso[3])) {
    out.date = `${iso[1]}-${iso[2]}-${iso[3]}`;
  } else if (dm) {
    const a = +dm[1];
    const b = +dm[2];
    let day = a;
    let mo = b; // regional dd.mm default
    if (a > 12 && b <= 12) { day = a; mo = b; }
    else if (b > 12 && a <= 12) { day = b; mo = a; }
    if (validDM(mo, day)) {
      out.date = `${dm[3]}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // ---------- provider (to auto-pick the matching account) ----------
  if (/alif|алиф/i.test(text)) out.provider = "Alif";
  else if (/\bdc\b|\bдс\b|душанбе сити|city dushanbe|dushanbe city/i.test(text)) out.provider = "DC";

  return out;
}
