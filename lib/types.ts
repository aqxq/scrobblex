export interface Stock {
  symbol: string
  name: string
  price: number
  current_price?: number
  change: number
  price_change_percent?: number
  changePercent: number
  volume: number
  marketCap: number
  genre: string
}

export interface User {
  id: string
  balance: number
  lastfm_username?: string
  profile_picture?: string
  scrobbles?: number
}

export interface Artist {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change: number
  price_change_percent: number
  volume: number
  market_cap: number
  genre: string
  scrobbles?: number
  image_url?: string
}

export interface Portfolio {
  id: string
  user_id: string
  artist_id: string
  shares: number
  average_price: number
  total_invested: number
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

export interface Watchlist {
  id: string
  user_id: string
  artist_id: string
  created_at: string
  artist?: Artist
}

export interface News {
  id: string
  title: string
  content: string
  image_url?: string
  created_at: string
  author?: string
}