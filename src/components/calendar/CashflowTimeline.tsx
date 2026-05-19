import {
  ArrowCircleDown,
  ArrowCircleUp,
  CalendarCheck,
} from "@phosphor-icons/react/dist/ssr";
import {
  buildBudgetProjection,
  defaultBudgetDraft,
} from "@/application/budget/budgetProjection";
import { formatDateTime, formatMoney } from "@/application/budget/formatters";

export const CashflowTimeline = () => {
  const projection = buildBudgetProjection(defaultBudgetDraft);

  return (
    <section className="ios-panel scroll-fade-in p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">События месяца</h2>
        <CalendarCheck size={24} weight="light" />
      </div>
      <div className="grid gap-3">
        {projection.timeline.map((event) => {
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
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(event.occurredAt)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold">
                    {isIncome ? "+" : "-"}
                    {formatMoney(event.amount)}
                  </p>
                </div>
                {event.split ? (
                  <div className="mt-2 grid gap-1 text-sm text-slate-500">
                    {event.split.map((share) => (
                      <p key={share.memberId}>
                        {share.name}: {formatMoney(share.amount)}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
