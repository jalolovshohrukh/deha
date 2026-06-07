'use client';

export type ModifierOption = {
  id: string;
  label: string;
  /** Price delta — positive adds, negative subtracts. Optional. */
  priceDelta?: number;
  disabled?: boolean;
};

export type ModifierGroup = {
  id: string;
  label: string;
  options: ModifierOption[];
  /** 'single' = pick one (radio); 'multi' = pick any (checkbox). */
  selection: 'single' | 'multi';
  /** When true, exactly one (single) or at least one (multi) must be picked to satisfy the order. */
  required?: boolean;
  /** For multi groups, the maximum number of picks allowed. */
  maxPicks?: number;
};

export type ModifierSelection = Record<string /* groupId */, string[] /* optionIds */>;

export type ModifiersSheetProps = {
  groups: ModifierGroup[];
  value: ModifierSelection;
  onChange: (next: ModifierSelection) => void;
  currency?: string;
  locale?: string;
  className?: string;
};

/**
 * Grouped item-modifiers picker — Size / Sauce / Extras / etc.
 * Drop inside a Sheet or Dialog body for the full "Customize" pattern.
 *
 * @example
 *   <Sheet open={open} ...>
 *     <ModifiersSheet groups={burgerMods} value={mods} onChange={setMods} />
 *   </Sheet>
 */
export function ModifiersSheet({
  groups,
  value,
  onChange,
  currency = 'USD',
  locale = 'en-US',
  className = '',
}: ModifiersSheetProps) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });

  const toggleSingle = (groupId: string, optionId: string) => {
    onChange({ ...value, [groupId]: [optionId] });
  };

  const toggleMulti = (groupId: string, optionId: string, max?: number) => {
    const current = value[groupId] ?? [];
    const has = current.includes(optionId);
    let next: string[];
    if (has) next = current.filter((id) => id !== optionId);
    else if (max != null && current.length >= max) return; // at max, no-op
    else next = [...current, optionId];
    onChange({ ...value, [groupId]: next });
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {groups.map((group) => {
        const selected = value[group.id] ?? [];
        const satisfied =
          group.selection === 'single' ? selected.length === 1 : selected.length >= 1;
        const showWarn = group.required && !satisfied;

        return (
          <fieldset key={group.id} className="flex flex-col gap-2">
            <legend className="flex items-baseline justify-between text-sm font-semibold text-refresh-text">
              <span>
                {group.label}
                {group.required && <span className="ml-1 text-refresh-pink">*</span>}
              </span>
              <span className="text-[11px] font-medium text-refresh-muted-2">
                {group.selection === 'single'
                  ? 'Pick one'
                  : group.maxPicks
                  ? `Pick up to ${group.maxPicks}`
                  : 'Pick any'}
              </span>
            </legend>
            {showWarn && (
              <p className="text-[11px] font-medium text-refresh-pink">
                Required — please make a selection.
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {group.options.map((opt) => {
                const isSelected = selected.includes(opt.id);
                const role = group.selection === 'single' ? 'radio' : 'checkbox';
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role={role}
                    aria-checked={isSelected}
                    disabled={opt.disabled}
                    onClick={() =>
                      group.selection === 'single'
                        ? toggleSingle(group.id, opt.id)
                        : toggleMulti(group.id, opt.id, group.maxPicks)
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-refresh-text focus-visible:ring-offset-2 focus-visible:ring-offset-refresh-bg disabled:cursor-not-allowed disabled:opacity-40 ${
                      isSelected
                        ? 'border-refresh-text bg-refresh-surface'
                        : 'border-refresh-surface-3 bg-refresh-surface hover:border-refresh-muted-2'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                          group.selection === 'single' ? 'rounded-full' : 'rounded'
                        } ${
                          isSelected
                            ? 'border-refresh-text bg-refresh-text'
                            : 'border-refresh-surface-3 bg-refresh-surface'
                        }`}
                      >
                        {isSelected && (
                          <span
                            className={`${
                              group.selection === 'single'
                                ? 'h-1.5 w-1.5 rounded-full bg-refresh-bg'
                                : 'text-[10px] leading-none text-refresh-bg'
                            }`}
                          >
                            {group.selection === 'multi' && '✓'}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium text-refresh-text">{opt.label}</span>
                    </span>
                    {opt.priceDelta != null && opt.priceDelta !== 0 && (
                      <span className="text-xs font-semibold tabular-nums text-refresh-muted">
                        {opt.priceDelta > 0 ? '+' : ''}
                        {formatter.format(opt.priceDelta)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
