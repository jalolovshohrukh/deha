import Link from 'next/link';

export type BreadcrumbItem = {
  label: React.ReactNode;
  /** Render as a Next/Link when set; otherwise renders as plain text (for the current page). */
  href?: string;
  /** Optional handler — turns the item into a button (use when navigation is JS-driven). */
  onClick?: () => void;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /** Glyph between items. Default: '›'. Pass any string or React node (e.g. an icon). */
  separator?: React.ReactNode;
  /** ARIA label for the nav region. */
  ariaLabel?: string;
  className?: string;
};

/**
 * Hierarchy trail for nested pages — Orders / #2387 / Refund.
 * The last item is rendered as plain text (the current page); earlier items
 * become Next/Link or button. Adds an `aria-current="page"` to the last item
 * for screen readers.
 */
export function Breadcrumb({
  items,
  separator = '›',
  ariaLabel = 'Breadcrumb',
  className = '',
}: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-refresh-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-refresh-text"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
                >
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="rounded-sm transition hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
                >
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}
              {!isLast && (
                <span aria-hidden className="text-refresh-muted-2">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
