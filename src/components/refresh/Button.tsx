import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
};

const variantMap: Record<Variant, string> = {
  primary:
    'bg-refresh-text text-refresh-bg border-transparent hover:opacity-90 active:translate-y-px disabled:bg-refresh-surface disabled:text-refresh-muted-2',
  secondary:
    'bg-transparent text-refresh-muted border-refresh-surface hover:bg-refresh-surface hover:text-refresh-text',
  ghost:
    'bg-transparent text-refresh-muted border-transparent hover:bg-refresh-surface hover:text-refresh-text',
  danger:
    'bg-refresh-pink text-refresh-on-pastel border-transparent hover:opacity-90 active:translate-y-px',
};

const sizeMap: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    iconLeft,
    iconRight,
    fullWidth = false,
    className = '',
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] border font-semibold transition disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg ${variantMap[variant]} ${sizeMap[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {iconLeft && <span aria-hidden>{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span aria-hidden>{iconRight}</span>}
    </button>
  );
});
