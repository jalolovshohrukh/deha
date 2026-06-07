/* === Table primitives ================================================== */

export function Table({
  className = '',
  children,
  ...rest
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={`w-full border-collapse text-sm ${className}`} {...rest}>
      {children}
    </table>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-b border-refresh-line last:border-b-0 ${className}`} {...rest}>
      {children}
    </tr>
  );
}

export function Th({
  align = 'left',
  className = '',
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2 ${alignClass} ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({
  align = 'left',
  className = '',
  children,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td className={`px-3 py-2.5 text-refresh-text ${alignClass} ${className}`} {...rest}>
      {children}
    </td>
  );
}

/* === SortableTh ========================================================= */

export type SortDirection = 'asc' | 'desc' | null;

export type SortableThProps = Omit<
  React.ThHTMLAttributes<HTMLTableCellElement>,
  'onClick'
> & {
  align?: 'left' | 'right' | 'center';
  /** Current sort state for this column. `null` means inactive. */
  direction?: SortDirection;
  /** Fires when the user toggles the sort. The handler decides the next direction. */
  onSort?: () => void;
};

/**
 * Header cell with a click-to-sort affordance, caret indicator, and `aria-sort`.
 * The parent owns sort state; this cell only emits `onSort` toggles.
 */
export function SortableTh({
  align = 'left',
  direction = null,
  onSort,
  className = '',
  children,
  ...rest
}: SortableThProps) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';

  function handleKeyDown(event: React.KeyboardEvent<HTMLTableCellElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSort?.();
    }
  }

  const justifyClass =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th
      scope="col"
      role="columnheader"
      aria-sort={ariaSort}
      tabIndex={0}
      onClick={onSort}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer select-none px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2 transition hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${alignClass} ${className}`}
      {...rest}
    >
      <span className={`inline-flex items-center gap-1 ${justifyClass}`}>
        {children}
        <span
          aria-hidden
          className={`text-[10px] leading-none transition ${
            direction ? 'text-refresh-text' : 'text-refresh-muted-2/60'
          }`}
        >
          {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '↕'}
        </span>
      </span>
    </th>
  );
}

/* === SelectionCell / SelectAllTh ======================================= */

export type SelectionCellProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  className?: string;
};

/**
 * `<Td>` wrapper rendering a checkbox for per-row selection. Stateless —
 * the parent owns the selection set. Markup mirrors the `Checkbox` primitive
 * in Form.tsx; inlined here so Table can stay a server-friendly module.
 */
export function SelectionCell({
  checked,
  onChange,
  ariaLabel = 'Select row',
  className = '',
}: SelectionCellProps) {
  return (
    <td className={`w-10 px-3 py-2.5 ${className}`}>
      <label className="inline-flex cursor-pointer items-center" aria-label={ariaLabel}>
        <span
          className={`relative flex h-4 w-4 items-center justify-center rounded border transition ${
            checked
              ? 'border-refresh-text bg-refresh-text'
              : 'border-refresh-surface-3 bg-refresh-surface'
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          {checked && (
            <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
              <path
                d="M2 6.5 5 9.5 10 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-refresh-bg"
              />
            </svg>
          )}
        </span>
      </label>
    </td>
  );
}

export type SelectAllThProps = {
  /** True when every row is currently selected. */
  checked: boolean;
  /** True when some-but-not-all rows are selected. Renders an indeterminate visual. */
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  className?: string;
};

/**
 * Header cell for the bulk-select column. Pairs with `<SelectionCell>` rows.
 * Renders an indeterminate dash when only a subset of rows is selected.
 */
export function SelectAllTh({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel = 'Select all rows',
  className = '',
}: SelectAllThProps) {
  // Render the indeterminate state inline rather than threading the DOM-only
  // `indeterminate` property through Checkbox (which would require a ref dance).
  return (
    <th scope="col" className={`w-10 px-3 py-2 ${className}`}>
      <label className="inline-flex cursor-pointer items-center" aria-label={ariaLabel}>
        <span
          className={`relative flex h-4 w-4 items-center justify-center rounded border transition ${
            checked || indeterminate
              ? 'border-refresh-text bg-refresh-text'
              : 'border-refresh-surface-3 bg-refresh-surface'
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
            aria-checked={indeterminate ? 'mixed' : checked}
          />
          {indeterminate && !checked && (
            <span aria-hidden className="block h-0.5 w-2 rounded-full bg-refresh-bg" />
          )}
          {checked && (
            <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
              <path
                d="M2 6.5 5 9.5 10 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-refresh-bg"
              />
            </svg>
          )}
        </span>
      </label>
    </th>
  );
}

/* === MediaCell ========================================================= */

export type MediaCellProps = {
  /** Image src for the leading thumbnail. Pass `null` to render a placeholder square. */
  image?: string | null;
  /** Alt text for the thumbnail. */
  imageAlt?: string;
  /** Tone for the placeholder square when `image` is null/undefined. */
  placeholderTone?: 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';
  /** Primary line — typically the entity name. */
  title: React.ReactNode;
  /** Secondary line — category, SKU, etc. */
  subtitle?: React.ReactNode;
  /** Thumbnail edge length in px. Default 40. */
  size?: number;
  className?: string;
};

const placeholderToneMap: Record<NonNullable<MediaCellProps['placeholderTone']>, string> = {
  sage: 'bg-refresh-sage',
  lavender: 'bg-refresh-lavender',
  blue: 'bg-refresh-blue',
  pink: 'bg-refresh-pink',
  periwinkle: 'bg-refresh-periwinkle',
  surface: 'bg-refresh-surface-3',
};

/**
 * `<Td>` cell rendering a square thumbnail + title/subtitle text stack.
 * The most common product/customer/order list cell.
 */
export function MediaCell({
  image,
  imageAlt = '',
  placeholderTone = 'surface',
  title,
  subtitle,
  size = 40,
  className = '',
}: MediaCellProps) {
  return (
    <td className={`px-3 py-2.5 ${className}`}>
      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={imageAlt}
            width={size}
            height={size}
            className="rounded-xl object-cover"
            style={{ width: size, height: size }}
          />
        ) : (
          <span
            aria-hidden
            className={`block rounded-xl ${placeholderToneMap[placeholderTone]}`}
            style={{ width: size, height: size }}
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-refresh-text">{title}</p>
          {subtitle && (
            <p className="truncate text-xs text-refresh-muted">{subtitle}</p>
          )}
        </div>
      </div>
    </td>
  );
}

/* === OrderTable (composed example) ===================================== */

export type OrderTableLine = {
  qty: number;
  name: string;
  price: string;
};

export type OrderTableProps = {
  tableLabel: string;
  orderNumber: string;
  lines: OrderTableLine[];
  subtotal: string;
  onPay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

export function OrderTable({
  tableLabel,
  orderNumber,
  lines,
  subtotal,
  onPay,
  onEdit,
  onDelete,
  className = '',
}: OrderTableProps) {
  return (
    <div className={`rounded-xl bg-refresh-surface p-4 ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <p className="text-base font-bold text-refresh-text">
          Table <span className="text-refresh-blue">{tableLabel}</span>
        </p>
        <p className="text-xs text-refresh-muted-2">Order {orderNumber}</p>
      </header>

      <Table>
        <THead>
          <Tr>
            <Th>QT</Th>
            <Th>Items</Th>
            <Th align="right">Price</Th>
          </Tr>
        </THead>
        <TBody>
          {lines.map((l, i) => (
            <Tr key={i} className="border-b-refresh-bg/40">
              <Td className="w-8 text-refresh-muted-2 tabular-nums">{l.qty}</Td>
              <Td>{l.name}</Td>
              <Td align="right" className="font-semibold tabular-nums">
                {l.price}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <div className="mt-3 flex items-center justify-between border-t border-refresh-bg pt-3">
        <p className="text-xs text-refresh-muted-2">Subtotal</p>
        <p className="text-base font-bold text-refresh-text tabular-nums">{subtotal}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete order"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-refresh-surface-3 text-refresh-muted-2 transition hover:border-refresh-pink hover:text-refresh-pink"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit order"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-refresh-surface-3 text-refresh-muted-2 transition hover:border-refresh-text hover:text-refresh-text"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={onPay}
          className="ml-auto rounded-md bg-refresh-text px-4 py-1.5 text-xs font-semibold text-refresh-bg transition hover:opacity-90"
        >
          Payment
        </button>
      </div>
    </div>
  );
}
