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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      career_applications: {
        Row: {
          career_id: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          resume_path: string | null
          resume_url: string | null
          status: string
        }
        Insert: {
          career_id?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          resume_path?: string | null
          resume_url?: string | null
          status?: string
        }
        Update: {
          career_id?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          resume_path?: string | null
          resume_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_applications_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          created_at: string
          department: string | null
          display_order: number
          full_description: string | null
          id: string
          is_published: boolean
          job_type: string | null
          location: string | null
          short_description: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          display_order?: number
          full_description?: string | null
          id?: string
          is_published?: boolean
          job_type?: string | null
          location?: string | null
          short_description?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          display_order?: number
          full_description?: string | null
          id?: string
          is_published?: boolean
          job_type?: string | null
          location?: string | null
          short_description?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_rate_limit: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          last_submission_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          last_submission_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          last_submission_at?: string
        }
        Relationships: []
      }
      home_logos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_path: string | null
          image_url: string | null
          is_published: boolean
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_published?: boolean
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_published?: boolean
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_stats: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          label: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      influencer_offers: {
        Row: {
          created_at: string | null
          display_order: number | null
          features: string[] | null
          id: string
          offer_description: string | null
          offer_title: string
          price: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          offer_description?: string | null
          offer_title: string
          price?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          offer_description?: string | null
          offer_title?: string
          price?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          bucket: string
          created_at: string
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          original_filename: string | null
          path: string
          size_bytes: number | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          bucket: string
          created_at?: string
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          path: string
          size_bytes?: number | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          bucket?: string
          created_at?: string
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          path?: string
          size_bytes?: number | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_path: string | null
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          email: string | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          email?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          email?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          banner_image: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          long_description: string | null
          short_description: string | null
          slug: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          long_description?: string | null
          short_description?: string | null
          slug?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          long_description?: string | null
          short_description?: string | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          about_mission: string | null
          address: string | null
          agency_name: string | null
          created_at: string | null
          email: string | null
          facebook_link: string | null
          footer_text: string | null
          hero_heading: string | null
          hero_subheading: string | null
          id: string
          instagram_link: string | null
          linkedin_link: string | null
          map_embed_url: string | null
          map_latitude: string | null
          map_longitude: string | null
          phone: string | null
          updated_at: string | null
          whatsapp: string | null
          youtube_link: string | null
        }
        Insert: {
          about_mission?: string | null
          address?: string | null
          agency_name?: string | null
          created_at?: string | null
          email?: string | null
          facebook_link?: string | null
          footer_text?: string | null
          hero_heading?: string | null
          hero_subheading?: string | null
          id?: string
          instagram_link?: string | null
          linkedin_link?: string | null
          map_embed_url?: string | null
          map_latitude?: string | null
          map_longitude?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          youtube_link?: string | null
        }
        Update: {
          about_mission?: string | null
          address?: string | null
          agency_name?: string | null
          created_at?: string | null
          email?: string | null
          facebook_link?: string | null
          footer_text?: string | null
          hero_heading?: string | null
          hero_subheading?: string | null
          id?: string
          instagram_link?: string | null
          linkedin_link?: string | null
          map_embed_url?: string | null
          map_latitude?: string | null
          map_longitude?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          youtube_link?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
