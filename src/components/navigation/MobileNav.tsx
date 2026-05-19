"use client";

import {
  CalendarDots,
  GearSix,
  House,
  Target,
  Wallet,
} from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: House, label: "Главная" },
  { href: "/calendar", icon: CalendarDots, label: "Календарь" },
  { href: "/funds", icon: Wallet, label: "Фонды" },
  { href: "/goals", icon: Target, label: "Цели" },
  { href: "/settings", icon: GearSix, label: "Настройки" },
];

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-md justify-between rounded-full border border-white/70 bg-white/88 p-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              aria-label={item.label}
              className={clsx(
                "grid size-12 place-items-center rounded-full premium-motion active:scale-[0.96]",
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:text-slate-950",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon size={22} weight="light" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
