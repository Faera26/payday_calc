import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { CashflowTimeline } from "@/components/calendar/CashflowTimeline";

export const metadata: Metadata = {
  title: "Календарь",
};

export default function CalendarPage() {
  return (
    <AppShell eyebrow="Cashflow" title="Календарь">
      <CashflowTimeline />
    </AppShell>
  );
}
