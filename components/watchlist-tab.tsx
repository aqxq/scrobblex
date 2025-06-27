"use client"

import type React from "react"

import { Eye, TrendingUp, X } from "lucide-react"
import type { Stock } from "@/app/page"

interface WatchlistTabProps {
  stockData: Stock[]
  userData: any
  onOpenStock: (symbol: string) => void
  onRemoveFromWatchlist: (symbol: string) => void
  showNotification: (message: string, type: string) => void
}

export default function WatchlistTab({
  stockData,
  userData,
  onOpenStock,
  onRemoveFromWatchlist,
  showNotification,
}: WatchlistTabProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const formatPercent = (value: number) => {
    return (value >= 0 ? "+" : "") + value.toFixed(1) + "%"
  }

  const handleRemoveFromWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveFromWatchlist(symbol)
    showNotification(`Removed ${symbol} from watchlist`, "info")
  }

  if (userData.watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h4 className="text-xl font-semibold mb-2">Your Watchlist is Empty</h4>
        <p className="text-slate-400">Add artists to keep track of their performance</p>
      </div>
    )
  }

  const watchlistStocks = userData.watchlist
    .map((symbol: string) => stockData.find((s) => s.symbol === symbol))
    .filter(Boolean)

  return (
    <div className="space-y-0">
      {watchlistStocks.map((stock: Stock) => (
        <div
          key={stock.symbol}
          onClick={() => onOpenStock(stock.symbol)}
          className="flex items-center gap-4 p-5 border-b border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 flex items-center justify-center text-slate-400">
            <Eye className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-semibold">${stock.symbol}</span>
              <span className="text-slate-400">{stock.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Vol: {formatNumber(stock.volume)}</span>
              <span>{stock.genre}</span>
            </div>
          </div>

          <div className="text-right min-w-[120px]">
            <div className="text-lg font-semibold">${stock.price.toFixed(2)}</div>
            <div className={`text-sm font-medium ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatPercent(stock.change)}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenStock(stock.symbol)
              }}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
            >
              <TrendingUp className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleRemoveFromWatchlist(stock.symbol, e)}
              className="p-2 bg-slate-600 hover:bg-slate-500 rounded text-xs transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
