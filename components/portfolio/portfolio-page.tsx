"use client"

import { useState } from "react"
import PortfolioOverview from "./portfolio-overview"
import PositionsTable from "./positions-table"
import TransactionHistory from "./transaction-history"
import { calculatePortfolioAnalytics } from "@/lib/portfolio-utils"
import type { UserData, Stock } from "@/lib/types"

interface PortfolioPageProps {
  userData: UserData
  stocks: Stock[]
  onTradeClick: (symbol: string) => void
}

export default function PortfolioPage({ userData, stocks, onTradeClick }: PortfolioPageProps) {
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions")

  const analytics = calculatePortfolioAnalytics(userData.portfolio, stocks)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Artist Portfolio</h2>
        <p className="text-muted-foreground">Track your music artist investments and performance</p>
      </div>

      <PortfolioOverview analytics={analytics} cashBalance={userData.balance} />

      <div className="glass-card">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("positions")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "positions"
                ? "text-purple-400 border-purple-400"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            Artist Holdings ({analytics.positions.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "history"
                ? "text-purple-400 border-purple-400"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            Trading History ({userData.transactions.length})
          </button>
        </div>

        <div className="p-0">
          {activeTab === "positions" ? (
            <PositionsTable positions={analytics.positions} onTradeClick={onTradeClick} />
          ) : (
            <TransactionHistory transactions={userData.transactions} />
          )}
        </div>
      </div>
    </div>
  )
}
