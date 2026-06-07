type Tone = 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';

const toneMap: Record<Tone, string> = {
  sage: 'bg-refresh-sage text-refresh-on-pastel',
  lavender: 'bg-refresh-lavender text-refresh-on-pastel',
  blue: 'bg-refresh-blue text-refresh-on-pastel',
  pink: 'bg-refresh-pink text-refresh-on-pastel',
  periwinkle: 'bg-refresh-periwinkle text-refresh-on-pastel',
  surface: 'bg-refresh-surface text-refresh-text',
};

export type CategoryCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  count?: number;
  icon?: React.ReactNode;
  tone?: Tone;
  active?: boolean;
};

export function CategoryCard({
  name,
  count,
  icon,
  tone = 'surface',
  active = false,
  className = '',
  type = 'button',
  ...rest
}: CategoryCardProps) {
  return (
    <button
      type={type}
      className={`group flex min-h-[110px] w-full flex-col justify-between rounded-xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
        toneMap[tone]
      } ${active ? 'ring-2 ring-refresh-text ring-offset-2 ring-offset-refresh-bg' : ''} ${className}`}
      {...rest}
    >
      {icon && <span className="text-xl opacity-70" aria-hidden>{icon}</span>}
      <div>
        <p className="text-base font-semibold">{name}</p>
        {count !== undefined && (
          <p className={`mt-0.5 text-xs ${tone === 'surface' ? 'text-refresh-muted-2' : 'text-refresh-on-pastel/60'}`}>
            {count} items
          </p>
        )}
      </div>
    </button>
  );
}
