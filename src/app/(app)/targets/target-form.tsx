"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";
import { NumberInput } from "../ui/number-input";
import { createTarget } from "./actions";

export function TargetForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    setBusy(true); setError("");
    try {
      const res = await createTarget(new FormData(form));
      if (res?.error) { setError(res.error); return; }
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="btn-primary mb-4" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {t.newTarget}
      </button>
    );
  }

  return (
    <form className="card mb-4 space-y-3" onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}>
      <h3 className="font-semibold">{t.newTarget}</h3>
      <div>
        <label className="label">{t.targetTitle} *</label>
        <input name="title" className="input" required placeholder="Марҳилаи 4: ..." />
      </div>
      <div>
        <label className="label">{t.targetAmount} *</label>
        <NumberInput name="amount" required />
        <p className="mt-1 text-xs text-refresh-muted-2">
          Ҷамъи умумии лозима (масалан 150000). Пешрафт нисбат ба ҷамъи ҳамаи хайрияҳо ҳисоб мешавад.
        </p>
      </div>
      {error && <p className="rounded-lg bg-refresh-pink/10 px-3 py-2 text-sm text-refresh-pink">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={busy}>{t.save}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>{t.cancel}</button>
      </div>
    </form>
  );
}
