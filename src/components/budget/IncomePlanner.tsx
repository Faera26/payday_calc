"use client";

import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import {
  getDateInputValue,
  getTimeInputValue,
  toMoscowDateTime,
  todayDateKey,
} from "@/application/budget/dateTime";
import { formatMoney } from "@/application/budget/formatters";
import {
  MoneyField,
  PrimaryButton,
  SelectField,
  TextField,
} from "@/design-system/FormControls";
import type { MemberId } from "@/domain/budget/budgetTypes";
import type { IncomeKind } from "@/domain/budget/plannerTypes";
import { useBudgetStore } from "@/stores/useBudgetStore";

const incomeKindLabel: Record<IncomeKind, string> = {
  advance: "Аванс",
  extra: "Допдоход",
  salary: "Основная зарплата",
};

export const IncomePlanner = () => {
  const incomeEvents = useBudgetStore((state) => state.incomeEvents);
  const members = useBudgetStore((state) => state.members);
  const addIncomeEvent = useBudgetStore((state) => state.addIncomeEvent);
  const updateIncomeEvent = useBudgetStore((state) => state.updateIncomeEvent);
  const [title, setTitle] = useState("Родители перевели");
  const [amount, setAmount] = useState(0);
  const [memberId, setMemberId] = useState<MemberId>("primary");
  const [date, setDate] = useState(todayDateKey());
  const [time, setTime] = useState("12:00");

  const submit = () => {
    if (!title.trim() || amount <= 0) {
      return;
    }

    addIncomeEvent({
      amount,
      kind: "extra",
      memberId,
      occurredAt: toMoscowDateTime(date, time),
      title: title.trim(),
    });
    setTitle("Родители перевели");
    setAmount(0);
  };

  return (
    <section className="ios-panel scroll-fade-in p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Доходы</h2>
          <p className="mt-1 text-sm text-slate-500">
            Аванс, основная зарплата и разовые поступления
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          ₽
        </span>
      </div>

      <div className="grid gap-3">
        {members.map((member) => (
          <div className="grid gap-2" key={member.id}>
            <h3 className="text-sm font-semibold text-slate-500">
              {member.name}
            </h3>
            {incomeEvents
              .filter((event) => event.memberId === member.id)
              .map((event) => (
                <article className="rounded-[8px] bg-slate-100/80 p-3" key={event.id}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-slate-500">
                        {incomeKindLabel[event.kind]} · {formatMoney(event.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MoneyField
                      label="Сумма"
                      onValueChange={(value) =>
                        updateIncomeEvent(event.id, { amount: value })
                      }
                      value={event.amount}
                    />
                    <TextField
                      label="Дата"
                      onChange={(changeEvent) =>
                        updateIncomeEvent(event.id, {
                          occurredAt: toMoscowDateTime(
                            changeEvent.target.value,
                            getTimeInputValue(event.occurredAt),
                          ),
                        })
                      }
                      type="date"
                      value={getDateInputValue(event.occurredAt)}
                    />
                    <TextField
                      label="Время"
                      onChange={(changeEvent) =>
                        updateIncomeEvent(event.id, {
                          occurredAt: toMoscowDateTime(
                            getDateInputValue(event.occurredAt),
                            changeEvent.target.value,
                          ),
                        })
                      }
                      type="time"
                      value={getTimeInputValue(event.occurredAt)}
                    />
                    <TextField
                      label="Название"
                      onChange={(changeEvent) =>
                        updateIncomeEvent(event.id, {
                          title: changeEvent.target.value,
                        })
                      }
                      value={event.title}
                    />
                  </div>
                </article>
              ))}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 rounded-[8px] bg-slate-100/80 p-3">
        <div className="flex items-center gap-2">
          <Plus size={18} weight="light" />
          <p className="font-semibold">Добавить допдоход</p>
        </div>
        <TextField
          label="Источник"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        <div className="grid grid-cols-2 gap-2">
          <MoneyField
            label="Сумма"
            onValueChange={setAmount}
            value={amount}
          />
          <SelectField
            label="Кому"
            onChange={(event) => setMemberId(event.target.value as MemberId)}
            value={memberId}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </SelectField>
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
        <PrimaryButton type="button" onClick={submit}>
          Добавить доход
        </PrimaryButton>
      </div>
    </section>
  );
};
