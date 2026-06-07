'use client';

export type Denomination = {
  id: string;
  /** Display label (e.g. "$100", "5 TJS"). */
  label: string;
  /** Numeric face value of one unit. */
  value: number;
  /** 'bill' | 'coin' for visual grouping. Default 'bill'. */
  kind?: 'bill' | 'coin';
};

export type CashDrawerCountProps = {
  denominations: Denomination[];
  /** Map of denomination id → quantity counted. */
  counts: Record<string, number>;
  onCountsChange: (next: Record<string, number>) => void;
  /** Expected total (e.g. opening float). When set, variance is calculated. */
  expected?: number;
  currency?: string;
  locale?: string;
  className?: string;
};

/**
 * Cash-drawer reconciliation grid. Cashiers enter the count of each denomination;
 * the component sums up the total, and (if `expected` is provided) reports variance.
 *
 * @example
 *   <CashDrawerCount
 *     denominations={USD_DENOMINATIONS}
 *     counts={counts}
 *     onCountsChange={setCounts}
 *     expected={250}
 *   />
 */
export function CashDrawerCount({
  denominations,
  counts,
  onCountsChange,
  expected,
  currency = 'USD',
  locale = 'en-US',
  className = '',
}: CashDrawerCountProps) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  const setCount = (id: string, raw: string) => {
    const cleaned = raw.replace(/[^\d]/g, '');
    const n = cleaned === '' ? 0 : Number(cleaned);
    onCountsChange({ ...counts, [id]: Number.isFinite(n) ? n : 0 });
  };

  const total = denominations.reduce((sum, d) => sum + (counts[d.id] ?? 0) * d.value, 0);
  const variance = expected != null ? total - expected : null;

  const bills = denominations.filter((d) => (d.kind ?? 'bill') === 'bill');
  const coins = denominations.filter((d) => d.kind === 'coin');

  return (
    <div role="group" aria-label="Cash drawer count" className={`flex flex-col gap-5 ${className}`}>
      {bills.length > 0 && (
        <DenomGrid
          title="Bills"
          denoms={bills}
          counts={counts}
          onChange={setCount}
          formatter={formatter}
        />
      )}
      {coins.length > 0 && (
        <DenomGrid
          title="Coins"
          denoms={coins}
          counts={counts}
          onChange={setCount}
          formatter={formatter}
        />
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <SummaryTile label="Counted" value={formatter.format(total)} />
        {expected != null && (
          <SummaryTile label="Expected" value={formatter.format(expected)} />
        )}
        {variance != null && (
          <SummaryTile
            label="Variance"
            value={`${variance >= 0 ? '+' : ''}${formatter.format(variance)}`}
            tone={
              Math.abs(variance) < 0.01 ? 'success' : variance > 0 ? 'info' : 'warn'
            }
          />
        )}
      </div>
    </div>
  );
}

function DenomGrid({
  title,
  denoms,
  counts,
  onChange,
  formatter,
}: {
  title: string;
  denoms: Denomination[];
  counts: Record<string, number>;
  onChange: (id: string, raw: string) => void;
  formatter: Intl.NumberFormat;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
        {title}
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {denoms.map((d) => {
          const qty = counts[d.id] ?? 0;
          const lineTotal = qty * d.value;
          return (
            <li
              key={d.id}
              className="flex flex-col gap-1.5 rounded-lg border border-refresh-line bg-refresh-surface-2 p-3"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-refresh-text">{d.label}</span>
                <span className="text-[11px] tabular-nums text-refresh-muted-2">
                  {formatter.format(lineTotal)}
                </span>
              </div>
              <div className="flex items-stretch overflow-hidden rounded-md border border-refresh-surface-3 bg-refresh-surface">
                <button
                  type="button"
                  aria-label={`Subtract one ${d.label}`}
                  disabled={qty <= 0}
                  onClick={() => onChange(d.id, String(Math.max(0, qty - 1)))}
                  className="h-9 w-9 text-refresh-text transition hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label={`Count of ${d.label}`}
                  value={qty}
                  onChange={(e) => onChange(d.id, e.target.value)}
                  className="h-9 flex-1 border-x border-refresh-line bg-transparent text-center text-sm font-bold tabular-nums text-refresh-text outline-none focus:bg-refresh-surface-3"
                />
                <button
                  type="button"
                  aria-label={`Add one ${d.label}`}
                  onClick={() => onChange(d.id, String(qty + 1))}
                  className="h-9 w-9 text-refresh-text transition hover:bg-refresh-surface-3"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warn' | 'info';
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-refresh-sage/15 text-refresh-sage'
      : tone === 'warn'
      ? 'bg-refresh-pink/15 text-refresh-pink'
      : tone === 'info'
      ? 'bg-refresh-blue/15 text-refresh-blue'
      : 'bg-refresh-surface text-refresh-text';
  return (
    <div className={`flex flex-col gap-1 rounded-lg px-3 py-2 ${toneClass}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums">{value}</span>
    </div>
  );
}
