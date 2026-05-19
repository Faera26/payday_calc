import type { ParticipationCoefficient } from "../budget/budgetTypes";
import type {
  CashflowEvent,
  ReserveRequirement,
} from "./cashflowTypes";
import { buildCashflowTimeline } from "./buildCashflowTimeline";

const getExpenseShares = (
  event: CashflowEvent,
  coefficients: ParticipationCoefficient[],
) => {
  if (event.split) {
    return event.split;
  }

  if (event.memberId) {
    const owner = coefficients.find(
      (coefficient) => coefficient.memberId === event.memberId,
    );

    return owner
      ? [
          {
            memberId: owner.memberId,
            name: owner.name,
            coefficient: 1,
            amount: event.amount,
          },
        ]
      : [];
  }

  return coefficients.map((coefficient) => ({
    memberId: coefficient.memberId,
    name: coefficient.name,
    coefficient: coefficient.coefficient,
    amount: Math.round(event.amount * coefficient.coefficient),
  }));
};

export const calculateReserveRequirements = (
  events: CashflowEvent[],
  coefficients: ParticipationCoefficient[],
): ReserveRequirement[] => {
  const balances = new Map(
    coefficients.map((coefficient) => [coefficient.memberId, 0]),
  );
  const timeline = buildCashflowTimeline(events);
  const requirements: ReserveRequirement[] = [];

  timeline.forEach((event) => {
    if (event.direction === "income" && event.memberId) {
      balances.set(
        event.memberId,
        (balances.get(event.memberId) ?? 0) + event.amount,
      );
      return;
    }

    const shares = getExpenseShares(event, coefficients);

    shares.forEach((share) => {
      const nextBalance = (balances.get(share.memberId) ?? 0) - share.amount;
      balances.set(share.memberId, nextBalance);

      if (nextBalance >= 0) {
        return;
      }

      requirements.push({
        memberId: share.memberId,
        memberName: share.name,
        eventId: event.id,
        title: event.title,
        occurredAt: event.occurredAt,
        requiredReserve: Math.abs(nextBalance),
      });
    });
  });

  return requirements;
};
