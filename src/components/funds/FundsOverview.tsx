import {
  buildBudgetProjection,
  defaultBudgetDraft,
} from "@/application/budget/budgetProjection";
import { formatMoney } from "@/application/budget/formatters";

export const FundsOverview = () => {
  const projection = buildBudgetProjection(defaultBudgetDraft);

  return (
    <div className="grid gap-3">
      {defaultBudgetDraft.funds.map((fund) => {
        const allocation = projection.fundAllocations.find(
          (item) => item.title === fund.title,
        );
        const progress = Math.min(fund.spent / fund.monthlyLimit, 1);

        return (
          <article className="ios-panel scroll-fade-in p-4" key={fund.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{fund.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {formatMoney(fund.spent)} из {formatMoney(fund.monthlyLimit)}
                </p>
              </div>
              <span className="text-2xl font-semibold">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: fund.accent,
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
                    <span>{formatMoney(share.amount)}</span>
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
