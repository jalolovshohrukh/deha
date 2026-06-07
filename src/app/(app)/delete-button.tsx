"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { t } from "@/lib/i18n";

export function DeleteButton({
  id,
  action,
}: {
  id: string;
  action: (fd: FormData) => Promise<any>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm(t.confirmDelete)) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("id", id);
      const res = await action(fd);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    } catch {
      alert(t.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="text-gray-300 hover:text-red-500"
      title={t.delete}
      aria-label={t.delete}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
