"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import { RANGE_OPTIONS } from "@/lib/range";
import { t } from "@/lib/i18n";

/**
 * Date-range filter bar. Drives the page's data via URL search params
 * (?range=today | ?range=custom&from=…&to=…). Server components read these and
 * scope their queries. Quick chips navigate immediately; "Дилхоҳ" opens a small
 * popover with two date inputs.
 */
export function DateRangeBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentRange = params.get("range") ?? "all";
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const popRef = useRef<HTMLDivElement>(null);

  // Keep the inputs in sync if the URL changes elsewhere (e.g. back/forward).
  useEffect(() => {
    setFrom(params.get("from") ?? "");
    setTo(params.get("to") ?? "");
  }, [params]);

  // Dismiss the popover on outside-click / Escape.
  useEffect(() => {
    if (!open) return;
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

  function applyCustom() {
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
          className="absolute left-1 top-[calc(100%+0.5rem)] z-30 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-refresh-line bg-refresh-surface p-4 shadow-2xl"
        >
          <div className="space-y-3">
            <div>
              <label className="label">{t.from}</label>
              <input
                type="date"
                className="input"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t.to}</label>
              <input
                type="date"
                className="input"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
                {t.cancel}
              </button>
              <button type="button" className="btn-primary" onClick={applyCustom}>
                {t.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
