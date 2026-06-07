export type EmptyStateProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  /** Compact variant for inline use inside cards or table bodies. */
  size?: 'sm' | 'md';
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const padding = size === 'sm' ? 'px-4 py-6' : 'px-6 py-12';
  const titleClass = size === 'sm' ? 'text-sm' : 'text-base';
  const descClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-refresh-surface-3 bg-refresh-surface-2/40 text-center ${padding} ${className}`}
    >
      {icon && <div className="mb-2 text-refresh-muted-2">{icon}</div>}
      <p className={`font-semibold text-refresh-text ${titleClass}`}>{title}</p>
      {description && (
        <p className={`max-w-sm leading-relaxed text-refresh-muted ${descClass}`}>{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
