'use client';

import { useState } from 'react';
import { Popover } from './Popover';
import { Icon } from './Icon';

export type FilterSelectOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

export type FilterSelectProps<T extends string> = {
  /** Placeholder shown when no value is selected (e.g. "Stock"). Also acts as the field name. */
  label: string;
  options: FilterSelectOption<T>[];
  /** Selected value. Pass `null` for an empty / "all" state. */
  value: T | null;
  onChange: (next: T | null) => void;
  /** Width of the trigger button. Default `min-w-[160px]`. */
  className?: string;
  /** Show a "Clear" item at the bottom of the menu when a value is picked. Default true. */
  clearable?: boolean;
};

/**
 * Refresh-themed filter dropdown — replaces the native `<select>` for list-page
 * toolbars. Renders as a button with the field label (or selected value) + chevron;
 * opens an anchored Popover with the options list. Single-select.
 */
export function FilterSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  className = '',
  clearable = true,
}: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = value ? options.find((o) => o.value === value) : null;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      ariaLabel={`${label} filter`}
      panelClassName="w-56 p-1.5"
      placement="bottom-start"
      trigger={
        <button
          type="button"
          className={`inline-flex items-center justify-between gap-3 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-3 py-2.5 text-sm transition hover:border-refresh-text/40 focus:outline-none focus-visible:border-refresh-text focus-visible:ring-2 focus-visible:ring-refresh-text/20 ${
            selected ? 'text-refresh-text' : 'text-refresh-muted'
          } ${className || 'min-w-[160px]'}`}
        >
          <span className="truncate font-medium">
            {selected ? selected.label : label}
          </span>
          <Icon
            name="chevron-down"
            size={14}
            className={`shrink-0 text-refresh-muted-2 transition ${open ? 'rotate-180' : ''}`}
          />
        </button>
      }
    >
      <ul role="listbox" aria-label={label} className="flex flex-col">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-refresh-surface ${
                  isSelected ? 'text-refresh-text' : 'text-refresh-muted'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Icon name="check" size={14} className="text-refresh-text" />}
              </button>
            </li>
          );
        })}
        {clearable && value && (
          <>
            <li role="separator" className="my-1 border-t border-refresh-line" />
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text"
              >
                <Icon name="x" size={14} />
                <span>Clear</span>
              </button>
            </li>
          </>
        )}
      </ul>
    </Popover>
  );
}
