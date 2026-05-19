import { allocateSharedAmount } from "@/domain/budget/allocateSharedAmount";
import { calculateParticipationCoefficients } from "@/domain/budget/calculateParticipationCoefficients";
import type {
  AllocationShare,
  MemberBudgetInput,
  SharedAllocation,
} from "@/domain/budget/budgetTypes";
import type {
  BudgetPlannerState,
  CalendarDaySummary,
  CalendarEvent,
  EditableBudgetFund,
  EditableSavingGoal,
  ExpenseTransaction,
  IncomeEventPlan,
  MandatoryPaymentPlan,
} from "@/domain/budget/plannerTypes";
import type { CashflowEvent } from "@/domain/cashflow/cashflowTypes";
import { buildCashflowTimeline } from "@/domain/cashflow/buildCashflowTimeline";
import { calculateReserveRequirements } from "@/domain/cashflow/calculateReserveRequirements";
import {
  countInclusiveDays,
  currentPlanningMonth,
  getDateKey,
  getDaysInMonth,
  getMonthEndDateTime,
  getMonthlyDateKey,
  moveWeekendDateToFriday,
  toMoscowDateTime,
  todayDateKey,
} from "./dateTime";

export type FundProgress = EditableBudgetFund & {
  dailyRecommendedLimit: number;
  expectedSpendToToday: number;
  manualRemaining: number;
  overspentBy: number;
  recommendedMonthlyLimit: number;
  recommendedRemaining: number;
  spent: number;
};

export type GoalProgress = EditableSavingGoal & {
  remaining: number;
  progress: number;
};

export type PaydayWindow = {
  availableForFunds: number;
  dailyAvailable: number;
  endsAt: string;
  goalContribution: number;
  id: string;
  income: number;
  mandatory: number;
  startsAt: string;
  title: string;
};

export type BudgetProjection = {
  coefficients: ReturnType<typeof calculateParticipationCoefficients>;
  disposableTotal: number;
  flexiblePool: number;
  fundAllocations: SharedAllocation[];
  funds: FundProgress[];
  generatedIncomeEvents: IncomeEventPlan[];
  goalAllocations: SharedAllocation[];
  goalMonthlyTotal: number;
  goals: GoalProgress[];
  incomeTotal: number;
  mandatoryPersonalTotal: number;
  mandatorySharedTotal: number;
  memberInputs: MemberBudgetInput[];
  paydayWindows: PaydayWindow[];
  reserveRequirements: ReturnType<typeof calculateReserveRequirements>;
  timeline: ReturnType<typeof buildCashflowTimeline>;
  transactionsTotal: number;
};

const sum = <T>(items: T[], selector: (item: T) => number) =>
  items.reduce((total, item) => total + selector(item), 0);

const getStateMonth = (state: BudgetPlannerState) =>
  state.planningMonth || currentPlanningMonth();

const getMemberName = (state: BudgetPlannerState, memberId: string) =>
  state.members.find((member) => member.id === memberId)?.name ?? "Участник";

export const buildScheduledIncomeEvents = (
  state: BudgetPlannerState,
): IncomeEventPlan[] => {
  const month = getStateMonth(state);

  return (state.incomeSchedules ?? []).map((schedule) => {
    const baseDate = getMonthlyDateKey(month, schedule.dayOfMonth);
    const paidDate = schedule.moveWeekendToFriday
      ? moveWeekendDateToFriday(baseDate)
      : baseDate;

    return {
      amount: schedule.amount,
      id: `scheduled-${schedule.id}-${month}`,
      kind: schedule.kind,
      memberId: schedule.memberId,
      occurredAt: toMoscowDateTime(paidDate, schedule.time),
      title: schedule.title,
    };
  });
};

const getAllIncomeEvents = (state: BudgetPlannerState) => [
  ...buildScheduledIncomeEvents(state),
  ...(state.incomeEvents ?? []),
];

const buildMemberInputs = (
  state: BudgetPlannerState,
  incomeEvents: IncomeEventPlan[],
): MemberBudgetInput[] =>
  state.members.map((member) => {
    const income = sum(
      incomeEvents.filter((event) => event.memberId === member.id),
      (event) => event.amount,
    );
    const personalMandatory = sum(
      state.mandatoryPayments.filter(
        (payment) =>
          payment.scope === "personal" && payment.memberId === member.id,
      ),
      (payment) => payment.amount,
    );

    return {
      id: member.id,
      income,
      name: member.name,
      personalMandatory,
    };
  });

const splitSharedAmount = (
  amount: number,
  coefficients: BudgetProjection["coefficients"],
): AllocationShare[] =>
  allocateSharedAmount("split", amount, coefficients).shares;

const getTransactionTitle = (
  transaction: ExpenseTransaction,
  state: BudgetPlannerState,
) => {
  if (transaction.kind === "fund") {
    const fund = state.funds.find((item) => item.id === transaction.categoryId);
    return fund ? `${transaction.title} · ${fund.title}` : transaction.title;
  }

  if (transaction.kind === "goal") {
    const goal = state.goals.find((item) => item.id === transaction.categoryId);
    return goal ? `${transaction.title} · ${goal.title}` : transaction.title;
  }

  return transaction.title;
};

const incomeToCashflowEvent = (event: IncomeEventPlan): CashflowEvent => ({
  amount: event.amount,
  direction: "income",
  id: event.id,
  memberId: event.memberId,
  occurredAt: event.occurredAt,
  scope: "personal",
  title: event.title,
});

const mandatoryToCashflowEvent = (
  payment: MandatoryPaymentPlan,
  coefficients: BudgetProjection["coefficients"],
): CashflowEvent => ({
  amount: payment.amount,
  direction: "expense",
  id: payment.id,
  memberId: payment.scope === "personal" ? payment.memberId : undefined,
  occurredAt: payment.dueAt,
  scope: payment.scope,
  split:
    payment.scope === "shared"
      ? splitSharedAmount(payment.amount, coefficients)
      : undefined,
  title: payment.title,
});

const transactionToCashflowEvent = (
  transaction: ExpenseTransaction,
  state: BudgetPlannerState,
  coefficients: BudgetProjection["coefficients"],
): CashflowEvent => ({
  amount: transaction.amount,
  direction: "expense",
  id: transaction.id,
  memberId: transaction.scope === "personal" ? transaction.memberId : undefined,
  occurredAt: transaction.occurredAt,
  scope: transaction.kind === "goal" ? "goal" : "fund",
  split:
    transaction.scope === "shared"
      ? splitSharedAmount(transaction.amount, coefficients)
      : undefined,
  title: getTransactionTitle(transaction, state),
});

const getFundWeightTotal = (funds: EditableBudgetFund[]) =>
  Math.max(1, sum(funds, (fund) => Math.max(0, fund.allocationWeight ?? 1)));

const getDayOfMonth = (dateKey: string) => Number(dateKey.slice(8, 10));

const buildFunds = (
  state: BudgetPlannerState,
  flexiblePool: number,
): FundProgress[] => {
  const weightTotal = getFundWeightTotal(state.funds);
  const month = getStateMonth(state);
  const daysInMonth = getDaysInMonth(month);
  const today = todayDateKey();
  const todayInPlanningMonth = today.startsWith(month)
    ? getDayOfMonth(today)
    : Math.min(getDayOfMonth(getMonthlyDateKey(month, daysInMonth)), daysInMonth);
  const remainingDays = Math.max(1, daysInMonth - todayInPlanningMonth + 1);

  return state.funds.map((fund) => {
    const spent = sum(
      state.transactions.filter(
        (transaction) =>
          transaction.kind === "fund" && transaction.categoryId === fund.id,
      ),
      (transaction) => transaction.amount,
    );
    const recommendedMonthlyLimit =
      (flexiblePool * Math.max(0, fund.allocationWeight ?? 1)) / weightTotal;
    const expectedSpendToToday =
      (recommendedMonthlyLimit / daysInMonth) * todayInPlanningMonth;
    const recommendedRemaining = Math.max(0, recommendedMonthlyLimit - spent);

    return {
      ...fund,
      dailyRecommendedLimit: recommendedRemaining / remainingDays,
      expectedSpendToToday,
      manualRemaining: Math.max(0, fund.monthlyLimit - spent),
      overspentBy: Math.max(0, spent - expectedSpendToToday),
      recommendedMonthlyLimit,
      recommendedRemaining,
      spent,
    };
  });
};

const buildPaydayWindows = (
  state: BudgetPlannerState,
  incomeEvents: IncomeEventPlan[],
  goalMonthlyTotal: number,
): PaydayWindow[] => {
  const month = getStateMonth(state);
  const monthEnd = getMonthEndDateTime(month);
  const groups = Array.from(
    incomeEvents.reduce((map, event) => {
      const dateKey = getDateKey(event.occurredAt);
      const current = map.get(dateKey) ?? [];
      map.set(dateKey, [...current, event]);
      return map;
    }, new Map<string, IncomeEventPlan[]>()),
  )
    .map(([dateKey, events]) => ({
      dateKey,
      events,
      income: sum(events, (event) => event.amount),
      startsAt: toMoscowDateTime(dateKey, "00:00"),
    }))
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
  const incomeTotal = Math.max(1, sum(incomeEvents, (event) => event.amount));

  return groups.map((group, index) => {
    const next = groups[index + 1];
    const endsAt = next
      ? toMoscowDateTime(next.dateKey, "00:00")
      : monthEnd;
    const mandatory = sum(
      state.mandatoryPayments.filter((payment) => {
        const due = new Date(payment.dueAt).getTime();
        return (
          due >= new Date(group.startsAt).getTime() &&
          due < new Date(endsAt).getTime()
        );
      }),
      (payment) => payment.amount,
    );
    const goalContribution = goalMonthlyTotal * (group.income / incomeTotal);
    const availableForFunds = Math.max(
      0,
      group.income - mandatory - goalContribution,
    );
    const inclusiveEndsAt = next
      ? toMoscowDateTime(next.dateKey, "00:00")
      : monthEnd;
    const days = countInclusiveDays(group.startsAt, inclusiveEndsAt);

    return {
      availableForFunds,
      dailyAvailable: availableForFunds / days,
      endsAt,
      goalContribution,
      id: group.dateKey,
      income: group.income,
      mandatory,
      startsAt: group.startsAt,
      title: `${group.dateKey.slice(8, 10)}.${group.dateKey.slice(5, 7)}`,
    };
  });
};

export const buildBudgetProjection = (
  state: BudgetPlannerState,
): BudgetProjection => {
  const generatedIncomeEvents = buildScheduledIncomeEvents(state);
  const incomeEvents = getAllIncomeEvents(state);
  const memberInputs = buildMemberInputs(state, incomeEvents);
  const coefficients = calculateParticipationCoefficients(memberInputs);
  const mandatorySharedTotal = sum(
    state.mandatoryPayments.filter((payment) => payment.scope === "shared"),
    (payment) => payment.amount,
  );
  const mandatoryPersonalTotal = sum(
    state.mandatoryPayments.filter((payment) => payment.scope === "personal"),
    (payment) => payment.amount,
  );
  const disposableTotal = sum(memberInputs, (member) =>
    Math.max(0, member.income - member.personalMandatory),
  );
  const goalMonthlyTotal = sum(state.goals, (goal) => goal.monthlyTarget);
  const flexiblePool = Math.max(
    0,
    disposableTotal - mandatorySharedTotal - goalMonthlyTotal,
  );
  const funds = buildFunds(state, flexiblePool);
  const fundAllocations = funds.map((fund) =>
    allocateSharedAmount(
      fund.title,
      fund.recommendedMonthlyLimit,
      coefficients,
    ),
  );
  const goalAllocations = state.goals.map((goal) =>
    allocateSharedAmount(goal.title, goal.monthlyTarget, coefficients),
  );
  const goals = state.goals.map((goal) => ({
    ...goal,
    progress: goal.targetAmount ? goal.currentAmount / goal.targetAmount : 0,
    remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
  }));
  const cashflowEvents = [
    ...incomeEvents.map(incomeToCashflowEvent),
    ...state.mandatoryPayments.map((payment) =>
      mandatoryToCashflowEvent(payment, coefficients),
    ),
    ...state.transactions.map((transaction) =>
      transactionToCashflowEvent(transaction, state, coefficients),
    ),
  ];
  const timeline = buildCashflowTimeline(cashflowEvents);
  const reserveRequirements = calculateReserveRequirements(
    cashflowEvents,
    coefficients,
  );

  return {
    coefficients,
    disposableTotal,
    flexiblePool,
    fundAllocations,
    funds,
    generatedIncomeEvents,
    goalAllocations,
    goalMonthlyTotal,
    goals,
    incomeTotal: sum(incomeEvents, (event) => event.amount),
    mandatoryPersonalTotal,
    mandatorySharedTotal,
    memberInputs,
    paydayWindows: buildPaydayWindows(state, incomeEvents, goalMonthlyTotal),
    reserveRequirements,
    timeline,
    transactionsTotal: sum(state.transactions, (event) => event.amount),
  };
};

export const buildCalendarEvents = (
  state: BudgetPlannerState,
): CalendarEvent[] => [
  ...getAllIncomeEvents(state).map((event) => ({
    amount: event.amount,
    direction: "income" as const,
    id: event.id,
    label:
      event.kind === "extra"
        ? `Допдоход · ${getMemberName(state, event.memberId)}`
        : `Доход · ${getMemberName(state, event.memberId)}`,
    memberId: event.memberId,
    occurredAt: event.occurredAt,
    title: event.title,
  })),
  ...state.mandatoryPayments.map((payment) => ({
    amount: payment.amount,
    direction: "expense" as const,
    id: payment.id,
    label:
      payment.scope === "shared"
        ? `Обязательный общий · ${payment.category}`
        : `Личный платеж · ${payment.category}`,
    memberId: payment.memberId,
    occurredAt: payment.dueAt,
    scope: payment.scope,
    title: payment.title,
  })),
  ...state.transactions.map((transaction) => ({
    amount: transaction.amount,
    direction: "expense" as const,
    id: transaction.id,
    label:
      transaction.scope === "shared"
        ? "Общая трата"
        : `Личная трата · ${getMemberName(state, transaction.memberId ?? "primary")}`,
    memberId: transaction.memberId,
    occurredAt: transaction.occurredAt,
    scope: transaction.scope,
    title: getTransactionTitle(transaction, state),
  })),
];

export const buildCalendarDaySummary = (
  state: BudgetPlannerState,
  dateKey: string,
): CalendarDaySummary => {
  const events = buildCalendarEvents(state)
    .filter((event) => getDateKey(event.occurredAt) === dateKey)
    .sort(
      (left, right) =>
        new Date(left.occurredAt).getTime() -
        new Date(right.occurredAt).getTime(),
    );
  const income = sum(
    events.filter((event) => event.direction === "income"),
    (event) => event.amount,
  );
  const sharedExpense = sum(
    events.filter(
      (event) => event.direction === "expense" && event.scope === "shared",
    ),
    (event) => event.amount,
  );
  const personalExpense = sum(
    events.filter(
      (event) => event.direction === "expense" && event.scope !== "shared",
    ),
    (event) => event.amount,
  );

  return {
    dateKey,
    events,
    income,
    personalExpense,
    sharedExpense,
    totalExpense: personalExpense + sharedExpense,
  };
};
