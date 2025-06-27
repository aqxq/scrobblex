"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown } from "lucide-react"
import type { Stock } from "@/app/page"

interface TradeModalProps {
  stock: Stock
  userData: any
  onClose: () => void
  onExecuteTrade: (type: "buy" | "sell", shares: number) => Promise<void>
  loading: boolean
}

export default function TradeModal({ stock, userData, onClose, onExecuteTrade, loading }: TradeModalProps) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [shares, setShares] = useState(1)

  const total = shares * stock.price
  const holding = userData.portfolio.find((h: any) => h.symbol === stock.symbol)
  const maxShares = holding ? holding.shares : 0

  const handleExecuteTrade = async () => {
    if (shares <= 0) return
    await onExecuteTrade(tradeType, shares)
  }

  useEffect(() => {
    const handleSetTradeType = (event: CustomEvent) => {
      setTradeType(event.detail)
    }

    window.addEventListener("setTradeType", handleSetTradeType as EventListener)
    return () => window.removeEventListener("setTradeType", handleSetTradeType as EventListener)
  }, [])

  useEffect(() => {
    if (tradeType === "sell" && shares > maxShares) {
      setShares(Math.max(1, maxShares))
    }
  }, [tradeType, maxShares])

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold">Trade {stock.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          { }
          <div className="flex gap-2">
            <button
              onClick={() => setTradeType("buy")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${tradeType === "buy" ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Buy
            </button>
            <button
              onClick={() => setTradeType("sell")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${tradeType === "sell" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
            >
              <TrendingDown className="w-4 h-4" />
              Sell
            </button>
          </div>

          { }
          <div>
            <label className="block text-sm font-medium mb-2">Number of Shares</label>
            <input
              type="number"
              min="1"
              max={tradeType === "sell" ? maxShares : undefined}
              value={shares}
              onChange={(e) => setShares(Math.max(1, Number.parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {tradeType === "sell" && <p className="text-xs text-slate-400 mt-1">Available: {maxShares} shares</p>}
          </div>

          { }
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Price</span>
              <span className="text-xl font-bold">${stock.price.toFixed(2)}</span>
            </div>
          </div>

          { }
          <div className="bg-slate-700 rounded-lg p-4 space-y-2 border border-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Total</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Available Balance</span>
              <span className="font-semibold">${userData.balance.toFixed(2)}</span>
            </div>
          </div>

          { }
          <button
            onClick={handleExecuteTrade}
            disabled={
              loading ||
              (tradeType === "buy" && total > userData.balance) ||
              (tradeType === "sell" && shares > maxShares)
            }
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${tradeType === "buy"
                ? "bg-green-600 hover:bg-green-700 disabled:bg-slate-600"
                : "bg-red-600 hover:bg-red-700 disabled:bg-slate-600"
              } disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : `${tradeType === "buy" ? "Buy" : "Sell"} Shares`}
          </button>
        </div>
      </div>
    </div>
  )
}