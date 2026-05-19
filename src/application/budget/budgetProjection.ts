import { allocateSharedAmount } from "@/domain/budget/allocateSharedAmount";
import { calculateParticipationCoefficients } from "@/domain/budget/calculateParticipationCoefficients";
import type {
  BudgetFund,
  MemberBudgetInput,
  SavingGoal,
  SharedAllocation,
} from "@/domain/budget/budgetTypes";
import { calculateReserveRequirements } from "@/domain/cashflow/calculateReserveRequirements";
import type {
  CashflowEvent,
  ReserveRequirement,
} from "@/domain/cashflow/cashflowTypes";
import { buildCashflowTimeline } from "@/domain/cashflow/buildCashflowTimeline";

export type BudgetDraft = {
  members: MemberBudgetInput[];
  sharedMandatory: { id: string; title: string; amount: number }[];
  funds: BudgetFund[];
  goals: SavingGoal[];
  events: CashflowEvent[];
};

export type BudgetProjection = {
  coefficients: ReturnType<typeof calculateParticipationCoefficients>;
  sharedAllocations: SharedAllocation[];
  fundAllocations: SharedAllocation[];
  goalAllocations: SharedAllocation[];
  timeline: ReturnType<typeof buildCashflowTimeline>;
  reserveRequirements: ReserveRequirement[];
};

export const defaultBudgetDraft: BudgetDraft = {
  members: [
    {
      id: "primary",
      name: "Илья",
      income: 265_000,
      personalMandatory: 88_000,
    },
    {
      id: "partner",
      name: "Супруга",
      income: 155_000,
      personalMandatory: 42_000,
    },
  ],
  sharedMandatory: [
    { id: "utilities", title: "Коммунальные платежи", amount: 15_800 },
    { id: "subscriptions", title: "Подписки", amount: 5_900 },
  ],
  funds: [
    {
      id: "groceries",
      title: "Продукты",
      monthlyLimit: 78_000,
      spent: 38_400,
      accent: "#111827",
    },
    {
      id: "car",
      title: "Авто",
      monthlyLimit: 34_000,
      spent: 12_500,
      accent: "#2563eb",
    },
    {
      id: "leisure",
      title: "Выходные",
      monthlyLimit: 28_000,
      spent: 9_600,
      accent: "#c2410c",
    },
  ],
  goals: [
    {
      id: "renovation",
      title: "Большой ремонт",
      targetAmount: 1_400_000,
      currentAmount: 465_000,
      monthlyTarget: 120_000,
      deadline: "2026-12-20",
      accent: "#0f766e",
    },
    {
      id: "lighting",
      title: "Новое освещение",
      targetAmount: 240_000,
      currentAmount: 64_000,
      monthlyTarget: 38_000,
      deadline: "2026-08-15",
      accent: "#7c3aed",
    },
  ],
  events: [
    {
      id: "primary-advance",
      title: "Аванс Ильи",
      occurredAt: "2026-05-05T15:00:00+03:00",
      amount: 95_000,
      direction: "income",
      scope: "personal",
      memberId: "primary",
    },
    {
      id: "partner-advance",
      title: "Аванс супруги",
      occurredAt: "2026-05-05T15:00:00+03:00",
      amount: 62_000,
      direction: "income",
      scope: "personal",
      memberId: "partner",
    },
    {
      id: "mortgage",
      title: "Ипотека",
      occurredAt: "2026-05-15T10:00:00+03:00",
      amount: 78_000,
      direction: "expense",
      scope: "personal",
      memberId: "primary",
    },
    {
      id: "primary-salary",
      title: "Зарплата Ильи",
      occurredAt: "2026-05-15T15:00:00+03:00",
      amount: 170_000,
      direction: "income",
      scope: "personal",
      memberId: "primary",
    },
    {
      id: "partner-salary",
      title: "Зарплата супруги",
      occurredAt: "2026-05-15T15:00:00+03:00",
      amount: 93_000,
      direction: "income",
      scope: "personal",
      memberId: "partner",
    },
    {
      id: "shared-utilities",
      title: "Коммуналка",
      occurredAt: "2026-05-17T09:00:00+03:00",
      amount: 15_800,
      direction: "expense",
      scope: "shared",
    },
    {
      id: "renovation-goal",
      title: "Взнос на ремонт",
      occurredAt: "2026-05-20T12:00:00+03:00",
      amount: 120_000,
      direction: "expense",
      scope: "goal",
    },
  ],
};

export const buildBudgetProjection = (
  draft: BudgetDraft,
): BudgetProjection => {
  const coefficients = calculateParticipationCoefficients(draft.members);
  const sharedAllocations = draft.sharedMandatory.map((payment) =>
    allocateSharedAmount(payment.title, payment.amount, coefficients),
  );
  const fundAllocations = draft.funds.map((fund) =>
    allocateSharedAmount(fund.title, fund.monthlyLimit, coefficients),
  );
  const goalAllocations = draft.goals.map((goal) =>
    allocateSharedAmount(goal.title, goal.monthlyTarget, coefficients),
  );
  const timeline = buildCashflowTimeline(draft.events);
  const reserveRequirements = calculateReserveRequirements(
    draft.events,
    coefficients,
  );

  return {
    coefficients,
    sharedAllocations,
    fundAllocations,
    goalAllocations,
    timeline,
    reserveRequirements,
  };
};
