"use client";

import { Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { buildBudgetProjection } from "@/application/budget/budgetProjection";
import { formatMoney } from "@/application/budget/formatters";
import {
  MoneyField,
  PrimaryButton,
  TextField,
} from "@/design-system/FormControls";
import { useBudgetStore } from "@/stores/useBudgetStore";

const accents = ["#111827", "#2563eb", "#0f766e", "#c2410c", "#7c3aed"];

export const FundsOverview = () => {
  const plannerState = useBudgetStore();
  const addFund = useBudgetStore((state) => state.addFund);
  const updateFundLimit = useBudgetStore((state) => state.updateFundLimit);
  const projection = useMemo(
    () => buildBudgetProjection(plannerState),
    [plannerState],
  );
  const [title, setTitle] = useState("Новая категория");
  const [monthlyLimit, setMonthlyLimit] = useState(0);

  const submit = () => {
    if (!title.trim() || monthlyLimit <= 0) {
      return;
    }

    addFund({
      accent: accents[plannerState.funds.length % accents.length],
      monthlyLimit,
      title: title.trim(),
    });
    setTitle("Новая категория");
    setMonthlyLimit(0);
  };

  return (
    <div className="grid gap-3">
      {projection.funds.map((fund) => {
        const progress = fund.monthlyLimit ? fund.spent / fund.monthlyLimit : 0;

        return (
          <article className="ios-panel scroll-fade-in p-4" key={fund.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{fund.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  потрачено {formatMoney(fund.spent)}, осталось{" "}
                  {formatMoney(fund.remaining)}
                </p>
              </div>
              <span className="text-2xl font-semibold">
                {Math.round(Math.min(progress, 1) * 100)}%
              </span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: fund.accent,
                  transform: `scaleX(${Math.min(progress, 1)})`,
                  transformOrigin: "left",
                }}
              />
            </div>
            <MoneyField
              label="Месячный лимит"
              onValueChange={(value) => updateFundLimit(fund.id, value)}
              value={fund.monthlyLimit}
            />
          </article>
        );
      })}

      <section className="ios-panel scroll-fade-in p-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={18} weight="light" />
          <h2 className="text-lg font-semibold">Новая категория фонда</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextField
            label="Название"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <MoneyField
            label="Лимит"
            onValueChange={setMonthlyLimit}
            value={monthlyLimit}
          />
        </div>
        <div className="mt-3">
          <PrimaryButton type="button" onClick={submit}>
            Добавить категорию
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
};
