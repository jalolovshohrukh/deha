import { User, EyeOff } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { somoni, fmtDate, toInputDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { DonationsView } from "./donations-view";
import { DeleteButton } from "../delete-button";
import { ExportButtons } from "../export-buttons";
import { deleteDonation } from "./actions";

export default async function DonationsPage() {
  const user = await getSession();
  const isAdmin = user?.role === "admin";

  const [donations, accounts, agg] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { date: "desc" },
      take: 200,
      include: { donor: true, account: true },
    }),
    prisma.account.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } }),
    prisma.donation.aggregate({ _sum: { amount: true }, _count: true }),
  ]);

  const donorName = (d: (typeof donations)[number]["donor"]) => {
    if (!d) return "—";
    if (d.isAnonymous) return t.anonymous;
    return `${d.firstName ?? ""} ${d.familyName ?? ""}`.trim() || "—";
  };

  const exportRows = donations.map((d) => ({
    date: fmtDate(d.date),
    donor: donorName(d.donor),
    age: d.donor?.age ?? "",
    account: d.account?.name ?? "",
    amount: d.amount,
    note: d.note ?? "",
  }));
  const exportColumns = [
    { header: t.date, key: "date" },
    { header: t.donor, key: "donor" },
    { header: t.age, key: "age", type: "number" as const },
    { header: t.account, key: "account" },
    { header: `${t.amount} (смн)`, key: "amount", type: "number" as const },
    { header: t.note, key: "note" },
  ];

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-bold">{t.donations}</h1>
        <div className="text-right">
          <div className="text-xs text-gray-500">{t.total} ({agg._count})</div>
          <div className="text-xl font-bold text-brand-600">{somoni(agg._sum.amount ?? 0)}</div>
        </div>
      </div>

      {donations.length > 0 && (
        <div className="mb-4 flex justify-end">
          <ExportButtons
            filename="hayriyaho"
            title={t.donations}
            subtitle={`${fmtDate(new Date())} · ${agg._count} ${t.records}`}
            columns={exportColumns}
            rows={exportRows}
            totalKey="amount"
          />
        </div>
      )}

      <DonationsView
        accounts={accounts}
        today={toInputDate(new Date())}
        isAdmin={isAdmin}
        history={
          donations.length === 0 ? (
            <p className="card text-gray-500">{t.noDonations}</p>
          ) : (
            <div className="card divide-y divide-gray-100 p-0">
              {donations.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    {d.donor?.isAnonymous ? <EyeOff className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{donorName(d.donor)}</span>
                      {d.donor?.age != null && (
                        <span className="text-xs text-gray-400">{d.donor.age}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span>{fmtDate(d.date)}</span>
                      {d.account && (
                        <span className="chip bg-gray-100 text-gray-600">{d.account.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-semibold text-brand-600">{somoni(d.amount)}</div>
                  {isAdmin && <DeleteButton id={d.id} action={deleteDonation} />}
                </div>
              ))}
            </div>
          )
        }
      />
    </div>
  );
}
