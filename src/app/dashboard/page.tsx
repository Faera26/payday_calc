import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { BudgetDashboard } from "@/components/budget/BudgetDashboard";

export const metadata: Metadata = {
  title: "Главная",
};

export default function DashboardPage() {
  return (
    <AppShell eyebrow="Семейный кошелек" title="Бюджет">
      <BudgetDashboard />
    </AppShell>
  );
}
