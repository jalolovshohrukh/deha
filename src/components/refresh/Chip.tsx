type ChipTone = 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';
type ChipSize = 'sm' | 'md';

const activeToneMap: Record<ChipTone, string> = {
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
  surface: 'bg-refresh-surface text-refresh-text ring-2 ring-refresh-text',
};

const sizeMap: Record<ChipSize, string> = {
  sm: 'gap-1 rounded-md px-2.5 py-1 text-xs',
  md: 'gap-1.5 rounded-lg px-4 py-2.5 text-sm',
};

export type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  iconLeft?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  tone?: ChipTone;
  count?: number | string;
  size?: ChipSize;
};

export function Chip({
  active = false,
  iconLeft,
  removable,
  onRemove,
  removeLabel = 'Remove',
  tone,
  count,
  size = 'md',
  className = '',
  children,
  type = 'button',
  disabled,
  ...rest
}: ChipProps) {
  const showRemove = removable || !!onRemove;

  const stateClasses = active
    ? tone
      ? activeToneMap[tone]
      : 'bg-refresh-surface text-refresh-text ring-2 ring-refresh-text'
    : 'bg-refresh-surface text-refresh-muted hover:bg-refresh-surface-3 hover:text-refresh-text';

  const countToneClass = active && tone && tone !== 'surface'
    ? 'text-refresh-on-pastel/60'
    : 'text-refresh-muted-2';

  return (
    <button
      type={type}
      data-active={active}
      disabled={disabled}
      className={`inline-flex items-center font-medium transition ${sizeMap[size]} ${stateClasses} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-refresh-surface disabled:hover:text-refresh-muted ${className}`}
      {...rest}
    >
      {iconLeft && <span aria-hidden className="inline-flex items-center">{iconLeft}</span>}
      <span>{children}</span>
      {count != null && (
        <span className={`tabular-nums ${countToneClass}`}>({count})</span>
      )}
      {showRemove && (onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={removeLabel}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRemove();
            }
          }}
          className="ml-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-current opacity-60 hover:opacity-100"
        >
          ×
        </span>
      ) : (
        <span
          aria-hidden
          className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-current opacity-60"
        >
          ×
        </span>
      ))}
    </button>
  );
}
