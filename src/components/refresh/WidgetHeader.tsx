import { Icon } from './Icon';

export type WidgetHeaderProps = {
  title: React.ReactNode;
  /** Optional secondary line under the title. */
  subtitle?: React.ReactNode;
  /** Show a "::" drag-handle glyph at the right (purely cosmetic; consumer wires drag behavior). */
  draggable?: boolean;
  /** Trailing slot — a "↗" link, a `<Button>`, a kebab `<RowActions>`, etc. */
  trailing?: React.ReactNode;
  /** Heading level. Defaults to `h3`. */
  as?: 'h2' | 'h3' | 'h4';
  className?: string;
};

/**
 * Small header chrome shared by every dashboard widget — a title + optional
 * drag handle + optional trailing slot. Stacks above any `<Card>` body or plain
 * surface; has no opinion on the surrounding container.
 *
 * For page-level chrome (big title + breadcrumb + primary action), use
 * `<PageHeader>` instead.
 */
export function WidgetHeader({
  title,
  subtitle,
  draggable = false,
  trailing,
  as = 'h3',
  className = '',
}: WidgetHeaderProps) {
  const Heading = as;
  return (
    <header className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <Heading className="truncate text-sm font-semibold text-refresh-text">{title}</Heading>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-refresh-muted-2">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {draggable && (
          <span
            aria-hidden
            className="cursor-grab text-refresh-muted-2 transition hover:text-refresh-muted active:cursor-grabbing"
            title="Drag to rearrange"
          >
            <Icon name="grip-vertical" size={14} />
          </span>
        )}
      </div>
    </header>
  );
}
