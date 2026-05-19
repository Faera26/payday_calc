"use client";

import {
  ArrowCircleDown,
  ArrowCircleUp,
  CalendarCheck,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  buildCalendarDaySummary,
  buildCalendarEvents,
} from "@/application/budget/budgetProjection";
import { todayDateKey } from "@/application/budget/dateTime";
import { formatMoney, formatTime } from "@/application/budget/formatters";
import { TextField } from "@/design-system/FormControls";
import { useBudgetStore } from "@/stores/useBudgetStore";

export const CashflowTimeline = () => {
  const plannerState = useBudgetStore();
  const [selectedDate, setSelectedDate] = useState(todayDateKey());
  const daySummary = useMemo(
    () => buildCalendarDaySummary(plannerState, selectedDate),
    [plannerState, selectedDate],
  );
  const activeDates = useMemo(() => {
    const uniqueDates = Array.from(
      new Set(
        buildCalendarEvents(plannerState).map((event) =>
          event.occurredAt.slice(0, 10),
        ),
      ),
    );

    return uniqueDates.sort();
  }, [plannerState]);

  return (
    <div className="grid gap-4">
      <section className="ios-panel scroll-fade-in p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">День</h2>
            <p className="mt-1 text-sm text-slate-500">
              Выбери дату и смотри приходы, списания и фактические траты
            </p>
          </div>
          <CalendarCheck size={24} weight="light" />
        </div>
        <TextField
          label="Дата"
          onChange={(event) => setSelectedDate(event.target.value)}
          type="date"
          value={selectedDate}
        />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {activeDates.map((date) => (
            <button
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold premium-motion active:scale-[0.98] ${
                selectedDate === date
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
              key={date}
              onClick={() => setSelectedDate(date)}
              type="button"
            >
              {date.slice(8, 10)}.{date.slice(5, 7)}
            </button>
          ))}
        </div>
      </section>

      <section className="ios-panel scroll-fade-in p-4">
        <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
          <div className="rounded-[8px] bg-emerald-50 p-3">
            <p className="text-sm text-emerald-700">Пришло</p>
            <p className="mt-1 text-lg font-semibold text-emerald-950">
              {formatMoney(daySummary.income)}
            </p>
          </div>
          <div className="rounded-[8px] bg-slate-100 p-3">
            <p className="text-sm text-slate-500">Общее</p>
            <p className="mt-1 text-lg font-semibold">
              {formatMoney(daySummary.sharedExpense)}
            </p>
          </div>
          <div className="rounded-[8px] bg-slate-100 p-3">
            <p className="text-sm text-slate-500">Личное</p>
            <p className="mt-1 text-lg font-semibold">
              {formatMoney(daySummary.personalExpense)}
            </p>
          </div>
        </div>
      </section>

      <section className="ios-panel scroll-fade-in p-4">
        <h2 className="mb-3 text-lg font-semibold">Операции</h2>
        {daySummary.events.length === 0 ? (
          <p className="rounded-[8px] bg-slate-100 p-4 text-sm text-slate-500">
            В этот день пока нет доходов, платежей или трат.
          </p>
        ) : (
          <div className="grid gap-3">
            {daySummary.events.map((event) => {
              const isIncome = event.direction === "income";
              const Icon = isIncome ? ArrowCircleDown : ArrowCircleUp;

              return (
                <article
                  className="flex items-start gap-3 rounded-[8px] bg-slate-100/78 p-3"
                  key={event.id}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      isIncome
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-950 text-white"
                    }`}
                  >
                    <Icon size={22} weight="light" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{event.title}</p>
                        <p className="text-sm text-slate-500">
                          {formatTime(event.occurredAt)} · {event.label}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold">
                        {isIncome ? "+" : "-"}
                        {formatMoney(event.amount)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
