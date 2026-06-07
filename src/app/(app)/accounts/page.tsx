import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getAccountsWithBalances } from "@/lib/calc";
import { Landmark, Banknote, Smartphone, ArrowRight, ChevronRight, type LucideIcon } from "lucide-react";
import { somoni, fmtDate, toInputDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { AccountForms } from "./account-forms";

const typeLabel: Record<string, string> = { bank: t.bank, cash: t.cash, wallet: t.wallet };
const typeIcon: Record<string, LucideIcon> = {
  bank: Landmark,
  cash: Banknote,
  wallet: Smartphone,
};

export default async function AccountsPage() {
  const user = await getSession();
  const isAdmin = user?.role === "admin";

  const [accounts, transfers] = await Promise.all([
    getAccountsWithBalances(),
    prisma.transfer.findMany({
      orderBy: { date: "desc" },
      take: 15,
      include: { fromAccount: true, toAccount: true },
    }),
  ]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-bold">{t.accounts}</h1>
        <div className="text-right">
          <div className="text-xs text-refresh-muted">{t.currentBalance}</div>
          <div className="text-xl font-bold text-refresh-sage">{somoni(totalBalance)}</div>
        </div>
      </div>

      {isAdmin && <AccountForms accounts={accounts} today={toInputDate(new Date())} />}

      {accounts.length === 0 ? (
        <p className="card text-refresh-muted">{t.noAccounts}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const TypeIcon = typeIcon[a.type] ?? Landmark;
            return (
            <Link
              key={a.id}
              href={`/accounts/${a.id}`}
              className="card block transition hover:shadow-md hover:ring-refresh-surface-3"
            >
              <div className="flex items-center justify-between">
                <span className="chip gap-1 bg-refresh-surface-2 text-refresh-muted">
                  <TypeIcon className="h-3.5 w-3.5" /> {typeLabel[a.type] ?? a.type}
                </span>
                <ChevronRight className="h-4 w-4 text-refresh-muted-2" />
              </div>
              <div className="mt-2 text-base font-semibold">{a.name}</div>
              <div className={`mt-1 text-2xl font-bold ${a.balance < 0 ? "text-refresh-pink" : "text-refresh-sage"}`}>
                {somoni(a.balance)}
              </div>
              <div className="mt-1 text-xs text-refresh-muted-2">
                {t.openingBalance}: {somoni(a.openingBalance)}
              </div>
            </Link>
            );
          })}
        </div>
      )}

      <h2 className="mb-2 mt-6 text-lg font-semibold">{t.transfer}</h2>
      {transfers.length === 0 ? (
        <p className="text-sm text-refresh-muted">—</p>
      ) : (
        <div className="card divide-y divide-refresh-line p-0">
          {transfers.map((tr) => (
            <div key={tr.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-medium">{tr.fromAccount.name}</span>
                  <ArrowRight className="h-4 w-4 text-refresh-muted-2" />
                  <span className="font-medium">{tr.toAccount.name}</span>
                </span>
                {tr.note && <div className="text-xs text-refresh-muted-2">{tr.note}</div>}
              </div>
              <div className="text-right">
                <div className="font-semibold">{somoni(tr.amount)}</div>
                <div className="text-xs text-refresh-muted-2">{fmtDate(tr.date)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
