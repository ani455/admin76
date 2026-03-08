export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          auth_user_id: string
          created_at: string
          d5_access: boolean
          dashboard_access: boolean
          finance_access: boolean
          id: string
          k3_access: boolean
          manage_access: boolean
          support_access: boolean
          updated_at: string
          username: string
          wingo_access: boolean
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          d5_access?: boolean
          dashboard_access?: boolean
          finance_access?: boolean
          id?: string
          k3_access?: boolean
          manage_access?: boolean
          support_access?: boolean
          updated_at?: string
          username: string
          wingo_access?: boolean
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          d5_access?: boolean
          dashboard_access?: boolean
          finance_access?: boolean
          id?: string
          k3_access?: boolean
          manage_access?: boolean
          support_access?: boolean
          updated_at?: string
          username?: string
          wingo_access?: boolean
        }
        Relationships: []
      }
      bets: {
        Row: {
          amount: number
          bet_type: string
          bet_value: string
          created_at: string
          id: string
          period_id: string
          result: string | null
          user_id: string
          win_amount: number | null
        }
        Insert: {
          amount: number
          bet_type: string
          bet_value: string
          created_at?: string
          id?: string
          period_id: string
          result?: string | null
          user_id: string
          win_amount?: number | null
        }
        Update: {
          amount?: number
          bet_type?: string
          bet_value?: string
          created_at?: string
          id?: string
          period_id?: string
          result?: string | null
          user_id?: string
          win_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bets_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "game_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          status: string
          updated_at: string
          user_id: string
          utr: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          status?: string
          updated_at?: string
          user_id: string
          utr?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id?: string
          utr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_periods: {
        Row: {
          big_small: string | null
          created_at: string
          duration: string
          game_type: string
          id: string
          period_number: string
          result_color: string | null
          result_number: number | null
          total_bet: number
          total_win: number
          users_count: number
        }
        Insert: {
          big_small?: string | null
          created_at?: string
          duration: string
          game_type: string
          id?: string
          period_number: string
          result_color?: string | null
          result_number?: number | null
          total_bet?: number
          total_win?: number
          users_count?: number
        }
        Update: {
          big_small?: string | null
          created_at?: string
          duration?: string
          game_type?: string
          id?: string
          period_number?: string
          result_color?: string | null
          result_number?: number | null
          total_bet?: number
          total_win?: number
          users_count?: number
        }
        Relationships: []
      }
      game_settings: {
        Row: {
          game_mode: string
          id: number
          process_type: string
          updated_at: string
        }
        Insert: {
          game_mode?: string
          id?: number
          process_type?: string
          updated_at?: string
        }
        Update: {
          game_mode?: string
          id?: number
          process_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      gift_codes: {
        Row: {
          amount: number
          code: string
          created_at: string
          id: string
          is_active: boolean
          max_uses: number
          used_count: number
        }
        Insert: {
          amount: number
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          used_count?: number
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          used_count?: number
        }
        Relationships: []
      }
      support_queries: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          balance: number
          created_at: string
          id: string
          ip_address: string | null
          is_agent: boolean
          is_demo: boolean
          mobile: string
          name: string | null
          referral_code: string | null
          referred_by: string | null
          status: string
          total_recharge: number
          total_withdraw: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          ip_address?: string | null
          is_agent?: boolean
          is_demo?: boolean
          mobile: string
          name?: string | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string
          total_recharge?: number
          total_withdraw?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          ip_address?: string | null
          is_agent?: boolean
          is_demo?: boolean
          mobile?: string
          name?: string | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string
          total_recharge?: number
          total_withdraw?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          account_no: string | null
          amount: number
          bank_name: string | null
          created_at: string
          id: string
          ifsc: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_no?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_no?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
