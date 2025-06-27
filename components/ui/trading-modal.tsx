"use client"

import { useState } from "react"
import { X, TrendingUp, TrendingDown, Music, Coins } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Stock, UserData } from "@/lib/types"

interface TradingModalProps {
  stock: Stock
  userData: UserData
  isOpen: boolean
  onClose: () => void
  onBuy: (shares: number) => void
  onSell: (shares: number) => void
}

export default function TradingModal({ stock, userData, isOpen, onClose, onBuy, onSell }: TradingModalProps) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [shares, setShares] = useState(1)
  const [loading, setLoading] = useState(false)

  const position = userData.portfolio.find((p) => p.symbol === stock.symbol)
  const maxSellShares = position?.shares || 0
  const total = shares * stock.price
  const canAfford = total <= userData.balance
  const canSell = shares <= maxSellShares

  const handleTrade = async () => {
    setLoading(true)
    try {
      if (tradeType === "buy") {
        onBuy(shares)
      } else {
        onSell(shares)
      }
      onClose()
    } catch (error) {
      console.error("Trade failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Trade ${stock.symbol}</h2>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center glass-card p-4">
            <div className="text-2xl font-bold text-purple-400">{formatCurrency(stock.price)}</div>
            <div className="text-sm text-muted-foreground">
              {stock.genre} • {stock.volume.toLocaleString()} streams
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTradeType("buy")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                tradeType === "buy"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Buy Shares
            </button>
            <button
              onClick={() => setTradeType("sell")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                tradeType === "sell"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Sell Shares
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Shares</label>
            <input
              type="number"
              min="1"
              max={tradeType === "sell" ? maxSellShares : undefined}
              value={shares}
              onChange={(e) => setShares(Math.max(1, Number.parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-background/50 border border-white/10 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            />
            {tradeType === "sell" && (
              <p className="text-xs text-muted-foreground mt-1">Available: {maxSellShares} shares</p>
            )}
          </div>

          <div className="bg-background/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-500" />
                ScrobbleCoins
              </span>
              <span className="font-semibold">{formatCurrency(userData.balance)}</span>
            </div>
            {tradeType === "sell" && position && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Holdings</span>
                <span className="font-semibold">{position.shares} shares</span>
              </div>
            )}
          </div>

          <button
            onClick={handleTrade}
            disabled={loading || (tradeType === "buy" && !canAfford) || (tradeType === "sell" && !canSell)}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              tradeType === "buy"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {loading
              ? "Processing..."
              : `${tradeType === "buy" ? "Buy" : "Sell"} ${shares} Share${shares !== 1 ? "s" : ""}`}
          </button>

          {tradeType === "buy" && !canAfford && (
            <p className="text-red-400 text-sm text-center">Insufficient ScrobbleCoins</p>
          )}
          {tradeType === "sell" && !canSell && <p className="text-red-400 text-sm text-center">Insufficient shares</p>}
        </div>
      </div>
    </div>
  )
}
