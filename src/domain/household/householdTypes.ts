import type { MemberId } from "../budget/budgetTypes";

export type HouseholdRole = "owner" | "partner";

export type HouseholdMember = {
  id: MemberId;
  userId: string;
  displayName: string;
  role: HouseholdRole;
};

export type HouseholdInvite = {
  id: string;
  householdId: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "revoked";
  expiresAt: string;
};
