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
      achievement_system: {
        Row: {
          code: string
          conditions: Json
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          points_required: number | null
          rarity: string
          rewards: Json | null
          updated_at: string
        }
        Insert: {
          code: string
          conditions?: Json
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_required?: number | null
          rarity?: string
          rewards?: Json | null
          updated_at?: string
        }
        Update: {
          code?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_required?: number | null
          rarity?: string
          rewards?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_role_changes_log: {
        Row: {
          action: string
          admin_role: string
          changed_by: string | null
          created_at: string
          id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          action: string
          admin_role: string
          changed_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          admin_role?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      admin_user_roles: {
        Row: {
          admin_role: string
          assigned_at: string
          assigned_by: string | null
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          admin_role: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          admin_role?: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      ai_tutor_config: {
        Row: {
          api_provider: string
          config_name: string
          created_at: string
          id: string
          is_active: boolean
          max_tokens: number
          model_name: string
          prompt_template: string | null
          temperature: number
          updated_at: string
        }
        Insert: {
          api_provider?: string
          config_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_tokens?: number
          model_name?: string
          prompt_template?: string | null
          temperature?: number
          updated_at?: string
        }
        Update: {
          api_provider?: string
          config_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_tokens?: number
          model_name?: string
          prompt_template?: string | null
          temperature?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_tutor_usage_logs: {
        Row: {
          case_id: string | null
          config_id: string | null
          cost: number | null
          created_at: string
          id: string
          prompt_used: string | null
          quality_rating: number | null
          response_text: string | null
          response_time_ms: number | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          config_id?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          prompt_used?: string | null
          quality_rating?: number | null
          response_text?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          config_id?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          prompt_used?: string | null
          quality_rating?: number | null
          response_text?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_usage_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tutor_usage_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tutor_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_images: {
        Row: {
          case_id: string | null
          created_at: string | null
          dimensions: Json | null
          file_size_bytes: number | null
          formats: Json | null
          id: string
          large_url: string | null
          legend: string | null
          medium_url: string | null
          metadata: Json | null
          original_filename: string
          original_url: string
          processed_at: string | null
          processing_status: string | null
          sequence_order: number | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size_bytes?: number | null
          formats?: Json | null
          id?: string
          large_url?: string | null
          legend?: string | null
          medium_url?: string | null
          metadata?: Json | null
          original_filename: string
          original_url: string
          processed_at?: string | null
          processing_status?: string | null
          sequence_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size_bytes?: number | null
          formats?: Json | null
          id?: string
          large_url?: string | null
          legend?: string | null
          medium_url?: string | null
          metadata?: Json | null
          original_filename?: string
          original_url?: string
          processed_at?: string | null
          processing_status?: string | null
          sequence_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_images_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
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
          sequence: number | null
        }
        Insert: {
          case_id: string
          event_id: string
          id?: string
          sequence?: number | null
        }
        Update: {
          case_id?: string
          event_id?: string
          id?: string
          sequence?: number | null
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
      event_final_rankings: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          radcoins_awarded: number | null
          rank: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          radcoins_awarded?: number | null
          rank: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          radcoins_awarded?: number | null
          rank?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_final_rankings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_final_rankings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          auto_start: boolean | null
          banner_url: string | null
          case_filters: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          event_type: string | null
          id: string
          max_participants: number | null
          name: string
          number_of_cases: number | null
          prize_distribution: Json | null
          prize_radcoins: number
          scheduled_end: string
          scheduled_start: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
        }
        Insert: {
          auto_start?: boolean | null
          banner_url?: string | null
          case_filters?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_type?: string | null
          id?: string
          max_participants?: number | null
          name: string
          number_of_cases?: number | null
          prize_distribution?: Json | null
          prize_radcoins?: number
          scheduled_end: string
          scheduled_start: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Update: {
          auto_start?: boolean | null
          banner_url?: string | null
          case_filters?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_type?: string | null
          id?: string
          max_participants?: number | null
          name?: string
          number_of_cases?: number | null
          prize_distribution?: Json | null
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
      imaging_subtypes: {
        Row: {
          created_at: string | null
          id: number
          modality_name: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          modality_name: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          modality_name?: string
          name?: string
        }
        Relationships: []
      }
      medical_cases: {
        Row: {
          access_date: string | null
          achievement_triggers: Json | null
          ai_hint_enabled: boolean | null
          ai_tutor_level: string | null
          anatomical_regions: string[] | null
          answer_feedbacks: string[] | null
          answer_options: string[] | null
          answer_short_tips: string[] | null
          author_id: string | null
          can_skip: boolean | null
          case_classification: string | null
          case_complexity_factors: string[] | null
          case_number: number | null
          case_rarity: string | null
          category_id: number | null
          cid10_code: string | null
          clinical_presentation_tags: string[] | null
          clinical_relevance: number | null
          correct_answer_index: number | null
          created_at: string
          created_by: string | null
          description: string | null
          diagnosis_internal: string | null
          differential_diagnoses: string[] | null
          difficulty_description: string | null
          difficulty_level: number | null
          educational_value: number | null
          elimination_penalty_points: number | null
          estimated_solve_time: number | null
          exam_context: string | null
          explanation: string | null
          finding_types: string[] | null
          findings: string | null
          id: string
          image_url: Json | null
          is_radiopaedia_case: boolean
          laterality: string | null
          learning_objectives: string[] | null
          main_question: string | null
          main_symptoms: string[] | null
          manual_hint: string | null
          max_elimination: number | null
          medical_history: string[] | null
          medical_subspecialty: string[] | null
          meta: Json | null
          modality: string | null
          pathology_types: string[] | null
          patient_age: string | null
          patient_clinical_info: string | null
          patient_gender: string | null
          points: number | null
          prerequisite_cases: string[] | null
          primary_diagnosis: string | null
          reference_citation: string | null
          reference_url: string | null
          search_keywords: string[] | null
          secondary_diagnoses: string[] | null
          similar_cases_ids: string[] | null
          skip_penalty_points: number | null
          specialty: string | null
          structured_metadata: Json | null
          subtype: string | null
          symptoms_duration: string | null
          target_audience: string[] | null
          title: string
          unlocks_cases: string[] | null
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          access_date?: string | null
          achievement_triggers?: Json | null
          ai_hint_enabled?: boolean | null
          ai_tutor_level?: string | null
          anatomical_regions?: string[] | null
          answer_feedbacks?: string[] | null
          answer_options?: string[] | null
          answer_short_tips?: string[] | null
          author_id?: string | null
          can_skip?: boolean | null
          case_classification?: string | null
          case_complexity_factors?: string[] | null
          case_number?: number | null
          case_rarity?: string | null
          category_id?: number | null
          cid10_code?: string | null
          clinical_presentation_tags?: string[] | null
          clinical_relevance?: number | null
          correct_answer_index?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagnosis_internal?: string | null
          differential_diagnoses?: string[] | null
          difficulty_description?: string | null
          difficulty_level?: number | null
          educational_value?: number | null
          elimination_penalty_points?: number | null
          estimated_solve_time?: number | null
          exam_context?: string | null
          explanation?: string | null
          finding_types?: string[] | null
          findings?: string | null
          id?: string
          image_url?: Json | null
          is_radiopaedia_case?: boolean
          laterality?: string | null
          learning_objectives?: string[] | null
          main_question?: string | null
          main_symptoms?: string[] | null
          manual_hint?: string | null
          max_elimination?: number | null
          medical_history?: string[] | null
          medical_subspecialty?: string[] | null
          meta?: Json | null
          modality?: string | null
          pathology_types?: string[] | null
          patient_age?: string | null
          patient_clinical_info?: string | null
          patient_gender?: string | null
          points?: number | null
          prerequisite_cases?: string[] | null
          primary_diagnosis?: string | null
          reference_citation?: string | null
          reference_url?: string | null
          search_keywords?: string[] | null
          secondary_diagnoses?: string[] | null
          similar_cases_ids?: string[] | null
          skip_penalty_points?: number | null
          specialty?: string | null
          structured_metadata?: Json | null
          subtype?: string | null
          symptoms_duration?: string | null
          target_audience?: string[] | null
          title: string
          unlocks_cases?: string[] | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          access_date?: string | null
          achievement_triggers?: Json | null
          ai_hint_enabled?: boolean | null
          ai_tutor_level?: string | null
          anatomical_regions?: string[] | null
          answer_feedbacks?: string[] | null
          answer_options?: string[] | null
          answer_short_tips?: string[] | null
          author_id?: string | null
          can_skip?: boolean | null
          case_classification?: string | null
          case_complexity_factors?: string[] | null
          case_number?: number | null
          case_rarity?: string | null
          category_id?: number | null
          cid10_code?: string | null
          clinical_presentation_tags?: string[] | null
          clinical_relevance?: number | null
          correct_answer_index?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          diagnosis_internal?: string | null
          differential_diagnoses?: string[] | null
          difficulty_description?: string | null
          difficulty_level?: number | null
          educational_value?: number | null
          elimination_penalty_points?: number | null
          estimated_solve_time?: number | null
          exam_context?: string | null
          explanation?: string | null
          finding_types?: string[] | null
          findings?: string | null
          id?: string
          image_url?: Json | null
          is_radiopaedia_case?: boolean
          laterality?: string | null
          learning_objectives?: string[] | null
          main_question?: string | null
          main_symptoms?: string[] | null
          manual_hint?: string | null
          max_elimination?: number | null
          medical_history?: string[] | null
          medical_subspecialty?: string[] | null
          meta?: Json | null
          modality?: string | null
          pathology_types?: string[] | null
          patient_age?: string | null
          patient_clinical_info?: string | null
          patient_gender?: string | null
          points?: number | null
          prerequisite_cases?: string[] | null
          primary_diagnosis?: string | null
          reference_citation?: string | null
          reference_url?: string | null
          search_keywords?: string[] | null
          secondary_diagnoses?: string[] | null
          similar_cases_ids?: string[] | null
          skip_penalty_points?: number | null
          specialty?: string | null
          structured_metadata?: Json | null
          subtype?: string | null
          symptoms_duration?: string | null
          target_audience?: string[] | null
          title?: string
          unlocks_cases?: string[] | null
          updated_at?: string
          vital_signs?: Json | null
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
      permanent_admins: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          reason?: string | null
          user_id?: string
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
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean
          limits: Json | null
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean
          limits?: Json | null
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          limits?: Json | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      user_achievements_progress: {
        Row: {
          achievement_id: string
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          is_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_system"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_benefits: {
        Row: {
          ai_credits: number
          badge_collection: Json | null
          bonus_points_multiplier: number
          created_at: string
          custom_title: string | null
          elimination_aids: number
          expires_at: string | null
          has_premium_features: boolean
          id: string
          max_ai_hints_per_day: number
          max_eliminations_per_case: number
          max_skips_per_session: number
          skip_aids: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_credits?: number
          badge_collection?: Json | null
          bonus_points_multiplier?: number
          created_at?: string
          custom_title?: string | null
          elimination_aids?: number
          expires_at?: string | null
          has_premium_features?: boolean
          id?: string
          max_ai_hints_per_day?: number
          max_eliminations_per_case?: number
          max_skips_per_session?: number
          skip_aids?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_credits?: number
          badge_collection?: Json | null
          bonus_points_multiplier?: number
          created_at?: string
          custom_title?: string | null
          elimination_aids?: number
          expires_at?: string | null
          has_premium_features?: boolean
          id?: string
          max_ai_hints_per_day?: number
          max_eliminations_per_case?: number
          max_skips_per_session?: number
          skip_aids?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_case_history: {
        Row: {
          answered_at: string
          case_id: string
          details: Json | null
          help_used: Json | null
          id: string
          is_correct: boolean | null
          points: number | null
          user_id: string
        }
        Insert: {
          answered_at?: string
          case_id: string
          details?: Json | null
          help_used?: Json | null
          id?: string
          is_correct?: boolean | null
          points?: number | null
          user_id: string
        }
        Update: {
          answered_at?: string
          case_id?: string
          details?: Json | null
          help_used?: Json | null
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
      user_help_aids: {
        Row: {
          ai_tutor_credits: number
          created_at: string | null
          elimination_aids: number
          id: string
          last_refill_date: string | null
          skip_aids: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_tutor_credits?: number
          created_at?: string | null
          elimination_aids?: number
          id?: string
          last_refill_date?: string | null
          skip_aids?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_tutor_credits?: number
          created_at?: string | null
          elimination_aids?: number
          id?: string
          last_refill_date?: string | null
          skip_aids?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_journeys: {
        Row: {
          case_ids: Json | null
          completed_at: string | null
          completed_cases: number | null
          created_at: string
          current_case_index: number | null
          description: string | null
          estimated_duration_minutes: number | null
          filters: Json
          id: string
          is_completed: boolean | null
          objectives: Json | null
          progress_percentage: number | null
          status: string | null
          title: string
          total_cases: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_ids?: Json | null
          completed_at?: string | null
          completed_cases?: number | null
          created_at?: string
          current_case_index?: number | null
          description?: string | null
          estimated_duration_minutes?: number | null
          filters?: Json
          id?: string
          is_completed?: boolean | null
          objectives?: Json | null
          progress_percentage?: number | null
          status?: string | null
          title: string
          total_cases?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_ids?: Json | null
          completed_at?: string | null
          completed_cases?: number | null
          created_at?: string
          current_case_index?: number | null
          description?: string | null
          estimated_duration_minutes?: number | null
          filters?: Json
          id?: string
          is_completed?: boolean | null
          objectives?: Json | null
          progress_percentage?: number | null
          status?: string | null
          title?: string
          total_cases?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usuarios_admin_roles: {
        Row: {
          ativo: boolean
          atribuido_em: string
          atribuido_por: string | null
          id: string
          role: string
          usuario_id: string
        }
        Insert: {
          ativo?: boolean
          atribuido_em?: string
          atribuido_por?: string | null
          id?: string
          role: string
          usuario_id: string
        }
        Update: {
          ativo?: boolean
          atribuido_em?: string
          atribuido_por?: string | null
          id?: string
          role?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_admin_roles_atribuido_por_fkey"
            columns: ["atribuido_por"]
            isOneToOne: false
            referencedRelation: "usuarios_app"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_admin_roles_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios_app"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_ajudas: {
        Row: {
          ai_tutor_credits: number
          created_at: string | null
          elimination_aids: number
          id: string
          skip_aids: number
          ultimo_refill: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          ai_tutor_credits?: number
          created_at?: string | null
          elimination_aids?: number
          id?: string
          skip_aids?: number
          ultimo_refill?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          ai_tutor_credits?: number
          created_at?: string | null
          elimination_aids?: number
          id?: string
          skip_aids?: number
          ultimo_refill?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_ajudas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios_app"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_app: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          cidade: string | null
          created_at: string
          current_streak: number
          data_nascimento: string | null
          email: string
          email_verificado: boolean
          especialidade_medica: string | null
          estado: string | null
          id: string
          nome_completo: string | null
          pais: string | null
          radcoin_balance: number
          senha_hash: string
          tipo: string
          total_points: number
          ultimo_login: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          current_streak?: number
          data_nascimento?: string | null
          email: string
          email_verificado?: boolean
          especialidade_medica?: string | null
          estado?: string | null
          id?: string
          nome_completo?: string | null
          pais?: string | null
          radcoin_balance?: number
          senha_hash: string
          tipo?: string
          total_points?: number
          ultimo_login?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          current_streak?: number
          data_nascimento?: string | null
          email?: string
          email_verificado?: boolean
          especialidade_medica?: string | null
          estado?: string | null
          id?: string
          nome_completo?: string | null
          pais?: string | null
          radcoin_balance?: number
          senha_hash?: string
          tipo?: string
          total_points?: number
          ultimo_login?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      usuarios_beneficios: {
        Row: {
          ai_credits: number
          colecao_badges: Json | null
          created_at: string
          elimination_aids: number
          expira_em: string | null
          id: string
          max_dicas_ia_por_dia: number
          max_pulos_por_sessao: number
          multiplicador_pontos: number
          skip_aids: number
          tem_recursos_premium: boolean
          titulo_personalizado: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          ai_credits?: number
          colecao_badges?: Json | null
          created_at?: string
          elimination_aids?: number
          expira_em?: string | null
          id?: string
          max_dicas_ia_por_dia?: number
          max_pulos_por_sessao?: number
          multiplicador_pontos?: number
          skip_aids?: number
          tem_recursos_premium?: boolean
          titulo_personalizado?: string | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          ai_credits?: number
          colecao_badges?: Json | null
          created_at?: string
          elimination_aids?: number
          expira_em?: string | null
          id?: string
          max_dicas_ia_por_dia?: number
          max_pulos_por_sessao?: number
          multiplicador_pontos?: number
          skip_aids?: number
          tem_recursos_premium?: boolean
          titulo_personalizado?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_beneficios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios_app"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_sessoes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          token_hash: string
          user_agent: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          token_hash: string
          user_agent?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          token_hash?: string
          user_agent?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_sessoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios_app"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_radcoins: {
        Args: {
          p_user_id: string
          p_amount: number
          p_transaction_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      consume_help_aid: {
        Args: { p_user_id: string; p_aid_type: string; p_amount?: number }
        Returns: boolean
      }
      count_total_admins: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_admin_direct: {
        Args: { p_email: string; p_full_name: string; p_type?: string }
        Returns: string
      }
      create_dev_user: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
          p_role?: string
        }
        Returns: Json
      }
      create_dev_user_simple: {
        Args: { p_email: string; p_full_name: string; p_type?: string }
        Returns: string
      }
      create_user_with_auth: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
          p_type?: string
        }
        Returns: Json
      }
      emergency_admin_recovery: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_permanent_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      limpar_sessoes_expiradas: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      log_signup_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_data?: Json
          p_error_message?: string
        }
        Returns: undefined
      }
      process_case_completion: {
        Args:
          | { p_case_id: string; p_points?: number; p_is_correct?: boolean }
          | { p_user_id: string; p_case_id: string; p_points?: number }
        Returns: undefined
      }
      promote_to_permanent_admin: {
        Args: {
          target_user_id: string
          target_email: string
          promotion_reason?: string
        }
        Returns: boolean
      }
      refill_daily_help_aids: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      setup_dev_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_first_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_user_benefits: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      academic_stage: "Student" | "Intern" | "Resident" | "Specialist"
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
