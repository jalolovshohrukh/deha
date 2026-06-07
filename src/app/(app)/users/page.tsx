import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { UserForm } from "./user-form";
import { DeleteButton } from "../delete-button";
import { deleteUser } from "./actions";

export default async function UsersPage() {
  const me = await getSession();
  if (!me || me.role !== "admin") redirect("/");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-bold">{t.users}</h1>
        <div className="text-xs text-refresh-muted">{t.total}: {users.length}</div>
      </div>

      <UserForm />

      <div className="card divide-y divide-refresh-line p-0">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-refresh-surface-3 text-refresh-muted">
              <UserCog className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{u.name}</span>
                {u.id === me.id && <span className="text-xs text-refresh-muted-2">({t.you})</span>}
              </div>
              <div className="text-xs text-refresh-muted-2">{u.username} · {fmtDate(u.createdAt)}</div>
            </div>
            <span
              className={`chip ${
                u.role === "admin"
                  ? "bg-refresh-sage text-refresh-on-pastel"
                  : "bg-refresh-surface-2 text-refresh-muted"
              }`}
            >
              {u.role === "admin" ? t.roleAdmin : t.roleViewer}
            </span>
            {u.id !== me.id && <DeleteButton id={u.id} action={deleteUser} />}
          </div>
        ))}
      </div>
    </div>
  );
}
