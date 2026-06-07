'use client';

import { useId, useState, type ReactNode } from 'react';

export type AccordionItem = {
  id: string;
  /** Trigger row content. */
  title: ReactNode;
  /** Optional small label rendered next to the title (e.g. count, "new"). */
  meta?: ReactNode;
  /** Panel body. */
  children: ReactNode;
  /** Per-item disabled — the row remains visible but can't be toggled. */
  disabled?: boolean;
};

export type AccordionProps = {
  items: AccordionItem[];
  /** When 'single', only one panel can be open. Default 'single'. */
  type?: 'single' | 'multiple';
  /** Initially open ids. */
  defaultOpen?: string[];
  /** Controlled open state. When set, `onOpenChange` is required. */
  open?: string[];
  onOpenChange?: (next: string[]) => void;
  /** Visual variant. 'card' wraps the whole thing in a bordered surface (default). 'plain' renders flush — use it when the parent is already a card. */
  variant?: 'card' | 'plain';
  className?: string;
};

/**
 * Vertically stacked expandable panels. Default is single-open; pass
 * `type="multiple"` to allow several at once.
 *
 * Uses the CSS `grid-template-rows: 0fr → 1fr` trick to animate panel height
 * smoothly with no JS measuring required.
 */
export function Accordion({
  items,
  type = 'single',
  defaultOpen = [],
  open: controlledOpen,
  onOpenChange,
  variant = 'card',
  className = '',
}: AccordionProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpen);
  const open = isControlled ? controlledOpen! : uncontrolled;

  const set = (next: string[]) => {
    if (!isControlled) setUncontrolled(next);
    onOpenChange?.(next);
  };

  const toggle = (id: string) => {
    if (open.includes(id)) {
      set(open.filter((x) => x !== id));
    } else {
      set(type === 'single' ? [id] : [...open, id]);
    }
  };

  const wrapper =
    variant === 'card'
      ? 'flex flex-col divide-y divide-refresh-line overflow-hidden rounded-xl border border-refresh-line bg-refresh-surface-2'
      : 'flex flex-col divide-y divide-refresh-line';

  return (
    <div className={`${wrapper} ${className}`}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          isOpen={open.includes(item.id)}
          onToggle={() => !item.disabled && toggle(item.id)}
        />
      ))}
    </div>
  );
}

function AccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const headingId = useId();
  const panelId = useId();

  return (
    <div
      className={`group transition-colors ${
        isOpen ? 'bg-refresh-surface/40' : ''
      }`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          id={headingId}
          disabled={item.disabled}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-refresh-text disabled:cursor-not-allowed disabled:opacity-40 hover:bg-refresh-surface/60"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="truncate text-base font-semibold text-refresh-text">
              {item.title}
            </span>
            {item.meta && (
              <span className="shrink-0 rounded-full bg-refresh-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
                {item.meta}
              </span>
            )}
          </span>
          <ChevronIcon
            className={`shrink-0 text-refresh-muted-2 transition-transform duration-200 ease-out ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </h3>
      {/*
       * Animated height — `grid-template-rows: 0fr → 1fr` smoothly transitions
       * the inner row from 0 to its content height, with no JS measuring.
       */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-refresh-muted">
            {item.children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
