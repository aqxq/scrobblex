import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          lastfm_username: string | null
          lastfm_verified: boolean
          balance: number
          is_admin: boolean
          profile_image_url: string | null
          total_scrobbles: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          lastfm_username?: string | null
          lastfm_verified?: boolean
          balance?: number
          is_admin?: boolean
          profile_image_url?: string | null
          total_scrobbles?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          lastfm_username?: string | null
          lastfm_verified?: boolean
          balance?: number
          is_admin?: boolean
          profile_image_url?: string | null
          total_scrobbles?: number
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          symbol: string
          name: string
          genre: string | null
          current_price: number
          price_change: number
          price_change_percent: number
          volume: number
          market_cap: number
          total_scrobbles: number
          weekly_scrobbles: number
          image_url: string | null
          lastfm_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          symbol: string
          name: string
          genre?: string | null
          current_price?: number
          price_change?: number
          price_change_percent?: number
          volume?: number
          market_cap?: number
          total_scrobbles?: number
          weekly_scrobbles?: number
          image_url?: string | null
          lastfm_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          genre?: string | null
          current_price?: number
          price_change?: number
          price_change_percent?: number
          volume?: number
          market_cap?: number
          total_scrobbles?: number
          weekly_scrobbles?: number
          image_url?: string | null
          lastfm_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          user_id: string
          artist_id: string
          shares: number
          average_price: number
          total_invested: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          artist_id: string
          shares: number
          average_price: number
          total_invested: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          artist_id?: string
          shares?: number
          average_price?: number
          total_invested?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          artist_id: string
          type: "buy" | "sell"
          shares: number
          price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          artist_id: string
          type: "buy" | "sell"
          shares: number
          price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          artist_id?: string
          type?: "buy" | "sell"
          shares?: number
          price?: number
          total?: number
          created_at?: string
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          artist_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          artist_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          artist_id?: string
          created_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string | null
          artist_id: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id?: string | null
          artist_id?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string | null
          artist_id?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lastfm_profiles: {
        Row: {
          id: string
          user_id: string
          lastfm_username: string
          access_token: string | null
          profile_data: any
          last_sync: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lastfm_username: string
          access_token?: string | null
          profile_data?: any
          last_sync?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lastfm_username?: string
          access_token?: string | null
          profile_data?: any
          last_sync?: string
          created_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          artist_id: string
          price: number
          volume: number
          recorded_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          price: number
          volume?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          price?: number
          volume?: number
          recorded_at?: string
        }
      }
    }
  }
}