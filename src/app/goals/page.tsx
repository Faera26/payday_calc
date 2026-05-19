import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { GoalsOverview } from "@/components/goals/GoalsOverview";

export const metadata: Metadata = {
  title: "Цели",
};

export default function GoalsPage() {
  return (
    <AppShell eyebrow="Накопления" title="Цели">
      <GoalsOverview />
    </AppShell>
  );
}
