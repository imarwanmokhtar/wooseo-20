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
      users: {
        Row: {
          created_at: string
          credits: number
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
