export type PaymentMethodButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  /**
   * Real logo URL (simpleicons.org, your CDN, etc.). When provided, the tile
   * shows this image instead of `icon` or the initial fallback.
   */
  logoSrc?: string;
  /**
   * Custom icon node (SVG, image, glyph). Used when `logoSrc` is not set.
   */
  icon?: React.ReactNode;
  selected?: boolean;
};

/**
 * Square payment-method button for the payment selector. Tile renders, in
 * priority order: real logo > custom icon > initial letter of `label` (so
 * "Cash" → "C"). No emoji defaults.
 */
export function PaymentMethodButton({
  label,
  logoSrc,
  icon,
  selected = false,
  className = '',
  type = 'button',
  ...rest
}: PaymentMethodButtonProps) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';

  let glyph: React.ReactNode;
  if (logoSrc) {
    glyph = (
      <img
        src={logoSrc}
        alt=""
        aria-hidden
        className="h-7 w-7 object-contain"
      />
    );
  } else if (icon) {
    glyph = icon;
  } else {
    glyph = <span className="text-base font-bold leading-none">{initial}</span>;
  }

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`group flex flex-col items-center gap-1.5 ${className}`}
      {...rest}
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-[10px] border transition ${
          selected
            ? 'border-refresh-text bg-refresh-surface text-refresh-text'
            : 'border-refresh-surface text-refresh-muted-2 group-hover:border-refresh-surface-3 group-hover:text-refresh-muted'
        }`}
      >
        {glyph}
      </span>
      <span
        className={`text-[10px] font-medium transition ${
          selected ? 'text-refresh-text' : 'text-refresh-muted-2'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function PaymentMethodGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3">{children}</div>;
}
