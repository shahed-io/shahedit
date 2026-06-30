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
      admin_dashboard_layout: {
        Row: {
          updated_at: string
          user_id: string
          widgets: Json
        }
        Insert: {
          updated_at?: string
          user_id: string
          widgets?: Json
        }
        Update: {
          updated_at?: string
          user_id?: string
          widgets?: Json
        }
        Relationships: []
      }
      ai_support_settings: {
        Row: {
          bot_name: string
          collect_contact_info: boolean
          greeting_message: string
          human_handoff_message: string
          id: number
          is_enabled: boolean
          system_prompt: string
          updated_at: string
        }
        Insert: {
          bot_name?: string
          collect_contact_info?: boolean
          greeting_message?: string
          human_handoff_message?: string
          id?: number
          is_enabled?: boolean
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          bot_name?: string
          collect_contact_info?: boolean
          greeting_message?: string
          human_handoff_message?: string
          id?: number
          is_enabled?: boolean
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          meta: Json | null
          path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          meta?: Json | null
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          meta?: Json | null
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last_used_at: string | null
          name: string
          prefix: string
          revoked_at: string | null
          scopes: string[]
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          prefix: string
          revoked_at?: string | null
          scopes?: string[]
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          revoked_at?: string | null
          scopes?: string[]
          token_hash?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      backup_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string | null
          id: string
          notes: string | null
          row_count: number | null
          size_bytes: number | null
          status: string
          table_count: number | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name?: string | null
          id?: string
          notes?: string | null
          row_count?: number | null
          size_bytes?: number | null
          status?: string
          table_count?: number | null
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string | null
          id?: string
          notes?: string | null
          row_count?: number | null
          size_bytes?: number | null
          status?: string
          table_count?: number | null
          type?: string
        }
        Relationships: []
      }
      bkash_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_msisdn: string | null
          customer_name: string | null
          id: string
          intent: string | null
          merchant_invoice_number: string | null
          mode: string
          note: string | null
          payer_reference: string | null
          payment_create_time: string | null
          payment_execute_time: string | null
          payment_id: string | null
          raw_payload: Json | null
          service: string | null
          status: string
          trx_id: string | null
          updated_at: string
          user_email: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_msisdn?: string | null
          customer_name?: string | null
          id?: string
          intent?: string | null
          merchant_invoice_number?: string | null
          mode?: string
          note?: string | null
          payer_reference?: string | null
          payment_create_time?: string | null
          payment_execute_time?: string | null
          payment_id?: string | null
          raw_payload?: Json | null
          service?: string | null
          status?: string
          trx_id?: string | null
          updated_at?: string
          user_email?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_msisdn?: string | null
          customer_name?: string | null
          id?: string
          intent?: string | null
          merchant_invoice_number?: string | null
          mode?: string
          note?: string | null
          payer_reference?: string | null
          payment_create_time?: string | null
          payment_execute_time?: string | null
          payment_id?: string | null
          raw_payload?: Json | null
          service?: string | null
          status?: string
          trx_id?: string | null
          updated_at?: string
          user_email?: string | null
        }
        Relationships: []
      }
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
      blog_comments: {
        Row: {
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
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
      blog_tags: {
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
      broken_links: {
        Row: {
          created_at: string
          hits: number
          id: string
          last_seen_at: string
          path: string
          referrer: string | null
          resolved: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          hits?: number
          id?: string
          last_seen_at?: string
          path: string
          referrer?: string | null
          resolved?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          hits?: number
          id?: string
          last_seen_at?: string
          path?: string
          referrer?: string | null
          resolved?: boolean
          user_agent?: string | null
        }
        Relationships: []
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
      client_documents: {
        Row: {
          client_email: string
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_visible: boolean
          lead_id: string | null
          title: string
          uploaded_by: string
        }
        Insert: {
          client_email: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          is_visible?: boolean
          lead_id?: string | null
          title: string
          uploaded_by: string
        }
        Update: {
          client_email?: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_visible?: boolean
          lead_id?: string | null
          title?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      client_error_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          severity: string
          stack: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      cms_menus: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
        }
        Relationships: []
      }
      cms_site_settings: {
        Row: {
          favicon_media_id: string | null
          id: number
          logo_media_id: string | null
          primary_color: string | null
          site_tagline: string | null
          site_title: string
          updated_at: string
        }
        Insert: {
          favicon_media_id?: string | null
          id?: number
          logo_media_id?: string | null
          primary_color?: string | null
          site_tagline?: string | null
          site_title?: string
          updated_at?: string
        }
        Update: {
          favicon_media_id?: string | null
          id?: number
          logo_media_id?: string | null
          primary_color?: string | null
          site_tagline?: string | null
          site_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_site_settings_favicon_media_id_fkey"
            columns: ["favicon_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_site_settings_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          author_id: string
          created_at: string
          excerpt: string | null
          featured_media_id: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_featured_media"
            columns: ["featured_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions: {
        Row: {
          body_html: string | null
          content_id: string
          created_at: string
          created_by: string
          editor_state_json: Json | null
          id: string
          version_no: number
        }
        Insert: {
          body_html?: string | null
          content_id: string
          created_at?: string
          created_by: string
          editor_state_json?: Json | null
          id?: string
          version_no?: number
        }
        Update: {
          body_html?: string | null
          content_id?: string
          created_at?: string
          created_by?: string
          editor_state_json?: Json | null
          id?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_amount: number
          id: string
          order_amount: number
          order_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_amount?: number
          id?: string
          order_amount?: number
          order_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          order_amount?: number
          order_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "public_coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applies_id: string | null
          applies_to: string | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          first_order_only: boolean
          free_shipping: boolean
          id: string
          is_active: boolean
          max_discount_amount: number | null
          max_uses: number | null
          min_order_amount: number | null
          per_user_limit: number | null
          updated_at: string
          used_count: number
          user_email: string | null
          user_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_id?: string | null
          applies_to?: string | null
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          first_order_only?: boolean
          free_shipping?: boolean
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          per_user_limit?: number | null
          updated_at?: string
          used_count?: number
          user_email?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_id?: string | null
          applies_to?: string | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          first_order_only?: boolean
          free_shipping?: boolean
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          per_user_limit?: number | null
          updated_at?: string
          used_count?: number
          user_email?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      custom_role_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          custom_role_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          custom_role_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          custom_role_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_role_assignments_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          permissions: Json
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          permissions?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          permissions?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_devices: {
        Row: {
          browser: string | null
          device_fingerprint: string
          device_name: string | null
          first_seen_at: string
          id: string
          ip: string | null
          is_active: boolean
          is_trusted: boolean
          last_seen_at: string
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          device_fingerprint: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          ip?: string | null
          is_active?: boolean
          is_trusted?: boolean
          last_seen_at?: string
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          device_fingerprint?: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          ip?: string | null
          is_active?: boolean
          is_trusted?: boolean
          last_seen_at?: string
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_login_history: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device: string | null
          id: string
          ip: string | null
          logged_in_at: string
          os: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          id?: string
          ip?: string | null
          logged_in_at?: string
          os?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          id?: string
          ip?: string | null
          logged_in_at?: string
          os?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_notes: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          is_pinned: boolean
          note: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          note: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          note?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_reward_points: {
        Row: {
          lifetime_earned: number
          lifetime_redeemed: number
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          lifetime_earned?: number
          lifetime_redeemed?: number
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          lifetime_earned?: number
          lifetime_redeemed?: number
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_status: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          is_blocked: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          is_blocked?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          is_blocked?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_downloads: {
        Row: {
          created_at: string
          download_count: number
          download_limit: number
          expires_at: string | null
          file_id: string | null
          id: string
          last_downloaded_at: string | null
          license_key_id: string | null
          order_id: string | null
          package_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          download_limit?: number
          expires_at?: string | null
          file_id?: string | null
          id?: string
          last_downloaded_at?: string | null
          license_key_id?: string | null
          order_id?: string | null
          package_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number
          download_limit?: number
          expires_at?: string | null
          file_id?: string | null
          id?: string
          last_downloaded_at?: string | null
          license_key_id?: string | null
          order_id?: string | null
          package_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_downloads_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "digital_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_downloads_license_key_id_fkey"
            columns: ["license_key_id"]
            isOneToOne: false
            referencedRelation: "license_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_downloads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_downloads_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_files: {
        Row: {
          created_at: string
          download_limit: number
          expiry_days: number
          file_name: string
          file_size_bytes: number | null
          id: string
          is_active: boolean
          mime_type: string | null
          package_id: string
          storage_path: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          download_limit?: number
          expiry_days?: number
          file_name: string
          file_size_bytes?: number | null
          id?: string
          is_active?: boolean
          mime_type?: string | null
          package_id: string
          storage_path: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          download_limit?: number
          expiry_days?: number
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          is_active?: boolean
          mime_type?: string | null
          package_id?: string
          storage_path?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_files_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          audience: string
          body_html: string
          created_at: string
          created_by: string | null
          custom_emails: string[] | null
          delivered_count: number | null
          id: string
          name: string
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body_html: string
          created_at?: string
          created_by?: string | null
          custom_emails?: string[] | null
          delivered_count?: number | null
          id?: string
          name: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body_html?: string
          created_at?: string
          created_by?: string | null
          custom_emails?: string[] | null
          delivered_count?: number | null
          id?: string
          name?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_system_settings: {
        Row: {
          from_email: string | null
          from_name: string | null
          id: number
          newsletter_enabled: boolean | null
          order_confirmation_enabled: boolean | null
          order_delivery_enabled: boolean | null
          order_status_enabled: boolean | null
          password_reset_enabled: boolean | null
          reply_to: string | null
          updated_at: string
          welcome_email_enabled: boolean | null
        }
        Insert: {
          from_email?: string | null
          from_name?: string | null
          id?: number
          newsletter_enabled?: boolean | null
          order_confirmation_enabled?: boolean | null
          order_delivery_enabled?: boolean | null
          order_status_enabled?: boolean | null
          password_reset_enabled?: boolean | null
          reply_to?: string | null
          updated_at?: string
          welcome_email_enabled?: boolean | null
        }
        Update: {
          from_email?: string | null
          from_name?: string | null
          id?: number
          newsletter_enabled?: boolean | null
          order_confirmation_enabled?: boolean | null
          order_delivery_enabled?: boolean | null
          order_status_enabled?: boolean | null
          password_reset_enabled?: boolean | null
          reply_to?: string | null
          updated_at?: string
          welcome_email_enabled?: boolean | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          subject: string
          template_key: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          subject?: string
          template_key: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          subject?: string
          template_key?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          currency: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string
          email: string | null
          id: string
          ip_address: string | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
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
      hero_slides: {
        Row: {
          autoplay_seconds: number
          background_image_url: string | null
          badge_text: string | null
          cards: Json
          countdown_end_at: string | null
          countdown_label: string | null
          created_at: string
          description: string | null
          headline: string
          highlight: string | null
          id: string
          is_active: boolean
          primary_cta_label: string | null
          primary_cta_link: string | null
          secondary_cta_label: string | null
          secondary_cta_link: string | null
          show_countdown: boolean
          sort_order: number
          stats: Json
          updated_at: string
        }
        Insert: {
          autoplay_seconds?: number
          background_image_url?: string | null
          badge_text?: string | null
          cards?: Json
          countdown_end_at?: string | null
          countdown_label?: string | null
          created_at?: string
          description?: string | null
          headline?: string
          highlight?: string | null
          id?: string
          is_active?: boolean
          primary_cta_label?: string | null
          primary_cta_link?: string | null
          secondary_cta_label?: string | null
          secondary_cta_link?: string | null
          show_countdown?: boolean
          sort_order?: number
          stats?: Json
          updated_at?: string
        }
        Update: {
          autoplay_seconds?: number
          background_image_url?: string | null
          badge_text?: string | null
          cards?: Json
          countdown_end_at?: string | null
          countdown_label?: string | null
          created_at?: string
          description?: string | null
          headline?: string
          highlight?: string | null
          id?: string
          is_active?: boolean
          primary_cta_label?: string | null
          primary_cta_link?: string | null
          secondary_cta_label?: string | null
          secondary_cta_link?: string | null
          show_countdown?: boolean
          sort_order?: number
          stats?: Json
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          currency: string
          discount: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          payment_method: string | null
          project_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          terms: string | null
          total: number
          updated_at: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      ip_whitelist: {
        Row: {
          applies_to: string | null
          created_at: string
          created_by: string | null
          id: string
          ip_address: string
          is_active: boolean | null
          label: string | null
        }
        Insert: {
          applies_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address: string
          is_active?: boolean | null
          label?: string | null
        }
        Update: {
          applies_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean | null
          label?: string | null
        }
        Relationships: []
      }
      knowledge_articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          sort_order: number
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
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
      license_history: {
        Row: {
          actor: string | null
          actor_id: string | null
          created_at: string
          event: string
          id: string
          license_key_id: string
          message: string | null
          metadata: Json
          user_id: string | null
        }
        Insert: {
          actor?: string | null
          actor_id?: string | null
          created_at?: string
          event: string
          id?: string
          license_key_id: string
          message?: string | null
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          actor?: string | null
          actor_id?: string | null
          created_at?: string
          event?: string
          id?: string
          license_key_id?: string
          message?: string | null
          metadata?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_history_license_key_id_fkey"
            columns: ["license_key_id"]
            isOneToOne: false
            referencedRelation: "license_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      license_keys: {
        Row: {
          activation_count: number
          assigned_at: string | null
          assigned_to_email: string | null
          assigned_to_user_id: string | null
          created_at: string
          id: string
          key_value: string
          last_activated_at: string | null
          max_activations: number
          notes: string | null
          order_id: string | null
          package_id: string
          revoked_at: string | null
          revoked_reason: string | null
          status: Database["public"]["Enums"]["license_key_status"]
          updated_at: string
        }
        Insert: {
          activation_count?: number
          assigned_at?: string | null
          assigned_to_email?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          id?: string
          key_value: string
          last_activated_at?: string | null
          max_activations?: number
          notes?: string | null
          order_id?: string | null
          package_id: string
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["license_key_status"]
          updated_at?: string
        }
        Update: {
          activation_count?: number
          assigned_at?: string | null
          assigned_to_email?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          id?: string
          key_value?: string
          last_activated_at?: string | null
          max_activations?: number
          notes?: string | null
          order_id?: string | null
          package_id?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["license_key_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_keys_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_keys_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_settings: {
        Row: {
          auto_backup_enabled: boolean | null
          auto_backup_frequency: string | null
          auto_backup_retention_days: number | null
          auto_backup_time: string | null
          cache_version: number | null
          id: number
          last_auto_backup_at: string | null
          maintenance_allow_admin: boolean | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          updated_at: string
        }
        Insert: {
          auto_backup_enabled?: boolean | null
          auto_backup_frequency?: string | null
          auto_backup_retention_days?: number | null
          auto_backup_time?: string | null
          cache_version?: number | null
          id?: number
          last_auto_backup_at?: string | null
          maintenance_allow_admin?: boolean | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          updated_at?: string
        }
        Update: {
          auto_backup_enabled?: boolean | null
          auto_backup_frequency?: string | null
          auto_backup_retention_days?: number | null
          auto_backup_time?: string | null
          cache_version?: number | null
          id?: number
          last_auto_backup_at?: string | null
          maintenance_allow_admin?: boolean | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string
          file_size: number | null
          file_type: string
          file_url: string
          height: number | null
          id: string
          title: string | null
          uploaded_by: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          file_type: string
          file_url: string
          height?: number | null
          id?: string
          title?: string | null
          uploaded_by: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          height?: number | null
          id?: string
          title?: string | null
          uploaded_by?: string
          width?: number | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          id: string
          item_type: string
          label: string
          menu_id: string
          parent_id: string | null
          sort_order: number
          target: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_type?: string
          label: string
          menu_id: string
          parent_id?: string | null
          sort_order?: number
          target?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          label?: string
          menu_id?: string
          parent_id?: string | null
          sort_order?: number
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "cms_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      mgmt_projects: {
        Row: {
          assigned_to: string | null
          budget: number | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          priority: string
          progress: number
          start_date: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget?: number | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          priority?: string
          progress?: number
          start_date?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget?: number | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          priority?: string
          progress?: number
          start_date?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      mgmt_tasks: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mgmt_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "mgmt_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          status: string
          tags: string[] | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          ai_prompt: string | null
          body: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          issue_date: string
          issued_by: string | null
          language: string | null
          notice_number: string
          recipient_address: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          reference: string | null
          status: string
          subject: string | null
          title: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          ai_prompt?: string | null
          body: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          issue_date?: string
          issued_by?: string | null
          language?: string | null
          notice_number: string
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          reference?: string | null
          status?: string
          subject?: string | null
          title: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          ai_prompt?: string | null
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          issue_date?: string
          issued_by?: string | null
          language?: string | null
          notice_number?: string
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          reference?: string | null
          status?: string
          subject?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_channels: {
        Row: {
          admin_alert_emails: string | null
          admin_alert_on_failed_payment: boolean | null
          admin_alert_on_new_lead: boolean | null
          admin_alert_on_new_order: boolean | null
          admin_alert_on_refund: boolean | null
          email_enabled: boolean | null
          id: number
          push_enabled: boolean | null
          push_provider: string | null
          push_vapid_public: string | null
          sms_enabled: boolean | null
          sms_from: string | null
          sms_provider: string | null
          updated_at: string
          whatsapp_default_message: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          admin_alert_emails?: string | null
          admin_alert_on_failed_payment?: boolean | null
          admin_alert_on_new_lead?: boolean | null
          admin_alert_on_new_order?: boolean | null
          admin_alert_on_refund?: boolean | null
          email_enabled?: boolean | null
          id?: number
          push_enabled?: boolean | null
          push_provider?: string | null
          push_vapid_public?: string | null
          sms_enabled?: boolean | null
          sms_from?: string | null
          sms_provider?: string | null
          updated_at?: string
          whatsapp_default_message?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          admin_alert_emails?: string | null
          admin_alert_on_failed_payment?: boolean | null
          admin_alert_on_new_lead?: boolean | null
          admin_alert_on_new_order?: boolean | null
          admin_alert_on_refund?: boolean | null
          email_enabled?: boolean | null
          id?: number
          push_enabled?: boolean | null
          push_provider?: string | null
          push_vapid_public?: string | null
          sms_enabled?: boolean | null
          sms_from?: string | null
          sms_provider?: string | null
          updated_at?: string
          whatsapp_default_message?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          label: string
          subject: string | null
          template_key: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body?: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          label: string
          subject?: string | null
          template_key: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          label?: string
          subject?: string | null
          template_key?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offer_campaigns: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          fields: Json
          google_form_url: string | null
          id: string
          max_entries: number | null
          meta_description: string | null
          meta_title: string | null
          prize_description: string | null
          redirect_url: string | null
          require_login: boolean
          selection_method: string
          settings: Json
          slug: string
          starts_at: string | null
          status: string
          thank_you_message: string | null
          title: string
          updated_at: string
          use_google_form: boolean
          winner_prizes: Json
          winners_announce_at: string | null
          winners_announced: boolean
          winners_count: number
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          fields?: Json
          google_form_url?: string | null
          id?: string
          max_entries?: number | null
          meta_description?: string | null
          meta_title?: string | null
          prize_description?: string | null
          redirect_url?: string | null
          require_login?: boolean
          selection_method?: string
          settings?: Json
          slug: string
          starts_at?: string | null
          status?: string
          thank_you_message?: string | null
          title: string
          updated_at?: string
          use_google_form?: boolean
          winner_prizes?: Json
          winners_announce_at?: string | null
          winners_announced?: boolean
          winners_count?: number
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          fields?: Json
          google_form_url?: string | null
          id?: string
          max_entries?: number | null
          meta_description?: string | null
          meta_title?: string | null
          prize_description?: string | null
          redirect_url?: string | null
          require_login?: boolean
          selection_method?: string
          settings?: Json
          slug?: string
          starts_at?: string | null
          status?: string
          thank_you_message?: string | null
          title?: string
          updated_at?: string
          use_google_form?: boolean
          winner_prizes?: Json
          winners_announce_at?: string | null
          winners_announced?: boolean
          winners_count?: number
        }
        Relationships: []
      }
      offer_submissions: {
        Row: {
          answers: Json
          campaign_id: string
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          is_disqualified: boolean
          name: string | null
          notes: string | null
          phone: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json
          campaign_id: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          is_disqualified?: boolean
          name?: string | null
          notes?: string | null
          phone?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          campaign_id?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          is_disqualified?: boolean
          name?: string | null
          notes?: string | null
          phone?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "offer_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_winners: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          is_published: boolean
          notified: boolean
          position: number
          prize: string | null
          reason: string | null
          selected_at: string
          selected_by: string
          submission_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_published?: boolean
          notified?: boolean
          position?: number
          prize?: string | null
          reason?: string | null
          selected_at?: string
          selected_by?: string
          submission_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_published?: boolean
          notified?: boolean
          position?: number
          prize?: string | null
          reason?: string | null
          selected_at?: string
          selected_by?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_winners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "offer_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_winners_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "offer_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline: {
        Row: {
          actor: string
          actor_id: string | null
          created_at: string
          event: string
          id: string
          message: string | null
          metadata: Json
          order_id: string
        }
        Insert: {
          actor?: string
          actor_id?: string | null
          created_at?: string
          event: string
          id?: string
          message?: string | null
          metadata?: Json
          order_id: string
        }
        Update: {
          actor?: string
          actor_id?: string | null
          created_at?: string
          event?: string
          id?: string
          message?: string | null
          metadata?: Json
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          amount: number
          cancel_reason: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivered_at: string | null
          delivery_days: number | null
          delivery_files: Json | null
          delivery_notes: string | null
          expected_delivery_at: string | null
          id: string
          order_number: string
          package_id: string | null
          payment_id: string | null
          payment_method: string | null
          product_title: string
          service_id: string | null
          status: string
          tracking_carrier: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          cancel_reason?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_days?: number | null
          delivery_files?: Json | null
          delivery_notes?: string | null
          expected_delivery_at?: string | null
          id?: string
          order_number?: string
          package_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          product_title: string
          service_id?: string | null
          status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          cancel_reason?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_days?: number | null
          delivery_files?: Json | null
          delivery_notes?: string | null
          expected_delivery_at?: string | null
          id?: string
          order_number?: string
          package_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          product_title?: string
          service_id?: string | null
          status?: string
          tracking_carrier?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payment_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_published: boolean
          label: string
          section_key: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          label: string
          section_key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          label?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          color: string
          created_at: string
          id: string
          instructions: string | null
          is_active: boolean
          label: string
          logo_url: string | null
          method_id: string
          number: string
          short_code: string
          sort_order: number
          sublabel: string | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          label: string
          logo_url?: string | null
          method_id: string
          number: string
          short_code?: string
          sort_order?: number
          sublabel?: string | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          label?: string
          logo_url?: string | null
          method_id?: string
          number?: string
          short_code?: string
          sort_order?: number
          sublabel?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          amount: number
          created_at: string
          email: string | null
          id: string
          name: string
          note: string | null
          payment_method: string
          phone: string
          service: string | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          email?: string | null
          id?: string
          name: string
          note?: string | null
          payment_method: string
          phone: string
          service?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          note?: string | null
          payment_method?: string
          phone?: string
          service?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      popular_searches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          term: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          term: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          term?: string
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
      product_brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          package_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          package_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          package_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          admin_reply: string | null
          comment: string | null
          created_at: string
          id: string
          is_spam: boolean
          package_id: string
          rating: number
          replied_at: string | null
          replied_by: string | null
          spam_reasons: string[] | null
          spam_score: number | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_spam?: boolean
          package_id: string
          rating: number
          replied_at?: string | null
          replied_by?: string | null
          spam_reasons?: string[] | null
          spam_score?: number | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_spam?: boolean
          package_id?: string
          rating?: number
          replied_at?: string | null
          replied_by?: string | null
          spam_reasons?: string[] | null
          spam_score?: number | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tag_relations: {
        Row: {
          package_id: string
          tag_id: string
        }
        Insert: {
          package_id: string
          tag_id: string
        }
        Update: {
          package_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tag_relations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "product_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      product_variant_options: {
        Row: {
          id: string
          option_name: string
          option_value: string
          variant_id: string
        }
        Insert: {
          id?: string
          option_name: string
          option_value: string
          variant_id: string
        }
        Update: {
          id?: string
          option_name?: string
          option_value?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_options_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          package_id: string
          price: number | null
          sale_price: number | null
          sku: string | null
          sort_order: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          package_id: string
          price?: number | null
          sale_price?: number | null
          sku?: string | null
          sort_order?: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          package_id?: string
          price?: number | null
          sale_price?: number | null
          sku?: string | null
          sort_order?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          brand: string | null
          category: string | null
          created_at: string
          currency: string
          description: string | null
          dimensions: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          in_stock: boolean
          is_featured: boolean
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          original_price: number | null
          price: number
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number
          stock_quantity: number
          tags: string[] | null
          title: string
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          badge?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          price?: number
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          stock_quantity?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          badge?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          original_price?: number | null
          price?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          stock_quantity?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
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
      quotation_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          quantity: number
          quotation_id: string
          sort_order: number
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          quantity?: number
          quotation_id: string
          sort_order?: number
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quotation_id?: string
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_company: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          converted_order_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          discount: number
          id: string
          issue_date: string
          notes: string | null
          quote_number: string
          status: string
          subject: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          terms: string | null
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_company?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          converted_order_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount?: number
          id?: string
          issue_date?: string
          notes?: string | null
          quote_number?: string
          status?: string
          subject?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          converted_order_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount?: number
          id?: string
          issue_date?: string
          notes?: string | null
          quote_number?: string
          status?: string
          subject?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          from_path: string
          hits: number
          id: string
          is_active: boolean
          notes: string | null
          status_code: number
          to_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_path: string
          hits?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          status_code?: number
          to_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_path?: string
          hits?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          status_code?: number
          to_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          attachments: Json
          created_at: string
          email: string
          id: string
          name: string
          order_id: string | null
          phone: string
          reason: string
          request_number: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachments?: Json
          created_at?: string
          email: string
          id?: string
          name: string
          order_id?: string | null
          phone: string
          reason: string
          request_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachments?: Json
          created_at?: string
          email?: string
          id?: string
          name?: string
          order_id?: string | null
          phone?: string
          reason?: string
          request_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reward_points_log: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          order_id: string | null
          points: number
          reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          points: number
          reason?: string | null
          type: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          points?: number
          reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          failed_login_lockout_minutes: number | null
          failed_login_lockout_threshold: number | null
          id: number
          ip_whitelist_enabled: boolean | null
          recaptcha_enabled: boolean | null
          recaptcha_secret_key: string | null
          recaptcha_site_key: string | null
          session_absolute_timeout_hours: number | null
          session_idle_timeout_minutes: number | null
          twofa_required_for_admins: boolean | null
          twofa_required_for_all: boolean | null
          updated_at: string
        }
        Insert: {
          failed_login_lockout_minutes?: number | null
          failed_login_lockout_threshold?: number | null
          id?: number
          ip_whitelist_enabled?: boolean | null
          recaptcha_enabled?: boolean | null
          recaptcha_secret_key?: string | null
          recaptcha_site_key?: string | null
          session_absolute_timeout_hours?: number | null
          session_idle_timeout_minutes?: number | null
          twofa_required_for_admins?: boolean | null
          twofa_required_for_all?: boolean | null
          updated_at?: string
        }
        Update: {
          failed_login_lockout_minutes?: number | null
          failed_login_lockout_threshold?: number | null
          id?: number
          ip_whitelist_enabled?: boolean | null
          recaptcha_enabled?: boolean | null
          recaptcha_secret_key?: string | null
          recaptcha_site_key?: string | null
          session_absolute_timeout_hours?: number | null
          session_idle_timeout_minutes?: number | null
          twofa_required_for_admins?: boolean | null
          twofa_required_for_all?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_meta: {
        Row: {
          canonical_url: string | null
          content_id: string
          meta_desc: string | null
          meta_title: string | null
          og_image_id: string | null
          robots: string | null
          schema_json: Json | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          content_id: string
          meta_desc?: string | null
          meta_title?: string | null
          og_image_id?: string | null
          robots?: string | null
          schema_json?: Json | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          content_id?: string
          meta_desc?: string | null
          meta_title?: string | null
          og_image_id?: string | null
          robots?: string | null
          schema_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_meta_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_meta_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          is_active: boolean
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_label: string | null
          robots: string | null
          route_path: string
          schema_json: Json | null
          twitter_card: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_label?: string | null
          robots?: string | null
          route_path: string
          schema_json?: Json | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_label?: string | null
          robots?: string | null
          route_path?: string
          schema_json?: Json | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          badge: string | null
          barcode: string | null
          brand_id: string | null
          canonical_url: string | null
          category_id: string | null
          created_at: string
          currency: string | null
          delivery_days: number | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          is_digital: boolean
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_image: string | null
          original_price: number | null
          price: number | null
          publish_status: Database["public"]["Enums"]["publish_status"]
          scheduled_publish_at: string | null
          service_id: string
          short_description: string | null
          sku: string | null
          slug: string | null
          sort_order: number | null
          title: string
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          badge?: string | null
          barcode?: string | null
          brand_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_days?: number | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_digital?: boolean
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_image?: string | null
          original_price?: number | null
          price?: number | null
          publish_status?: Database["public"]["Enums"]["publish_status"]
          scheduled_publish_at?: string | null
          service_id: string
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          badge?: string | null
          barcode?: string | null
          brand_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_days?: number | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_digital?: boolean
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_image?: string | null
          original_price?: number | null
          price?: number | null
          publish_status?: Database["public"]["Enums"]["publish_status"]
          scheduled_publish_at?: string | null
          service_id?: string
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          default_delivery_days: number | null
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
          default_delivery_days?: number | null
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
          default_delivery_days?: number | null
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
      support_chats: {
        Row: {
          created_at: string
          id: string
          messages: Json
          session_id: string
          status: string
          updated_at: string
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          session_id: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          session_id?: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      taxonomies: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          designation: string | null
          email: string | null
          id: string
          is_active: boolean
          is_owner: boolean
          is_published: boolean | null
          joining_date: string | null
          linkedin_url: string | null
          name: string
          phone: string | null
          role: string
          sort_order: number | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_owner?: boolean
          is_published?: boolean | null
          joining_date?: string | null
          linkedin_url?: string | null
          name: string
          phone?: string | null
          role: string
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_owner?: boolean
          is_published?: boolean | null
          joining_date?: string | null
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          role?: string
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tech_details: {
        Row: {
          best_for: Json
          category: string
          color: string
          cons: Json
          created_at: string
          history: string
          id: string
          is_published: boolean
          name: string
          pros: Json
          slug: string
          sort_order: number
          symbol: string
          tagline: string
          updated_at: string
          what_is_it: string
        }
        Insert: {
          best_for?: Json
          category?: string
          color?: string
          cons?: Json
          created_at?: string
          history?: string
          id?: string
          is_published?: boolean
          name: string
          pros?: Json
          slug: string
          sort_order?: number
          symbol?: string
          tagline?: string
          updated_at?: string
          what_is_it?: string
        }
        Update: {
          best_for?: Json
          category?: string
          color?: string
          cons?: Json
          created_at?: string
          history?: string
          id?: string
          is_published?: boolean
          name?: string
          pros?: Json
          slug?: string
          sort_order?: number
          symbol?: string
          tagline?: string
          updated_at?: string
          what_is_it?: string
        }
        Relationships: []
      }
      term_relations: {
        Row: {
          content_id: string
          term_id: string
        }
        Insert: {
          content_id: string
          term_id: string
        }
        Update: {
          content_id?: string
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "term_relations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_relations_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
          taxonomy_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          taxonomy_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          taxonomy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_taxonomy_id_fkey"
            columns: ["taxonomy_id"]
            isOneToOne: false
            referencedRelation: "taxonomies"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          direction: string
          id: string
          metadata: Json
          payment_method: string | null
          performed_by: string | null
          product_title: string | null
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          direction: string
          id?: string
          metadata?: Json
          payment_method?: string | null
          performed_by?: string | null
          product_title?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          direction?: string
          id?: string
          metadata?: Json
          payment_method?: string | null
          performed_by?: string | null
          product_title?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempted_at: string
          event: string
          id: string
          payload: Json | null
          response_body: string | null
          response_status: number | null
          webhook_id: string | null
        }
        Insert: {
          attempted_at?: string
          event: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Update: {
          attempted_at?: string
          event?: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          is_active: boolean
          last_fired_at: string | null
          last_status: number | null
          name: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          last_fired_at?: string | null
          last_status?: number | null
          name: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          last_fired_at?: string | null
          last_status?: number | null
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      welcome_popups: {
        Row: {
          bg_color: string | null
          border_radius: number | null
          button_bg_color: string | null
          button_text_color: string | null
          created_at: string
          cta_label: string | null
          cta_link: string | null
          delay_seconds: number | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          overlay_opacity: number | null
          priority: number
          show_once: boolean
          starts_at: string | null
          subtitle: string | null
          target_paths: string[] | null
          targeting: string
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          border_radius?: number | null
          button_bg_color?: string | null
          button_text_color?: string | null
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          delay_seconds?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          overlay_opacity?: number | null
          priority?: number
          show_once?: boolean
          starts_at?: string | null
          subtitle?: string | null
          target_paths?: string[] | null
          targeting?: string
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          border_radius?: number | null
          button_bg_color?: string | null
          button_text_color?: string | null
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          delay_seconds?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          overlay_opacity?: number | null
          priority?: number
          show_once?: boolean
          starts_at?: string | null
          subtitle?: string | null
          target_paths?: string[] | null
          targeting?: string
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      ai_support_settings_public: {
        Row: {
          bot_name: string | null
          greeting_message: string | null
          id: number | null
          is_enabled: boolean | null
        }
        Insert: {
          bot_name?: string | null
          greeting_message?: string | null
          id?: number | null
          is_enabled?: boolean | null
        }
        Update: {
          bot_name?: string | null
          greeting_message?: string | null
          id?: number | null
          is_enabled?: boolean | null
        }
        Relationships: []
      }
      product_review_stats: {
        Row: {
          average_rating: number | null
          package_id: string | null
          review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews_public: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          package_id: string | null
          rating: number | null
          reviewer_avatar: string | null
          reviewer_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      public_coupons: {
        Row: {
          applies_id: string | null
          applies_to: string | null
          code: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string | null
          min_order_amount: number | null
          valid_until: string | null
        }
        Insert: {
          applies_id?: string | null
          applies_to?: string | null
          code?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string | null
          min_order_amount?: number | null
          valid_until?: string | null
        }
        Update: {
          applies_id?: string | null
          applies_to?: string | null
          code?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string | null
          min_order_amount?: number | null
          valid_until?: string | null
        }
        Relationships: []
      }
      public_team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          department: string | null
          designation: string | null
          id: string | null
          is_active: boolean | null
          is_published: boolean | null
          linkedin_url: string | null
          name: string | null
          role: string | null
          sort_order: number | null
          twitter_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          department?: string | null
          designation?: string | null
          id?: string | null
          is_active?: boolean | null
          is_published?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          role?: string | null
          sort_order?: number | null
          twitter_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          department?: string | null
          designation?: string | null
          id?: string | null
          is_active?: boolean | null
          is_published?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          role?: string | null
          sort_order?: number | null
          twitter_url?: string | null
        }
        Relationships: []
      }
      team_members_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          designation: string | null
          id: string | null
          is_active: boolean | null
          is_owner: boolean | null
          is_published: boolean | null
          linkedin_url: string | null
          name: string | null
          role: string | null
          sort_order: number | null
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          id?: string | null
          is_active?: boolean | null
          is_owner?: boolean | null
          is_published?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          role?: string | null
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          id?: string | null
          is_active?: boolean | null
          is_owner?: boolean | null
          is_published?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          role?: string | null
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_license: {
        Args: { _key_value: string }
        Returns: {
          activation_count: number
          assigned_at: string | null
          assigned_to_email: string | null
          assigned_to_user_id: string | null
          created_at: string
          id: string
          key_value: string
          last_activated_at: string | null
          max_activations: number
          notes: string | null
          order_id: string | null
          package_id: string
          revoked_at: string | null
          revoked_reason: string | null
          status: Database["public"]["Enums"]["license_key_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "license_keys"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      adjust_reward_points: {
        Args: {
          _delta: number
          _order_id?: string
          _reason: string
          _type?: string
          _user_id: string
        }
        Returns: {
          lifetime_earned: number
          lifetime_redeemed: number
          points: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "customer_reward_points"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_assign_license: {
        Args: {
          _key_id: string
          _note?: string
          _order_id?: string
          _user_email?: string
          _user_id?: string
        }
        Returns: {
          activation_count: number
          assigned_at: string | null
          assigned_to_email: string | null
          assigned_to_user_id: string | null
          created_at: string
          id: string
          key_value: string
          last_activated_at: string | null
          max_activations: number
          notes: string | null
          order_id: string | null
          package_id: string
          revoked_at: string | null
          revoked_reason: string | null
          status: Database["public"]["Enums"]["license_key_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "license_keys"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_list_customers: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          is_blocked: boolean
          last_login_at: string
          order_count: number
          phone: string
          reward_points: number
          total_spent: number
          user_id: string
          wallet_balance: number
        }[]
      }
      admin_list_staff: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          custom_role_slugs: string[]
          email: string
          full_name: string
          last_sign_in_at: string
          roles: Database["public"]["Enums"]["app_role"][]
          user_id: string
        }[]
      }
      admin_log_license_resend: {
        Args: { _key_id: string; _to_email: string }
        Returns: undefined
      }
      admin_set_block_status: {
        Args: { _blocked: boolean; _reason?: string; _user_id: string }
        Returns: {
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          is_blocked: boolean
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "customer_status"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_package_reviews: {
        Args: { _package_id: string }
        Returns: {
          admin_reply: string
          comment: string
          created_at: string
          id: string
          package_id: string
          rating: number
          reviewer_avatar: string
          reviewer_name: string
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      license_pool_stats: {
        Args: { _package_id?: string }
        Returns: {
          assigned: number
          available: number
          package_id: string
          package_title: string
          revoked: number
          total: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_coupon: {
        Args: {
          _code: string
          _discount_amount: number
          _order_amount: number
          _order_id?: string
          _user_email?: string
          _user_id?: string
        }
        Returns: {
          coupon_id: string
          created_at: string
          discount_amount: number
          id: string
          order_amount: number
          order_id: string | null
          user_email: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "coupon_redemptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      resolve_delivery_days: {
        Args: { _package_id: string; _service_id: string }
        Returns: number
      }
      review_rating_summary: {
        Args: { _package_id?: string }
        Returns: {
          approved: number
          avg_rating: number
          package_id: string
          package_title: string
          pending: number
          r1: number
          r2: number
          r3: number
          r4: number
          r5: number
          spam: number
          total: number
        }[]
      }
      run_scheduled_publish: { Args: never; Returns: undefined }
      slugify: { Args: { input: string }; Returns: string }
      validate_coupon: {
        Args: {
          _code: string
          _order_amount: number
          _user_email?: string
          _user_id?: string
        }
        Returns: Json
      }
      wallet_apply_transaction: {
        Args: {
          _amount: number
          _description?: string
          _metadata?: Json
          _payment_method?: string
          _product_title?: string
          _reference_id?: string
          _reference_type?: string
          _type: string
          _user_id: string
        }
        Returns: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          direction: string
          id: string
          metadata: Json
          payment_method: string | null
          performed_by: string | null
          product_title: string | null
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        SetofOptions: {
          from: "*"
          to: "wallet_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor" | "manager" | "support"
      lead_source: "quote_form" | "contact_form" | "whatsapp" | "other"
      lead_status: "new" | "in_progress" | "contacted" | "converted" | "closed"
      license_key_status: "available" | "assigned" | "revoked"
      publish_status: "draft" | "scheduled" | "published"
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
      app_role: ["super_admin", "admin", "editor", "manager", "support"],
      lead_source: ["quote_form", "contact_form", "whatsapp", "other"],
      lead_status: ["new", "in_progress", "contacted", "converted", "closed"],
      license_key_status: ["available", "assigned", "revoked"],
      publish_status: ["draft", "scheduled", "published"],
    },
  },
} as const
