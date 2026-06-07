export type ToolbarProps = {
  /** Leading slot — usually filter selects. */
  start?: React.ReactNode;
  /** Middle slot — usually a search input. Stretches to fill available space. */
  middle?: React.ReactNode;
  /** Trailing slot — usually icon-text actions (Columns / Filters / Export / Settings). */
  end?: React.ReactNode;
  /**
   * Visual treatment around the row. `'card'` wraps it in a bordered surface (matches
   * the dashboard pattern); `'plain'` is just the row.
   */
  variant?: 'card' | 'plain';
  className?: string;
};

/**
 * Layout shell for a list-page toolbar — `[start] [middle] [end]`. No opinion on
 * the contents; pass `Select`, `SearchInput`, `Button`, or anything else into the
 * three slots. Wraps onto multiple rows on narrow viewports.
 */
export function Toolbar({
  start,
  middle,
  end,
  variant = 'card',
  className = '',
}: ToolbarProps) {
  const wrapperClass =
    variant === 'card'
      ? 'rounded-xl border border-refresh-line bg-refresh-surface-2 px-4 py-3'
      : '';

  return (
    <div
      role="toolbar"
      className={`flex flex-wrap items-center gap-3 ${wrapperClass} ${className}`}
    >
      {start && <div className="flex flex-wrap items-center gap-2">{start}</div>}
      {middle && <div className="min-w-[200px] flex-1">{middle}</div>}
      {end && (
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 sm:ml-auto">{end}</div>
      )}
    </div>
  );
}
