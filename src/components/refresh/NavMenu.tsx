'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type NavMenuItem = {
  id: string;
  label: string;
  /** When set, the item is rendered as a Next/Link. */
  href?: string;
  /** When set, the item becomes a button with this handler. */
  onClick?: () => void;
  /** Leading icon — emoji, text, or a small SVG. */
  icon?: ReactNode;
  /** Trailing count chip (e.g. "12", "0"). */
  count?: number | string;
  /** Per-item disabled — visible but non-interactive. */
  disabled?: boolean;
  /**
   * When true, this item is rendered with a tinted icon + a dashed divider
   * below it — used to "pin" the current section at the top of the menu
   * (e.g. Products in an All-sales dropdown). Only one item should set this.
   */
  current?: boolean;
};

export type NavMenuProps = {
  /** The bold trigger label (e.g. "All sales"). */
  label: ReactNode;
  /** Optional pill rendered next to the label (e.g. "0" for empty cart). */
  badge?: ReactNode;
  /** Tone of the badge. Default 'blue'. */
  badgeTone?: 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';
  items: NavMenuItem[];
  /** Where the panel opens. Default 'bottom-start'. */
  placement?: 'bottom-start' | 'bottom-end' | 'bottom-center';
  /** Width of the panel. Default 'w-72'. */
  panelClassName?: string;
  /** Override classes on the trigger button. */
  triggerClassName?: string;
  className?: string;
};

const badgeToneMap: Record<NonNullable<NavMenuProps['badgeTone']>, string> = {
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
  surface: 'bg-refresh-surface text-refresh-text',
};

const placementClasses = {
  'bottom-start': 'top-full left-0 mt-3',
  'bottom-end': 'top-full right-0 mt-3',
  'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-3',
};

/**
 * Section-header dropdown menu — a bold page title with a chevron that opens
 * a list of related sub-pages. Use it as the primary nav element on a
 * section's landing page (e.g. "All sales" → Products / Orders / Inventory).
 *
 * Items can be Next/Links or buttons. Mark exactly one item with `current`
 * to pin it at the top with a tinted icon and a dashed separator below.
 *
 * @example
 *   <NavMenu
 *     label="All sales"
 *     badge="0"
 *     items={[
 *       { id: 'products',  label: 'Products',  icon: '🛒', current: true },
 *       { id: 'catalog',   label: 'Catalog',   href: '/catalog' },
 *       { id: 'import',    label: 'Import',    href: '/import' },
 *       { id: 'orders',    label: 'Orders',    href: '/orders', count: 12 },
 *       { id: 'inventory', label: 'Inventory', href: '/inventory' },
 *       { id: 'suppliers', label: 'Suppliers', href: '/suppliers' },
 *     ]}
 *   />
 */
export function NavMenu({
  label,
  badge,
  badgeTone = 'blue',
  items,
  placement = 'bottom-start',
  panelClassName = 'w-72',
  triggerClassName = '',
  className = '',
}: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const current = items.find((i) => i.current);
  const rest = items.filter((i) => !i.current);

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg px-2 py-1 text-3xl font-bold text-refresh-text transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg sm:text-4xl ${triggerClassName}`}
      >
        <span>{label}</span>
        <ChevronIcon
          className={`shrink-0 text-refresh-muted-2 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
        {badge != null && (
          <span
            className={`ml-1 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-sm font-bold tabular-nums ${badgeToneMap[badgeTone]}`}
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-40 overflow-hidden rounded-2xl border border-refresh-line bg-refresh-surface-2 p-2 refresh-shadow-soft ${placementClasses[placement]} ${panelClassName}`}
          style={{ animation: 'navrail-flyout-in 150ms ease-out' }}
        >
          {current && (
            <>
              <NavMenuRow item={current} onSelect={() => setOpen(false)} />
              <div
                aria-hidden
                className="mx-2 my-1 border-t border-dashed border-refresh-line"
              />
            </>
          )}
          <ul className="flex flex-col">
            {rest.map((item) => (
              <li key={item.id}>
                <NavMenuRow item={item} onSelect={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NavMenuRow({
  item,
  onSelect,
}: {
  item: NavMenuItem;
  onSelect: () => void;
}) {
  const baseCls = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg disabled:cursor-not-allowed disabled:opacity-40 ${
    item.current
      ? 'text-refresh-text'
      : 'text-refresh-text hover:bg-refresh-surface'
  }`;

  const inner = (
    <>
      {item.icon && (
        <span
          aria-hidden
          className={`flex h-5 w-5 shrink-0 items-center justify-center text-base ${
            item.current ? 'text-refresh-blue' : 'text-refresh-muted-2'
          }`}
        >
          {item.icon}
        </span>
      )}
      <span className="flex-1 truncate">{item.label}</span>
      {item.count != null && (
        <span className="shrink-0 text-xs font-semibold tabular-nums text-refresh-muted-2">
          {item.count}
        </span>
      )}
    </>
  );

  if (item.href && !item.disabled) {
    return (
      <Link href={item.href} role="menuitem" className={baseCls} onClick={onSelect}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={() => {
        item.onClick?.();
        onSelect();
      }}
      className={baseCls}
    >
      {inner}
    </button>
  );
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
