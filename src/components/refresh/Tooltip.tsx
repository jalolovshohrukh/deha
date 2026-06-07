'use client';

import { useId, useState, type ReactNode } from 'react';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export type TooltipProps = {
  /** Tooltip body — string or arbitrary node. */
  content: ReactNode;
  /** Which side of the trigger to render the tooltip on. Default: 'top'. */
  side?: TooltipSide;
  /** Delay before showing (ms). Default: 200. */
  showDelay?: number;
  /** The element that triggers the tooltip on hover/focus. */
  children: ReactNode;
  className?: string;
};

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Generic hover/focus tooltip. Theme-aware via refresh tokens.
 *
 * Usage:
 *   <Tooltip content="Save (⌘S)">
 *     <button>...</button>
 *   </Tooltip>
 *
 * The trigger is whatever you pass as children. Tooltip wraps it in a span and
 * shows the content panel after `showDelay` on hover or focus.
 */
export function Tooltip({
  content,
  side = 'top',
  showDelay = 200,
  children,
  className = '',
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const show = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => setOpen(true), showDelay);
  };
  const hide = () => {
    if (timer) clearTimeout(timer);
    setOpen(false);
  };

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-refresh-line bg-refresh-bg px-2.5 py-1.5 text-xs font-medium text-refresh-text shadow-lg transition-opacity duration-150 ${
          sideClasses[side]
        } ${open ? 'opacity-100' : 'opacity-0'}`}
      >
        {content}
      </span>
    </span>
  );
}
