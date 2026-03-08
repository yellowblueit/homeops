export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          notification_preferences: Json
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          notification_preferences?: Json
          timezone?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          notification_preferences?: Json
          timezone?: string
        }
      }
      homes: {
        Row: {
          id: string
          name: string
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string
          latitude: number | null
          longitude: number | null
          year_built: number | null
          square_footage: number | null
          lot_size_sqft: number | null
          home_type: string | null
          stories: number | null
          bedrooms: number | null
          bathrooms: number | null
          garage_type: string | null
          garage_spaces: number
          roof_type: string | null
          exterior_type: string | null
          heating_type: string | null
          cooling_type: string | null
          foundation_type: string | null
          notes: string | null
          exterior_photo_url: string | null
          aerial_photo_url: string | null
          property_data_source: Json | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          year_built?: number | null
          square_footage?: number | null
          lot_size_sqft?: number | null
          home_type?: string | null
          stories?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          garage_type?: string | null
          garage_spaces?: number
          roof_type?: string | null
          exterior_type?: string | null
          heating_type?: string | null
          cooling_type?: string | null
          foundation_type?: string | null
          notes?: string | null
          owner_id: string
        }
        Update: Partial<Database['public']['Tables']['homes']['Insert']>
      }
      home_members: {
        Row: {
          id: string
          home_id: string
          user_id: string
          role: 'owner' | 'contributor' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          home_id: string
          user_id: string
          role: 'owner' | 'contributor' | 'viewer'
        }
        Update: {
          role?: 'owner' | 'contributor' | 'viewer'
        }
      }
      invitations: {
        Row: {
          id: string
          home_id: string
          invited_by: string
          invited_email: string
          role: 'contributor' | 'viewer'
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          token: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          home_id: string
          invited_by: string
          invited_email: string
          role: 'contributor' | 'viewer'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
        }
      }
      equipment_categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          display_order: number
          created_at: string
        }
        Insert: never
        Update: never
      }
      equipment: {
        Row: {
          id: string
          home_id: string
          category_id: string | null
          name: string
          manufacturer: string | null
          model_number: string | null
          serial_number: string | null
          manufacture_date: string | null
          installed_date: string | null
          warranty_expiration: string | null
          warranty_details: string | null
          location_in_home: string | null
          description: string | null
          notes: string | null
          status: 'active' | 'replaced' | 'removed'
          manual_url: string | null
          manual_cached_data: Json | null
          recall_status: 'none' | 'checking' | 'recalled' | 'clear'
          recall_data: Json | null
          recall_last_checked: string | null
          ai_maintenance_suggestions: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          home_id: string
          name: string
          category_id?: string | null
          manufacturer?: string | null
          model_number?: string | null
          serial_number?: string | null
          manufacture_date?: string | null
          installed_date?: string | null
          warranty_expiration?: string | null
          warranty_details?: string | null
          location_in_home?: string | null
          description?: string | null
          notes?: string | null
          status?: 'active' | 'replaced' | 'removed'
        }
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>
      }
      equipment_photos: {
        Row: {
          id: string
          equipment_id: string
          storage_path: string
          caption: string | null
          is_primary: boolean
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          equipment_id: string
          storage_path: string
          caption?: string | null
          is_primary?: boolean
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          is_primary?: boolean
        }
      }
      maintenance_tasks: {
        Row: {
          id: string
          equipment_id: string
          home_id: string
          title: string
          description: string | null
          frequency_type: string
          frequency_interval_days: number | null
          next_due_date: string | null
          last_completed_date: string | null
          source: 'manual' | 'ai_recommended' | 'manufacturer'
          ai_confidence: number | null
          user_overridden: boolean
          priority: 'low' | 'medium' | 'high' | 'critical'
          estimated_duration_minutes: number | null
          estimated_cost: number | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          equipment_id: string
          home_id: string
          title: string
          description?: string | null
          frequency_type: string
          frequency_interval_days?: number | null
          next_due_date?: string | null
          source?: 'manual' | 'ai_recommended' | 'manufacturer'
          ai_confidence?: number | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          estimated_duration_minutes?: number | null
          estimated_cost?: number | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['maintenance_tasks']['Insert']> & {
          user_overridden?: boolean
          is_active?: boolean
        }
      }
      task_completions: {
        Row: {
          id: string
          task_id: string
          completed_by: string
          completed_date: string
          notes: string | null
          cost: number | null
          duration_minutes: number | null
          professional_service: boolean
          service_provider: string | null
          created_at: string
        }
        Insert: {
          task_id: string
          completed_by: string
          completed_date?: string
          notes?: string | null
          cost?: number | null
          duration_minutes?: number | null
          professional_service?: boolean
          service_provider?: string | null
        }
        Update: never
      }
      task_completion_photos: {
        Row: {
          id: string
          completion_id: string
          storage_path: string
          caption: string | null
          created_at: string
        }
        Insert: {
          completion_id: string
          storage_path: string
          caption?: string | null
        }
        Update: never
      }
      email_log: {
        Row: {
          id: string
          user_id: string
          email_type: string
          subject: string
          sent_at: string
          status: 'sent' | 'failed' | 'bounced'
          metadata: Json | null
        }
        Insert: {
          user_id: string
          email_type: string
          subject: string
          status?: 'sent' | 'failed' | 'bounced'
          metadata?: Json | null
        }
        Update: never
      }
    }
    Views: {
      tasks_with_status: {
        Row: {
          id: string
          equipment_id: string
          home_id: string
          title: string
          description: string | null
          frequency_type: string
          next_due_date: string | null
          last_completed_date: string | null
          priority: string
          is_active: boolean
          equipment_name: string
          equipment_manufacturer: string | null
          location_in_home: string | null
          category_name: string | null
          category_slug: string | null
          category_icon: string | null
          status: 'overdue' | 'due_soon' | 'upcoming' | 'inactive'
          completion_count: number
          latest_completion: string | null
        }
      }
      home_dashboard_summary: {
        Row: {
          home_id: string
          home_name: string
          equipment_count: number
          active_task_count: number
          overdue_count: number
          due_soon_count: number
          completed_last_30_days: number
        }
      }
    }
    Functions: {
      is_home_member: {
        Args: { check_home_id: string }
        Returns: boolean
      }
      get_home_role: {
        Args: { check_home_id: string }
        Returns: string
      }
      can_edit_home: {
        Args: { check_home_id: string }
        Returns: boolean
      }
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Home = Database['public']['Tables']['homes']['Row']
export type HomeMember = Database['public']['Tables']['home_members']['Row']
export type Equipment = Database['public']['Tables']['equipment']['Row']
export type EquipmentCategory = Database['public']['Tables']['equipment_categories']['Row']
export type EquipmentPhoto = Database['public']['Tables']['equipment_photos']['Row']
export type MaintenanceTask = Database['public']['Tables']['maintenance_tasks']['Row']
export type TaskCompletion = Database['public']['Tables']['task_completions']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']
export type TaskWithStatus = Database['public']['Views']['tasks_with_status']['Row']
export type HomeDashboardSummary = Database['public']['Views']['home_dashboard_summary']['Row']
