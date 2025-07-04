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
      ai_chat_messages: {
        Row: {
          content: string
          context_data: Json | null
          created_at: string | null
          id: string
          message_type: string
          radcoins_cost: number | null
          session_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          content: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          message_type: string
          radcoins_cost?: number | null
          session_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          content?: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          message_type?: string
          radcoins_cost?: number | null
          session_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          session_name: string | null
          total_messages: number | null
          total_radcoins_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_name?: string | null
          total_messages?: number | null
          total_radcoins_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_name?: string | null
          total_messages?: number | null
          total_radcoins_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_reports: {
        Row: {
          chat_message_id: string | null
          created_at: string | null
          description: string
          id: string
          report_type: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          chat_message_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          report_type?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          chat_message_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          report_type?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_reports_chat_message_id_fkey"
            columns: ["chat_message_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_config: {
        Row: {
          ai_function_type: string
          api_provider: string
          config_name: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean | null
          max_tokens: number
          model_name: string
          optimization_data: Json | null
          prompt_category: string | null
          prompt_template: string | null
          prompt_version: number | null
          temperature: number
          updated_at: string
          usage_stats: Json | null
        }
        Insert: {
          ai_function_type?: string
          api_provider?: string
          config_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          max_tokens?: number
          model_name?: string
          optimization_data?: Json | null
          prompt_category?: string | null
          prompt_template?: string | null
          prompt_version?: number | null
          temperature?: number
          updated_at?: string
          usage_stats?: Json | null
        }
        Update: {
          ai_function_type?: string
          api_provider?: string
          config_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          max_tokens?: number
          model_name?: string
          optimization_data?: Json | null
          prompt_category?: string | null
          prompt_template?: string | null
          prompt_version?: number | null
          temperature?: number
          updated_at?: string
          usage_stats?: Json | null
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
      automation_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          operation_type: string
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          operation_type: string
          status: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          operation_type?: string
          status?: string
        }
        Relationships: []
      }
      case_images: {
        Row: {
          bucket_path: string | null
          case_id: string
          created_at: string | null
          dimensions: Json | null
          file_size_bytes: number | null
          formats: Json | null
          id: string
          large_url: string | null
          legend: string | null
          medium_url: string | null
          metadata: Json | null
          modality_prefix: string | null
          organization_metadata: Json | null
          original_filename: string
          original_url: string
          processed_at: string | null
          processing_status: string | null
          sequence_order: number | null
          specialty_code: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          bucket_path?: string | null
          case_id: string
          created_at?: string | null
          dimensions?: Json | null
          file_size_bytes?: number | null
          formats?: Json | null
          id?: string
          large_url?: string | null
          legend?: string | null
          medium_url?: string | null
          metadata?: Json | null
          modality_prefix?: string | null
          organization_metadata?: Json | null
          original_filename: string
          original_url: string
          processed_at?: string | null
          processing_status?: string | null
          sequence_order?: number | null
          specialty_code?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bucket_path?: string | null
          case_id?: string
          created_at?: string | null
          dimensions?: Json | null
          file_size_bytes?: number | null
          formats?: Json | null
          id?: string
          large_url?: string | null
          legend?: string | null
          medium_url?: string | null
          metadata?: Json | null
          modality_prefix?: string | null
          organization_metadata?: Json | null
          original_filename?: string
          original_url?: string
          processed_at?: string | null
          processing_status?: string | null
          sequence_order?: number | null
          specialty_code?: string | null
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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          metadata: Json | null
          name: string
          replied_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          metadata?: Json | null
          name: string
          replied_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          metadata?: Json | null
          name?: string
          replied_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          community_stats: Json | null
          correct_answer: boolean
          created_at: string | null
          explanation: string
          external_id: string
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          challenge_date?: string
          community_stats?: Json | null
          correct_answer: boolean
          created_at?: string | null
          explanation: string
          external_id: string
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          challenge_date?: string
          community_stats?: Json | null
          correct_answer?: boolean
          created_at?: string | null
          explanation?: string
          external_id?: string
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_quiz_questions: {
        Row: {
          ai_confidence: number | null
          correct_answer: boolean
          created_at: string | null
          explanation: string
          generated_by_ai: boolean | null
          id: string
          metadata: Json | null
          prompt_control_id: string | null
          published_date: string | null
          question: string
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          correct_answer: boolean
          created_at?: string | null
          explanation: string
          generated_by_ai?: boolean | null
          id?: string
          metadata?: Json | null
          prompt_control_id?: string | null
          published_date?: string | null
          question: string
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          correct_answer?: boolean
          created_at?: string | null
          explanation?: string
          generated_by_ai?: boolean | null
          id?: string
          metadata?: Json | null
          prompt_control_id?: string | null
          published_date?: string | null
          question?: string
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_quiz_questions_prompt_control_id_fkey"
            columns: ["prompt_control_id"]
            isOneToOne: false
            referencedRelation: "quiz_prompt_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quiz_user_log: {
        Row: {
          answered_at: string | null
          challenge_id: string | null
          device_info: Json | null
          id: string
          is_correct: boolean
          question_id: string | null
          time_spent_seconds: number | null
          user_answer: boolean
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          challenge_id?: string | null
          device_info?: Json | null
          id?: string
          is_correct: boolean
          question_id?: string | null
          time_spent_seconds?: number | null
          user_answer: boolean
          user_id: string
        }
        Update: {
          answered_at?: string | null
          challenge_id?: string | null
          device_info?: Json | null
          id?: string
          is_correct?: boolean
          question_id?: string | null
          time_spent_seconds?: number | null
          user_answer?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_quiz_user_log_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_quiz_user_log_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "daily_quiz_questions"
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
      event_banner_images: {
        Row: {
          created_at: string | null
          event_id: string
          file_size_bytes: number | null
          full_url: string
          id: string
          medium_url: string
          metadata: Json | null
          original_filename: string
          processed: boolean | null
          thumb_url: string
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          file_size_bytes?: number | null
          full_url: string
          id?: string
          medium_url: string
          metadata?: Json | null
          original_filename: string
          processed?: boolean | null
          thumb_url: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          file_size_bytes?: number | null
          full_url?: string
          id?: string
          medium_url?: string
          metadata?: Json | null
          original_filename?: string
          processed?: boolean | null
          thumb_url?: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_banner_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      event_stats_cache: {
        Row: {
          average_score: number | null
          cache_updated_at: string | null
          completion_rate: number | null
          event_id: string
          performance_distribution: Json | null
          top_performers: Json | null
          total_participants: number | null
        }
        Insert: {
          average_score?: number | null
          cache_updated_at?: string | null
          completion_rate?: number | null
          event_id: string
          performance_distribution?: Json | null
          top_performers?: Json | null
          total_participants?: number | null
        }
        Update: {
          average_score?: number | null
          cache_updated_at?: string | null
          completion_rate?: number | null
          event_id?: string
          performance_distribution?: Json | null
          top_performers?: Json | null
          total_participants?: number | null
        }
        Relationships: []
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
          bucket_prefix: string | null
          id: number
          name: string
          specialty_code: string | null
        }
        Insert: {
          bucket_prefix?: string | null
          id?: number
          name: string
          specialty_code?: string | null
        }
        Update: {
          bucket_prefix?: string | null
          id?: number
          name?: string
          specialty_code?: string | null
        }
        Relationships: []
      }
      modality_mappings: {
        Row: {
          bucket_folder: string
          created_at: string | null
          id: number
          modality_name: string
          modality_prefix: string
        }
        Insert: {
          bucket_folder: string
          created_at?: string | null
          id?: number
          modality_name: string
          modality_prefix: string
        }
        Update: {
          bucket_folder?: string
          created_at?: string | null
          id?: number
          modality_name?: string
          modality_prefix?: string
        }
        Relationships: []
      }
      newsletter_leads: {
        Row: {
          email: string
          id: string
          is_active: boolean
          metadata: Json | null
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
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
          active_title: string | null
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          city: string | null
          college: string | null
          country_code: string | null
          created_at: string
          current_streak: number
          current_xp: number | null
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
          user_level: number | null
          username: string | null
        }
        Insert: {
          academic_specialty?: string | null
          academic_stage?: Database["public"]["Enums"]["academic_stage"] | null
          active_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          college?: string | null
          country_code?: string | null
          created_at?: string
          current_streak?: number
          current_xp?: number | null
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
          user_level?: number | null
          username?: string | null
        }
        Update: {
          academic_specialty?: string | null
          academic_stage?: Database["public"]["Enums"]["academic_stage"] | null
          active_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          college?: string | null
          country_code?: string | null
          created_at?: string
          current_streak?: number
          current_xp?: number | null
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
          user_level?: number | null
          username?: string | null
        }
        Relationships: []
      }
      quiz_prompt_controls: {
        Row: {
          category: string
          created_at: string | null
          created_by: string
          difficulty: string
          id: string
          is_active: boolean | null
          modality: string
          name: string
          prompt_template: string
          success_rate: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by: string
          difficulty: string
          id?: string
          is_active?: boolean | null
          modality: string
          name: string
          prompt_template: string
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string
          difficulty?: string
          id?: string
          is_active?: boolean | null
          modality?: string
          name?: string
          prompt_template?: string
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      radcoin_products: {
        Row: {
          benefits: Json
          category: string
          created_at: string
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean
          is_popular: boolean | null
          max_purchase_per_user: number | null
          metadata: Json | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          benefits?: Json
          category?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          is_popular?: boolean | null
          max_purchase_per_user?: number | null
          metadata?: Json | null
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          benefits?: Json
          category?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          is_popular?: boolean | null
          max_purchase_per_user?: number | null
          metadata?: Json | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      radcoin_purchase_history: {
        Row: {
          benefits_received: Json
          created_at: string
          id: string
          metadata: Json | null
          product_id: string | null
          purchase_type: string
          radcoins_spent: number
          special_offer_id: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          benefits_received?: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          purchase_type: string
          radcoins_spent: number
          special_offer_id?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          benefits_received?: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          purchase_type?: string
          radcoins_spent?: number
          special_offer_id?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "radcoin_purchase_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "radcoin_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radcoin_purchase_history_special_offer_id_fkey"
            columns: ["special_offer_id"]
            isOneToOne: false
            referencedRelation: "radcoin_special_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radcoin_purchase_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "radcoin_transactions_log"
            referencedColumns: ["id"]
          },
        ]
      }
      radcoin_special_offers: {
        Row: {
          benefits: Json
          created_at: string
          current_redemptions: number | null
          description: string | null
          discount_percentage: number
          expires_at: string | null
          id: string
          is_active: boolean
          is_limited: boolean | null
          max_redemptions: number | null
          metadata: Json | null
          name: string
          original_price: number
          sale_price: number
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          benefits?: Json
          created_at?: string
          current_redemptions?: number | null
          description?: string | null
          discount_percentage: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_limited?: boolean | null
          max_redemptions?: number | null
          metadata?: Json | null
          name: string
          original_price: number
          sale_price: number
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          benefits?: Json
          created_at?: string
          current_redemptions?: number | null
          description?: string | null
          discount_percentage?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_limited?: boolean | null
          max_redemptions?: number | null
          metadata?: Json | null
          name?: string
          original_price?: number
          sale_price?: number
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      radcoin_store_config: {
        Row: {
          description: string | null
          is_public: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          is_public?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          is_public?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      radcoin_transactions_2024_07: {
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
      radcoin_transactions_2024_08: {
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
      radcoin_transactions_2024_09: {
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
      radcoin_transactions_2024_10: {
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
      radcoin_transactions_2024_11: {
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
      radcoin_transactions_2024_12: {
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
      radcoin_transactions_2025_01: {
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
      radcoin_transactions_partitioned: {
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
      system_metrics: {
        Row: {
          id: string
          metric_metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metric_metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metric_metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
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
      temp_backup_case_images: {
        Row: {
          bucket_path: string | null
          case_id: string | null
          created_at: string | null
          dimensions: Json | null
          file_size_bytes: number | null
          formats: Json | null
          id: string | null
          large_url: string | null
          legend: string | null
          medium_url: string | null
          metadata: Json | null
          modality_prefix: string | null
          organization_metadata: Json | null
          original_filename: string | null
          original_url: string | null
          processed_at: string | null
          processing_status: string | null
          sequence_order: number | null
          specialty_code: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          bucket_path?: string | null
          case_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size_bytes?: number | null
          formats?: Json | null
          id?: string | null
          large_url?: string | null
          legend?: string | null
          medium_url?: string | null
          metadata?: Json | null
          modality_prefix?: string | null
          organization_metadata?: Json | null
          original_filename?: string | null
          original_url?: string | null
          processed_at?: string | null
          processing_status?: string | null
          sequence_order?: number | null
          specialty_code?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bucket_path?: string | null
          case_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size_bytes?: number | null
          formats?: Json | null
          id?: string | null
          large_url?: string | null
          legend?: string | null
          medium_url?: string | null
          metadata?: Json | null
          modality_prefix?: string | null
          organization_metadata?: Json | null
          original_filename?: string | null
          original_url?: string | null
          processed_at?: string | null
          processing_status?: string | null
          sequence_order?: number | null
          specialty_code?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
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
          review_count: number | null
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
          review_count?: number | null
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
          review_count?: number | null
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
      user_consent: {
        Row: {
          analytics_consent: boolean | null
          created_at: string
          functional_consent: boolean | null
          id: string
          marketing_consent: boolean | null
          updated_at: string
          user_session: string
        }
        Insert: {
          analytics_consent?: boolean | null
          created_at?: string
          functional_consent?: boolean | null
          id?: string
          marketing_consent?: boolean | null
          updated_at?: string
          user_session: string
        }
        Update: {
          analytics_consent?: boolean | null
          created_at?: string
          functional_consent?: boolean | null
          id?: string
          marketing_consent?: boolean | null
          updated_at?: string
          user_session?: string
        }
        Relationships: []
      }
      user_daily_challenges: {
        Row: {
          answered: boolean | null
          answered_at: string | null
          challenge_id: string | null
          created_at: string | null
          id: string
          reward_given: boolean | null
          user_answer: boolean | null
          user_id: string
          was_correct: boolean | null
        }
        Insert: {
          answered?: boolean | null
          answered_at?: string | null
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          reward_given?: boolean | null
          user_answer?: boolean | null
          user_id: string
          was_correct?: boolean | null
        }
        Update: {
          answered?: boolean | null
          answered_at?: string | null
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          reward_given?: boolean | null
          user_answer?: boolean | null
          user_id?: string
          was_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_event_progress: {
        Row: {
          cases_completed: number
          cases_correct: number
          completed_at: string | null
          created_at: string
          current_case_index: number
          current_score: number
          event_id: string
          id: string
          last_activity_at: string
          metadata: Json | null
          started_at: string
          status: string
          time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cases_completed?: number
          cases_correct?: number
          completed_at?: string | null
          created_at?: string
          current_case_index?: number
          current_score?: number
          event_id: string
          id?: string
          last_activity_at?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cases_completed?: number
          cases_correct?: number
          completed_at?: string | null
          created_at?: string
          current_case_index?: number
          current_score?: number
          event_id?: string
          id?: string
          last_activity_at?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_levels: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          level: number
          title_unlocked: string | null
          xp_required: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          level: number
          title_unlocked?: string | null
          xp_required: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          level?: number
          title_unlocked?: string | null
          xp_required?: number
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          admin_id: string | null
          admin_response: string | null
          case_id: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          report_type: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          admin_response?: string | null
          case_id?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          report_type: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          admin_response?: string | null
          case_id?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          report_type?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats_cache: {
        Row: {
          accuracy_percentage: number | null
          cache_updated_at: string | null
          correct_answers: number | null
          current_streak: number | null
          last_activity: string | null
          radcoin_balance: number | null
          specialty_stats: Json | null
          total_cases: number | null
          total_points: number | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          cache_updated_at?: string | null
          correct_answers?: number | null
          current_streak?: number | null
          last_activity?: string | null
          radcoin_balance?: number | null
          specialty_stats?: Json | null
          total_cases?: number | null
          total_points?: number | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          cache_updated_at?: string | null
          correct_answers?: number | null
          current_streak?: number | null
          last_activity?: string | null
          radcoin_balance?: number | null
          specialty_stats?: Json | null
          total_cases?: number | null
          total_points?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_titles: {
        Row: {
          id: string
          is_active: boolean | null
          title: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          title: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          title?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_titles_user_id_fkey"
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
      add_help_aids: {
        Args: {
          p_user_id: string
          p_elimination_aids?: number
          p_skip_aids?: number
          p_ai_tutor_credits?: number
        }
        Returns: boolean
      }
      auto_cleanup_temp_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_publish_daily_challenge: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_schedule_daily_questions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      award_daily_login_bonus: {
        Args: { p_user_id: string }
        Returns: Json
      }
      award_radcoins: {
        Args: {
          p_user_id: string
          p_amount: number
          p_transaction_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      calculate_user_level: {
        Args: { p_total_points: number }
        Returns: {
          level: number
          xp_required: number
          next_level_xp: number
          title: string
          progress_percentage: number
        }[]
      }
      charge_radcoins_for_ai_chat: {
        Args: { p_user_id: string; p_amount: number }
        Returns: boolean
      }
      check_case_review_status: {
        Args: { p_user_id: string; p_case_id: string }
        Returns: Json
      }
      check_daily_challenge_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_event_banners: {
        Args: Record<PropertyKey, never>
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
      create_filtered_notification: {
        Args: {
          p_type: string
          p_title: string
          p_message: string
          p_priority?: string
          p_action_url?: string
          p_action_label?: string
          p_metadata?: Json
          p_user_filter?: Json
        }
        Returns: number
      }
      create_monthly_partitions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      debug_event_banner_upload: {
        Args: { p_event_id: string }
        Returns: Json
      }
      emergency_admin_recovery: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      execute_ultra_safe_bucket_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_active_prompt: {
        Args: { p_function_type: string; p_category?: string }
        Returns: {
          prompt_template: string
          model_name: string
          max_tokens: number
          temperature: number
          config_id: string
        }[]
      }
      get_case_images_unified: {
        Args: { p_case_id: string }
        Returns: Json[]
      }
      get_challenge_analytics: {
        Args: { p_date_from?: string; p_date_to?: string }
        Returns: Json
      }
      get_daily_challenge_for_user: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_daily_challenge_for_user_debug: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_system_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_type: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["profile_type"]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_or_owner: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_permanent_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_ai_prompt_usage: {
        Args: {
          p_config_id: string
          p_tokens_used: number
          p_response_time_ms: number
          p_success?: boolean
          p_cost_estimate?: number
        }
        Returns: undefined
      }
      log_automation: {
        Args: { p_operation_type: string; p_status: string; p_details?: Json }
        Returns: undefined
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
      maintain_question_pool: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      optimize_database_performance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_case_completion: {
        Args: {
          p_user_id: string
          p_case_id: string
          p_points?: number
          p_is_correct?: boolean
        }
        Returns: undefined
      }
      process_level_up: {
        Args: { p_user_id: string }
        Returns: Json
      }
      promote_to_permanent_admin: {
        Args: {
          target_user_id: string
          target_email: string
          promotion_reason?: string
        }
        Returns: boolean
      }
      purchase_radcoin_product: {
        Args: {
          p_user_id: string
          p_product_id?: string
          p_special_offer_id?: string
        }
        Returns: Json
      }
      refill_daily_help_aids: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      refresh_user_stats_cache: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      setup_dev_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_first_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_initial_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      start_event_participation: {
        Args: { p_event_id: string }
        Returns: Json
      }
      submit_daily_challenge: {
        Args: {
          p_user_id: string
          p_challenge_id: string
          p_user_answer: boolean
        }
        Returns: Json
      }
      sync_case_images_to_legacy: {
        Args: { p_case_id: string }
        Returns: boolean
      }
      sync_subscription_benefits: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      sync_user_benefits: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      sync_user_total_points: {
        Args: { p_user_id?: string }
        Returns: {
          user_id: string
          old_points: number
          new_points: number
          difference: number
        }[]
      }
      system_cleanup_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_event_progress: {
        Args: {
          p_event_id: string
          p_case_correct: boolean
          p_points_earned: number
          p_time_spent: number
        }
        Returns: Json
      }
      validate_points_system: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: string
          count_affected: number
        }[]
      }
    }
    Enums: {
      academic_stage: "Student" | "Intern" | "Resident" | "Specialist"
      ai_function_type:
        | "ai_tutor"
        | "case_autofill"
        | "event_ai_suggestions"
        | "journey_ai_suggestions"
        | "radbot_chat"
      event_status: "SCHEDULED" | "ACTIVE" | "FINISHED"
      profile_type: "USER" | "ADMIN"
      radcoin_tx_type:
        | "event_reward"
        | "subscription_purchase"
        | "help_purchase"
        | "admin_grant"
        | "admin_revoke"
        | "profile_completion"
        | "profile_completion_bonus"
        | "daily_login"
        | "ai_chat_usage"
        | "store_purchase"
        | "store_welcome_bonus"
        | "daily_challenge"
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
      ai_function_type: [
        "ai_tutor",
        "case_autofill",
        "event_ai_suggestions",
        "journey_ai_suggestions",
        "radbot_chat",
      ],
      event_status: ["SCHEDULED", "ACTIVE", "FINISHED"],
      profile_type: ["USER", "ADMIN"],
      radcoin_tx_type: [
        "event_reward",
        "subscription_purchase",
        "help_purchase",
        "admin_grant",
        "admin_revoke",
        "profile_completion",
        "profile_completion_bonus",
        "daily_login",
        "ai_chat_usage",
        "store_purchase",
        "store_welcome_bonus",
        "daily_challenge",
      ],
      subscription_tier: ["Free", "Pro", "Plus"],
    },
  },
} as const
