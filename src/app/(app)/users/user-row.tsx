"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Pencil, Trash2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { Select } from "../ui/select";
import { updateUser, deleteUser } from "./actions";

type U = { id: string; username: string; name: string; role: string; created: string };

export function UserRow({ user, isMe }: { user: U; isMe: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(form: HTMLFormElement) {
    setBusy(true);
    setError("");
    try {
      const res = await updateUser(new FormData(form));
      if (res?.error) { setError(res.error); return; }
      setEditing(false);
      router.refresh();
    } catch {
      setError(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(t.confirmDelete)) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("id", user.id);
      const res = await deleteUser(fd);
      if (res?.error) { alert(res.error); return; }
      router.refresh();
    } catch {
      alert(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form className="space-y-3 px-4 py-3" onSubmit={(e) => { e.preventDefault(); save(e.currentTarget); }}>
        <input type="hidden" name="id" value={user.id} />
        <div className="text-xs text-refresh-muted-2">{user.username}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t.displayName} *</label>
            <input name="name" className="input" defaultValue={user.name} required />
          </div>
          <div>
            <label className="label">{t.role}</label>
            <Select
              name="role"
              defaultValue={user.role}
              options={[
                { value: "viewer", label: t.roleViewer },
                { value: "admin", label: t.roleAdmin },
              ]}
            />
          </div>
        </div>
        <div>
          <label className="label">{t.newPassword} <span className="text-refresh-muted-2">({t.optional})</span></label>
          <input name="password" type="password" className="input" autoComplete="new-password" placeholder="••••••" />
        </div>
        {error && <p className="rounded-lg bg-refresh-pink/10 px-3 py-2 text-sm text-refresh-pink">{error}</p>}
        <div className="flex gap-2">
          <button className="btn-primary" disabled={busy}>{t.save}</button>
          <button type="button" className="btn-ghost" onClick={() => { setEditing(false); setError(""); }}>{t.cancel}</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-refresh-surface-3 text-refresh-muted">
        <UserCog className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{user.name}</span>
          {isMe && <span className="text-xs text-refresh-muted-2">({t.you})</span>}
        </div>
        <div className="text-xs text-refresh-muted-2">{user.username} · {user.created}</div>
      </div>
      <span
        className={`chip ${
          user.role === "admin" ? "bg-refresh-sage text-refresh-on-pastel" : "bg-refresh-surface-2 text-refresh-muted"
        }`}
      >
        {user.role === "admin" ? t.roleAdmin : t.roleViewer}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="text-refresh-muted-2 hover:text-refresh-text"
        title={t.edit}
        aria-label={t.edit}
      >
        <Pencil className="h-4 w-4" />
      </button>
      {!isMe && (
        <button
          onClick={remove}
          disabled={busy}
          className="text-refresh-muted-2 hover:text-refresh-pink"
          title={t.delete}
          aria-label={t.delete}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
