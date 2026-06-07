"use client";

import { useState } from "react";

// Group the integer part with thin spaces: 12050 -> "12 050"
function groupInt(intPart: string) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Format a clean numeric string ("1380.5") for display ("1 380.5"). */
function formatRaw(raw: string) {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const grouped = groupInt(intPart || "0");
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

/** Strip display formatting back to a clean numeric string. */
function cleanInput(text: string, decimals: boolean) {
  let t = text.replace(/\s/g, "").replace(/,/g, ".");
  t = t.replace(decimals ? /[^0-9.]/g : /[^0-9]/g, "");
  if (decimals) {
    const parts = t.split(".");
    if (parts.length > 2) t = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return t;
}

/**
 * Number field that shows thousands grouping while typing. A hidden input
 * carries the clean numeric value under `name`, so server actions read a plain
 * number. Works controlled (value + onValueChange) or uncontrolled (defaultValue).
 */
export function NumberInput({
  name,
  value,
  defaultValue = "",
  onValueChange,
  decimals = true,
  className = "input",
  required,
  placeholder,
  id,
}: {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  decimals?: boolean;
  className?: string;
  required?: boolean;
  placeholder?: string;
  id?: string;
}) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const raw = controlled ? value ?? "" : internal;

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = cleanInput(e.target.value, decimals);
    if (controlled) onValueChange?.(cleaned);
    else setInternal(cleaned);
  }

  return (
    <>
      <input type="hidden" name={name} value={raw} />
      <input
        id={id}
        type="text"
        inputMode={decimals ? "decimal" : "numeric"}
        className={className}
        value={formatRaw(raw)}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
      />
    </>
  );
}
