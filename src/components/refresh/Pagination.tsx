'use client';

import { Select } from './Form';

export type PaginationProps = {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  onPageChange: (next: number) => void;
  /** Number of page-number chips around the current page. Default 1. */
  siblingCount?: number;
  /** Always show first/last page chips even when far from current. Default true. */
  boundaryCount?: number;
  /** Show "X of Y" summary on the left. */
  showSummary?: boolean;
  /** Total items across all pages, used in the summary text "X items · page Y of Z". */
  totalItems?: number;
  /** Items per page, used together with totalItems for the summary. */
  pageSize?: number;
  /** Optional page-size selector — supplies an array of options and onChange handler. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Page navigation with first / prev / page chips / next / last + optional summary
 * and page-size selector. Generates the visible page list with ellipses.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showSummary = false,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  size = 'md',
  className = '',
}: PaginationProps) {
  const dims =
    size === 'sm'
      ? { box: 'h-8 min-w-[32px] text-xs', gap: 'gap-1' }
      : { box: 'h-10 min-w-[40px] text-sm', gap: 'gap-1.5' };

  const items = buildPageList({ page, totalPages, siblingCount, boundaryCount });

  const baseBtn = `inline-flex items-center justify-center rounded-lg border font-semibold tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg disabled:cursor-not-allowed disabled:opacity-40 ${dims.box}`;
  const chipBtn = `${baseBtn} px-3`;
  const navBtn = `${baseBtn} px-2.5`;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-3">
        {showSummary && (
          <span className="text-xs text-refresh-muted">
            {totalItems != null && pageSize != null ? (
              <>
                <span className="font-semibold tabular-nums text-refresh-text">
                  {Math.min((page - 1) * pageSize + 1, totalItems)}
                  {'–'}
                  {Math.min(page * pageSize, totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-semibold tabular-nums text-refresh-text">
                  {totalItems.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                Page <span className="font-semibold text-refresh-text">{page}</span> of{' '}
                <span className="font-semibold text-refresh-text">{totalPages}</span>
              </>
            )}
          </span>
        )}
        {pageSizeOptions && onPageSizeChange && pageSize != null && (
          <div className="flex items-center gap-2 text-xs text-refresh-muted">
            <span>Rows</span>
            <div className="w-[72px]">
              <Select
                size="sm"
                options={pageSizeOptions.map((s) => ({ value: String(s), label: String(s) }))}
                value={String(pageSize)}
                onChange={(v) => onPageSizeChange(Number(v))}
              />
            </div>
          </div>
        )}
      </div>

      <ul className={`flex items-center ${dims.gap}`}>
        <li>
          <button
            type="button"
            aria-label="First page"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
            className={`${navBtn} border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2`}
          >
            «
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={`${navBtn} border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2`}
          >
            ‹
          </button>
        </li>
        {items.map((it, i) =>
          it === 'ellipsis' ? (
            <li key={`e-${i}`} aria-hidden className="px-1 text-sm text-refresh-muted-2">
              …
            </li>
          ) : (
            <li key={it}>
              <button
                type="button"
                aria-label={`Page ${it}`}
                aria-current={it === page ? 'page' : undefined}
                onClick={() => onPageChange(it)}
                className={`${chipBtn} ${
                  it === page
                    ? 'border-refresh-text bg-refresh-text text-refresh-bg'
                    : 'border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2'
                }`}
              >
                {it}
              </button>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={`${navBtn} border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2`}
          >
            ›
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-label="Last page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
            className={`${navBtn} border-refresh-surface-3 bg-refresh-surface text-refresh-text hover:border-refresh-muted-2`}
          >
            »
          </button>
        </li>
      </ul>
    </div>
  );
}

type PageItem = number | 'ellipsis';

function buildPageList({
  page,
  totalPages,
  siblingCount,
  boundaryCount,
}: {
  page: number;
  totalPages: number;
  siblingCount: number;
  boundaryCount: number;
}): PageItem[] {
  const items: PageItem[] = [];
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  items.push(...startPages);
  if (siblingsStart > boundaryCount + 2) items.push('ellipsis');
  else if (boundaryCount + 1 < totalPages - boundaryCount) items.push(boundaryCount + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < totalPages - boundaryCount - 1) items.push('ellipsis');
  else if (totalPages - boundaryCount > boundaryCount) items.push(totalPages - boundaryCount);
  items.push(...endPages);

  // Dedupe adjacent identical entries.
  const out: PageItem[] = [];
  for (const it of items) {
    if (out.length === 0 || out[out.length - 1] !== it) out.push(it);
  }
  return out;
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
