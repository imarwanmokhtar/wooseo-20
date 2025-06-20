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
      affiliates: {
        Row: {
          affiliate_code: string
          commission_rate: number | null
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["affiliate_status"] | null
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affiliate_code: string
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["affiliate_status"] | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["affiliate_status"] | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bulk_generation_jobs: {
        Row: {
          batch_size: number | null
          completed_at: string | null
          completed_products: number | null
          created_at: string | null
          error_message: string | null
          failed_products: number | null
          id: string
          model: string
          product_ids: number[]
          prompt_template: string
          started_at: string | null
          status: string
          store_id: string
          total_products: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          batch_size?: number | null
          completed_at?: string | null
          completed_products?: number | null
          created_at?: string | null
          error_message?: string | null
          failed_products?: number | null
          id?: string
          model: string
          product_ids: number[]
          prompt_template: string
          started_at?: string | null
          status?: string
          store_id: string
          total_products: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          batch_size?: number | null
          completed_at?: string | null
          completed_products?: number | null
          created_at?: string | null
          error_message?: string | null
          failed_products?: number | null
          id?: string
          model?: string
          product_ids?: number[]
          prompt_template?: string
          started_at?: string | null
          status?: string
          store_id?: string
          total_products?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_generation_jobs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "woocommerce_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_generation_results: {
        Row: {
          content: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          job_id: string
          max_retries: number | null
          product_id: number
          product_name: string | null
          retry_count: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          max_retries?: number | null
          product_id: number
          product_name?: string | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          max_retries?: number | null
          product_id?: number
          product_name?: string | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_generation_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "bulk_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          created_at: string | null
          description: string | null
          id: string
          paid_at: string | null
          purchase_amount: number
          referral_id: string | null
          status: Database["public"]["Enums"]["commission_status"] | null
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          purchase_amount: number
          referral_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"] | null
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          purchase_amount?: number
          referral_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_queue: {
        Row: {
          batch_number: number
          completed_at: string | null
          error_message: string | null
          id: string
          job_id: string
          priority: number | null
          product_ids: number[]
          retry_count: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          batch_number: number
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          priority?: number | null
          product_ids: number[]
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          batch_number?: number
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          priority?: number | null
          product_ids?: number[]
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "bulk_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_payments: {
        Row: {
          created_at: string
          credits_added: number | null
          id: string
          processed_at: string
          session_id: string
          subscription_end: string | null
          subscription_plan: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_added?: number | null
          id?: string
          processed_at?: string
          session_id: string
          subscription_end?: string | null
          subscription_plan?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          credits_added?: number | null
          id?: string
          processed_at?: string
          session_id?: string
          subscription_end?: string | null
          subscription_plan?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          template: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          affiliate_id: string
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bulk_editor_subscription: boolean | null
          bulk_editor_subscription_end: string | null
          created_at: string
          credits: number
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          bulk_editor_subscription?: boolean | null
          bulk_editor_subscription_end?: string | null
          created_at?: string
          credits?: number
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          bulk_editor_subscription?: boolean | null
          bulk_editor_subscription_end?: string | null
          created_at?: string
          credits?: number
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          processed_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      woocommerce_credentials: {
        Row: {
          consumer_key: string
          consumer_secret: string
          created_at: string
          id: string
          is_active: boolean | null
          store_name: string
          store_url: string
          updated_at: string
          used_credits: number | null
          user_id: string
        }
        Insert: {
          consumer_key: string
          consumer_secret: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          store_name: string
          store_url: string
          updated_at?: string
          used_credits?: number | null
          user_id: string
        }
        Update: {
          consumer_key?: string
          consumer_secret?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          store_name?: string
          store_url?: string
          updated_at?: string
          used_credits?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_withdrawal_eligibility: {
        Args: { affiliate_id_param: string; amount_param: number }
        Returns: boolean
      }
      create_commission: {
        Args: {
          purchase_user_id: string
          purchase_amount: number
          description?: string
        }
        Returns: string
      }
      expire_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      grant_bulk_editor_access: {
        Args: { user_email: string; days_duration?: number }
        Returns: string
      }
      list_bulk_editor_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          subscription_active: boolean
          subscription_end: string
          days_remaining: number
        }[]
      }
      revoke_bulk_editor_access: {
        Args: { user_email: string }
        Returns: string
      }
    }
    Enums: {
      affiliate_status: "pending" | "active" | "suspended" | "inactive"
      commission_status: "pending" | "paid" | "cancelled"
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
      affiliate_status: ["pending", "active", "suspended", "inactive"],
      commission_status: ["pending", "paid", "cancelled"],
    },
  },
} as const
