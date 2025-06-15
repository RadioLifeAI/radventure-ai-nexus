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
      achievements: {
        Row: {
          code: string
          created_at: string
          criteria: Json
          description: string | null
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          criteria: Json
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          assigned_at: string
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          assigned_at?: string
          id?: string
          profile_id: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          assigned_at?: string
          id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      difficulties: {
        Row: {
          description: string | null
          id: number
          level: number
        }
        Insert: {
          description?: string | null
          id?: number
          level: number
        }
        Update: {
          description?: string | null
          id?: number
          level?: number
        }
        Relationships: []
      }
      event_cases: {
        Row: {
          case_id: string
          event_id: string
          id: string
        }
        Insert: {
          case_id: string
          event_id: string
          id?: string
        }
        Update: {
          case_id?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_cases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_cases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rankings: {
        Row: {
          event_id: string
          id: string
          rank: number | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          rank?: number | null
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          rank?: number | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rankings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          prize_radcoins: number
          scheduled_end: string
          scheduled_start: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          prize_radcoins?: number
          scheduled_end: string
          scheduled_start: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          prize_radcoins?: number
          scheduled_end?: string
          scheduled_start?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Relationships: []
      }
      imaging_modalities: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      medical_cases: {
        Row: {
          ai_hint_enabled: boolean | null
          ai_tutor_level: string | null
          answer_feedbacks: string[] | null
          answer_options: string[] | null
          answer_short_tips: string[] | null
          author_id: string | null
          can_skip: boolean | null
          case_number: number | null
          category_id: number | null
          correct_answer_index: number | null
          created_at: string
          created_by: string | null
          description: string | null
          diagnosis_internal: string | null
          difficulty_description: string | null
          difficulty_level: number | null
          elimination_penalty_points: number | null
          explanation: string | null
          findings: string | null
          id: string
          image_url: Json | null
          main_question: string | null
          manual_hint: string | null
          max_elimination: number | null
          meta: Json | null
          modality: string | null
          patient_age: string | null
          patient_clinical_info: string | null
          patient_gender: string | null
          points: number | null
          skip_penalty_points: number | null
          specialty: string | null
          subtype: string | null
          symptoms_duration: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_hint_enabled?: boolean | null
          ai_tutor_level?: string | null
          answer_feedbacks?: string[] | null
          answer_options?: string[] | null
          answer_short_tips?: string[] | null
          author_id?: string | null
          can_skip?: boolean | null
          case_number?: number | null
          category_id?: number | null
          correct_answer_index?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagnosis_internal?: string | null
          difficulty_description?: string | null
          difficulty_level?: number | null
          elimination_penalty_points?: number | null
          explanation?: string | null
          findings?: string | null
          id?: string
          image_url?: Json | null
          main_question?: string | null
          manual_hint?: string | null
          max_elimination?: number | null
          meta?: Json | null
          modality?: string | null
          patient_age?: string | null
          patient_clinical_info?: string | null
          patient_gender?: string | null
          points?: number | null
          skip_penalty_points?: number | null
          specialty?: string | null
          subtype?: string | null
          symptoms_duration?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_hint_enabled?: boolean | null
          ai_tutor_level?: string | null
          answer_feedbacks?: string[] | null
          answer_options?: string[] | null
          answer_short_tips?: string[] | null
          author_id?: string | null
          can_skip?: boolean | null
          case_number?: number | null
          category_id?: number | null
          correct_answer_index?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagnosis_internal?: string | null
          difficulty_description?: string | null
          difficulty_level?: number | null
          elimination_penalty_points?: number | null
          explanation?: string | null
          findings?: string | null
          id?: string
          image_url?: Json | null
          main_question?: string | null
          manual_hint?: string | null
          max_elimination?: number | null
          meta?: Json | null
          modality?: string | null
          patient_age?: string | null
          patient_clinical_info?: string | null
          patient_gender?: string | null
          points?: number | null
          skip_penalty_points?: number | null
          specialty?: string | null
          subtype?: string | null
          symptoms_duration?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_cases_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "medical_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_specialties: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      monthly_rankings: {
        Row: {
          category: string | null
          id: string
          points: number
          rank: number | null
          updated_at: string
          user_id: string
          year_month: string
        }
        Insert: {
          category?: string | null
          id?: string
          points: number
          rank?: number | null
          updated_at?: string
          user_id: string
          year_month: string
        }
        Update: {
          category?: string | null
          id?: string
          points?: number
          rank?: number | null
          updated_at?: string
          user_id?: string
          year_month?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_specialty: string | null
          academic_stage: Database["public"]["Enums"]["academic_stage"] | null
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          city: string | null
          college: string | null
          country_code: string | null
          created_at: string
          current_streak: number
          email: string | null
          full_name: string | null
          id: string
          medical_specialty: string | null
          nickname: string | null
          preferences: Json | null
          radcoin_balance: number
          state: string | null
          total_points: number
          type: Database["public"]["Enums"]["profile_type"]
          updated_at: string
          username: string | null
        }
        Insert: {
          academic_specialty?: string | null
          academic_stage?: Database["public"]["Enums"]["academic_stage"] | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          college?: string | null
          country_code?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          full_name?: string | null
          id: string
          medical_specialty?: string | null
          nickname?: string | null
          preferences?: Json | null
          radcoin_balance?: number
          state?: string | null
          total_points?: number
          type?: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          academic_specialty?: string | null
          academic_stage?: Database["public"]["Enums"]["academic_stage"] | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          college?: string | null
          country_code?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          full_name?: string | null
          id?: string
          medical_specialty?: string | null
          nickname?: string | null
          preferences?: Json | null
          radcoin_balance?: number
          state?: string | null
          total_points?: number
          type?: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      radcoin_transactions_log: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          metadata: Json | null
          tx_type: Database["public"]["Enums"]["radcoin_tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          metadata?: Json | null
          tx_type: Database["public"]["Enums"]["radcoin_tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          tx_type?: Database["public"]["Enums"]["radcoin_tx_type"]
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_case_history: {
        Row: {
          answered_at: string
          case_id: string
          details: Json | null
          id: string
          is_correct: boolean | null
          points: number | null
          user_id: string
        }
        Insert: {
          answered_at?: string
          case_id: string
          details?: Json | null
          id?: string
          is_correct?: boolean | null
          points?: number | null
          user_id: string
        }
        Update: {
          answered_at?: string
          case_id?: string
          details?: Json | null
          id?: string
          is_correct?: boolean | null
          points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_case_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_case_completion: {
        Args: { p_user_id: string; p_case_id: string; p_points?: number }
        Returns: undefined
      }
    }
    Enums: {
      academic_stage: "Student" | "Intern" | "Resident" | "Specialist"
      admin_role:
        | "DEV"
        | "TechAdmin"
        | "WebSecuritySpecialist"
        | "ContentEditor"
        | "WebPerformanceSpecialist"
        | "WebAnalyticsManager"
        | "DigitalMarketingSpecialist"
        | "EcommerceManager"
        | "CustomerSupportCoordinator"
        | "ComplianceOfficer"
      event_status: "SCHEDULED" | "ACTIVE" | "FINISHED"
      profile_type: "USER" | "ADMIN"
      radcoin_tx_type:
        | "event_reward"
        | "subscription_purchase"
        | "help_purchase"
        | "admin_grant"
        | "admin_revoke"
      subscription_tier: "Free" | "Pro" | "Plus"
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
      academic_stage: ["Student", "Intern", "Resident", "Specialist"],
      admin_role: [
        "DEV",
        "TechAdmin",
        "WebSecuritySpecialist",
        "ContentEditor",
        "WebPerformanceSpecialist",
        "WebAnalyticsManager",
        "DigitalMarketingSpecialist",
        "EcommerceManager",
        "CustomerSupportCoordinator",
        "ComplianceOfficer",
      ],
      event_status: ["SCHEDULED", "ACTIVE", "FINISHED"],
      profile_type: ["USER", "ADMIN"],
      radcoin_tx_type: [
        "event_reward",
        "subscription_purchase",
        "help_purchase",
        "admin_grant",
        "admin_revoke",
      ],
      subscription_tier: ["Free", "Pro", "Plus"],
    },
  },
} as const
