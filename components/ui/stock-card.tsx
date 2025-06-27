"use client"

import { TrendingUp, TrendingDown, Music } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils"
import type { Stock } from "@/lib/types"

interface StockCardProps {
  stock: Stock
  onClick: () => void
}

export default function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0

  return (
    <div
      onClick={onClick}
      className="glass-card p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">${stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
            <p className="text-xs text-purple-400">{stock.genre}</p>
          </div>
        </div>
        <div className={`p-2 rounded-lg ${isPositive ? "bg-green-500/20" : "bg-red-500/20"}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold">{formatCurrency(stock.price)}</div>
        <div className={`text-sm flex items-center gap-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
          <span>{formatCurrency(Math.abs(stock.change))}</span>
          <span>({formatPercent(stock.changePercent)})</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">Streams: {stock.volume.toLocaleString()}</div>

      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-xs text-purple-400">Click to trade →</div>
      </div>
    </div>
  )
}
