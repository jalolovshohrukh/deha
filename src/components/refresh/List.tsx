/* === List wrapper ====================================================== */

export type ListProps = React.HTMLAttributes<HTMLUListElement> & {
  divided?: boolean;
};

export function List({ divided = true, className = '', children, ...rest }: ListProps) {
  return (
    <ul
      className={`${divided ? 'divide-y divide-refresh-line' : ''} ${className}`}
      {...rest}
    >
      {children}
    </ul>
  );
}

/* === ListRow ============================================================ */

export type ListRowProps = React.LiHTMLAttributes<HTMLLIElement> & {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
};

export function ListRow({
  leading,
  trailing,
  title,
  subtitle,
  className = '',
  ...rest
}: ListRowProps) {
  return (
    <li
      className={`flex items-center gap-3 py-3 ${className}`}
      {...rest}
    >
      {leading && <span className="shrink-0">{leading}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-refresh-text">{title}</p>
        {subtitle && <p className="truncate text-xs text-refresh-muted-2">{subtitle}</p>}
      </div>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </li>
  );
}

/* === NavItem (sidebar) ================================================== */

export type NavItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  active?: boolean;
};

export function NavItem({
  icon,
  active = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: NavItemProps) {
  return (
    <button
      type={type}
      data-active={active}
      className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition ${
        active
          ? 'bg-refresh-surface text-refresh-text'
          : 'text-refresh-muted-2 hover:bg-refresh-surface hover:text-refresh-text'
      } ${className}`}
      {...rest}
    >
      {icon && <span aria-hidden className="text-current">{icon}</span>}
      <span className="font-medium">{children}</span>
    </button>
  );
}

/* === OrderLineItem ====================================================== */

export type OrderLineItemProps = {
  index: number;
  name: string;
  qty: number;
  price: string;
  removable?: boolean;
};

export function OrderLineItem({ index, name, qty, price, removable = false }: OrderLineItemProps) {
  return (
    <li className="group flex items-center gap-3 border-b border-refresh-line py-3 last:border-b-0">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-refresh-surface text-[11px] font-semibold text-refresh-text">
        {index}
      </span>
      <span className="flex-1 truncate text-sm text-refresh-text">
        {name}
        <span className="ml-1 text-refresh-muted-2">×{qty}</span>
      </span>
      <span className="text-sm font-semibold text-refresh-text tabular-nums">{price}</span>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          className="text-refresh-muted-2 opacity-0 transition group-hover:opacity-100 hover:text-refresh-pink"
        >
          ×
        </button>
      )}
    </li>
  );
}

/* === UpsaleRow ========================================================== */

export type UpsaleRowProps = {
  name: string;
  orderCount: number;
  icon?: React.ReactNode;
};

export function UpsaleRow({ name, orderCount, icon }: UpsaleRowProps) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-refresh-surface text-sm">
        {icon ?? '🍽️'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-refresh-text">{name}</p>
        <p className="text-[11px] text-refresh-muted-2">Order: {orderCount}</p>
      </div>
    </li>
  );
}
