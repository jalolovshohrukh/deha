import { prisma } from "./db";
import { ageGroup, t } from "./i18n";

export type AccountWithBalance = {
  id: string;
  name: string;
  type: string;
  openingBalance: number;
  balance: number;
};

/** Computed balance per account = opening + donations + transfers in − expenses − transfers out */
export async function getAccountsWithBalances(): Promise<AccountWithBalance[]> {
  const accounts = await prisma.account.findMany({ orderBy: { createdAt: "asc" } });

  const [donAgg, expAgg, tInAgg, tOutAgg] = await Promise.all([
    prisma.donation.groupBy({ by: ["accountId"], _sum: { amount: true } }),
    prisma.expense.groupBy({ by: ["accountId"], _sum: { amount: true } }),
    prisma.transfer.groupBy({ by: ["toAccountId"], _sum: { amount: true } }),
    prisma.transfer.groupBy({ by: ["fromAccountId"], _sum: { amount: true } }),
  ]);

  const map = (rows: any[], key: string) =>
    Object.fromEntries(rows.map((r) => [r[key], r._sum.amount ?? 0]));

  const don = map(donAgg, "accountId");
  const exp = map(expAgg, "accountId");
  const tin = map(tInAgg, "toAccountId");
  const tout = map(tOutAgg, "fromAccountId");

  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    openingBalance: a.openingBalance,
    balance:
      a.openingBalance +
      (don[a.id] || 0) +
      (tin[a.id] || 0) -
      (exp[a.id] || 0) -
      (tout[a.id] || 0),
  }));
}

export async function getTotals() {
  const [raised, spent, donorsCount, donationsCount, openingAgg] = await Promise.all([
    prisma.donation.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    // count only donors who actually have a donation (ignores orphans/anon inflation)
    prisma.donor.count({ where: { donations: { some: {} } } }),
    prisma.donation.count(),
    prisma.account.aggregate({ _sum: { openingBalance: true } }),
  ]);
  const totalRaised = raised._sum.amount ?? 0;
  const totalSpent = spent._sum.amount ?? 0;
  const opening = openingAgg._sum.openingBalance ?? 0;
  // Global balance computed independently of per-account grouping (transfers net
  // to zero globally), so it stays correct even for donations with no account.
  const balance = opening + totalRaised - totalSpent;
  return {
    totalRaised,
    totalSpent,
    balance,
    donorsCount,
    donationsCount,
    avgDonation: donationsCount ? totalRaised / donationsCount : 0,
  };
}

/** Targets are cumulative: progress is measured vs total raised. Pure read —
 *  performs no writes (persistence happens in syncReachedTargets on the write
 *  path). Returns the current active target and the ordered list. */
export async function getTargetsWithProgress() {
  const [targets, raisedAgg] = await Promise.all([
    prisma.target.findMany({ orderBy: [{ sequence: "asc" }, { createdAt: "asc" }] }),
    prisma.donation.aggregate({ _sum: { amount: true } }),
  ]);
  const totalRaised = raisedAgg._sum.amount ?? 0;

  const list = targets.map((tg) => {
    const isReached = totalRaised >= tg.amount;
    return {
      ...tg,
      isReached,
      pct: tg.amount > 0 ? Math.min(100, (totalRaised / tg.amount) * 100) : 0,
    };
  });

  // current = first not-yet-reached
  const current = list.find((tg) => !tg.isReached) ?? null;
  return { totalRaised, list, current };
}

/** Persist any targets newly crossed by the current total, stamping reachedAt.
 *  Call from mutation paths (createDonation/deleteDonation) — never from render.
 *  Returns the targets that just flipped to reached, for audit logging. */
export async function syncReachedTargets() {
  const [targets, raisedAgg] = await Promise.all([
    prisma.target.findMany({ where: { status: { not: "reached" } } }),
    prisma.donation.aggregate({ _sum: { amount: true } }),
  ]);
  const totalRaised = raisedAgg._sum.amount ?? 0;
  const newly = targets.filter((tg) => totalRaised >= tg.amount);
  if (newly.length) {
    const now = new Date();
    await prisma.$transaction(
      newly.map((tg) =>
        prisma.target.update({ where: { id: tg.id }, data: { status: "reached", reachedAt: now } })
      )
    );
  }
  return newly;
}

export async function getDashboardStats() {
  const donations = await prisma.donation.findMany({
    include: { donor: true, account: true },
    orderBy: { date: "asc" },
  });

  // by age group
  const ageMap: Record<string, number> = {};
  for (const d of donations) {
    const g = ageGroup(d.donor?.age ?? null);
    ageMap[g] = (ageMap[g] || 0) + d.amount;
  }
  const byAge = Object.entries(ageMap).map(([name, value]) => ({ name, value }));

  // by account (the account IS the payment method: Alif, DC, cash, ...)
  const accMap: Record<string, number> = {};
  for (const d of donations) {
    const a = d.account?.name || t.unknown;
    accMap[a] = (accMap[a] || 0) + d.amount;
  }
  const byAccount = Object.entries(accMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // by family (skip donor-less and anonymous donations; only real people)
  const famMap: Record<string, number> = {};
  for (const d of donations) {
    if (!d.donor || d.donor.isAnonymous) continue;
    const f = d.donor.familyName || t.other;
    famMap[f] = (famMap[f] || 0) + d.amount;
  }
  const byFamily = Object.entries(famMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // top donors (all anonymous giving aggregates into a single entry)
  const donorMap: Record<string, { name: string; value: number }> = {};
  for (const d of donations) {
    if (!d.donorId) continue;
    const dn = d.donor;
    const key = dn?.isAnonymous ? "__anon__" : d.donorId;
    const name = dn?.isAnonymous
      ? t.anonymous
      : `${dn?.firstName ?? ""} ${dn?.familyName ?? ""}`.trim() || t.unknown;
    if (!donorMap[key]) donorMap[key] = { name, value: 0 };
    donorMap[key].value += d.amount;
  }
  const topDonors = Object.values(donorMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // daily — contiguous last 30 calendar days (empty days shown as 0)
  const dayMap: Record<string, number> = {};
  for (const d of donations) {
    const key = new Date(d.date).toISOString().slice(0, 10);
    dayMap[key] = (dayMap[key] || 0) + d.amount;
  }
  const todayUtc = new Date();
  const daily: { day: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(
      Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate() - i)
    );
    const key = dt.toISOString().slice(0, 10);
    daily.push({ day: key.slice(5), value: dayMap[key] || 0 });
  }

  // monthly
  const monthMap: Record<string, number> = {};
  for (const d of donations) {
    const key = new Date(d.date).toISOString().slice(0, 7);
    monthMap[key] = (monthMap[key] || 0) + d.amount;
  }
  const monthly = Object.entries(monthMap).map(([month, value]) => ({ month, value }));

  return { byAge, byAccount, byFamily, topDonors, daily, monthly };
}
