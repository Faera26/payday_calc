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
import { getDateKey } from "./dateTime";

export type FundProgress = EditableBudgetFund & {
  remaining: number;
  spent: number;
};

export type GoalProgress = EditableSavingGoal & {
  remaining: number;
  progress: number;
};

export type BudgetProjection = {
  coefficients: ReturnType<typeof calculateParticipationCoefficients>;
  fundAllocations: SharedAllocation[];
  funds: FundProgress[];
  goalAllocations: SharedAllocation[];
  goals: GoalProgress[];
  incomeTotal: number;
  mandatoryPersonalTotal: number;
  mandatorySharedTotal: number;
  memberInputs: MemberBudgetInput[];
  reserveRequirements: ReturnType<typeof calculateReserveRequirements>;
  timeline: ReturnType<typeof buildCashflowTimeline>;
  transactionsTotal: number;
};

const sum = <T>(items: T[], selector: (item: T) => number) =>
  items.reduce((total, item) => total + selector(item), 0);

const getMemberName = (state: BudgetPlannerState, memberId: string) =>
  state.members.find((member) => member.id === memberId)?.name ?? "Участник";

const buildMemberInputs = (state: BudgetPlannerState): MemberBudgetInput[] =>
  state.members.map((member) => {
    const income = sum(
      state.incomeEvents.filter((event) => event.memberId === member.id),
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

export const buildBudgetProjection = (
  state: BudgetPlannerState,
): BudgetProjection => {
  const memberInputs = buildMemberInputs(state);
  const coefficients = calculateParticipationCoefficients(memberInputs);
  const mandatorySharedTotal = sum(
    state.mandatoryPayments.filter((payment) => payment.scope === "shared"),
    (payment) => payment.amount,
  );
  const mandatoryPersonalTotal = sum(
    state.mandatoryPayments.filter((payment) => payment.scope === "personal"),
    (payment) => payment.amount,
  );
  const fundAllocations = state.funds.map((fund) =>
    allocateSharedAmount(fund.title, fund.monthlyLimit, coefficients),
  );
  const goalAllocations = state.goals.map((goal) =>
    allocateSharedAmount(goal.title, goal.monthlyTarget, coefficients),
  );
  const funds = state.funds.map((fund) => {
    const spent = sum(
      state.transactions.filter(
        (transaction) =>
          transaction.kind === "fund" && transaction.categoryId === fund.id,
      ),
      (transaction) => transaction.amount,
    );

    return {
      ...fund,
      remaining: Math.max(0, fund.monthlyLimit - spent),
      spent,
    };
  });
  const goals = state.goals.map((goal) => ({
    ...goal,
    progress: goal.targetAmount ? goal.currentAmount / goal.targetAmount : 0,
    remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
  }));
  const cashflowEvents = [
    ...state.incomeEvents.map(incomeToCashflowEvent),
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
    fundAllocations,
    funds,
    goalAllocations,
    goals,
    incomeTotal: sum(state.incomeEvents, (event) => event.amount),
    mandatoryPersonalTotal,
    mandatorySharedTotal,
    memberInputs,
    reserveRequirements,
    timeline,
    transactionsTotal: sum(state.transactions, (event) => event.amount),
  };
};

export const buildCalendarEvents = (
  state: BudgetPlannerState,
): CalendarEvent[] => [
  ...state.incomeEvents.map((event) => ({
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
