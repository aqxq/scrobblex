"use client"

import { Briefcase, Plus, Minus } from "lucide-react"
import type { Stock } from "@/app/page"

interface PortfolioTabProps {
  stockData: Stock[]
  userData: any
  onOpenStock: (symbol: string) => void
  onQuickTrade: (symbol: string, type: "buy" | "sell") => void
}

export default function PortfolioTab({ stockData, userData, onOpenStock, onQuickTrade }: PortfolioTabProps) {
  const calculatePortfolioValue = () => {
    return userData.portfolio.reduce((total: number, holding: any) => {
      const currentStock = stockData.find((s) => s.symbol === holding.symbol)
      return total + (currentStock ? holding.shares * currentStock.price : 0)
    }, 0)
  }

  const calculateTotalInvested = () => {
    return userData.portfolio.reduce((total: number, holding: any) => {
      return total + holding.shares * holding.avgPrice
    }, 0)
  }

  const portfolioValue = calculatePortfolioValue()
  const totalInvested = calculateTotalInvested()
  const totalGainLoss = portfolioValue - totalInvested
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  if (userData.portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h4 className="text-xl font-semibold mb-2">No Holdings Yet</h4>
        <p className="text-slate-400">Start trading to build your portfolio</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-lg p-5 border border-slate-600">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">${portfolioValue.toFixed(2)}</span>
          <span className={`text-lg font-medium ${totalGainLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalGainLoss >= 0 ? "+" : ""}${Math.abs(totalGainLoss).toFixed(2)} ({totalGainLoss >= 0 ? "+" : ""}
            {totalGainLossPercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="space-y-0">
        {userData.portfolio.map((holding: any) => {
          const currentStock = stockData.find((s) => s.symbol === holding.symbol)
          if (!currentStock) return null

          const currentValue = holding.shares * currentStock.price
          const investedValue = holding.shares * holding.avgPrice
          const gainLoss = currentValue - investedValue
          const gainLossPercent = (gainLoss / investedValue) * 100

          return (
            <div
              key={holding.symbol}
              onClick={() => onOpenStock(holding.symbol)}
              className="flex items-center gap-4 p-5 border-b border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <div
                className={`w-6 h-6 flex items-center justify-center ${gainLoss >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {gainLoss >= 0 ? "↗" : "↘"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-green-400 uppercase">HOLD</span>
                  <span className="font-semibold">${holding.symbol}</span>
                  <span className="text-slate-400">{currentStock.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{holding.shares} shares</span>
                  <span>@ ${holding.avgPrice.toFixed(2)}</span>
                  <span>Current: ${currentStock.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-right min-w-[120px]">
                <div className="text-lg font-semibold">${currentValue.toFixed(2)}</div>
                <div className={`text-sm font-medium ${gainLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickTrade(holding.symbol, "buy")
                  }}
                  className="p-2 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickTrade(holding.symbol, "sell")
                  }}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
