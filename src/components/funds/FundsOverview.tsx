"use client";

import { Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  categoryIconOptions,
  getCategoryIcon,
  type CategoryIconKey,
} from "@/application/budget/categoryIcons";
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
  const updateFundMeta = useBudgetStore((state) => state.updateFundMeta);
  const projection = useMemo(
    () => buildBudgetProjection(plannerState),
    [plannerState],
  );
  const [title, setTitle] = useState("Новая категория");
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [allocationWeight, setAllocationWeight] = useState(1);
  const [iconKey, setIconKey] = useState<CategoryIconKey>("cart");

  const submit = () => {
    if (!title.trim() || monthlyLimit <= 0) {
      return;
    }

    addFund({
      accent: accents[plannerState.funds.length % accents.length],
      allocationWeight,
      iconKey,
      monthlyLimit,
      title: title.trim(),
    });
    setTitle("Новая категория");
    setMonthlyLimit(0);
    setAllocationWeight(1);
    setIconKey("cart");
  };

  return (
    <div className="grid gap-3">
      {projection.funds.map((fund) => {
        const progress = fund.recommendedMonthlyLimit
          ? fund.spent / fund.recommendedMonthlyLimit
          : 0;
        const Icon = getCategoryIcon(fund.iconKey);

        return (
          <article className="ios-panel scroll-fade-in p-4" key={fund.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-100"
                  style={{ color: fund.accent }}
                >
                  <Icon size={24} weight="light" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold">{fund.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    потрачено {formatMoney(fund.spent)}
                  </p>
                </div>
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
            <div className="mb-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
              <div className="rounded-[8px] bg-slate-100/80 p-3">
                <p className="text-sm text-slate-500">Совет приложения</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatMoney(fund.recommendedMonthlyLimit)}
                </p>
              </div>
              <div className="rounded-[8px] bg-slate-100/80 p-3">
                <p className="text-sm text-slate-500">В день дальше</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatMoney(fund.dailyRecommendedLimit)}
                </p>
              </div>
            </div>
            {fund.overspentBy > 0 ? (
              <p className="mb-4 rounded-[8px] bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Перерасход относительно темпа: {formatMoney(fund.overspentBy)}.
                Следующие дни уже пересчитаны.
              </p>
            ) : null}
            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
              <MoneyField
                label="Ручной лимит"
                onValueChange={(value) => updateFundLimit(fund.id, value)}
                value={fund.monthlyLimit}
              />
              <MoneyField
                label="Вес авто-лимита"
                min={1}
                onValueChange={(value) =>
                  updateFundMeta(fund.id, {
                    allocationWeight: Math.max(1, value),
                  })
                }
                value={fund.allocationWeight}
              />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {categoryIconOptions.slice(0, 10).map((option) => {
                const OptionIcon = option.icon;
                const isSelected = fund.iconKey === option.key;

                return (
                  <button
                    aria-label={option.label}
                    className={`grid size-11 place-items-center rounded-full premium-motion active:scale-[0.96] ${
                      isSelected
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                    key={option.key}
                    onClick={() =>
                      updateFundMeta(fund.id, { iconKey: option.key })
                    }
                    type="button"
                  >
                    <OptionIcon size={20} weight="light" />
                  </button>
                );
              })}
            </div>
          </article>
        );
      })}

      <section className="ios-panel scroll-fade-in p-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={18} weight="light" />
          <h2 className="text-lg font-semibold">Новая категория фонда</h2>
        </div>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
          <TextField
            label="Название"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <MoneyField
            label="Ручной лимит"
            onValueChange={setMonthlyLimit}
            value={monthlyLimit}
          />
          <MoneyField
            label="Вес авто-лимита"
            min={1}
            onValueChange={(value) => setAllocationWeight(Math.max(1, value))}
            value={allocationWeight}
          />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {categoryIconOptions.slice(0, 10).map((option) => {
            const Icon = option.icon;
            const isSelected = iconKey === option.key;

            return (
              <button
                aria-label={option.label}
                className={`grid size-11 place-items-center rounded-full premium-motion active:scale-[0.96] ${
                  isSelected
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
                key={option.key}
                onClick={() => setIconKey(option.key)}
                type="button"
              >
                <Icon size={20} weight="light" />
              </button>
            );
          })}
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
