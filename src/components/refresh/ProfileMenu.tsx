'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ThemeToggle, type Theme } from './Theme';
import { LanguagePicker, type LanguageOption } from './LanguagePicker';

export type ProfileMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** 'danger' tints the row pink for destructive actions (e.g. Logout). */
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

export type ProfileMenuPlacement =
  /** Anchored to bottom-right corner of trigger, opens upward + to the right (nav rail account). */
  | 'right-bottom'
  /** Anchored to bottom of trigger, opens to the right (nav rail mid-position). */
  | 'right-top'
  /** Below trigger, right-aligned (typical top-bar avatar). */
  | 'bottom-end'
  /** Below trigger, left-aligned. */
  | 'bottom-start';

export type ProfileMenuTheme = {
  /** Optional. If omitted, ThemeToggle inside the menu will hook into the nearest <ThemeProvider>. */
  value?: Theme;
  onChange?: (next: Theme) => void;
};

export type ProfileMenuLanguage = {
  value: string;
  options: LanguageOption[];
  onChange: (next: string) => void;
};

export type ProfileMenuProps = {
  /** Menu items rendered at the top of the popover (My Profile, Logout, etc.). */
  items?: ProfileMenuItem[];
  /** When provided, renders a Light/Dark ThemeToggle below the items. */
  theme?: ProfileMenuTheme | true;
  /** When provided, renders a LanguagePicker below the theme toggle. */
  language?: ProfileMenuLanguage;
  /** Where the popover opens relative to the trigger. Default: 'bottom-end'. */
  placement?: ProfileMenuPlacement;
  /** ARIA label for the trigger button (recommended for icon-only triggers). */
  ariaLabel?: string;
  /** Class applied to the trigger button (the wrapper around children). */
  buttonClassName?: string;
  /** Width of the popover. Default: 'w-64'. */
  popoverClassName?: string;
  /** Optional controlled open state. When provided, ProfileMenu becomes controlled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

const placementClasses: Record<ProfileMenuPlacement, string> = {
  'right-bottom': 'bottom-0 left-full ml-3',
  'right-top': 'top-0 left-full ml-3',
  'bottom-end': 'top-full right-0 mt-2',
  'bottom-start': 'top-full left-0 mt-2',
};

/**
 * Standalone profile-menu popover. Drop it anywhere — top-bar header, side rail,
 * dashboard widget. The trigger is whatever you pass as children; ProfileMenu
 * handles the button wrapper, popover, click-outside, ESC, and accessibility.
 *
 * @example
 *   <ProfileMenu
 *     placement="bottom-end"
 *     items={[
 *       { id: 'profile', label: 'My Profile', icon: <PersonIcon />, href: '/account' },
 *       { id: 'logout', label: 'Logout', icon: <LogoutIcon />, tone: 'danger', onClick: signOut },
 *     ]}
 *     theme       // hooks into the nearest ThemeProvider
 *     language={{ value, options, onChange }}
 *     ariaLabel="Open profile menu"
 *   >
 *     <Avatar name="Leslie K" size="sm" />
 *   </ProfileMenu>
 */
export function ProfileMenu({
  items,
  theme,
  language,
  placement = 'bottom-end',
  ariaLabel,
  buttonClassName = '',
  popoverClassName = 'w-64',
  open: controlledOpen,
  onOpenChange,
  children,
}: ProfileMenuProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlled ? controlledOpen! : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const triggerCls = `block transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
    open ? 'bg-refresh-surface' : 'hover:bg-refresh-surface'
  } rounded-lg ${buttonClassName}`;

  const themeProps =
    theme === true
      ? {} // hook to context inside ThemeToggle
      : theme
      ? { value: theme.value, onChange: theme.onChange }
      : null;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(!open)}
        className={triggerCls}
      >
        {children}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 rounded-xl border border-refresh-line bg-refresh-surface-2 p-3 refresh-shadow-soft ${popoverClassName} ${placementClasses[placement]}`}
          style={{ animation: 'navrail-flyout-in 150ms ease-out' }}
        >
          {items && items.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <li key={item.id}>
                  <ProfileMenuItemRow item={item} onClose={() => setOpen(false)} />
                </li>
              ))}
            </ul>
          )}

          {themeProps !== null && (
            <div
              className={`${
                items && items.length > 0 ? 'mt-3 border-t border-refresh-line pt-3' : ''
              }`}
            >
              <ThemeToggle {...themeProps} />
            </div>
          )}

          {language && (
            <div className="mt-3">
              <LanguagePicker
                value={language.value}
                options={language.options}
                onChange={language.onChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileMenuItemRow({
  item,
  onClose,
}: {
  item: ProfileMenuItem;
  onClose: () => void;
}) {
  const { label, icon, href, onClick, tone, disabled } = item;
  const isDanger = tone === 'danger';

  const cls = `flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
    disabled ? 'cursor-not-allowed opacity-40' : ''
  } ${
    isDanger
      ? 'text-refresh-pink hover:bg-refresh-pink/10'
      : 'text-refresh-text hover:bg-refresh-surface'
  }`;

  const inner = (
    <>
      {icon && (
        <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} onClick={onClose} role="menuitem">
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        onClose();
      }}
      className={cls}
    >
      {inner}
    </button>
  );
}
