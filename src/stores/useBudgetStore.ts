"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultBudgetState } from "@/application/budget/defaultBudgetState";
import type { MemberId } from "@/domain/budget/budgetTypes";
import type {
  BudgetPlannerState,
  EditableBudgetFund,
  EditableSavingGoal,
  ExpenseTransaction,
  IncomeEventPlan,
  MandatoryPaymentPlan,
} from "@/domain/budget/plannerTypes";

type BudgetStore = BudgetPlannerState & {
  addFund: (fund: Omit<EditableBudgetFund, "id">) => void;
  addGoal: (goal: Omit<EditableSavingGoal, "id">) => void;
  addIncomeEvent: (event: Omit<IncomeEventPlan, "id">) => void;
  addMandatoryPayment: (payment: Omit<MandatoryPaymentPlan, "id">) => void;
  addTransaction: (transaction: Omit<ExpenseTransaction, "id">) => void;
  resetDemoData: () => void;
  updateFundLimit: (fundId: string, monthlyLimit: number) => void;
  updateGoal: (goalId: string, patch: Partial<EditableSavingGoal>) => void;
  updateIncomeEvent: (
    eventId: string,
    patch: Partial<Omit<IncomeEventPlan, "id">>,
  ) => void;
  updateMandatoryPayment: (
    paymentId: string,
    patch: Partial<Omit<MandatoryPaymentPlan, "id">>,
  ) => void;
  updateMemberName: (memberId: MemberId, name: string) => void;
};

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      ...defaultBudgetState,
      addFund: (fund) =>
        set((state) => ({
          funds: [...state.funds, { ...fund, id: createId("fund") }],
        })),
      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, { ...goal, id: createId("goal") }],
        })),
      addIncomeEvent: (event) =>
        set((state) => ({
          incomeEvents: [
            ...state.incomeEvents,
            { ...event, id: createId("income") },
          ],
        })),
      addMandatoryPayment: (payment) =>
        set((state) => ({
          mandatoryPayments: [
            ...state.mandatoryPayments,
            { ...payment, id: createId("payment") },
          ],
        })),
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: createId("transaction") },
          ],
        })),
      resetDemoData: () => set(defaultBudgetState),
      updateFundLimit: (fundId, monthlyLimit) =>
        set((state) => ({
          funds: state.funds.map((fund) =>
            fund.id === fundId ? { ...fund, monthlyLimit } : fund,
          ),
        })),
      updateGoal: (goalId, patch) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId ? { ...goal, ...patch, id: goal.id } : goal,
          ),
        })),
      updateIncomeEvent: (eventId, patch) =>
        set((state) => ({
          incomeEvents: state.incomeEvents.map((event) =>
            event.id === eventId ? { ...event, ...patch } : event,
          ),
        })),
      updateMandatoryPayment: (paymentId, patch) =>
        set((state) => ({
          mandatoryPayments: state.mandatoryPayments.map((payment) =>
            payment.id === paymentId ? { ...payment, ...patch } : payment,
          ),
        })),
      updateMemberName: (memberId, name) =>
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId ? { ...member, name } : member,
          ),
        })),
    }),
    {
      name: "family-budget-planner-v2",
      partialize: ({
        funds,
        goals,
        incomeEvents,
        mandatoryPayments,
        members,
        transactions,
      }) => ({
        funds,
        goals,
        incomeEvents,
        mandatoryPayments,
        members,
        transactions,
      }),
    },
  ),
);
