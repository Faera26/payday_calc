"use client";

import { PlusCircle } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { getCategoryIcon } from "@/application/budget/categoryIcons";
import { toMoscowDateTime, todayDateKey } from "@/application/budget/dateTime";
import {
  MoneyField,
  PrimaryButton,
  SelectField,
  TextField,
} from "@/design-system/FormControls";
import type { MemberId } from "@/domain/budget/budgetTypes";
import type { PaymentScope, TransactionKind } from "@/domain/budget/plannerTypes";
import { useBudgetStore } from "@/stores/useBudgetStore";

type CategoryOption = {
  accent: string;
  iconKey: string;
  id: string;
  kind: TransactionKind;
  label: string;
};

export const QuickExpenseForm = () => {
  const funds = useBudgetStore((state) => state.funds);
  const goals = useBudgetStore((state) => state.goals);
  const members = useBudgetStore((state) => state.members);
  const addTransaction = useBudgetStore((state) => state.addTransaction);
  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      ...funds.map((fund) => ({
        accent: fund.accent,
        iconKey: fund.iconKey,
        id: fund.id,
        kind: "fund" as const,
        label: fund.title,
      })),
      ...goals.map((goal) => ({
        accent: goal.accent,
        iconKey: "bank",
        id: goal.id,
        kind: "goal" as const,
        label: goal.title,
      })),
      {
        accent: "#64748b",
        iconKey: "tools",
        id: "other",
        kind: "other" as const,
        label: "Другое",
      },
    ],
    [funds, goals],
  );
  const [title, setTitle] = useState("Новая трата");
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState(
    categoryOptions[0]?.id ?? "other",
  );
  const [scope, setScope] = useState<PaymentScope>("shared");
  const [memberId, setMemberId] = useState<MemberId>("primary");
  const [date, setDate] = useState(todayDateKey());
  const [time, setTime] = useState("18:00");
  const selectedCategory =
    categoryOptions.find((option) => option.id === categoryId) ??
    categoryOptions[0];

  const submit = () => {
    if (!selectedCategory || !title.trim() || amount <= 0) {
      return;
    }

    addTransaction({
      amount,
      categoryId:
        selectedCategory.kind === "other" ? undefined : selectedCategory.id,
      kind: selectedCategory.kind,
      memberId: scope === "personal" ? memberId : undefined,
      occurredAt: toMoscowDateTime(date, time),
      scope,
      title: title.trim(),
    });
    setTitle("Новая трата");
    setAmount(0);
  };

  return (
    <section className="ios-panel scroll-fade-in p-4">
      <div className="mb-4 flex items-center gap-2">
        <PlusCircle size={22} weight="light" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Быстрая трата</h2>
          <p className="mt-1 text-sm text-slate-500">
            Выбери категорию плиткой, введи сумму и сохрани.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
        {categoryOptions.map((option) => {
          const Icon = getCategoryIcon(option.iconKey);
          const isSelected = selectedCategory?.id === option.id;

          return (
            <button
              className={`grid min-h-24 min-w-0 place-items-center rounded-[8px] p-2 text-center premium-motion active:scale-[0.98] ${
                isSelected
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
              key={`${option.kind}-${option.id}`}
              onClick={() => {
                setCategoryId(option.id);
                setTitle(option.label);
              }}
              type="button"
            >
              <span
                className="grid size-9 place-items-center rounded-full"
                style={{
                  backgroundColor: isSelected ? "rgba(255,255,255,0.12)" : "#fff",
                  color: isSelected ? "#fff" : option.accent,
                }}
              >
                <Icon size={20} weight="light" />
              </span>
              <span className="mt-2 max-w-full break-words text-xs font-semibold leading-tight">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
        <TextField
          label="Что купили"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        <MoneyField label="Сумма" onValueChange={setAmount} value={amount} />
        <SelectField
          label="Тип"
          onChange={(event) => setScope(event.target.value as PaymentScope)}
          value={scope}
        >
          <option value="shared">Общая по коэффициенту</option>
          <option value="personal">Личная</option>
        </SelectField>
        {scope === "personal" ? (
          <SelectField
            label="Кто платит"
            onChange={(event) => setMemberId(event.target.value as MemberId)}
            value={memberId}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </SelectField>
        ) : null}
        <TextField
          label="Дата"
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
        <TextField
          label="Время"
          onChange={(event) => setTime(event.target.value)}
          type="time"
          value={time}
        />
      </div>
      <div className="mt-3">
        <PrimaryButton type="button" onClick={submit}>
          Записать трату
        </PrimaryButton>
      </div>
    </section>
  );
};
