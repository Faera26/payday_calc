import type { MemberId } from "./budgetTypes";

export type IncomeKind = "advance" | "salary" | "extra";

export type PaymentScope = "personal" | "shared";

export type TransactionKind = "fund" | "goal" | "mandatory" | "other";

export type BudgetMember = {
  id: MemberId;
  name: string;
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
  accent: string;
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
  mandatoryPayments: MandatoryPaymentPlan[];
  members: BudgetMember[];
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
