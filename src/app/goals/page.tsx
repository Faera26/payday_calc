import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { BudgetDashboard } from "@/components/budget/BudgetDashboard";

export const metadata: Metadata = {
  title: "Цели",
};

export default function GoalsPage() {
  return (
    <AppShell eyebrow="Накопления" title="Цели">
      <BudgetDashboard initialView="goals" />
    </AppShell>
  );
}
