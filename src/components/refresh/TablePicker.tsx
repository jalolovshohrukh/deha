'use client';

export type TableState = 'vacant' | 'seated' | 'billed' | 'reserved' | 'closed';

export type FloorTable = {
  id: string;
  /** Short label shown on the chip (e.g. "A1", "12"). */
  label: string;
  state: TableState;
  /** Capacity (number of seats). */
  seats?: number;
  /** Optional party size currently seated. */
  guestCount?: number;
  /** Order total currently open at this table. */
  openTotal?: number;
  /** Optional grid placement (1-based). When omitted, items flow in a wrap layout. */
  row?: number;
  col?: number;
};

export type TablePickerProps = {
  tables: FloorTable[];
  /** Currently selected table id. */
  value?: string | null;
  onChange: (id: string) => void;
  /** Layout mode — 'grid' uses table.row/col placement, 'flow' wraps. Default 'flow'. */
  layout?: 'grid' | 'flow';
  /** Number of columns in grid mode. Default 6. */
  gridCols?: number;
  currency?: string;
  locale?: string;
  className?: string;
};

const stateClasses: Record<TableState, { box: string; pill: string; label: string }> = {
  vacant: {
    box: 'border-refresh-surface-3 bg-refresh-surface text-refresh-muted hover:border-refresh-muted-2 hover:text-refresh-text',
    pill: 'bg-refresh-surface-3 text-refresh-muted',
    label: 'Vacant',
  },
  seated: {
    box: 'border-refresh-sage/60 bg-refresh-sage/10 text-refresh-text hover:bg-refresh-sage/15',
    pill: 'bg-refresh-sage/20 text-refresh-sage',
    label: 'Seated',
  },
  billed: {
    box: 'border-refresh-blue/60 bg-refresh-blue/10 text-refresh-text hover:bg-refresh-blue/15',
    pill: 'bg-refresh-blue/20 text-refresh-blue',
    label: 'Billed',
  },
  reserved: {
    box: 'border-refresh-lavender/60 bg-refresh-lavender/10 text-refresh-text hover:bg-refresh-lavender/15',
    pill: 'bg-refresh-lavender/20 text-refresh-lavender',
    label: 'Reserved',
  },
  closed: {
    box: 'border-refresh-line bg-refresh-surface-2 text-refresh-muted-2 cursor-not-allowed',
    pill: 'bg-refresh-surface text-refresh-muted-2',
    label: 'Closed',
  },
};

/**
 * Floor-plan table picker — visually represents tables with state-tinted chips.
 *
 * @example
 *   <TablePicker
 *     tables={floorTables}
 *     value={selectedTableId}
 *     onChange={setSelectedTableId}
 *     layout="grid"
 *     gridCols={6}
 *   />
 */
export function TablePicker({
  tables,
  value,
  onChange,
  layout = 'flow',
  gridCols = 6,
  currency = 'USD',
  locale = 'en-US',
  className = '',
}: TablePickerProps) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  const containerCls =
    layout === 'grid'
      ? `grid gap-2`
      : 'flex flex-wrap gap-2';

  const gridStyle =
    layout === 'grid' ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : undefined;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Legend />
      <div role="grid" aria-label="Floor plan" className={containerCls} style={gridStyle}>
        {tables.map((t) => {
          const cfg = stateClasses[t.state];
          const selected = value === t.id;
          const disabled = t.state === 'closed';
          const cellStyle =
            layout === 'grid' && t.row != null && t.col != null
              ? { gridRow: t.row, gridColumn: t.col }
              : undefined;
          return (
            <button
              key={t.id}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`Table ${t.label} — ${cfg.label}${
                t.guestCount != null ? `, ${t.guestCount} guests` : ''
              }`}
              onClick={() => onChange(t.id)}
              style={cellStyle}
              className={`relative flex aspect-[4/3] flex-col items-start justify-between rounded-xl border-2 p-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg disabled:cursor-not-allowed disabled:opacity-60 ${
                cfg.box
              } ${selected ? 'ring-2 ring-refresh-text ring-offset-2 ring-offset-refresh-bg' : ''}`}
            >
              <div className="flex w-full items-start justify-between gap-1">
                <span className="text-base font-bold leading-none">{t.label}</span>
                {t.seats != null && (
                  <span className="text-[10px] font-semibold tabular-nums opacity-70">
                    {t.guestCount != null ? `${t.guestCount}/${t.seats}` : `${t.seats} seats`}
                  </span>
                )}
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${cfg.pill}`}
                >
                  {cfg.label}
                </span>
                {t.openTotal != null && t.openTotal > 0 && (
                  <span className="text-[10px] font-bold tabular-nums opacity-90">
                    {formatter.format(t.openTotal)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const items: TableState[] = ['vacant', 'seated', 'billed', 'reserved'];
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-refresh-muted">
      {items.map((s) => {
        const cfg = stateClasses[s];
        return (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className={`inline-flex h-2.5 w-2.5 rounded-sm ${cfg.pill.split(' ')[0]}`}
            />
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}
