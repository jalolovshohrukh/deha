export type ComboboxResult = {
  id: string;
  image?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailingTop?: React.ReactNode;
  trailingBottom?: React.ReactNode;
};

export type ComboboxProps = {
  results: ComboboxResult[];
  emptyMessage?: string;
  className?: string;
};

export function Combobox({
  results,
  emptyMessage = 'No results',
  className = '',
}: ComboboxProps) {
  return (
    <div
      className={`refresh-scroll max-h-[420px] overflow-auto rounded-2xl bg-refresh-bg p-1.5 shadow-2xl ring-1 ring-refresh-line ${className}`}
    >
      {results.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-refresh-muted-2">{emptyMessage}</p>
      ) : (
        <ul role="listbox" className="space-y-1.5">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                role="option"
                aria-selected="false"
                className="flex w-full items-center gap-3 rounded-xl bg-refresh-surface px-3 py-2.5 text-left transition hover:bg-refresh-surface-3"
              >
                {r.image && (
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-refresh-surface-3 text-refresh-muted-2"
                    aria-hidden
                  >
                    {r.image}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-refresh-blue">{r.title}</span>
                  {r.subtitle && (
                    <span className="truncate text-xs text-refresh-muted">{r.subtitle}</span>
                  )}
                </span>
                {(r.trailingTop || r.trailingBottom) && (
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    {r.trailingTop && (
                      <span className="text-sm font-semibold text-refresh-text tabular-nums">
                        {r.trailingTop}
                      </span>
                    )}
                    {r.trailingBottom && (
                      <span className="text-xs text-refresh-muted-2 tabular-nums">
                        {r.trailingBottom}
                      </span>
                    )}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
