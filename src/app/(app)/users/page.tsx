import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fmtDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { UserForm } from "./user-form";
import { UserRow } from "./user-row";

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
          <UserRow
            key={u.id}
            isMe={u.id === me.id}
            user={{
              id: u.id,
              username: u.username,
              name: u.name,
              role: u.role,
              created: fmtDate(u.createdAt),
            }}
          />
        ))}
      </div>
    </div>
  );
}
