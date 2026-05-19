import type { ReactNode } from "react";
import { MobileNav } from "@/components/navigation/MobileNav";

type AppShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
};

export const AppShell = ({ children, eyebrow, title }: AppShellProps) => (
  <main className="safe-screen">
    <div className="mx-auto flex w-full max-w-md min-w-0 flex-col gap-5 px-4 py-5">
      <header className="scroll-fade-in">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold text-slate-950">{title}</h1>
      </header>
      {children}
    </div>
    <MobileNav />
  </main>
);
