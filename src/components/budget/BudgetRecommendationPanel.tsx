"use client";

import { useState } from "react";
import { getCategoryIcon } from "@/application/budget/categoryIcons";
import type { BudgetProjection } from "@/application/budget/budgetProjection";
import { formatDateTime, formatMoney } from "@/application/budget/formatters";

type BudgetRecommendationPanelProps = {
  projection: BudgetProjection;
};

export const BudgetRecommendationPanel = ({
  projection,
}: BudgetRecommendationPanelProps) => {
  const [mode, setMode] = useState<"month" | "paydays">("month");
  const visibleFunds = projection.funds.slice(0, 6);

  return (
    <section className="ios-panel scroll-fade-in p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Сколько можно тратить</h2>
          <p className="mt-1 text-sm text-slate-500">
            После личных платежей, общих обязательств и ежемесячных целей.
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 rounded-full bg-slate-100 p-1">
        <button
          className={`h-10 rounded-full text-sm font-semibold premium-motion ${
            mode === "month" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
          }`}
          onClick={() => setMode("month")}
          type="button"
        >
          Месяц
        </button>
        <button
          className={`h-10 rounded-full text-sm font-semibold premium-motion ${
            mode === "paydays"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500"
          }`}
          onClick={() => setMode("paydays")}
          type="button"
        >
          10 / 25
        </button>
      </div>

      {mode === "month" ? (
        <div className="grid gap-2">
          <div className="rounded-[8px] bg-slate-950 p-4 text-white">
            <p className="text-sm text-white/64">Свободно на гибкие траты</p>
            <p className="mt-1 text-3xl font-semibold">
              {formatMoney(projection.flexiblePool)}
            </p>
          </div>
          {visibleFunds.map((fund) => {
            const Icon = getCategoryIcon(fund.iconKey);

            return (
              <article
                className="rounded-[8px] bg-slate-100/80 p-3"
                key={fund.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-white"
                      style={{ color: fund.accent }}
                    >
                      <Icon size={20} weight="light" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{fund.title}</p>
                      <p className="text-sm text-slate-500">
                        в день {formatMoney(fund.dailyRecommendedLimit)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-lg font-semibold">
                    {formatMoney(fund.recommendedMonthlyLimit)}
                  </p>
                </div>
                {fund.overspentBy > 0 ? (
                  <p className="mt-2 rounded-[8px] bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Уже выше темпа на {formatMoney(fund.overspentBy)}. Остаток
                    на следующие дни пересчитан.
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-2">
          {projection.paydayWindows.map((window) => (
            <article className="rounded-[8px] bg-slate-100/80 p-3" key={window.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    Поступление {formatDateTime(window.startsAt)}
                  </p>
                  <p className="text-sm text-slate-500">
                    до {formatDateTime(window.endsAt)}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-semibold">
                  {formatMoney(window.availableForFunds)}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Пришло</p>
                  <p className="font-semibold">{formatMoney(window.income)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Цели</p>
                  <p className="font-semibold">
                    {formatMoney(window.goalContribution)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">В день</p>
                  <p className="font-semibold">
                    {formatMoney(window.dailyAvailable)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
