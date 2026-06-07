export type MenuProps = {
  className?: string;
  children: React.ReactNode;
};

export function Menu({ className = '', children }: MenuProps) {
  return (
    <div
      role="menu"
      className={`min-w-[220px] rounded-2xl border border-refresh-line bg-refresh-surface-2 p-1.5 shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}

export type MenuHeaderProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function MenuHeader({ icon, children }: MenuHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-refresh-text">
        {icon && <span aria-hidden>{icon}</span>}
        <span>{children}</span>
      </div>
      <div className="my-1 border-t border-dashed border-refresh-line" />
    </>
  );
}

export type MenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  iconLeft?: React.ReactNode;
};

export function MenuItem({
  iconLeft,
  className = '',
  children,
  type = 'button',
  ...rest
}: MenuItemProps) {
  return (
    <button
      type={type}
      role="menuitem"
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-refresh-text transition hover:bg-refresh-surface ${className}`}
      {...rest}
    >
      {iconLeft && <span className="text-refresh-muted-2" aria-hidden>{iconLeft}</span>}
      <span>{children}</span>
    </button>
  );
}

export function MenuDivider() {
  return <div className="my-1 border-t border-refresh-line" />;
}
