'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type DialogSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<DialogSize, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-2xl',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ariaLabel: string;
  size?: DialogSize;
  /** Click outside the panel closes the dialog. Defaults to true. */
  closeOnBackdropClick?: boolean;
  /** Pressing ESC closes the dialog. Defaults to true. */
  closeOnEscape?: boolean;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onOpenChange,
  ariaLabel,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  children,
  className = '',
}: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Mount lifecycle — render closed for one paint, then flip active=true so the entry transition plays.
  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      setMounted(true);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => setActive(true));
      });
    } else {
      setActive(false);
      timer = setTimeout(() => setMounted(false), 180);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  // ESC + body scroll lock + focus trap.
  useEffect(() => {
    if (!open) return;

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onOpenChangeRef.current(false);
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (activeEl === first || !panel.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last || !panel.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);

    const focusTimer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? panel).focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(focusTimer);
      lastFocusRef.current?.focus?.();
    };
  }, [open, closeOnEscape]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => closeOnBackdropClick && onOpenChange(false)}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`relative ${sizeMap[size]} rounded-2xl bg-refresh-surface-2 border border-refresh-line refresh-shadow-soft transition-all duration-200 ease-out outline-none ${
          active ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

// ───────── Subcomponents ─────────

export function DialogHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <header className={`flex items-start justify-between gap-4 p-6 pb-4 ${className}`}>
      {children}
    </header>
  );
}

export function DialogTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-bold text-refresh-text ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-1 text-sm text-refresh-muted ${className}`}>{children}</p>;
}

export function DialogBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 pb-2 text-sm text-refresh-muted ${className}`}>{children}</div>;
}

export function DialogFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <footer className={`flex items-center justify-end gap-2 p-6 pt-4 ${className}`}>
      {children}
    </footer>
  );
}

export function DialogClose({
  onClick,
  ariaLabel = 'Close',
  className = '',
}: {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-refresh-muted-2 transition hover:bg-refresh-surface hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${className}`}
    >
      <span aria-hidden className="text-base leading-none">✕</span>
    </button>
  );
}
