"use client";

import { Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { buildScheduledIncomeEvents } from "@/application/budget/budgetProjection";
import {
  toMoscowDateTime,
  todayDateKey,
} from "@/application/budget/dateTime";
import { formatDateTime, formatMoney } from "@/application/budget/formatters";
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
  const plannerState = useBudgetStore();
  const members = useBudgetStore((state) => state.members);
  const incomeEvents = useBudgetStore((state) => state.incomeEvents);
  const addIncomeEvent = useBudgetStore((state) => state.addIncomeEvent);
  const updateIncomeSchedule = useBudgetStore(
    (state) => state.updateIncomeSchedule,
  );
  const scheduledEvents = useMemo(
    () => buildScheduledIncomeEvents(plannerState),
    [plannerState],
  );
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
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Расписание доходов</h2>
          <p className="mt-1 text-sm text-slate-500">
            Вписываешь один раз. Если дата попадает на выходной, выплата
            переносится на пятницу.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          10 / 25
        </span>
      </div>

      <div className="grid gap-3">
        {plannerState.incomeSchedules.map((schedule) => {
          const factEvent = scheduledEvents.find((event) =>
            event.id.includes(schedule.id),
          );

          return (
            <article className="rounded-[8px] bg-slate-100/80 p-3" key={schedule.id}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{schedule.title}</p>
                  <p className="text-sm text-slate-500">
                    {incomeKindLabel[schedule.kind]} ·{" "}
                    {factEvent ? formatDateTime(factEvent.occurredAt) : "без даты"}
                  </p>
                </div>
                <p className="shrink-0 font-semibold">
                  {formatMoney(schedule.amount)}
                </p>
              </div>
              <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                <MoneyField
                  label="Сумма"
                  onValueChange={(value) =>
                    updateIncomeSchedule(schedule.id, { amount: value })
                  }
                  value={schedule.amount}
                />
                <SelectField
                  label="Кому"
                  onChange={(event) =>
                    updateIncomeSchedule(schedule.id, {
                      memberId: event.target.value as MemberId,
                    })
                  }
                  value={schedule.memberId}
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </SelectField>
                <MoneyField
                  label="День месяца"
                  max={31}
                  min={1}
                  onValueChange={(value) =>
                    updateIncomeSchedule(schedule.id, {
                      dayOfMonth: Math.min(Math.max(value, 1), 31),
                    })
                  }
                  value={schedule.dayOfMonth}
                />
                <TextField
                  label="Время"
                  onChange={(event) =>
                    updateIncomeSchedule(schedule.id, {
                      time: event.target.value,
                    })
                  }
                  type="time"
                  value={schedule.time}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 rounded-[8px] bg-slate-100/80 p-3">
        <div className="flex items-center gap-2">
          <Plus size={18} weight="light" />
          <p className="font-semibold">Разовый допдоход</p>
        </div>
        <TextField
          label="Источник"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
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

      {incomeEvents.length > 0 ? (
        <div className="mt-4 grid gap-2">
          <p className="text-sm font-semibold text-slate-500">
            Разовые поступления
          </p>
          {incomeEvents.map((event) => (
            <div
              className="flex items-center justify-between gap-3 rounded-[8px] bg-slate-100/80 p-3"
              key={event.id}
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{event.title}</p>
                <p className="text-sm text-slate-500">
                  {formatDateTime(event.occurredAt)}
                </p>
              </div>
              <p className="shrink-0 font-semibold">{formatMoney(event.amount)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
