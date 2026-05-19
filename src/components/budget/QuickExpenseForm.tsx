"use client";

import { PlusCircle } from "@phosphor-icons/react";
import { useState } from "react";
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
  id: string;
  kind: TransactionKind;
  label: string;
};

export const QuickExpenseForm = () => {
  const funds = useBudgetStore((state) => state.funds);
  const goals = useBudgetStore((state) => state.goals);
  const members = useBudgetStore((state) => state.members);
  const addTransaction = useBudgetStore((state) => state.addTransaction);
  const categoryOptions: CategoryOption[] = [
    ...funds.map((fund) => ({
      id: fund.id,
      kind: "fund" as const,
      label: fund.title,
    })),
    ...goals.map((goal) => ({
      id: goal.id,
      kind: "goal" as const,
      label: goal.title,
    })),
    { id: "other", kind: "other", label: "Другое" },
  ];
  const [title, setTitle] = useState("Новая трата");
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState(categoryOptions[0]?.id ?? "other");
  const [scope, setScope] = useState<PaymentScope>("shared");
  const [memberId, setMemberId] = useState<MemberId>("primary");
  const [date, setDate] = useState(todayDateKey());
  const [time, setTime] = useState("18:00");

  const submit = () => {
    const selectedCategory =
      categoryOptions.find((option) => option.id === categoryId) ??
      categoryOptions.at(-1);

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
        <div>
          <h2 className="text-lg font-semibold">Добавить трату</h2>
          <p className="mt-1 text-sm text-slate-500">
            Продукты, авто, цель накопления или любая новая операция
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextField
          label="Название"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        <MoneyField label="Сумма" onValueChange={setAmount} value={amount} />
        <SelectField
          label="Категория"
          onChange={(event) => setCategoryId(event.target.value)}
          value={categoryId}
        >
          {categoryOptions.map((option) => (
            <option key={`${option.kind}-${option.id}`} value={option.id}>
              {option.label}
            </option>
          ))}
        </SelectField>
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
