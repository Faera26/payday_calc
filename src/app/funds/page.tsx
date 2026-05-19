import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { FundsOverview } from "@/components/funds/FundsOverview";

export const metadata: Metadata = {
  title: "Фонды",
};

export default function FundsPage() {
  return (
    <AppShell eyebrow="Лимиты" title="Фонды">
      <FundsOverview />
    </AppShell>
  );
}
