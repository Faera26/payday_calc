export type MemberId = "primary" | "partner";

export type MoneyAmount = number;

export type MemberBudgetInput = {
  id: MemberId;
  name: string;
  income: MoneyAmount;
  personalMandatory: MoneyAmount;
};

export type ParticipationCoefficient = {
  memberId: MemberId;
  name: string;
  income: MoneyAmount;
  personalMandatory: MoneyAmount;
  disposableIncome: MoneyAmount;
  coefficient: number;
};

export type AllocationShare = {
  memberId: MemberId;
  name: string;
  coefficient: number;
  amount: MoneyAmount;
};

export type SharedAllocation = {
  title: string;
  totalAmount: MoneyAmount;
  shares: AllocationShare[];
};

export type BudgetFund = {
  id: string;
  title: string;
  monthlyLimit: MoneyAmount;
  spent: MoneyAmount;
  accent: string;
};

export type SavingGoal = {
  id: string;
  title: string;
  targetAmount: MoneyAmount;
  currentAmount: MoneyAmount;
  monthlyTarget: MoneyAmount;
  deadline?: string;
  accent: string;
};
