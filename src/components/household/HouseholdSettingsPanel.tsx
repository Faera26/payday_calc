"use client";

import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { TextField } from "@/design-system/FormControls";
import { useBudgetStore } from "@/stores/useBudgetStore";

export const HouseholdSettingsPanel = () => {
  const members = useBudgetStore((state) => state.members);
  const resetDemoData = useBudgetStore((state) => state.resetDemoData);
  const updateMemberName = useBudgetStore((state) => state.updateMemberName);

  return (
    <section className="ios-panel scroll-fade-in p-4">
      <h2 className="text-lg font-semibold">Участники</h2>
      <p className="mt-1 text-sm text-slate-500">
        Эти имена используются во всех расчетах, календаре и распределении.
      </p>
      <div className="mt-4 grid gap-2">
        {members.map((member) => (
          <TextField
            key={member.id}
            label={member.id === "primary" ? "Первый супруг" : "Второй супруг"}
            onChange={(event) => updateMemberName(member.id, event.target.value)}
            value={member.name}
          />
        ))}
      </div>
      <button
        className="mt-4 flex h-10 items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-500 premium-motion active:scale-[0.98]"
        onClick={resetDemoData}
        type="button"
      >
        <ArrowCounterClockwise size={18} weight="light" />
        Сбросить демо-данные
      </button>
    </section>
  );
};
