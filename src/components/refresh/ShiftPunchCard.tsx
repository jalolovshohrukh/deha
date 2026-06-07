'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Avatar } from './Avatar';

export type ShiftBreak = {
  id: string;
  /** ISO timestamp / Date object / ms — when the break started. */
  start: Date | number | string;
  /** Same shape — when the break ended. Undefined if still on break. */
  end?: Date | number | string;
  /** Reason: "Lunch", "Personal", etc. */
  label?: string;
};

export type ShiftPunchCardProps = {
  /** Employee name shown on the card. */
  name: string;
  /** Optional avatar URL. Falls back to initials. */
  avatarSrc?: string;
  avatarTone?: 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';
  /** Role / position label. */
  role?: string;
  /** When the current shift started. Undefined = not punched in. */
  shiftStart?: Date | number | string;
  /** Break log for this shift. */
  breaks?: ShiftBreak[];
  /** Punch handlers — POS app does the actual write. */
  onPunchIn?: () => void;
  onPunchOut?: () => void;
  onStartBreak?: () => void;
  onEndBreak?: () => void;
  /** When provided, overrides the elapsed-time tick interval (ms). Default 1000. Set 0 to disable. */
  tickMs?: number;
  className?: string;
};

/**
 * Employee shift punch card — clock in / out with elapsed time and break tracking.
 *
 * @example
 *   <ShiftPunchCard
 *     name="Leslie K."
 *     role="Cashier"
 *     shiftStart={shift?.startedAt}
 *     breaks={shift?.breaks}
 *     onPunchIn={clockIn}
 *     onPunchOut={clockOut}
 *     onStartBreak={startBreak}
 *     onEndBreak={endBreak}
 *   />
 */
export function ShiftPunchCard({
  name,
  avatarSrc,
  avatarTone = 'lavender',
  role,
  shiftStart,
  breaks = [],
  onPunchIn,
  onPunchOut,
  onStartBreak,
  onEndBreak,
  tickMs = 1000,
  className = '',
}: ShiftPunchCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (tickMs <= 0) return;
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  const onShift = shiftStart != null;
  const startMs = onShift ? toMs(shiftStart!) : 0;

  const activeBreak = breaks.find((b) => b.end == null);
  const onBreak = !!activeBreak;

  // Total break time (closed breaks + ongoing).
  const totalBreakMs = breaks.reduce((sum, b) => {
    const start = toMs(b.start);
    const end = b.end != null ? toMs(b.end) : now;
    return sum + Math.max(0, end - start);
  }, 0);

  const elapsedShiftMs = onShift ? Math.max(0, now - startMs) : 0;
  const workedMs = Math.max(0, elapsedShiftMs - totalBreakMs);
  const breakElapsedMs = activeBreak ? Math.max(0, now - toMs(activeBreak.start)) : 0;

  return (
    <article
      className={`flex flex-col gap-4 rounded-2xl border border-refresh-line bg-refresh-surface-2 p-5 ${className}`}
    >
      <header className="flex items-center gap-3">
        <Avatar
          name={name}
          src={avatarSrc}
          tone={avatarTone}
          size="lg"
          status={onShift ? (onBreak ? 'busy' : 'online') : 'offline'}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-refresh-text">{name}</p>
          {role && <p className="truncate text-xs text-refresh-muted">{role}</p>}
        </div>
        <ShiftStatusPill onShift={onShift} onBreak={onBreak} />
      </header>

      {onShift && (
        <div className="grid grid-cols-2 gap-2">
          <Tile label="Worked" value={formatDuration(workedMs)} />
          <Tile
            label={onBreak ? 'On break' : 'Total break'}
            value={onBreak ? formatDuration(breakElapsedMs) : formatDuration(totalBreakMs)}
            tone={onBreak ? 'warn' : 'default'}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!onShift && (
          <button
            type="button"
            onClick={onPunchIn}
            className="flex-1 rounded-lg bg-refresh-text px-4 py-2.5 text-sm font-bold text-refresh-bg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
          >
            Clock in
          </button>
        )}
        {onShift && !onBreak && (
          <>
            <button
              type="button"
              onClick={onStartBreak}
              className="flex-1 rounded-lg border border-refresh-surface-3 bg-refresh-surface px-4 py-2.5 text-sm font-semibold text-refresh-text transition hover:border-refresh-muted-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
            >
              Start break
            </button>
            <button
              type="button"
              onClick={onPunchOut}
              className="flex-1 rounded-lg bg-refresh-pink px-4 py-2.5 text-sm font-bold text-refresh-on-pastel transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-pink focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
            >
              Clock out
            </button>
          </>
        )}
        {onShift && onBreak && (
          <button
            type="button"
            onClick={onEndBreak}
            className="flex-1 rounded-lg bg-refresh-text px-4 py-2.5 text-sm font-bold text-refresh-bg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
          >
            End break
          </button>
        )}
      </div>

      {breaks.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-xs font-semibold text-refresh-muted hover:text-refresh-text">
            Break log ({breaks.length})
            <span aria-hidden className="ml-1 inline-block transition group-open:rotate-90">
              ›
            </span>
          </summary>
          <ul className="mt-2 flex flex-col gap-1">
            {breaks.map((b) => {
              const start = toMs(b.start);
              const end = b.end != null ? toMs(b.end) : null;
              const dur = end != null ? end - start : now - start;
              return (
                <li
                  key={b.id}
                  className="flex items-center justify-between text-xs text-refresh-muted"
                >
                  <span>
                    {b.label ?? 'Break'} ·{' '}
                    {new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' → '}
                    {end != null
                      ? new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'now'}
                  </span>
                  <span className="tabular-nums text-refresh-muted-2">{formatDuration(dur)}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </article>
  );
}

function ShiftStatusPill({ onShift, onBreak }: { onShift: boolean; onBreak: boolean }) {
  if (!onShift) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-refresh-surface-3 px-2.5 py-1 text-[11px] font-semibold text-refresh-muted">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-refresh-muted-2" />
        Off
      </span>
    );
  }
  if (onBreak) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-refresh-pink/20 px-2.5 py-1 text-[11px] font-semibold text-refresh-pink">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-refresh-pink" />
        Break
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-refresh-sage/20 px-2.5 py-1 text-[11px] font-semibold text-refresh-sage">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-refresh-sage" />
      On shift
    </span>
  );
}

function Tile({ label, value, tone = 'default' }: { label: string; value: ReactNode; tone?: 'default' | 'warn' }) {
  const toneCls =
    tone === 'warn' ? 'bg-refresh-pink/10 text-refresh-pink' : 'bg-refresh-surface text-refresh-text';
  return (
    <div className={`flex flex-col gap-1 rounded-lg px-3 py-2 ${toneCls}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{label}</span>
      <span className="text-base font-bold tabular-nums">{value}</span>
    </div>
  );
}

function toMs(d: Date | number | string): number {
  if (typeof d === 'number') return d;
  if (typeof d === 'string') return new Date(d).getTime();
  return d.getTime();
}

function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}
