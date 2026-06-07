"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowRightLeft } from "lucide-react";
import { t } from "@/lib/i18n";
import { createAccount, createTransfer } from "./actions";

export function AccountForms({
  accounts,
  today,
}: {
  accounts: { id: string; name: string }[];
  today: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<"none" | "account" | "transfer">("none");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(fn: (fd: FormData) => Promise<any>, form: HTMLFormElement) {
    setBusy(true);
    setError("");
    try {
      const res = await fn(new FormData(form));
      if (res?.error) {
        setError(res.error);
        return;
      }
      form.reset();
      setOpen("none");
      router.refresh();
    } catch {
      setError(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button className="btn-primary" onClick={() => setOpen(open === "account" ? "none" : "account")}>
        <Plus className="h-4 w-4" /> {t.newAccount}
      </button>
      <button
        className="btn-ghost"
        onClick={() => setOpen(open === "transfer" ? "none" : "transfer")}
        disabled={accounts.length < 2}
        title={accounts.length < 2 ? "Ҳадди ақал 2 ҳисоб лозим аст" : ""}
      >
        <ArrowRightLeft className="h-4 w-4" /> {t.transferMoney}
      </button>

      {error && (
        <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {open === "account" && (
        <form
          className="card w-full space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(createAccount, e.currentTarget);
          }}
        >
          <h3 className="font-semibold">{t.newAccount}</h3>
          <div>
            <label className="label">{t.accountName}</label>
            <input name="name" className="input" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">{t.accountType}</label>
              <select name="type" className="input" defaultValue="bank">
                <option value="bank">{t.bank}</option>
                <option value="cash">{t.cash}</option>
                <option value="wallet">{t.wallet}</option>
              </select>
            </div>
            <div>
              <label className="label">{t.openingBalance}</label>
              <input name="openingBalance" type="number" step="0.01" className="input" defaultValue="0" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>{t.save}</button>
            <button type="button" className="btn-ghost" onClick={() => setOpen("none")}>{t.cancel}</button>
          </div>
        </form>
      )}

      {open === "transfer" && (
        <form
          className="card w-full space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(createTransfer, e.currentTarget);
          }}
        >
          <h3 className="font-semibold">{t.transferMoney}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">{t.fromAccount}</label>
              <select name="fromAccountId" className="input" required>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.toAccount}</label>
              <select name="toAccountId" className="input" required defaultValue={accounts[1]?.id}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">{t.amount} *</label>
              <input name="amount" type="number" step="0.01" min="0" className="input" required />
            </div>
            <div>
              <label className="label">{t.date} *</label>
              <input name="date" type="date" className="input" defaultValue={today} required />
            </div>
          </div>
          <div>
            <label className="label">{t.note}</label>
            <input name="note" className="input" />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>{t.transfer}</button>
            <button type="button" className="btn-ghost" onClick={() => setOpen("none")}>{t.cancel}</button>
          </div>
        </form>
      )}
    </div>
  );
}
