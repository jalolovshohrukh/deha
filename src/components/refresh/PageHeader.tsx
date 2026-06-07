import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

export type PageHeaderProps = {
  title: React.ReactNode;
  /** Hierarchy trail rendered above the title. Pass items the same way you would to `<Breadcrumb>`. */
  breadcrumb?: BreadcrumbItem[];
  /** Optional one-line description rendered under the title. */
  description?: React.ReactNode;
  /** Trailing slot — typically a primary action button or a small button cluster. */
  actions?: React.ReactNode;
  /** Override the heading level. Defaults to `h1` (one PageHeader per page). */
  as?: 'h1' | 'h2';
  className?: string;
};

/**
 * Top-of-page chrome — title + breadcrumb + actions slot. Consumed by every
 * dashboard route so the spacing / scale stays consistent. Composes
 * `Breadcrumb`; the title and description are plain elements.
 */
export function PageHeader({
  title,
  breadcrumb,
  description,
  actions,
  as = 'h1',
  className = '',
}: PageHeaderProps) {
  const Heading = as;
  return (
    <header className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        <Heading className="text-3xl font-extrabold tracking-tight text-refresh-text sm:text-4xl">
          {title}
        </Heading>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="mt-2">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-refresh-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
