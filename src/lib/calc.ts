import { prisma } from "./db";
import { t } from "./i18n";
import { dateFilter, type ResolvedRange } from "./range";

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

export async function getTotals(range?: ResolvedRange) {
  // Raised/spent/donors are scoped to the selected period; the current balance
  // is always all-time (it's a snapshot of money on hand, not a flow).
  const df = range ? dateFilter(range) : undefined;
  const donWhere = df ? { date: df } : {};
  const expWhere = df ? { date: df } : {};
  const donorWhere = df ? { donations: { some: { date: df } } } : { donations: { some: {} } };

  const [raised, spent, donorsCount, donationsCount, openingAgg, allRaised, allSpent] =
    await Promise.all([
      prisma.donation.aggregate({ _sum: { amount: true }, where: donWhere }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: expWhere }),
      // count only donors who actually have a donation in range (ignores anon inflation)
      prisma.donor.count({ where: donorWhere }),
      prisma.donation.count({ where: donWhere }),
      prisma.account.aggregate({ _sum: { openingBalance: true } }),
      // all-time sums for the balance; reuse the scoped query when no range is set
      df ? prisma.donation.aggregate({ _sum: { amount: true } }) : null,
      df ? prisma.expense.aggregate({ _sum: { amount: true } }) : null,
    ]);

  const totalRaised = raised._sum.amount ?? 0;
  const totalSpent = spent._sum.amount ?? 0;
  const opening = openingAgg._sum.openingBalance ?? 0;
  const allTimeRaised = df ? allRaised!._sum.amount ?? 0 : totalRaised;
  const allTimeSpent = df ? allSpent!._sum.amount ?? 0 : totalSpent;
  // Global balance computed independently of per-account grouping (transfers net
  // to zero globally), so it stays correct even for donations with no account.
  const balance = opening + allTimeRaised - allTimeSpent;
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

export async function getDashboardStats(range?: ResolvedRange) {
  const df = range ? dateFilter(range) : undefined;
  const donations = await prisma.donation.findMany({
    where: df ? { date: df } : {},
    include: { donor: true, account: true },
    orderBy: { date: "asc" },
  });

  // by exact age (each age its own bar, ascending; unknown last)
  const ageMap: Record<string, number> = {};
  for (const d of donations) {
    const a = d.donor?.age;
    const key = a == null ? t.unknown : String(a);
    ageMap[key] = (ageMap[key] || 0) + d.amount;
  }
  const byAge = Object.entries(ageMap)
    .map(([name, value]) => ({ name, value }))
    .sort((x, y) => {
      const nx = parseInt(x.name, 10);
      const ny = parseInt(y.name, 10);
      if (Number.isNaN(nx)) return 1;
      if (Number.isNaN(ny)) return -1;
      return nx - ny;
    });

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

  // daily — contiguous calendar days (empty days shown as 0). Window ends at the
  // range's end (or today) and spans the range, capped at 31 bars so a wide range
  // (e.g. year-to-date) shows its last 31 days here while the monthly chart covers
  // the broader trend.
  const dayMap: Record<string, number> = {};
  for (const d of donations) {
    const key = new Date(d.date).toISOString().slice(0, 10);
    dayMap[key] = (dayMap[key] || 0) + d.amount;
  }
  const DAY_MS = 86_400_000;
  const endRef = range?.to ?? new Date();
  const endUtc = Date.UTC(endRef.getUTCFullYear(), endRef.getUTCMonth(), endRef.getUTCDate());
  let count = 30;
  if (range?.from) {
    const startUtc = Date.UTC(
      range.from.getUTCFullYear(),
      range.from.getUTCMonth(),
      range.from.getUTCDate()
    );
    count = Math.min(Math.max(Math.floor((endUtc - startUtc) / DAY_MS) + 1, 1), 31);
  }
  const daily: { day: string; value: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const key = new Date(endUtc - i * DAY_MS).toISOString().slice(0, 10);
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
