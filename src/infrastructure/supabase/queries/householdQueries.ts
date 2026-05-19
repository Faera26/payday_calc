import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

export const listHouseholds = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client
    .from("households")
    .select("id,name,currency,timezone,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const createPartnerInvite = async (
  client: SupabaseClient<Database>,
  input: {
    createdBy: string;
    email: string;
    expiresAt: string;
    householdId: string;
    token: string;
  },
) => {
  const { data, error } = await client
    .from("household_invites")
    .insert({
      created_by: input.createdBy,
      email: input.email,
      expires_at: input.expiresAt,
      household_id: input.householdId,
      token: input.token,
    })
    .select("id,email,token,status,expires_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
