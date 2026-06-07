type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<PriceSize, { primary: string; original: string; savings: string }> = {
  sm: { primary: 'text-sm', original: 'text-xs', savings: 'text-[10px]' },
  md: { primary: 'text-base', original: 'text-xs', savings: 'text-[11px]' },
  lg: { primary: 'text-xl', original: 'text-sm', savings: 'text-xs' },
  xl: { primary: 'text-3xl', original: 'text-base', savings: 'text-xs' },
};

export type PriceDisplayProps = {
  /** Current price as a number — formatted with the locale + currency. */
  amount: number;
  /** Original (pre-discount) price — when set, renders strikethrough above the current price. */
  originalAmount?: number;
  /** ISO 4217 currency code. Default 'USD'. */
  currency?: string;
  /** Locale string for Intl.NumberFormat. Default 'en-US'. */
  locale?: string;
  size?: PriceSize;
  /** Show savings label like "Save $5" when originalAmount > amount. */
  showSavings?: boolean;
  /** Layout: stacked (default) or inline. */
  orientation?: 'stacked' | 'inline';
  className?: string;
};

/**
 * Currency-formatted price with optional strikethrough sale indicator.
 *
 * @example
 *   <PriceDisplay amount={29.99} originalAmount={49.99} showSavings />
 */
export function PriceDisplay({
  amount,
  originalAmount,
  currency = 'USD',
  locale = 'en-US',
  size = 'md',
  showSavings = false,
  orientation = 'stacked',
  className = '',
}: PriceDisplayProps) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const dims = sizeMap[size];
  const isOnSale = originalAmount != null && originalAmount > amount;
  const savings = isOnSale ? originalAmount - amount : 0;

  if (orientation === 'inline') {
    return (
      <span className={`inline-flex items-baseline gap-2 ${className}`}>
        <span className={`font-bold tabular-nums text-refresh-text ${dims.primary}`}>
          {formatter.format(amount)}
        </span>
        {isOnSale && (
          <span className={`font-medium tabular-nums text-refresh-muted-2 line-through ${dims.original}`}>
            {formatter.format(originalAmount!)}
          </span>
        )}
        {isOnSale && showSavings && (
          <span
            className={`rounded-md bg-refresh-pink/20 px-1.5 py-0.5 font-semibold tabular-nums text-refresh-pink ${dims.savings}`}
          >
            Save {formatter.format(savings)}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      {isOnSale && (
        <span className={`font-medium tabular-nums text-refresh-muted-2 line-through ${dims.original}`}>
          {formatter.format(originalAmount!)}
        </span>
      )}
      <span className={`font-bold tabular-nums text-refresh-text ${dims.primary}`}>
        {formatter.format(amount)}
      </span>
      {isOnSale && showSavings && (
        <span
          className={`mt-0.5 rounded-md bg-refresh-pink/20 px-1.5 py-0.5 font-semibold tabular-nums text-refresh-pink ${dims.savings}`}
        >
          Save {formatter.format(savings)}
        </span>
      )}
    </span>
  );
}
