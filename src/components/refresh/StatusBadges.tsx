'use client';

import { useEffect, useState, type ReactNode } from 'react';

// ─────────── OrderStatusBadge ───────────

export type OrderStatus =
  | 'pending'
  | 'in-kitchen'
  | 'ready'
  | 'out-for-delivery'
  | 'completed'
  | 'cancelled';

const orderStatusMap: Record<OrderStatus, { label: string; tone: string; dot: string }> = {
  pending: {
    label: 'Pending',
    tone: 'bg-refresh-surface-3 text-refresh-text',
    dot: 'bg-refresh-muted',
  },
  'in-kitchen': {
    label: 'In kitchen',
    tone: 'bg-refresh-blue/20 text-refresh-blue',
    dot: 'bg-refresh-blue',
  },
  ready: {
    label: 'Ready',
    tone: 'bg-refresh-sage/20 text-refresh-sage',
    dot: 'bg-refresh-sage',
  },
  'out-for-delivery': {
    label: 'Out for delivery',
    tone: 'bg-refresh-periwinkle/20 text-refresh-periwinkle',
    dot: 'bg-refresh-periwinkle',
  },
  completed: {
    label: 'Completed',
    tone: 'bg-refresh-sage/20 text-refresh-sage',
    dot: 'bg-refresh-sage',
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'bg-refresh-pink/20 text-refresh-pink',
    dot: 'bg-refresh-pink',
  },
};

export type OrderStatusBadgeProps = {
  status: OrderStatus;
  /** Override the rendered label (default uses the status's preset label). */
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
};

/** Pill badge for the order lifecycle — pending → in-kitchen → ready → completed/cancelled. */
export function OrderStatusBadge({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}: OrderStatusBadgeProps) {
  const cfg = orderStatusMap[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cfg.tone} ${padding} ${className}`}
    >
      {showDot && (
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      )}
      {label ?? cfg.label}
    </span>
  );
}

// ─────────── StockBadge ───────────

export type StockStatus = 'in-stock' | 'low' | 'out' | 'eighty-sixed';

const stockMap: Record<StockStatus, { label: string; tone: string }> = {
  'in-stock': { label: 'In stock', tone: 'bg-refresh-sage/20 text-refresh-sage' },
  low: { label: 'Low', tone: 'bg-refresh-pink/20 text-refresh-pink' },
  out: { label: 'Out', tone: 'bg-refresh-pink/30 text-refresh-pink' },
  'eighty-sixed': { label: "86'd", tone: 'bg-refresh-surface-3 text-refresh-muted' },
};

export type StockBadgeProps = {
  status: StockStatus;
  /** Append the count to the label (e.g. "Low (3)"). */
  count?: number;
  className?: string;
};

/** Inventory state badge for product cards. */
export function StockBadge({ status, count, className = '' }: StockBadgeProps) {
  const cfg = stockMap[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${cfg.tone} ${className}`}
    >
      {cfg.label}
      {count != null && <span className="tabular-nums">({count})</span>}
    </span>
  );
}

// ─────────── LoyaltyChip ───────────

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

const loyaltyMap: Record<LoyaltyTier, { label: string; tone: string }> = {
  bronze: { label: 'Bronze', tone: 'bg-refresh-pink/15 text-refresh-pink' },
  silver: { label: 'Silver', tone: 'bg-refresh-surface-3 text-refresh-text' },
  gold: { label: 'Gold', tone: 'bg-refresh-lavender/30 text-refresh-lavender' },
  platinum: { label: 'Platinum', tone: 'bg-refresh-periwinkle/30 text-refresh-periwinkle' },
};

export type LoyaltyChipProps = {
  tier: LoyaltyTier;
  /** Loyalty points balance — appended after the tier label. */
  points?: number;
  /** Override the displayed tier label. */
  label?: string;
  className?: string;
};

/** Customer-loyalty tier chip with optional points. */
export function LoyaltyChip({ tier, points, label, className = '' }: LoyaltyChipProps) {
  const cfg = loyaltyMap[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.tone} ${className}`}
    >
      <span aria-hidden>★</span>
      {label ?? cfg.label}
      {points != null && (
        <span className="tabular-nums opacity-80">· {points.toLocaleString()} pts</span>
      )}
    </span>
  );
}

// ─────────── OrderTimer ───────────

export type OrderTimerProps = {
  /** When the order was placed — Date or ms timestamp. */
  startedAt: Date | number;
  /** Auto-tick every N ms. Default 1000. Set to 0 to disable ticking. */
  tickMs?: number;
  /** Minutes elapsed at which the chip switches to the warn tone. Default 8. */
  warnAfterMin?: number;
  /** Minutes elapsed at which the chip switches to the alert tone. Default 15. */
  alertAfterMin?: number;
  /** Optional prefix label (e.g. "Placed", "Ordered"). Default "Placed". */
  prefix?: ReactNode;
  className?: string;
};

/** Live-ticking elapsed-time chip for kitchen and dashboard order rows. */
export function OrderTimer({
  startedAt,
  tickMs = 1000,
  warnAfterMin = 8,
  alertAfterMin = 15,
  prefix = 'Placed',
  className = '',
}: OrderTimerProps) {
  const startedMs = typeof startedAt === 'number' ? startedAt : startedAt.getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (tickMs <= 0) return;
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  const elapsedMs = Math.max(0, now - startedMs);
  const totalSec = Math.floor(elapsedMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const minPart = min;

  let tone = 'bg-refresh-surface-3 text-refresh-text';
  if (minPart >= alertAfterMin) tone = 'bg-refresh-pink/25 text-refresh-pink';
  else if (minPart >= warnAfterMin) tone = 'bg-refresh-pink/15 text-refresh-pink';

  const display =
    min < 1
      ? `${sec}s ago`
      : min < 60
      ? `${min}m ago`
      : `${Math.floor(min / 60)}h ${min % 60}m ago`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${tone} ${className}`}
    >
      <span aria-hidden>⏱</span>
      <span className="text-current/70">{prefix}</span>
      <span>{display}</span>
    </span>
  );
}
