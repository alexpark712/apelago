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
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          related_claim_id: string | null
          related_item_id: string | null
          related_user_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_claim_id?: string | null
          related_item_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_claim_id?: string | null
          related_item_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_related_claim_id_fkey"
            columns: ["related_claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notifications_related_item_id_fkey"
            columns: ["related_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          claimed_at: string
          completed_at: string | null
          contact_revealed: boolean
          created_at: string
          id: string
          item_id: string
          outcome: string | null
          released_at: string | null
          seller_confirmed_terms: boolean
          seller_id: string
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
        }
        Insert: {
          claimed_at?: string
          completed_at?: string | null
          contact_revealed?: boolean
          created_at?: string
          id?: string
          item_id: string
          outcome?: string | null
          released_at?: string | null
          seller_confirmed_terms?: boolean
          seller_id: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
        }
        Update: {
          claimed_at?: string
          completed_at?: string | null
          contact_revealed?: boolean
          created_at?: string
          id?: string
          item_id?: string
          outcome?: string | null
          released_at?: string | null
          seller_confirmed_terms?: boolean
          seller_id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          brand: string | null
          created_at: string
          id: string
          item_name: string | null
          location: string
          min_price: number
          note: string | null
          owner_confirmed_terms: boolean
          owner_id: string
          photo_url: string
          pickup_preference: Database["public"]["Enums"]["pickup_preference"]
          status: Database["public"]["Enums"]["item_status"]
          timing: Database["public"]["Enums"]["timing_preference"] | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: string
          item_name?: string | null
          location: string
          min_price: number
          note?: string | null
          owner_confirmed_terms?: boolean
          owner_id: string
          photo_url: string
          pickup_preference: Database["public"]["Enums"]["pickup_preference"]
          status?: Database["public"]["Enums"]["item_status"]
          timing?: Database["public"]["Enums"]["timing_preference"] | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: string
          item_name?: string | null
          location?: string
          min_price?: number
          note?: string | null
          owner_confirmed_terms?: boolean
          owner_id?: string
          photo_url?: string
          pickup_preference?: Database["public"]["Enums"]["pickup_preference"]
          status?: Database["public"]["Enums"]["item_status"]
          timing?: Database["public"]["Enums"]["timing_preference"] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          facebook_marketplace_link: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          facebook_marketplace_link?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          facebook_marketplace_link?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          activated_at: string | null
          active_claim_id: string | null
          applied_at: string
          claims_used: number
          created_at: string
          id: string
          proof_link: string | null
          proof_screenshot_url: string | null
          service_area: string | null
          status: Database["public"]["Enums"]["seller_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          active_claim_id?: string | null
          applied_at?: string
          claims_used?: number
          created_at?: string
          id?: string
          proof_link?: string | null
          proof_screenshot_url?: string | null
          service_area?: string | null
          status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          active_claim_id?: string | null
          applied_at?: string
          claims_used?: number
          created_at?: string
          id?: string
          proof_link?: string | null
          proof_screenshot_url?: string | null
          service_area?: string | null
          status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_active_claim"
            columns: ["active_claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "admin" | "owner" | "seller"
      claim_status: "active" | "released" | "completed"
      item_status: "open" | "claimed" | "done"
      pickup_preference: "seller_pickup" | "buyer_pickup"
      seller_status: "waitlisted" | "active" | "paused"
      timing_preference: "asap" | "within_week" | "flexible"
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
      app_role: ["admin", "owner", "seller"],
      claim_status: ["active", "released", "completed"],
      item_status: ["open", "claimed", "done"],
      pickup_preference: ["seller_pickup", "buyer_pickup"],
      seller_status: ["waitlisted", "active", "paused"],
      timing_preference: ["asap", "within_week", "flexible"],
    },
  },
} as const
