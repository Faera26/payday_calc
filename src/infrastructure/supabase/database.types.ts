export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      households: {
        Row: {
          created_at: string;
          created_by: string;
          currency: string;
          id: string;
          name: string;
          timezone: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          currency?: string;
          id?: string;
          name: string;
          timezone?: string;
        };
        Update: Partial<Database["public"]["Tables"]["households"]["Insert"]>;
        Relationships: [];
      };
      household_members: {
        Row: {
          created_at: string;
          display_name: string;
          household_id: string;
          id: string;
          role: "owner" | "partner";
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          household_id: string;
          id?: string;
          role: "owner" | "partner";
          user_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["household_members"]["Insert"]
        >;
        Relationships: [];
      };
      household_invites: {
        Row: {
          created_at: string;
          created_by: string;
          email: string;
          expires_at: string;
          household_id: string;
          id: string;
          status: "pending" | "accepted" | "revoked";
          token: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          email: string;
          expires_at: string;
          household_id: string;
          id?: string;
          status?: "pending" | "accepted" | "revoked";
          token: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["household_invites"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
