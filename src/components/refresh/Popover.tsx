'use client';

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom-center'
  | 'top-start'
  | 'top-end'
  | 'top-center'
  | 'right'
  | 'left';

export type PopoverProps = {
  /** Trigger element — any valid React element. The Popover wires it up to toggle the panel. */
  trigger: ReactElement;
  /** Panel content. */
  children: ReactNode;
  /** Where the panel opens relative to the trigger. Default 'bottom-start'. */
  placement?: PopoverPlacement;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** ARIA label for the panel. */
  ariaLabel?: string;
  /** Width / extra classes on the panel. Default 'w-72'. */
  panelClassName?: string;
  /** Display class on the wrapper span around trigger + panel. Default 'inline-block'. Pass 'block w-full' for form-field-style triggers that should fill their column. */
  wrapperClassName?: string;
  /** Close on outside click. Default true. */
  closeOnOutsideClick?: boolean;
  /** Close on ESC. Default true. */
  closeOnEscape?: boolean;
};

const placementClasses: Record<PopoverPlacement, string> = {
  'bottom-start': 'top-full left-0 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
  'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2',
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
  'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'top-0 left-full ml-2',
  left: 'top-0 right-full mr-2',
};

/**
 * Generic anchored floating panel. The `trigger` is whatever you pass in (a
 * Button, an icon button, an Avatar). Popover handles open state, click
 * outside, ESC, and panel positioning.
 *
 * For app-specific popovers (account menus, command palettes), prefer
 * `ProfileMenu`, `Dialog`, or `CommandPalette`.
 *
 * @example
 *   <Popover
 *     trigger={<Button variant="secondary">Filters</Button>}
 *     placement="bottom-end"
 *     ariaLabel="Filters"
 *   >
 *     <div className="p-3">…filter form…</div>
 *   </Popover>
 */
export function Popover({
  trigger,
  children,
  placement = 'bottom-start',
  open: controlledOpen,
  onOpenChange,
  ariaLabel,
  panelClassName = 'w-72',
  wrapperClassName = 'inline-block',
  closeOnOutsideClick = true,
  closeOnEscape = true,
}: PopoverProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = isControlled ? controlledOpen! : uncontrolled;

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolled(next);
    onOpenChange?.(next);
  };

  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Outside click.
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closeOnOutsideClick]);

  // ESC.
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closeOnEscape]);

  // Wire the trigger: clone the element to attach our onClick + aria props
  // without forcing a particular component shape on the caller. We only set
  // aria-haspopup if the trigger doesn't already declare one — Select uses
  // 'listbox' for proper combobox semantics, others can stay 'dialog'.
  const triggerProps = isValidElement(trigger)
    ? (trigger.props as { onClick?: (e: React.MouseEvent) => void; 'aria-haspopup'?: string })
    : {};
  const enhancedTrigger = isValidElement(trigger)
    ? cloneElement(trigger, {
        'aria-haspopup': triggerProps['aria-haspopup'] ?? 'dialog',
        'aria-expanded': open,
        onClick: (e: React.MouseEvent) => {
          triggerProps.onClick?.(e);
          setOpen(!open);
        },
      } as Record<string, unknown>)
    : trigger;

  return (
    <span ref={wrapperRef} className={`relative ${wrapperClassName}`}>
      {enhancedTrigger}
      {open && (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className={`absolute z-40 rounded-xl border border-refresh-line bg-refresh-surface-2 refresh-shadow-soft ${placementClasses[placement]} ${panelClassName}`}
          style={{ animation: 'navrail-flyout-in 150ms ease-out' }}
        >
          {children}
        </div>
      )}
    </span>
  );
}
