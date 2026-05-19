import {
  buildBudgetProjection,
  defaultBudgetDraft,
} from "@/application/budget/budgetProjection";
import {
  formatDateTime,
  formatMoney,
  formatPercent,
} from "@/application/budget/formatters";

export const GoalsOverview = () => {
  const projection = buildBudgetProjection(defaultBudgetDraft);

  return (
    <div className="grid gap-3">
      {defaultBudgetDraft.goals.map((goal) => {
        const allocation = projection.goalAllocations.find(
          (item) => item.title === goal.title,
        );
        const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);

        return (
          <article className="ios-panel scroll-fade-in p-4" key={goal.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">{goal.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {formatMoney(goal.currentAmount)} из{" "}
                  {formatMoney(goal.targetAmount)}
                </p>
                {goal.deadline ? (
                  <p className="mt-1 text-sm text-slate-500">
                    до {formatDateTime(`${goal.deadline}T12:00:00+03:00`)}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-2xl font-semibold">
                {formatPercent(progress)}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: goal.accent,
                  transform: `scaleX(${progress})`,
                  transformOrigin: "left",
                }}
              />
            </div>
            {allocation ? (
              <div className="mt-4 grid gap-2">
                {allocation.shares.map((share) => (
                  <div
                    className="flex items-center justify-between text-sm text-slate-500"
                    key={share.memberId}
                  >
                    <span>{share.name}</span>
                    <span>{formatMoney(share.amount)} / мес</span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
};
