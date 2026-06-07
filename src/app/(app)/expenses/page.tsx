import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Receipt } from "lucide-react";
import { somoni, fmtDate, toInputDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { ExpenseForm } from "./expense-form";
import { DeleteButton } from "../delete-button";
import { ExportButtons } from "../export-buttons";
import { deleteExpense } from "./actions";

export default async function ExpensesPage() {
  const user = await getSession();
  const isAdmin = user?.role === "admin";

  const [expenses, accounts, agg] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 200, include: { account: true } }),
    prisma.account.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } }),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
  ]);

  const exportRows = expenses.map((e) => ({
    date: fmtDate(e.date),
    category: e.category ?? "",
    account: e.account.name,
    payee: e.payee ?? "",
    amount: e.amount,
    note: e.note ?? "",
  }));
  const exportColumns = [
    { header: t.date, key: "date" },
    { header: t.category, key: "category" },
    { header: t.account, key: "account" },
    { header: t.payee, key: "payee" },
    { header: `${t.amount} (смн)`, key: "amount", type: "number" as const },
    { header: t.note, key: "note" },
  ];

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-bold">{t.expenses}</h1>
        <div className="text-right">
          <div className="text-xs text-refresh-muted">{t.total} ({agg._count})</div>
          <div className="text-xl font-bold text-refresh-pink">{somoni(agg._sum.amount ?? 0)}</div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="mb-4 flex justify-end">
          <ExportButtons
            filename="kharojotho"
            title={t.expenses}
            subtitle={`${fmtDate(new Date())} · ${agg._count} ${t.records}`}
            columns={exportColumns}
            rows={exportRows}
            totalKey="amount"
          />
        </div>
      )}

      {isAdmin && <ExpenseForm accounts={accounts} today={toInputDate(new Date())} />}

      {expenses.length === 0 ? (
        <p className="card text-refresh-muted">{t.noExpenses}</p>
      ) : (
        <div className="card divide-y divide-refresh-line p-0">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-refresh-pink/15 text-refresh-pink">
                <Receipt className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{e.category || t.expense}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-refresh-muted-2">
                  <span>{fmtDate(e.date)}</span>
                  <span>· {e.account.name}</span>
                  {e.payee && <span>· {e.payee}</span>}
                </div>
              </div>
              <div className="text-right font-semibold text-refresh-pink">−{somoni(e.amount)}</div>
              {isAdmin && <DeleteButton id={e.id} action={deleteExpense} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
