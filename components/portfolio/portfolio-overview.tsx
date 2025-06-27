"use client"

import { TrendingUp, TrendingDown, Coins, Activity, Music } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils"
import type { PortfolioAnalytics } from "@/lib/portfolio-utils"

interface PortfolioOverviewProps {
  analytics: PortfolioAnalytics
  cashBalance: number
}

export default function PortfolioOverview({ analytics, cashBalance }: PortfolioOverviewProps) {
  const totalAccountValue = analytics.totalValue + cashBalance
  const isDayPositive = analytics.dayGainLoss >= 0
  const isTotalPositive = analytics.totalGainLoss >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Coins className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-sm text-muted-foreground">Total Portfolio</h3>
        </div>
        <div className="text-2xl font-bold">{formatCurrency(totalAccountValue)}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Cash: {formatCurrency(cashBalance)} • Artists: {formatCurrency(analytics.totalValue)}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isDayPositive ? "bg-green-500/20" : "bg-red-500/20"}`}>
            <Activity className={`w-5 h-5 ${isDayPositive ? "text-green-400" : "text-red-400"}`} />
          </div>
          <h3 className="text-sm text-muted-foreground">Today's Performance</h3>
        </div>
        <div className={`text-2xl font-bold ${isDayPositive ? "text-green-400" : "text-red-400"}`}>
          {isDayPositive ? "+" : ""}
          {formatCurrency(analytics.dayGainLoss)}
        </div>
        <div className={`text-xs ${isDayPositive ? "text-green-400" : "text-red-400"}`}>
          {formatPercent(analytics.dayGainLossPercent)}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isTotalPositive ? "bg-green-500/20" : "bg-red-500/20"}`}>
            {isTotalPositive ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <h3 className="text-sm text-muted-foreground">All-Time P&L</h3>
        </div>
        <div className={`text-2xl font-bold ${isTotalPositive ? "text-green-400" : "text-red-400"}`}>
          {isTotalPositive ? "+" : ""}
          {formatCurrency(analytics.totalGainLoss)}
        </div>
        <div className={`text-xs ${isTotalPositive ? "text-green-400" : "text-red-400"}`}>
          {formatPercent(analytics.totalGainLossPercent)}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Music className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-sm text-muted-foreground">Artists Owned</h3>
        </div>
        <div className="text-2xl font-bold">{analytics.positions.length}</div>
        <div className="text-xs text-muted-foreground">Active holdings</div>
      </div>
    </div>
  )
}
