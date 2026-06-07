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
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Route className="h-5 w-5 text-brand-600" />
            <span className="font-bold">{t.appName}</span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive(it.href) ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {it.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/audit"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive("/audit") ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.audit}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-500 sm:inline">{name}</span>
            <span className={`chip ${role === "admin" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600"}`}>
              {role === "admin" ? t.roleAdmin : t.roleViewer}
            </span>
            <form action={logoutAction}>
              <button className="btn-ghost px-2 py-1" title={t.logout} aria-label={t.logout}>
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white md:hidden">
        <div className="mx-auto flex max-w-5xl justify-around">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                isActive(it.href) ? "text-brand-600" : "text-gray-500"
              }`}
            >
              <it.Icon className="h-5 w-5" />
              {it.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
