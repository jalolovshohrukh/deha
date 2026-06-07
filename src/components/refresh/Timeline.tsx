type Tone = 'sage' | 'lavender' | 'blue' | 'pink' | 'periwinkle' | 'surface';

const dotToneMap: Record<Tone, string> = {
  sage: 'bg-refresh-sage',
  lavender: 'bg-refresh-lavender',
  blue: 'bg-refresh-blue',
  pink: 'bg-refresh-pink',
  periwinkle: 'bg-refresh-periwinkle',
  surface: 'bg-refresh-surface-3',
};

export type TimelineEvent = {
  id: string;
  /** Headline / event name. */
  title: React.ReactNode;
  /** Sub-line — formatted timestamp, actor, or short description. */
  meta?: React.ReactNode;
  /** Body content rendered below the meta line. */
  children?: React.ReactNode;
  /** Tints the dot. Default 'surface'. */
  tone?: Tone;
  /** Optional icon rendered inside the dot (overrides the default solid dot). */
  icon?: React.ReactNode;
};

export type TimelineProps = {
  events: TimelineEvent[];
  className?: string;
};

/**
 * Vertical event sequence — order history, audit log, activity feed.
 * Renders a left-side rail with tone-tinted dots; events fall to the right.
 *
 * Pair with `OrderCard` for an order detail view, or with a `Sheet` for an
 * audit-log drawer.
 */
export function Timeline({ events, className = '' }: TimelineProps) {
  if (events.length === 0) return null;

  return (
    <ol className={`relative flex flex-col ${className}`}>
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const tone = event.tone ?? 'surface';
        return (
          <li
            key={event.id}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Rail line + dot */}
            <div className="relative flex flex-col items-center">
              <span
                className={`relative z-10 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-refresh-bg ${dotToneMap[tone]}`}
              >
                {event.icon && (
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center text-[8px] text-refresh-on-pastel">
                    {event.icon}
                  </span>
                )}
              </span>
              {!isLast && (
                <span aria-hidden className="absolute left-1/2 top-3 -translate-x-1/2 h-[calc(100%-0.75rem)] w-px bg-refresh-line" />
              )}
            </div>

            {/* Body */}
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-semibold text-refresh-text">{event.title}</p>
              {event.meta && (
                <p className="mt-0.5 text-xs text-refresh-muted-2">{event.meta}</p>
              )}
              {event.children && (
                <div className="mt-2 text-sm leading-relaxed text-refresh-muted">
                  {event.children}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
