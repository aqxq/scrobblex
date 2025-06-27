"use client"

import { useState } from "react"
import {
  TrendingUp,
  Volume2,
  Flame,
  TrendingDown,
  FlameIcon as Fire,
  Briefcase,
  Eye,
  History,
  Newspaper,
} from "lucide-react"
import StockChart from "./stock-chart"
import StockCard from "./stock-card"
import PortfolioTab from "./portfolio-tab"
import WatchlistTab from "./watchlist-tab"
import TransactionHistoryTab from "./transaction-history-tab"
import NewsTab from "./news-tab"
import type { Stock } from "@/app/page"

interface DashboardProps {
  stockData: Stock[]
  userData: any
  onOpenStock: (symbol: string) => void
  onAddToWatchlist: (symbol: string) => void
  onRemoveFromWatchlist: (symbol: string) => void
  onQuickTrade: (symbol: string, type: "buy" | "sell") => void
  showNotification: (message: string, type: string) => void
}

const tabs = [
  { id: "trending", name: "Trending", icon: Fire },
  { id: "portfolio", name: "My Portfolio", icon: Briefcase },
  { id: "watchlist", name: "Watchlist", icon: Eye },
  { id: "history", name: "History", icon: History },
  { id: "news", name: "News", icon: Newspaper },
]

export default function Dashboard({
  stockData,
  userData,
  onOpenStock,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onQuickTrade,
  showNotification,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState("trending")

  const totalMarketCap = stockData.reduce((sum, stock) => sum + stock.price * 1000000, 0)
  const totalVolume = stockData.reduce((sum, stock) => sum + stock.volume, 0)
  const sortedByChange = [...stockData].sort((a, b) => b.change - a.change)
  const topGainer = sortedByChange[0]
  const topLoser = sortedByChange[sortedByChange.length - 1]

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return "$" + (amount / 1000000000).toFixed(1) + "B"
    } else if (amount >= 1000000) {
      return "$" + (amount / 1000000).toFixed(0) + "M"
    } else {
      return "$" + amount.toLocaleString()
    }
  }

  const formatPercent = (value: number) => {
    return (value >= 0 ? "+" : "") + value.toFixed(1) + "%"
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "trending":
        const trendingStocks = stockData.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 6)
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onOpenStock={onOpenStock}
                onAddToWatchlist={onAddToWatchlist}
                showNotification={showNotification}
                isInWatchlist={userData.watchlist.includes(stock.symbol)}
              />
            ))}
          </div>
        )
      case "portfolio":
        return (
          <PortfolioTab
            stockData={stockData}
            userData={userData}
            onOpenStock={onOpenStock}
            onQuickTrade={onQuickTrade}
          />
        )
      case "watchlist":
        return (
          <WatchlistTab
            stockData={stockData}
            userData={userData}
            onOpenStock={onOpenStock}
            onRemoveFromWatchlist={onRemoveFromWatchlist}
            showNotification={showNotification}
          />
        )
      case "history":
        return <TransactionHistoryTab userData={userData} />
      case "news":
        return <NewsTab />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockData.slice(0, 6).map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onOpenStock={onOpenStock}
                onAddToWatchlist={onAddToWatchlist}
                showNotification={showNotification}
                isInWatchlist={userData.watchlist.includes(stock.symbol)}
              />
            ))}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Market Dashboard</h1>
        <p className="text-slate-400">Track your favorite stocks and market trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-all duration-200 hover:scale-105 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-slate-400 mb-1">Market Cap</h3>
              <div className="text-2xl font-bold">{formatCurrency(totalMarketCap)}</div>
              <div className="text-sm text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+3.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-all duration-200 hover:scale-105 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-slate-400 mb-1">24h Volume</h3>
              <div className="text-2xl font-bold">{formatCurrency(totalVolume)}</div>
              <div className="text-sm text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+8.7%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-all duration-200 hover:scale-105 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-slate-400 mb-1">Top Gainer</h3>
              <div className="text-2xl font-bold">${topGainer.symbol}</div>
              <div className="text-sm text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{formatPercent(topGainer.change)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-all duration-200 hover:scale-105 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm text-slate-400 mb-1">Top Loser</h3>
              <div className="text-2xl font-bold">${topLoser.symbol}</div>
              <div className="text-sm text-red-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                <span>{formatPercent(topLoser.change)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">$KLAMAR</h3>
              <p className="text-slate-400 mb-3">Kendrick Lamar</p>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">$24.35</span>
                <span className="text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +5.3% (+$1.23)
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <StockChart />
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <div className="flex border-b border-slate-700 bg-slate-900">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-purple-400 border-purple-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800 border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            )
          })}
        </div>
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  )
}
