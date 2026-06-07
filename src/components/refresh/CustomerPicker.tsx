'use client';

import { useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import { LoyaltyChip, type LoyaltyTier } from './StatusBadges';

export type CustomerRecord = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  /** ISO date string of last visit. */
  lastVisit?: string;
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
  /** Optional avatar URL — falls back to initials. */
  avatarSrc?: string;
  /** Avatar tone for initials fallback. */
  avatarTone?: 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';
};

export type CustomerPickerProps = {
  customers: CustomerRecord[];
  /** Current query — controlled. Provide setQuery to update. */
  query: string;
  onQueryChange: (next: string) => void;
  /** Called with the chosen customer (or null on clear). */
  onSelect: (customer: CustomerRecord | null) => void;
  /** Currently-selected customer (controlled). */
  selected?: CustomerRecord | null;
  /** Render a "+ Add new customer" footer button. */
  onAddNew?: () => void;
  placeholder?: string;
  /** Empty-results message. */
  emptyMessage?: string;
  className?: string;
};

/**
 * Specialized customer-search combobox. Each result row shows avatar + name + phone +
 * last-visit + loyalty chip — the right meta layout for POS contexts.
 *
 * Filters customers by name/phone/email substring against the query. Pass already-filtered
 * results if you'd rather drive search server-side.
 */
export function CustomerPicker({
  customers,
  query,
  onQueryChange,
  onSelect,
  selected,
  onAddNew,
  placeholder = 'Search customers by name or phone…',
  emptyMessage = 'No customers match your search',
  className = '',
}: CustomerPickerProps) {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.phone, c.email].filter(Boolean).some((s) => s!.toLowerCase().includes(q))
    );
  }, [customers, query]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-refresh-muted-2">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          aria-label="Search customers"
          className="h-11 w-full rounded-lg border border-refresh-surface-3 bg-refresh-surface pl-10 pr-3 text-sm text-refresh-text transition hover:border-refresh-muted-2 focus:outline-none focus-visible:border-refresh-text focus-visible:ring-2 focus-visible:ring-refresh-text/20"
        />
        {selected && (
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              onQueryChange('');
            }}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text"
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="refresh-scroll absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-refresh-line bg-refresh-surface-2 p-1 refresh-shadow-soft">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-refresh-muted">{emptyMessage}</p>
          ) : (
            <ul role="listbox" aria-label="Customers" className="flex flex-col">
              {filtered.map((c) => {
                const isActive = selected?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseDown={(e) => {
                        // Prevent the input blur from closing the panel before click registers.
                        e.preventDefault();
                      }}
                      onClick={() => {
                        onSelect(c);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition focus:outline-none focus-visible:bg-refresh-surface ${
                        isActive
                          ? 'bg-refresh-surface-3'
                          : 'hover:bg-refresh-surface'
                      }`}
                    >
                      <Avatar
                        name={c.name}
                        src={c.avatarSrc}
                        tone={c.avatarTone ?? 'lavender'}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-refresh-text">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-refresh-muted-2">
                          {[c.phone, c.email].filter(Boolean).join(' · ') || '—'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {c.loyaltyTier && (
                          <LoyaltyChip tier={c.loyaltyTier} points={c.loyaltyPoints} />
                        )}
                        {c.lastVisit && (
                          <span className="text-[10px] text-refresh-muted-2">
                            Last visit {formatLastVisit(c.lastVisit)}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {onAddNew && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onAddNew();
                setOpen(false);
              }}
              className="mt-1 flex w-full items-center gap-2 border-t border-refresh-line p-3 text-sm font-semibold text-refresh-text transition hover:bg-refresh-surface"
            >
              <span aria-hidden>+</span>
              Add new customer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatLastVisit(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = Date.now();
  const days = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
