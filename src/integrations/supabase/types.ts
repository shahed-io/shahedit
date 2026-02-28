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
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          created_at: string
          deadline: string | null
          department: string | null
          description: string | null
          id: string
          is_published: boolean | null
          location: string | null
          requirements: string[] | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          requirements?: string[] | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          requirements?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          is_published: boolean | null
          logo_url: string | null
          name: string
          sort_order: number | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          name: string
          sort_order?: number | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_published: boolean | null
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          project_description: string | null
          service_interested: string | null
          source: Database["public"]["Enums"]["lead_source"] | null
          status: Database["public"]["Enums"]["lead_status"] | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          project_description?: string | null
          service_interested?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          project_description?: string | null
          service_interested?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          features: string[] | null
          id: string
          is_popular: boolean | null
          is_published: boolean | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_popular?: boolean | null
          is_published?: boolean | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_popular?: boolean | null
          is_published?: boolean | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          client_name: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          project_url: string | null
          short_description: string | null
          slug: string
          sort_order: number | null
          tech_stack: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          project_url?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          project_url?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          icon: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          short_description: string | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          group_name: string | null
          id: string
          key: string
          label: string | null
          type: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          group_name?: string | null
          id?: string
          key: string
          label?: string | null
          type?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          group_name?: string | null
          id?: string
          key?: string
          label?: string | null
          type?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          is_published: boolean | null
          linkedin_url: string | null
          name: string
          role: string
          sort_order: number | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_published?: boolean | null
          linkedin_url?: string | null
          name: string
          role: string
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_published?: boolean | null
          linkedin_url?: string | null
          name?: string
          role?: string
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_avatar: string | null
          client_company: string | null
          client_name: string
          client_title: string | null
          content: string
          created_at: string
          id: string
          is_published: boolean | null
          rating: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          client_avatar?: string | null
          client_company?: string | null
          client_name: string
          client_title?: string | null
          content: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          rating?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          client_avatar?: string | null
          client_company?: string | null
          client_name?: string
          client_title?: string | null
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          rating?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
      lead_source: "quote_form" | "contact_form" | "whatsapp" | "other"
      lead_status: "new" | "in_progress" | "contacted" | "converted" | "closed"
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
      app_role: ["super_admin", "admin", "editor"],
      lead_source: ["quote_form", "contact_form", "whatsapp", "other"],
      lead_status: ["new", "in_progress", "contacted", "converted", "closed"],
    },
  },
} as const
