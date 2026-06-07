'use client';

import type { ReactNode } from 'react';

export type BulkAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

export type BulkActionBarProps = {
  /** Number of selected items — when 0, the bar hides (slide-out animation if it was visible). */
  count: number;
  actions: BulkAction[];
  /** Singular/plural noun for the count summary. Default: ['item', 'items']. */
  noun?: [singular: string, plural: string];
  /** Called when the user clicks "Clear" — typically used to reset the selection. */
  onClear?: () => void;
  /** Layout: 'sticky' (sticks at the bottom of its scroll context) or 'fixed' (viewport bottom). */
  position?: 'sticky' | 'fixed';
  className?: string;
};

/**
 * Selection action bar — appears when one or more table rows / list items are selected.
 *
 * @example
 *   <BulkActionBar
 *     count={selectedIds.size}
 *     onClear={() => setSelectedIds(new Set())}
 *     actions={[
 *       { id: 'export', label: 'Export', icon: '⤓', onClick: exportSelected },
 *       { id: 'tag', label: 'Tag', icon: '🏷', onClick: openTagDialog },
 *       { id: 'delete', label: 'Delete', icon: <TrashIcon />, tone: 'danger', onClick: deleteSelected },
 *     ]}
 *   />
 */
export function BulkActionBar({
  count,
  actions,
  noun = ['item', 'items'],
  onClear,
  position = 'fixed',
  className = '',
}: BulkActionBarProps) {
  const visible = count > 0;
  const positionCls =
    position === 'fixed'
      ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40'
      : 'sticky bottom-4';

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={`pointer-events-none ${positionCls} transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className}`}
      aria-hidden={!visible}
    >
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-2xl border border-refresh-line bg-refresh-surface-2 px-3 py-2 refresh-shadow-soft`}
      >
        <span className="flex items-center gap-2 px-2 text-sm font-semibold text-refresh-text">
          <span className="tabular-nums">{count}</span>
          <span className="text-refresh-muted">{count === 1 ? noun[0] : noun[1]}</span>
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-2 py-1 text-xs font-semibold text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
          >
            Clear
          </button>
        )}
        <span aria-hidden className="mx-1 h-6 w-px bg-refresh-line" />
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg disabled:cursor-not-allowed disabled:opacity-40 ${
              action.tone === 'danger'
                ? 'text-refresh-pink hover:bg-refresh-pink/10'
                : 'text-refresh-text hover:bg-refresh-surface'
            }`}
          >
            {action.icon && <span aria-hidden>{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
