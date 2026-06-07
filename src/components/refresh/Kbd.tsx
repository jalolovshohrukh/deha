type KbdSize = 'sm' | 'md' | 'lg';
type KbdTone = 'default' | 'active';

const sizeMap: Record<KbdSize, string> = {
  sm: 'h-6 min-w-[24px] px-1.5 text-[11px]',
  md: 'h-7 min-w-[28px] px-2 text-xs',
  lg: 'h-8 min-w-[32px] px-2.5 text-sm',
};

const toneMap: Record<KbdTone, string> = {
  default:
    'bg-refresh-surface text-refresh-text border-refresh-muted-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_rgba(0,0,0,0.55)]',
  active:
    'bg-refresh-text text-refresh-bg border-refresh-text shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_2px_rgba(255,255,255,0.1)]',
};

export type KbdProps = {
  children: React.ReactNode;
  size?: KbdSize;
  tone?: KbdTone;
  className?: string;
};

export function Kbd({ children, size = 'md', tone = 'default', className = '' }: KbdProps) {
  return (
    <kbd
      className={`inline-flex items-center justify-center rounded-md border font-mono font-semibold tracking-tight ${sizeMap[size]} ${toneMap[tone]} ${className}`}
    >
      {children}
    </kbd>
  );
}

export type KbdComboProps = {
  /** Keys to render. Strings become Kbd chips; React nodes pass through verbatim. */
  keys: Array<React.ReactNode>;
  /** Separator rendered between keys (default '+'). */
  separator?: React.ReactNode;
  size?: KbdSize;
  tone?: KbdTone;
  className?: string;
};

/** Render a chord — keys held together, joined by a `+` (or custom) separator. */
export function KbdCombo({
  keys,
  separator = '+',
  size = 'md',
  tone = 'default',
  className = '',
}: KbdComboProps) {
  return (
    <span className={`inline-flex items-center gap-1 align-middle ${className}`}>
      {keys.map((k, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {typeof k === 'string' || typeof k === 'number' ? (
            <Kbd size={size} tone={tone}>{k}</Kbd>
          ) : (
            k
          )}
          {i < keys.length - 1 && (
            <span aria-hidden className="text-[11px] font-medium text-refresh-muted-2">
              {separator}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

export type KbdSequenceProps = {
  /** Keys pressed in order, e.g. `['G', 'H']` for "g then h". */
  keys: Array<React.ReactNode>;
  /** Separator label between keys (default 'then'). */
  separator?: React.ReactNode;
  size?: KbdSize;
  tone?: KbdTone;
  className?: string;
};

/** Render a sequence — keys pressed one after another (vim-style chords). */
export function KbdSequence({
  keys,
  separator = 'then',
  size = 'md',
  tone = 'default',
  className = '',
}: KbdSequenceProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 align-middle ${className}`}>
      {keys.map((k, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {typeof k === 'string' || typeof k === 'number' ? (
            <Kbd size={size} tone={tone}>{k}</Kbd>
          ) : (
            k
          )}
          {i < keys.length - 1 && (
            <span aria-hidden className="text-[10px] font-medium uppercase tracking-wider text-refresh-muted-2">
              {separator}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
