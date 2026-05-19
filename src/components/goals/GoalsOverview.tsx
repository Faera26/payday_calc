"use client";

import { Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { buildBudgetProjection } from "@/application/budget/budgetProjection";
import { formatMoney, formatPercent } from "@/application/budget/formatters";
import {
  MoneyField,
  PrimaryButton,
  TextField,
} from "@/design-system/FormControls";
import { useBudgetStore } from "@/stores/useBudgetStore";

const accents = ["#0f766e", "#7c3aed", "#2563eb", "#111827", "#c2410c"];

export const GoalsOverview = () => {
  const plannerState = useBudgetStore();
  const addGoal = useBudgetStore((state) => state.addGoal);
  const updateGoal = useBudgetStore((state) => state.updateGoal);
  const projection = useMemo(
    () => buildBudgetProjection(plannerState),
    [plannerState],
  );
  const [title, setTitle] = useState("Новая цель");
  const [targetAmount, setTargetAmount] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);

  const submit = () => {
    if (!title.trim() || targetAmount <= 0) {
      return;
    }

    addGoal({
      accent: accents[plannerState.goals.length % accents.length],
      currentAmount: 0,
      monthlyTarget,
      targetAmount,
      title: title.trim(),
    });
    setTitle("Новая цель");
    setTargetAmount(0);
    setMonthlyTarget(0);
  };

  return (
    <div className="grid gap-3">
      {projection.goals.map((goal) => (
        <article className="ios-panel scroll-fade-in p-4" key={goal.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">{goal.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatMoney(goal.currentAmount)} из{" "}
                {formatMoney(goal.targetAmount)}
              </p>
            </div>
            <span className="shrink-0 text-2xl font-semibold">
              {formatPercent(Math.min(goal.progress, 1))}
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: goal.accent,
                transform: `scaleX(${Math.min(goal.progress, 1)})`,
                transformOrigin: "left",
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MoneyField
              label="Уже накоплено"
              onValueChange={(value) =>
                updateGoal(goal.id, { currentAmount: value })
              }
              value={goal.currentAmount}
            />
            <MoneyField
              label="Цель"
              onValueChange={(value) =>
                updateGoal(goal.id, { targetAmount: value })
              }
              value={goal.targetAmount}
            />
            <MoneyField
              label="В месяц"
              onValueChange={(value) =>
                updateGoal(goal.id, { monthlyTarget: value })
              }
              value={goal.monthlyTarget}
            />
            <TextField
              label="Дедлайн"
              onChange={(event) =>
                updateGoal(goal.id, { deadline: event.target.value })
              }
              type="date"
              value={goal.deadline ?? ""}
            />
          </div>
        </article>
      ))}

      <section className="ios-panel scroll-fade-in p-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={18} weight="light" />
          <h2 className="text-lg font-semibold">Новая цель</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextField
            label="Название"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <MoneyField
            label="Сумма цели"
            onValueChange={setTargetAmount}
            value={targetAmount}
          />
          <MoneyField
            label="В месяц"
            onValueChange={setMonthlyTarget}
            value={monthlyTarget}
          />
        </div>
        <div className="mt-3">
          <PrimaryButton type="button" onClick={submit}>
            Добавить цель
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
};
