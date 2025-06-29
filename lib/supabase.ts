import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface User {
  id: string
  email?: string
  display_name: string
  lastfm_username?: string
  lastfm_verified: boolean
  balance: number
  scrobble_coins: number
  total_scrobbles: number
  profile_image_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Artist {
  id: string
  name: string
  image_url?: string
  genre?: string
  current_price: number
  price_change: number
  price_change_percent: number
  market_cap: number
  volume: number
  total_listeners: number
  total_scrobbles: number
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  user_id: string
  artist_id: string
  shares: number
  average_price: number
  total_invested: number
  created_at: string
  updated_at: string
  artist?: Artist
}

export interface Transaction {
  id: string
  user_id: string
  artist_id: string
  type: "buy" | "sell"
  shares: number
  price: number
  total: number
  created_at: string
  artist?: Artist
}

export interface LastFmProfile {
  id: string
  user_id: string
  lastfm_username: string
  session_key: string
  profile_data: any
  created_at: string
  updated_at: string
}