export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          actor_id: string;
          created_at: string;
          entity_id: string | null;
          id: string;
          summary: string;
          team_id: string;
        };
        Insert: {
          action: string;
          actor_id: string;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          summary: string;
          team_id: string;
        };
        Update: {
          action?: string;
          actor_id?: string;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          summary?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      availability_slots: {
        Row: {
          created_at: string;
          end_minute: number;
          id: string;
          start_minute: number;
          user_id: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          end_minute: number;
          id?: string;
          start_minute: number;
          user_id: string;
          weekday: number;
        };
        Update: {
          created_at?: string;
          end_minute?: number;
          id?: string;
          start_minute?: number;
          user_id?: string;
          weekday?: number;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          title: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          title: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          title?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          created_by: string;
          email: string | null;
          expires_at: string;
          id: string;
          role: Database["public"]["Enums"]["team_role"];
          status: Database["public"]["Enums"]["invitation_status"];
          team_id: string;
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          created_by: string;
          email?: string | null;
          expires_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["team_role"];
          status?: Database["public"]["Enums"]["invitation_status"];
          team_id: string;
          token?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          created_by?: string;
          email?: string | null;
          expires_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["team_role"];
          status?: Database["public"]["Enums"]["invitation_status"];
          team_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      join_requests: {
        Row: {
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          id: string;
          message: string | null;
          status: Database["public"]["Enums"]["join_request_status"];
          team_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          id?: string;
          message?: string | null;
          status?: Database["public"]["Enums"]["join_request_status"];
          team_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          id?: string;
          message?: string | null;
          status?: Database["public"]["Enums"]["join_request_status"];
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "join_requests_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          dedupe_key: string | null;
          id: string;
          link: string | null;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          dedupe_key?: string | null;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          dedupe_key?: string | null;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          discoverable: boolean;
          display_name: string;
          id: string;
          is_sample: boolean;
          major: string | null;
          onboarded: boolean;
          timezone: string;
          university: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          discoverable?: boolean;
          display_name?: string;
          id: string;
          is_sample?: boolean;
          major?: string | null;
          onboarded?: boolean;
          timezone?: string;
          university?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          discoverable?: boolean;
          display_name?: string;
          id?: string;
          is_sample?: boolean;
          major?: string | null;
          onboarded?: boolean;
          timezone?: string;
          university?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles_private: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          notes: string | null;
          phone: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          notes?: string | null;
          phone?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          notes?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      recurrence_exceptions: {
        Row: {
          cancelled: boolean;
          created_at: string;
          id: string;
          new_ends_at: string | null;
          new_starts_at: string | null;
          occurrence_date: string;
          session_id: string;
        };
        Insert: {
          cancelled?: boolean;
          created_at?: string;
          id?: string;
          new_ends_at?: string | null;
          new_starts_at?: string | null;
          occurrence_date: string;
          session_id: string;
        };
        Update: {
          cancelled?: boolean;
          created_at?: string;
          id?: string;
          new_ends_at?: string | null;
          new_starts_at?: string | null;
          occurrence_date?: string;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurrence_exceptions_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          content: string | null;
          created_at: string;
          created_by: string;
          file_size: number | null;
          id: string;
          kind: Database["public"]["Enums"]["resource_kind"];
          mime_type: string | null;
          storage_path: string | null;
          tags: string[];
          team_id: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
          url: string | null;
          version: number;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          created_by: string;
          file_size?: number | null;
          id?: string;
          kind: Database["public"]["Enums"]["resource_kind"];
          mime_type?: string | null;
          storage_path?: string | null;
          tags?: string[];
          team_id: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
          url?: string | null;
          version?: number;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          created_by?: string;
          file_size?: number | null;
          id?: string;
          kind?: Database["public"]["Enums"]["resource_kind"];
          mime_type?: string | null;
          storage_path?: string | null;
          tags?: string[];
          team_id?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          url?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "resources_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      session_attendees: {
        Row: {
          session_id: string;
          status: Database["public"]["Enums"]["attendee_status"];
          user_id: string;
        };
        Insert: {
          session_id: string;
          status?: Database["public"]["Enums"]["attendee_status"];
          user_id: string;
        };
        Update: {
          session_id?: string;
          status?: Database["public"]["Enums"]["attendee_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_attendees_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          ends_at: string;
          id: string;
          location: string | null;
          meeting_link: string | null;
          recurrence: string;
          recurrence_end: string | null;
          starts_at: string;
          team_id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          ends_at: string;
          id?: string;
          location?: string | null;
          meeting_link?: string | null;
          recurrence?: string;
          recurrence_end?: string | null;
          starts_at: string;
          team_id: string;
          title: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          ends_at?: string;
          id?: string;
          location?: string | null;
          meeting_link?: string | null;
          recurrence?: string;
          recurrence_end?: string | null;
          starts_at?: string;
          team_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      task_checklist_items: {
        Row: {
          created_at: string;
          done: boolean;
          id: string;
          label: string;
          position: number;
          task_id: string;
        };
        Insert: {
          created_at?: string;
          done?: boolean;
          id?: string;
          label: string;
          position?: number;
          task_id: string;
        };
        Update: {
          created_at?: string;
          done?: boolean;
          id?: string;
          label?: string;
          position?: number;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_checklist_items_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      task_comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          task_id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          task_id: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          assignee_id: string | null;
          completed_at: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          due_date: string | null;
          id: string;
          position: number;
          priority: Database["public"]["Enums"]["task_priority"];
          status: Database["public"]["Enums"]["task_status"];
          team_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          position?: number;
          priority?: Database["public"]["Enums"]["task_priority"];
          status?: Database["public"]["Enums"]["task_status"];
          team_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          position?: number;
          priority?: Database["public"]["Enums"]["task_priority"];
          status?: Database["public"]["Enums"]["task_status"];
          team_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      team_members: {
        Row: {
          id: string;
          joined_at: string;
          role: Database["public"]["Enums"]["team_role"];
          team_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          joined_at?: string;
          role?: Database["public"]["Enums"]["team_role"];
          team_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          joined_at?: string;
          role?: Database["public"]["Enums"]["team_role"];
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          accent: string;
          course_id: string | null;
          created_at: string;
          created_by: string;
          deadline: string | null;
          description: string | null;
          id: string;
          is_sample: boolean;
          name: string;
          project_goal: string | null;
          updated_at: string;
          visibility: Database["public"]["Enums"]["team_visibility"];
        };
        Insert: {
          accent?: string;
          course_id?: string | null;
          created_at?: string;
          created_by: string;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          is_sample?: boolean;
          name: string;
          project_goal?: string | null;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["team_visibility"];
        };
        Update: {
          accent?: string;
          course_id?: string | null;
          created_at?: string;
          created_by?: string;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          is_sample?: boolean;
          name?: string;
          project_goal?: string | null;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["team_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "teams_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      user_courses: {
        Row: {
          course_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      user_skills: {
        Row: {
          level: number;
          skill_id: string;
          user_id: string;
        };
        Insert: {
          level?: number;
          skill_id: string;
          user_id: string;
        };
        Update: {
          level?: number;
          skill_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_manage_team: {
        Args: { _team: string; _user: string };
        Returns: boolean;
      };
      create_team: {
        Args: {
          _accent: string;
          _course_id: string;
          _deadline: string;
          _description: string;
          _name: string;
          _project_goal: string;
          _visibility: Database["public"]["Enums"]["team_visibility"];
        };
        Returns: string;
      };
      decide_join_request: {
        Args: { _approve: boolean; _request: string };
        Returns: undefined;
      };
      invitation_preview: {
        Args: { _token: string };
        Returns: {
          reason: string;
          team_id: string;
          team_name: string;
          valid: boolean;
        }[];
      };
      is_team_member: {
        Args: { _team: string; _user: string };
        Returns: boolean;
      };
      redeem_invitation: { Args: { _token: string }; Returns: string };
      team_role_of: {
        Args: { _team: string; _user: string };
        Returns: Database["public"]["Enums"]["team_role"];
      };
    };
    Enums: {
      attendee_status: "invited" | "accepted" | "declined" | "tentative";
      invitation_status: "pending" | "accepted" | "declined" | "revoked" | "expired";
      join_request_status: "pending" | "approved" | "rejected";
      resource_kind: "note" | "link" | "file";
      task_priority: "low" | "medium" | "high" | "urgent";
      task_status: "todo" | "in_progress" | "in_review" | "done";
      team_role: "owner" | "admin" | "member";
      team_visibility: "public" | "private";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      attendee_status: ["invited", "accepted", "declined", "tentative"],
      invitation_status: ["pending", "accepted", "declined", "revoked", "expired"],
      join_request_status: ["pending", "approved", "rejected"],
      resource_kind: ["note", "link", "file"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "in_review", "done"],
      team_role: ["owner", "admin", "member"],
      team_visibility: ["public", "private"],
    },
  },
} as const;
