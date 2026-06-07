'use client';

type AccentTone = 'lavender' | 'sage' | 'blue' | 'pink' | 'periwinkle';

const accentTextMap: Record<AccentTone, string> = {
  lavender: 'text-refresh-lavender',
  sage: 'text-refresh-sage',
  blue: 'text-refresh-blue',
  pink: 'text-refresh-pink',
  periwinkle: 'text-refresh-periwinkle',
};

const accentBorderMap: Record<AccentTone, string> = {
  lavender: 'border-refresh-lavender',
  sage: 'border-refresh-sage',
  blue: 'border-refresh-blue',
  pink: 'border-refresh-pink',
  periwinkle: 'border-refresh-periwinkle',
};

export type ProductCardProps = {
  name: string;
  price: string;
  flow?: string;
  qty?: number;
  accent?: AccentTone;
  onIncrement?: () => void;
  onDecrement?: () => void;
  className?: string;
};

export function ProductCard({
  name,
  price,
  flow = 'Orders → Kitchen',
  qty = 0,
  accent = 'lavender',
  onIncrement,
  onDecrement,
  className = '',
}: ProductCardProps) {
  const inCart = qty > 0;
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl bg-refresh-surface p-3.5 border-[1.5px] transition ${
        inCart ? accentBorderMap[accent] : 'border-transparent hover:border-refresh-surface-3'
      } ${className}`}
    >
      <p className={`text-[11px] font-medium ${inCart ? accentTextMap[accent] : 'text-refresh-muted-2'}`}>
        {flow}
      </p>
      <div>
        <p className="text-sm font-semibold text-refresh-text">{name}</p>
        <p className="mt-0.5 text-[13px] text-refresh-muted-2">{price}</p>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onDecrement}
          aria-label="Decrease"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-refresh-surface-3 text-refresh-muted-2 transition hover:border-refresh-text hover:text-refresh-text"
        >
          −
        </button>
        <span className="text-sm font-semibold text-refresh-text tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label="Increase"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-refresh-text text-refresh-text transition hover:bg-refresh-text hover:text-refresh-bg"
        >
          +
        </button>
      </div>
    </div>
  );
}
