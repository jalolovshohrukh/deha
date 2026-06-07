"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
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

  // Sliding "liquid glass" indicator for the mobile nav: measure the active
  // tab and animate a single capsule between positions. The nav stays mounted
  // across route changes (it lives in the layout), so this glides smoothly.
  const barRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const activeIndex = items.findIndex((it) => isActive(it.href));
  const [pill, setPill] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [glided, setGlided] = useState(false);

  useLayoutEffect(() => {
    function measure() {
      const bar = barRef.current;
      const el = itemRefs.current[activeIndex];
      if (!bar || !el) {
        setPill(null);
        return;
      }
      const b = bar.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setPill({ left: r.left - b.left, top: r.top - b.top, width: r.width, height: r.height });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, path]);

  // Don't animate the first placement (avoid a fly-in from 0,0).
  useLayoutEffect(() => {
    if (pill && !glided) {
      const id = requestAnimationFrame(() => setGlided(true));
      return () => cancelAnimationFrame(id);
    }
  }, [pill, glided]);

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

      {/* Mobile bottom nav — Apple-style floating "liquid glass" pill */}
      <nav className="fixed inset-x-3 bottom-[calc(0.9rem+env(safe-area-inset-bottom))] z-20 md:hidden">
        <div
          ref={barRef}
          className="relative flex items-center rounded-full border border-white/10 bg-refresh-surface/60 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
        >
          {/* sliding glass capsule behind the active tab */}
          {pill && (
            <span
              aria-hidden
              className={`pointer-events-none absolute z-0 rounded-full bg-white/10 ring-1 ring-inset ring-white/10 ${
                glided ? "transition-all duration-300 ease-out" : ""
              }`}
              style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
            />
          )}
          {items.map((it, i) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="relative z-10 flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors duration-200"
              >
                <it.Icon className={`h-5 w-5 ${active ? "text-refresh-text" : "text-refresh-muted"}`} />
                <span className={active ? "text-refresh-text" : "text-refresh-muted"}>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
