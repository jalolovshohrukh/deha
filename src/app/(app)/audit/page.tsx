import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";

const actionLabel: Record<string, string> = {
  create: "Илова",
  update: "Тағйир",
  delete: "Нест кард",
  transfer: "Гузаронид",
  login: "Воридшавӣ",
};
const entityLabel: Record<string, string> = {
  donation: "хайрия",
  expense: "хароҷот",
  account: "ҳисоб",
  transfer: "гузаронидан",
  target: "ҳадаф",
  user: "корбар",
};

export default async function AuditPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t.audit}</h1>
      {logs.length === 0 ? (
        <p className="card text-refresh-muted">—</p>
      ) : (
        <div className="card divide-y divide-refresh-line p-0">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div>
                <span className="font-medium">{l.user?.name ?? "—"}</span>{" "}
                <span className="text-refresh-muted">
                  {actionLabel[l.action] ?? l.action} {entityLabel[l.entity] ?? l.entity}
                </span>
                {l.details && <span className="text-refresh-muted-2"> · {l.details}</span>}
              </div>
              <span className="shrink-0 text-xs text-refresh-muted-2">
                {new Date(l.createdAt).toLocaleString("ru-RU")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
