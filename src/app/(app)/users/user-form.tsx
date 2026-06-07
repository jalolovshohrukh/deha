"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";
import { Select } from "../ui/select";
import { createUser } from "./actions";

export function UserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setError("");
    try {
      const res = await createUser(new FormData(form));
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
        <Plus className="h-4 w-4" /> {t.newUser}
      </button>
    );
  }

  return (
    <form className="card mb-4 space-y-3" onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}>
      <h3 className="font-semibold">{t.newUser}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">{t.loginUsername} *</label>
          <input name="username" className="input" autoComplete="off" required />
        </div>
        <div>
          <label className="label">{t.displayName} *</label>
          <input name="name" className="input" required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">{t.password} *</label>
          <input name="password" type="password" className="input" autoComplete="new-password" required />
        </div>
        <div>
          <label className="label">{t.role}</label>
          <Select
            name="role"
            defaultValue="viewer"
            options={[
              { value: "viewer", label: t.roleViewer },
              { value: "admin", label: t.roleAdmin },
            ]}
          />
        </div>
      </div>
      {error && <p className="rounded-lg bg-refresh-pink/10 px-3 py-2 text-sm text-refresh-pink">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={busy}>{t.save}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>{t.cancel}</button>
      </div>
    </form>
  );
}
