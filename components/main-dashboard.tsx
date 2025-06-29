"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import Dashboard from "@/components/dashboard"
import Market from "@/components/market"
import Portfolio from "@/components/portfolio"
import Leaderboard from "@/components/leaderboard"
import TradeModal from "@/components/trade-modal"
import { Notification } from "@/components/notification"

export type Page = "dashboard" | "market" | "portfolio" | "leaderboard"

export interface Stock {
  symbol: string
  name: string
  genre: string
  price: number
  change: number
  volume: number
  marketCap: number
}

export interface NotificationItem {
  id: number
  message: string
  type: string
}

export function MainDashboard() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [currentTradeStock, setCurrentTradeStock] = useState<Stock | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [stockData, setStockData] = useState<Stock[]>([])

  const showNotification = (message: string, type = "info") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  const fetchArtists = async () => {
    try {
      const response = await fetch("/api/artists")
      if (response.ok) {
        const data = await response.json()
        const formattedStocks = data.artists.map((artist: any) => ({
          symbol: artist.name.toUpperCase().replace(/\s+/g, ""),
          name: artist.name,
          genre: artist.genre || "Unknown",
          price: artist.current_price,
          change: artist.price_change,
          volume: artist.volume,
          marketCap: artist.market_cap,
        }))
        setStockData(formattedStocks)
      }
    } catch (error) {
      console.error("Error fetching artists:", error)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [])

  const openStockDetails = (symbol: string) => {
    const stock = stockData.find((s) => s.symbol === symbol)
    if (stock) {
      setCurrentTradeStock(stock)
      setTradeModalOpen(true)
    }
  }

  const executeTrade = async (type: "buy" | "sell", shares: number) => {
    if (!currentTradeStock || !user) return

    const total = shares * currentTradeStock.price

    if (type === "buy" && total > user.balance) {
      showNotification("Insufficient funds", "error")
      return
    }

    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setLoading(false)
      setTradeModalOpen(false)

      showNotification(
        `Successfully ${type === "buy" ? "bought" : "sold"} ${shares} shares of ${currentTradeStock.symbol}`,
        "success",
      )
    } catch (error) {
      setLoading(false)
      showNotification("Trade failed. Please try again.", "error")
    }
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            stockData={stockData}
            userData={user}
            onOpenStock={openStockDetails}
            onAddToWatchlist={() => { }}
            onRemoveFromWatchlist={() => { }}
            onQuickTrade={() => { }}
            showNotification={showNotification}
          />
        )
      case "market":
        return (
          <Market
            stockData={stockData}
            onOpenStock={openStockDetails}
            onAddToWatchlist={() => { }}
            showNotification={showNotification}
          />
        )
      case "portfolio":
        return <Portfolio stockData={stockData} userData={user} onOpenStock={openStockDetails} />
      case "leaderboard":
        return <Leaderboard />
      default:
        return null
    }
  }

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        showNotification(`Welcome back, ${user.displayName}!`, "success")
      }, 1000)
    }
  }, [user])

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <main className="flex-1 flex flex-col lg:ml-72">
        <Header
          stockData={stockData}
          onOpenStock={openStockDetails}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        <div className="flex-1 p-6">{renderCurrentPage()}</div>
      </main>

      {tradeModalOpen && currentTradeStock && (
        <TradeModal
          stock={currentTradeStock}
          userData={user}
          onClose={() => setTradeModalOpen(false)}
          onExecuteTrade={executeTrade}
          loading={loading}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Processing trade...</p>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
          />
        ))}
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}