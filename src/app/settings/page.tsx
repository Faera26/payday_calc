import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/AppShell";
import { InvitePartnerCard } from "@/components/household/InvitePartnerCard";

export const metadata: Metadata = {
  title: "Настройки",
};

export default function SettingsPage() {
  return (
    <AppShell eyebrow="Семья" title="Настройки">
      <div className="grid gap-3">
        <InvitePartnerCard />
        <section className="ios-panel scroll-fade-in p-4">
          <h2 className="text-lg font-semibold">Правило расчета</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Личные обязательные платежи оплачиваются каждым самостоятельно.
            Коэффициент для общих фондов и целей считается от остатка после них.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
