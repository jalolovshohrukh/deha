import { Kbd } from './Kbd';

type Tone = 'surface' | 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle';

const toneMap: Record<Tone, string> = {
  surface: 'bg-refresh-surface-3 text-refresh-text',
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
};

export type PaymentRowProps = {
  /**
   * Real logo URL (e.g. simpleicons.org for Visa / Apple Pay / etc.). When
   * provided, the leading tile shows this image. Highest priority.
   */
  logoSrc?: string;
  /**
   * Custom icon node (SVG, image, emoji). Use this for one-off branding when
   * `logoSrc` doesn't fit. Mid-priority.
   */
  icon?: React.ReactNode;
  /** Tile background tone — surface (default) or one of 5 pastels. */
  tone?: Tone;
  name: string;
  shortcut?: string;
  onAdd?: () => void;
  /** Disables the row (visual + non-interactive). */
  disabled?: boolean;
  className?: string;
};

/**
 * Wide list row for payment-method pickers. Leading tile renders one of:
 *
 *   1. **Real logo** (`logoSrc`) — fits a Visa / Apple Pay / Mastercard SVG
 *   2. **Custom icon** (`icon`) — for one-off branding
 *   3. **Initial fallback** — first letter of `name`, automatic when neither is set
 *
 * No emoji defaults — the system stays brand-neutral and prints clean on
 * any platform.
 */
export function PaymentRow({
  logoSrc,
  icon,
  tone = 'surface',
  name,
  shortcut,
  onAdd,
  disabled = false,
  className = '',
}: PaymentRowProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      aria-label={`Pay with ${name}`}
      className={`group flex w-full items-center gap-3.5 rounded-xl border border-refresh-line bg-refresh-surface px-4 py-3 text-left transition hover:border-refresh-muted-2 hover:bg-refresh-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-refresh-line disabled:hover:bg-refresh-surface ${className}`}
    >
      <PaymentTile name={name} logoSrc={logoSrc} icon={icon} tone={tone} size="md" />
      <span className="flex-1 text-[15px] font-semibold text-refresh-text">{name}</span>
      {shortcut && <Kbd size="sm">{shortcut}</Kbd>}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

/**
 * Shared leading-tile renderer for PaymentRow + PaymentMethodButton. Picks
 * the best display in priority order: real logo > custom icon > initial.
 */
export function PaymentTile({
  name,
  logoSrc,
  icon,
  tone = 'surface',
  size = 'md',
}: {
  name: string;
  logoSrc?: string;
  icon?: React.ReactNode;
  tone?: Tone;
  size?: 'sm' | 'md';
}) {
  const dimensions =
    size === 'sm'
      ? 'h-9 w-11 text-[13px]'
      : 'h-10 w-12 text-[15px]';
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  let inner: React.ReactNode;
  if (logoSrc) {
    inner = (
      <img
        src={logoSrc}
        alt=""
        aria-hidden
        className="h-full w-full object-contain p-1"
      />
    );
  } else if (icon) {
    inner = icon;
  } else {
    inner = <span className="font-bold leading-none">{initial}</span>;
  }

  return (
    <span
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg font-bold leading-none ${toneMap[tone]} ${dimensions}`}
    >
      {inner}
    </span>
  );
}
