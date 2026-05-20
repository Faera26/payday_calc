"use client";

import {
  CalendarDots,
  ChartPieSlice,
  GearSix,
  House,
  Target,
  Wallet,
} from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: House, label: "Обзор" },
  { href: "/calendar", icon: CalendarDots, label: "Операции" },
  { href: "/funds", icon: Wallet, label: "Фонды" },
  { href: "/goals", icon: Target, label: "Цели" },
  { href: "/settings", icon: GearSix, label: "План" },
];

export const DesktopNav = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-slate-200/70 bg-white/90 px-4 py-5 backdrop-blur-xl lg:block">
      <Link className="flex items-center gap-3 rounded-[8px] px-2 py-2" href="/dashboard">
        <span className="grid size-10 place-items-center rounded-[8px] bg-slate-950 text-white">
          <ChartPieSlice size={21} weight="duotone" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-950">
            Семейный бюджет
          </span>
          <span className="block text-xs text-slate-500">Расходы и cashflow</span>
        </span>
      </Link>

      <nav className="mt-8 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              className={clsx(
                "flex h-11 items-center gap-3 rounded-[8px] px-3 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/90 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_42px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              aria-label={item.label}
              className={clsx(
                "grid h-14 min-w-0 place-items-center rounded-[8px] px-1 text-[11px] font-semibold transition-colors active:scale-[0.98]",
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              <span className="mt-0.5 max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
