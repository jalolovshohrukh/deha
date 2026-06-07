'use client';

import Link from 'next/link';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ProfileMenu, type ProfileMenuItem } from './ProfileMenu';
import type { LanguageOption } from './LanguagePicker';
import type { Theme } from './Theme';

export type NavRailBadge = {
  label: string | number;
  tone?: 'default' | 'warn' | 'success' | 'info';
};

export type NavRailSubmenuItem = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: NavRailBadge;
  shortcut?: string;
  disabled?: boolean;
};

export type NavRailSubmenu = {
  /** Eyebrow label rendered above the submenu items (e.g. "PRODUCTS"). */
  label?: string;
  items: NavRailSubmenuItem[];
};

export type NavRailItem = {
  id: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  badge?: NavRailBadge;
  /** Keyboard shortcut hint (e.g. "⌘1"). */
  shortcut?: string;
  disabled?: boolean;
  /** Hover-flyout submenu shown to the right of the item. Works in both modes. */
  submenu?: NavRailSubmenu;
  /**
   * When true, the item renders as a filled dark bubble distinct from the
   * regular nav items — used for primary destructive actions like Logout
   * pinned to `bottomItems`. Visual-only; no behavior change.
   */
  pill?: boolean;
};

export type NavRailVariant = 'default' | 'minimal';

export type NavRailSection = {
  label?: string;
  items: NavRailItem[];
};

/**
 * Re-exported aliases so consumers don't have to import from two places.
 * The actual implementations live in ProfileMenu / LanguagePicker / Theme.
 */
export type NavRailAccountMenuItem = ProfileMenuItem;

export type NavRailAccountMenu = {
  items: ProfileMenuItem[];
  /**
   * When `true`, the menu shows a Light/Dark toggle that auto-wires to the nearest
   * <ThemeProvider>. When passed an object, the toggle is controlled with
   * value/onChange. Omit to skip the toggle.
   */
  theme?: true | {
    value: Theme;
    onChange: (next: Theme) => void;
  };
  /** Language selector — when provided, renders the LanguagePicker below the items. */
  language?: {
    value: string;
    options: LanguageOption[];
    onChange: (next: string) => void;
  };
};

export type NavRailAccount = {
  name: string;
  meta?: string;
  avatar?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** When provided, clicking the account block opens a profile-menu popover. */
  menu?: NavRailAccountMenu;
};

export type NavRailProps = {
  brand?: ReactNode;
  brandLabel?: string;
  brandHref?: string;
  items?: NavRailItem[];
  sections?: NavRailSection[];
  bottomItems?: NavRailItem[];
  account?: NavRailAccount;
  collapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  collapseSlot?: ReactNode;
  /**
   * Visual treatment.
   *
   * - `'default'` — bordered surface with a subtle highlight + left accent bar
   *   on the active item. Dot-only badges in collapsed mode.
   * - `'minimal'` — borderless dark pill with a fully inverted (white) active
   *   item, no accent bar. Collapsed-mode badges render as small count pills
   *   instead of dots. Pair with `pill: true` on a `bottomItems[i]` for the
   *   distinct logout-bubble treatment.
   */
  variant?: NavRailVariant;
  className?: string;
};

const badgeToneMap: Record<NonNullable<NavRailBadge['tone']>, string> = {
  default: 'bg-refresh-surface-3 text-refresh-text',
  warn: 'bg-refresh-pink/20 text-refresh-pink',
  success: 'bg-refresh-sage/20 text-refresh-sage',
  info: 'bg-refresh-blue/20 text-refresh-blue',
};

const dotToneMap: Record<NonNullable<NavRailBadge['tone']>, string> = {
  default: 'bg-refresh-text',
  warn: 'bg-refresh-pink',
  success: 'bg-refresh-sage',
  info: 'bg-refresh-blue',
};

const CLOSE_DELAY_MS = 200;

export function NavRail({
  brand,
  brandLabel,
  brandHref,
  items,
  sections,
  bottomItems,
  account,
  collapsed = false,
  onCollapsedChange,
  collapseSlot,
  variant = 'default',
  className = '',
}: NavRailProps) {
  const resolvedSections: NavRailSection[] = sections ?? (items ? [{ items }] : []);
  const showHeader = brand || onCollapsedChange || collapseSlot;

  // Submenu state: which item id has its flyout open. Single-flyout-at-a-time.
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSubmenu = useCallback((id: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenSubmenuId(id);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpenSubmenuId(null);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeNow = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenSubmenuId(null);
  }, []);

  const isMinimal = variant === 'minimal';
  return (
    <aside
      data-collapsed={collapsed}
      data-variant={variant}
      aria-label="Primary navigation"
      className={`relative flex flex-col rounded-2xl bg-refresh-surface-2 transition-[width] duration-200 ease-out ${
        isMinimal ? '' : 'border border-refresh-line'
      } ${collapsed ? 'w-[68px]' : 'w-60'} ${className}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') closeNow();
      }}
    >
      {showHeader && (
        <div
          className={`flex items-center gap-2 border-b border-refresh-line px-3 py-3 ${
            collapsed ? 'flex-col' : 'justify-between'
          }`}
        >
          {brand && (
            <BrandBlock
              brand={brand}
              brandLabel={brandLabel}
              brandHref={brandHref}
              collapsed={collapsed}
            />
          )}
          {onCollapsedChange ? (
            <button
              type="button"
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              onClick={() => onCollapsedChange(!collapsed)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-refresh-muted-2 transition hover:bg-refresh-surface-3 hover:text-refresh-text focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg"
            >
              <ChevronIcon direction={collapsed ? 'right' : 'left'} />
            </button>
          ) : (
            collapseSlot && <span className="text-refresh-muted-2">{collapseSlot}</span>
          )}
        </div>
      )}

      <nav aria-label="Primary" className="flex flex-1 flex-col py-2">
        {resolvedSections.map((sec, i) => (
          <SectionBlock
            key={i}
            section={sec}
            collapsed={collapsed}
            variant={variant}
            openSubmenuId={openSubmenuId}
            openSubmenu={openSubmenu}
            scheduleClose={scheduleClose}
            cancelClose={cancelClose}
            closeNow={closeNow}
          />
        ))}
      </nav>

      {bottomItems && bottomItems.length > 0 && (
        <div className={`px-2 py-2 ${isMinimal ? '' : 'border-t border-refresh-line'}`}>
          <ul className="flex flex-col gap-0.5">
            {bottomItems.map((it) => (
              <li key={it.id}>
                <NavItemRow
                  item={it}
                  collapsed={collapsed}
                  variant={variant}
                  openSubmenuId={openSubmenuId}
                  openSubmenu={openSubmenu}
                  scheduleClose={scheduleClose}
                  cancelClose={cancelClose}
                  closeNow={closeNow}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {account && (
        <div className={`p-2 ${isMinimal ? '' : 'border-t border-refresh-line'}`}>
          <AccountBlock account={account} collapsed={collapsed} />
        </div>
      )}
    </aside>
  );
}

// ─────────── Internal pieces ───────────

type ItemRowProps = {
  item: NavRailItem;
  collapsed: boolean;
  variant: NavRailVariant;
  openSubmenuId: string | null;
  openSubmenu: (id: string) => void;
  scheduleClose: () => void;
  cancelClose: () => void;
  closeNow: () => void;
};

function BrandBlock({
  brand,
  brandLabel,
  brandHref,
  collapsed,
}: {
  brand: ReactNode;
  brandLabel?: string;
  brandHref?: string;
  collapsed: boolean;
}) {
  const inner = (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="shrink-0">{brand}</span>
      {!collapsed && brandLabel && (
        <span className="truncate text-base font-bold text-refresh-text">{brandLabel}</span>
      )}
    </span>
  );
  if (brandHref) {
    return (
      <Link href={brandHref} className="min-w-0 transition hover:opacity-80">
        {inner}
      </Link>
    );
  }
  return inner;
}

function SectionBlock({
  section,
  collapsed,
  variant,
  openSubmenuId,
  openSubmenu,
  scheduleClose,
  cancelClose,
  closeNow,
}: {
  section: NavRailSection;
  collapsed: boolean;
} & Omit<ItemRowProps, 'item'>) {
  return (
    <div className="px-2 py-1">
      {section.label && !collapsed && (
        <p className="mb-1 px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
          {section.label}
        </p>
      )}
      <ul className="flex flex-col gap-0.5">
        {section.items.map((it) => (
          <li key={it.id}>
            <NavItemRow
              item={it}
              collapsed={collapsed}
              variant={variant}
              openSubmenuId={openSubmenuId}
              openSubmenu={openSubmenu}
              scheduleClose={scheduleClose}
              cancelClose={cancelClose}
              closeNow={closeNow}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavItemRow({
  item,
  collapsed,
  variant,
  openSubmenuId,
  openSubmenu,
  scheduleClose,
  cancelClose,
  closeNow,
}: ItemRowProps) {
  const { icon, label, active, badge, shortcut, disabled, href, onClick, submenu, pill } = item;
  const hasSubmenu = !!submenu && submenu.items.length > 0;
  const submenuOpen = hasSubmenu && openSubmenuId === item.id;
  const isMinimal = variant === 'minimal';

  // Active / inactive styling differs per variant. Minimal: inverted white pill.
  // Default: subtle highlight + left accent bar (rendered separately below).
  const activeClass = isMinimal
    ? 'bg-refresh-text text-refresh-bg'
    : 'bg-refresh-surface-3 text-refresh-text';
  const inactiveClass = isMinimal
    ? 'text-refresh-muted-2 hover:bg-refresh-surface hover:text-refresh-text'
    : 'text-refresh-muted hover:bg-refresh-surface hover:text-refresh-text';

  // `pill` items get a filled-bubble base regardless of variant — for
  // primary destructive actions like Logout pinned to the bottom.
  const pillBase = pill
    ? 'bg-refresh-bg text-refresh-muted shadow-inner hover:text-refresh-text'
    : '';

  const baseClass = `group/item relative flex items-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
    disabled ? 'cursor-not-allowed opacity-40' : ''
  } ${
    collapsed
      ? 'mx-auto h-10 w-10 justify-center rounded-lg'
      : 'h-9 w-full gap-3 rounded-lg px-3'
  } ${
    pill
      ? pillBase
      : active || submenuOpen
      ? activeClass
      : inactiveClass
  }`;

  // Default variant: subtle left accent bar on the active item. Minimal
  // variant: drop it (the inverted pill is the active indicator).
  const accentBar = active && !isMinimal && (
    <span
      aria-hidden
      className="absolute -left-2 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-refresh-text"
    />
  );

  // Collapsed-mode badge: minimal variant shows the count label as a small
  // pill anchored top-right; default variant shows a colored dot.
  const collapsedBadge = collapsed && badge && (
    isMinimal ? (
      <span
        aria-hidden
        className={`absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums ring-2 ring-refresh-surface-2 ${
          badgeToneMap[badge.tone ?? 'default']
        }`}
      >
        {badge.label}
      </span>
    ) : (
      <span
        aria-hidden
        className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ring-2 ring-refresh-surface-2 ${
          dotToneMap[badge.tone ?? 'default']
        }`}
      />
    )
  );

  const buttonContent = (
    <>
      {accentBar}
      <span aria-hidden className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        {icon}
        {collapsedBadge}
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">{label}</span>
          {hasSubmenu && (
            <span aria-hidden className="shrink-0 text-refresh-muted-2">
              <ChevronIcon direction="right" />
            </span>
          )}
          {!hasSubmenu && badge && (
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                badgeToneMap[badge.tone ?? 'default']
              }`}
            >
              {badge.label}
            </span>
          )}
          {!hasSubmenu && shortcut && !badge && (
            <span className="shrink-0 font-mono text-[10px] text-refresh-muted-2">
              {shortcut}
            </span>
          )}
        </>
      )}
      {/* Tooltip — only when collapsed AND there's no open submenu (submenu replaces tooltip) */}
      {collapsed && !hasSubmenu && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-refresh-line bg-refresh-bg px-2.5 py-1.5 text-xs font-medium text-refresh-text opacity-0 shadow-lg transition-opacity duration-150 group-hover/item:opacity-100"
        >
          {label}
          {shortcut && <span className="ml-2 font-mono text-refresh-muted-2">{shortcut}</span>}
        </span>
      )}
    </>
  );

  // Collapsed mode hides the visual label and the badge text — fold them into
  // the accessible name so screen readers still announce both.
  const collapsedAriaLabel = collapsed
    ? badge
      ? `${label} (${badge.label})`
      : label
    : undefined;

  const aria = {
    'aria-label': collapsedAriaLabel,
    'aria-current': active ? ('page' as const) : undefined,
    'aria-disabled': disabled || undefined,
    'aria-haspopup': hasSubmenu ? ('menu' as const) : undefined,
    'aria-expanded': hasSubmenu ? submenuOpen : undefined,
  };

  const trigger =
    href && !disabled ? (
      <Link href={href} className={baseClass} {...aria}>
        {buttonContent}
      </Link>
    ) : (
      <button type="button" disabled={disabled} onClick={onClick} className={baseClass} {...aria}>
        {buttonContent}
      </button>
    );

  // If no submenu, return the bare trigger (with its own hover tooltip in collapsed mode).
  if (!hasSubmenu) {
    return trigger;
  }

  // With submenu, wrap so we can manage open state via mouse + focus.
  return (
    <div
      className="relative"
      onMouseEnter={() => openSubmenu(item.id)}
      onMouseLeave={scheduleClose}
      onFocus={() => openSubmenu(item.id)}
      onBlur={(e) => {
        // Only schedule close if focus is leaving the wrapper entirely.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          scheduleClose();
        }
      }}
    >
      {trigger}
      {submenuOpen && (
        <SubmenuPanel
          submenu={submenu!}
          collapsed={collapsed}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onItemClick={closeNow}
        />
      )}
    </div>
  );
}

function SubmenuPanel({
  submenu,
  collapsed,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}: {
  submenu: NavRailSubmenu;
  collapsed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onItemClick: () => void;
}) {
  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute top-0 z-50 w-60 rounded-xl border border-refresh-line bg-refresh-surface-2 p-2 refresh-shadow-soft ${
        collapsed ? 'left-full ml-3' : 'left-full ml-2'
      }`}
      style={{ animation: 'navrail-flyout-in 150ms ease-out' }}
    >
      {submenu.label && (
        <p className="mb-1 border-b border-refresh-line px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-refresh-muted-2">
          {submenu.label}
        </p>
      )}
      <ul className="flex flex-col gap-0.5">
        {submenu.items.map((it) => (
          <li key={it.id}>
            <SubmenuItemRow item={it} onItemClick={onItemClick} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubmenuItemRow({
  item,
  onItemClick,
}: {
  item: NavRailSubmenuItem;
  onItemClick: () => void;
}) {
  const { label, active, href, onClick, badge, shortcut, disabled } = item;

  const cls = `flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${
    disabled ? 'cursor-not-allowed opacity-40' : ''
  } ${
    active
      ? 'bg-refresh-surface-3 text-refresh-text'
      : 'text-refresh-muted hover:bg-refresh-surface hover:text-refresh-text'
  }`;

  const inner = (
    <>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      {badge && (
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
            badgeToneMap[badge.tone ?? 'default']
          }`}
        >
          {badge.label}
        </span>
      )}
      {shortcut && !badge && (
        <span className="shrink-0 font-mono text-[10px] text-refresh-muted-2">{shortcut}</span>
      )}
    </>
  );

  const aria = {
    'aria-current': active ? ('page' as const) : undefined,
    role: 'menuitem',
  };

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} onClick={onItemClick} {...aria}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        onItemClick();
      }}
      className={cls}
      {...aria}
    >
      {inner}
    </button>
  );
}

function AccountBlock({
  account,
  collapsed,
}: {
  account: NavRailAccount;
  collapsed: boolean;
}) {
  const { name, meta, avatar, href, onClick, menu } = account;

  const inner = collapsed ? (
    <span className="mx-auto flex h-9 w-9 items-center justify-center">{avatar}</span>
  ) : (
    <span className="flex w-full items-center gap-2.5 px-2 py-1.5">
      <span className="shrink-0">{avatar}</span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-sm font-semibold text-refresh-text">{name}</span>
        {meta && <span className="truncate text-xs text-refresh-muted-2">{meta}</span>}
      </span>
    </span>
  );

  const cls = `block w-full rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg hover:bg-refresh-surface`;

  // With a profile menu, delegate to the reusable ProfileMenu component.
  if (menu) {
    return (
      <ProfileMenu
        items={menu.items}
        theme={menu.theme}
        language={menu.language}
        placement="right-bottom"
        ariaLabel={collapsed ? `${name} — open profile menu` : undefined}
        buttonClassName={`${cls} w-full`}
      >
        {inner}
      </ProfileMenu>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}
