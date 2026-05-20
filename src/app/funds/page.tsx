import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { BudgetDashboard } from "@/components/budget/BudgetDashboard";

export const metadata: Metadata = {
  title: "Фонды",
};

export default function FundsPage() {
  return (
    <AppShell eyebrow="Категории расходов" title="Фонды">
      <BudgetDashboard initialView="funds" />
    </AppShell>
  );
}
