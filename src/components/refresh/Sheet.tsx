'use client';

import { useEffect, useRef, useState } from 'react';

type Side = 'left' | 'right' | 'top' | 'bottom';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: Side;
  size?: string;
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
};

const sideDefaults: Record<Side, { size: string; edge: string; rounded: string; closed: string }> = {
  left: {
    size: 'w-80 max-w-[85vw]',
    edge: 'top-0 left-0 h-full',
    rounded: 'rounded-r-2xl',
    closed: '-translate-x-full',
  },
  right: {
    size: 'w-96 max-w-[90vw]',
    edge: 'top-0 right-0 h-full',
    rounded: 'rounded-l-2xl',
    closed: 'translate-x-full',
  },
  top: {
    size: 'h-72 max-h-[60vh]',
    edge: 'top-0 left-0 right-0 w-full',
    rounded: 'rounded-b-2xl',
    closed: '-translate-y-full',
  },
  bottom: {
    size: 'h-72 max-h-[60vh]',
    edge: 'bottom-0 left-0 right-0 w-full',
    rounded: 'rounded-t-2xl',
    closed: 'translate-y-full',
  },
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({
  open,
  onOpenChange,
  side,
  size,
  children,
  ariaLabel,
  className = '',
}: SheetProps) {
  // mounted: should the panel be in the DOM at all?
  // active: should the panel be visually open (transform applied)?
  // We split these so we can render the closed state for one frame on first open,
  // then flip to open — that way the slide-in animation actually plays.
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);

  // Keep latest onOpenChange in a ref so the keydown effect doesn't re-bind on every render.
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Mount lifecycle: when opening, mount first (closed), then on next frame flip active=true.
  // When closing, flip active=false (slides out), then unmount after the transition.
  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      setMounted(true);
      raf = requestAnimationFrame(() => {
        // A second rAF pushes us past the paint where the closed state was committed —
        // without this, React/browser sometimes batches both states and skips the transition.
        raf = requestAnimationFrame(() => setActive(true));
      });
    } else {
      setActive(false);
      timer = setTimeout(() => setMounted(false), 220);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  // ESC + body scroll lock + focus management + focus trap.
  useEffect(() => {
    if (!open) return;

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChangeRef.current(false);
        return;
      }
      if (e.key !== 'Tab') return;

      // Focus trap: keep Tab within the panel.
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

    // Move focus into the panel after open transition starts.
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
  }, [open]);

  if (!mounted) return null;

  const cfg = sideDefaults[side];
  const sizeClass = size ?? cfg.size;

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!open}>
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`absolute ${cfg.edge} ${sizeClass} ${cfg.rounded} bg-refresh-surface-2 border border-refresh-line refresh-shadow-soft transition-transform duration-200 ease-out outline-none ${
          active ? 'translate-x-0 translate-y-0' : cfg.closed
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
