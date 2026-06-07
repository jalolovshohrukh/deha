'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

export type SegmentCountTone = 'muted' | 'warn' | 'success' | 'info';

export type SegmentedItem<T extends string = string> = {
  value: T;
  label: string;
  /** Numeric or string count badge displayed after the label, e.g. "(12)". */
  count?: number | string;
  /** Tints the count badge: muted (default) · warn (pink) · success (sage) · info (blue). */
  countTone?: SegmentCountTone;
  /** Optional icon before the label (emoji or React node). */
  icon?: React.ReactNode;
  /** Disables this single item — others remain interactive. */
  disabled?: boolean;
  /** Optional ID of the panel this tab controls (for ARIA tab/panel pairing). */
  panelId?: string;
};

export type SegmentedControlProps<T extends string = string> = {
  items: SegmentedItem<T>[];
  value: T;
  onChange?: (next: T) => void;
  size?: 'sm' | 'md';
  /**
   * Container shape.
   * - `rounded` (default): soft rounded-rect container, rounded-rect active item.
   * - `pill`: fully-rounded "pill" container, fully-rounded active pill — common for filter switchers (Stripe-style, iOS-style).
   */
  shape?: 'rounded' | 'pill';
  /** Stretch each item to equal width across the container. */
  fill?: boolean;
  /** Disables the entire control (visual + non-interactive). */
  disabled?: boolean;
  /** ARIA label for the tablist (recommended when there's no visible label). */
  ariaLabel?: string;
  className?: string;
};

const countToneMap: Record<SegmentCountTone, string> = {
  muted: 'text-refresh-muted-2',
  warn: 'text-refresh-pink',
  success: 'text-refresh-sage',
  info: 'text-refresh-blue',
};

export function SegmentedControl<T extends string = string>({
  items,
  value,
  onChange,
  size = 'md',
  shape = 'rounded',
  fill = false,
  disabled: controlDisabled = false,
  ariaLabel,
  className = '',
}: SegmentedControlProps<T>) {
  const padding = size === 'sm' ? 'px-3 py-1' : 'px-4 py-1.5';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';
  const containerRadius = shape === 'pill' ? 'rounded-full' : 'rounded-xl';
  const itemRadius = shape === 'pill' ? 'rounded-full' : 'rounded-lg';
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sliding indicator: measure the active tab's offset/width and animate a
  // single pill between positions instead of toggling per-item bg colors.
  const [indicator, setIndicator] = useState<{ left: number; width: number; height: number; top: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeIdx = items.findIndex((it) => it.value === value);
    const activeEl = tabRefs.current[activeIdx];
    if (!activeEl) {
      setIndicator(null);
      return;
    }
    const c = container.getBoundingClientRect();
    const a = activeEl.getBoundingClientRect();
    setIndicator({
      left: a.left - c.left,
      top: a.top - c.top,
      width: a.width,
      height: a.height,
    });
  }, [value, items, size, shape, fill]);

  // Skip the very first transition so the indicator doesn't fly in from 0,0
  // on initial render — only animate position changes after first paint.
  useLayoutEffect(() => {
    if (indicator && !hasMoved) {
      const id = requestAnimationFrame(() => setHasMoved(true));
      return () => cancelAnimationFrame(id);
    }
  }, [indicator, hasMoved]);

  const focusableIndices = items
    .map((it, i) => (it.disabled ? -1 : i))
    .filter((i) => i !== -1);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (controlDisabled) return;
    const positionInFocusable = focusableIndices.indexOf(currentIndex);
    if (positionInFocusable === -1) return;

    let nextPos = positionInFocusable;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextPos = (positionInFocusable + 1) % focusableIndices.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextPos = (positionInFocusable - 1 + focusableIndices.length) % focusableIndices.length;
        break;
      case 'Home':
        nextPos = 0;
        break;
      case 'End':
        nextPos = focusableIndices.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const nextIndex = focusableIndices[nextPos];
    const nextEl = tabRefs.current[nextIndex];
    nextEl?.focus();
    const next = items[nextIndex];
    if (next) onChange?.(next.value);
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-disabled={controlDisabled || undefined}
      className={`relative ${fill ? 'flex' : 'inline-flex flex-wrap'} gap-1 ${containerRadius} bg-refresh-surface p-1 ${
        controlDisabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {/* Sliding active indicator — sits behind the buttons and animates
          between positions instead of toggling per-item bg colors. */}
      {indicator && (
        <span
          aria-hidden
          className={`pointer-events-none absolute z-0 ${itemRadius} bg-refresh-surface-3 ${
            hasMoved ? 'transition-all duration-300 ease-out' : ''
          }`}
          style={{
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
          }}
        />
      )}
      {items.map((it, i) => {
        const active = it.value === value;
        const itemDisabled = controlDisabled || it.disabled;
        const stateClasses = active
          ? 'text-refresh-text'
          : 'text-refresh-muted hover:text-refresh-text';
        const widthClass = fill ? 'flex-1 justify-center' : '';
        const tone = it.countTone ?? 'muted';
        const countClass = active && tone === 'muted' ? 'text-refresh-muted' : countToneMap[tone];

        return (
          <button
            key={it.value}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={it.panelId}
            aria-disabled={itemDisabled || undefined}
            data-active={active}
            disabled={itemDisabled}
            tabIndex={active && !itemDisabled ? 0 : -1}
            onClick={() => !itemDisabled && onChange?.(it.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`relative z-10 inline-flex items-center gap-1.5 ${itemRadius} font-medium transition-colors ${padding} ${text} ${stateClasses} ${widthClass} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-refresh-muted`}
          >
            {it.icon && <span aria-hidden className="inline-flex items-center">{it.icon}</span>}
            <span>{it.label}</span>
            {it.count != null && (
              <span className={`tabular-nums ${countClass}`}>({it.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
