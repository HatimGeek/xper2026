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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          responded_at: string | null
          sector_id: string | null
          service_id: string | null
          status: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          responded_at?: string | null
          sector_id?: string | null
          service_id?: string | null
          status?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          responded_at?: string | null
          sector_id?: string | null
          service_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          user_email: string | null
          user_name: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          product_id: string
          rating?: number
          user_email?: string | null
          user_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_email?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          price: number | null
          status: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          price?: number | null
          status?: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          price?: number | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          original_filename: string
          tags: string[] | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_filename: string
          tags?: string[] | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string
          tags?: string[] | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      media_pairs: {
        Row: {
          after_media_id: string
          before_media_id: string
          client_consent: boolean
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          sector_id: string | null
          service_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          after_media_id: string
          before_media_id: string
          client_consent?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          sector_id?: string | null
          service_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          after_media_id?: string
          before_media_id?: string
          client_consent?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          sector_id?: string | null
          service_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_pairs_after_media_id_fkey"
            columns: ["after_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_pairs_before_media_id_fkey"
            columns: ["before_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_pairs_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_pairs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_visible: boolean
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_response: string | null
          client_email: string | null
          client_name: string
          created_at: string
          id: string
          message: string
          photos: string[] | null
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          sector_id: string | null
          service_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          id?: string
          message: string
          photos?: string[] | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          sector_id?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          id?: string
          message?: string
          photos?: string[] | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          sector_id?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_media: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          media_id: string
          sector_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          media_id: string
          sector_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          media_id?: string
          sector_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sector_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sector_media_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          hero_video_id: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          hero_video_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          hero_video_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_hero_video_id_fkey"
            columns: ["hero_video_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          price_range: string | null
          sector_id: string | null
          short_description: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          price_range?: string | null
          sector_id?: string | null
          short_description?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          price_range?: string | null
          sector_id?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
