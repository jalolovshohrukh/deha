'use client';

import { useState, type ReactNode } from 'react';

export type BannerTone = 'info' | 'success' | 'warn' | 'error';

const toneClasses: Record<BannerTone, { border: string; accent: string; iconColor: string }> = {
  info: {
    border: 'border-refresh-blue/40',
    accent: 'bg-refresh-blue',
    iconColor: 'text-refresh-blue',
  },
  success: {
    border: 'border-refresh-sage/40',
    accent: 'bg-refresh-sage',
    iconColor: 'text-refresh-sage',
  },
  warn: {
    border: 'border-refresh-pink/40',
    accent: 'bg-refresh-pink',
    iconColor: 'text-refresh-pink',
  },
  error: {
    border: 'border-refresh-pink/60',
    accent: 'bg-refresh-pink',
    iconColor: 'text-refresh-pink',
  },
};

const defaultIcons: Record<BannerTone, ReactNode> = {
  info: <span aria-hidden>ⓘ</span>,
  success: <span aria-hidden>✓</span>,
  warn: <span aria-hidden>!</span>,
  error: <span aria-hidden>!</span>,
};

export type BannerProps = {
  title: ReactNode;
  description?: ReactNode;
  tone?: BannerTone;
  /** Override the leading icon. */
  icon?: ReactNode;
  /** Optional trailing action (button, link). */
  action?: ReactNode;
  /** When true, shows a × dismiss button. */
  dismissible?: boolean;
  /** Called when the user dismisses (or you can omit and use uncontrolled mode). */
  onDismiss?: () => void;
  className?: string;
};

/**
 * Persistent in-page notice — for printer offline, sync errors, feature announcements.
 * Different from Toast (transient): Banner stays until dismissed or removed.
 */
export function Banner({
  title,
  description,
  tone = 'info',
  icon,
  action,
  dismissible = false,
  onDismiss,
  className = '',
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const tones = toneClasses[tone];
  const role = tone === 'error' || tone === 'warn' ? 'alert' : 'status';

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role={role}
      className={`relative flex items-start gap-3 overflow-hidden rounded-xl border bg-refresh-surface-2 p-4 pl-5 ${tones.border} ${className}`}
    >
      <span aria-hidden className={`absolute left-0 top-0 h-full w-1 ${tones.accent}`} />
      <span
        aria-hidden
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-refresh-surface text-sm font-bold ${tones.iconColor}`}
      >
        {icon ?? defaultIcons[tone]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-refresh-text">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-refresh-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
        >
          <span aria-hidden className="text-sm leading-none">✕</span>
        </button>
      )}
    </div>
  );
}
