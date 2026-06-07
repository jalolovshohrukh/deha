'use client';

import { useEffect, useRef, useState } from 'react';
import { Popover } from './Popover';
import { Icon } from './Icon';

export type TimeValue = { hour: number; minute: number };

export type TimePickerProps = {
  value: TimeValue;
  onChange: (next: TimeValue) => void;
  /** Minute step. Default 15 (00, 15, 30, 45). */
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  /** 12h or 24h display. Default 24. */
  hourFormat?: 12 | 24;
  size?: 'sm' | 'md';
  label?: string;
  ariaLabel?: string;
  className?: string;
};

/**
 * Hours/minutes time picker — single Refresh-themed Popover with two scrollable
 * columns (hours / minutes) plus optional AM/PM segmented buttons. Replaces the
 * earlier native `<select>` pair so the open panel matches the design system.
 *
 * Use for shift schedules, scheduled orders, prep times.
 */
export function TimePicker({
  value,
  onChange,
  minuteStep = 15,
  hourFormat = 24,
  size = 'md',
  label,
  ariaLabel,
  className = '',
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerHeight = size === 'sm' ? 'h-9 text-xs' : 'h-11 text-sm';

  const hourOptions =
    hourFormat === 24
      ? Array.from({ length: 24 }, (_, i) => i)
      : Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));

  const minuteOptions = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);

  const isPM = value.hour >= 12;
  const displayHour =
    hourFormat === 24 ? value.hour : value.hour % 12 === 0 ? 12 : value.hour % 12;

  const setHour = (h: number) => {
    if (hourFormat === 24) {
      onChange({ ...value, hour: h });
    } else {
      const baseHour = h === 12 ? 0 : h;
      onChange({ ...value, hour: isPM ? baseHour + 12 : baseHour });
    }
  };

  const setMinute = (m: number) => onChange({ ...value, minute: m });

  const setPeriod = (period: 'AM' | 'PM') => {
    const base = value.hour % 12;
    onChange({ ...value, hour: period === 'AM' ? base : base + 12 });
  };

  const formattedTime = `${String(displayHour).padStart(2, '0')}:${String(value.minute).padStart(
    2,
    '0'
  )}`;

  return (
    <div className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold text-refresh-muted">{label}</span>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        ariaLabel={ariaLabel ?? label ?? 'Pick time'}
        wrapperClassName="inline-block"
        panelClassName="p-2"
        placement="bottom-start"
        trigger={
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={ariaLabel ?? label ?? 'Pick time'}
            className={`inline-flex items-center gap-3 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-3 ${triggerHeight} font-semibold tabular-nums text-refresh-text transition hover:border-refresh-muted-2 focus:outline-none focus-visible:border-refresh-text focus-visible:ring-2 focus-visible:ring-refresh-text/20`}
          >
            <span>{formattedTime}</span>
            {hourFormat === 12 && (
              <span className="text-refresh-muted">{isPM ? 'PM' : 'AM'}</span>
            )}
            <Icon
              name="chevron-down"
              size={14}
              className={`text-refresh-muted-2 transition ${open ? 'rotate-180' : ''}`}
            />
          </button>
        }
      >
        <div className="flex items-stretch gap-1">
          <TimeColumn
            label="Hour"
            options={hourOptions}
            value={displayHour}
            onSelect={setHour}
          />
          <span className="self-center px-1 text-sm font-semibold text-refresh-muted-2" aria-hidden>
            :
          </span>
          <TimeColumn
            label="Minute"
            options={minuteOptions}
            value={value.minute}
            onSelect={setMinute}
          />
          {hourFormat === 12 && (
            <div className="ml-1 flex flex-col gap-1 border-l border-refresh-line pl-2">
              {(['AM', 'PM'] as const).map((p) => {
                const active = (p === 'AM' && !isPM) || (p === 'PM' && isPM);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    aria-pressed={active}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text/20 ${
                      active
                        ? 'bg-refresh-text text-refresh-bg'
                        : 'text-refresh-muted hover:bg-refresh-surface hover:text-refresh-text'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
}

/**
 * One scrollable column of selectable values for the TimePicker panel.
 * Auto-scrolls the selected item into view when the panel opens.
 */
function TimeColumn({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: number[];
  value: number;
  onSelect: (v: number) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Keep the selected item visible whenever the column re-renders with a new value.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' });
  }, [value]);

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={label}
      className="refresh-scroll flex max-h-56 w-14 flex-col overflow-y-auto"
    >
      {options.map((n) => {
        const isSelected = n === value;
        return (
          <li key={n}>
            <button
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(n)}
              className={`w-full rounded-md px-2 py-1.5 text-center text-sm tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text/20 ${
                isSelected
                  ? 'bg-refresh-text font-semibold text-refresh-bg'
                  : 'text-refresh-text hover:bg-refresh-surface'
              }`}
            >
              {String(n).padStart(2, '0')}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
