import type {
  ParticipationCoefficient,
  SharedAllocation,
} from "./budgetTypes";

export const allocateSharedAmount = (
  title: string,
  totalAmount: number,
  coefficients: ParticipationCoefficient[],
): SharedAllocation => {
  const shares = coefficients.map((coefficient) => ({
    memberId: coefficient.memberId,
    name: coefficient.name,
    coefficient: coefficient.coefficient,
    amount: Math.round(totalAmount * coefficient.coefficient),
  }));

  const roundedTotal = shares.reduce((sum, share) => sum + share.amount, 0);
  const delta = Math.round(totalAmount) - roundedTotal;

  if (shares.length > 0 && delta !== 0) {
    shares[0] = {
      ...shares[0],
      amount: shares[0].amount + delta,
    };
  }

  return {
    title,
    totalAmount,
    shares,
  };
};
