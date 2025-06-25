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
      accuracy_rankings: {
        Row: {
          accuracy_percentage: number | null
          correct_cases: number
          created_at: string | null
          final_rank: number | null
          id: string
          min_cases_required: number | null
          month_year: string
          total_cases: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          correct_cases?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          min_cases_required?: number | null
          month_year: string
          total_cases?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          correct_cases?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          min_cases_required?: number | null
          month_year?: string
          total_cases?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          target_user_id: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          target_user_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          target_user_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_metrics: {
        Row: {
          created_at: string | null
          date_recorded: string
          id: string
          metric_name: string
          metric_value: Json
        }
        Insert: {
          created_at?: string | null
          date_recorded?: string
          id?: string
          metric_name: string
          metric_value: Json
        }
        Update: {
          created_at?: string | null
          date_recorded?: string
          id?: string
          metric_name?: string
          metric_value?: Json
        }
        Relationships: []
      }
      ai_knowledge_base: {
        Row: {
          approved_by: string | null
          category: string
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_approved: boolean | null
          subcategory: string | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          category: string
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_approved?: boolean | null
          subcategory?: string | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          category?: string
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_approved?: boolean | null
          subcategory?: string | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_pattern_detection: {
        Row: {
          auto_block: boolean | null
          created_at: string | null
          detection_rules: Json
          id: string
          is_active: boolean | null
          pattern_name: string
          severity_level: string | null
        }
        Insert: {
          auto_block?: boolean | null
          created_at?: string | null
          detection_rules: Json
          id?: string
          is_active?: boolean | null
          pattern_name: string
          severity_level?: string | null
        }
        Update: {
          auto_block?: boolean | null
          created_at?: string | null
          detection_rules?: Json
          id?: string
          is_active?: boolean | null
          pattern_name?: string
          severity_level?: string | null
        }
        Relationships: []
      }
      ai_tutor_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_tutor_feedback: {
        Row: {
          case_id: string | null
          created_at: string | null
          feedback_type: string | null
          id: string
          rating: number | null
          tutor_response: string
          user_comment: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          rating?: number | null
          tutor_response: string
          user_comment?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          rating?: number | null
          tutor_response?: string
          user_comment?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_feedback_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_usage: {
        Row: {
          case_id: string
          created_at: string | null
          feedback_comment: string | null
          feedback_rating: number | null
          id: string
          prompt_used: string | null
          response_generated: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          prompt_used?: string | null
          response_generated?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          prompt_used?: string | null
          response_generated?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          key_value: string | null
          service_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key_value?: string | null
          service_name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key_value?: string | null
          service_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      case_sequences: {
        Row: {
          category: string
          created_at: string | null
          id: string
          last_id: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          last_id?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          last_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      case_versions: {
        Row: {
          case_data: Json
          case_id: string | null
          changes_description: string | null
          created_at: string | null
          created_by: string | null
          id: string
          version_number: number
        }
        Insert: {
          case_data: Json
          case_id?: string | null
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number: number
        }
        Update: {
          case_data?: Json
          case_id?: string | null
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_versions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases_solved_rankings: {
        Row: {
          accuracy_percentage: number | null
          created_at: string | null
          final_rank: number | null
          id: string
          period_type: string
          period_value: string
          points_earned: number
          total_cases: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          created_at?: string | null
          final_rank?: number | null
          id?: string
          period_type: string
          period_value: string
          points_earned?: number
          total_cases?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          created_at?: string | null
          final_rank?: number | null
          id?: string
          period_type?: string
          period_value?: string
          points_earned?: number
          total_cases?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      category_rankings: {
        Row: {
          accuracy_percentage: number | null
          cases_solved: number
          category: string
          created_at: string | null
          final_rank: number | null
          id: string
          month_year: string
          points_in_category: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          cases_solved?: number
          category: string
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year: string
          points_in_category?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          cases_solved?: number
          category?: string
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year?: string
          points_in_category?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_journey_cases: {
        Row: {
          case_id: string
          case_order: number
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          journey_id: string
        }
        Insert: {
          case_id: string
          case_order: number
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          journey_id: string
        }
        Update: {
          case_id?: string
          case_order?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          journey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_journey_cases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_journey_cases_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "custom_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_journeys: {
        Row: {
          completed_cases: number
          config: Json
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          total_cases: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_cases?: number
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          total_cases?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_cases?: number
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          total_cases?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      economy_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "economy_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_answers: {
        Row: {
          answered_at: string
          case_id: string
          event_id: string
          help_used: boolean
          id: string
          is_correct: boolean
          points_earned: number
          selected_answer: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answered_at?: string
          case_id: string
          event_id: string
          help_used?: boolean
          id?: string
          is_correct: boolean
          points_earned?: number
          selected_answer: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answered_at?: string
          case_id?: string
          event_id?: string
          help_used?: boolean
          id?: string
          is_correct?: boolean
          points_earned?: number
          selected_answer?: number
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_answers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_answers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_cases: {
        Row: {
          case_id: string
          case_order: number
          created_at: string
          event_id: string
          id: string
          is_required: boolean
          points_multiplier: number
        }
        Insert: {
          case_id: string
          case_order: number
          created_at?: string
          event_id: string
          id?: string
          is_required?: boolean
          points_multiplier?: number
        }
        Update: {
          case_id?: string
          case_order?: number
          created_at?: string
          event_id?: string
          id?: string
          is_required?: boolean
          points_multiplier?: number
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
      event_notifications: {
        Row: {
          event_id: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          sent_at: string
          title: string
          user_id: string | null
        }
        Insert: {
          event_id: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          sent_at?: string
          title: string
          user_id?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          sent_at?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          average_time: number | null
          cases_completed: number
          cases_correct: number
          completion_percentage: number
          enrolled_at: string
          event_id: string
          id: string
          status: string
          total_points: number
          user_id: string
        }
        Insert: {
          average_time?: number | null
          cases_completed?: number
          cases_correct?: number
          completion_percentage?: number
          enrolled_at?: string
          event_id: string
          id?: string
          status?: string
          total_points?: number
          user_id: string
        }
        Update: {
          average_time?: number | null
          cases_completed?: number
          cases_correct?: number
          completion_percentage?: number
          enrolled_at?: string
          event_id?: string
          id?: string
          status?: string
          total_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_radcoin_prizes: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          radcoin_amount: number
          rank_max: number
          rank_min: number
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          radcoin_amount: number
          rank_max: number
          rank_min: number
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          radcoin_amount?: number
          rank_max?: number
          rank_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_radcoin_prizes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rankings: {
        Row: {
          accuracy_percentage: number
          average_time: number | null
          correct_cases: number
          event_id: string
          id: string
          no_help_cases: number
          rank_position: number | null
          total_cases: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number
          average_time?: number | null
          correct_cases?: number
          event_id: string
          id?: string
          no_help_cases?: number
          rank_position?: number | null
          total_cases?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_percentage?: number
          average_time?: number | null
          correct_cases?: number
          event_id?: string
          id?: string
          no_help_cases?: number
          rank_position?: number | null
          total_cases?: number
          total_points?: number
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
          {
            foreignKeyName: "event_rankings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
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
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rewards: {
        Row: {
          created_at: string
          event_id: string
          id: string
          rank_position: number
          reward_amount: number
          reward_description: string | null
          reward_type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          rank_position: number
          reward_amount?: number
          reward_description?: string | null
          reward_type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          rank_position?: number
          reward_amount?: number
          reward_description?: string | null
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rewards_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          auto_publish_at: string | null
          case_count: number
          case_ids: string[] | null
          categories: string[] | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string
          image_url: string | null
          max_participants: number | null
          modalities: string[] | null
          name: string
          published_at: string | null
          specialty: string | null
          start_date: string | null
          start_time: string | null
          status: string
          subcategory: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          auto_publish_at?: string | null
          case_count?: number
          case_ids?: string[] | null
          categories?: string[] | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          max_participants?: number | null
          modalities?: string[] | null
          name: string
          published_at?: string | null
          specialty?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          subcategory?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          auto_publish_at?: string | null
          case_count?: number
          case_ids?: string[] | null
          categories?: string[] | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          max_participants?: number | null
          modalities?: string[] | null
          name?: string
          published_at?: string | null
          specialty?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          subcategory?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      global_rankings: {
        Row: {
          accuracy_percentage: number | null
          best_streak: number
          created_at: string | null
          current_streak: number
          id: string
          no_help_cases: number
          rank_position: number | null
          total_cases: number
          total_correct: number
          total_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          best_streak?: number
          created_at?: string | null
          current_streak?: number
          id?: string
          no_help_cases?: number
          rank_position?: number | null
          total_cases?: number
          total_correct?: number
          total_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          best_streak?: number
          created_at?: string | null
          current_streak?: number
          id?: string
          no_help_cases?: number
          rank_position?: number | null
          total_cases?: number
          total_correct?: number
          total_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      imaging_modalities: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      imaging_subtypes: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          modality_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          modality_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          modality_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imaging_subtypes_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "imaging_modalities"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_cases: {
        Row: {
          category: string
          clinical_summary: string
          correct_answer: number
          created_at: string | null
          created_by: string | null
          difficulty: string
          explanation: string
          id: string
          image_url: string | null
          imaging_findings: string[] | null
          imaging_modality_id: string | null
          imaging_subtype_id: string | null
          imaging_technique: string | null
          imaging_view: string | null
          option_feedbacks: Json | null
          options: Json
          patient_age: number | null
          patient_conditions: string[] | null
          patient_gender: string | null
          patient_info: string
          points: number | null
          question: string
          symptom_duration: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          clinical_summary: string
          correct_answer: number
          created_at?: string | null
          created_by?: string | null
          difficulty: string
          explanation: string
          id?: string
          image_url?: string | null
          imaging_findings?: string[] | null
          imaging_modality_id?: string | null
          imaging_subtype_id?: string | null
          imaging_technique?: string | null
          imaging_view?: string | null
          option_feedbacks?: Json | null
          options: Json
          patient_age?: number | null
          patient_conditions?: string[] | null
          patient_gender?: string | null
          patient_info: string
          points?: number | null
          question: string
          symptom_duration?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          clinical_summary?: string
          correct_answer?: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: string
          explanation?: string
          id?: string
          image_url?: string | null
          imaging_findings?: string[] | null
          imaging_modality_id?: string | null
          imaging_subtype_id?: string | null
          imaging_technique?: string | null
          imaging_view?: string | null
          option_feedbacks?: Json | null
          options?: Json
          patient_age?: number | null
          patient_conditions?: string[] | null
          patient_gender?: string | null
          patient_info?: string
          points?: number | null
          question?: string
          symptom_duration?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_cases_imaging_modality_id_fkey"
            columns: ["imaging_modality_id"]
            isOneToOne: false
            referencedRelation: "imaging_modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_cases_imaging_subtype_id_fkey"
            columns: ["imaging_subtype_id"]
            isOneToOne: false
            referencedRelation: "imaging_subtypes"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_rankings: {
        Row: {
          created_at: string | null
          final_rank: number | null
          id: string
          month_year: string
          points_in_month: number
          title_at_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year: string
          points_in_month?: number
          title_at_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year?: string
          points_in_month?: number
          title_at_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_rankings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      no_help_rankings: {
        Row: {
          created_at: string | null
          final_rank: number | null
          id: string
          no_help_accuracy: number | null
          no_help_correct: number
          period_type: string
          period_value: string
          points_from_no_help: number
          total_no_help_attempts: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          final_rank?: number | null
          id?: string
          no_help_accuracy?: number | null
          no_help_correct?: number
          period_type: string
          period_value: string
          points_from_no_help?: number
          total_no_help_attempts?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          final_rank?: number | null
          id?: string
          no_help_accuracy?: number | null
          no_help_correct?: number
          period_type?: string
          period_value?: string
          points_from_no_help?: number
          total_no_help_attempts?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      premium_questions: {
        Row: {
          created_at: string | null
          id: string
          is_next_premium: boolean | null
          question_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_next_premium?: boolean | null
          question_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_next_premium?: boolean | null
          question_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ajudas_disponiveis: number | null
          area_interesse: string[] | null
          avatar_url: string | null
          bio: string | null
          cidade: string | null
          created_at: string | null
          current_streak: number | null
          custom_frame: string | null
          eliminar_opcao_saldo: number | null
          eliminate_option_helps: number | null
          email: string | null
          emblemas: string[] | null
          estado: string | null
          full_name: string | null
          help_eliminations_used: number | null
          help_skips_used: number | null
          id: string
          last_help_reset_date: string | null
          nome_completo: string | null
          nome_exibicao: string | null
          profile_completion_percentage: number | null
          pular_questao_saldo: number | null
          questions_answered_count: number | null
          radcoin_balance: number | null
          ranking_position: number | null
          recompensas: string[] | null
          role: string | null
          semestre_ou_periodo: string | null
          skins_desbloqueadas: string[] | null
          skip_question_helps: number | null
          stars: number | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          title: string | null
          total_points: number | null
          tutor_ai_helps: number | null
          tutor_ai_saldo: number | null
          ultima_data_jogo: string | null
          universidade: string | null
          updated_at: string | null
        }
        Insert: {
          ajudas_disponiveis?: number | null
          area_interesse?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string | null
          current_streak?: number | null
          custom_frame?: string | null
          eliminar_opcao_saldo?: number | null
          eliminate_option_helps?: number | null
          email?: string | null
          emblemas?: string[] | null
          estado?: string | null
          full_name?: string | null
          help_eliminations_used?: number | null
          help_skips_used?: number | null
          id: string
          last_help_reset_date?: string | null
          nome_completo?: string | null
          nome_exibicao?: string | null
          profile_completion_percentage?: number | null
          pular_questao_saldo?: number | null
          questions_answered_count?: number | null
          radcoin_balance?: number | null
          ranking_position?: number | null
          recompensas?: string[] | null
          role?: string | null
          semestre_ou_periodo?: string | null
          skins_desbloqueadas?: string[] | null
          skip_question_helps?: number | null
          stars?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          title?: string | null
          total_points?: number | null
          tutor_ai_helps?: number | null
          tutor_ai_saldo?: number | null
          ultima_data_jogo?: string | null
          universidade?: string | null
          updated_at?: string | null
        }
        Update: {
          ajudas_disponiveis?: number | null
          area_interesse?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string | null
          current_streak?: number | null
          custom_frame?: string | null
          eliminar_opcao_saldo?: number | null
          eliminate_option_helps?: number | null
          email?: string | null
          emblemas?: string[] | null
          estado?: string | null
          full_name?: string | null
          help_eliminations_used?: number | null
          help_skips_used?: number | null
          id?: string
          last_help_reset_date?: string | null
          nome_completo?: string | null
          nome_exibicao?: string | null
          profile_completion_percentage?: number | null
          pular_questao_saldo?: number | null
          questions_answered_count?: number | null
          radcoin_balance?: number | null
          ranking_position?: number | null
          recompensas?: string[] | null
          role?: string | null
          semestre_ou_periodo?: string | null
          skins_desbloqueadas?: string[] | null
          skip_question_helps?: number | null
          stars?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          title?: string | null
          total_points?: number | null
          tutor_ai_helps?: number | null
          tutor_ai_saldo?: number | null
          ultima_data_jogo?: string | null
          universidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      radcoin_transactions_log: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          related_event_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          related_event_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          related_event_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "radcoin_transactions_log_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radcoin_transactions_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limiting: {
        Row: {
          action_type: string
          attempts: number | null
          created_at: string | null
          id: string
          ip_address: string | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_type: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_limiting_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      season_rewards: {
        Row: {
          created_at: string | null
          id: string
          rank_position: number
          reward_amount: number
          reward_type: string
          season_period: string
          season_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rank_position: number
          reward_amount: number
          reward_type: string
          season_period: string
          season_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rank_position?: number
          reward_amount?: number
          reward_type?: string
          season_period?: string
          season_type?: string
        }
        Relationships: []
      }
      seasons_history: {
        Row: {
          id: string
          month_year: string
          season_ended_at: string | null
          top_users: Json
        }
        Insert: {
          id?: string
          month_year: string
          season_ended_at?: string | null
          top_users: Json
        }
        Update: {
          id?: string
          month_year?: string
          season_ended_at?: string | null
          top_users?: Json
        }
        Relationships: []
      }
      state_rankings: {
        Row: {
          accuracy_percentage: number | null
          cases_solved: number
          created_at: string | null
          final_rank: number | null
          id: string
          month_year: string
          points_in_month: number
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          cases_solved?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year: string
          points_in_month?: number
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          cases_solved?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year?: string
          points_in_month?: number
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          notification_type: string | null
          target_audience: string | null
          target_roles: string[] | null
          target_users: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          notification_type?: string | null
          target_audience?: string | null
          target_roles?: string[] | null
          target_users?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          notification_type?: string | null
          target_audience?: string | null
          target_roles?: string[] | null
          target_users?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          setting_description: string | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_description?: string | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_description?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      title_category_rankings: {
        Row: {
          accuracy_percentage: number | null
          cases_solved: number
          created_at: string | null
          final_rank: number | null
          id: string
          month_year: string
          points_in_month: number
          title_category: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          cases_solved?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year: string
          points_in_month?: number
          title_category: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          cases_solved?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          month_year?: string
          points_in_month?: number
          title_category?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ui_texts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          text_key: string
          text_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          text_key: string
          text_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          text_key?: string
          text_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string | null
          id: string
          points_required: number | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          earned_at?: string | null
          id?: string
          points_required?: number | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          earned_at?: string | null
          id?: string
          points_required?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_answers: {
        Row: {
          answered_at: string | null
          case_id: string
          difficulty_multiplier: number | null
          help_used: boolean | null
          id: string
          is_correct: boolean
          performance_multiplier: number | null
          points_earned: number
          selected_answer: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          case_id: string
          difficulty_multiplier?: number | null
          help_used?: boolean | null
          id?: string
          is_correct: boolean
          performance_multiplier?: number | null
          points_earned: number
          selected_answer: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answered_at?: string | null
          case_id?: string
          difficulty_multiplier?: number | null
          help_used?: boolean | null
          id?: string
          is_correct?: boolean
          performance_multiplier?: number | null
          points_earned?: number
          selected_answer?: number
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_case_history: {
        Row: {
          case_id: string
          completed_at: string | null
          difficulty_level: string
          help_used: boolean | null
          id: string
          is_correct: boolean
          points_earned: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          difficulty_level: string
          help_used?: boolean | null
          id?: string
          is_correct: boolean
          points_earned: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          difficulty_level?: string
          help_used?: boolean | null
          id?: string
          is_correct?: boolean
          points_earned?: number
          time_taken?: number | null
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
          {
            foreignKeyName: "user_case_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_preferences: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_default: boolean
          preference_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          preference_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          preference_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          id: string
          report_type: string
          reported_case_id: string | null
          reporter_id: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          id?: string
          report_type: string
          reported_case_id?: string | null
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          id?: string
          report_type?: string
          reported_case_id?: string | null
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_reported_case_id_fkey"
            columns: ["reported_case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          id: string
          is_active: boolean | null
          reward_name: string
          reward_type: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          reward_name: string
          reward_type: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          reward_name?: string
          reward_type?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_rankings: {
        Row: {
          accuracy_percentage: number | null
          cases_solved: number
          created_at: string | null
          final_rank: number | null
          id: string
          no_help_cases: number
          points_in_week: number
          updated_at: string | null
          user_id: string
          week_year: string
        }
        Insert: {
          accuracy_percentage?: number | null
          cases_solved?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          no_help_cases?: number
          points_in_week?: number
          updated_at?: string | null
          user_id: string
          week_year: string
        }
        Update: {
          accuracy_percentage?: number | null
          cases_solved?: number
          created_at?: string | null
          final_rank?: number | null
          id?: string
          no_help_cases?: number
          points_in_week?: number
          updated_at?: string | null
          user_id?: string
          week_year?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_reward_to_user: {
        Args: {
          user_uuid: string
          reward_type_param: string
          reward_amount_param: number
        }
        Returns: undefined
      }
      calculate_case_points: {
        Args: {
          base_points: number
          difficulty: string
          time_taken?: number
          help_used?: boolean
        }
        Returns: number
      }
      calculate_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      calculate_profile_completion: {
        Args: { user_id: string }
        Returns: number
      }
      calculate_profile_completion_secure: {
        Args: { user_uuid: string }
        Returns: number
      }
      calculate_user_title: {
        Args: { points: number }
        Returns: {
          title: string
          stars: number
        }[]
      }
      create_custom_journey: {
        Args: {
          p_title: string
          p_description?: string
          p_config?: Json
          p_case_count?: number
        }
        Returns: string
      }
      distribute_event_prizes: {
        Args: { p_event_id: string }
        Returns: {
          user_id: string
          rank_position: number
          prize_amount: number
        }[]
      }
      distribute_event_radcoin_prizes: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      distribute_season_rewards: {
        Args: { season_type_param: string; season_period_param: string }
        Returns: undefined
      }
      end_season_and_reset: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      finalize_event: {
        Args: { event_uuid: string }
        Returns: undefined
      }
      get_category_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          categoria: string
          total_casos: number
          media_pontos: number
          taxa_acerto: number
          mediana_tempo: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_case_id: {
        Args: { category_name: string }
        Returns: number
      }
      get_problematic_cases: {
        Args: { error_threshold?: number }
        Returns: {
          case_id: string
          title: string
          category: string
          difficulty: string
          total_attempts: number
          error_rate: number
          avg_time: number
        }[]
      }
      increment_monthly_points: {
        Args: { user_uuid: string; points_to_add: number }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_secure: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_event_participant: {
        Args: { event_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      process_case_completion: {
        Args: {
          p_user_id: string
          p_case_id: string
          p_selected_answer: number
          p_time_taken?: number
          p_help_used?: boolean
        }
        Returns: {
          points_earned: number
          is_correct: boolean
          total_points: number
          new_title: string
          achievements_unlocked: string[]
        }[]
      }
      suggest_case_title: {
        Args: { category_name: string }
        Returns: string
      }
      update_event_status_automated: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_radcoin_balance: {
        Args: {
          p_user_id: string
          p_amount: number
          p_transaction_type: string
          p_description?: string
          p_related_event_id?: string
        }
        Returns: boolean
      }
      update_user_subscription_secure: {
        Args: {
          target_user_id: string
          new_plan: string
          new_status: string
          new_expires_at: string
        }
        Returns: undefined
      }
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
