'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SegmentedControl } from './SegmentedControl';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'refresh-theme';

export type ThemeProviderProps = {
  children: ReactNode;
  /** Default theme on first render. Default: 'dark'. */
  defaultTheme?: Theme;
  /** Persist user choice to localStorage under this key. Set to null to disable persistence. */
  storageKey?: string | null;
  /** Wrapper element class name (added alongside the theme class). */
  className?: string;
  /** When false, ThemeProvider renders just the context — no wrapping div. Use this when you
   *  want to apply the theme class manually (e.g. on document.documentElement). */
  asWrapper?: boolean;
};

/**
 * Manages light/dark theme state and applies the `refresh-light` class to a wrapping div
 * whenever theme === 'light'. Children get the corresponding CSS-variable values.
 *
 * Usage:
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 *
 *   // Anywhere inside:
 *   const { theme, toggleTheme } = useTheme();
 */
export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = STORAGE_KEY,
  className = '',
  asWrapper = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Read persisted choice on mount.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') setThemeState(stored);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          /* ignore */
        }
      }
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  if (!asWrapper) {
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`${theme === 'light' ? 'refresh-light' : ''} ${className}`.trim()}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** Read + write the current theme. Throws if used outside <ThemeProvider>. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>.');
  }
  return ctx;
}

/** Same as useTheme, but returns null if no provider is mounted (graceful fallback). */
export function useOptionalTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

// ─────────── ThemeToggle ───────────

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export type ThemeToggleProps = {
  /** When provided, ThemeToggle works in controlled mode and ignores any ThemeProvider context. */
  value?: Theme;
  onChange?: (next: Theme) => void;
  size?: 'sm' | 'md';
  fill?: boolean;
  ariaLabel?: string;
  className?: string;
};

/**
 * Light/Dark segmented toggle. Self-wires to the nearest <ThemeProvider> by default.
 * Pass value+onChange explicitly to use it without a provider (controlled mode).
 */
export function ThemeToggle({
  value,
  onChange,
  size = 'sm',
  fill = true,
  ariaLabel = 'Theme',
  className = '',
}: ThemeToggleProps) {
  const ctx = useOptionalTheme();
  const resolvedValue = value ?? ctx?.theme ?? 'dark';
  const resolvedChange = onChange ?? ctx?.setTheme;

  return (
    <SegmentedControl
      ariaLabel={ariaLabel}
      size={size}
      fill={fill}
      value={resolvedValue}
      onChange={(next) => resolvedChange?.(next as Theme)}
      className={className}
      items={[
        { value: 'light', label: 'Light', icon: <SunIcon /> },
        { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
      ]}
    />
  );
}
