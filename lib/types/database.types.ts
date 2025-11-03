export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      administrators: {
        Row: {
          access_level: string;
          id: string;
          permissions: string[] | null;
        };
        Insert: {
          access_level: string;
          id: string;
          permissions?: string[] | null;
        };
        Update: {
          access_level?: string;
          id?: string;
          permissions?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "administrators_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics: {
        Row: {
          attendance_rate: number | null;
          checked_in_count: number | null;
          event_id: string;
          id: string;
          last_updated: string | null;
          revenue_by_ticket_type: Json | null;
          ticket_type_breakdown: Json | null;
          total_attendees: number | null;
          total_revenue: number | null;
          total_tickets_sold: number | null;
        };
        Insert: {
          attendance_rate?: number | null;
          checked_in_count?: number | null;
          event_id: string;
          id?: string;
          last_updated?: string | null;
          revenue_by_ticket_type?: Json | null;
          ticket_type_breakdown?: Json | null;
          total_attendees?: number | null;
          total_revenue?: number | null;
          total_tickets_sold?: number | null;
        };
        Update: {
          attendance_rate?: number | null;
          checked_in_count?: number | null;
          event_id?: string;
          id?: string;
          last_updated?: string | null;
          revenue_by_ticket_type?: Json | null;
          ticket_type_breakdown?: Json | null;
          total_attendees?: number | null;
          total_revenue?: number | null;
          total_tickets_sold?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: true;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      attendees: {
        Row: {
          id: string;
          registrations: string[] | null;
          tickets: string[] | null;
        };
        Insert: {
          id: string;
          registrations?: string[] | null;
          tickets?: string[] | null;
        };
        Update: {
          id?: string;
          registrations?: string[] | null;
          tickets?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "attendees_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      course_prerequisites: {
        Row: {
          course_id: string;
          id: string;
          prerequisite_course_id: string;
        };
        Insert: {
          course_id: string;
          id?: string;
          prerequisite_course_id: string;
        };
        Update: {
          course_id?: string;
          id?: string;
          prerequisite_course_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_prerequisites_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_prerequisites_prerequisite_course_id_fkey";
            columns: ["prerequisite_course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          course_code: string;
          created_at: string | null;
          credits: number;
          current_enrollment_count: number | null;
          description: string | null;
          enrollment_limit: number;
          id: string;
          name: string;
          open_for_enrollment: boolean | null;
          professor_id: string | null;
          updated_at: string | null;
          waitlist_enabled: boolean | null;
        };
        Insert: {
          course_code: string;
          created_at?: string | null;
          credits: number;
          current_enrollment_count?: number | null;
          description?: string | null;
          enrollment_limit: number;
          id?: string;
          name: string;
          open_for_enrollment?: boolean | null;
          professor_id?: string | null;
          updated_at?: string | null;
          waitlist_enabled?: boolean | null;
        };
        Update: {
          course_code?: string;
          created_at?: string | null;
          credits?: number;
          current_enrollment_count?: number | null;
          description?: string | null;
          enrollment_limit?: number;
          id?: string;
          name?: string;
          open_for_enrollment?: boolean | null;
          professor_id?: string | null;
          updated_at?: string | null;
          waitlist_enabled?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "courses_professor_id_fkey";
            columns: ["professor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      email_alerts: {
        Row: {
          email_sent: boolean | null;
          id: string;
          recipient_email: string;
          sent_at: string | null;
          subject: string;
        };
        Insert: {
          email_sent?: boolean | null;
          id: string;
          recipient_email: string;
          sent_at?: string | null;
          subject: string;
        };
        Update: {
          email_sent?: boolean | null;
          id?: string;
          recipient_email?: string;
          sent_at?: string | null;
          subject?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_alerts_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          course_id: string;
          created_at: string | null;
          enrollment_date: string | null;
          grade: string | null;
          grade_assigned_at: string | null;
          id: string;
          status: string | null;
          student_id: string;
          updated_at: string | null;
        };
        Insert: {
          course_id: string;
          created_at?: string | null;
          enrollment_date?: string | null;
          grade?: string | null;
          grade_assigned_at?: string | null;
          id?: string;
          status?: string | null;
          student_id: string;
          updated_at?: string | null;
        };
        Update: {
          course_id?: string;
          created_at?: string | null;
          enrollment_date?: string | null;
          grade?: string | null;
          grade_assigned_at?: string | null;
          id?: string;
          status?: string | null;
          student_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      event_organizers: {
        Row: {
          company_name: string | null;
          events_managing: string[] | null;
          id: string;
          venues_managing: string[] | null;
        };
        Insert: {
          company_name?: string | null;
          events_managing?: string[] | null;
          id: string;
          venues_managing?: string[] | null;
        };
        Update: {
          company_name?: string | null;
          events_managing?: string[] | null;
          id?: string;
          venues_managing?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_organizers_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          capacity: number;
          created_at: string | null;
          description: string | null;
          end_time: string;
          event_organizer_id: string;
          id: string;
          start_time: string;
          tickets_sold: number | null;
          title: string;
          updated_at: string | null;
          venue_id: string | null;
        };
        Insert: {
          capacity: number;
          created_at?: string | null;
          description?: string | null;
          end_time: string;
          event_organizer_id: string;
          id?: string;
          start_time: string;
          tickets_sold?: number | null;
          title: string;
          updated_at?: string | null;
          venue_id?: string | null;
        };
        Update: {
          capacity?: number;
          created_at?: string | null;
          description?: string | null;
          end_time?: string;
          event_organizer_id?: string;
          id?: string;
          start_time?: string;
          tickets_sold?: number | null;
          title?: string;
          updated_at?: string | null;
          venue_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_event_organizer_id_fkey";
            columns: ["event_organizer_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          event_id: string | null;
          id: string;
          is_read: boolean | null;
          message: string;
          priority: string;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          event_id?: string | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          priority: string;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          event_id?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          priority?: string;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          attendee_id: string;
          completed_at: string | null;
          created_at: string | null;
          currency: string;
          error_message: string | null;
          event_id: string;
          id: string;
          payment_method: string;
          status: string;
          stripe_payment_intent_id: string | null;
          ticket_ids: string[] | null;
        };
        Insert: {
          amount: number;
          attendee_id: string;
          completed_at?: string | null;
          created_at?: string | null;
          currency?: string;
          error_message?: string | null;
          event_id: string;
          id?: string;
          payment_method: string;
          status: string;
          stripe_payment_intent_id?: string | null;
          ticket_ids?: string[] | null;
        };
        Update: {
          amount?: number;
          attendee_id?: string;
          completed_at?: string | null;
          created_at?: string | null;
          currency?: string;
          error_message?: string | null;
          event_id?: string;
          id?: string;
          payment_method?: string;
          status?: string;
          stripe_payment_intent_id?: string | null;
          ticket_ids?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_attendee_id_fkey";
            columns: ["attendee_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      push_notifications: {
        Row: {
          click_action: string | null;
          device_token: string;
          id: string;
          pushed: boolean | null;
          pushed_at: string | null;
        };
        Insert: {
          click_action?: string | null;
          device_token: string;
          id: string;
          pushed?: boolean | null;
          pushed_at?: string | null;
        };
        Update: {
          click_action?: string | null;
          device_token?: string;
          id?: string;
          pushed?: boolean | null;
          pushed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "push_notifications_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      registrations: {
        Row: {
          attendee_id: string;
          event_id: string;
          id: string;
          registered_at: string | null;
          status: string;
          ticket_id: string | null;
          ticket_type: string;
        };
        Insert: {
          attendee_id: string;
          event_id: string;
          id?: string;
          registered_at?: string | null;
          status: string;
          ticket_id?: string | null;
          ticket_type: string;
        };
        Update: {
          attendee_id?: string;
          event_id?: string;
          id?: string;
          registered_at?: string | null;
          status?: string;
          ticket_id?: string | null;
          ticket_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_attendee_id_fkey";
            columns: ["attendee_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          data: Json;
          event_id: string;
          generated_at: string | null;
          id: string;
          type: string;
        };
        Insert: {
          data: Json;
          event_id: string;
          generated_at?: string | null;
          id?: string;
          type: string;
        };
        Update: {
          data?: Json;
          event_id?: string;
          generated_at?: string | null;
          id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      schedules: {
        Row: {
          category: string;
          created_at: string | null;
          end_time: string;
          event_id: string;
          id: string;
          session_name: string;
          speaker_id: string | null;
          start_time: string;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          end_time: string;
          event_id: string;
          id?: string;
          session_name: string;
          speaker_id?: string | null;
          start_time: string;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          end_time?: string;
          event_id?: string;
          id?: string;
          session_name?: string;
          speaker_id?: string | null;
          start_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedules_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "schedules_speaker_id_fkey";
            columns: ["speaker_id"];
            isOneToOne: false;
            referencedRelation: "speakers";
            referencedColumns: ["id"];
          },
        ];
      };
      speakers: {
        Row: {
          bio: string | null;
          company: string | null;
          expertise: string[] | null;
          id: string;
          speaking_sessions: string[] | null;
          website: string | null;
        };
        Insert: {
          bio?: string | null;
          company?: string | null;
          expertise?: string[] | null;
          id: string;
          speaking_sessions?: string[] | null;
          website?: string | null;
        };
        Update: {
          bio?: string | null;
          company?: string | null;
          expertise?: string[] | null;
          id?: string;
          speaking_sessions?: string[] | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "speakers_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          attendee_id: string;
          checked_in_at: string | null;
          created_at: string | null;
          event_id: string;
          id: string;
          is_checked_in: boolean | null;
          price: number;
          qr_code: string;
          status: string;
          ticket_type: string;
        };
        Insert: {
          attendee_id: string;
          checked_in_at?: string | null;
          created_at?: string | null;
          event_id: string;
          id?: string;
          is_checked_in?: boolean | null;
          price: number;
          qr_code: string;
          status: string;
          ticket_type: string;
        };
        Update: {
          attendee_id?: string;
          checked_in_at?: string | null;
          created_at?: string | null;
          event_id?: string;
          id?: string;
          is_checked_in?: boolean | null;
          price?: number;
          qr_code?: string;
          status?: string;
          ticket_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_attendee_id_fkey";
            columns: ["attendee_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          id: string;
          metadata: Json | null;
          payment_id: string;
          status: string;
          timestamp: string | null;
          type: string;
        };
        Insert: {
          amount: number;
          id?: string;
          metadata?: Json | null;
          payment_id: string;
          status: string;
          timestamp?: string | null;
          type: string;
        };
        Update: {
          amount?: number;
          id?: string;
          metadata?: Json | null;
          payment_id?: string;
          status?: string;
          timestamp?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          name: string;
          role: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          department: string | null;
          email: string;
          full_name: string;
          id: string;
          is_admin: boolean | null;
          major: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          department?: string | null;
          email: string;
          full_name: string;
          id?: string;
          is_admin?: boolean | null;
          major?: string | null;
          role: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          department?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          is_admin?: boolean | null;
          major?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      vendor_products: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          product_name: string;
          product_price: number;
          product_quantity: number;
          vendor_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          product_name: string;
          product_price: number;
          product_quantity: number;
          vendor_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          product_name?: string;
          product_price?: number;
          product_quantity?: number;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_products_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      vendors: {
        Row: {
          company_name: string | null;
          events_participating: string[] | null;
          id: string;
          vendor_location: string;
        };
        Insert: {
          company_name?: string | null;
          events_participating?: string[] | null;
          id: string;
          vendor_location: string;
        };
        Update: {
          company_name?: string | null;
          events_participating?: string[] | null;
          id?: string;
          vendor_location?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendors_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      venues: {
        Row: {
          address: string;
          amenities: string[] | null;
          capacity: number;
          city: string;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          state: string;
          updated_at: string | null;
          zip_code: string;
        };
        Insert: {
          address: string;
          amenities?: string[] | null;
          capacity: number;
          city: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          state: string;
          updated_at?: string | null;
          zip_code: string;
        };
        Update: {
          address?: string;
          amenities?: string[] | null;
          capacity?: number;
          city?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          state?: string;
          updated_at?: string | null;
          zip_code?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema =
  DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof (
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Tables"
      ]
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Views"
      ]
    )
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? (
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Views"
    ]
  )[TableName] extends {
    Row: infer R;
  } ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (
    & DefaultSchema["Tables"]
    & DefaultSchema["Views"]
  ) ? (
      & DefaultSchema["Tables"]
      & DefaultSchema["Views"]
    )[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    } ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Insert: infer I;
  } ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    } ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Update: infer U;
  } ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    } ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]][
      "Enums"
    ]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][
    EnumName
  ]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
      PublicCompositeTypeNameOrOptions["schema"]
    ]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]][
    "CompositeTypes"
  ][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
