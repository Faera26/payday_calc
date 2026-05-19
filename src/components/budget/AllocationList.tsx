import { formatMoney, formatPercent } from "@/application/budget/formatters";
import type { SharedAllocation } from "@/domain/budget/budgetTypes";

type AllocationListProps = {
  allocations: SharedAllocation[];
  title: string;
};

export const AllocationList = ({ allocations, title }: AllocationListProps) => (
  <section className="ios-panel scroll-fade-in p-4">
    <h2 className="mb-3 text-lg font-semibold">{title}</h2>
    <div className="grid gap-3">
      {allocations.map((allocation) => (
        <article
          className="rounded-[8px] bg-slate-100/80 p-3"
          key={allocation.title}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-medium">{allocation.title}</p>
            <p className="font-semibold">{formatMoney(allocation.totalAmount)}</p>
          </div>
          <div className="grid gap-1">
            {allocation.shares.map((share) => (
              <div
                className="flex items-center justify-between text-sm text-slate-500"
                key={share.memberId}
              >
                <span>
                  {share.name} · {formatPercent(share.coefficient)}
                </span>
                <span>{formatMoney(share.amount)}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  </section>
);
