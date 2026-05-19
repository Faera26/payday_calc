"use client";

import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { useMemo } from "react";
import { buildBudgetProjection } from "@/application/budget/budgetProjection";
import {
  formatMoney,
  formatMonthLabel,
} from "@/application/budget/formatters";
import { ProgressRing } from "@/design-system/ProgressRing";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { AllocationList } from "./AllocationList";
import { CashflowAlertList } from "./CashflowAlertList";
import { CoefficientCard } from "./CoefficientCard";
import { BudgetRecommendationPanel } from "./BudgetRecommendationPanel";
import { QuickExpenseForm } from "./QuickExpenseForm";

export const BudgetDashboard = () => {
  const plannerState = useBudgetStore();
  const projection = useMemo(
    () => buildBudgetProjection(plannerState),
    [plannerState],
  );
  const disposableTotal = projection.disposableTotal;
  const freedomScore = disposableTotal
    ? projection.flexiblePool / disposableTotal
    : 0;

  return (
    <div className="grid gap-5">
      <section className="ios-panel scroll-fade-in overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">
              {formatMonthLabel(plannerState.planningMonth)}
            </p>
            <h2 className="mt-1 text-4xl font-semibold leading-tight">
              {formatMoney(disposableTotal)}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              остаток после личных обязательных платежей
            </p>
          </div>
          <ProgressRing
            accent="#111827"
            label="резерв"
            progress={freedomScore}
            value={`${Math.round(freedomScore * 100)}%`}
          />
        </div>
        <div className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
          <div className="rounded-[8px] bg-slate-100/80 p-3">
            <p className="text-sm text-slate-500">Доходы</p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(projection.incomeTotal)}
            </p>
          </div>
          <div className="rounded-[8px] bg-slate-100/80 p-3">
            <p className="text-sm text-slate-500">Факт трат</p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(projection.transactionsTotal)}
            </p>
          </div>
          <div className="rounded-[8px] bg-slate-100/80 p-3">
            <p className="text-sm text-slate-500">Личные обяз.</p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(projection.mandatoryPersonalTotal)}
            </p>
          </div>
          <div className="rounded-[8px] bg-slate-100/80 p-3">
            <p className="text-sm text-slate-500">Общие обяз.</p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(projection.mandatorySharedTotal)}
            </p>
          </div>
        </div>
        <button
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-500 premium-motion active:scale-[0.98]"
          onClick={plannerState.resetDemoData}
          type="button"
        >
          <ArrowCounterClockwise size={18} weight="light" />
          Сбросить демо-данные
        </button>
      </section>

      <QuickExpenseForm />
      <BudgetRecommendationPanel projection={projection} />
      <CoefficientCard coefficients={projection.coefficients} />
      <CashflowAlertList requirements={projection.reserveRequirements} />
      <AllocationList
        allocations={projection.goalAllocations}
        title="Цели по коэффициенту"
      />
    </div>
  );
};
