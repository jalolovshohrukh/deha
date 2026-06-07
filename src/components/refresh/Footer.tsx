import Link from 'next/link';

export type FooterProps = {
  note?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function Footer({
  note = 'Refresh theme · Refresh prototype',
  backHref,
  backLabel = '← Back to Refresh home',
  className = '',
}: FooterProps) {
  return (
    <footer className={`border-t border-refresh-line bg-refresh-bg ${className}`}>
      <div className="container-refresh flex flex-col items-start justify-between gap-2 py-8 text-sm text-refresh-muted-2 sm:flex-row sm:items-center">
        <p>{note}</p>
        {backHref && (
          <Link
            href={backHref}
            className="font-medium text-refresh-muted transition hover:text-refresh-text"
          >
            {backLabel}
          </Link>
        )}
      </div>
    </footer>
  );
}
