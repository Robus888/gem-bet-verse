export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      crash_bets: {
        Row: {
          amount: number
          cashed_out_at: string | null
          cashout_multiplier: number | null
          created_at: string | null
          game_id: string
          id: string
          status: string
          user_id: string
          won_amount: number | null
        }
        Insert: {
          amount: number
          cashed_out_at?: string | null
          cashout_multiplier?: number | null
          created_at?: string | null
          game_id: string
          id?: string
          status?: string
          user_id: string
          won_amount?: number | null
        }
        Update: {
          amount?: number
          cashed_out_at?: string | null
          cashout_multiplier?: number | null
          created_at?: string | null
          game_id?: string
          id?: string
          status?: string
          user_id?: string
          won_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crash_bets_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "crash_games"
            referencedColumns: ["id"]
          },
        ]
      }
      crash_games: {
        Row: {
          completed_at: string | null
          crash_point: number | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          crash_point?: number | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          crash_point?: number | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      game_history: {
        Row: {
          bet_amount: number
          created_at: string | null
          game_type: string
          id: string
          result: string
          user_id: string
          won_amount: number | null
        }
        Insert: {
          bet_amount: number
          created_at?: string | null
          game_type: string
          id?: string
          result: string
          user_id: string
          won_amount?: number | null
        }
        Update: {
          bet_amount?: number
          created_at?: string | null
          game_type?: string
          id?: string
          result?: string
          user_id?: string
          won_amount?: number | null
        }
        Relationships: []
      }
      games: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          creator_choice: string
          creator_id: string
          id: string
          joiner_id: string | null
          status: string
          winner_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          creator_choice: string
          creator_id: string
          id?: string
          joiner_id?: string | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          creator_choice?: string
          creator_id?: string
          id?: string
          joiner_id?: string | null
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      level_rewards: {
        Row: {
          amount: number
          claimed_at: string | null
          id: number
          level: number
          user_id: string
        }
        Insert: {
          amount: number
          claimed_at?: string | null
          id?: number
          level: number
          user_id: string
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          id?: number
          level?: number
          user_id?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          cash: number | null
          clicks_per_second: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          username: string
        }
        Insert: {
          cash?: number | null
          clicks_per_second?: number | null
          created_at?: string | null
          id: string
          last_updated?: string | null
          username: string
        }
        Update: {
          cash?: number | null
          clicks_per_second?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          is_admin: boolean | null
          is_owner: boolean | null
          username: string
        }
        Insert: {
          id: string
          is_admin?: boolean | null
          is_owner?: boolean | null
          username: string
        }
        Update: {
          id?: string
          is_admin?: boolean | null
          is_owner?: boolean | null
          username?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          last_reward_claim: string | null
          level: number | null
          total_games: number
          total_wagered: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          last_reward_claim?: string | null
          level?: number | null
          total_games?: number
          total_wagered?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          last_reward_claim?: string | null
          level?: number | null
          total_games?: number
          total_wagered?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
