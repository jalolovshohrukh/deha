"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, HandCoins, Landmark, Receipt, Target, Route, LogOut } from "lucide-react";
import { t } from "@/lib/i18n";
import { logoutAction } from "./logout-action";

const items = [
  { href: "/", label: t.dashboard, Icon: LayoutDashboard },
  { href: "/donations", label: t.donations, Icon: HandCoins },
  { href: "/accounts", label: t.accounts, Icon: Landmark },
  { href: "/expenses", label: t.expenses, Icon: Receipt },
  { href: "/targets", label: t.targets, Icon: Target },
];

export default function Nav({ name, role }: { name: string; role: string }) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-refresh-line bg-refresh-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Route className="h-5 w-5 text-refresh-sage" />
            <span className="font-bold text-refresh-text">{t.appName}</span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive(it.href)
                    ? "bg-refresh-surface text-refresh-text"
                    : "text-refresh-muted hover:bg-refresh-surface hover:text-refresh-text"
                }`}
              >
                {it.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/audit"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive("/audit")
                    ? "bg-refresh-surface text-refresh-text"
                    : "text-refresh-muted hover:bg-refresh-surface hover:text-refresh-text"
                }`}
              >
                {t.audit}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-refresh-muted sm:inline">{name}</span>
            <span
              className={`chip ${
                role === "admin"
                  ? "bg-refresh-sage text-refresh-on-pastel"
                  : "bg-refresh-surface-2 text-refresh-muted"
              }`}
            >
              {role === "admin" ? t.roleAdmin : t.roleViewer}
            </span>
            <form action={logoutAction}>
              <button className="btn-ghost px-2 py-1.5" title={t.logout} aria-label={t.logout}>
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav — floats above the bottom edge so it isn't flush */}
      <nav className="refresh-shadow-soft fixed inset-x-3 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 rounded-2xl border border-refresh-line bg-refresh-surface md:hidden">
        <div className="flex justify-around">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition ${
                isActive(it.href) ? "text-refresh-text" : "text-refresh-muted"
              }`}
            >
              <it.Icon className="h-6 w-6" />
              {it.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
