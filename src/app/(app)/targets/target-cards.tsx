"use client";

import { useRouter } from "next/navigation";
import { PartyPopper, Route, Check, Trash2 } from "lucide-react";
import { somoni, fmtDate } from "@/lib/money";
import { t } from "@/lib/i18n";
import { Shareable } from "../share-image";
import { deleteTarget } from "./actions";

type Tg = {
  id: string;
  title: string;
  amount: number;
  isReached: boolean;
  pct: number;
  reachedAt: Date | string | null;
};

function Bar({ pct }: { pct: number; reached?: boolean }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-refresh-surface-3">
      <div
        className="h-full rounded-full bg-refresh-sage"
        style={{ width: `${Math.max(2, pct)}%` }}
      />
    </div>
  );
}

/** Big branded pastel card for the current target — shareable as an image. */
export function CurrentTargetCard({
  current,
  totalRaised,
  today,
}: {
  current: Tg | null;
  totalRaised: number;
  today: string;
}) {
  if (!current) {
    return (
      <div className="card text-center">
        <p className="flex items-center justify-center gap-2 text-lg font-semibold text-refresh-sage">
          <PartyPopper className="h-5 w-5" /> Ҳамаи ҳадафҳо иҷро шуданд!
        </p>
        <p className="text-sm text-refresh-muted">Ҳадафи нав илова кунед.</p>
      </div>
    );
  }
  return (
    <Shareable filename="hadaf">
      <div
        className="rounded-2xl p-6 text-refresh-on-pastel"
        style={{ background: "linear-gradient(135deg,#CFDDDB,#C2DBE9)" }}
      >
        <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
          <Route className="h-4 w-4" /> {t.appName} · {t.currentTarget}
        </div>
        <div className="text-xl font-bold">{current.title}</div>

        <div className="mt-4 text-3xl font-extrabold">{somoni(totalRaised)}</div>
        <div className="text-sm font-medium opacity-80">аз {somoni(current.amount)}</div>

        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-refresh-on-pastel/15">
          <div
            className="h-full rounded-full bg-refresh-on-pastel"
            style={{ width: `${Math.max(2, current.pct)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-medium">
          <span className="font-bold">{current.pct.toFixed(0)}%</span>
          <span className="opacity-80">{today}</span>
        </div>
      </div>
    </Shareable>
  );
}

export function TargetList({ list, isAdmin }: { list: Tg[]; isAdmin: boolean }) {
  const router = useRouter();

  async function onDelete(id: string) {
    if (!confirm(t.confirmDelete)) return;
    try {
      const fd = new FormData();
      fd.set("id", id);
      const res: any = await deleteTarget(fd);
      if (res?.error) { alert(res.error); return; }
      router.refresh();
    } catch {
      alert(t.genericError);
    }
  }

  if (list.length === 0) return <p className="card text-refresh-muted">{t.noTargets}</p>;

  return (
    <div className="space-y-3">
      {list.map((tg) => (
        <div key={tg.id} className="card">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium">{tg.title}</div>
            <div className="flex items-center gap-2">
              {tg.isReached ? (
                <span className="chip gap-1 bg-refresh-sage text-refresh-on-pastel">
                  <Check className="h-3.5 w-3.5" /> {t.reached}
                </span>
              ) : (
                <span className="chip bg-refresh-blue text-refresh-on-pastel">{t.active}</span>
              )}
              {isAdmin && (
                <button
                  onClick={() => onDelete(tg.id)}
                  className="text-refresh-muted-2 hover:text-refresh-pink"
                  title={t.delete}
                  aria-label={t.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-2"><Bar pct={tg.pct} reached={tg.isReached} /></div>
          <div className="mt-1 flex justify-between text-xs text-refresh-muted">
            <span>{tg.pct.toFixed(0)}%</span>
            <span>{somoni(tg.amount)}</span>
          </div>
          {tg.isReached && tg.reachedAt && (
            <div className="mt-1 text-xs text-refresh-sage">{t.reachedOn}: {fmtDate(tg.reachedAt)}</div>
          )}
        </div>
      ))}
    </div>
  );
}
