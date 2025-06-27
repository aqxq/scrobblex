export interface Stock {
  symbol: string
  name: string
  genre: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

export interface UserData {
  balance: number
  portfolio: PortfolioItem[]
  watchlist: string[]
  transactions: Transaction[]
}

export interface PortfolioItem {
  symbol: string
  shares: number
  avgPrice: number
  purchaseDate: string
}

export interface Transaction {
  id: string
  type: "buy" | "sell"
  symbol: string
  shares: number
  price: number
  total: number
  timestamp: string
}

export type Page = "dashboard" | "market" | "portfolio"
