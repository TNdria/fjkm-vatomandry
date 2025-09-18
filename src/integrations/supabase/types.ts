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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      avis: {
        Row: {
          client_id: string
          commentaire: string | null
          created_at: string
          id: string
          note: number
          prestataire_id: string
          reservation_id: string
        }
        Insert: {
          client_id: string
          commentaire?: string | null
          created_at?: string
          id?: string
          note: number
          prestataire_id: string
          reservation_id: string
        }
        Update: {
          client_id?: string
          commentaire?: string | null
          created_at?: string
          id?: string
          note?: number
          prestataire_id?: string
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avis_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avis_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          nom: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          nom: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          nom?: string
        }
        Relationships: []
      }
      paiements: {
        Row: {
          created_at: string
          date_paiement: string | null
          id: string
          methode_paiement: string
          montant: number
          reservation_id: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          date_paiement?: string | null
          id?: string
          methode_paiement: string
          montant: number
          reservation_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          date_paiement?: string | null
          id?: string
          methode_paiement?: string
          montant?: number
          reservation_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          adresse: string | null
          cin: string | null
          commune: string | null
          created_at: string
          email: string
          fokontany: string | null
          id: string
          interview_notes: string | null
          nom: string
          photo_url: string | null
          prenom: string
          region: string | null
          rejected_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          solde_portefeuille: number | null
          telephone: string | null
          updated_at: string
          validation_date: string | null
          wallet_balance: number | null
        }
        Insert: {
          account_status?: string | null
          adresse?: string | null
          cin?: string | null
          commune?: string | null
          created_at?: string
          email: string
          fokontany?: string | null
          id: string
          interview_notes?: string | null
          nom: string
          photo_url?: string | null
          prenom: string
          region?: string | null
          rejected_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          solde_portefeuille?: number | null
          telephone?: string | null
          updated_at?: string
          validation_date?: string | null
          wallet_balance?: number | null
        }
        Update: {
          account_status?: string | null
          adresse?: string | null
          cin?: string | null
          commune?: string | null
          created_at?: string
          email?: string
          fokontany?: string | null
          id?: string
          interview_notes?: string | null
          nom?: string
          photo_url?: string | null
          prenom?: string
          region?: string | null
          rejected_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          solde_portefeuille?: number | null
          telephone?: string | null
          updated_at?: string
          validation_date?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          adresse_intervention: string
          client_id: string
          created_at: string
          date_debut: string
          date_fin: string
          id: string
          instructions_speciales: string | null
          prestataire_id: string
          prix_total: number
          service_id: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          adresse_intervention: string
          client_id: string
          created_at?: string
          date_debut: string
          date_fin: string
          id?: string
          instructions_speciales?: string | null
          prestataire_id: string
          prix_total: number
          service_id: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          adresse_intervention?: string
          client_id?: string
          created_at?: string
          date_debut?: string
          date_fin?: string
          id?: string
          instructions_speciales?: string | null
          prestataire_id?: string
          prix_total?: number
          service_id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          description: string
          disponibilites: Json | null
          duree_min: number | null
          id: string
          nombre_avis: number | null
          note_moyenne: number | null
          photos: Json | null
          prestataire_id: string
          prix_forfait: number | null
          prix_par_heure: number
          status: Database["public"]["Enums"]["service_status"]
          titre: string
          updated_at: string
          zone_intervention: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          disponibilites?: Json | null
          duree_min?: number | null
          id?: string
          nombre_avis?: number | null
          note_moyenne?: number | null
          photos?: Json | null
          prestataire_id: string
          prix_forfait?: number | null
          prix_par_heure: number
          status?: Database["public"]["Enums"]["service_status"]
          titre: string
          updated_at?: string
          zone_intervention: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          disponibilites?: Json | null
          duree_min?: number | null
          id?: string
          nombre_avis?: number | null
          note_moyenne?: number | null
          photos?: Json | null
          prestataire_id?: string
          prix_forfait?: number | null
          prix_par_heure?: number
          status?: Database["public"]["Enums"]["service_status"]
          titre?: string
          updated_at?: string
          zone_intervention?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_prestataire_id_fkey"
            columns: ["prestataire_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          auto_backup: boolean
          backup_frequency: string
          cache_enabled: boolean
          cdn_enabled: boolean
          compression_enabled: boolean
          created_at: string
          data_retention: number
          email_notifications: boolean
          id: string
          language: string
          login_attempts: number
          maintenance: boolean
          password_complexity: string
          push_notifications: boolean
          session_timeout: number
          site_name: string
          sms_notifications: boolean
          timezone: string
          two_factor_required: boolean
          updated_at: string
        }
        Insert: {
          auto_backup?: boolean
          backup_frequency?: string
          cache_enabled?: boolean
          cdn_enabled?: boolean
          compression_enabled?: boolean
          created_at?: string
          data_retention?: number
          email_notifications?: boolean
          id?: string
          language?: string
          login_attempts?: number
          maintenance?: boolean
          password_complexity?: string
          push_notifications?: boolean
          session_timeout?: number
          site_name?: string
          sms_notifications?: boolean
          timezone?: string
          two_factor_required?: boolean
          updated_at?: string
        }
        Update: {
          auto_backup?: boolean
          backup_frequency?: string
          cache_enabled?: boolean
          cdn_enabled?: boolean
          compression_enabled?: boolean
          created_at?: string
          data_retention?: number
          email_notifications?: boolean
          id?: string
          language?: string
          login_attempts?: number
          maintenance?: boolean
          password_complexity?: string
          push_notifications?: boolean
          session_timeout?: number
          site_name?: string
          sms_notifications?: boolean
          timezone?: string
          two_factor_required?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          description: string
          id: string
          montant: number
          statut: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          montant: number
          statut?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          montant?: number
          statut?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          reference: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reference?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reference?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_admin"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          description: string | null
          id: string
          related_reservation_id: string | null
          status: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          description?: string | null
          id?: string
          related_reservation_id?: string | null
          status?: string | null
          transaction_date?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          description?: string | null
          id?: string
          related_reservation_id?: string | null
          status?: string | null
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_notification: {
        Args: {
          notification_data?: Json
          notification_message: string
          notification_title: string
          notification_type: string
        }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      payment_status: "pending" | "paid" | "failed" | "refunded"
      reservation_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "admin_validation"
      service_status: "active" | "inactive" | "suspended"
      user_role: "admin" | "client" | "prestataire"
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
      payment_status: ["pending", "paid", "failed", "refunded"],
      reservation_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "admin_validation",
      ],
      service_status: ["active", "inactive", "suspended"],
      user_role: ["admin", "client", "prestataire"],
    },
  },
} as const
