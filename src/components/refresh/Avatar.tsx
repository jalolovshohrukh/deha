import Image from 'next/image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarTone = 'surface' | 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle';
type AvatarStatus = 'online' | 'busy' | 'offline';

export type AvatarProps = {
  name?: string;
  src?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  status?: AvatarStatus;
  square?: boolean;
  className?: string;
};

const sizeMap: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  xs: { box: 'h-6 w-6', text: 'text-[0.6rem]', dot: 'h-1.5 w-1.5 -bottom-0 -right-0' },
  sm: { box: 'h-7 w-7', text: 'text-[0.65rem]', dot: 'h-2 w-2 -bottom-0 -right-0' },
  md: { box: 'h-9 w-9', text: 'text-xs', dot: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5' },
  lg: { box: 'h-12 w-12', text: 'text-sm', dot: 'h-3 w-3 -bottom-0.5 -right-0.5' },
  xl: { box: 'h-16 w-16', text: 'text-lg', dot: 'h-3.5 w-3.5 -bottom-1 -right-1' },
};

const toneMap: Record<AvatarTone, string> = {
  surface: 'bg-refresh-surface text-refresh-text',
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
};

const statusMap: Record<AvatarStatus, string> = {
  online: 'bg-refresh-sage',
  busy: 'bg-refresh-pink',
  offline: 'bg-refresh-muted-2',
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name = '',
  src,
  size = 'md',
  tone = 'lavender',
  status,
  square = false,
  className = '',
}: AvatarProps) {
  const dims = sizeMap[size];
  const radius = square ? 'rounded-xl' : 'rounded-full';
  const initials = initialsFrom(name);

  return (
    <span className={`relative inline-flex ${dims.box} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={name || 'Avatar'}
          fill
          sizes="64px"
          className={`object-cover ${radius}`}
        />
      ) : (
        <span
          aria-label={name || 'Avatar'}
          className={`flex h-full w-full items-center justify-center font-semibold ${radius} ${toneMap[tone]} ${dims.text}`}
        >
          {initials}
        </span>
      )}
      {status && (
        <span
          aria-hidden
          className={`absolute ${dims.dot} ${statusMap[status]} ${radius} ring-2 ring-refresh-bg`}
        />
      )}
    </span>
  );
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
}: {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
}) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean) as React.ReactElement[];
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  const dims = sizeMap[size];

  return (
    <span className="inline-flex items-center -space-x-2">
      {visible.map((child, i) => (
        <span key={i} className="ring-2 ring-refresh-bg rounded-full">
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={`inline-flex ${dims.box} items-center justify-center rounded-full bg-refresh-surface text-refresh-muted font-medium ${dims.text} ring-2 ring-refresh-bg`}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

export function EmployeeChip({ name, tone = 'lavender' }: { name: string; tone?: AvatarTone }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-refresh-surface pr-3 pl-1 py-1">
      <Avatar name={name} tone={tone} size="sm" />
      <span className="text-xs font-medium text-refresh-text">{name}</span>
    </span>
  );
}
