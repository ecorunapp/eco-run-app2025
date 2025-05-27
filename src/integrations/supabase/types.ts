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
      gift_cards: {
        Row: {
          card_key: string | null
          card_type: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expiry_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          monetary_value_aed: number | null
          title: string
          updated_at: string | null
          value_coins: number
        }
        Insert: {
          card_key?: string | null
          card_type?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          monetary_value_aed?: number | null
          title: string
          updated_at?: string | null
          value_coins: number
        }
        Update: {
          card_key?: string | null
          card_type?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          monetary_value_aed?: number | null
          title?: string
          updated_at?: string | null
          value_coins?: number
        }
        Relationships: []
      }
      meet_and_run_sessions: {
        Row: {
          challenge_details: Json | null
          created_at: string | null
          id: string
          invitee_completed_challenge: boolean | null
          invitee_confirmed_meet: boolean | null
          invitee_id: string
          inviter_completed_challenge: boolean | null
          inviter_confirmed_meet: boolean | null
          inviter_id: string
          meeting_location_lat: number | null
          meeting_location_lng: number | null
          meeting_location_name: string | null
          meeting_time: string | null
          status: Database["public"]["Enums"]["meet_and_run_status"]
          updated_at: string | null
        }
        Insert: {
          challenge_details?: Json | null
          created_at?: string | null
          id?: string
          invitee_completed_challenge?: boolean | null
          invitee_confirmed_meet?: boolean | null
          invitee_id: string
          inviter_completed_challenge?: boolean | null
          inviter_confirmed_meet?: boolean | null
          inviter_id: string
          meeting_location_lat?: number | null
          meeting_location_lng?: number | null
          meeting_location_name?: string | null
          meeting_time?: string | null
          status?: Database["public"]["Enums"]["meet_and_run_status"]
          updated_at?: string | null
        }
        Update: {
          challenge_details?: Json | null
          created_at?: string | null
          id?: string
          invitee_completed_challenge?: boolean | null
          invitee_confirmed_meet?: boolean | null
          invitee_id?: string
          inviter_completed_challenge?: boolean | null
          inviter_confirmed_meet?: boolean | null
          inviter_id?: string
          meeting_location_lat?: number | null
          meeting_location_lng?: number | null
          meeting_location_name?: string | null
          meeting_time?: string | null
          status?: Database["public"]["Enums"]["meet_and_run_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meet_and_run_sessions_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meet_and_run_sessions_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          task_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          task_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          height_cm: number | null
          id: string
          is_banned: boolean | null
          total_steps: number | null
          updated_at: string | null
          username: string | null
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          height_cm?: number | null
          id: string
          is_banned?: boolean | null
          total_steps?: number | null
          updated_at?: string | null
          username?: string | null
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          is_banned?: boolean | null
          total_steps?: number | null
          updated_at?: string | null
          username?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          deadline: string
          description: string
          distance_km: number | null
          dropoff_location: string
          id: string
          owner_id: string
          payment_amount: number
          pickup_location: string
          runner_id: string | null
          status: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deadline: string
          description: string
          distance_km?: number | null
          dropoff_location: string
          id?: string
          owner_id: string
          payment_amount: number
          pickup_location: string
          runner_id?: string | null
          status?: string
          task_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deadline?: string
          description?: string
          distance_km?: number | null
          dropoff_location?: string
          id?: string
          owner_id?: string
          payment_amount?: number
          pickup_location?: string
          runner_id?: string | null
          status?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_location_lat: number | null
          completed_location_lng: number | null
          completed_location_name: string | null
          created_at: string | null
          current_steps: number | null
          id: string
          kilometers_covered_at_pause: number | null
          paused_location_lat: number | null
          paused_location_lng: number | null
          paused_location_name: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_location_lat?: number | null
          completed_location_lng?: number | null
          completed_location_name?: string | null
          created_at?: string | null
          current_steps?: number | null
          id?: string
          kilometers_covered_at_pause?: number | null
          paused_location_lat?: number | null
          paused_location_lng?: number | null
          paused_location_name?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_location_lat?: number | null
          completed_location_lng?: number | null
          completed_location_name?: string | null
          created_at?: string | null
          current_steps?: number | null
          id?: string
          kilometers_covered_at_pause?: number | null
          paused_location_lat?: number | null
          paused_location_lng?: number | null
          paused_location_name?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_eco_balances: {
        Row: {
          balance: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_eco_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_eco_transactions: {
        Row: {
          id: string
          label: string
          transaction_date: string | null
          type: string
          user_id: string
          value: number
        }
        Insert: {
          id?: string
          label: string
          transaction_date?: string | null
          type: string
          user_id: string
          value: number
        }
        Update: {
          id?: string
          label?: string
          transaction_date?: string | null
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_eco_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gift_cards: {
        Row: {
          assigned_at: string | null
          associated_eco_coins_value: number | null
          challenge_id_won_from: string | null
          created_at: string | null
          gift_card_id: string
          id: string
          prize_currency: string | null
          prize_image_url: string | null
          prize_monetary_value_aed: number | null
          prize_promo_code: string | null
          prize_title: string | null
          status: string | null
          updated_at: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          associated_eco_coins_value?: number | null
          challenge_id_won_from?: string | null
          created_at?: string | null
          gift_card_id: string
          id?: string
          prize_currency?: string | null
          prize_image_url?: string | null
          prize_monetary_value_aed?: number | null
          prize_promo_code?: string | null
          prize_title?: string | null
          status?: string | null
          updated_at?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          associated_eco_coins_value?: number | null
          challenge_id_won_from?: string | null
          created_at?: string | null
          gift_card_id?: string
          id?: string
          prize_currency?: string | null
          prize_image_url?: string | null
          prize_monetary_value_aed?: number | null
          prize_promo_code?: string | null
          prize_title?: string | null
          status?: string | null
          updated_at?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gift_cards_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gift_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
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
      get_profile_id_for_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      meet_and_run_status:
        | "PENDING_INVITE"
        | "INVITE_ACCEPTED"
        | "INVITE_REJECTED"
        | "MEETING_TIME_LOCATION_SET"
        | "AWAITING_ARRIVAL"
        | "INVITER_ARRIVED"
        | "INVITEE_ARRIVED"
        | "BOTH_ARRIVED"
        | "CHALLENGE_IN_PROGRESS"
        | "CHALLENGE_COMPLETED"
        | "CHALLENGE_FAILED"
        | "CANCELLED_BY_INVITER"
        | "CANCELLED_BY_INVITEE"
        | "EXPIRED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      meet_and_run_status: [
        "PENDING_INVITE",
        "INVITE_ACCEPTED",
        "INVITE_REJECTED",
        "MEETING_TIME_LOCATION_SET",
        "AWAITING_ARRIVAL",
        "INVITER_ARRIVED",
        "INVITEE_ARRIVED",
        "BOTH_ARRIVED",
        "CHALLENGE_IN_PROGRESS",
        "CHALLENGE_COMPLETED",
        "CHALLENGE_FAILED",
        "CANCELLED_BY_INVITER",
        "CANCELLED_BY_INVITEE",
        "EXPIRED",
      ],
    },
  },
} as const
