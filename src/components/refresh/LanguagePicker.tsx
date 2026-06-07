'use client';

import { useEffect, useRef, useState } from 'react';

export type LanguageOption = {
  value: string;
  label: string;
  /**
   * Country-code override for the flag (e.g. `'us'`, `'gb'`).
   * Two-letter ISO 3166-1 alpha-2. Omit to fall back to the built-in
   * language → country map. Pass an emoji string (e.g. `'🇺🇸'`) to render
   * an emoji instead of the SVG flag — useful when the CDN is unreachable.
   */
  flag?: string;
};

export type LanguagePickerProps = {
  value: string;
  options: LanguageOption[];
  onChange: (next: string) => void;
  size?: 'sm' | 'md';
  /** Where the dropdown panel opens. Default 'bottom-start'. */
  placement?: 'bottom-start' | 'bottom-end';
  /** Round flags vs the default 4x3 rectangles. Default false. */
  roundFlags?: boolean;
  ariaLabel?: string;
  className?: string;
};

/**
 * Default language → ISO 3166-1 alpha-2 country code mapping. Used when an
 * option doesn't pass an explicit `flag`. Override per option for ambiguous
 * cases (e.g. `{ value: 'en', flag: 'us' }`).
 */
const LANG_TO_COUNTRY: Record<string, string> = {
  en: 'gb',
  'en-us': 'us',
  'en-gb': 'gb',
  'en-au': 'au',
  'en-ca': 'ca',
  ru: 'ru',
  uk: 'ua',
  tj: 'tj',
  uz: 'uz',
  kk: 'kz',
  ky: 'kg',
  tr: 'tr',
  ar: 'sa',
  fa: 'ir',
  zh: 'cn',
  'zh-tw': 'tw',
  'zh-hk': 'hk',
  ja: 'jp',
  ko: 'kr',
  es: 'es',
  'es-mx': 'mx',
  fr: 'fr',
  'fr-ca': 'ca',
  de: 'de',
  it: 'it',
  pt: 'pt',
  'pt-br': 'br',
  nl: 'nl',
  pl: 'pl',
  sv: 'se',
  no: 'no',
  da: 'dk',
  fi: 'fi',
  hi: 'in',
  bn: 'bd',
  vi: 'vn',
  th: 'th',
  id: 'id',
  ms: 'my',
  he: 'il',
  cs: 'cz',
  sk: 'sk',
  hu: 'hu',
  ro: 'ro',
  el: 'gr',
  bg: 'bg',
  hr: 'hr',
  sr: 'rs',
};

/** Detect if a string looks like an emoji (regional-indicator pair). */
function looksLikeEmoji(s: string): boolean {
  // Regional indicator symbols are U+1F1E6..U+1F1FF; flag emoji = 2 of them.
  return /\p{Regional_Indicator}/u.test(s);
}

type FlagDisplay =
  | { kind: 'img'; cc: string }
  | { kind: 'emoji'; text: string }
  | null;

function flagFor(opt: LanguageOption): FlagDisplay {
  const f = opt.flag;
  if (f) {
    if (looksLikeEmoji(f)) return { kind: 'emoji', text: f };
    if (/^[a-z]{2}$/i.test(f)) return { kind: 'img', cc: f.toLowerCase() };
    // Anything else (URL, custom string) — render as text.
    return { kind: 'emoji', text: f };
  }
  const cc = LANG_TO_COUNTRY[opt.value.toLowerCase()];
  if (!cc) return null;
  return { kind: 'img', cc };
}

/**
 * Compact language selector with a Refresh-themed dropdown panel and real
 * SVG flags from `lipis/flag-icons` (served via jsDelivr CDN — no npm
 * install, no bundle size impact). Built-in flag mapping for ~40 common
 * locales; pass `flag` on an option to override with a country code or an
 * emoji string.
 */
export function LanguagePicker({
  value,
  options,
  onChange,
  size = 'md',
  placement = 'bottom-start',
  roundFlags = false,
  ariaLabel = 'Language',
  className = '',
}: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const padding = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';
  const panelPosition = placement === 'bottom-end' ? 'right-0' : 'left-0';

  return (
    <div ref={wrapperRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-refresh-surface font-medium text-refresh-text transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text/20 ${
          open
            ? 'border-refresh-text ring-2 ring-refresh-text/20'
            : 'border-refresh-surface-3 hover:border-refresh-muted-2'
        } ${padding}`}
      >
        <span className="flex items-center gap-2 truncate">
          {current && <FlagSlot flag={flagFor(current)} label={current.label} round={roundFlags} />}
          <span className="truncate">{current?.label ?? value}</span>
        </span>
        <ChevronIcon
          className={`shrink-0 text-refresh-muted-2 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={`absolute top-full z-30 mt-2 ${panelPosition} min-w-full overflow-hidden rounded-xl border border-refresh-line bg-refresh-surface-2 p-1 refresh-shadow-soft`}
          style={{ animation: 'navrail-flyout-in 150ms ease-out' }}
        >
          <ul className="flex flex-col">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="menuitem"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text ${
                      active
                        ? 'bg-refresh-surface text-refresh-text font-semibold'
                        : 'text-refresh-text hover:bg-refresh-surface'
                    }`}
                  >
                    <FlagSlot flag={flagFor(opt)} label={opt.label} round={roundFlags} />
                    <span className="flex-1 truncate">{opt.label}</span>
                    {active && <CheckIcon className="text-refresh-blue" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────── Subcomponents ─────────── */

function FlagSlot({
  flag,
  label,
  round,
}: {
  flag: FlagDisplay;
  label: string;
  round: boolean;
}) {
  if (!flag) return <span aria-hidden className="inline-block w-5 shrink-0" />;
  if (flag.kind === 'emoji') {
    return (
      <span aria-hidden className="text-base leading-none">
        {flag.text}
      </span>
    );
  }
  return <FlagIcon code={flag.cc} label={label} round={round} />;
}

/**
 * Real SVG flag from lipis/flag-icons via jsDelivr.
 * - 4x3 ratio rectangles by default → h-3.5 w-5 (14×20px)
 * - 1x1 ratio (square) used when `round` is true → rendered as a circle
 *
 * Aria-hidden because the language label provides the accessible name.
 */
function FlagIcon({
  code,
  label,
  round,
}: {
  code: string;
  label: string;
  round: boolean;
}) {
  const ratio = round ? '1x1' : '4x3';
  const sizeCls = round
    ? 'h-4 w-4 rounded-full'
    : 'h-3.5 w-5 rounded-[2px]';
  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/${ratio}/${code}.svg`}
      alt=""
      aria-hidden
      title={label}
      width={round ? 16 : 20}
      height={round ? 16 : 14}
      loading="lazy"
      className={`shrink-0 object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.06)] ${sizeCls}`}
    />
  );
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
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
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
