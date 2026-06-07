"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type Option = { value: string; label: string };

/**
 * Custom (non-native) dropdown styled to match the app. A hidden input carries
 * the selected value under `name` for FormData. Works controlled
 * (value + onValueChange) or uncontrolled (defaultValue).
 */
export function Select({
  name,
  value,
  defaultValue = "",
  onValueChange,
  options,
  placeholder = "—",
  required,
  id,
}: {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  id?: string;
}) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = controlled ? value ?? "" : internal;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const selected = options.find((o) => o.value === current);

  function choose(v: string) {
    if (controlled) onValueChange?.(v);
    else setInternal(v);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={current} />
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="input flex w-full items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "" : "text-refresh-muted-2"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-refresh-muted-2 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-refresh-line bg-refresh-surface py-1 shadow-lg"
          role="listbox"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => choose(o.value)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-refresh-surface-3 ${
                  o.value === current ? "font-medium text-refresh-sage" : "text-refresh-text"
                }`}
                role="option"
                aria-selected={o.value === current}
              >
                {o.label}
                {o.value === current && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
