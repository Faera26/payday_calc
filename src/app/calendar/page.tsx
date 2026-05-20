import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { BudgetDashboard } from "@/components/budget/BudgetDashboard";

export const metadata: Metadata = {
  title: "Операции",
};

export default function CalendarPage() {
  return (
    <AppShell eyebrow="Записи" title="Операции">
      <BudgetDashboard initialView="records" />
    </AppShell>
  );
}
