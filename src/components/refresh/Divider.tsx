type Orientation = 'horizontal' | 'vertical';

export type DividerProps = {
  /** Default 'horizontal'. */
  orientation?: Orientation;
  /** Optional label rendered in the middle of a horizontal divider (e.g. "OR"). Ignored on vertical dividers. */
  label?: React.ReactNode;
  className?: string;
};

/**
 * Hairline separator. Use horizontal between stacked sections, vertical between
 * inline groups. Pass `label` for the classic "OR" divider in auth flows.
 */
export function Divider({
  orientation = 'horizontal',
  label,
  className = '',
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={`inline-block w-px self-stretch bg-refresh-surface-3 ${className}`}
      />
    );
  }

  // Horizontal — with optional inline label.
  if (label != null) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={`flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2 ${className}`}
      >
        <span aria-hidden className="h-px flex-1 bg-refresh-surface-3" />
        <span>{label}</span>
        <span aria-hidden className="h-px flex-1 bg-refresh-surface-3" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={`m-0 h-px border-0 bg-refresh-surface-3 ${className}`}
    />
  );
}
