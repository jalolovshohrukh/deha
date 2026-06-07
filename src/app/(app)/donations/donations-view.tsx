"use client";

import { useState } from "react";
import { Plus, List } from "lucide-react";
import { t } from "@/lib/i18n";
import { DonationForm } from "./donation-form";

type Acc = { id: string; name: string };

function tabCls(active: boolean) {
  return `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    active ? "bg-white text-brand-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
  }`;
}

/** Donations page body: tab 1 = the add form, tab 2 = the history list.
 *  Viewers (no edit rights) only see the history. */
export function DonationsView({
  accounts,
  today,
  isAdmin,
  history,
}: {
  accounts: Acc[];
  today: string;
  isAdmin: boolean;
  history: React.ReactNode;
}) {
  const [tab, setTab] = useState<"new" | "history">(isAdmin ? "new" : "history");

  if (!isAdmin) return <>{history}</>;

  return (
    <>
      <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-1">
        <button type="button" onClick={() => setTab("new")} className={tabCls(tab === "new")}>
          <Plus className="h-4 w-4" /> {t.newDonation}
        </button>
        <button type="button" onClick={() => setTab("history")} className={tabCls(tab === "history")}>
          <List className="h-4 w-4" /> {t.list}
        </button>
      </div>

      {/* Both stay mounted so a half-filled form survives a peek at history */}
      <div className={tab === "new" ? "" : "hidden"}>
        <DonationForm accounts={accounts} today={today} embedded onSaved={() => setTab("history")} />
      </div>
      <div className={tab === "history" ? "" : "hidden"}>{history}</div>
    </>
  );
}
