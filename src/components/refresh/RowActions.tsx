'use client';

type IconProps = { size?: number; className?: string };

export function PencilIcon({ size = 16, className = '' }: IconProps) {
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
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function CopyIcon({ size = 16, className = '' }: IconProps) {
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
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function TrashIcon({ size = 16, className = '' }: IconProps) {
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
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export type RowAction = {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** 'danger' tints the button pink (matches refresh-pink semantic). */
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

export function RowActions({
  actions,
  className = '',
}: {
  actions: RowAction[];
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-end gap-0.5 ${className}`}>
      {actions.map((a, i) => (
        <button
          key={i}
          type="button"
          onClick={a.onClick}
          aria-label={a.label}
          disabled={a.disabled}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg disabled:cursor-not-allowed disabled:opacity-40 ${
            a.tone === 'danger'
              ? 'text-refresh-pink hover:bg-refresh-pink/15 hover:text-refresh-pink'
              : 'text-refresh-muted-2 hover:bg-refresh-surface-3 hover:text-refresh-text'
          }`}
        >
          {a.icon}
        </button>
      ))}
    </div>
  );
}
