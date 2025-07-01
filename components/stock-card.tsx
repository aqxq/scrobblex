"use client"

import type React from "react"

import { Eye, TrendingUp, TrendingDown, EyeOff } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price?: number
  current_price?: number
  change?: number
  price_change_percent?: number
  volume?: number
  genre?: string
}

interface StockCardProps {
  stock: Stock
  onOpenStock: (symbol: string) => void
  onAddToWatchlist?: (symbol: string) => void
  showNotification?: (message: string, type: string) => void
  isInWatchlist?: boolean
}

export default function StockCard({
  stock,
  onOpenStock,
  onAddToWatchlist,
  showNotification,
  isInWatchlist = false,
}: StockCardProps) {
  if (!stock) return null

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || !Number.isFinite(num)) return "0"

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null || !Number.isFinite(value)) return "+0.0%"
    return (value >= 0 ? "+" : "") + value.toFixed(1) + "%"
  }

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isInWatchlist && onAddToWatchlist) {
      onAddToWatchlist(stock.symbol)
      if (showNotification) {
        showNotification(`Added ${stock.symbol} to watchlist`, "success")
      }
    }
  }

  const price = stock.price ?? stock.current_price ?? 0
  const change = stock.change ?? stock.price_change_percent ?? 0
  const volume = stock.volume ?? 0
  const symbol = stock.symbol ?? "UNKNOWN"
  const name = stock.name ?? "Unknown Artist"
  const genre = stock.genre ?? "Music"

  return (
    <div
      onClick={() => onOpenStock(symbol)}
      className="bg-slate-800 rounded-lg p-5 hover:bg-slate-700 transition-all duration-200 cursor-pointer hover:scale-105 relative group border border-slate-700"
    >
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
          {symbol.substring(0, 2)}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">{name}</h4>
          <div className="text-sm text-slate-400">${symbol}</div>
        </div>
        {!isInWatchlist && onAddToWatchlist && (
          <button
            onClick={handleAddToWatchlist}
            className="absolute top-0 right-0 w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Add to watchlist"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {isInWatchlist && (
          <div className="absolute top-0 right-0 w-8 h-8 bg-purple-600 border border-purple-600 rounded-full flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">${price.toFixed(2)}</div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {formatPercent(change)}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700 text-center">
        <div className="text-xs text-slate-400">Volume: {formatNumber(volume)}</div>
      </div>
    </div>
  )
}