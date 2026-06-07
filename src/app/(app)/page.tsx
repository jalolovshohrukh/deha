import { HandCoins, Receipt } from "lucide-react";
import { getTotals, getDashboardStats, getTargetsWithProgress } from "@/lib/calc";
import { prisma } from "@/lib/db";
import { somoni, fmtDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { MetricTile } from "@/components/refresh/MetricTile";
import { Icon } from "@/components/refresh/Icon";
import { CurrentTargetCard } from "./targets/target-cards";
import { DailyChart, MonthlyChart, AccountChart, AgeChart, FamilyChart } from "./charts";

export default async function DashboardPage() {
  const today = fmtDate(new Date());
  const [totals, stats, targets, recentDon, recentExp] = await Promise.all([
    getTotals(),
    getDashboardStats(),
    getTargetsWithProgress(),
    prisma.donation.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { donor: true } }),
    prisma.expense.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { account: true } }),
  ]);

  const activity = [
    ...recentDon.map((d) => ({
      kind: "donation" as const,
      label: d.donor?.isAnonymous
        ? t.anonymous
        : `${d.donor?.firstName ?? ""} ${d.donor?.familyName ?? ""}`.trim() || t.donation,
      amount: d.amount,
      date: d.createdAt,
    })),
    ...recentExp.map((e) => ({
      kind: "expense" as const,
      label: e.category || e.account.name,
      amount: e.amount,
      date: e.createdAt,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t.dashboard}</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile tone="sage" label={t.totalRaised} value={somoni(totals.totalRaised)} icon={<Icon name="hand-coins" size={20} />} />
        <MetricTile tone="pink" label={t.totalSpent} value={somoni(totals.totalSpent)} icon={<Icon name="receipt" size={20} />} />
        <MetricTile tone="blue" label={t.currentBalance} value={somoni(totals.balance)} icon={<Icon name="wallet" size={20} />} />
        <MetricTile tone="periwinkle" label={t.donorsCount} value={String(totals.donorsCount)} icon={<Icon name="users" size={20} />} />
        <MetricTile tone="lavender" label={t.avgDonation} value={somoni(totals.avgDonation)} icon={<Icon name="trending-up" size={20} />} />
      </div>

      {/* Current target */}
      <CurrentTargetCard current={targets.current} totalRaised={targets.totalRaised} today={today} />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DailyChart data={stats.daily} />
        <MonthlyChart data={stats.monthly} />
        <AgeChart data={stats.byAge} today={today} />
        <AccountChart data={stats.byAccount} />
        <FamilyChart data={stats.byFamily} today={today} />

        {/* Top donors */}
        <div className="card">
          <h3 className="mb-3 font-semibold">{t.topDonors}</h3>
          {stats.topDonors.length === 0 ? (
            <p className="text-sm text-refresh-muted">—</p>
          ) : (
            <ol className="space-y-2">
              {stats.topDonors.map((d, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-refresh-surface-3 text-xs font-bold text-refresh-sage">
                      {i + 1}
                    </span>
                    {d.name}
                  </span>
                  <span className="font-semibold text-refresh-sage">{somoni(d.value)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <h3 className="mb-3 font-semibold">{t.recentActivity}</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-refresh-muted">—</p>
        ) : (
          <div className="divide-y divide-refresh-line">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  {a.kind === "donation" ? (
                    <HandCoins className="h-4 w-4 text-refresh-sage" />
                  ) : (
                    <Receipt className="h-4 w-4 text-refresh-pink" />
                  )}
                  <span>{a.label}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className={a.kind === "donation" ? "font-semibold text-refresh-sage" : "font-semibold text-refresh-pink"}>
                    {a.kind === "donation" ? "+" : "−"}{somoni(a.amount)}
                  </span>
                  <span className="text-xs text-refresh-muted-2">{fmtDate(a.date)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
