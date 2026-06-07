'use client';

import { useOptionalTheme, type Theme } from './Theme';

export type ThemeToggleButtonProps = {
  /** Controlled mode — pass value+onChange to use without a ThemeProvider. */
  value?: Theme;
  onChange?: (next: Theme) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeMap: Record<NonNullable<ThemeToggleButtonProps['size']>, { box: string; icon: number }> = {
  sm: { box: 'h-8 w-8', icon: 14 },
  md: { box: 'h-10 w-10', icon: 16 },
  lg: { box: 'h-11 w-11', icon: 18 },
};

/**
 * Circular sun/moon theme toggle. Drop anywhere in the layout — most commonly
 * fixed at top-right of the page header.
 *
 * Auto-wires to the nearest <ThemeProvider> by default. Pass value+onChange
 * to use it controlled with no provider.
 *
 * The icon shown is the one for the OPPOSITE theme — clicking switches to it.
 * (Standard pattern: in dark mode you see ☀ to switch to light; in light you see ☾.)
 */
export function ThemeToggleButton({
  value,
  onChange,
  size = 'md',
  className = '',
}: ThemeToggleButtonProps) {
  const ctx = useOptionalTheme();
  const theme = value ?? ctx?.theme ?? 'dark';
  const setTheme = onChange ?? ctx?.setTheme;

  const dims = sizeMap[size];
  const isDark = theme === 'dark';
  const targetTheme: Theme = isDark ? 'light' : 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme?.(targetTheme)}
      className={`group relative inline-flex ${dims.box} items-center justify-center overflow-hidden rounded-full border border-refresh-line bg-refresh-surface-2 text-refresh-text transition hover:border-refresh-muted-2 hover:bg-refresh-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${className}`}
    >
      <span
        aria-hidden
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
          isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
        }`}
      >
        <SunIcon size={dims.icon} />
      </span>
      <span
        aria-hidden
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
          isDark ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
        }`}
      >
        <MoonIcon size={dims.icon} />
      </span>
    </button>
  );
}

function SunIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
