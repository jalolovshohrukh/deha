'use client';

import { useCallback, useEffect, useId, useRef, type KeyboardEvent } from 'react';

export type RangeSliderProps = {
  /** Current selection — `[start, end]`. Always within `[min, max]` and start ≤ end. */
  value: [number, number];
  /** Called with the next clamped pair whenever the user drags or arrow-keys a thumb. */
  onChange: (next: [number, number]) => void;
  /** Lower bound. Default 0. */
  min?: number;
  /** Upper bound. Default 100. */
  max?: number;
  /** Step size — applied to keyboard adjustments and pointer-drag snapping. Default 1. */
  step?: number;
  /** Custom value-to-string for `aria-valuetext`. Default uses the raw number. */
  formatValue?: (n: number) => string;
  /** Disable both thumbs and the track. */
  disabled?: boolean;
  /** ARIA label applied to both thumbs (suffixed with " (start)" / " (end)" automatically). */
  ariaLabel?: string;
  className?: string;
};

/**
 * Dual-thumb generic range slider — pointer + keyboard accessible. Used by
 * `<TimeRangeChart>` for time-range zoom but also works standalone for any
 * "select a range" use case (price filters, volume, etc.).
 *
 * Interaction:
 *  - Pointer drag (mouse / touch / pen): grab a thumb to scrub. Thumbs can't
 *    cross each other; the dragged thumb clamps to the other one's value.
 *  - Keyboard: tab into a thumb → ←/→ adjusts by `step`, Home/End jumps to
 *    min/max (also clamped to the other thumb).
 *  - Click on the track: the nearer thumb jumps to the click position.
 *
 * @example
 *   const [range, setRange] = useState<[number, number]>([20, 80]);
 *   <RangeSlider value={range} onChange={setRange} />
 *
 * @example
 *   // Time-range scrubber (indices into a labels array):
 *   <RangeSlider
 *     min={0}
 *     max={labels.length - 1}
 *     value={range}
 *     onChange={setRange}
 *     formatValue={(i) => labels[i]}
 *     ariaLabel="Date range"
 *   />
 */
export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  disabled = false,
  ariaLabel,
  className = '',
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Track which thumb is currently being dragged so move/up listeners know.
  const draggingRef = useRef<'start' | 'end' | null>(null);
  const ariaId = useId();

  const span = max - min || 1;
  const [start, end] = value;
  const startPct = ((start - min) / span) * 100;
  const endPct = ((end - min) / span) * 100;

  const fmt = formatValue ?? ((n: number) => n.toString());

  // Snap a continuous (0..1) ratio to a stepped value within [min, max].
  const ratioToValue = useCallback(
    (ratio: number) => {
      const raw = min + ratio * span;
      const stepped = Math.round((raw - min) / step) * step + min;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, span, step]
  );

  // Update one thumb without letting the two cross.
  const setThumb = useCallback(
    (thumb: 'start' | 'end', next: number) => {
      const clamped = Math.max(min, Math.min(max, next));
      if (thumb === 'start') {
        onChange([Math.min(clamped, end), end]);
      } else {
        onChange([start, Math.max(clamped, start)]);
      }
    },
    [start, end, min, max, onChange]
  );

  // Pointer-drag: bind move/up listeners to `window` so the user can drag
  // outside the track without losing the thumb.
  useEffect(() => {
    if (disabled) return;

    const handleMove = (e: PointerEvent) => {
      const which = draggingRef.current;
      if (!which) return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      setThumb(which, ratioToValue(clampedRatio));
    };

    const handleUp = () => {
      draggingRef.current = null;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [disabled, ratioToValue, setThumb]);

  const startDrag = (thumb: 'start' | 'end') => (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    draggingRef.current = thumb;
    // Snap the thumb to the click position immediately too — feels right when
    // the user clicks-and-drags from the thumb's edge.
    const track = trackRef.current;
    if (track) {
      const rect = track.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      setThumb(thumb, ratioToValue(Math.max(0, Math.min(1, ratio))));
    }
  };

  // Click on the track surface (not a thumb): jump the nearer thumb to that point.
  const handleTrackClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if ((e.target as HTMLElement).closest('[data-thumb]')) return; // thumb handles its own
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const next = ratioToValue(Math.max(0, Math.min(1, ratio)));
    // Jump the nearer thumb.
    const nearer = Math.abs(next - start) <= Math.abs(next - end) ? 'start' : 'end';
    setThumb(nearer, next);
  };

  const handleKeyDown =
    (thumb: 'start' | 'end') => (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const current = thumb === 'start' ? start : end;
      let next = current;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          next = current - step;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          next = current + step;
          break;
        case 'PageDown':
          next = current - step * 10;
          break;
        case 'PageUp':
          next = current + step * 10;
          break;
        case 'Home':
          next = min;
          break;
        case 'End':
          next = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      setThumb(thumb, next);
    };

  // Selected segment between thumbs.
  const segLeft = `${startPct}%`;
  const segWidth = `${endPct - startPct}%`;

  return (
    <div
      className={`flex flex-col ${className}`}
      aria-disabled={disabled || undefined}
    >
      <div
        ref={trackRef}
        onPointerDown={handleTrackClick}
        className={`relative h-9 w-full select-none ${
          disabled ? 'opacity-40' : ''
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Track background */}
        <div className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-refresh-surface" />

        {/* Selected segment */}
        <div
          className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-refresh-text/80"
          style={{ left: segLeft, width: segWidth }}
        />

        {/* Start thumb */}
        <button
          type="button"
          role="slider"
          data-thumb="start"
          aria-label={ariaLabel ? `${ariaLabel} (start)` : 'Range start'}
          aria-valuemin={min}
          aria-valuemax={end}
          aria-valuenow={start}
          aria-valuetext={fmt(start)}
          aria-disabled={disabled || undefined}
          aria-describedby={`${ariaId}-start`}
          disabled={disabled}
          onPointerDown={startDrag('start')}
          onKeyDown={handleKeyDown('start')}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-3 rounded-full bg-refresh-text shadow-md ring-2 ring-refresh-bg transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-refresh-blue/40 disabled:cursor-not-allowed touch-none"
          style={{ left: `${startPct}%` }}
        />
        <span id={`${ariaId}-start`} className="sr-only">
          Range start. Use arrow keys to adjust.
        </span>

        {/* End thumb */}
        <button
          type="button"
          role="slider"
          data-thumb="end"
          aria-label={ariaLabel ? `${ariaLabel} (end)` : 'Range end'}
          aria-valuemin={start}
          aria-valuemax={max}
          aria-valuenow={end}
          aria-valuetext={fmt(end)}
          aria-disabled={disabled || undefined}
          aria-describedby={`${ariaId}-end`}
          disabled={disabled}
          onPointerDown={startDrag('end')}
          onKeyDown={handleKeyDown('end')}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-3 rounded-full bg-refresh-text shadow-md ring-2 ring-refresh-bg transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-refresh-blue/40 disabled:cursor-not-allowed touch-none"
          style={{ left: `${endPct}%` }}
        />
        <span id={`${ariaId}-end`} className="sr-only">
          Range end. Use arrow keys to adjust.
        </span>
      </div>
    </div>
  );
}
