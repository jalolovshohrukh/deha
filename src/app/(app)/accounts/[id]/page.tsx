import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  HandCoins,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Banknote,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { somoni, fmtDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { ExportButtons } from "../../export-buttons";

const typeLabel: Record<string, string> = { bank: t.bank, cash: t.cash, wallet: t.wallet };
const typeIcon: Record<string, LucideIcon> = { bank: Landmark, cash: Banknote, wallet: Smartphone };

type Entry = {
  date: Date;
  createdAt: Date;
  kind: "donation" | "expense" | "in" | "out";
  label: string;
  delta: number;
};

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const account = await prisma.account.findUnique({ where: { id: params.id } });
  if (!account) notFound();

  const [donations, expenses, transfers] = await Promise.all([
    prisma.donation.findMany({ where: { accountId: account.id }, include: { donor: true } }),
    prisma.expense.findMany({ where: { accountId: account.id } }),
    prisma.transfer.findMany({
      where: { OR: [{ fromAccountId: account.id }, { toAccountId: account.id }] },
      include: { fromAccount: true, toAccount: true },
    }),
  ]);

  const donorName = (d: (typeof donations)[number]["donor"]) => {
    if (!d) return t.donation;
    if (d.isAnonymous) return t.anonymous;
    return `${d.firstName ?? ""} ${d.familyName ?? ""}`.trim() || t.donation;
  };

  const entries: Entry[] = [
    ...donations.map((d) => ({
      date: d.date,
      createdAt: d.createdAt,
      kind: "donation" as const,
      label: donorName(d.donor),
      delta: d.amount,
    })),
    ...expenses.map((e) => ({
      date: e.date,
      createdAt: e.createdAt,
      kind: "expense" as const,
      label: e.category || e.payee || t.expense,
      delta: -e.amount,
    })),
    ...transfers.map((tr) => {
      const incoming = tr.toAccountId === account.id;
      return {
        date: tr.date,
        createdAt: tr.createdAt,
        kind: incoming ? ("in" as const) : ("out" as const),
        label: incoming ? `${t.from} ${tr.fromAccount.name}` : `${t.to} ${tr.toAccount.name}`,
        delta: incoming ? tr.amount : -tr.amount,
      };
    }),
  ];

  // chronological, with running balance starting from the opening balance
  entries.sort((a, b) => +a.date - +b.date || +a.createdAt - +b.createdAt);
  let running = account.openingBalance;
  const withBalance = entries.map((e) => {
    running += e.delta;
    return { ...e, balance: running };
  });
  const currentBalance = running;
  const display = [...withBalance].reverse();

  const Icon = typeIcon[account.type] ?? Landmark;

  const exportRows = withBalance.map((e) => ({
    date: fmtDate(e.date),
    label: e.label,
    amount: e.delta,
    balance: e.balance,
  }));
  const exportColumns = [
    { header: t.date, key: "date" },
    { header: t.description, key: "label" },
    { header: `${t.amount} (смн)`, key: "amount", type: "number" as const },
    { header: `${t.balance} (смн)`, key: "balance", type: "number" as const },
  ];

  const kindMeta: Record<Entry["kind"], { icon: LucideIcon; cls: string }> = {
    donation: { icon: HandCoins, cls: "bg-brand-50 text-brand-600" },
    in: { icon: ArrowDownLeft, cls: "bg-brand-50 text-brand-600" },
    expense: { icon: Receipt, cls: "bg-red-50 text-red-500" },
    out: { icon: ArrowUpRight, cls: "bg-red-50 text-red-500" },
  };

  return (
    <div>
      <Link href="/accounts" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </Link>

      <div className="card mb-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="chip gap-1 bg-gray-100 text-gray-600">
              <Icon className="h-3.5 w-3.5" /> {typeLabel[account.type] ?? account.type}
            </span>
            <h1 className="mt-2 text-2xl font-bold">{account.name}</h1>
            <div className="mt-1 text-xs text-gray-400">
              {t.openingLabel}: {somoni(account.openingBalance)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">{t.balance}</div>
            <div className={`text-2xl font-bold ${currentBalance < 0 ? "text-red-600" : "text-brand-600"}`}>
              {somoni(currentBalance)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.movements}</h2>
        {withBalance.length > 0 && (
          <ExportButtons
            filename={`hisob-${account.id.slice(0, 8)}`}
            title={account.name}
            subtitle={`${typeLabel[account.type] ?? account.type} · ${t.balance}: ${somoni(currentBalance)} · ${fmtDate(new Date())}`}
            columns={exportColumns}
            rows={exportRows}
          />
        )}
      </div>

      {display.length === 0 ? (
        <p className="card text-gray-500">{t.noMovements}</p>
      ) : (
        <div className="card divide-y divide-gray-100 p-0">
          {display.map((e, i) => {
            const m = kindMeta[e.kind];
            const MIcon = m.icon;
            const positive = e.delta >= 0;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.cls}`}>
                  <MIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{e.label}</div>
                  <div className="text-xs text-gray-400">{fmtDate(e.date)}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${positive ? "text-brand-600" : "text-red-600"}`}>
                    {positive ? "+" : "−"}{somoni(Math.abs(e.delta))}
                  </div>
                  <div className="text-xs text-gray-400">{somoni(e.balance)}</div>
                </div>
              </div>
            );
          })}
          {/* opening balance baseline */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-400">
            <span>{t.openingLabel}</span>
            <span>{somoni(account.openingBalance)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
