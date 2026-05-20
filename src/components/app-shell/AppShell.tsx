import type { ReactNode } from "react";
import { DesktopNav, MobileNav } from "@/components/navigation/MobileNav";

type AppShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
};

export const AppShell = ({ children, eyebrow, title }: AppShellProps) => (
  <main className="min-h-dvh bg-slate-50 text-slate-950">
    <div className="flex min-h-dvh">
      <DesktopNav />
      <div className="min-w-0 flex-1 pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 lg:px-8 lg:py-6">
          <header className="mb-4 flex items-end justify-between gap-3 lg:mb-6">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-1 truncate text-2xl font-semibold text-slate-950 sm:text-3xl">
                {title}
              </h1>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
    <MobileNav />
  </main>
);
