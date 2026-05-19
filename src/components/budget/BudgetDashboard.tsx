"use client";

import { useMemo, useState } from "react";
import {
  buildBudgetProjection,
  defaultBudgetDraft,
} from "@/application/budget/budgetProjection";
import { formatMoney } from "@/application/budget/formatters";
import { AmountInput } from "@/design-system/AmountInput";
import { ProgressRing } from "@/design-system/ProgressRing";
import type { MemberBudgetInput, MemberId } from "@/domain/budget/budgetTypes";
import { AllocationList } from "./AllocationList";
import { CashflowAlertList } from "./CashflowAlertList";
import { CoefficientCard } from "./CoefficientCard";

type MoneyField = "income" | "personalMandatory";

const updateMemberField = (
  members: MemberBudgetInput[],
  memberId: MemberId,
  field: MoneyField,
  value: number,
) =>
  members.map((member) =>
    member.id === memberId ? { ...member, [field]: value } : member,
  );

export const BudgetDashboard = () => {
  const [draft, setDraft] = useState(defaultBudgetDraft);
  const projection = useMemo(() => buildBudgetProjection(draft), [draft]);
  const disposableTotal = projection.coefficients.reduce(
    (sum, coefficient) => sum + coefficient.disposableIncome,
    0,
  );
  const mandatoryTotal = draft.sharedMandatory.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const plannedGoals = draft.goals.reduce(
    (sum, goal) => sum + goal.monthlyTarget,
    0,
  );
  const committedTotal = mandatoryTotal + plannedGoals;
  const freedomScore = disposableTotal
    ? Math.max(0, 1 - committedTotal / disposableTotal)
    : 0;

  const setMemberValue = (
    memberId: MemberId,
    field: MoneyField,
    value: number,
  ) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      members: updateMemberField(currentDraft.members, memberId, field, value),
    }));
  };

  return (
    <div className="grid gap-5">
      <section className="ios-panel scroll-fade-in overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Май 2026</p>
            <h2 className="mt-1 text-4xl font-semibold leading-tight">
              {formatMoney(disposableTotal)}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              доступно после личных обязательств
            </p>
          </div>
          <ProgressRing
            accent="#111827"
            label="свободно"
            progress={freedomScore}
            value={`${Math.round(freedomScore * 100)}%`}
          />
        </div>
      </section>

      <div className="grid gap-3">
        {draft.members.map((member) => (
          <div className="grid gap-3" key={member.id}>
            <AmountInput
              accent={member.id === "primary" ? "#111827" : "#2563eb"}
              label={`${member.name}: доход за месяц`}
              onChange={(value) => setMemberValue(member.id, "income", value)}
              value={member.income}
            />
            <AmountInput
              accent={member.id === "primary" ? "#64748b" : "#0f766e"}
              label={`${member.name}: личные платежи`}
              onChange={(value) =>
                setMemberValue(member.id, "personalMandatory", value)
              }
              value={member.personalMandatory}
            />
          </div>
        ))}
      </div>

      <CoefficientCard coefficients={projection.coefficients} />
      <CashflowAlertList requirements={projection.reserveRequirements} />
      <AllocationList
        allocations={projection.fundAllocations}
        title="Фонды по коэффициенту"
      />
      <AllocationList
        allocations={projection.goalAllocations}
        title="Цели накопления"
      />
    </div>
  );
};
