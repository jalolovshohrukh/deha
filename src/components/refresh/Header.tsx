import Link from 'next/link';
import { LogoMark } from './Logo';

export type HeaderProps = {
  brand?: string;
  storeName?: string;
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  /** Make the brand block a link (typically to "/"). */
  brandHref?: string;
  className?: string;
};

export function Header({
  brand = 'Refresh',
  storeName,
  backHref,
  backLabel = '← Back',
  rightSlot,
  brandHref,
  className = '',
}: HeaderProps) {
  const brandBlock = (
    <span className="flex items-center gap-2.5">
      <LogoMark size="md" />
      <span className="text-base font-bold text-refresh-text">{brand}</span>
      {storeName && (
        <span className="ml-2 hidden rounded-md bg-refresh-surface px-3 py-1 text-xs font-medium text-refresh-muted sm:inline">
          {storeName}
        </span>
      )}
    </span>
  );

  return (
    <header className={`border-b border-refresh-line bg-refresh-bg ${className}`}>
      <div className="container-refresh flex h-16 items-center justify-between">
        {brandHref ? (
          <Link href={brandHref} aria-label={brand} className="transition hover:opacity-80">
            {brandBlock}
          </Link>
        ) : (
          brandBlock
        )}

        <div className="flex items-center gap-4">
          {rightSlot}
          {backHref && (
            <Link
              href={backHref}
              className="text-sm font-medium text-refresh-muted-2 transition hover:text-refresh-text"
            >
              {backLabel}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
