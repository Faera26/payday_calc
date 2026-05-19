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
import type { PaymentScope } from "@/domain/budget/plannerTypes";
import { useBudgetStore } from "@/stores/useBudgetStore";

export const MandatoryPaymentsPanel = () => {
  const members = useBudgetStore((state) => state.members);
  const mandatoryPayments = useBudgetStore((state) => state.mandatoryPayments);
  const addMandatoryPayment = useBudgetStore(
    (state) => state.addMandatoryPayment,
  );
  const updateMandatoryPayment = useBudgetStore(
    (state) => state.updateMandatoryPayment,
  );
  const [title, setTitle] = useState("Новый платеж");
  const [category, setCategory] = useState("Личное");
  const [amount, setAmount] = useState(0);
  const [scope, setScope] = useState<PaymentScope>("personal");
  const [memberId, setMemberId] = useState<MemberId>("primary");
  const [date, setDate] = useState(todayDateKey());
  const [time, setTime] = useState("10:00");

  const submit = () => {
    if (!title.trim() || amount <= 0) {
      return;
    }

    addMandatoryPayment({
      amount,
      category: category.trim() || "Без категории",
      dueAt: toMoscowDateTime(date, time),
      memberId: scope === "personal" ? memberId : undefined,
      scope,
      title: title.trim(),
    });
    setTitle("Новый платеж");
    setAmount(0);
  };

  return (
    <section className="ios-panel scroll-fade-in p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Обязательные платежи</h2>
          <p className="mt-1 text-sm text-slate-500">
            Личные вычитаются до коэффициента, общие делятся по коэффициенту
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {mandatoryPayments.map((payment) => (
          <article className="rounded-[8px] bg-slate-100/80 p-3" key={payment.id}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{payment.title}</p>
                <p className="text-sm text-slate-500">
                  {payment.scope === "shared" ? "Общий" : "Личный"} ·{" "}
                  {payment.category} · {formatMoney(payment.amount)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MoneyField
                label="Сумма"
                onValueChange={(value) =>
                  updateMandatoryPayment(payment.id, { amount: value })
                }
                value={payment.amount}
              />
              <TextField
                label="Название"
                onChange={(event) =>
                  updateMandatoryPayment(payment.id, {
                    title: event.target.value,
                  })
                }
                value={payment.title}
              />
              <TextField
                label="Категория"
                onChange={(event) =>
                  updateMandatoryPayment(payment.id, {
                    category: event.target.value,
                  })
                }
                value={payment.category}
              />
              <SelectField
                label="Тип"
                onChange={(event) =>
                  updateMandatoryPayment(payment.id, {
                    memberId:
                      event.target.value === "personal"
                        ? payment.memberId ?? "primary"
                        : undefined,
                    scope: event.target.value as PaymentScope,
                  })
                }
                value={payment.scope}
              >
                <option value="personal">Личный</option>
                <option value="shared">Общий</option>
              </SelectField>
              {payment.scope === "personal" ? (
                <SelectField
                  label="Кто платит"
                  onChange={(event) =>
                    updateMandatoryPayment(payment.id, {
                      memberId: event.target.value as MemberId,
                    })
                  }
                  value={payment.memberId ?? "primary"}
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
                onChange={(event) =>
                  updateMandatoryPayment(payment.id, {
                    dueAt: toMoscowDateTime(
                      event.target.value,
                      getTimeInputValue(payment.dueAt),
                    ),
                  })
                }
                type="date"
                value={getDateInputValue(payment.dueAt)}
              />
              <TextField
                label="Время"
                onChange={(event) =>
                  updateMandatoryPayment(payment.id, {
                    dueAt: toMoscowDateTime(
                      getDateInputValue(payment.dueAt),
                      event.target.value,
                    ),
                  })
                }
                type="time"
                value={getTimeInputValue(payment.dueAt)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-2 rounded-[8px] bg-slate-100/80 p-3">
        <div className="flex items-center gap-2">
          <Plus size={18} weight="light" />
          <p className="font-semibold">Добавить обязательный платеж</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextField
            label="Название"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <TextField
            label="Категория"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          />
          <MoneyField
            label="Сумма"
            onValueChange={setAmount}
            value={amount}
          />
          <SelectField
            label="Тип"
            onChange={(event) => setScope(event.target.value as PaymentScope)}
            value={scope}
          >
            <option value="personal">Личный</option>
            <option value="shared">Общий</option>
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
        <PrimaryButton type="button" onClick={submit}>
          Добавить платеж
        </PrimaryButton>
      </div>
    </section>
  );
};
