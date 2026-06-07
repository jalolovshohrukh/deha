import { getSession } from "@/lib/auth";
import { getTargetsWithProgress } from "@/lib/calc";
import { fmtDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { TargetForm } from "./target-form";
import { CurrentTargetCard, TargetList } from "./target-cards";

export default async function TargetsPage() {
  const user = await getSession();
  const isAdmin = user?.role === "admin";
  const { list, current, totalRaised } = await getTargetsWithProgress();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t.targets}</h1>

      <div className="mb-5">
        <CurrentTargetCard current={current} totalRaised={totalRaised} today={fmtDate(new Date())} />
      </div>

      {isAdmin && <TargetForm />}

      <h2 className="mb-2 mt-4 text-lg font-semibold">{t.all}</h2>
      <TargetList list={list} isAdmin={isAdmin} />
    </div>
  );
}
