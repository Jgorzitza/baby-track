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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      babies: {
        Row: {
          birth_date: string
          birth_length: number | null
          birth_weight: number | null
          client_created_at: string
          created_at: string
          created_by: string
          household_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          birth_date: string
          birth_length?: number | null
          birth_weight?: number | null
          client_created_at: string
          created_at?: string
          created_by: string
          household_id: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          birth_date?: string
          birth_length?: number | null
          birth_weight?: number | null
          client_created_at?: string
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "babies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "babies_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      diaper_events: {
        Row: {
          baby_id: string
          blood: boolean
          client_created_at: string
          created_at: string
          created_by: string
          diaper_type: string
          household_id: string
          id: string
          mucus: boolean
          notes: string | null
          occurred_at: string
          stool_color: string | null
          stool_consistency: string | null
          updated_at: string
          urine_note: string | null
        }
        Insert: {
          baby_id: string
          blood?: boolean
          client_created_at: string
          created_at?: string
          created_by: string
          diaper_type: string
          household_id: string
          id: string
          mucus?: boolean
          notes?: string | null
          occurred_at: string
          stool_color?: string | null
          stool_consistency?: string | null
          updated_at?: string
          urine_note?: string | null
        }
        Update: {
          baby_id?: string
          blood?: boolean
          client_created_at?: string
          created_at?: string
          created_by?: string
          diaper_type?: string
          household_id?: string
          id?: string
          mucus?: boolean
          notes?: string | null
          occurred_at?: string
          stool_color?: string | null
          stool_consistency?: string | null
          updated_at?: string
          urine_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diaper_events_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diaper_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diaper_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_appointments: {
        Row: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          household_id: string
          id: string
          location: string | null
          planning_notes: string | null
          provider: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
          visit_notes: string | null
        }
        Insert: {
          baby_id: string
          client_created_at: string
          created_at?: string
          created_by: string
          household_id: string
          id: string
          location?: string | null
          planning_notes?: string | null
          provider?: string | null
          scheduled_at?: string | null
          status: string
          updated_at?: string
          visit_notes?: string | null
        }
        Update: {
          baby_id?: string
          client_created_at?: string
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          location?: string | null
          planning_notes?: string | null
          provider?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          visit_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_appointments_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_appointments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_questions: {
        Row: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          doctor_appointment_id: string
          household_id: string
          id: string
          question: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          client_created_at: string
          created_at?: string
          created_by: string
          doctor_appointment_id: string
          household_id: string
          id: string
          question: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          client_created_at?: string
          created_at?: string
          created_by?: string
          doctor_appointment_id?: string
          household_id?: string
          id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_questions_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_questions_doctor_appointment_id_fkey"
            columns: ["doctor_appointment_id"]
            isOneToOne: false
            referencedRelation: "doctor_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_questions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_segments: {
        Row: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          ended_at: string | null
          feeding_session_id: string
          household_id: string
          id: string
          side: string
          started_at: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          client_created_at: string
          created_at?: string
          created_by: string
          ended_at?: string | null
          feeding_session_id: string
          household_id: string
          id: string
          side: string
          started_at: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          client_created_at?: string
          created_at?: string
          created_by?: string
          ended_at?: string | null
          feeding_session_id?: string
          household_id?: string
          id?: string
          side?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_segments_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_segments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_segments_feeding_session_id_fkey"
            columns: ["feeding_session_id"]
            isOneToOne: false
            referencedRelation: "feeding_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_segments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_sessions: {
        Row: {
          baby_id: string
          bottle_amount: number | null
          bottle_unit: string | null
          client_created_at: string
          created_at: string
          created_by: string
          feed_type: string
          finished_at: string | null
          household_id: string
          id: string
          latch_issue: boolean
          outcome: string | null
          refused_feed: boolean
          sleepy_feed: boolean
          spit_up: boolean
          started_at: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          bottle_amount?: number | null
          bottle_unit?: string | null
          client_created_at: string
          created_at?: string
          created_by: string
          feed_type: string
          finished_at?: string | null
          household_id: string
          id: string
          latch_issue?: boolean
          outcome?: string | null
          refused_feed?: boolean
          sleepy_feed?: boolean
          spit_up?: boolean
          started_at: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          bottle_amount?: number | null
          bottle_unit?: string | null
          client_created_at?: string
          created_at?: string
          created_by?: string
          feed_type?: string
          finished_at?: string | null
          household_id?: string
          id?: string
          latch_issue?: boolean
          outcome?: string | null
          refused_feed?: boolean
          sleepy_feed?: boolean
          spit_up?: boolean
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_sessions_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_sessions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_measurements: {
        Row: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          household_id: string
          id: string
          length: number | null
          length_unit: string | null
          notes: string | null
          occurred_at: string
          updated_at: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          baby_id: string
          client_created_at: string
          created_at?: string
          created_by: string
          household_id: string
          id: string
          length?: number | null
          length_unit?: string | null
          notes?: string | null
          occurred_at: string
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          baby_id?: string
          client_created_at?: string
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          length?: number | null
          length_unit?: string | null
          notes?: string | null
          occurred_at?: string
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_measurements_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_measurements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_measurements_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      health_events: {
        Row: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          dosage: string | null
          event_type: string
          household_id: string
          id: string
          medication_name: string | null
          notes: string | null
          occurred_at: string
          unit: string | null
          updated_at: string
          value_numeric: number | null
        }
        Insert: {
          baby_id: string
          client_created_at: string
          created_at?: string
          created_by: string
          dosage?: string | null
          event_type: string
          household_id: string
          id: string
          medication_name?: string | null
          notes?: string | null
          occurred_at: string
          unit?: string | null
          updated_at?: string
          value_numeric?: number | null
        }
        Update: {
          baby_id?: string
          client_created_at?: string
          created_at?: string
          created_by?: string
          dosage?: string | null
          event_type?: string
          household_id?: string
          id?: string
          medication_name?: string | null
          notes?: string | null
          occurred_at?: string
          unit?: string | null
          updated_at?: string
          value_numeric?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_events_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          id: string
          joined_at: string
          profile_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id: string
          joined_at?: string
          profile_id: string
          role: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          joined_at?: string
          profile_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id: string
          invite_code: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_timeline_events: {
        Row: {
          baby_id: string
          created_at: string
          event_type: string
          household_id: string
          id: string
          occurred_at: string
          source_id: string
          source_table: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          event_type: string
          household_id: string
          id?: string
          occurred_at: string
          source_id: string
          source_table: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          event_type?: string
          household_id?: string
          id?: string
          occurred_at?: string
          source_id?: string
          source_table?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_timeline_events_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_timeline_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sleep_sessions: {
        Row: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          end_time: string | null
          household_id: string
          id: string
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          client_created_at: string
          created_at?: string
          created_by: string
          end_time?: string | null
          household_id: string
          id: string
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          client_created_at?: string
          created_at?: string
          created_by?: string
          end_time?: string | null
          household_id?: string
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_sessions_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sleep_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sleep_sessions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_events: {
        Row: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          household_id: string
          id: string
          notes: string | null
          occurred_at: string
          symptom: string
          updated_at: string
        }
        Insert: {
          baby_id: string
          client_created_at: string
          created_at?: string
          created_by: string
          household_id: string
          id: string
          notes?: string | null
          occurred_at: string
          symptom: string
          updated_at?: string
        }
        Update: {
          baby_id?: string
          client_created_at?: string
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          symptom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_events_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_add_doctor_note: {
        Args: {
          p_appointment_id: string
          p_baby_id: string
          p_client_created_at: string
          p_household_id: string
          p_note: string
        }
        Returns: Json
      }
      app_add_doctor_question: {
        Args: {
          p_appointment_id: string
          p_baby_id: string
          p_client_created_at: string
          p_household_id: string
          p_question: string
          p_question_id: string
        }
        Returns: Json
      }
      app_create_household: {
        Args: {
          p_household_id: string
          p_household_name: string
          p_membership_id: string
        }
        Returns: Json
      }
      app_current_user_id: { Args: never; Returns: string }
      app_delete_doctor_question: {
        Args: { p_household_id: string; p_question_id: string }
        Returns: undefined
      }
      app_finish_feed_session: {
        Args: {
          p_baby_id: string
          p_bottle_amount?: number
          p_bottle_unit?: string
          p_feeding_session_id: string
          p_finished_at: string
          p_household_id: string
          p_latch_issue: boolean
          p_outcome: string
          p_refused_feed: boolean
          p_sleepy_feed: boolean
          p_spit_up: boolean
        }
        Returns: Json
      }
      app_finish_sleep: {
        Args: {
          p_baby_id: string
          p_end_time: string
          p_household_id: string
          p_sleep_session_id: string
        }
        Returns: Json
      }
      app_get_bootstrap: { Args: never; Returns: Json }
      app_get_doctor_summary: {
        Args: { p_baby_id: string; p_window_label?: string }
        Returns: Json
      }
      app_get_home_summary: { Args: { p_baby_id: string }; Returns: Json }
      app_get_medical_timeline: {
        Args: { p_baby_id: string; p_limit_count?: number }
        Returns: Json
      }
      app_get_reports_summary: {
        Args: { p_baby_id: string; p_window_days?: number }
        Returns: Json
      }
      app_join_household_by_code: {
        Args: { p_invite_code: string; p_membership_id: string }
        Returns: Json
      }
      app_log_diaper: {
        Args: {
          p_baby_id: string
          p_blood: boolean
          p_client_created_at: string
          p_diaper_event_id: string
          p_diaper_type: string
          p_household_id: string
          p_mucus: boolean
          p_notes: string
          p_occurred_at: string
          p_stool_color: string
          p_stool_consistency: string
          p_urine_note: string
        }
        Returns: Json
      }
      app_log_growth: {
        Args: {
          p_baby_id: string
          p_client_created_at: string
          p_growth_measurement_id: string
          p_household_id: string
          p_length: number
          p_length_unit: string
          p_notes: string
          p_occurred_at: string
          p_weight: number
          p_weight_unit: string
        }
        Returns: Json
      }
      app_log_medication: {
        Args: {
          p_baby_id: string
          p_client_created_at: string
          p_dosage: string
          p_health_event_id: string
          p_household_id: string
          p_medication_name: string
          p_notes: string
          p_occurred_at: string
        }
        Returns: Json
      }
      app_log_symptom: {
        Args: {
          p_baby_id: string
          p_client_created_at: string
          p_household_id: string
          p_notes: string
          p_occurred_at: string
          p_symptom: string
          p_symptom_event_id: string
        }
        Returns: Json
      }
      app_log_temperature: {
        Args: {
          p_baby_id: string
          p_client_created_at: string
          p_health_event_id: string
          p_household_id: string
          p_notes: string
          p_occurred_at: string
          p_unit: string
          p_value: number
        }
        Returns: Json
      }
      app_start_feed_session: {
        Args: {
          p_baby_id: string
          p_client_created_at: string
          p_feed_type: string
          p_feeding_session_id: string
          p_household_id: string
          p_started_at: string
        }
        Returns: Json
      }
      app_start_sleep: {
        Args: {
          p_baby_id: string
          p_client_created_at: string
          p_household_id: string
          p_notes?: string
          p_sleep_session_id: string
          p_start_time: string
        }
        Returns: Json
      }
      app_upsert_baby_profile: {
        Args: {
          p_baby_id: string
          p_birth_date: string
          p_birth_length: number
          p_birth_weight: number
          p_client_created_at: string
          p_household_id: string
          p_name: string
        }
        Returns: Json
      }
      app_upsert_doctor_appointment: {
        Args: {
          p_appointment_id: string
          p_baby_id: string
          p_client_created_at: string
          p_household_id: string
          p_location: string
          p_planning_notes: string
          p_provider: string
          p_scheduled_at: string
          p_status: string
          p_visit_notes: string
        }
        Returns: Json
      }
      app_upsert_feed_segment: {
        Args: {
          p_baby_id: string
          p_client_created_at: string
          p_ended_at: string
          p_feeding_session_id: string
          p_household_id: string
          p_segment_id: string
          p_side: string
          p_started_at: string
        }
        Returns: Json
      }
      assert_baby_in_household: {
        Args: { target_baby_id: string; target_household_id: string }
        Returns: undefined
      }
      assert_household_member: {
        Args: { target_household_id: string }
        Returns: undefined
      }
      ensure_doctor_appointment: {
        Args: {
          p_appointment_id: string
          p_baby_id: string
          p_client_created_at: string
          p_household_id: string
        }
        Returns: {
          baby_id: string
          client_created_at: string
          created_at: string
          created_by: string
          household_id: string
          id: string
          location: string | null
          planning_notes: string | null
          provider: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
          visit_notes: string | null
        }
        SetofOptions: {
          from: "*"
          to: "doctor_appointments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_invite_code: { Args: never; Returns: string }
      is_household_member: {
        Args: { target_household_id: string }
        Returns: boolean
      }
      upsert_medical_timeline_event: {
        Args: {
          p_baby_id: string
          p_event_type: string
          p_household_id: string
          p_occurred_at: string
          p_source_id: string
          p_source_table: string
          p_summary: string
          p_title: string
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
