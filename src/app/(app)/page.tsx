import { getTotals, getDashboardStats, getTargetsWithProgress } from "@/lib/calc";
import { somoni, fmtDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { HandCoins, Receipt, Wallet, Users } from "lucide-react";
import { MetricTile } from "@/components/refresh/MetricTile";
import { CurrentTargetCard } from "./targets/target-cards";
import { DailyChart, MonthlyChart, AccountChart, AgeChart, FamilyChart } from "./charts-lazy";

export default async function DashboardPage() {
  const today = fmtDate(new Date());
  const [totals, stats, targets] = await Promise.all([
    getTotals(),
    getDashboardStats(),
    getTargetsWithProgress(),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t.dashboard}</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile tone="sage" label={t.totalRaised} value={somoni(totals.totalRaised)} icon={<HandCoins size={20} />} />
        <MetricTile tone="pink" label={t.totalSpent} value={somoni(totals.totalSpent)} icon={<Receipt size={20} />} />
        <MetricTile tone="blue" label={t.currentBalance} value={somoni(totals.balance)} icon={<Wallet size={20} />} />
        <MetricTile tone="periwinkle" label={t.donorsCount} value={String(totals.donorsCount)} icon={<Users size={20} />} />
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
    </div>
  );
}
