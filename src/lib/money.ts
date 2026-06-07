export function somoni(amount: number): string {
  const n = Number(amount || 0);
  return (
    n.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + " смн"
  );
}

export function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  // Storage uses UTC midnight (input "yyyy-mm-dd" parsed as UTC), so display in
  // UTC too — keeps the shown day equal to the stored/grouped day on any host TZ.
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function toInputDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}
