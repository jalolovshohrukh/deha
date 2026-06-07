type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof JSX.IntrinsicElements;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
};

const padMap = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' } as const;

export function Card({
  as: Tag = 'div',
  padding = 'md',
  elevated = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    // @ts-expect-error - dynamic tag
    <Tag
      className={`bg-refresh-surface text-refresh-text rounded-xl ${padMap[padding]} ${elevated ? 'refresh-shadow-soft' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-3 flex items-start justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-base font-semibold leading-tight text-refresh-text ${className}`}>{children}</h3>;
}

export function CardSubtitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs text-refresh-muted-2 ${className}`}>{children}</p>
  );
}
