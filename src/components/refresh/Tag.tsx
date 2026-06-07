type Tone = 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';

const toneMap: Record<Tone, string> = {
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
  surface: 'bg-refresh-surface text-refresh-text',
};

export type TagProps = {
  tone?: Tone;
  children: React.ReactNode;
  iconLeft?: React.ReactNode;
  className?: string;
};

export function Tag({ tone = 'lavender', children, iconLeft, className = '' }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneMap[tone]} ${className}`}
    >
      {iconLeft && <span aria-hidden>{iconLeft}</span>}
      {children}
    </span>
  );
}
