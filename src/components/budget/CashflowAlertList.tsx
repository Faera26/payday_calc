import { WarningCircle } from "@phosphor-icons/react";
import { formatDateTime, formatMoney } from "@/application/budget/formatters";
import type { ReserveRequirement } from "@/domain/cashflow/cashflowTypes";

type CashflowAlertListProps = {
  requirements: ReserveRequirement[];
};

export const CashflowAlertList = ({
  requirements,
}: CashflowAlertListProps) => {
  if (requirements.length === 0) {
    return (
      <section className="ios-panel scroll-fade-in p-4">
        <p className="text-sm font-medium text-slate-500">Кассовых разрывов нет</p>
      </section>
    );
  }

  return (
    <section className="scroll-fade-in grid gap-2">
      {requirements.slice(0, 2).map((requirement) => (
        <article
          className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-amber-950"
          key={`${requirement.eventId}-${requirement.memberId}`}
        >
          <div className="flex gap-3">
            <WarningCircle className="mt-0.5 shrink-0" size={22} weight="light" />
            <div>
              <p className="font-semibold">{requirement.title}</p>
              <p className="mt-1 text-sm text-amber-900/82">
                {requirement.memberName}: сохранить{" "}
                {formatMoney(requirement.requiredReserve)} до{" "}
                {formatDateTime(requirement.occurredAt)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};
