"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import { RANGE_OPTIONS } from "@/lib/range";
import { t } from "@/lib/i18n";
import { DateRangeCalendar } from "./date-range-calendar";

/**
 * Date-range filter bar. Drives the page's data via URL search params
 * (?range=today | ?range=custom&from=…&to=…). Server components read these and
 * scope their queries. Quick chips navigate immediately; "Дилхоҳ" opens the
 * Refresh range calendar (preset sidebar + month grid).
 */
export function DateRangeBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentRange = params.get("range") ?? "all";
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  // Dismiss the popover on outside-click / Escape, and move focus into it on open.
  useEffect(() => {
    if (!open) return;
    popRef.current?.focus({ preventScroll: true });
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function navigate(next: Record<string, string>) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) usp.set(k, v);
    const qs = usp.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function pickPreset(key: string) {
    setOpen(false);
    navigate(key === "all" ? {} : { range: key });
  }

  function applyCustom(from: string, to: string) {
    setOpen(false);
    if (!from && !to) {
      navigate({}); // empty → all-time
      return;
    }
    navigate({ range: "custom", from, to });
  }

  const isCustom = currentRange === "custom";

  return (
    <div className={`relative ${pending ? "pointer-events-none opacity-60" : ""}`}>
      <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto rounded-full bg-refresh-surface p-1">
        {RANGE_OPTIONS.map((o) => {
          const active = currentRange === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pickPreset(o.key)}
              aria-pressed={active}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-refresh-surface-3 text-refresh-text shadow-sm"
                  : "text-refresh-muted hover:text-refresh-text"
              }`}
            >
              {o.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-pressed={isCustom}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
            isCustom
              ? "bg-refresh-surface-3 text-refresh-text shadow-sm"
              : "text-refresh-muted hover:text-refresh-text"
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {t.rangeCustom}
        </button>
      </div>

      {open && (
        <div
          ref={popRef}
          role="dialog"
          aria-label={t.period}
          tabIndex={-1}
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 mx-auto w-auto max-w-[calc(100vw-1rem)] rounded-2xl border border-refresh-line bg-refresh-surface p-4 shadow-2xl outline-none sm:left-1 sm:right-auto sm:mx-0 sm:w-[34rem]"
        >
          <DateRangeCalendar
            initialFrom={isCustom ? params.get("from") ?? undefined : undefined}
            initialTo={isCustom ? params.get("to") ?? undefined : undefined}
            onApply={applyCustom}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
