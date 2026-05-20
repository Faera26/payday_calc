"use client";

import {
  ArrowCircleDown,
  ArrowCircleUp,
  Bank,
  CalendarDots,
  ChartPieSlice,
  CreditCard,
  GearSix,
  House,
  PencilSimple,
  Plus,
  Receipt,
  Target,
  Trash,
  Wallet,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  buildBudgetProjection,
  type BudgetProjection,
} from "@/application/budget/budgetProjection";
import {
  categoryIconOptions,
  getCategoryIcon,
  type CategoryIconKey,
} from "@/application/budget/categoryIcons";
import {
  getDateInputValue,
  getTimeInputValue,
  toMoscowDateTime,
  todayDateKey,
} from "@/application/budget/dateTime";
import {
  formatDateTime,
  formatMoney,
  formatMonthLabel,
  formatPercent,
} from "@/application/budget/formatters";
import { BottomSheet } from "@/design-system/BottomSheet";
import {
  MoneyField,
  PrimaryButton,
  SelectField,
  TextField,
} from "@/design-system/FormControls";
import type { MemberId } from "@/domain/budget/budgetTypes";
import type {
  BudgetPlannerState,
  PaymentScope,
  TransactionKind,
} from "@/domain/budget/plannerTypes";
import { useBudgetStore } from "@/stores/useBudgetStore";

export type DashboardView = "overview" | "records" | "funds" | "goals" | "settings";

type BudgetDashboardProps = {
  initialView?: DashboardView;
};

type CommandMode = "expense" | "income" | "payment" | "fund" | "goal";

type EditTarget =
  | { id: string; type: "transaction" }
  | { id: string; type: "income" }
  | { id: string; type: "payment" }
  | { id: string; type: "fund" }
  | { id: string; type: "goal" };

type SheetState = {
  editTarget?: EditTarget;
  isOpen: boolean;
  mode: CommandMode;
};

type ActivityItem = {
  amount: number;
  direction: "income" | "expense";
  editTarget: EditTarget;
  id: string;
  label: string;
  occurredAt: string;
  title: string;
};

const viewItems: { icon: Icon; id: DashboardView; label: string }[] = [
  { icon: House, id: "overview", label: "Обзор" },
  { icon: CalendarDots, id: "records", label: "Операции" },
  { icon: Wallet, id: "funds", label: "Фонды" },
  { icon: Target, id: "goals", label: "Цели" },
  { icon: GearSix, id: "settings", label: "План" },
];

const commandItems: { icon: Icon; id: CommandMode; label: string }[] = [
  { icon: Receipt, id: "expense", label: "Трата" },
  { icon: ArrowCircleDown, id: "income", label: "Доход" },
  { icon: CreditCard, id: "payment", label: "Платёж" },
  { icon: Wallet, id: "fund", label: "Фонд" },
  { icon: Target, id: "goal", label: "Цель" },
];

const modeByEditType: Record<EditTarget["type"], CommandMode> = {
  fund: "fund",
  goal: "goal",
  income: "income",
  payment: "payment",
  transaction: "expense",
};

const accentOptions = ["#0f766e", "#2563eb", "#c2410c", "#7c3aed", "#111827"];

const incomeKindLabel = {
  advance: "Аванс",
  extra: "Разовый доход",
  salary: "Зарплата",
};

const scopeLabel: Record<PaymentScope, string> = {
  personal: "Личное",
  shared: "Общее",
};

const clampProgress = (value: number) => Math.max(0, Math.min(1, value));

const getMemberName = (state: BudgetPlannerState, memberId?: MemberId) =>
  state.members.find((member) => member.id === memberId)?.name ?? "Без участника";

const getTransactionCategory = (
  state: BudgetPlannerState,
  kind: TransactionKind,
  categoryId?: string,
) => {
  if (kind === "fund") {
    return state.funds.find((fund) => fund.id === categoryId)?.title ?? "Фонд";
  }

  if (kind === "goal") {
    return state.goals.find((goal) => goal.id === categoryId)?.title ?? "Цель";
  }

  return "Другое";
};

const buildActivityItems = (state: BudgetPlannerState): ActivityItem[] => [
  ...state.transactions.map((transaction) => ({
    amount: transaction.amount,
    direction: "expense" as const,
    editTarget: { id: transaction.id, type: "transaction" as const },
    id: `transaction-${transaction.id}`,
    label: `${scopeLabel[transaction.scope]} · ${getTransactionCategory(
      state,
      transaction.kind,
      transaction.categoryId,
    )}`,
    occurredAt: transaction.occurredAt,
    title: transaction.title,
  })),
  ...state.incomeEvents.map((event) => ({
    amount: event.amount,
    direction: "income" as const,
    editTarget: { id: event.id, type: "income" as const },
    id: `income-${event.id}`,
    label: `${incomeKindLabel[event.kind]} · ${getMemberName(state, event.memberId)}`,
    occurredAt: event.occurredAt,
    title: event.title,
  })),
  ...state.mandatoryPayments.map((payment) => ({
    amount: payment.amount,
    direction: "expense" as const,
    editTarget: { id: payment.id, type: "payment" as const },
    id: `payment-${payment.id}`,
    label: `${scopeLabel[payment.scope]} · ${payment.category}`,
    occurredAt: payment.dueAt,
    title: payment.title,
  })),
].sort(
  (left, right) =>
    new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
);

export const BudgetDashboard = ({
  initialView = "overview",
}: BudgetDashboardProps) => {
  const plannerState = useBudgetStore();
  const projection = useMemo(
    () => buildBudgetProjection(plannerState),
    [plannerState],
  );
  const activityItems = useMemo(
    () => buildActivityItems(plannerState),
    [plannerState],
  );
  const [activeView, setActiveView] = useState<DashboardView>(initialView);
  const [sheet, setSheet] = useState<SheetState>({
    isOpen: false,
    mode: "expense",
  });

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  const openAdd = (mode: CommandMode) =>
    setSheet({ editTarget: undefined, isOpen: true, mode });

  const openEdit = (editTarget: EditTarget) =>
    setSheet({
      editTarget,
      isOpen: true,
      mode: modeByEditType[editTarget.type],
    });

  const closeSheet = () =>
    setSheet((current) => ({ ...current, editTarget: undefined, isOpen: false }));

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 gap-4">
          <SummaryHero
            onAdd={openAdd}
            projection={projection}
            state={plannerState}
          />
          <ViewSwitcher activeView={activeView} onChange={setActiveView} />
          {activeView === "overview" ? (
            <OverviewView
              onEdit={openEdit}
              projection={projection}
            />
          ) : null}
          {activeView === "records" ? (
            <RecordsView
              activityItems={activityItems}
              onAdd={openAdd}
              onEdit={openEdit}
            />
          ) : null}
          {activeView === "funds" ? (
            <FundsView onAdd={openAdd} onEdit={openEdit} projection={projection} />
          ) : null}
          {activeView === "goals" ? (
            <GoalsView onAdd={openAdd} onEdit={openEdit} projection={projection} />
          ) : null}
          {activeView === "settings" ? (
            <SettingsView onAdd={openAdd} onEdit={openEdit} state={plannerState} />
          ) : null}
        </div>

        <RightRail
          activityItems={activityItems}
          onAdd={openAdd}
          projection={projection}
          state={plannerState}
        />
      </div>

      <CommandSheet
        editTarget={sheet.editTarget}
        isOpen={sheet.isOpen}
        mode={sheet.mode}
        onClose={closeSheet}
        onModeChange={(mode) => setSheet((current) => ({ ...current, mode }))}
        state={plannerState}
      />
    </>
  );
};

const SummaryHero = ({
  onAdd,
  projection,
  state,
}: {
  onAdd: (mode: CommandMode) => void;
  projection: BudgetProjection;
  state: BudgetPlannerState;
}) => {
  const mandatoryTotal =
    projection.mandatoryPersonalTotal + projection.mandatorySharedTotal;

  return (
    <section className="ios-panel overflow-hidden p-4 lg:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <span>{formatMonthLabel(state.planningMonth)}</span>
            <span className="size-1 rounded-full bg-slate-300" />
            <span>свободный бюджет</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="text-4xl font-semibold leading-none tracking-normal sm:text-5xl">
              {formatMoney(projection.flexiblePool)}
            </p>
            <span className="mb-1 rounded-[8px] bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
              {formatPercent(
                projection.disposableTotal
                  ? projection.flexiblePool / projection.disposableTotal
                  : 0,
              )}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 2xl:grid-cols-4">
            <MetricTile label="Доходы" value={formatMoney(projection.incomeTotal)} />
            <MetricTile label="Обязательные" value={formatMoney(mandatoryTotal)} />
            <MetricTile
              label="Факт трат"
              value={formatMoney(projection.transactionsTotal)}
            />
            <MetricTile
              label="Цели в месяц"
              value={formatMoney(projection.goalMonthlyTotal)}
            />
          </div>
        </div>

        <div className="grid content-start gap-2">
          <div className="grid grid-cols-3 gap-2">
            {commandItems.slice(0, 3).map((item) => (
              <CommandButton item={item} key={item.id} onClick={onAdd} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {commandItems.slice(3).map((item) => (
              <CommandButton item={item} key={item.id} onClick={onAdd} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const MetricTile = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 rounded-[8px] bg-slate-100/80 p-3">
    <p className="truncate text-xs font-semibold uppercase text-slate-500">
      {label}
    </p>
    <p className="mt-1 truncate text-lg font-semibold text-slate-950">{value}</p>
  </div>
);

const CommandButton = ({
  item,
  onClick,
}: {
  item: { icon: Icon; id: CommandMode; label: string };
  onClick: (mode: CommandMode) => void;
}) => {
  const Icon = item.icon;

  return (
    <button
      className="flex h-14 min-w-0 items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-2 text-sm font-semibold text-white premium-motion active:scale-[0.98]"
      onClick={() => onClick(item.id)}
      type="button"
    >
      <Icon size={19} weight="regular" />
      <span className="truncate">{item.label}</span>
    </button>
  );
};

const ViewSwitcher = ({
  activeView,
  onChange,
}: {
  activeView: DashboardView;
  onChange: (view: DashboardView) => void;
}) => (
  <div className="ios-panel overflow-x-auto p-1">
    <div className="flex min-w-max gap-1">
      {viewItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            className={clsx(
              "flex h-11 min-w-28 items-center justify-center gap-2 rounded-[8px] px-3 text-sm font-semibold premium-motion active:scale-[0.98]",
              isActive
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
            )}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <Icon size={18} weight={isActive ? "fill" : "regular"} />
            {item.label}
          </button>
        );
      })}
    </div>
  </div>
);

const OverviewView = ({
  onEdit,
  projection,
}: {
  onEdit: (target: EditTarget) => void;
  projection: BudgetProjection;
}) => (
  <div className="grid gap-4 xl:grid-cols-2">
    <section className="ios-panel p-4">
      <SectionHeader
        icon={Wallet}
        title="Фонды сегодня"
        trailing={`${projection.funds.length} шт.`}
      />
      <div className="mt-3 grid gap-2">
        {projection.funds.map((fund) => (
          <FundRow
            fund={fund}
            key={fund.id}
            onEdit={() => onEdit({ id: fund.id, type: "fund" })}
          />
        ))}
      </div>
    </section>

    <section className="ios-panel p-4">
      <SectionHeader
        icon={Target}
        title="Цели"
        trailing={formatMoney(projection.goalMonthlyTotal)}
      />
      <div className="mt-3 grid gap-2">
        {projection.goals.map((goal) => (
          <GoalRow
            goal={goal}
            key={goal.id}
            onEdit={() => onEdit({ id: goal.id, type: "goal" })}
          />
        ))}
      </div>
    </section>

    <section className="ios-panel p-4 xl:col-span-2">
      <SectionHeader icon={ChartPieSlice} title="Участие в общих расходах" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {projection.coefficients.map((coefficient) => (
          <div
            className="rounded-[8px] bg-slate-100/80 p-3"
            key={coefficient.memberId}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{coefficient.name}</p>
              <p className="font-semibold">
                {formatPercent(coefficient.coefficient)}
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              доход {formatMoney(coefficient.income)} · личные{" "}
              {formatMoney(coefficient.personalMandatory)}
            </p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const RecordsView = ({
  activityItems,
  onAdd,
  onEdit,
}: {
  activityItems: ActivityItem[];
  onAdd: (mode: CommandMode) => void;
  onEdit: (target: EditTarget) => void;
}) => (
  <section className="ios-panel p-4">
    <SectionHeader
      icon={CalendarDots}
      title="Операции"
      trailing={
        <button
          className="flex h-9 items-center gap-2 rounded-[8px] bg-slate-950 px-3 text-sm font-semibold text-white active:scale-[0.98]"
          onClick={() => onAdd("expense")}
          type="button"
        >
          <Plus size={17} />
          Запись
        </button>
      }
    />
    <div className="mt-3 grid gap-2">
      {activityItems.length === 0 ? (
        <EmptyState text="Пока нет операций. Добавь первую трату или доход." />
      ) : (
        activityItems.map((item) => (
          <ActivityRow item={item} key={item.id} onEdit={onEdit} />
        ))
      )}
    </div>
  </section>
);

const FundsView = ({
  onAdd,
  onEdit,
  projection,
}: {
  onAdd: (mode: CommandMode) => void;
  onEdit: (target: EditTarget) => void;
  projection: BudgetProjection;
}) => (
  <section className="ios-panel p-4">
    <SectionHeader
      icon={Wallet}
      title="Фонды расходов"
      trailing={
        <button
          className="flex h-9 items-center gap-2 rounded-[8px] bg-slate-950 px-3 text-sm font-semibold text-white active:scale-[0.98]"
          onClick={() => onAdd("fund")}
          type="button"
        >
          <Plus size={17} />
          Фонд
        </button>
      }
    />
    <div className="mt-3 grid gap-2">
      {projection.funds.map((fund) => (
        <FundRow
          fund={fund}
          key={fund.id}
          onEdit={() => onEdit({ id: fund.id, type: "fund" })}
        />
      ))}
    </div>
  </section>
);

const GoalsView = ({
  onAdd,
  onEdit,
  projection,
}: {
  onAdd: (mode: CommandMode) => void;
  onEdit: (target: EditTarget) => void;
  projection: BudgetProjection;
}) => (
  <section className="ios-panel p-4">
    <SectionHeader
      icon={Target}
      title="Цели накоплений"
      trailing={
        <button
          className="flex h-9 items-center gap-2 rounded-[8px] bg-slate-950 px-3 text-sm font-semibold text-white active:scale-[0.98]"
          onClick={() => onAdd("goal")}
          type="button"
        >
          <Plus size={17} />
          Цель
        </button>
      }
    />
    <div className="mt-3 grid gap-2">
      {projection.goals.map((goal) => (
        <GoalRow
          goal={goal}
          key={goal.id}
          onEdit={() => onEdit({ id: goal.id, type: "goal" })}
        />
      ))}
    </div>
  </section>
);

const SettingsView = ({
  onAdd,
  onEdit,
  state,
}: {
  onAdd: (mode: CommandMode) => void;
  onEdit: (target: EditTarget) => void;
  state: BudgetPlannerState;
}) => {
  const updateIncomeSchedule = useBudgetStore((store) => store.updateIncomeSchedule);
  const updateMemberName = useBudgetStore((store) => store.updateMemberName);
  const resetDemoData = useBudgetStore((store) => store.resetDemoData);

  return (
    <div className="grid gap-4">
      <section className="ios-panel p-4">
        <SectionHeader icon={Bank} title="Доходы по расписанию" />
        <div className="mt-3 grid gap-2">
          {state.incomeSchedules.map((schedule) => (
            <article className="rounded-[8px] bg-slate-100/80 p-3" key={schedule.id}>
              <div className="grid gap-2 sm:grid-cols-4">
                <TextField
                  label="Название"
                  onChange={(event) =>
                    updateIncomeSchedule(schedule.id, { title: event.target.value })
                  }
                  value={schedule.title}
                />
                <MoneyField
                  label="Сумма"
                  onValueChange={(amount) =>
                    updateIncomeSchedule(schedule.id, { amount })
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
                  {state.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </SelectField>
                <MoneyField
                  label="День"
                  max={31}
                  min={1}
                  onValueChange={(dayOfMonth) =>
                    updateIncomeSchedule(schedule.id, {
                      dayOfMonth: Math.min(Math.max(dayOfMonth, 1), 31),
                    })
                  }
                  value={schedule.dayOfMonth}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ios-panel p-4">
        <SectionHeader
          icon={CreditCard}
          title="Обязательные платежи"
          trailing={
            <button
              className="flex h-9 items-center gap-2 rounded-[8px] bg-slate-950 px-3 text-sm font-semibold text-white active:scale-[0.98]"
              onClick={() => onAdd("payment")}
              type="button"
            >
              <Plus size={17} />
              Платёж
            </button>
          }
        />
        <div className="mt-3 grid gap-2">
          {state.mandatoryPayments.map((payment) => (
            <SimpleEditableRow
              amount={payment.amount}
              key={payment.id}
              label={`${scopeLabel[payment.scope]} · ${payment.category}`}
              onEdit={() => onEdit({ id: payment.id, type: "payment" })}
              title={payment.title}
            />
          ))}
        </div>
      </section>

      <section className="ios-panel p-4">
        <SectionHeader icon={GearSix} title="Семья" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {state.members.map((member) => (
            <TextField
              key={member.id}
              label={member.id === "primary" ? "Первый участник" : "Второй участник"}
              onChange={(event) => updateMemberName(member.id, event.target.value)}
              value={member.name}
            />
          ))}
        </div>
        <button
          className="mt-3 flex h-11 items-center justify-center gap-2 rounded-[8px] bg-slate-100 px-4 text-sm font-semibold text-slate-700 premium-motion active:scale-[0.98]"
          onClick={resetDemoData}
          type="button"
        >
          Сбросить демо-данные
        </button>
      </section>
    </div>
  );
};

const RightRail = ({
  activityItems,
  onAdd,
  projection,
  state,
}: {
  activityItems: ActivityItem[];
  onAdd: (mode: CommandMode) => void;
  projection: BudgetProjection;
  state: BudgetPlannerState;
}) => {
  const nextPayday = projection.generatedIncomeEvents
    .slice()
    .sort(
      (left, right) =>
        new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
    )[0];

  return (
    <aside className="hidden content-start gap-4 lg:sticky lg:top-6 lg:grid">
      <section className="ios-panel p-4">
        <SectionHeader icon={ChartPieSlice} title="Ближайшее" />
        <div className="mt-3 grid gap-2">
          {nextPayday ? (
            <SimpleRow
              amount={nextPayday.amount}
              label={formatDateTime(nextPayday.occurredAt)}
              tone="income"
              title={nextPayday.title}
            />
          ) : null}
          {state.mandatoryPayments.slice(0, 3).map((payment) => (
            <SimpleRow
              amount={payment.amount}
              key={payment.id}
              label={`${formatDateTime(payment.dueAt)} · ${scopeLabel[payment.scope]}`}
              title={payment.title}
            />
          ))}
        </div>
      </section>

      <section className="ios-panel p-4">
        <SectionHeader icon={Receipt} title="Последние записи" />
        <div className="mt-3 grid gap-2">
          {activityItems.slice(0, 4).map((item) => (
            <SimpleRow
              amount={item.amount}
              key={item.id}
              label={item.label}
              tone={item.direction === "income" ? "income" : "expense"}
              title={item.title}
            />
          ))}
        </div>
        <button
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white active:scale-[0.98]"
          onClick={() => onAdd("expense")}
          type="button"
        >
          <Plus size={18} />
          Добавить запись
        </button>
      </section>
    </aside>
  );
};

const SectionHeader = ({
  icon: Icon,
  title,
  trailing,
}: {
  icon: Icon;
  title: string;
  trailing?: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2">
      <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-slate-100 text-slate-700">
        <Icon size={19} weight="regular" />
      </span>
      <h2 className="truncate text-lg font-semibold">{title}</h2>
    </div>
    {trailing ? <div className="shrink-0">{trailing}</div> : null}
  </div>
);

const FundRow = ({
  fund,
  onEdit,
}: {
  fund: BudgetProjection["funds"][number];
  onEdit: () => void;
}) => {
  const Icon = getCategoryIcon(fund.iconKey);
  const progress = clampProgress(
    fund.recommendedMonthlyLimit ? fund.spent / fund.recommendedMonthlyLimit : 0,
  );

  return (
    <article className="rounded-[8px] bg-slate-100/80 p-3">
      <div className="flex items-center gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-white"
          style={{ color: fund.accent }}
        >
          <Icon size={22} weight="regular" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{fund.title}</p>
            <p className="shrink-0 text-sm font-semibold">
              {formatMoney(fund.spent)}
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: fund.accent,
                transform: `scaleX(${progress})`,
                transformOrigin: "left",
              }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            дальше в день {formatMoney(fund.dailyRecommendedLimit)}
          </p>
        </div>
        <IconButton label="Редактировать фонд" onClick={onEdit} />
      </div>
    </article>
  );
};

const GoalRow = ({
  goal,
  onEdit,
}: {
  goal: BudgetProjection["goals"][number];
  onEdit: () => void;
}) => (
  <article className="rounded-[8px] bg-slate-100/80 p-3">
    <div className="flex items-center gap-3">
      <span
        className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-white"
        style={{ color: goal.accent }}
      >
        <Target size={22} weight="regular" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold">{goal.title}</p>
          <p className="shrink-0 text-sm font-semibold">
            {formatPercent(clampProgress(goal.progress))}
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: goal.accent,
              transform: `scaleX(${clampProgress(goal.progress)})`,
              transformOrigin: "left",
            }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          осталось {formatMoney(goal.remaining)} · в месяц{" "}
          {formatMoney(goal.monthlyTarget)}
        </p>
      </div>
      <IconButton label="Редактировать цель" onClick={onEdit} />
    </div>
  </article>
);

const ActivityRow = ({
  item,
  onEdit,
}: {
  item: ActivityItem;
  onEdit: (target: EditTarget) => void;
}) => {
  const isIncome = item.direction === "income";
  const Icon = isIncome ? ArrowCircleDown : ArrowCircleUp;

  return (
    <article className="rounded-[8px] bg-slate-100/80 p-3">
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "grid size-11 shrink-0 place-items-center rounded-[8px]",
            isIncome ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-700",
          )}
        >
          <Icon size={22} weight="regular" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{item.title}</p>
            <p
              className={clsx(
                "shrink-0 font-semibold",
                isIncome ? "text-emerald-700" : "text-slate-950",
              )}
            >
              {isIncome ? "+" : "-"}
              {formatMoney(item.amount)}
            </p>
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">
            {formatDateTime(item.occurredAt)} · {item.label}
          </p>
        </div>
        <IconButton label="Редактировать запись" onClick={() => onEdit(item.editTarget)} />
      </div>
    </article>
  );
};

const SimpleEditableRow = ({
  amount,
  label,
  onEdit,
  title,
}: {
  amount: number;
  label: string;
  onEdit: () => void;
  title: string;
}) => (
  <article className="flex items-center gap-3 rounded-[8px] bg-slate-100/80 p-3">
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold">{title}</p>
      <p className="truncate text-sm text-slate-500">{label}</p>
    </div>
    <p className="shrink-0 font-semibold">{formatMoney(amount)}</p>
    <IconButton label="Редактировать" onClick={onEdit} />
  </article>
);

const SimpleRow = ({
  amount,
  label,
  title,
  tone = "expense",
}: {
  amount: number;
  label: string;
  title: string;
  tone?: "expense" | "income";
}) => (
  <article className="rounded-[8px] bg-slate-100/80 p-3">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        <p className="truncate text-sm text-slate-500">{label}</p>
      </div>
      <p
        className={clsx(
          "shrink-0 font-semibold",
          tone === "income" ? "text-emerald-700" : "text-slate-950",
        )}
      >
        {tone === "income" ? "+" : "-"}
        {formatMoney(amount)}
      </p>
    </div>
  </article>
);

const IconButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    aria-label={label}
    className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-white text-slate-600 premium-motion hover:text-slate-950 active:scale-[0.96]"
    onClick={onClick}
    type="button"
  >
    <PencilSimple size={18} weight="regular" />
  </button>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-[8px] bg-slate-100/80 p-4 text-sm text-slate-500">
    {text}
  </div>
);

const CommandSheet = ({
  editTarget,
  isOpen,
  mode,
  onClose,
  onModeChange,
  state,
}: {
  editTarget?: EditTarget;
  isOpen: boolean;
  mode: CommandMode;
  onClose: () => void;
  onModeChange: (mode: CommandMode) => void;
  state: BudgetPlannerState;
}) => {
  const addFund = useBudgetStore((store) => store.addFund);
  const addGoal = useBudgetStore((store) => store.addGoal);
  const addIncomeEvent = useBudgetStore((store) => store.addIncomeEvent);
  const addMandatoryPayment = useBudgetStore((store) => store.addMandatoryPayment);
  const addTransaction = useBudgetStore((store) => store.addTransaction);
  const deleteFund = useBudgetStore((store) => store.deleteFund);
  const deleteGoal = useBudgetStore((store) => store.deleteGoal);
  const deleteIncomeEvent = useBudgetStore((store) => store.deleteIncomeEvent);
  const deleteMandatoryPayment = useBudgetStore(
    (store) => store.deleteMandatoryPayment,
  );
  const deleteTransaction = useBudgetStore((store) => store.deleteTransaction);
  const updateFundMeta = useBudgetStore((store) => store.updateFundMeta);
  const updateGoal = useBudgetStore((store) => store.updateGoal);
  const updateIncomeEvent = useBudgetStore((store) => store.updateIncomeEvent);
  const updateMandatoryPayment = useBudgetStore(
    (store) => store.updateMandatoryPayment,
  );
  const updateTransaction = useBudgetStore((store) => store.updateTransaction);

  const categoryOptions = useMemo(
    () => [
      ...state.funds.map((fund) => ({
        accent: fund.accent,
        label: fund.title,
        value: `fund:${fund.id}`,
      })),
      ...state.goals.map((goal) => ({
        accent: goal.accent,
        label: goal.title,
        value: `goal:${goal.id}`,
      })),
      { accent: "#64748b", label: "Другое", value: "other:other" },
    ],
    [state.funds, state.goals],
  );

  const targetTransaction =
    editTarget?.type === "transaction"
      ? state.transactions.find((item) => item.id === editTarget.id)
      : undefined;
  const targetIncome =
    editTarget?.type === "income"
      ? state.incomeEvents.find((item) => item.id === editTarget.id)
      : undefined;
  const targetPayment =
    editTarget?.type === "payment"
      ? state.mandatoryPayments.find((item) => item.id === editTarget.id)
      : undefined;
  const targetFund =
    editTarget?.type === "fund"
      ? state.funds.find((item) => item.id === editTarget.id)
      : undefined;
  const targetGoal =
    editTarget?.type === "goal"
      ? state.goals.find((item) => item.id === editTarget.id)
      : undefined;

  const [expenseTitle, setExpenseTitle] = useState("Новая трата");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseCategory, setExpenseCategory] = useState("other:other");
  const [expenseScope, setExpenseScope] = useState<PaymentScope>("shared");
  const [expenseMember, setExpenseMember] = useState<MemberId>("primary");
  const [expenseDate, setExpenseDate] = useState(todayDateKey());
  const [expenseTime, setExpenseTime] = useState("18:00");

  const [incomeTitle, setIncomeTitle] = useState("Разовый доход");
  const [incomeAmount, setIncomeAmount] = useState(0);
  const [incomeMember, setIncomeMember] = useState<MemberId>("primary");
  const [incomeDate, setIncomeDate] = useState(todayDateKey());
  const [incomeTime, setIncomeTime] = useState("12:00");

  const [paymentTitle, setPaymentTitle] = useState("Новый платёж");
  const [paymentCategory, setPaymentCategory] = useState("Личное");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentScope, setPaymentScope] = useState<PaymentScope>("personal");
  const [paymentMember, setPaymentMember] = useState<MemberId>("primary");
  const [paymentDate, setPaymentDate] = useState(todayDateKey());
  const [paymentTime, setPaymentTime] = useState("10:00");

  const [fundTitle, setFundTitle] = useState("Новая категория");
  const [fundLimit, setFundLimit] = useState(0);
  const [fundWeight, setFundWeight] = useState(1);
  const [fundAccent, setFundAccent] = useState(accentOptions[0]);
  const [fundIcon, setFundIcon] = useState<CategoryIconKey>("cart");

  const [goalTitle, setGoalTitle] = useState("Новая цель");
  const [goalTarget, setGoalTarget] = useState(0);
  const [goalCurrent, setGoalCurrent] = useState(0);
  const [goalMonthly, setGoalMonthly] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalAccent, setGoalAccent] = useState(accentOptions[1]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstCategory = categoryOptions[0]?.value ?? "other:other";

    if (targetTransaction) {
      const category =
        targetTransaction.kind === "other"
          ? "other:other"
          : `${targetTransaction.kind}:${targetTransaction.categoryId ?? "other"}`;
      setExpenseTitle(targetTransaction.title);
      setExpenseAmount(targetTransaction.amount);
      setExpenseCategory(category);
      setExpenseScope(targetTransaction.scope);
      setExpenseMember(targetTransaction.memberId ?? "primary");
      setExpenseDate(getDateInputValue(targetTransaction.occurredAt));
      setExpenseTime(getTimeInputValue(targetTransaction.occurredAt));
    } else {
      setExpenseTitle("Новая трата");
      setExpenseAmount(0);
      setExpenseCategory(firstCategory);
      setExpenseScope("shared");
      setExpenseMember("primary");
      setExpenseDate(todayDateKey());
      setExpenseTime("18:00");
    }

    if (targetIncome) {
      setIncomeTitle(targetIncome.title);
      setIncomeAmount(targetIncome.amount);
      setIncomeMember(targetIncome.memberId);
      setIncomeDate(getDateInputValue(targetIncome.occurredAt));
      setIncomeTime(getTimeInputValue(targetIncome.occurredAt));
    } else {
      setIncomeTitle("Разовый доход");
      setIncomeAmount(0);
      setIncomeMember("primary");
      setIncomeDate(todayDateKey());
      setIncomeTime("12:00");
    }

    if (targetPayment) {
      setPaymentTitle(targetPayment.title);
      setPaymentCategory(targetPayment.category);
      setPaymentAmount(targetPayment.amount);
      setPaymentScope(targetPayment.scope);
      setPaymentMember(targetPayment.memberId ?? "primary");
      setPaymentDate(getDateInputValue(targetPayment.dueAt));
      setPaymentTime(getTimeInputValue(targetPayment.dueAt));
    } else {
      setPaymentTitle("Новый платёж");
      setPaymentCategory("Личное");
      setPaymentAmount(0);
      setPaymentScope("personal");
      setPaymentMember("primary");
      setPaymentDate(todayDateKey());
      setPaymentTime("10:00");
    }

    if (targetFund) {
      setFundTitle(targetFund.title);
      setFundLimit(targetFund.monthlyLimit);
      setFundWeight(targetFund.allocationWeight);
      setFundAccent(targetFund.accent);
      setFundIcon((targetFund.iconKey as CategoryIconKey) || "cart");
    } else {
      setFundTitle("Новая категория");
      setFundLimit(0);
      setFundWeight(1);
      setFundAccent(accentOptions[state.funds.length % accentOptions.length]);
      setFundIcon("cart");
    }

    if (targetGoal) {
      setGoalTitle(targetGoal.title);
      setGoalTarget(targetGoal.targetAmount);
      setGoalCurrent(targetGoal.currentAmount);
      setGoalMonthly(targetGoal.monthlyTarget);
      setGoalDeadline(targetGoal.deadline ?? "");
      setGoalAccent(targetGoal.accent);
    } else {
      setGoalTitle("Новая цель");
      setGoalTarget(0);
      setGoalCurrent(0);
      setGoalMonthly(0);
      setGoalDeadline("");
      setGoalAccent(accentOptions[state.goals.length % accentOptions.length]);
    }
  }, [
    categoryOptions,
    isOpen,
    state.funds.length,
    state.goals.length,
    targetFund,
    targetGoal,
    targetIncome,
    targetPayment,
    targetTransaction,
  ]);

  const saveExpense = () => {
    if (!expenseTitle.trim() || expenseAmount <= 0) {
      return;
    }

    const [kindValue, rawCategoryId] = expenseCategory.split(":");
    const kind = kindValue as TransactionKind;
    const payload = {
      amount: expenseAmount,
      categoryId: kind === "other" ? undefined : rawCategoryId,
      kind,
      memberId: expenseScope === "personal" ? expenseMember : undefined,
      occurredAt: toMoscowDateTime(expenseDate, expenseTime),
      scope: expenseScope,
      title: expenseTitle.trim(),
    };

    if (targetTransaction) {
      updateTransaction(targetTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const saveIncome = () => {
    if (!incomeTitle.trim() || incomeAmount <= 0) {
      return;
    }

    const payload = {
      amount: incomeAmount,
      kind: "extra" as const,
      memberId: incomeMember,
      occurredAt: toMoscowDateTime(incomeDate, incomeTime),
      title: incomeTitle.trim(),
    };

    if (targetIncome) {
      updateIncomeEvent(targetIncome.id, payload);
    } else {
      addIncomeEvent(payload);
    }
    onClose();
  };

  const savePayment = () => {
    if (!paymentTitle.trim() || paymentAmount <= 0) {
      return;
    }

    const payload = {
      amount: paymentAmount,
      category: paymentCategory.trim() || "Без категории",
      dueAt: toMoscowDateTime(paymentDate, paymentTime),
      memberId: paymentScope === "personal" ? paymentMember : undefined,
      scope: paymentScope,
      title: paymentTitle.trim(),
    };

    if (targetPayment) {
      updateMandatoryPayment(targetPayment.id, payload);
    } else {
      addMandatoryPayment(payload);
    }
    onClose();
  };

  const saveFund = () => {
    if (!fundTitle.trim() || fundLimit <= 0) {
      return;
    }

    const payload = {
      accent: fundAccent,
      allocationWeight: Math.max(1, fundWeight),
      iconKey: fundIcon,
      monthlyLimit: fundLimit,
      title: fundTitle.trim(),
    };

    if (targetFund) {
      updateFundMeta(targetFund.id, payload);
    } else {
      addFund(payload);
    }
    onClose();
  };

  const saveGoal = () => {
    if (!goalTitle.trim() || goalTarget <= 0) {
      return;
    }

    const payload = {
      accent: goalAccent,
      currentAmount: goalCurrent,
      deadline: goalDeadline || undefined,
      monthlyTarget: goalMonthly,
      targetAmount: goalTarget,
      title: goalTitle.trim(),
    };

    if (targetGoal) {
      updateGoal(targetGoal.id, payload);
    } else {
      addGoal(payload);
    }
    onClose();
  };

  const deleteCurrent = () => {
    if (!editTarget) {
      return;
    }

    if (editTarget.type === "transaction") {
      deleteTransaction(editTarget.id);
    }
    if (editTarget.type === "income") {
      deleteIncomeEvent(editTarget.id);
    }
    if (editTarget.type === "payment") {
      deleteMandatoryPayment(editTarget.id);
    }
    if (editTarget.type === "fund") {
      deleteFund(editTarget.id);
    }
    if (editTarget.type === "goal") {
      deleteGoal(editTarget.id);
    }
    onClose();
  };

  const activeTitle =
    commandItems.find((item) => item.id === mode)?.label ?? "Запись";

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editTarget ? `Редактировать: ${activeTitle}` : "Добавить"}
    >
      {!editTarget ? (
        <div className="mb-3 grid grid-cols-5 gap-1">
          {commandItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === mode;

            return (
              <button
                className={clsx(
                  "grid h-14 place-items-center rounded-[8px] px-1 text-[11px] font-semibold premium-motion active:scale-[0.98]",
                  isActive
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600",
                )}
                key={item.id}
                onClick={() => onModeChange(item.id)}
                type="button"
              >
                <Icon size={19} weight={isActive ? "fill" : "regular"} />
                <span className="mt-0.5 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "expense" ? (
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TextField
              label="Название"
              onChange={(event) => setExpenseTitle(event.target.value)}
              value={expenseTitle}
            />
            <MoneyField
              label="Сумма"
              onValueChange={setExpenseAmount}
              value={expenseAmount}
            />
            <SelectField
              label="Категория"
              onChange={(event) => setExpenseCategory(event.target.value)}
              value={expenseCategory}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Тип"
              onChange={(event) => setExpenseScope(event.target.value as PaymentScope)}
              value={expenseScope}
            >
              <option value="shared">Общая</option>
              <option value="personal">Личная</option>
            </SelectField>
            {expenseScope === "personal" ? (
              <SelectField
                label="Кто платит"
                onChange={(event) => setExpenseMember(event.target.value as MemberId)}
                value={expenseMember}
              >
                {state.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </SelectField>
            ) : null}
            <TextField
              label="Дата"
              onChange={(event) => setExpenseDate(event.target.value)}
              type="date"
              value={expenseDate}
            />
            <TextField
              label="Время"
              onChange={(event) => setExpenseTime(event.target.value)}
              type="time"
              value={expenseTime}
            />
          </div>
          <SheetActions
            editTarget={editTarget}
            onDelete={deleteCurrent}
            onSave={saveExpense}
          />
        </div>
      ) : null}

      {mode === "income" ? (
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TextField
              label="Источник"
              onChange={(event) => setIncomeTitle(event.target.value)}
              value={incomeTitle}
            />
            <MoneyField
              label="Сумма"
              onValueChange={setIncomeAmount}
              value={incomeAmount}
            />
            <SelectField
              label="Кому"
              onChange={(event) => setIncomeMember(event.target.value as MemberId)}
              value={incomeMember}
            >
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Дата"
              onChange={(event) => setIncomeDate(event.target.value)}
              type="date"
              value={incomeDate}
            />
            <TextField
              label="Время"
              onChange={(event) => setIncomeTime(event.target.value)}
              type="time"
              value={incomeTime}
            />
          </div>
          <SheetActions
            editTarget={editTarget}
            onDelete={deleteCurrent}
            onSave={saveIncome}
          />
        </div>
      ) : null}

      {mode === "payment" ? (
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TextField
              label="Название"
              onChange={(event) => setPaymentTitle(event.target.value)}
              value={paymentTitle}
            />
            <TextField
              label="Категория"
              onChange={(event) => setPaymentCategory(event.target.value)}
              value={paymentCategory}
            />
            <MoneyField
              label="Сумма"
              onValueChange={setPaymentAmount}
              value={paymentAmount}
            />
            <SelectField
              label="Тип"
              onChange={(event) => setPaymentScope(event.target.value as PaymentScope)}
              value={paymentScope}
            >
              <option value="personal">Личный</option>
              <option value="shared">Общий</option>
            </SelectField>
            {paymentScope === "personal" ? (
              <SelectField
                label="Кто платит"
                onChange={(event) => setPaymentMember(event.target.value as MemberId)}
                value={paymentMember}
              >
                {state.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </SelectField>
            ) : null}
            <TextField
              label="Дата"
              onChange={(event) => setPaymentDate(event.target.value)}
              type="date"
              value={paymentDate}
            />
            <TextField
              label="Время"
              onChange={(event) => setPaymentTime(event.target.value)}
              type="time"
              value={paymentTime}
            />
          </div>
          <SheetActions
            editTarget={editTarget}
            onDelete={deleteCurrent}
            onSave={savePayment}
          />
        </div>
      ) : null}

      {mode === "fund" ? (
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TextField
              label="Название"
              onChange={(event) => setFundTitle(event.target.value)}
              value={fundTitle}
            />
            <MoneyField label="Лимит" onValueChange={setFundLimit} value={fundLimit} />
            <MoneyField
              label="Вес авто-лимита"
              min={1}
              onValueChange={(value) => setFundWeight(Math.max(1, value))}
              value={fundWeight}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-slate-500">Иконка</p>
            <div className="grid grid-cols-7 gap-2 sm:grid-cols-10">
              {categoryIconOptions.slice(0, 10).map((option) => {
                const Icon = option.icon;
                const isActive = option.key === fundIcon;

                return (
                  <button
                    aria-label={option.label}
                    className={clsx(
                      "grid size-10 place-items-center rounded-[8px] premium-motion active:scale-[0.96]",
                      isActive
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600",
                    )}
                    key={option.key}
                    onClick={() => setFundIcon(option.key)}
                    type="button"
                  >
                    <Icon size={19} />
                  </button>
                );
              })}
            </div>
          </div>
          <ColorPicker onChange={setFundAccent} value={fundAccent} />
          <SheetActions
            editTarget={editTarget}
            onDelete={deleteCurrent}
            onSave={saveFund}
          />
        </div>
      ) : null}

      {mode === "goal" ? (
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TextField
              label="Название"
              onChange={(event) => setGoalTitle(event.target.value)}
              value={goalTitle}
            />
            <MoneyField
              label="Цель"
              onValueChange={setGoalTarget}
              value={goalTarget}
            />
            <MoneyField
              label="Уже есть"
              onValueChange={setGoalCurrent}
              value={goalCurrent}
            />
            <MoneyField
              label="В месяц"
              onValueChange={setGoalMonthly}
              value={goalMonthly}
            />
            <TextField
              label="Дедлайн"
              onChange={(event) => setGoalDeadline(event.target.value)}
              type="date"
              value={goalDeadline}
            />
          </div>
          <ColorPicker onChange={setGoalAccent} value={goalAccent} />
          <SheetActions
            editTarget={editTarget}
            onDelete={deleteCurrent}
            onSave={saveGoal}
          />
        </div>
      ) : null}
    </BottomSheet>
  );
};

const SheetActions = ({
  editTarget,
  onDelete,
  onSave,
}: {
  editTarget?: EditTarget;
  onDelete: () => void;
  onSave: () => void;
}) => (
  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
    <PrimaryButton onClick={onSave} type="button">
      Сохранить
    </PrimaryButton>
    {editTarget ? (
      <button
        className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-rose-50 px-4 text-sm font-semibold text-rose-700 premium-motion active:scale-[0.98]"
        onClick={onDelete}
        type="button"
      >
        <Trash size={18} />
        Удалить
      </button>
    ) : null}
  </div>
);

const ColorPicker = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => (
  <div className="grid gap-2">
    <p className="text-sm font-semibold text-slate-500">Цвет</p>
    <div className="flex gap-2">
      {accentOptions.map((accent) => (
        <button
          aria-label={`Цвет ${accent}`}
          className={clsx(
            "size-9 rounded-[8px] border-2 premium-motion active:scale-[0.96]",
            value === accent ? "border-slate-950" : "border-transparent",
          )}
          key={accent}
          onClick={() => onChange(accent)}
          style={{ backgroundColor: accent }}
          type="button"
        />
      ))}
    </div>
  </div>
);
