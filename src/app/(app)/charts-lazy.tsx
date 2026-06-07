"use client";

import dynamic from "next/dynamic";

/** Placeholder shown while the (deferred) Recharts chunk loads. */
function ChartSkeleton() {
  return <div className="card h-[260px] animate-pulse bg-refresh-surface" />;
}

// Recharts (~the dashboard's biggest dependency) is heavy, so the charts are
// code-split into a client-only chunk loaded after the initial paint.
// next/dynamic requires the options to be an inline object literal.
export const DailyChart = dynamic(() => import("./charts").then((m) => m.DailyChart), {
  ssr: false,
  loading: ChartSkeleton,
});
export const MonthlyChart = dynamic(() => import("./charts").then((m) => m.MonthlyChart), {
  ssr: false,
  loading: ChartSkeleton,
});
export const AccountChart = dynamic(() => import("./charts").then((m) => m.AccountChart), {
  ssr: false,
  loading: ChartSkeleton,
});
export const AgeChart = dynamic(() => import("./charts").then((m) => m.AgeChart), {
  ssr: false,
  loading: ChartSkeleton,
});
export const FamilyChart = dynamic(() => import("./charts").then((m) => m.FamilyChart), {
  ssr: false,
  loading: ChartSkeleton,
});
