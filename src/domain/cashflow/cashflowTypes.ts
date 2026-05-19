import type { AllocationShare, MemberId } from "../budget/budgetTypes";

export type CashflowDirection = "income" | "expense";

export type CashflowScope = "personal" | "shared" | "fund" | "goal";

export type CashflowEvent = {
  id: string;
  title: string;
  occurredAt: string;
  amount: number;
  direction: CashflowDirection;
  scope: CashflowScope;
  memberId?: MemberId;
  split?: AllocationShare[];
};

export type CashflowTimelineItem = CashflowEvent & {
  timestamp: number;
};

export type ReserveRequirement = {
  memberId: MemberId;
  memberName: string;
  eventId: string;
  title: string;
  occurredAt: string;
  requiredReserve: number;
};
