"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";
import { NumberInput } from "../ui/number-input";
import { Select } from "../ui/select";
import { createExpense } from "./actions";

const categories = [
  "Маводҳо (Materials)",
  "Корфармоӣ (Labor)",
  "Нақлиёт (Transport)",
  "Таҷҳизот (Equipment)",
  "Дигар (Other)",
];

export function ExpenseForm({ accounts, today }: { accounts: { id: string; name: string }[]; today: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    setBusy(true); setError("");
    try {
      const res = await createExpense(new FormData(form));
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

  if (accounts.length === 0) {
    return <p className="card mb-4 text-sm text-gray-500">{t.noAccounts}</p>;
  }

  if (!open) {
    return (
      <button className="btn-primary mb-4" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {t.newExpense}
      </button>
    );
  }

  return (
    <form className="card mb-4 space-y-3" onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}>
      <h3 className="font-semibold">{t.newExpense}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">{t.amount} *</label>
          <NumberInput name="amount" required />
        </div>
        <div>
          <label className="label">{t.date} *</label>
          <input name="date" type="date" className="input" defaultValue={today} required />
        </div>
      </div>

      <div>
        <label className="label">{t.spentFrom} * <span className="text-gray-400">({t.required})</span></label>
        <Select
          name="accountId"
          placeholder={`— ${t.account} —`}
          options={accounts.map((a) => ({ value: a.id, label: a.name }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">{t.category}</label>
          <Select name="category" options={categories.map((c) => ({ value: c, label: c }))} />
        </div>
        <div>
          <label className="label">{t.payee}</label>
          <input name="payee" className="input" />
        </div>
      </div>

      <div>
        <label className="label">{t.note}</label>
        <input name="note" className="input" />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button className="btn-primary" disabled={busy}>{t.save}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>{t.cancel}</button>
      </div>
    </form>
  );
}
