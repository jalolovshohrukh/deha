'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export type MetricSwitcherTone =
  | 'sage'
  | 'lavender'
  | 'blue'
  | 'pink'
  | 'periwinkle'
  | 'surface';

export type MetricSwitcherItem = {
  /** Unique identifier — passed to onChange when this tile is selected. */
  key: string;
  /** Small label above the value (e.g. "Income"). */
  label: string;
  /** Pre-formatted display value (e.g. "$9,990"). The component does not
   *  format currency — the caller owns locale + currency choice. */
  value: ReactNode;
  /** Glyph rendered inside the circular icon tile. */
  icon?: ReactNode;
  /** Background tone of the icon tile. Default `'surface'`. */
  iconTone?: MetricSwitcherTone;
  /** Trend chip in the top-right corner. Number → "+X%" / "-X%". */
  trend?: number;
  /**
   * Inverse polarity flips good/bad — useful when "down is good" (e.g.
   * Expenses dropping). Default `'normal'`.
   */
  trendPolarity?: 'normal' | 'inverse';
};

export type MetricSwitcherProps = {
  items: MetricSwitcherItem[];
  /** Currently-selected `key`. */
  value: string;
  onChange: (key: string) => void;
  className?: string;
  /** ARIA label for the radiogroup. Default `'Metric'`. */
  ariaLabel?: string;
};

const tonePalette: Record<MetricSwitcherTone, string> = {
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
  surface: 'bg-refresh-surface-3 text-refresh-text',
};

/**
 * Two-up (or N-up) "metric switcher" — Income / Expenses style. The selected
 * tile pops forward against a muted track; unselected tiles fade back. Pair
 * with a chart below that re-renders for the picked metric.
 *
 * @example
 *   const [k, setK] = useState('income');
 *   <MetricSwitcher
 *     value={k}
 *     onChange={setK}
 *     items={[
 *       { key: 'income',  label: 'Income',   value: '$9,990', trend:  8.2, iconTone: 'sage' },
 *       { key: 'expense', label: 'Expenses', value: '$1,989', trend: -6.6, iconTone: 'pink' },
 *     ]}
 *   />
 */
export function MetricSwitcher({
  items,
  value,
  onChange,
  className = '',
  ariaLabel = 'Metric',
}: MetricSwitcherProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  // Measure the active tile and slide a single elevated card behind it,
  // instead of toggling each tile's bg/shadow on click.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeIdx = items.findIndex((it) => it.key === value);
    const activeEl = tileRefs.current[activeIdx];
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
  }, [value, items]);

  useLayoutEffect(() => {
    if (indicator && !hasMoved) {
      const id = requestAnimationFrame(() => setHasMoved(true));
      return () => cancelAnimationFrame(id);
    }
  }, [indicator, hasMoved]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={`relative flex w-full gap-2 rounded-2xl bg-refresh-surface-2 p-2 ${className}`}
    >
      {/* Sliding "elevated card" — animates between tile positions. */}
      {indicator && (
        <span
          aria-hidden
          className={`pointer-events-none absolute z-0 rounded-xl bg-refresh-surface shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${
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
      {items.map((item, i) => {
        const selected = item.key === value;
        const iconCls = tonePalette[item.iconTone ?? 'surface'];

        return (
          <button
            key={item.key}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.key)}
            className="relative z-10 flex flex-1 items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-surface-2"
          >
            {item.icon && (
              <span
                aria-hidden
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconCls}`}
              >
                {item.icon}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span
                className={`block text-[12px] font-medium ${
                  selected ? 'text-refresh-muted' : 'text-refresh-muted-2'
                }`}
              >
                {item.label}
              </span>
              <span
                className={`mt-0.5 block text-xl font-bold tabular-nums ${
                  selected ? 'text-refresh-text' : 'text-refresh-muted'
                }`}
              >
                {item.value}
              </span>
            </span>
            {item.trend != null && (
              <TrendChip
                value={item.trend}
                polarity={item.trendPolarity ?? 'normal'}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────── Trend chip ─────────── */

function TrendChip({
  value,
  polarity,
}: {
  value: number;
  polarity: 'normal' | 'inverse';
}) {
  const dir = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const isGood =
    dir === 'flat'
      ? null
      : polarity === 'inverse'
      ? dir === 'down'
      : dir === 'up';

  // Solid pastel chip with on-pastel text — same convention as Tag.
  const cls =
    isGood === null
      ? 'bg-refresh-surface-3 text-refresh-text'
      : isGood
      ? 'bg-refresh-sage text-refresh-on-pastel'
      : 'bg-refresh-pink text-refresh-on-pastel';

  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–';
  const sign = dir === 'up' ? '+' : dir === 'down' ? '-' : '';
  const abs = Math.abs(value);
  const label = `${sign}${abs.toFixed(abs < 10 ? 1 : 0)}%`;

  return (
    <span
      className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      <span aria-hidden className="text-[9px]">
        {arrow}
      </span>
      <span className="tabular-nums">{label}</span>
    </span>
  );
}
