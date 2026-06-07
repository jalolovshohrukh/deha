import Link from 'next/link';
import { forwardRef } from 'react';

type BackVariant = 'default' | 'text' | 'icon';
type BackSize = 'sm' | 'md';

export type BackButtonProps = {
  /** When provided, renders as a Next <Link>. Omit to render a <button> and use onClick. */
  href?: string;
  /** Click handler (used when href is not provided). */
  onClick?: () => void;
  /** Label after the chevron. Defaults to "Back". Ignored for icon variant. */
  children?: React.ReactNode;
  variant?: BackVariant;
  size?: BackSize;
  /** Override the leading chevron — e.g. "‹" or a custom SVG. */
  chevron?: React.ReactNode;
  /** ARIA label — required for icon variant; falls back to "Go back" otherwise. */
  ariaLabel?: string;
  className?: string;
};

const sizeMap: Record<BackVariant, Record<BackSize, string>> = {
  default: {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
  },
  text: {
    sm: 'text-xs gap-1.5',
    md: 'text-sm gap-2',
  },
  icon: {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
  },
};

const variantClasses: Record<BackVariant, string> = {
  default:
    'inline-flex items-center justify-center rounded-lg border border-refresh-surface-3 bg-refresh-surface text-refresh-text font-medium transition hover:border-refresh-muted-2 hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40',
  text:
    'inline-flex items-center font-medium text-refresh-muted transition hover:text-refresh-text disabled:cursor-not-allowed disabled:opacity-40',
  icon:
    'inline-flex items-center justify-center rounded-full border border-refresh-surface-3 bg-refresh-surface text-refresh-text transition hover:border-refresh-muted-2 hover:bg-refresh-surface-3 disabled:cursor-not-allowed disabled:opacity-40',
};

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg';

export const BackButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, BackButtonProps>(
  function BackButton(
    {
      href,
      onClick,
      children = 'Back',
      variant = 'default',
      size = 'md',
      chevron = '←',
      ariaLabel,
      className = '',
    },
    ref
  ) {
    const isIcon = variant === 'icon';
    const classes = `${variantClasses[variant]} ${sizeMap[variant][size]} ${focusRing} ${className}`;
    const computedAriaLabel = ariaLabel ?? (isIcon ? 'Go back' : undefined);

    const content = isIcon ? (
      <span aria-hidden className="text-base leading-none">
        {chevron}
      </span>
    ) : (
      <>
        <span aria-hidden className="leading-none">
          {chevron}
        </span>
        <span>{children}</span>
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-label={computedAriaLabel}
          className={classes}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        aria-label={computedAriaLabel}
        className={classes}
      >
        {content}
      </button>
    );
  }
);
