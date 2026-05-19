import type { MemberId } from "./budgetTypes";

export type IncomeKind = "advance" | "salary" | "extra";

export type PaymentScope = "personal" | "shared";

export type TransactionKind = "fund" | "goal" | "mandatory" | "other";

export type BudgetMember = {
  id: MemberId;
  name: string;
};

export type IncomeSchedule = {
  id: string;
  memberId: MemberId;
  title: string;
  kind: Exclude<IncomeKind, "extra">;
  amount: number;
  dayOfMonth: number;
  time: string;
  moveWeekendToFriday: boolean;
};

export type IncomeEventPlan = {
  id: string;
  memberId: MemberId;
  title: string;
  kind: IncomeKind;
  amount: number;
  occurredAt: string;
};

export type MandatoryPaymentPlan = {
  id: string;
  memberId?: MemberId;
  title: string;
  category: string;
  amount: number;
  dueAt: string;
  scope: PaymentScope;
};

export type ExpenseTransaction = {
  id: string;
  title: string;
  amount: number;
  occurredAt: string;
  kind: TransactionKind;
  scope: PaymentScope;
  categoryId?: string;
  memberId?: MemberId;
};

export type EditableBudgetFund = {
  id: string;
  title: string;
  monthlyLimit: number;
  allocationWeight: number;
  accent: string;
  iconKey: string;
};

export type EditableSavingGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyTarget: number;
  deadline?: string;
  accent: string;
};

export type BudgetPlannerState = {
  funds: EditableBudgetFund[];
  goals: EditableSavingGoal[];
  incomeEvents: IncomeEventPlan[];
  incomeSchedules: IncomeSchedule[];
  mandatoryPayments: MandatoryPaymentPlan[];
  members: BudgetMember[];
  planningMonth: string;
  transactions: ExpenseTransaction[];
};

export type CalendarDaySummary = {
  dateKey: string;
  events: CalendarEvent[];
  income: number;
  personalExpense: number;
  sharedExpense: number;
  totalExpense: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  amount: number;
  occurredAt: string;
  direction: "income" | "expense";
  label: string;
  memberId?: MemberId;
  scope?: PaymentScope;
};
