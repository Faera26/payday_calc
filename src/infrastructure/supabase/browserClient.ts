"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const createSupabaseBrowserClient = ():
  | SupabaseClient<Database>
  | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};
