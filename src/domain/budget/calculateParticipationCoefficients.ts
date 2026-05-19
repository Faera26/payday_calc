import type {
  MemberBudgetInput,
  ParticipationCoefficient,
} from "./budgetTypes";

const toDisposableIncome = (member: MemberBudgetInput) =>
  Math.max(0, member.income - member.personalMandatory);

export const calculateParticipationCoefficients = (
  members: MemberBudgetInput[],
): ParticipationCoefficient[] => {
  const disposableTotal = members.reduce(
    (sum, member) => sum + toDisposableIncome(member),
    0,
  );

  if (disposableTotal <= 0) {
    return members.map((member) => ({
      memberId: member.id,
      name: member.name,
      income: member.income,
      personalMandatory: member.personalMandatory,
      disposableIncome: 0,
      coefficient: 0,
    }));
  }

  return members.map((member) => {
    const disposableIncome = toDisposableIncome(member);

    return {
      memberId: member.id,
      name: member.name,
      income: member.income,
      personalMandatory: member.personalMandatory,
      disposableIncome,
      coefficient: disposableIncome / disposableTotal,
    };
  });
};
