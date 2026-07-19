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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_context_cache: {
        Row: {
          errors_explained: string[] | null
          id: string
          messages: Json
          project_id: number
          questions_asked: string[] | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          errors_explained?: string[] | null
          id?: string
          messages?: Json
          project_id: number
          questions_asked?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          errors_explained?: string[] | null
          id?: string
          messages?: Json
          project_id?: number
          questions_asked?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_projects: {
        Row: {
          author_name: string
          components: string[]
          created_at: string
          description: string
          difficulty: string
          estimated_time: string
          id: string
          status: string
          title: string
        }
        Insert: {
          author_name: string
          components?: string[]
          created_at?: string
          description: string
          difficulty?: string
          estimated_time?: string
          id?: string
          status?: string
          title: string
        }
        Update: {
          author_name?: string
          components?: string[]
          created_at?: string
          description?: string
          difficulty?: string
          estimated_time?: string
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          active_date: string
          created_at: string
          description: string | null
          difficulty: string
          hint: string | null
          id: string
          path_id: string | null
          solution_code: string | null
          starter_code: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          active_date?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          hint?: string | null
          id?: string
          path_id?: string | null
          solution_code?: string | null
          starter_code?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          active_date?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          hint?: string | null
          id?: string
          path_id?: string | null
          solution_code?: string | null
          starter_code?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          rating: number
        }
        Insert: {
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          rating: number
        }
        Update: {
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          rating?: number
        }
        Relationships: []
      }
      ide_sketches: {
        Row: {
          code: string
          created_at: string
          fqbn: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          fqbn?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          fqbn?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          path_order: number
          prerequisite_path_id: string | null
          title: string
          total_lessons: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          path_order?: number
          prerequisite_path_id?: string | null
          title: string
          total_lessons?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          path_order?: number
          prerequisite_path_id?: string | null
          title?: string
          total_lessons?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_prerequisite_path_id_fkey"
            columns: ["prerequisite_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          build_task: string | null
          challenge_prompt: string | null
          challenge_solution: string | null
          challenge_starter_code: string | null
          concept_content: string
          created_at: string
          description: string | null
          difficulty: string
          estimated_minutes: number
          id: string
          lesson_order: number
          path_id: string
          title: string
          xp_reward: number
        }
        Insert: {
          build_task?: string | null
          challenge_prompt?: string | null
          challenge_solution?: string | null
          challenge_starter_code?: string | null
          concept_content?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          estimated_minutes?: number
          id?: string
          lesson_order?: number
          path_id: string
          title: string
          xp_reward?: number
        }
        Update: {
          build_task?: string | null
          challenge_prompt?: string | null
          challenge_solution?: string | null
          challenge_starter_code?: string | null
          concept_content?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          estimated_minutes?: number
          id?: string
          lesson_order?: number
          path_id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_preferences: Json | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          last_active_date: string | null
          level: number
          projects_completed: number
          streak_days: number
          total_xp: number
          updated_at: string
          username: string | null
        }
        Insert: {
          ai_preferences?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          last_active_date?: string | null
          level?: number
          projects_completed?: number
          streak_days?: number
          total_xp?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          ai_preferences?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_date?: string | null
          level?: number
          projects_completed?: number
          streak_days?: number
          total_xp?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          score: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          score?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          path_id: string
          score: number | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          path_id: string
          score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          path_id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          checked_steps: boolean[] | null
          components: string[] | null
          current_code: string | null
          description: string | null
          difficulty: string | null
          emoji: string | null
          id: string
          notes: Json | null
          progress: number | null
          project_id: number
          saved_at: string
          source: string | null
          status: string
          time: string | null
          title: string
          updated_at: string
          user_id: string
          xp: number | null
        }
        Insert: {
          checked_steps?: boolean[] | null
          components?: string[] | null
          current_code?: string | null
          description?: string | null
          difficulty?: string | null
          emoji?: string | null
          id?: string
          notes?: Json | null
          progress?: number | null
          project_id: number
          saved_at?: string
          source?: string | null
          status?: string
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
          xp?: number | null
        }
        Update: {
          checked_steps?: boolean[] | null
          components?: string[] | null
          current_code?: string | null
          description?: string | null
          difficulty?: string | null
          emoji?: string | null
          id?: string
          notes?: Json | null
          progress?: number | null
          project_id?: number
          saved_at?: string
          source?: string | null
          status?: string
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_available: {
        Args: { desired_username: string }
        Returns: boolean
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
