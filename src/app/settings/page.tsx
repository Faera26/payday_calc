import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { BudgetDashboard } from "@/components/budget/BudgetDashboard";

export const metadata: Metadata = {
  title: "План",
};

export default function SettingsPage() {
  return (
    <AppShell eyebrow="Настройки расчёта" title="План">
      <BudgetDashboard initialView="settings" />
    </AppShell>
  );
}
