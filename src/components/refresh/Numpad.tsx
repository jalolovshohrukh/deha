'use client';

type NumpadKey = string;

export type NumpadProps = {
  onKey?: (key: NumpadKey) => void;
  keys?: NumpadKey[];
  className?: string;
};

const defaultKeys: NumpadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '×'];

export function Numpad({ onKey, keys = defaultKeys, className = '' }: NumpadProps) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {keys.map((k) => {
        const isDelete = k === '×' || k === '⌫';
        return (
          <button
            key={k}
            type="button"
            onClick={() => onKey?.(k)}
            className={`flex h-14 items-center justify-center rounded-[10px] bg-refresh-surface text-lg font-bold transition hover:bg-refresh-surface-3 ${
              isDelete ? 'text-refresh-pink' : 'text-refresh-text'
            }`}
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}
