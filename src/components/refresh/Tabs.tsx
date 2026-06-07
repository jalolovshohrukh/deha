'use client';

import { useRef, type KeyboardEvent } from 'react';

export type TabCountTone = 'muted' | 'warn' | 'success' | 'info';

export type TabItem<T extends string = string> = {
  value: T;
  label: string;
  /** Optional icon node (emoji or React element) before the label. */
  icon?: React.ReactNode;
  /** Optional trailing count badge, rendered as `(N)` after the label. */
  count?: number | string;
  /** Tints the count: muted (default) · warn (pink) · success (sage) · info (blue). */
  countTone?: TabCountTone;
  /** Disables this single tab. */
  disabled?: boolean;
  /** Optional ID of the panel this tab controls (for ARIA tab/panel pairing). */
  panelId?: string;
};

export type TabsProps<T extends string = string> = {
  items: TabItem<T>[];
  value: T;
  onChange?: (next: T) => void;
  size?: 'sm' | 'md';
  /** Stretch each tab to equal width across the container. */
  fill?: boolean;
  /** Disables the entire control (visual + non-interactive). */
  disabled?: boolean;
  /** ARIA label for the tablist (recommended when there is no visible label). */
  ariaLabel?: string;
  className?: string;
};

const countToneMap: Record<TabCountTone, string> = {
  muted: 'text-refresh-muted-2',
  warn: 'text-refresh-pink',
  success: 'text-refresh-sage',
  info: 'text-refresh-blue',
};

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  size = 'md',
  fill = false,
  disabled: controlDisabled = false,
  ariaLabel,
  className = '',
}: TabsProps<T>) {
  const padding = size === 'sm' ? 'pb-2 pt-1.5' : 'pb-3 pt-2';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';
  const gap = size === 'sm' ? 'gap-x-4' : 'gap-x-6';
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
      role="tablist"
      aria-label={ariaLabel}
      aria-disabled={controlDisabled || undefined}
      className={`${fill ? 'flex' : 'inline-flex flex-wrap'} ${gap} border-b border-refresh-line ${
        controlDisabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {items.map((it, i) => {
        const active = it.value === value;
        const itemDisabled = controlDisabled || it.disabled;
        const stateClasses = active
          ? 'text-refresh-text border-refresh-text'
          : 'text-refresh-muted border-transparent hover:text-refresh-text';
        const widthClass = fill ? 'flex-1 justify-center' : '';
        const tone = it.countTone ?? 'muted';

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
            className={`-mb-px inline-flex items-center gap-1.5 border-b-2 font-medium transition ${padding} ${text} ${stateClasses} ${widthClass} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-refresh-muted`}
          >
            {it.icon && <span aria-hidden className="inline-flex items-center">{it.icon}</span>}
            <span>{it.label}</span>
            {it.count != null && (
              <span className={`tabular-nums ${countToneMap[tone]}`}>({it.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
