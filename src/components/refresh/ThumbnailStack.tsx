export type ThumbnailItem = {
  /** Image src. When omitted, renders a tonal placeholder square. */
  src?: string;
  alt?: string;
  /** Optional placeholder tone when `src` is missing. */
  placeholderTone?: 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';
};

export type ThumbnailStackProps = {
  items: ThumbnailItem[];
  /** Maximum tiles to render before collapsing into a "+N" overflow chip. Default 3. */
  max?: number;
  /** Tile edge length. `sm` = 28px, `md` = 36px, `lg` = 48px. Default 'sm'. */
  size?: 'sm' | 'md' | 'lg';
  /** When true, tiles overlap horizontally by ~30%. Default false (gapped). */
  overlap?: boolean;
  className?: string;
};

const sizeMap: Record<NonNullable<ThumbnailStackProps['size']>, number> = {
  sm: 28,
  md: 36,
  lg: 48,
};

const placeholderToneMap: Record<NonNullable<ThumbnailItem['placeholderTone']>, string> = {
  sage: 'bg-refresh-sage',
  lavender: 'bg-refresh-lavender',
  blue: 'bg-refresh-blue',
  pink: 'bg-refresh-pink',
  periwinkle: 'bg-refresh-periwinkle',
  surface: 'bg-refresh-surface-3',
};

/**
 * Square-tile equivalent of `<AvatarGroup>`. Renders product or asset thumbnails
 * with a "+N" overflow chip when the list exceeds `max`. Tiles use `rounded-xl`
 * and `bg-refresh-surface-3` placeholders when no image is provided.
 *
 * Use this for activity rows, line-item summaries, or anywhere a compact stack
 * of squares communicates "these N items".
 */
export function ThumbnailStack({
  items,
  max = 3,
  size = 'sm',
  overlap = false,
  className = '',
}: ThumbnailStackProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  const px = sizeMap[size];

  const itemClass = `inline-flex shrink-0 items-center justify-center rounded-xl ring-2 ring-refresh-bg ${
    overlap ? '-ml-2 first:ml-0' : ''
  }`;

  return (
    <div className={`flex items-center ${overlap ? '' : 'gap-1.5'} ${className}`}>
      {visible.map((it, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        it.src ? (
          <img
            key={i}
            src={it.src}
            alt={it.alt ?? ''}
            width={px}
            height={px}
            className={`${itemClass} object-cover`}
            style={{ width: px, height: px }}
          />
        ) : (
          <span
            key={i}
            aria-label={it.alt ?? undefined}
            role={it.alt ? 'img' : undefined}
            aria-hidden={it.alt ? undefined : true}
            className={`${itemClass} ${placeholderToneMap[it.placeholderTone ?? 'surface']}`}
            style={{ width: px, height: px }}
          />
        )
      ))}
      {overflow > 0 && (
        <span
          className={`${itemClass} bg-refresh-surface-3 text-xs font-semibold text-refresh-muted`}
          style={{ width: px, height: px }}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
