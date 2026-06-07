type LogoSize = 'sm' | 'md' | 'lg';

const markSizeMap: Record<LogoSize, string> = {
  sm: 'h-6 w-6 text-[11px] rounded-[6px]',
  md: 'h-7 w-7 text-sm rounded-[7px]',
  lg: 'h-9 w-9 text-base rounded-[9px]',
};

const wordSizeMap: Record<LogoSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const gapMap: Record<LogoSize, string> = {
  sm: 'gap-2',
  md: 'gap-2.5',
  lg: 'gap-3',
};

export type LogoMarkProps = {
  size?: LogoSize;
  className?: string;
};

/** The Refresh mark on its own — a rounded "R" tile in white-on-dark. */
export function LogoMark({ size = 'md', className = '' }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex select-none items-center justify-center bg-refresh-text font-extrabold tracking-tight text-refresh-bg ${markSizeMap[size]} ${className}`}
    >
      R
    </span>
  );
}

export type LogoProps = {
  size?: LogoSize;
  /** Show the "Refresh" wordmark next to the mark. Default: true. */
  withWordmark?: boolean;
  /** Override the wordmark text. */
  brand?: string;
  className?: string;
};

/** Mark + wordmark, the canonical brand block used in headers and footers. */
export function Logo({
  size = 'md',
  withWordmark = true,
  brand = 'Refresh',
  className = '',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center ${gapMap[size]} ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className={`font-bold text-refresh-text ${wordSizeMap[size]}`}>{brand}</span>
      )}
    </span>
  );
}
