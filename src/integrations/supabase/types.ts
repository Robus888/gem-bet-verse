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
      events: {
        Row: {
          ended_at: string | null
          host_id: string
          id: string
          is_active: boolean | null
          started_at: string
        }
        Insert: {
          ended_at?: string | null
          host_id: string
          id?: string
          is_active?: boolean | null
          started_at?: string
        }
        Update: {
          ended_at?: string | null
          host_id?: string
          id?: string
          is_active?: boolean | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "host_accounts"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "games_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_joiner_id_fkey"
            columns: ["joiner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      host_accounts: {
        Row: {
          created_at: string
          current_event_id: string | null
          id: string
          is_active: boolean | null
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          current_event_id?: string | null
          id?: string
          is_active?: boolean | null
          password: string
          username: string
        }
        Update: {
          created_at?: string
          current_event_id?: string | null
          id?: string
          is_active?: boolean | null
          password?: string
          username?: string
        }
        Relationships: []
      }
      keys: {
        Row: {
          created_at: string
          expiration_date: string | null
          is_active: boolean | null
          key: string
        }
        Insert: {
          created_at?: string
          expiration_date?: string | null
          is_active?: boolean | null
          key: string
        }
        Update: {
          created_at?: string
          expiration_date?: string | null
          is_active?: boolean | null
          key?: string
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
          created_at: string
          early_access: boolean | null
          id: string
          is_admin: boolean | null
          username: string | null
        }
        Insert: {
          created_at?: string
          early_access?: boolean | null
          id: string
          is_admin?: boolean | null
          username?: string | null
        }
        Update: {
          created_at?: string
          early_access?: boolean | null
          id?: string
          is_admin?: boolean | null
          username?: string | null
        }
        Relationships: []
      }
      ranks: {
        Row: {
          abbreviation: string | null
          category: string
          created_at: string | null
          display_order: number
          id: string
          name: string
        }
        Insert: {
          abbreviation?: string | null
          category: string
          created_at?: string | null
          display_order: number
          id?: string
          name: string
        }
        Update: {
          abbreviation?: string | null
          category?: string
          created_at?: string | null
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      upgrades: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          player_id: string | null
          upgrade_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          player_id?: string | null
          upgrade_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          player_id?: string | null
          upgrade_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "upgrades_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          total_games: number
          total_wagered: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          total_games?: number
          total_wagered?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          total_games?: number
          total_wagered?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: string
          id: string
          key: string
          last_updated_at: string
          last_updated_by: string | null
          section: string | null
        }
        Insert: {
          content: string
          id?: string
          key: string
          last_updated_at?: string
          last_updated_by?: string | null
          section?: string | null
        }
        Update: {
          content?: string
          id?: string
          key?: string
          last_updated_at?: string
          last_updated_by?: string | null
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_content_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
