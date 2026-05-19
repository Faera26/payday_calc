import type { ParticipationCoefficient } from "@/domain/budget/budgetTypes";
import { formatMoney, formatPercent } from "@/application/budget/formatters";

type CoefficientCardProps = {
  coefficients: ParticipationCoefficient[];
};

export const CoefficientCard = ({ coefficients }: CoefficientCardProps) => (
  <section className="ios-panel scroll-fade-in p-4">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Коэффициент участия</h2>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        после личных платежей
      </span>
    </div>
    <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
      {coefficients.map((coefficient) => (
        <div
          className="h-full first:bg-slate-950 last:bg-blue-600"
          key={coefficient.memberId}
          style={{ width: `${coefficient.coefficient * 100}%` }}
        />
      ))}
    </div>
    <div className="mt-4 grid gap-3">
      {coefficients.map((coefficient) => (
        <div
          className="flex items-center justify-between gap-3"
          key={coefficient.memberId}
        >
          <div>
            <p className="font-medium text-slate-950">{coefficient.name}</p>
            <p className="text-sm text-slate-500">
              Остаток {formatMoney(coefficient.disposableIncome)}
            </p>
          </div>
          <p className="text-2xl font-semibold">
            {formatPercent(coefficient.coefficient)}
          </p>
        </div>
      ))}
    </div>
  </section>
);
