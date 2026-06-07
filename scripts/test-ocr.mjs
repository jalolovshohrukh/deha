// Validates the receipt parser against real-world samples.
// NOTE: keep toNumber()/parseOcr() identical to src/lib/ocr.ts.

function toNumber(raw) {
  let v = raw.replace(/[\s ]/g, "");
  if (v.includes(".") && v.includes(",")) {
    if (v.lastIndexOf(",") > v.lastIndexOf(".")) v = v.replace(/\./g, "").replace(",", ".");
    else v = v.replace(/,/g, "");
  } else if (v.includes(",")) {
    v = /,\d{1,2}$/.test(v) ? v.replace(",", ".") : v.replace(/,/g, "");
  } else if ((v.match(/\./g) || []).length > 1) {
    v = v.replace(/\./g, "");
  } else if (/\.\d{3}$/.test(v)) {
    v = v.replace(/\./g, "");
  }
  return parseFloat(v);
}

const MONEY_RE = /\d{1,3}(?:[ . ]\d{3})*[.,]\d{2}|\d+[.,]\d{2}/g;
const NUM_RE = /\d[\d  .,]*\d|\d/g;
const EXCLUDE_RE =
  /(сч[её]т|карт|инн|номер|комисс|телефон|дата|сана|врем|ва[қк]т|operation|account|card|status|статус)/i;
const DATE_RE = /(\d{2})[.\/\-](\d{2})[.\/\-](\d{4})/;
const ISO_RE = /(\d{4})-(\d{2})-(\d{2})/;

function parseOcr(text) {
  const out = {};
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  let amount = null;
  for (const line of lines) {
    const low = line.toLowerCase();
    const isAmountLabel = low.includes("сумм") || low.includes("маблағ") || low.includes("маблаг");
    if (!isAmountLabel || low.includes("комисс")) continue;
    const dec = line.match(MONEY_RE);
    if (dec) {
      const n = toNumber(dec[dec.length - 1]);
      if (isFinite(n) && n > 0) { amount = n; break; }
    }
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

  const validDM = (mo, da) => mo >= 1 && mo <= 12 && da >= 1 && da <= 31;
  const iso = text.match(ISO_RE);
  let dm = null;
  for (const line of lines) {
    const low = line.toLowerCase();
    if (low.includes("дата") || low.includes("сана")) {
      const x = line.match(DATE_RE);
      if (x) { dm = x; break; }
    }
  }
  if (!dm) dm = text.match(DATE_RE);
  if (iso && validDM(+iso[2], +iso[3])) {
    out.date = `${iso[1]}-${iso[2]}-${iso[3]}`;
  } else if (dm) {
    const a = +dm[1], b = +dm[2];
    let day = a, mo = b;
    if (a > 12 && b <= 12) { day = a; mo = b; }
    else if (b > 12 && a <= 12) { day = b; mo = a; }
    if (validDM(mo, day)) out.date = `${dm[3]}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  if (/alif|алиф/i.test(text)) out.provider = "Alif";
  else if (/\bdc\b|\bдс\b|душанбе сити|city dushanbe|dushanbe city/i.test(text)) out.provider = "DC";

  return out;
}

// ---- samples ----
const dcClean = `ЗАО "Душанбе Сити Банк"
ИНН: 510022404
Таджикистан, г. Душанбе
Дата операции: 06.06.2026
Время операции: 20:07:54
Номер операции: 1762562042
Поставщик: DC (по номеру телефона)
Счет отправителя: 9762***3900
Счет получателя: 992019062006
Сумма операции: 1380.00
Комиссия:: 0.00
Статус: Успешный`;

// what an English-only OCR would produce: Cyrillic labels become garbage,
// but digits, "DC" and the "*" mask survive
const dcGarbled = `3A0 "..."
MHH: 510022404
06.06.2026
20:07:54
1762562042
DC (no Homepy)
9762***3900
992019062006
1380.00
0.00`;

const alif = `Алиф Бонк
Дата: 07.06.2026
Сумма: 250,00 смн
Статус: Успешно`;

const thousands = `Сумма операции: 12 500,00`;
const dotThousands = `Сумма: 1.380,00`;
const intAmount = `Сумма операции 1380`;

const cases = [
  { name: "DC clean", text: dcClean, want: { amount: "1380", date: "2026-06-06", provider: "DC" } },
  { name: "DC garbled (eng OCR)", text: dcGarbled, want: { amount: "1380", date: "2026-06-06", provider: "DC" } },
  { name: "Alif", text: alif, want: { amount: "250", date: "2026-06-07", provider: "Alif" } },
  { name: "space thousands", text: thousands, want: { amount: "12500" } },
  { name: "dot thousands", text: dotThousands, want: { amount: "1380" } },
  { name: "integer amount", text: intAmount, want: { amount: "1380" } },
];

let fails = 0;
for (const c of cases) {
  const got = parseOcr(c.text);
  const miss = Object.entries(c.want).filter(([k, v]) => got[k] !== v);
  const ok = miss.length === 0;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}  -> ${JSON.stringify(got)}` +
    (ok ? "" : `  EXPECTED ${JSON.stringify(c.want)}`));
}
console.log(fails ? `\n${fails} case(s) failed` : "\nAll OCR parser cases passed");
process.exit(fails ? 1 : 0);
