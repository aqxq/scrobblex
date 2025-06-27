"use client"

import { TrendingUp, TrendingDown, MoreHorizontal, Music } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils"
import type { PortfolioPosition } from "@/lib/portfolio-utils"

interface PositionsTableProps {
  positions: PortfolioPosition[]
  onTradeClick: (symbol: string) => void
}

export default function PositionsTable({ positions, onTradeClick }: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <h3 className="text-lg font-semibold">No artist holdings yet</h3>
          <p>Start trading to build your music portfolio</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">Your Artist Holdings</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-4">Artist</th>
              <th className="p-4">Shares</th>
              <th className="p-4">Avg Cost</th>
              <th className="p-4">Current Price</th>
              <th className="p-4">Market Value</th>
              <th className="p-4">Day P&L</th>
              <th className="p-4">Total P&L</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const isDayPositive = position.dayGainLoss >= 0
              const isTotalPositive = position.gainLoss >= 0

              return (
                <tr key={position.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">${position.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(position.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{position.shares}</td>
                  <td className="p-4">{formatCurrency(position.avgPrice)}</td>
                  <td className="p-4">{formatCurrency(position.currentPrice)}</td>
                  <td className="p-4 font-semibold">{formatCurrency(position.currentValue)}</td>
                  <td className={`p-4 ${isDayPositive ? "text-green-400" : "text-red-400"}`}>
                    <div className="flex items-center gap-1">
                      {isDayPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{formatCurrency(Math.abs(position.dayGainLoss))}</span>
                    </div>
                    <div className="text-xs">{formatPercent(position.dayGainLossPercent)}</div>
                  </td>
                  <td className={`p-4 ${isTotalPositive ? "text-green-400" : "text-red-400"}`}>
                    <div className="flex items-center gap-1">
                      {isTotalPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{formatCurrency(Math.abs(position.gainLoss))}</span>
                    </div>
                    <div className="text-xs">{formatPercent(position.gainLossPercent)}</div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onTradeClick(position.symbol)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
