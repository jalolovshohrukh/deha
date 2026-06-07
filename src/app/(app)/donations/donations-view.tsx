"use client";

import { useState } from "react";
import { Plus, List } from "lucide-react";
import { Tabs } from "@/components/refresh/Tabs";
import { t } from "@/lib/i18n";
import { DonationForm } from "./donation-form";

type Acc = { id: string; name: string };
type TabKey = "new" | "history";

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
  const [tab, setTab] = useState<TabKey>(isAdmin ? "new" : "history");

  if (!isAdmin) return <>{history}</>;

  return (
    <>
      <Tabs<TabKey>
        className="mb-4"
        value={tab}
        onChange={setTab}
        ariaLabel={t.donations}
        items={[
          { value: "new", label: t.newDonation, icon: <Plus className="h-4 w-4" /> },
          { value: "history", label: t.list, icon: <List className="h-4 w-4" /> },
        ]}
      />

      {/* Both stay mounted so a half-filled form survives a peek at history */}
      <div className={tab === "new" ? "" : "hidden"}>
        <DonationForm accounts={accounts} today={today} embedded onSaved={() => setTab("history")} />
      </div>
      <div className={tab === "history" ? "" : "hidden"}>{history}</div>
    </>
  );
}
